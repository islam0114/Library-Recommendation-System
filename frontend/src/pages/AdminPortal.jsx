/**
 * Page: AdminPortal
 * Purpose: The main dashboard and management interface for administrators.
 * Features: Book management, user management, borrow requests, announcements, and statistics charts.
 */

import React, { useState, useEffect, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Ic, P } from "../components/Icons";
import { Cover } from "../components/BookCard";
import AdminProfilePage from "./AdminProfilePage";
import { useBooks, daysLeft, daysColor } from "../utils/helpers";

export default function AdminPortal({ th, t, isAr, controls, tn, setTn, lang, setLang }) {
  const AI_API_URL="http://localhost:8000";
  // ── LIVE SYNC: Extract fetchBooks to manually update books after actions ──
  const { books: BOOKS, booksLoading, fetchBooks } = useBooks(AI_API_URL);
  
  const [loggedIn, setLoggedIn] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [adminProfile, setAdminProfile] = useState(null);
  const [u, setU] = useState(""); 
  const [pw, setPw] = useState(""); 
  const [err, setErr] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState("dashboard");
  const [anns, setAnns] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteUser, setDeleteUser] = useState(null);
  const [adminsList, setAdminsList] = useState([]);
  const [studentsTab, setStudentsTab] = useState("students");
  const [composing, setComposing] = useState(false); 
  const [aTitle, setATitle] = useState(""); 
  const [aBody, setABody] = useState(""); 
  const [aPrio, setAPrio] = useState("normal");
  const [allReqs, setAllReqs] = useState([]);
  const [reqFilter, setReqFilter] = useState("pending");
  const [selStudent, setSelStudent] = useState(null);
  const [adminStudents, setAdminStudents] = useState([]);
  const [adminStats, setAdminStats] = useState(null);

  const GENRES_LIST=["Reference","Computers","Business","History","Social Science","Science","Medical","Philosophy","Psychology","Education","Political Science","Technology","Literary Criticism","Language Arts","Architecture","Law","Fiction","Other"];
  const [bkList, setBkList] = useState([]);
  const [bkTotal, setBkTotal] = useState(0);
  const [bkLoading, setBkLoading] = useState(false);
  const [bkQ, setBkQ] = useState("");
  const [bkGenre, setBkGenre] = useState("All");
  const [bkPage, setBkPage] = useState(0);
  const BK_PAGE_SIZE = 30;
  const [bkShowForm, setBkShowForm] = useState(false);
  const [bkEditBook, setBkEditBook] = useState(null);
  const [bkDeleteBook, setBkDeleteBook] = useState(null);
  const [bkDelLoading, setBkDelLoading] = useState(false);
  const [bkToast, setBkToast] = useState(null);
  const bkFileRef = useRef(null);
  
  const [bkForm, setBkForm] = useState({title:"",author:"",description:"",genre:"Reference",image_url:"",copies_total:1});
  const [bkImageFile, setBkImageFile] = useState(null);
  const [bkImagePreview, setBkImagePreview] = useState("");
  const [bkImageMode, setBkImageMode] = useState("url");
  const [bkFormLoading, setBkFormLoading] = useState(false);
  const [bkFormErr, setBkFormErr] = useState("");

  const adminFetch=(url,opts={})=>{
    const token=localStorage.getItem("bt_admin_token");
    const isForm=opts.body instanceof FormData;
    const headers={...(isForm?{}:{"Content-Type":"application/json"}),...(token?{Authorization:`Bearer ${token}`}:{}),...(opts.headers||{})};
    return fetch(`${AI_API_URL}${url}`,{...opts,headers});
  };

  const bkLoad=async(q=bkQ,genre=bkGenre,page=bkPage)=>{
    setBkLoading(true);
    try{
      const p=new URLSearchParams({page,size:BK_PAGE_SIZE});
      if(q.trim())p.set("q",q.trim());
      if(genre&&genre!=="All")p.set("dept",genre);
      const res=await fetch(`${AI_API_URL}/api/books?${p}`);
      const data=await res.json();
      setBkList(data.books||[]);
      setBkTotal(data.total||0);
    }catch{setBkToast({msg:"Failed to load books",type:"error"});}
    setBkLoading(false);
  };

  const bkOpenAdd=()=>{
    setBkEditBook(null);
    setBkForm({title:"",author:"",description:"",genre:"Reference",image_url:"",copies_total:1});
    setBkImageFile(null);setBkImagePreview("");setBkImageMode("url");setBkFormErr("");
    setBkShowForm(true);
  };

  const bkOpenEdit=(book)=>{
    setBkEditBook(book);
    setBkForm({title:book.title||"",author:book.author||"",description:book.description||"",genre:book.genre||book.dept||"Reference",image_url:book.image_url||"",copies_total:book.copies_total||1});
    setBkImageFile(null);setBkImagePreview(book.image_url||"");setBkImageMode("url");setBkFormErr("");
    setBkShowForm(true);
  };

  const bkHandleFile=e=>{
    const f=e.target.files[0];if(!f)return;
    if(f.size>5*1024*1024){setBkFormErr("Image must be less than 5MB");return;}
    setBkImageFile(f);setBkImagePreview(URL.createObjectURL(f));setBkFormErr("");
  };

  const bkSubmit=async()=>{
    if(!bkForm.title.trim()){setBkFormErr("Title is required");return;}
    if(!bkForm.author.trim()){setBkFormErr("Author is required");return;}
    setBkFormLoading(true);setBkFormErr("");
    try{
      let bookId=bkEditBook?.book_id||bkEditBook?.id;
      if(bkEditBook){
        const body={title:bkForm.title.trim(),author:bkForm.author.trim(),description:bkForm.description.trim()||null,genre:bkForm.genre,copies_total:Number(bkForm.copies_total)};
        if(bkImageMode==="url"&&bkForm.image_url.trim())body.image_url=bkForm.image_url.trim();
        const res=await adminFetch(`/api/admin/books/${bookId}`,{method:"PUT",body:JSON.stringify(body)});
        const data=await res.json();
        if(!res.ok){setBkFormErr(data.detail||"Update failed");setBkFormLoading(false);return;}
        bookId=data.book?.id||bookId;
      }else{
        const body={title:bkForm.title.trim(),author:bkForm.author.trim(),description:bkForm.description.trim()||null,genre:bkForm.genre,copies_total:Number(bkForm.copies_total),image_url:bkImageMode==="url"&&bkForm.image_url.trim()?bkForm.image_url.trim():null};
        const res=await adminFetch("/api/admin/books",{method:"POST",body:JSON.stringify(body)});
        const data=await res.json();
        if(!res.ok){setBkFormErr(data.detail||"Add failed");setBkFormLoading(false);return;}
        bookId=data.book?.id;
      }
      if(bkImageMode==="file"&&bkImageFile&&bookId){
        const fd=new FormData();fd.append("file",bkImageFile);
        await adminFetch(`/api/admin/books/${bookId}/cover`,{method:"POST",body:fd});
      }
      setBkShowForm(false);setBkEditBook(null);
      setBkToast({msg:bkEditBook?"Book updated!":"Book added successfully!",type:"success"});
      bkLoad();
      fetchBooks(); // تحديث قائمة الكتب العامة
    }catch{setBkFormErr("Cannot connect to server.");}
    setBkFormLoading(false);
  };

  const bkConfirmDelete=async()=>{
    if(!bkDeleteBook)return;
    setBkDelLoading(true);
    try{
      const res=await adminFetch(`/api/admin/books/${bkDeleteBook.book_id||bkDeleteBook.id}`,{method:"DELETE"});
      if(!res.ok){const d=await res.json();setBkToast({msg:d.detail||"Delete failed",type:"error"});}
      else{setBkToast({msg:`"${bkDeleteBook.title}" deleted`,type:"success"});bkLoad();fetchBooks();}
    }catch{setBkToast({msg:"Cannot connect to server.",type:"error"});}
    setBkDelLoading(false);setBkDeleteBook(null);
  };

  // ── LIVE SYNC: Poll admin data every 10s ───────────────────────────
  const pollRef = useRef(null);

  const refreshAll=async()=>{
    const[rRes,aRes,sRes,stRes,admRes]=await Promise.allSettled([
      adminFetch("/api/requests?status_filter=all").then(r=>r.ok?r.json():{requests:[]}),
      adminFetch("/api/announcements").then(r=>r.ok?r.json():{announcements:[]}),
      adminFetch("/api/students").then(r=>r.ok?r.json():{students:[]}),
      adminFetch("/api/stats").then(r=>r.ok?r.json():null),
      adminFetch("/api/admin/admins").then(r=>r.ok?r.json():{admins:[]}),
    ]);
    if(rRes.status==="fulfilled")setAllReqs(rRes.value.requests||[]);
    if(aRes.status==="fulfilled")setAnns(aRes.value.announcements||[]);
    if(sRes.status==="fulfilled")setAdminStudents(sRes.value.students||[]);
    if(stRes.status==="fulfilled"&&stRes.value)setAdminStats(stRes.value);
    if(admRes.status==="fulfilled")setAdminsList(admRes.value.admins||[]);
  };

  useEffect(() => {
    if (loggedIn) {
        refreshAll();
        pollRef.current = setInterval(() => {
            refreshAll();
            // تحديث صامت للكتب لضمان مزامنة عدد النسخ
            fetchBooks();
        }, 10000);
    }
    return () => clearInterval(pollRef.current);
  }, [loggedIn, fetchBooks]);

  const refreshReqs=async()=>{
    const r=await adminFetch("/api/requests?status_filter=all").then(r=>r.ok?r.json():{requests:[]}).catch(()=>({requests:[]}));
    setAllReqs(r.requests||[]);
  };

  const login=async()=>{
    if(!u||!pw){setErr("Fill all fields.");return;}
    setLoading(true);setErr("");
    try{
      const res=await fetch("http://localhost:8000/api/auth/admin",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:u,password:pw})});
      const data=await res.json();
      if(!res.ok){setErr(data.detail||"Wrong credentials.");setLoading(false);return;}
      localStorage.setItem("bt_admin_token",data.token);
      setIsSuperAdmin(data.admin?.is_super===true);
      setAdminEmail(data.admin?.email||"");
      setAdminProfile(data.admin||null);
      setLoggedIn(true);
    }catch(e){setErr(t.cannotConnect);}
    setLoading(false);
  };

  const postAnn=async()=>{
    if(!aTitle||!aBody)return;
    await adminFetch("/api/announcements",{method:"POST",body:JSON.stringify({title:aTitle,body:aBody,priority:aPrio})});
    setATitle("");setABody("");setAPrio("normal");setComposing(false);
    refreshAll();
  };
  const delAnn=async id=>{
    await adminFetch(`/api/announcements/${id}`,{method:"DELETE"});
    setAnns(prev=>prev.filter(x=>x.id!==id));
  };

  // ── ACTION REFRESHERS (Live updates on DB change) ──
  const approveReq=async rid=>{
    await adminFetch(`/api/requests/${rid}/approve`,{method:"PATCH"});
    await refreshReqs();
    fetchBooks(); // Re-fetch books to update copies immediately
  };
  const rejectReq=async rid=>{
    await adminFetch(`/api/requests/${rid}/reject`,{method:"PATCH"});
    await refreshReqs();
    fetchBooks(); 
  };
  const returnBook=async rid=>{
    await adminFetch(`/api/requests/${rid}/return`,{method:"PATCH"});
    await refreshReqs();
    fetchBooks(); 
  };

  const enrichWithCover=reqs=>reqs.map(r=>{
    if(r.bCover)return r;
    const bk=BOOKS.find(b=>b.id===r.bid);
    return{...r,bCover:bk?bk.cover:["#1a1a2e","#16213e"]};
  });
  const filteredReqs=enrichWithCover(reqFilter==="all"?allReqs:allReqs.filter(r=>r.status===reqFilter));
  const pendingCount=allReqs.filter(r=>r.status==="pending").length;
  const activeCount=allReqs.filter(r=>r.status==="approved"&&!r.returnDate).length;
  const pc=pr=>pr==="urgent"?th.red:pr==="important"?th.amber:th.prime;

  if(!loggedIn)return(
    <div style={{minHeight:"100vh",background:th.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",direction:"ltr",transition:"background 0.4s"}}>
      <div style={{position:"absolute",top:"-15%",right:"-10%",width:440,height:440,borderRadius:"50%",background:`${th.prime}0d`,filter:"blur(120px)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:400,padding:"0 20px",animation:"fadeUp 0.6s ease",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:34}}>
          <div style={{width:54,height:54,borderRadius:16,margin:"0 auto 14px",background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 10px 28px ${th.primeG}`,animation:"glow 3s ease infinite",color:"#fff"}}><Ic p={P.shield} s={24}/></div>
          <h1 style={{fontSize:25,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.03em",color:th.text,marginBottom:5}}>{isAr?"لوحة الأدمن":"Admin Panel"}</h1>
          <p style={{fontSize:12,color:th.sub}}>{isAr?"للموظفين المعتمدين فقط":"Authorized staff only"}</p>
        </div>
        <div style={{background:th.surface,border:`1px solid ${th.prime}22`,borderRadius:20,padding:"26px 26px 22px",boxShadow:"0 24px 64px rgba(0,0,0,0.4)"}}>
          {[[t.email,P.email,"","email",u,setU],[t.password,P.lock,"","password",pw,setPw]].map(([label,icon,ph,type,val,setVal])=>(
            <div key={label} style={{marginBottom:13}}>
              <label style={{fontSize:10,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>{label}</label>
              <div style={{position:"relative"}}><div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:th.muted}}><Ic p={icon} s={14}/></div><input type={type} value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder={ph} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:11,padding:"12px 12px 12px 38px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/></div>
            </div>
          ))}
          {err&&<div style={{background:th.red+"14",border:`1px solid ${th.red}30`,borderRadius:9,padding:"8px 12px",marginBottom:11}}><p style={{fontSize:12,color:th.red}}>{err}</p></div>}
          <button onClick={login} className="btn" disabled={loading} style={{width:"100%",background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:11,padding:"13px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",boxShadow:`0 6px 20px ${th.primeG}`,opacity:loading?0.75:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            {loading?<><span style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>{isAr?"جاري...":"Signing in..."}</>:<><Ic p={P.shield} s={15}/>{t.signin}</>}
          </button>
        </div>
        <div style={{marginTop:12,display:"flex",justifyContent:"center"}}>{controls}</div>
      </div>
    </div>
  );

  const NAVS=[[t.dashboard,"dashboard",P.dash,null],[t.books,"books",P.book,null],[t.requests,"requests",P.alert,pendingCount>0?pendingCount:null],[t.students,"students",P.student,null],["Announcements","announce",P.megaphone,null],["My Profile","profile",P.user,null]];

  return(<div style={{display:"flex",minHeight:"100vh",background:th.bg,color:th.text,direction:"ltr",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"background 0.4s,color 0.4s"}}>
    <aside style={{width:212,flexShrink:0,background:th.surface,borderRight:isAr?"none":`1px solid ${th.border}`,borderLeft:isAr?`1px solid ${th.border}`:"none",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"17px 15px 13px",borderBottom:`1px solid ${th.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9,flexDirection:"row"}}>
          <div style={{width:31,height:31,borderRadius:9,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Ic p={P.bookOpen} s={15}/></div>
          <div><p style={{fontSize:14,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:th.text}}>Biblio<span style={{color:th.prime}}>Tech</span></p><p style={{fontSize:10,color:th.muted}}>{isAr?"الأدمن":"Admin"}</p></div>
        </div>
      </div>
      <nav style={{flex:1,padding:"10px 8px"}}>
        {NAVS.map(([label,id,icon,badge])=>{const isA=active===id;return(
          <button key={id} onClick={()=>{setActive(id);if(id==="books")bkLoad();}} className="btn" style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 11px",borderRadius:10,marginBottom:2,background:isA?th.prime+"20":"transparent",border:`1px solid ${isA?th.prime+"44":"transparent"}`,color:isA?th.prime:th.sub,fontSize:12,fontWeight:isA?600:400,flexDirection:"row",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:9,flexDirection:"row"}}><Ic p={icon} s={14}/>{label}</div>
            {badge&&<span style={{fontSize:9,fontWeight:700,background:th.red,color:"#fff",borderRadius:20,padding:"1px 6px",minWidth:18,textAlign:"center"}}>{badge}</span>}
          </button>);})}
      </nav>
      <div style={{padding:"12px 10px",borderTop:`1px solid ${th.border}`}}>
        <div onClick={()=>setActive("profile")} className="btn" style={{cursor:"pointer",display:"flex",alignItems:"center",gap:8,padding:"8px 9px",borderRadius:10,background:active==="profile"?th.prime+"18":"transparent",border:`1px solid ${active==="profile"?th.prime+"44":th.border}`,marginBottom:6,flexDirection:"row",transition:"all 0.18s"}}>
          <div style={{width:28,height:28,borderRadius:8,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",fontFamily:"'Space Grotesk',sans-serif",flexShrink:0}}>{(adminProfile?.name||"A")[0].toUpperCase()}</div>
          <div style={{flex:1,overflow:"hidden",textAlign:isAr?"right":"left"}}><p style={{fontSize:11,fontWeight:700,color:active==="profile"?th.prime:th.text,fontFamily:"'Space Grotesk',sans-serif",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{adminProfile?.name||"Admin"}</p><p style={{fontSize:9,color:th.muted}}>{isSuperAdmin?"⭐ Super Admin":"🛡️ Admin"}</p></div>
          <Ic p={P.settings} s={11} color={active==="profile"?th.prime:th.muted}/>
        </div>
        <button onClick={()=>setLoggedIn(false)} className="btn" style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"8px 11px",borderRadius:9,color:th.muted,fontSize:11,border:`1px solid ${th.border}`,flexDirection:"row"}}><Ic p={P.logout} s={13}/>{t.signout}</button>
      </div>
    </aside>

    <main style={{flex:1,overflowY:"auto",padding:"22px 24px"}}>
      {active==="dashboard"&&<div>
        <p style={{fontSize:11,color:th.muted,marginBottom:3,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"نظرة عامة":"Overview"}</p>
        <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:18}}>{t.dashboard}</h1>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          {[[String(BOOKS.length||0),t.books,th.prime,P.book],[String(adminStats?.students||adminStudents.length||0),t.students,th.accent,P.student],[String(activeCount),t.activeLoans,th.cyan,P.bookOpen],[String(pendingCount),t.pending,th.amber,P.alert]].map(([val,label,c,icon])=>(
            <div key={label} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"16px 17px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-24,right:-24,width:85,height:85,borderRadius:"50%",background:`${c}0b`,pointerEvents:"none"}}/>
              <div style={{width:33,height:33,borderRadius:10,background:`${c}20`,display:"flex",alignItems:"center",justifyContent:"center",color:c,marginBottom:10}}><Ic p={icon} s={15}/></div>
              <p style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:3}}>{val}</p>
              <p style={{fontSize:11,color:th.sub}}>{label}</p>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:13}}>
          <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"17px"}}>
            <h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:2}}>{isAr?"النشاط الشهري":"Monthly Activity"}</h3>
            <p style={{fontSize:10,color:th.sub,marginBottom:12}}>{isAr?"استعارات مقابل إرجاع":"Borrows vs Returns"}</p>
            <ResponsiveContainer width="100%" height={175}>
              <AreaChart data={adminStats?.monthly || []}><defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={th.prime} stopOpacity={0.3}/><stop offset="95%" stopColor={th.prime} stopOpacity={0}/></linearGradient><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={th.accent} stopOpacity={0.25}/><stop offset="95%" stopColor={th.accent} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={th.border}/><XAxis dataKey="m" stroke="transparent" tick={{fontSize:9,fill:th.muted}}/><YAxis stroke="transparent" tick={{fontSize:9,fill:th.muted}}/><Tooltip contentStyle={{background:th.card2||th.card,border:`1px solid ${th.border}`,borderRadius:9,fontSize:10,color:th.text}}/><Area type="monotone" dataKey="borrows" stroke={th.prime} fill="url(#gB)" strokeWidth={2.5} name={isAr?"استعارات":"Borrows"}/><Area type="monotone" dataKey="returns" stroke={th.accent} fill="url(#gR)" strokeWidth={2} name={isAr?"إرجاع":"Returns"}/></AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"17px"}}>
            <h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:2}}>{isAr?"الكتب حسب القسم":"Books by Dept."}</h3>
            <p style={{fontSize:10,color:th.sub,marginBottom:12}}>{isAr?"توزيع المجموعة":"Collection"}</p>
            <ResponsiveContainer width="100%" height={175}>
                <BarChart data={adminStats?.dept_stats || []} layout="vertical" margin={{left:0,right:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke={th.border} horizontal={false}/>
                <XAxis type="number" stroke="transparent" tick={{fontSize:8,fill:th.muted}}/>
                <YAxis dataKey="dept" type="category" stroke="transparent" tick={{fontSize:8,fill:th.sub}} width={50}/>
                <Tooltip contentStyle={{background:th.card2||th.card,border:`1px solid ${th.border}`,borderRadius:9,fontSize:10,color:th.text}}/>
                <Bar dataKey="books" radius={[0,5,5,0]} maxBarSize={13}>
                    {(adminStats?.dept_stats || []).map((e,i)=><Cell key={i} fill={e.color || th.prime}/>)}
                </Bar>
                </BarChart>            </ResponsiveContainer>
          </div>
        </div>
        {/* Pending requests quick widget */}
        {allReqs.filter(r=>r.status==="pending").length>0&&<div style={{marginTop:13}}>
          <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"13px 16px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexDirection:"row"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:"row"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:th.amber,animation:"blink 2s ease infinite"}}/>
                <h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"طلبات تنتظر الموافقة":"Awaiting Approval"}</h3>
                <span style={{fontSize:9,fontWeight:700,background:th.amber,color:"#fff",borderRadius:20,padding:"1px 7px"}}>{allReqs.filter(r=>r.status==="pending").length}</span>
              </div>
              <button onClick={()=>setActive("requests")} className="btn" style={{fontSize:11,color:th.prime,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"عرض الكل":"View all"} →</button>
            </div>
            {enrichWithCover(allReqs.filter(r=>r.status==="pending")).slice(0,3).map((r,i)=>(
              <div key={r.id} className="rh" style={{display:"flex",alignItems:"center",gap:11,padding:"11px 16px",borderBottom:`1px solid ${th.border}`,transition:"background 0.2s",flexDirection:"row"}}>
                <div style={{width:36,height:48,borderRadius:7,overflow:"hidden",flexShrink:0}}><Cover colors={r.bCover||["#1e3a8a","#1e40af"]} h={48}/></div>
                <div style={{flex:1,minWidth:0,textAlign:isAr?"right":"left"}}>
                  <p style={{fontSize:12,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.bTitle}</p>
                  <p style={{fontSize:11,color:th.sub,marginTop:1}}>{r.sName} · <span style={{color:th.muted}}>{r.reqDate}</span></p>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0,flexDirection:"row"}}>
                  <button onClick={()=>approveReq(r.id)} className="btn" style={{background:th.green+"20",border:`1px solid ${th.green}44`,borderRadius:7,padding:"5px 10px",color:th.green,fontSize:10,fontWeight:700}}>{t.approve}</button>
                  <button onClick={()=>rejectReq(r.id)} className="btn" style={{background:th.red+"20",border:`1px solid ${th.red}44`,borderRadius:7,padding:"5px 10px",color:th.red,fontSize:10,fontWeight:700}}>{t.reject}</button>
                </div>
              </div>
            ))}
          </div>
        </div>}
      </div>}

      {active==="books"&&<div>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div>
            <p style={{fontSize:11,color:th.muted,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"إدارة الكتب":"Manage Books"}</p>
            <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>{t.books}</h1>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{textAlign:"center",background:th.card,border:`1px solid ${th.border}`,borderRadius:11,padding:"7px 14px"}}>
              <p style={{fontSize:16,fontWeight:700,color:th.prime,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{bkTotal.toLocaleString()}</p>
              <p style={{fontSize:9,color:th.muted}}>Total Books</p>
            </div>
            <button onClick={()=>{setBkQ("");setBkGenre("All");setBkPage(0);bkLoad("","All",0);}} style={{width:38,height:38,borderRadius:10,background:th.card,border:`1px solid ${th.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}>
              <Ic p={P.refresh} s={15}/>
            </button>
            <button onClick={bkOpenAdd} style={{display:"flex",alignItems:"center",gap:7,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,border:"none",borderRadius:11,padding:"10px 18px",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",cursor:"pointer",boxShadow:`0 4px 14px ${th.prime}44`}}>
              <Ic p={P.plus} s={14}/>{isAr?"إضافة كتاب":"Add Book"}
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:"1 1 220px"}}>
            <div style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",color:th.muted}}><Ic p={P.search} s={14}/></div>
            <input value={bkQ} onChange={e=>{setBkQ(e.target.value);setBkPage(0);bkLoad(e.target.value,bkGenre,0);}} placeholder={isAr?"ابحث بالعنوان أو المؤلف...":"Search by title or author..."}
              style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"9px 12px 9px 34px",color:th.text,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/>
          </div>
          <select value={bkGenre} onChange={e=>{setBkGenre(e.target.value);setBkPage(0);bkLoad(bkQ,e.target.value,0);}}
            style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"9px 28px 9px 11px",color:th.text,fontSize:12,fontFamily:"'Space Grotesk',sans-serif",outline:"none",cursor:"pointer",appearance:"none",minWidth:150}}>
            <option value="All">All Genres</option>
            {GENRES_LIST.map(g=><option key={g} value={g}>{g}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:th.card}}>
                  {["Cover","Title / Author","Genre","Copies","Actions"].map((h,i)=>(
                    <th key={h} style={{padding:"10px 13px",fontSize:9,fontWeight:700,color:th.muted,textTransform:"uppercase",letterSpacing:"0.07em",fontFamily:"'Space Grotesk',sans-serif",textAlign:i===3?"center":i===4?"right":"left",borderBottom:`1px solid ${th.border}`,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bkLoading
                  ?<tr><td colSpan={5} style={{padding:"50px",textAlign:"center"}}><span style={{width:26,height:26,borderRadius:"50%",border:`2px solid ${th.prime}33`,borderTopColor:th.prime,animation:"spin 0.7s linear infinite",display:"inline-block"}}/></td></tr>
                  :bkList.length===0
                    ?<tr><td colSpan={5} style={{padding:"50px",textAlign:"center"}}><Ic p={P.book} s={32} color={th.muted}/><p style={{fontSize:13,color:th.muted,marginTop:10,fontFamily:"'Space Grotesk',sans-serif"}}>No books found</p></td></tr>
                    :bkList.map(b=>{
                      const imgSrc=b.image_url?(b.image_url.startsWith("/api/")?`${AI_API_URL}${b.image_url}`:`${AI_API_URL}/api/image-proxy?url=${encodeURIComponent(b.image_url)}`):null;
                      return(
                        <tr key={b.book_id||b.id} className="rh" style={{transition:"background 0.15s"}}>
                          <td style={{padding:"9px 13px",borderBottom:`1px solid ${th.border}`}}>
                            <div style={{width:34,height:46,borderRadius:6,overflow:"hidden",background:th.card,border:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                              {imgSrc?<img src={imgSrc} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.style.display="none"}/>:<Ic p={P.book} s={14} color={th.muted}/>}
                            </div>
                          </td>
                          <td style={{padding:"9px 13px",borderBottom:`1px solid ${th.border}`,maxWidth:300}}>
                            <p style={{fontSize:12,fontWeight:600,color:th.text,fontFamily:"'Space Grotesk',sans-serif",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{b.title}</p>
                            <p style={{fontSize:11,color:th.sub}}>{b.author}</p>
                          </td>
                          <td style={{padding:"9px 13px",borderBottom:`1px solid ${th.border}`}}>
                            <span style={{fontSize:10,color:th.prime,background:th.prime+"18",padding:"3px 9px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,whiteSpace:"nowrap"}}>{b.genre||b.dept}</span>
                          </td>
                          <td style={{padding:"9px 13px",borderBottom:`1px solid ${th.border}`,textAlign:"center"}}>
                            <span style={{fontSize:12,color:th.text,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>{b.copies_total??1}</span>
                          </td>
                          <td style={{padding:"9px 13px",borderBottom:`1px solid ${th.border}`}}>
                            <div style={{display:"flex",gap:6,justifyContent:"flex-end"}}>
                              <button onClick={()=>bkOpenEdit(b)} style={{width:30,height:30,borderRadius:8,background:th.prime+"18",border:`1px solid ${th.prime}33`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.prime}}>
                                <Ic p={P.settings} s={13}/>
                              </button>
                              <button onClick={()=>setBkDeleteBook(b)} style={{width:30,height:30,borderRadius:8,background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:"#ef4444"}}>
                                <Ic p={P.trash} s={13}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                }
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {Math.ceil(bkTotal/BK_PAGE_SIZE)>1&&(
            <div style={{padding:"12px 16px",borderTop:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
              <p style={{fontSize:11,color:th.sub,fontFamily:"'Space Grotesk',sans-serif"}}>
                Page <strong style={{color:th.text}}>{bkPage+1}</strong> of <strong style={{color:th.text}}>{Math.ceil(bkTotal/BK_PAGE_SIZE)}</strong> — {bkTotal.toLocaleString()} books
              </p>
              <div style={{display:"flex",gap:5}}>
                <button onClick={()=>{const p=bkPage-1;setBkPage(p);bkLoad(bkQ,bkGenre,p);}} disabled={bkPage===0}
                  style={{padding:"6px 12px",borderRadius:8,background:th.card,border:`1px solid ${th.border}`,color:bkPage===0?th.muted:th.text,fontSize:11,fontWeight:600,cursor:bkPage===0?"not-allowed":"pointer",fontFamily:"'Space Grotesk',sans-serif"}}>← Prev</button>
                <button onClick={()=>{const p=bkPage+1;setBkPage(p);bkLoad(bkQ,bkGenre,p);}} disabled={bkPage>=Math.ceil(bkTotal/BK_PAGE_SIZE)-1}
                  style={{padding:"6px 12px",borderRadius:8,background:th.card,border:`1px solid ${th.border}`,color:bkPage>=Math.ceil(bkTotal/BK_PAGE_SIZE)-1?th.muted:th.text,fontSize:11,fontWeight:600,cursor:bkPage>=Math.ceil(bkTotal/BK_PAGE_SIZE)-1?"not-allowed":"pointer",fontFamily:"'Space Grotesk',sans-serif"}}>Next →</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Add / Edit Modal ── */}
        {bkShowForm&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(12px)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,overflowY:"auto"}} onClick={()=>setBkShowForm(false)}>
            <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:22,padding:"26px 24px",width:"100%",maxWidth:540,animation:"scaleIn 0.22s ease",position:"relative"}} onClick={e=>e.stopPropagation()}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:10,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
                    <Ic p={bkEditBook?P.settings:P.plus} s={16}/>
                  </div>
                  <div>
                    <h2 style={{fontSize:15,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",margin:0}}>{bkEditBook?(isAr?"تعديل كتاب":"Edit Book"):(isAr?"إضافة كتاب جديد":"Add New Book")}</h2>
                    <p style={{fontSize:10,color:th.muted,margin:0}}>{bkEditBook?`ID: ${bkEditBook.book_id||bkEditBook.id}`:(isAr?"أدخل بيانات الكتاب":"Fill in the book details")}</p>
                  </div>
                </div>
                <button onClick={()=>setBkShowForm(false)} style={{width:30,height:30,borderRadius:8,background:th.card,border:`1px solid ${th.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Ic p={P.xO} s={14}/></button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px 14px"}}>
                <div style={{gridColumn:"1 / -1"}}>
                  <label style={{fontSize:9,color:th.sub,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"العنوان *":"Title *"}</label>
                  <input value={bkForm.title} onChange={e=>setBkForm(f=>({...f,title:e.target.value}))} placeholder="Book title"
                    style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:9,padding:"9px 12px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <label style={{fontSize:9,color:th.sub,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"المؤلف *":"Author *"}</label>
                  <input value={bkForm.author} onChange={e=>setBkForm(f=>({...f,author:e.target.value}))} placeholder="Author name"
                    style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:9,padding:"9px 12px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <label style={{fontSize:9,color:th.sub,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"القسم":"Genre"}</label>
                  <select value={bkForm.genre} onChange={e=>setBkForm(f=>({...f,genre:e.target.value}))}
                    style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:9,padding:"9px 12px",color:th.text,fontSize:12,fontFamily:"'Space Grotesk',sans-serif",outline:"none",cursor:"pointer",boxSizing:"border-box"}}>
                    {GENRES_LIST.map(g=><option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{gridColumn:"1 / -1"}}>
                  <label style={{fontSize:9,color:th.sub,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"وصف":"Description"}</label>
                  <textarea value={bkForm.description} onChange={e=>setBkForm(f=>({...f,description:e.target.value}))} placeholder="Short description (optional)" rows={2}
                    style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:9,padding:"9px 12px",color:th.text,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <label style={{fontSize:9,color:th.sub,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"عدد النسخ":"Copies"}</label>
                  <input type="number" min={1} value={bkForm.copies_total} onChange={e=>setBkForm(f=>({...f,copies_total:Math.max(1,Number(e.target.value))}))}
                    style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:9,padding:"9px 12px",color:th.text,fontSize:13,fontFamily:"'Space Grotesk',sans-serif",outline:"none",boxSizing:"border-box"}}/>
                </div>
                <div>
                  <label style={{fontSize:9,color:th.sub,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"طريقة الصورة":"Cover Image"}</label>
                  <div style={{display:"flex",gap:6}}>
                    {[["url","🔗 URL"],["file","📁 Upload"]].map(([mode,label])=>(
                      <button key={mode} onClick={()=>setBkImageMode(mode)}
                        style={{flex:1,padding:"8px",borderRadius:8,border:`1px solid ${bkImageMode===mode?th.prime+"88":th.border}`,background:bkImageMode===mode?th.prime+"18":th.card,color:bkImageMode===mode?th.prime:th.sub,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif"}}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{gridColumn:"1 / -1"}}>
                  {bkImageMode==="url"?(
                    <div>
                      <label style={{fontSize:9,color:th.sub,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>Image URL</label>
                      <input value={bkForm.image_url} onChange={e=>{setBkForm(f=>({...f,image_url:e.target.value}));setBkImagePreview(e.target.value);}}
                        placeholder="https://..."
                        style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:9,padding:"9px 12px",color:th.text,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",boxSizing:"border-box"}}/>
                    </div>
                  ):(
                    <div>
                      <label style={{fontSize:9,color:th.sub,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>Upload Image (JPG/PNG/WEBP — max 5MB)</label>
                      <div onClick={()=>bkFileRef.current?.click()}
                        style={{border:`2px dashed ${bkImageFile?th.prime+"88":th.border}`,borderRadius:10,padding:"14px",textAlign:"center",cursor:"pointer",background:th.card}}>
                        {bkImageFile
                          ?<p style={{fontSize:12,color:th.prime,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>✓ {bkImageFile.name}</p>
                          :<><Ic p={P.upload} s={20} color={th.muted}/><p style={{fontSize:11,color:th.muted,marginTop:6}}>Click to choose image from your computer</p></>
                        }
                      </div>
                      <input ref={bkFileRef} type="file" accept="image/*" onChange={bkHandleFile} style={{display:"none"}}/>
                    </div>
                  )}
                </div>
                {bkImagePreview&&(
                  <div style={{gridColumn:"1 / -1",display:"flex",alignItems:"center",gap:10}}>
                    <img src={bkImagePreview} alt="preview" onError={()=>setBkImagePreview("")}
                      style={{width:50,height:66,objectFit:"cover",borderRadius:7,border:`1px solid ${th.border}`,flexShrink:0}}/>
                    <div>
                      <p style={{fontSize:11,color:th.sub}}>Cover Preview</p>
                      <button onClick={()=>{setBkImagePreview("");setBkImageFile(null);setBkForm(f=>({...f,image_url:""}));}}
                        style={{fontSize:11,color:th.red,background:"none",border:"none",cursor:"pointer",padding:0,fontWeight:600}}>Remove</button>
                    </div>
                  </div>
                )}
              </div>
              {bkFormErr&&<div style={{background:th.red+"14",border:`1px solid ${th.red}30`,borderRadius:9,padding:"8px 12px",marginTop:12,fontSize:12,color:th.red}}>{bkFormErr}</div>}
              <div style={{display:"flex",gap:9,marginTop:18}}>
                <button onClick={bkSubmit} disabled={bkFormLoading}
                  style={{flex:1,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",border:"none",cursor:bkFormLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:bkFormLoading?0.8:1}}>
                  {bkFormLoading?<><span style={{width:13,height:13,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>{bkEditBook?"Saving...":"Adding..."}</>:<><Ic p={P.checkO} s={14}/>{bkEditBook?(isAr?"حفظ التعديلات":"Save Changes"):(isAr?"إضافة":"Add Book")}</>}
                </button>
                <button onClick={()=>setBkShowForm(false)} style={{flex:1,padding:"12px",borderRadius:10,background:th.card,border:`1px solid ${th.border}`,color:th.sub,fontSize:13,fontWeight:600,cursor:"pointer"}}>{isAr?"إلغاء":"Cancel"}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Delete Confirm Modal ── */}
        {bkDeleteBook&&(
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(10px)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setBkDeleteBook(null)}>
            <div style={{background:th.surface,border:"1px solid rgba(239,68,68,0.3)",borderRadius:20,padding:26,width:"100%",maxWidth:390,animation:"scaleIn 0.22s ease"}} onClick={e=>e.stopPropagation()}>
              <div style={{textAlign:"center",marginBottom:18}}>
                <div style={{width:54,height:54,borderRadius:"50%",background:"rgba(239,68,68,0.12)",border:"2px solid rgba(239,68,68,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"}}>
                  <Ic p={P.trash} s={22} color="#ef4444"/>
                </div>
                <h3 style={{fontSize:16,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:7}}>{isAr?"حذف الكتاب؟":"Delete Book?"}</h3>
                <p style={{fontSize:12,color:th.sub,lineHeight:1.6}}>
                  {isAr?"هل أنت متأكد من حذف":"Are you sure you want to delete"} <strong style={{color:th.text}}>"{bkDeleteBook.title}"</strong>?
                  <br/><span style={{fontSize:11,color:"#ef4444"}}>{isAr?"لا يمكن التراجع عن هذا الإجراء":"This action cannot be undone."}</span>
                </p>
              </div>
              <div style={{display:"flex",gap:9}}>
                <button onClick={bkConfirmDelete} disabled={bkDelLoading}
                  style={{flex:1,background:"linear-gradient(135deg,#ef4444,#dc2626)",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",border:"none",cursor:bkDelLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:bkDelLoading?0.75:1}}>
                  {bkDelLoading?<><span style={{width:13,height:13,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>{isAr?"جاري الحذف...":"Deleting..."}</>:<><Ic p={P.trash} s={13}/>{isAr?"نعم، احذف":"Yes, Delete"}</>}
                </button>
                <button onClick={()=>setBkDeleteBook(null)} style={{flex:1,padding:"12px",borderRadius:10,background:th.card,border:`1px solid ${th.border}`,color:th.sub,fontSize:13,fontWeight:600,cursor:"pointer"}}>{isAr?"إلغاء":"Cancel"}</button>
              </div>
            </div>
          </div>
        )}

        {/* ── Toast ── */}
        {bkToast&&(
          <div style={{position:"fixed",bottom:24,right:24,zIndex:99999,background:"#1a1f2e",border:`1px solid ${bkToast.type==="success"?th.green:th.red}44`,borderRadius:13,padding:"12px 16px",display:"flex",alignItems:"center",gap:9,boxShadow:"0 8px 32px rgba(0,0,0,0.5)",animation:"fadeUp 0.3s ease",minWidth:240}}>
            <div style={{width:26,height:26,borderRadius:7,background:(bkToast.type==="success"?th.green:th.red)+"18",display:"flex",alignItems:"center",justifyContent:"center",color:bkToast.type==="success"?th.green:th.red,flexShrink:0}}>
              <Ic p={bkToast.type==="success"?P.checkO:P.xO} s={13}/>
            </div>
            <span style={{fontSize:12,color:"#f0eef9",fontFamily:"'Space Grotesk',sans-serif",flex:1}}>{bkToast.msg}</span>
            <button onClick={()=>setBkToast(null)} style={{background:"none",border:"none",cursor:"pointer",color:th.muted,padding:2}}><Ic p={P.xO} s={12}/></button>
          </div>
        )}
      </div>}

      {active==="requests"&&<div>
        <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:16}}>{t.requests}</h1>
        <div style={{display:"flex",gap:7,marginBottom:16,flexDirection:"row"}}>
          {[["all",t.all,allReqs.length],["pending",t.pending,allReqs.filter(r=>r.status==="pending").length],["approved",t.approved,allReqs.filter(r=>r.status==="approved").length],["rejected",t.rejected,allReqs.filter(r=>r.status==="rejected").length]].map(([id,label,cnt])=>(
            <button key={id} onClick={()=>setReqFilter(id)} className="btn" style={{padding:"7px 14px",borderRadius:9,fontSize:11,fontWeight:reqFilter===id?700:400,color:reqFilter===id?th.prime:th.sub,border:`1px solid ${reqFilter===id?th.prime+"44":th.border}`,background:reqFilter===id?th.prime+"15":"transparent",display:"flex",alignItems:"center",gap:5,fontFamily:"'Space Grotesk',sans-serif"}}>
              {label}<span style={{fontSize:9,fontWeight:700,background:reqFilter===id?th.prime:th.muted+"33",color:reqFilter===id?"#fff":th.sub,borderRadius:20,padding:"1px 5px"}}>{cnt}</span>
            </button>
          ))}
        </div>
        {filteredReqs.length===0
          ?<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"30px",textAlign:"center"}}><p style={{fontSize:12,color:th.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.noRequests}</p></div>
          :<div style={{display:"flex",flexDirection:"column",gap:9}}>
            {filteredReqs.map((r,i)=>{
              const sc2=r.status==="pending"?th.amber:r.status==="approved"?th.green:th.red;
              const days=r.dueDateISO?daysLeft(r.dueDateISO):null;
              return(<div key={r.id} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:13,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,animation:`fadeUp 0.35s ${i*40}ms ease both`,flexDirection:"row"}}>
                <div style={{width:40,height:54,borderRadius:8,overflow:"hidden",flexShrink:0}}><Cover colors={r.bCover} h={54}/></div>
                <div style={{flex:1,minWidth:0,textAlign:isAr?"right":"left"}}>
                  <p style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{r.bTitle}</p>
                  <p style={{fontSize:11,color:th.sub,marginTop:1}}>{r.sName} · {r.sid}</p>
                  <p style={{fontSize:10,color:th.muted,marginTop:2}}>{t.reqDate}: {r.reqDate}{r.dueDate?` · ${t.returnBy}: ${r.dueDate}`:""}</p>
                </div>
                {r.status==="approved"&&!r.returnDate&&days!==null&&<div style={{textAlign:"center",background:daysColor(days,th)+"14",border:`1px solid ${daysColor(days,th)}33`,borderRadius:10,padding:"7px 10px",flexShrink:0}}>
                  <p style={{fontSize:17,fontWeight:700,color:daysColor(days,th),fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{Math.abs(days)}</p>
                  <p style={{fontSize:8,color:daysColor(days,th),marginTop:1}}>{days<0?"overdue":"days"}</p>
                </div>}
                <div style={{display:"flex",gap:7,flexShrink:0,flexDirection:"row"}}>
                  {r.status==="pending"&&<>
                    <button onClick={()=>approveReq(r.id)} className="btn" style={{background:th.green+"20",border:`1px solid ${th.green}44`,borderRadius:8,padding:"7px 13px",color:th.green,fontSize:11,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:5}}><Ic p={P.checkO} s={12}/>{t.approve}</button>
                    <button onClick={()=>rejectReq(r.id)} className="btn" style={{background:th.red+"20",border:`1px solid ${th.red}44`,borderRadius:8,padding:"7px 13px",color:th.red,fontSize:11,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:5}}><Ic p={P.xO} s={12}/>{t.reject}</button>
                  </>}
                  {r.status==="approved"&&!r.returnDate&&<button onClick={()=>returnBook(r.id)} className="btn" style={{background:th.cyan+"20",border:`1px solid ${th.cyan}44`,borderRadius:8,padding:"7px 13px",color:th.cyan,fontSize:11,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif"}}>{t.markReturned}</button>}
                  {r.returnDate&&<span style={{fontSize:10,color:th.green,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:4}}><Ic p={P.checkO} s={11}/>{t.returned}</span>}
                  {!r.returnDate&&<span style={{fontSize:9,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${sc2}18`,color:sc2,border:`1px solid ${sc2}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{r.status}</span>}
                </div>
              </div>);
            })}
          </div>
        }
      </div>}

      {active==="students"&&<div>
        {/* Header row with Add User button */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexDirection:"row"}}>
          <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>{t.students}</h1>
          {isSuperAdmin&&<button onClick={()=>setShowAddUser(true)} className="btn"
            style={{background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:11,padding:"9px 16px",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:7,boxShadow:`0 4px 16px ${th.prime}44`}}>
            <Ic p={P.plus} s={14}/>Add User
          </button>}
        </div>
        {/* Sub-tabs: Students / Admins */}
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          {(isSuperAdmin?[["students","👨‍🎓 Students",adminStudents.length],["admins","🛡️ Admins",adminsList.length]]:[["students","👨‍🎓 Students",adminStudents.length]]).map(([id,label,cnt])=>(
            <button key={id} onClick={()=>setStudentsTab(id)} className="btn"
              style={{padding:"7px 14px",borderRadius:9,fontSize:11,fontWeight:studentsTab===id?700:400,color:studentsTab===id?th.prime:th.sub,border:`1px solid ${studentsTab===id?th.prime+"44":th.border}`,background:studentsTab===id?th.prime+"15":"transparent",display:"flex",alignItems:"center",gap:5,fontFamily:"'Space Grotesk',sans-serif"}}>
              {label}<span style={{fontSize:9,fontWeight:700,background:studentsTab===id?th.prime:th.muted+"33",color:studentsTab===id?"#fff":th.sub,borderRadius:20,padding:"1px 6px"}}>{cnt}</span>
            </button>
          ))}
        </div>
        {/* ── STUDENTS LIST ── */}
        {studentsTab==="students"&&<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 160px",padding:"9px 16px",borderBottom:`1px solid ${th.border}`,background:th.surface}}>
            {["Student","Dept","Status","Loans",""].map(h=>(<span key={h} style={{fontSize:9,fontWeight:700,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{h}</span>))}
          </div>
          {adminStudents.map((s)=>{
            const myReqs=allReqs.filter(r=>r.sid===s.libId);
            const actL=myReqs.filter(r=>r.status==="approved"&&!r.returnDate).length;
            const susp=s.status==="suspended";
            return(<div key={s.id} className="rh" style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 160px",padding:"12px 16px",borderBottom:`1px solid ${th.border}`,background:"transparent",transition:"background 0.2s",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexDirection:"row"}}>
                <div style={{width:32,height:32,borderRadius:9,background:`${s.color}22`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:s.color,fontFamily:"'Space Grotesk',sans-serif"}}>{s.name[0]}</div>
                <div style={{textAlign:isAr?"right":"left"}}><p style={{fontSize:12,fontWeight:600,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{s.name}</p><p style={{fontSize:10,color:th.muted}}>{s.libId}</p></div>
              </div>
              <p style={{fontSize:11,color:th.sub}}>{s.dept}</p>
              <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:20,width:"fit-content",background:susp?th.red+"18":th.green+"18",color:susp?th.red:th.green,border:`1px solid ${susp?th.red:th.green}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{s.status}</span>
              <span style={{fontSize:13,fontWeight:700,color:actL>0?th.prime:th.muted,fontFamily:"'Space Grotesk',sans-serif"}}>{actL}</span>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <button onClick={()=>setSelStudent(s)} className="btn" style={{fontSize:10,fontWeight:700,color:th.prime,border:`1px solid ${th.prime}44`,borderRadius:7,padding:"5px 8px",background:th.prime+"10",fontFamily:"'Space Grotesk',sans-serif"}}>{t.studentDetail}</button>
                <button onClick={()=>setEditUser({user:{...s},userRole:"student"})} className="btn" style={{width:26,height:26,borderRadius:7,background:th.amber+"18",border:`1px solid ${th.amber}44`,color:th.amber,display:"flex",alignItems:"center",justifyContent:"center"}} title="Edit"><Ic p={P.settings} s={11}/></button>
                <button onClick={()=>setDeleteUser({user:{...s},userRole:"student"})} className="btn" style={{width:26,height:26,borderRadius:7,background:th.red+"18",border:`1px solid ${th.red}44`,color:th.red,display:"flex",alignItems:"center",justifyContent:"center"}} title="Delete"><Ic p={P.trash} s={11}/></button>
              </div>
            </div>);
          })}
        </div>}
        {/* ── ADMINS LIST ── */}
        {studentsTab==="admins"&&<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 100px",padding:"9px 16px",borderBottom:`1px solid ${th.border}`,background:th.surface}}>
            {["Admin","Email","Joined",""].map(h=>(<span key={h} style={{fontSize:9,fontWeight:700,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{h}</span>))}
          </div>
          {adminsList.length===0&&<div style={{padding:"28px",textAlign:"center"}}><p style={{fontSize:12,color:th.muted}}>No admins loaded yet</p></div>}
          {adminsList.map((a)=>(
            <div key={a.id} className="rh" style={{display:"grid",gridTemplateColumns:"2fr 2fr 1fr 100px",padding:"12px 16px",borderBottom:`1px solid ${th.border}`,background:"transparent",transition:"background 0.2s",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:32,height:32,borderRadius:9,background:`${a.color}22`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:a.color,fontFamily:"'Space Grotesk',sans-serif"}}>{a.name[0]}</div>
                <div><p style={{fontSize:12,fontWeight:600,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{a.name}</p><p style={{fontSize:10,color:th.muted}}>@{a.username}</p></div>
              </div>
              <p style={{fontSize:11,color:th.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.email}</p>
              <p style={{fontSize:11,color:th.muted}}>{a.joined}</p>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <button onClick={()=>setEditUser({user:{...a},userRole:"admin"})} className="btn" style={{width:26,height:26,borderRadius:7,background:th.amber+"18",border:`1px solid ${th.amber}44`,color:th.amber,display:"flex",alignItems:"center",justifyContent:"center"}} title="Edit"><Ic p={P.settings} s={11}/></button>
                <button onClick={()=>setDeleteUser({user:{...a},userRole:"admin"})} className="btn" style={{width:26,height:26,borderRadius:7,background:th.red+"18",border:`1px solid ${th.red}44`,color:th.red,display:"flex",alignItems:"center",justifyContent:"center"}} title="Delete"><Ic p={P.trash} s={11}/></button>
              </div>
            </div>
          ))}
        </div>}
      </div>}

      {active==="announce"&&<div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexDirection:"row"}}>
          <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>Announcements</h1>
          <button onClick={()=>setComposing(true)} className="btn" style={{background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:11,padding:"8px 15px",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:6,flexDirection:"row"}}><Ic p={P.plus} s={13}/>{isAr?"إعلان جديد":"New Announcement"}</button>
        </div>
        {anns.length===0
          ?<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"30px",textAlign:"center"}}><div style={{color:th.muted,display:"flex",justifyContent:"center",marginBottom:11}}><Ic p={P.megaphone} s={40}/></div><p style={{fontSize:14,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"لا توجد إعلانات بعد":"No announcements yet"}</p></div>
          :<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {anns.map((a,i)=>{const c=pc(a.priority);return(
              <div key={a.id} style={{background:th.card,border:`1px solid ${th.border}`,borderLeft:`4px solid ${c}`,borderRadius:13,padding:"15px 18px",display:"flex",gap:12,animation:`fadeUp 0.4s ${i*50}ms ease both`,flexDirection:"row"}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${c}18`,display:"flex",alignItems:"center",justifyContent:"center",color:c,flexShrink:0}}><Ic p={P.megaphone} s={15}/></div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexDirection:"row"}}><h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{a.title}</h3><span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20,background:`${c}18`,color:c,border:`1px solid ${c}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase"}}>{a.priority}</span></div>
                  <p style={{fontSize:12,color:th.sub,lineHeight:1.65,marginBottom:5,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{a.body}</p>
                  <p style={{fontSize:10,color:th.muted,display:"flex",alignItems:"center",gap:3,flexDirection:"row"}}><Ic p={P.clock} s={10}/>{a.date} at {a.time}</p>
                </div>
                <button onClick={()=>delAnn(a.id)} className="btn" style={{width:27,height:27,borderRadius:8,background:th.red+"18",border:`1px solid ${th.red}44`,color:th.red,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic p={P.trash} s={12}/></button>
              </div>);})}
          </div>
        }
        {composing&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(8px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setComposing(false)}>
          <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:19,padding:"26px",width:440,animation:"scaleIn 0.25s ease",direction:"ltr"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:16}}>{isAr?"إعلان جديد":"New Announcement"}</h3>
            <div style={{marginBottom:12}}><label style={{fontSize:10,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"العنوان":"Title"}</label><input value={aTitle} onChange={e=>setATitle(e.target.value)} placeholder={isAr?"عنوان...":"Title..."} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"9px 12px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/></div>
            <div style={{marginBottom:12}}><label style={{fontSize:10,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"الرسالة":"Message"}</label><textarea value={aBody} onChange={e=>setABody(e.target.value)} placeholder={isAr?"اكتب إعلانك...":"Your message..."} rows={3} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"9px 12px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",resize:"none"}}/></div>
            <div style={{marginBottom:16}}><label style={{fontSize:10,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"الأولوية":"Priority"}</label><div style={{display:"flex",gap:7}}>{[["normal",isAr?"عادي":"Normal",th.prime],["important",isAr?"مهم":"Important",th.amber],["urgent",isAr?"عاجل":"Urgent",th.red]].map(([id,label,c])=>(<button key={id} onClick={()=>setAPrio(id)} className="btn" style={{flex:1,background:aPrio===id?`${c}22`:"transparent",border:`1px solid ${aPrio===id?c+"66":th.border}`,borderRadius:9,padding:"8px",color:aPrio===id?c:th.sub,fontSize:12,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>{label}</button>))}</div></div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={postAnn} className="btn" style={{flex:1,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:10,padding:"11px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Ic p={P.megaphone} s={13}/>{isAr?"نشر":"Post"}</button>
              <button onClick={()=>setComposing(false)} className="btn" style={{flex:1,background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"11px",color:th.sub,fontSize:13,fontFamily:"'Space Grotesk',sans-serif"}}>{t.cancel}</button>
            </div>
          </div>
        </div>}
      </div>}

      {active==="profile"&&<AdminProfilePage th={th} isAr={isAr} adminFetch={adminFetch} isSuperAdmin={isSuperAdmin} initialProfile={adminProfile}/>}
    </main>
    {selStudent&&<StudentDetailModal th={th} t={t} isAr={isAr} student={selStudent} allReqs={allReqs} BOOKS={BOOKS} onClose={()=>setSelStudent(null)}/>}
    {showAddUser&&<AddUserModal th={th} isAr={isAr} adminFetch={adminFetch} isSuperAdmin={isSuperAdmin} onClose={()=>setShowAddUser(false)} onDone={refreshAll}/>}
    {editUser&&<EditUserModal th={th} isAr={isAr} user={editUser.user} userRole={editUser.userRole} adminFetch={adminFetch} isSuperAdmin={isSuperAdmin} onClose={()=>setEditUser(null)} onDone={refreshAll}/>}
    {deleteUser&&<DeleteConfirmModal th={th} isAr={isAr} user={deleteUser.user} userRole={deleteUser.userRole} adminFetch={adminFetch} onClose={()=>setDeleteUser(null)} onDone={refreshAll}/>}
  </div>);
}

function DeleteConfirmModal({th,isAr,user,userRole,adminFetch,onClose,onDone}){
  const[loading,setLoading]=useState(false);
  const[err,setErr]=useState("");
  const del=async()=>{
    setLoading(true);setErr("");
    try{
      const res=await adminFetch(`/api/admin/delete-user/${userRole}/${user.id}`,{method:"DELETE"});
      const data=await res.json();
      if(!res.ok){setErr(data.detail||"Delete failed");setLoading(false);return;}
      onDone();onClose();
    }catch{setErr("Cannot connect to server.");}
    setLoading(false);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",backdropFilter:"blur(10px)",zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:th.surface,border:`1px solid rgba(239,68,68,0.3)`,borderRadius:20,padding:"28px",width:"100%",maxWidth:420,animation:"scaleIn 0.22s ease",direction:"ltr"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{width:60,height:60,borderRadius:"50%",background:"rgba(239,68,68,0.12)",border:"2px solid rgba(239,68,68,0.3)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px"}}>
            <Ic p={P.trash} s={26} color="#ef4444"/>
          </div>
          <h3 style={{fontSize:18,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:8}}>Delete Account?</h3>
          <p style={{fontSize:13,color:th.sub,lineHeight:1.6}}>
            You are about to permanently delete <strong style={{color:th.text}}>{user.name}</strong>{"'s"} account.
            {userRole==="student"&&<><br/><span style={{fontSize:11,color:"#ef4444"}}>All borrow history, wishlist & notifications will be deleted.</span></>}
          </p>
        </div>
        {err&&<div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:10,padding:"9px 13px",marginBottom:14,fontSize:12,color:"#ef4444"}}>{err}</div>}
        <div style={{display:"flex",gap:9}}>
          <button onClick={del} disabled={loading} className="btn"
            style={{flex:1,background:"linear-gradient(135deg,#ef4444,#dc2626)",borderRadius:11,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:loading?0.75:1}}>
            {loading?<><span style={{width:13,height:13,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>Deleting...</>:<><Ic p={P.trash} s={13}/>Yes, Delete</>}
          </button>
          <button onClick={onClose} className="btn" style={{flex:1,padding:"12px",borderRadius:11,background:th.card,border:`1px solid ${th.border}`,color:th.sub,fontSize:13,fontWeight:600}}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AddUserModal({th,isAr,adminFetch,isSuperAdmin,onClose,onDone}){
  const YEARS=["الفرقة الأولى","الفرقة الثانية","الفرقة الثالثة","الفرقة الرابعة","الفرقة الخامسة","الفرقة السادسة","دراسات عليا"];
  const[role,setRole]=useState("student");
  const[form,setForm]=useState({full_name:"",email:"",password:"",national_id:"",university:"بنها",faculty:"",year:YEARS[0],phone:"",is_super:false});
  const[errors,setErrors]=useState({});
  const[err,setErr]=useState("");const[loading,setLoading]=useState(false);const[done,setDone]=useState(false);
  const[showPw,setShowPw]=useState(false);
  const canvasRef=useRef(null);

  useEffect(()=>{
    const cv=canvasRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); let raf;
    const resize=()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;};
    resize(); window.addEventListener("resize",resize);
    const cols=["rgba(13,148,136,","rgba(99,102,241,","rgba(6,182,212,"];
    const orbs=[{px:.1,py:.15,r:160,c:"rgba(13,148,136,"},{px:.9,py:.2,r:140,c:"rgba(99,102,241,"},{px:.5,py:.95,r:150,c:"rgba(6,182,212,"}];
    const pts=Array.from({length:45},()=>({x:Math.random()*800,y:Math.random()*900,r:Math.random()*1.6+0.3,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*.45+.2}));
    let t=0;
    const draw=()=>{
      ctx.clearRect(0,0,cv.width,cv.height); t+=.003;
      orbs.forEach((o,i)=>{
        const ox=o.px*cv.width+Math.sin(t+i*1.3)*30,oy=o.py*cv.height+Math.cos(t+i*.9)*22;
        const g=ctx.createRadialGradient(ox,oy,0,ox,oy,o.r);
        g.addColorStop(0,o.c+"0.12)");g.addColorStop(.5,o.c+"0.05)");g.addColorStop(1,"transparent");
        ctx.fillStyle=g;ctx.beginPath();ctx.arc(ox,oy,o.r,0,Math.PI*2);ctx.fill();
      });
      pts.forEach(p=>{
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.c+p.a+")";ctx.fill();
        p.x+=p.vx;p.y+=p.vy;
        if(p.x<0||p.x>cv.width)p.vx*=-1;if(p.y<0||p.y>cv.height)p.vy*=-1;
      });
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
        const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
        if(d<80){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(255,255,255,${.04*(1-d/80)})`;ctx.lineWidth=.5;ctx.stroke();}
      }
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[]);

  const set=k=>e=>{ const v=e.target.type==="checkbox"?e.target.checked:e.target.value; setForm(f=>({...f,[k]:v})); setErrors(p=>p[k]?{...p,[k]:""}:p); };

  const validate=()=>{
    const e={};
    if(!form.full_name.trim())e.full_name="Required";
    if(!form.email.includes("@"))e.email="Invalid email";
    if(form.password.length<6)e.password="Min 6 characters";
    if(role==="student"){
      if(!/^\d{14}$/.test(form.national_id))e.national_id="14 digits required";
      if(!form.university.trim())e.university="Required";
      if(!form.faculty.trim())e.faculty="Required";
    }
    return e;
  };

  const submit=async()=>{
    const ve=validate(); setErrors(ve);
    if(Object.keys(ve).length)return;
    setErr("");setLoading(true);
    try{
      const body={role,full_name:form.full_name.trim(),email:form.email.trim(),password:form.password};
      if(role==="student"){
        body.national_id=form.national_id.trim();body.university=form.university.trim();
        body.faculty=form.faculty.trim();body.year=form.year;
      } else {
        body.phone=form.phone.trim();
        body.national_id=form.national_id.trim();
        body.is_super=form.is_super;
      }
      const res=await adminFetch("/api/admin/create-user",{method:"POST",body:JSON.stringify(body)});
      const data=await res.json();
      if(!res.ok){setErr(data.detail||"An error occurred");setLoading(false);return;}
      setDone(true);setTimeout(()=>{onDone();onClose();},1800);
    }catch{setErr("Cannot connect to server.");}
    setLoading(false);
  };

  const Fld=({label,fkey,type="text",ph="",max,isSelect,opts})=>{
    const isP=fkey==="password";
    return(
      <div style={{display:"flex",flexDirection:"column",gap:4}}>
        <label style={{fontSize:10,fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",color:"rgba(180,195,215,0.88)",fontFamily:"'Space Grotesk',sans-serif"}}>{label}</label>
        <div style={{position:"relative",background:errors[fkey]?"rgba(239,68,68,0.04)":"rgba(255,255,255,0.04)",border:`1px solid ${errors[fkey]?"rgba(239,68,68,0.5)":"rgba(255,255,255,0.08)"}`,borderRadius:9,padding:"8px 10px 8px 30px",transition:"border-color .18s,background .18s,box-shadow .18s"}}
          onFocus={()=>{}}>
          <div style={{position:"absolute",left:9,top:"50%",transform:"translateY(-50%)",color:"rgba(122,143,168,.45)",display:"flex",pointerEvents:"none"}}>
            {fkey==="full_name"&&<Ic p={P.user} s={12}/>}
            {fkey==="email"&&<Ic p={P.email} s={12}/>}
            {(fkey==="password")&&<Ic p={P.lock} s={12}/>}
            {fkey==="national_id"&&<Ic p={P.id} s={12}/>}
            {fkey==="phone"&&<Ic p={P.bell} s={12}/>}
            {(fkey==="university"||fkey==="faculty")&&<Ic p={P.book} s={12}/>}
            {fkey==="year"&&<Ic p={P.star} s={12}/>}
          </div>
          {isSelect?(
            <select value={form[fkey]} onChange={set(fkey)} style={{width:"100%",background:"transparent",border:"none",outline:"none",color:form[fkey]?"#f0eef9":"rgba(61,74,92,0.75)",fontSize:"12.5px",appearance:"none",paddingRight:"20px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              <option value="" disabled>{ph}</option>
              {(opts||YEARS).map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          ):(
            <input type={isP?(showPw?"text":"password"):(type||"text")} value={form[fkey]} onChange={set(fkey)} placeholder={ph} maxLength={max}
              style={{width:"100%",background:"transparent",border:"none",outline:"none",color:"#f0eef9",fontSize:"12.5px",fontFamily:"'Plus Jakarta Sans',sans-serif",paddingRight:isP?"24px":"0"}}/>
          )}
          {isP&&<button type="button" onClick={()=>setShowPw(s=>!s)} style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(122,143,168,.5)",padding:2,display:"flex"}}><Ic p={showPw?P.star:P.lock} s={12}/></button>}
        </div>
        {errors[fkey]&&<div style={{fontSize:10.5,color:"rgba(239,68,68,.85)",display:"flex",alignItems:"center",gap:4}}><Ic p={P.alert} s={10}/>{errors[fkey]}</div>}
      </div>
    );
  };

  const Sep=({label})=>(
    <div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0 8px"}}>
      <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
      <span style={{fontSize:8.5,fontWeight:700,letterSpacing:".1em",textTransform:"uppercase",color:"#344055",whiteSpace:"nowrap",fontFamily:"'Space Grotesk',sans-serif"}}>{label}</span>
      <div style={{flex:1,height:1,background:"rgba(255,255,255,0.06)"}}/>
    </div>
  );

  return(
    <div style={{position:"fixed",inset:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
      <canvas ref={canvasRef} style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}/>
      <div style={{position:"absolute",inset:0,background:"rgba(7,9,15,0.92)"}} onClick={onClose}/>
      <div style={{position:"relative",zIndex:2,width:"100%",maxWidth:540,margin:"16px",maxHeight:"92vh",overflowY:"auto",animation:"scaleIn 0.3s ease"}}>
        <div style={{background:"rgba(10,14,26,0.72)",border:"1px solid rgba(255,255,255,0.11)",borderRadius:22,padding:"22px 24px 20px",backdropFilter:"blur(28px)",WebkitBackdropFilter:"blur(28px)",boxShadow:"0 8px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.06)"}}>
          {done?(
            <div style={{textAlign:"center",padding:"28px 0",animation:"checkPop .55s cubic-bezier(.34,1.56,.64,1)"}}>
              <div style={{width:70,height:70,borderRadius:"50%",background:"rgba(34,197,94,0.12)",border:"2px solid rgba(34,197,94,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px"}}><Ic p={P.check} s={30} color="#22c55e"/></div>
              <p style={{fontSize:16,fontWeight:800,color:"#f0eef9",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{role==="student"?"Student created!":"Admin created!"}</p>
            </div>
          ):(
            <>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{display:"flex",alignItems:"center",gap:9}}>
                  <div style={{width:32,height:32,borderRadius:9,background:"linear-gradient(135deg,#0d9488,#0f766e)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic p={P.bookOpen} s={15} color="#fff"/></div>
                  <div><p style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:14,fontWeight:700,color:"#f0eef9",letterSpacing:"-.3px"}}>Biblio<span style={{color:"#0d9488"}}>Tech</span></p><p style={{fontSize:8,color:"#2a3548",letterSpacing:".08em",fontFamily:"'Space Grotesk',sans-serif"}}>ADD NEW USER</p></div>
                </div>
                <button onClick={onClose} style={{width:28,height:28,borderRadius:8,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"rgba(139,154,176,.7)"}}><Ic p={P.xO} s={13}/></button>
              </div>
              <div style={{display:"flex",gap:7,marginBottom:14}}>
                {(isSuperAdmin?[["student","👨‍🎓 Student"],["admin","🛡️ Admin"]]:[["student","👨‍🎓 Student"]]).map(([id,label])=>(
                  <button key={id} onClick={()=>{setRole(id);setErrors({});setErr("");}}
                    style={{flex:1,padding:"9px",borderRadius:10,border:`1px solid ${role===id?"rgba(13,148,136,0.6)":"rgba(255,255,255,0.07)"}`,background:role===id?"rgba(13,148,136,0.15)":"rgba(255,255,255,0.03)",color:role===id?"#2dd4bf":"rgba(139,154,176,.7)",fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",cursor:"pointer",transition:"all .18s"}}>
                    {label}
                  </button>
                ))}
              </div>
              {role==="student"&&(
                <>
                  <Sep label="Personal Info"/>
                  <div style={{marginBottom:8}}><Fld label="Full Name" fkey="full_name" ph="Ahmed Mohamed Ali"/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <Fld label="Email" fkey="email" type="email" ph="user@email.com"/>
                    <Fld label="National ID" fkey="national_id" ph="14 digits" max={14}/>
                  </div>
                  <Sep label="University"/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                    <Fld label="University" fkey="university" ph="Benha"/>
                    <Fld label="Faculty" fkey="faculty" ph="Computers"/>
                    <Fld label="Year" fkey="year" isSelect ph="Select year"/>
                  </div>
                  <Sep label="Password"/>
                  <Fld label="Password" fkey="password" ph="Min 6 characters"/>
                </>
              )}
              {role==="admin"&&(
                <>
                  <Sep label="Admin Info"/>
                  <div style={{marginBottom:8}}><Fld label="Full Name" fkey="full_name" ph="Library Manager"/></div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <Fld label="Email" fkey="email" type="email" ph="manager@benha.edu.eg"/>
                    <Fld label="Phone" fkey="phone" ph="+20 1XX XXX XXXX"/>
                  </div>
                  <div style={{marginBottom:8}}><Fld label="National ID" fkey="national_id" ph="14-digit ID" max={14}/></div>
                  <Sep label="Access Level"/>
                  <div style={{display:"flex",gap:8,marginBottom:8}}>
                    {[["admin","🛡️ Admin","Regular access — manage students & books"],["super","⭐ Super Admin","Full access — manage all admins & passwords"]].map(([id,label,desc])=>(
                      <button key={id} onClick={()=>setForm(f=>({...f,is_super:id==="super"}))}
                        style={{flex:1,padding:"10px 12px",borderRadius:11,border:`1px solid ${(id==="super"?form.is_super:!form.is_super)?"rgba(13,148,136,0.55)":"rgba(255,255,255,0.07)"}`,background:(id==="super"?form.is_super:!form.is_super)?"rgba(13,148,136,0.12)":"rgba(255,255,255,0.03)",cursor:"pointer",textAlign:"left",transition:"all .18s"}}>
                        <p style={{fontSize:11,fontWeight:700,color:(id==="super"?form.is_super:!form.is_super)?"#2dd4bf":"rgba(139,154,176,.8)",fontFamily:"'Space Grotesk',sans-serif",marginBottom:3}}>{label}</p>
                        <p style={{fontSize:9,color:"rgba(61,74,92,.9)",lineHeight:1.4}}>{desc}</p>
                      </button>
                    ))}
                  </div>
                  <Sep label="Password"/>
                  <Fld label="Password" fkey="password" ph="Min 6 characters"/>
                </>
              )}
              {err&&<div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:9,padding:"8px 12px",marginTop:8,display:"flex",alignItems:"center",gap:8}}><Ic p={P.alert} s={13} color="rgba(239,68,68,.85)"/><p style={{fontSize:11.5,color:"rgba(239,68,68,.9)"}}>{err}</p></div>}
              <button onClick={submit} disabled={loading}
                style={{width:"100%",marginTop:12,background:"linear-gradient(135deg,#0d9488 0%,#0891b2 50%,#6366f1 100%)",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,letterSpacing:".02em",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:loading?"not-allowed":"pointer",fontFamily:"'Space Grotesk',sans-serif",boxShadow:"0 5px 22px rgba(13,148,136,.28),0 2px 8px rgba(99,102,241,.18)",position:"relative",overflow:"hidden",opacity:loading?.6:1,transition:"opacity .2s,transform .15s"}}>
                <span style={{content:"''",position:"absolute",top:"-50%",left:"-60%",width:"35%",height:"200%",background:"rgba(255,255,255,.13)",transform:"skewX(-20deg)",animation:"shimBtn 3s ease-in-out infinite",pointerEvents:"none"}}/>
                {loading?<><span style={{width:13,height:13,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite",display:"inline-block"}}/>Creating...</>:<>Create {role==="admin"?"Admin":"Student"}<Ic p={P.arrowR} s={14} color="#fff"/></>}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EditUserModal({th,isAr,user,userRole,adminFetch,isSuperAdmin,onClose,onDone}){
  const YEARS=["الفرقة الأولى","الفرقة الثانية","الفرقة الثالثة","الفرقة الرابعة","الفرقة الخامسة","الفرقة السادسة","دراسات عليا"];
  const[form,setForm]=useState({
    full_name:user.name||"", email:user.email||"",
    department:user.dept||"", university:user.university||"",
    faculty:user.faculty||"", year:user.year||YEARS[0],
    status:user.status||"active", new_password:""
  });
  const[err,setErr]=useState("");const[loading,setLoading]=useState(false);const[done,setDone]=useState(false);
  const set=k=>e=>setForm(f=>({...f,[k]:e.target.value}));
  const fld=(label,key,type="text",readOnly=false)=>(
    <div style={{marginBottom:11}}>
      <label style={{fontSize:9,fontWeight:700,color:th.sub,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{label}{readOnly&&<span style={{marginLeft:6,fontSize:8,background:th.card,color:th.muted,padding:"1px 6px",borderRadius:5}}>Read-only</span>}</label>
      <input type={type} value={form[key]} onChange={set(key)} disabled={readOnly}
        style={{width:"100%",background:readOnly?th.bg:th.card,border:`1px solid ${readOnly?th.border+"88":th.border}`,borderRadius:10,padding:"10px 13px",color:readOnly?th.muted:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",cursor:readOnly?"default":"text",transition:"border-color 0.2s"}}
        onFocus={e=>{if(!readOnly)e.target.style.borderColor=th.prime+"66"}} onBlur={e=>{e.target.style.borderColor=th.border}}/>
    </div>
  );
  const submit=async()=>{
    setErr("");setLoading(true);
    try{
      const body={target_role:userRole,target_id:user.id,
        full_name:form.full_name||undefined, email:form.email||undefined,
        new_password:(isSuperAdmin&&form.new_password)||undefined};
      if(userRole==="student"){
        body.department=form.department||undefined;
        body.university=form.university||undefined;
        body.faculty=form.faculty||undefined;
        body.year=form.year||undefined;
        body.status=form.status||undefined;
      }
      const res=await adminFetch("/api/admin/update-user",{method:"PUT",body:JSON.stringify(body)});
      const data=await res.json();
      if(!res.ok){setErr(data.detail||"Update failed");setLoading(false);return;}
      setDone(true);setTimeout(()=>{onDone();onClose();},1600);
    }catch{setErr("Cannot connect to server.");}
    setLoading(false);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(8px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:20,padding:"26px 28px",width:"100%",maxWidth:520,maxHeight:"90vh",overflowY:"auto",animation:"scaleIn 0.25s ease",direction:"ltr"}} onClick={e=>e.stopPropagation()}>
        {done?(
          <div style={{textAlign:"center",padding:"20px 0"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:th.green+"18",border:`2px solid ${th.green}44`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 14px",color:th.green}}>
              <Ic p={P.checkO} s={28} color={th.green}/>
            </div>
            <p style={{fontSize:15,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>Updated! Email notification sent.</p>
          </div>
        ):(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
              <h3 style={{fontSize:17,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:8}}>
                <Ic p={P.settings} s={15} color={th.prime}/>
                Edit {userRole==="admin"?"Admin":"Student"}: <span style={{color:th.prime,marginLeft:4}}>{user.name}</span>
              </h3>
              <button onClick={onClose} className="btn" style={{width:28,height:28,borderRadius:8,background:th.card,border:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.sub}}><Ic p={P.xO} s={13}/></button>
            </div>
            <div style={{background:th.prime+"12",border:`1px solid ${th.prime}30`,borderRadius:11,padding:"10px 14px",marginBottom:16,display:"flex",alignItems:"center",gap:9}}>
              <div style={{width:36,height:36,borderRadius:10,background:`${user.color||th.prime}22`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:user.color||th.prime,flexShrink:0,fontFamily:"'Space Grotesk',sans-serif"}}>{user.name[0]}</div>
              <div><p style={{fontSize:12,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{user.name}</p><p style={{fontSize:11,color:th.sub}}>{user.libId||user.username} · {user.email}</p></div>
              <div style={{marginLeft:"auto",background:"#f59e0b18",border:"1px solid #f59e0b33",borderRadius:8,padding:"4px 10px",fontSize:10,fontWeight:700,color:"#f59e0b",fontFamily:"'Space Grotesk',sans-serif"}}>📧 Email on save</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
              <div style={{gridColumn:"1/-1"}}>{fld("Full Name","full_name")}</div>
              {fld("Email","email","email")}
              {isSuperAdmin&&fld("New Password (optional)","new_password","password")}
            </div>
            {userRole==="student"&&(
              <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
                  {fld("Faculty","faculty")}
                  {fld("University","university")}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>
                  <div style={{marginBottom:11}}>
                    <label style={{fontSize:9,fontWeight:700,color:th.sub,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>Academic Year</label>
                    <select value={form.year} onChange={set("year")} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"10px 13px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}>
                      {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div style={{marginBottom:11}}>
                    <label style={{fontSize:9,fontWeight:700,color:th.sub,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>Status</label>
                    <select value={form.status} onChange={set("status")} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"10px 13px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            {err&&<div style={{background:th.red+"12",border:`1px solid ${th.red}30`,borderRadius:10,padding:"10px 14px",marginBottom:12,fontSize:12,color:th.red}}>{err}</div>}
            <div style={{display:"flex",gap:9,marginTop:6}}>
              <button onClick={submit} disabled={loading} className="btn"
                style={{flex:1,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:11,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,opacity:loading?0.75:1}}>
                {loading?<><span style={{width:13,height:13,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>Saving...</>:<><Ic p={P.checkO} s={14}/>Save Changes</>}
              </button>
              <button onClick={onClose} className="btn" style={{padding:"12px 20px",borderRadius:11,background:th.card,border:`1px solid ${th.border}`,color:th.sub,fontSize:13}}>Cancel</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StudentDetailModal({th,t,isAr,student,allReqs,BOOKS,onClose}){
  const[tab,setTab]=useState("active");
  const enrichWithCover=reqs=>reqs.map(r=>{
    if(r.bCover)return r;
    const bk=BOOKS.find(b=>b.id===r.bid);
    return{...r,bCover:bk?bk.cover:["#1a1a2e","#16213e"]};
  });
  const myReqs=enrichWithCover(allReqs.filter(r=>r.sid===student.libId));
  const active=myReqs.filter(r=>r.status==="approved"&&!r.returnDate);
  const pending=myReqs.filter(r=>r.status==="pending");
  const history=myReqs.filter(r=>r.returnDate||r.status==="rejected");
  const susp=student.status==="suspended";
  const tabs=[[t.activeTab,active.length,"active"],[t.pending,pending.length,"pending"],[t.historyTab,history.length,"history"]];
  const rows=tab==="active"?active:tab==="pending"?pending:history;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
    <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:22,width:"100%",maxWidth:560,maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column",animation:"scaleIn 0.25s ease"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"20px 22px 16px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",gap:14,flexDirection:"row"}}>
        <div style={{width:52,height:52,borderRadius:15,background:`${student.color}22`,border:`2px solid ${student.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:student.color,fontFamily:"'Space Grotesk',sans-serif",flexShrink:0}}>{student.name[0]}</div>
        <div style={{flex:1,textAlign:isAr?"right":"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexDirection:"row"}}>
            <h2 style={{fontSize:16,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{student.name}</h2>
            <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,background:susp?th.red+"18":th.green+"18",color:susp?th.red:th.green,border:`1px solid ${susp?th.red:th.green}44`,textTransform:"capitalize",fontFamily:"'Space Grotesk',sans-serif"}}>{student.status}</span>
          </div>
          <p style={{fontSize:11,color:th.sub}}>{student.libId} · {student.dept}</p>
          <p style={{fontSize:11,color:th.muted,marginTop:1}}>{student.email} · {t.joined}: {student.joined}</p>
        </div>
        <button onClick={onClose} className="btn" style={{width:30,height:30,borderRadius:8,border:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.muted,flexShrink:0}}><Ic p={P.xO} s={14}/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderBottom:`1px solid ${th.border}`}}>
        {[[String(active.length),t.activeLoans,th.prime],[String(pending.length),t.pending,th.amber],[String(history.filter(r=>r.returnDate).length),t.totalBorrowed||"Total Read",th.cyan]].map(([v,l,c],i)=>(
          <div key={i} style={{padding:"12px 14px",textAlign:"center",borderRight:i<2?`1px solid ${th.border}`:"none"}}><p style={{fontSize:19,fontWeight:700,color:c,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</p><p style={{fontSize:10,color:th.sub}}>{l}</p></div>
        ))}
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${th.border}`}}>
        {tabs.map(([lbl,cnt,id])=>(<button key={id} onClick={()=>setTab(id)} className="btn" style={{flex:1,padding:"10px 8px",fontSize:11,fontWeight:tab===id?700:400,color:tab===id?th.prime:th.sub,borderBottom:`2px solid ${tab===id?th.prime:"transparent"}`,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
          {lbl}{cnt>0&&<span style={{fontSize:9,fontWeight:700,background:tab===id?th.prime+"22":th.muted+"33",color:tab===id?th.prime:th.sub,borderRadius:20,padding:"1px 5px"}}>{cnt}</span>}
        </button>))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
        {rows.length===0
          ?<p style={{textAlign:"center",color:th.muted,padding:"28px",fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{tab==="active"?t.noActiveLoans:tab==="pending"?t.noRequests:t.noHistory}</p>
          :rows.map((r,i)=>{
            const days=daysLeft(r.dueDateISO);
            const c=r.status==="rejected"?th.red:r.status==="pending"?th.amber:r.returnDate?th.cyan:daysColor(days,th);
            const lbl=r.status==="rejected"?t.rejected:r.status==="pending"?t.pending:r.returnDate?t.returned:"Active";
            return(<div key={r.id} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:11,padding:"12px 14px",marginBottom:9,display:"flex",alignItems:"center",gap:12,animation:`fadeUp 0.3s ${i*40}ms ease both`,flexDirection:"row"}}>
              <div style={{width:36,height:50,borderRadius:7,overflow:"hidden",flexShrink:0}}><Cover colors={r.bCover} h={50}/></div>
              <div style={{flex:1,minWidth:0,textAlign:isAr?"right":"left"}}>
                <p style={{fontSize:12,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.bTitle}</p>
                <p style={{fontSize:10,color:th.sub,marginTop:2}}>{r.bAuthor}</p>
                <p style={{fontSize:10,color:th.muted,marginTop:2}}>{r.returnDate?`${t.returned}: ${r.returnDate}`:r.dueDate?`${t.returnBy}: ${r.dueDate}`:`${t.reqDate}: ${r.reqDate}`}</p>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                {tab==="active"&&days!==null
                  ?<><p style={{fontSize:16,fontWeight:700,color:daysColor(days,th),fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{Math.abs(days)}</p><p style={{fontSize:9,color:daysColor(days,th),marginTop:2}}>{days<0?"overdue":"days"}</p></>
                  :<span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,background:`${c}18`,color:c,border:`1px solid ${c}44`,fontFamily:"'Space Grotesk',sans-serif"}}>{lbl}</span>
                }
              </div>
            </div>);
          })
        }
      </div>
    </div>
  </div>);}
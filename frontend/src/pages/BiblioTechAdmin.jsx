import { useState, useEffect } from "react";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { getRequests, updateRequest, adminLogin, adminLogout, isAdminLoggedIn } from "../store.js";

/* ═══════════════════════════════════════════════════════════════
   BIBLIO TECH — Admin Panel  v4
   Redesigned dashboard · Fixed chart colors · Dark theme
═══════════════════════════════════════════════════════════════ */

const A = {
  bg:"#07090f", surface:"#0f1219", card:"#141824", card2:"#1a1f2e",
  border:"rgba(255,255,255,0.07)",
  prime:"#0d9488", primeL:"#14b8a6", primeD:"#0f766e", primeG:"#0d948822",
  accent:"#6366f1", accentG:"#6366f118",
  cyan:"#06b6d4", cyanG:"#06b6d418",
  green:"#22c55e", greenG:"#22c55e18",
  red:"#ef4444", redG:"#ef444418",
  amber:"#f59e0b", amberG:"#f59e0b18",
  violet:"#8b5cf6", violetG:"#8b5cf618",
  pink:"#ec4899",
  text:"#f0eef9", sub:"#8b9ab0", muted:"#3d4a5c", dim:"#151b28",
};

const Ic=({p,s=18,fill=false,color="currentColor"})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill?color:"none"}
    stroke={fill?"none":color} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
    {(Array.isArray(p)?p:[p]).map((d,i)=><path key={i} d={d}/>)}
  </svg>
);

const P={
  bookOpen:["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z","M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  dash:["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],
  books:["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"],
  borrow:["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"],
  students:["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M23 21v-2a4 4 0 0 0-3-3.87","M16 3.13a4 4 0 0 1 0 7.75","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  requests:["M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2","M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2","M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2","M9 12h6","M9 16h4"],
  announce:["M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"],
  logout:["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],
  lock:["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
  user:["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  check:"M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  x:"M15 9l-6 6M9 9l6 6M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",
  plus:"M12 5v14M5 12h14",
  edit:["M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7","M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"],
  trash:["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"],
  alert:["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
  clock:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 6v6l4 2"],
  eye:["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6"],
  search:"M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  shield:["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],
  trend:"M23 6l-9.5 9.5-5-5L1 18",
  arrowUp:"M12 19V5M5 12l7-7 7 7",
  arrowDown:"M12 5v14M5 12l7 7 7-7",
  spark:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  megaphone:["M3 11l19-9-9 19-2-8-8-2z"],
};

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#07090f;overflow-x:hidden;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#1a2035;border-radius:6px;}
  input::placeholder{color:#243050;}select option{background:#141824;}
  textarea::placeholder{color:#243050;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  @keyframes glow{0%,100%{box-shadow:0 0 22px #0d948838}50%{box-shadow:0 0 50px #0d948868}}
  @keyframes slideRight{from{width:0}to{width:var(--w)}}
  .abtn{transition:all 0.2s ease;cursor:pointer;border:none;background:none;}
  .abtn:hover{filter:brightness(1.1);transform:translateY(-1px);}
  .abtn:active{transform:scale(0.97);}
  .arow:hover{background:rgba(255,255,255,0.025)!important;}
  .ainp:focus{outline:none;border-color:#0d948866!important;}
`;

// ── DATA ─────────────────────────────────────────────────────────
const MONTHLY=[
  {m:"Aug",borrows:42,returns:38},{m:"Sep",borrows:58,returns:51},
  {m:"Oct",borrows:71,returns:65},{m:"Nov",borrows:85,returns:79},
  {m:"Dec",borrows:63,returns:58},{m:"Jan",borrows:94,returns:87},
  {m:"Feb",borrows:108,returns:99},{m:"Mar",borrows:124,returns:112},
];
const WEEKLY=[
  {d:"Mon",borrows:18},{d:"Tue",borrows:24},{d:"Wed",borrows:31},
  {d:"Thu",borrows:22},{d:"Fri",borrows:35},{d:"Sat",borrows:14},{d:"Sun",borrows:8},
];
const DEPT_STATS=[
  {dept:"Engineering",books:842,color:"#f97316"},
  {dept:"Medicine",books:671,color:"#ef4444"},
  {dept:"CS",books:589,color:"#3b82f6"},
  {dept:"Pharmacy",books:423,color:"#8b5cf6"},
  {dept:"Science",books:398,color:"#06b6d4"},
  {dept:"Commerce",books:312,color:"#22c55e"},
  {dept:"Arts",books:287,color:"#ec4899"},
  {dept:"Law",books:299,color:"#f59e0b"},
];
const STUDENTS=[
  {id:"STD-001",name:"Ahmed Youssef",dept:"Computer Science",email:"ahmed@library.edu",loans:12,active:2,status:"active"},
  {id:"STD-002",name:"Sara Hassan",dept:"Medicine",email:"sara@library.edu",loans:8,active:1,status:"active"},
  {id:"STD-003",name:"Omar Khalil",dept:"Engineering",email:"omar@library.edu",loans:15,active:3,status:"active"},
  {id:"STD-004",name:"Nour Ibrahim",dept:"Pharmacy",email:"nour@library.edu",loans:5,active:0,status:"suspended"},
  {id:"STD-005",name:"Yasser Ali",dept:"Commerce",email:"yasser@library.edu",loans:9,active:2,status:"active"},
  {id:"STD-006",name:"Mona Saad",dept:"Arts",email:"mona@library.edu",loans:3,active:1,status:"active"},
];
const BOOKS_DATA=[
  {id:"B001",title:"Calculus: Early Transcendentals",author:"James Stewart",dept:"Engineering",status:"available",copies:3,borrowed:1,added:"Jan 15, 2024"},
  {id:"B002",title:"Gray's Anatomy",author:"Henry Gray",dept:"Medicine",status:"borrowed",copies:2,borrowed:2,added:"Mar 02, 2023"},
  {id:"B003",title:"Introduction to Algorithms",author:"Cormen et al.",dept:"Computer Science",status:"available",copies:4,borrowed:1,added:"Jun 10, 2023"},
  {id:"B004",title:"Organic Chemistry",author:"Paula Y. Bruice",dept:"Pharmacy",status:"available",copies:2,borrowed:0,added:"Sep 20, 2023"},
  {id:"B005",title:"Principles of Physics",author:"Serway & Jewett",dept:"Science",status:"reserved",copies:3,borrowed:2,added:"Feb 14, 2024"},
  {id:"B006",title:"Clean Code",author:"Robert C. Martin",dept:"Computer Science",status:"available",copies:5,borrowed:2,added:"Apr 01, 2023"},
];
const TXNS=[
  {id:"TXN-001",student:"Ahmed Youssef",studentId:"STD-001",book:"Introduction to Algorithms",dept:"CS",borrowed:"Feb 20",due:"Mar 06",daysLeft:-2,status:"overdue"},
  {id:"TXN-002",student:"Sara Hassan",studentId:"STD-002",book:"Gray's Anatomy",dept:"Medicine",borrowed:"Feb 25",due:"Mar 11",daysLeft:5,status:"active"},
  {id:"TXN-003",student:"Omar Khalil",studentId:"STD-003",book:"Calculus",dept:"Engineering",borrowed:"Mar 01",due:"Mar 15",daysLeft:9,status:"active"},
  {id:"TXN-004",student:"Mona Saad",studentId:"STD-006",book:"Organic Chemistry",dept:"Pharmacy",borrowed:"Feb 10",due:"Feb 24",daysLeft:-10,status:"overdue"},
  {id:"TXN-005",student:"Yasser Ali",studentId:"STD-005",book:"Business Law",dept:"Law",borrowed:"Mar 03",due:"Mar 17",daysLeft:11,status:"active"},
];

const ANNOUNCEMENTS_KEY = "bt_announcements";
const getAnnouncements=()=>{try{return JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY)||"[]");}catch{return [];}};
const saveAnnouncements=(a)=>localStorage.setItem(ANNOUNCEMENTS_KEY,JSON.stringify(a));

const statusColor=s=>({available:"#22c55e",borrowed:"#ef4444",reserved:"#f59e0b",active:"#22c55e",overdue:"#ef4444",suspended:"#ef4444"}[s]||"#64748b");
const deptColor=d=>({Engineering:"#f97316",Medicine:"#ef4444",Pharmacy:"#8b5cf6",Science:"#06b6d4",Arts:"#ec4899",Law:"#f59e0b",Commerce:"#22c55e","Computer Science":"#3b82f6",Architecture:"#a78bfa"}[d]||"#64748b");
const avatarColor=name=>["#6366f1","#0d9488","#f97316","#8b5cf6","#06b6d4","#22c55e"][name.charCodeAt(0)%6];

// ── MINI SPARKLINE ────────────────────────────────────────────────
function Spark({data,color}){
  return(
    <ResponsiveContainer width="100%" height={44}>
      <AreaChart data={data} margin={{top:2,right:0,bottom:0,left:0}}>
        <defs>
          <linearGradient id={`sg${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} fill={`url(#sg${color.replace("#","")})`}
          strokeWidth={2} dot={false}/>
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── BIG STAT CARD (inspired by screenshot) ───────────────────────
function BigStat({label,value,sub,change,up,accent,sparkData,icon,delay=0}){
  const c=accent||A.prime;
  const sparkFormatted=sparkData?.map(v=>({v}));
  return(
    <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,
      padding:"24px 26px",animation:`fadeUp 0.4s ${delay}ms ease both`,
      position:"relative",overflow:"hidden",display:"flex",flexDirection:"column",gap:0}}>
      {/* Subtle glow */}
      <div style={{position:"absolute",top:-40,right:-40,width:130,height:130,
        borderRadius:"50%",background:`${c}0c`,pointerEvents:"none"}}/>
      {/* Top row */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,borderRadius:12,background:`${c}18`,
            display:"flex",alignItems:"center",justifyContent:"center",color:c}}>
            <Ic p={icon} s={18}/>
          </div>
          <span style={{fontSize:13,color:A.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{label}</span>
        </div>
        <span style={{fontSize:11,fontWeight:700,padding:"3px 9px",borderRadius:20,
          background:up?A.greenG:A.redG,color:up?A.green:A.red,
          fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:4}}>
          <Ic p={up?P.arrowUp:P.arrowDown} s={10}/>{change}
        </span>
      </div>
      {/* Big number */}
      <p style={{fontSize:36,fontWeight:700,color:A.text,
        fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.03em",
        lineHeight:1,marginBottom:4}}>{value}</p>
      {sub&&<p style={{fontSize:12,color:A.muted,fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:10}}>{sub}</p>}
      {/* Sparkline */}
      {sparkFormatted&&<div style={{marginTop:"auto",paddingTop:8}}>
        <Spark data={sparkFormatted} color={c}/>
      </div>}
    </div>
  );
}

// ── ADMIN LOGIN ──────────────────────────────────────────────────
function AdminLogin({onLogin}){
  const[user,setUser]=useState("");const[pass,setPass]=useState("");
  const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const submit=()=>{
    if(!user||!pass){setErr("Please fill in all fields.");return;}
    setLoading(true);setErr("");
    setTimeout(()=>{
      setLoading(false);
      if(adminLogin(user,pass)){onLogin();}else{setErr("Invalid username or password.");}
    },1200);
  };
  return(
    <div style={{minHeight:"100vh",background:A.bg,display:"flex",alignItems:"center",
      justifyContent:"center",position:"relative",overflow:"hidden",
      fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{position:"absolute",top:"-15%",right:"-10%",width:500,height:500,
        borderRadius:"50%",background:A.prime+"0e",filter:"blur(130px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-15%",left:"-10%",width:400,height:400,
        borderRadius:"50%",background:A.accent+"0b",filter:"blur(110px)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:420,padding:"0 24px",animation:"fadeUp 0.6s ease"}}>
        <div style={{textAlign:"center",marginBottom:48}}>
          <div style={{width:68,height:68,borderRadius:20,margin:"0 auto 22px",
            background:`linear-gradient(135deg,${A.prime},${A.primeD})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 10px 36px ${A.primeG}`,animation:"glow 3s ease infinite",color:"#fff"}}>
            <Ic p={P.shield} s={32}/>
          </div>
          <h1 style={{fontSize:36,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",
            letterSpacing:"-0.03em",color:A.text,lineHeight:1,marginBottom:10}}>
            Admin <span style={{color:A.prime}}>Panel</span>
          </h1>
          <p style={{fontSize:14,color:A.sub}}>BiblioTech Library Management</p>
        </div>
        <div style={{background:A.surface,border:"1px solid rgba(13,148,136,0.15)",
          borderRadius:24,padding:"44px 44px 40px",boxShadow:"0 40px 100px rgba(0,0,0,0.55)"}}>
          <div style={{textAlign:"center",marginBottom:36}}>
            <h2 style={{fontSize:24,fontWeight:700,color:A.text,
              fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:8}}>Staff Sign In</h2>
            <p style={{fontSize:14,color:A.sub,lineHeight:1.6}}>Restricted to authorized library staff only</p>
          </div>
          {[["Username",user,setUser,P.user,"admin","text"],
            ["Password",pass,setPass,P.lock,"••••••••","password"]].map(([label,val,setVal,icon,ph,type])=>(
            <div key={label} style={{marginBottom:20}}>
              <label style={{fontSize:12,color:A.sub,fontWeight:600,letterSpacing:"0.07em",
                textTransform:"uppercase",display:"block",marginBottom:10,
                fontFamily:"'Space Grotesk',sans-serif"}}>{label}</label>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",
                  color:A.muted,pointerEvents:"none"}}><Ic p={icon} s={17}/></div>
                <input className="ainp" type={type} value={val}
                  onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
                  placeholder={ph}
                  style={{width:"100%",background:A.card,border:`1px solid ${A.border}`,
                    borderRadius:13,padding:"16px 16px 16px 48px",
                    color:A.text,fontSize:15,fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
              </div>
            </div>
          ))}
          {err&&<div style={{background:"#ef444415",border:"1px solid #ef444435",
            borderRadius:11,padding:"11px 16px",marginBottom:18}}>
            <p style={{fontSize:13,color:A.red}}>{err}</p>
          </div>}
          <button onClick={submit} className="abtn" disabled={loading}
            style={{width:"100%",background:`linear-gradient(135deg,${A.prime},${A.primeD})`,
              borderRadius:14,padding:"16px",color:"#fff",fontSize:15,fontWeight:700,
              fontFamily:"'Space Grotesk',sans-serif",
              boxShadow:`0 8px 30px ${A.primeG}`,opacity:loading?0.75:1,
              display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            {loading?<><span style={{width:18,height:18,borderRadius:"50%",
              border:"2.5px solid rgba(255,255,255,0.25)",borderTopColor:"#fff",
              animation:"spin 0.7s linear infinite",display:"inline-block"}}/> Signing in...</>
              :<><Ic p={P.shield} s={18}/> Sign In as Admin</>}
          </button>
          <div style={{marginTop:22,padding:"12px 15px",background:A.card,
            border:`1px solid ${A.border}`,borderRadius:12,
            display:"flex",alignItems:"center",gap:10}}>
            <Ic p={P.alert} s={14}/>
            <p style={{fontSize:12,color:A.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Demo: <strong style={{color:A.sub}}>admin</strong> / <strong style={{color:A.sub}}>admin123</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────
function Dashboard({setActive}){
  const requests=getRequests();
  const pending=requests.filter(r=>r.status==="pending").length;
  const sparkB=[42,58,71,85,63,94,108,124];
  const sparkS=[210,224,238,255,267,280,291,308];
  const sparkL=[31,38,44,52,43,61,72,84];

  return(
    <div style={{padding:"32px 36px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      {/* Header */}
      <div style={{marginBottom:32,display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
        <div>
          <p style={{fontSize:13,color:A.muted,marginBottom:6,letterSpacing:"0.06em",
            textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>
            Library Overview
          </p>
          <h1 style={{fontSize:34,fontWeight:700,color:A.text,
            fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",lineHeight:1}}>
            Dashboard
          </h1>
        </div>
        <div style={{fontSize:13,color:A.sub,display:"flex",alignItems:"center",gap:6,
          background:A.card,border:`1px solid ${A.border}`,borderRadius:10,padding:"8px 14px"}}>
          <Ic p={P.clock} s={14}/>
          {new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
        </div>
      </div>

      {/* Pending alert */}
      {pending>0&&(
        <div style={{background:`linear-gradient(135deg,${A.amber}15,${A.amber}08)`,
          border:`1px solid ${A.amber}40`,borderRadius:18,
          padding:"18px 24px",marginBottom:28,
          display:"flex",alignItems:"center",gap:16,
          animation:"fadeUp 0.4s ease",cursor:"pointer"}}
          onClick={()=>setActive("requests")}>
          <div style={{width:44,height:44,borderRadius:14,background:A.amberG,
            display:"flex",alignItems:"center",justifyContent:"center",color:A.amber,flexShrink:0}}>
            <Ic p={P.alert} s={22}/>
          </div>
          <div style={{flex:1}}>
            <p style={{fontSize:15,fontWeight:700,color:A.text,marginBottom:4,
              fontFamily:"'Space Grotesk',sans-serif"}}>
              {pending} Pending Borrow Request{pending>1?"s":""}
            </p>
            <p style={{fontSize:13,color:A.sub}}>Click here to review and approve student requests</p>
          </div>
          <div style={{color:A.amber,fontSize:13,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif",
            display:"flex",alignItems:"center",gap:6}}>
            Review →
          </div>
        </div>
      )}

      {/* Big stat cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18,marginBottom:28}}>
        <BigStat label="Total Books" value="4,821" sub="Across all departments"
          change="+5.2%" up accent={A.prime}
          icon={P.books} sparkData={[800,820,835,850,860,875,890,4821/10]} delay={0}/>
        <BigStat label="Active Members" value="1,247" sub="Registered students"
          change="+12.1%" up accent={A.accent}
          icon={P.students} sparkData={sparkS.map(v=>v/10)} delay={80}/>
        <BigStat label="Active Loans" value="386" sub="Books currently out"
          change="+8.4%" up accent={A.cyan}
          icon={P.borrow} sparkData={sparkL} delay={160}/>
        <BigStat label="Pending Requests" value={String(pending||0)} sub="Awaiting your approval"
          change={pending>0?"Needs review":"All clear"} up={pending===0} accent={A.amber}
          icon={P.requests} sparkData={[0,1,0,2,1,3,2,pending||0]} delay={240}/>
      </div>

      {/* Charts row */}
      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:20,marginBottom:20}}>
        {/* Area chart */}
        <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,padding:"26px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:22}}>
            <div>
              <h3 style={{fontSize:16,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4}}>Monthly Activity</h3>
              <p style={{fontSize:12,color:A.sub}}>Borrows vs Returns over 8 months</p>
            </div>
            <div style={{display:"flex",gap:16,fontSize:12,color:A.sub}}>
              <span style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:10,height:3,borderRadius:2,background:A.prime,display:"inline-block"}}/>Borrows
              </span>
              <span style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{width:10,height:3,borderRadius:2,background:A.accent,display:"inline-block"}}/>Returns
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={A.prime} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={A.prime} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={A.accent} stopOpacity={0.25}/>
                  <stop offset="95%" stopColor={A.accent} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={A.border}/>
              <XAxis dataKey="m" stroke="transparent" tick={{fontSize:11,fill:A.muted,fontFamily:"Space Grotesk"}}/>
              <YAxis stroke="transparent" tick={{fontSize:11,fill:A.muted,fontFamily:"Space Grotesk"}}/>
              <Tooltip contentStyle={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:12,
                fontSize:12,fontFamily:"Space Grotesk",color:A.text}}
                labelStyle={{color:A.sub}} cursor={{stroke:A.prime,strokeOpacity:0.3}}/>
              <Area type="monotone" dataKey="borrows" stroke={A.prime} fill="url(#gB)" strokeWidth={2.5} name="Borrows"/>
              <Area type="monotone" dataKey="returns" stroke={A.accent} fill="url(#gR)" strokeWidth={2} name="Returns"/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart — FIXED with Cell for individual colors */}
        <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,padding:"26px"}}>
          <div style={{marginBottom:22}}>
            <h3 style={{fontSize:16,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4}}>Books by Department</h3>
            <p style={{fontSize:12,color:A.sub}}>Collection distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={DEPT_STATS} layout="vertical" margin={{left:0,right:10}}>
              <CartesianGrid strokeDasharray="3 3" stroke={A.border} horizontal={false}/>
              <XAxis type="number" stroke="transparent"
                tick={{fontSize:10,fill:A.muted,fontFamily:"Space Grotesk"}}/>
              <YAxis dataKey="dept" type="category" stroke="transparent"
                tick={{fontSize:10,fill:A.sub,fontFamily:"Space Grotesk"}} width={70}/>
              <Tooltip contentStyle={{background:A.card2,border:`1px solid ${A.border}`,
                borderRadius:12,fontSize:12,fontFamily:"Space Grotesk",color:A.text}}/>
              <Bar dataKey="books" radius={[0,6,6,0]} maxBarSize={18}>
                {DEPT_STATS.map((entry,index)=>(
                  <Cell key={`cell-${index}`} fill={entry.color}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: weekly + overdue + top books */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1.2fr 1fr",gap:20}}>
        {/* Weekly bar */}
        <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,padding:"26px"}}>
          <h3 style={{fontSize:15,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4}}>This Week</h3>
          <p style={{fontSize:12,color:A.sub,marginBottom:18}}>Daily borrows</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={WEEKLY} margin={{left:-10}}>
              <CartesianGrid strokeDasharray="3 3" stroke={A.border} vertical={false}/>
              <XAxis dataKey="d" stroke="transparent" tick={{fontSize:10,fill:A.muted}}/>
              <YAxis stroke="transparent" tick={{fontSize:10,fill:A.muted}}/>
              <Tooltip contentStyle={{background:A.card2,border:`1px solid ${A.border}`,borderRadius:10,fontSize:12,color:A.text}}/>
              <Bar dataKey="borrows" radius={[6,6,0,0]} maxBarSize={28}>
                {WEEKLY.map((entry,index)=>(
                  <Cell key={index} fill={index===4?A.prime:`${A.prime}55`}/>
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Overdue */}
        <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,padding:"26px"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <div style={{width:32,height:32,borderRadius:10,background:A.redG,
              display:"flex",alignItems:"center",justifyContent:"center",color:A.red}}>
              <Ic p={P.alert} s={16}/>
            </div>
            <div>
              <h3 style={{fontSize:15,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif"}}>Overdue Returns</h3>
              <p style={{fontSize:11,color:A.sub}}>Needs follow-up</p>
            </div>
          </div>
          {TXNS.filter(t=>t.status==="overdue").map((t,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,
              padding:"11px 0",borderBottom:`1px solid ${A.border}`}}>
              <div style={{width:34,height:34,borderRadius:10,flexShrink:0,
                background:avatarColor(t.student)+"22",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:13,fontWeight:700,color:avatarColor(t.student),
                fontFamily:"'Space Grotesk',sans-serif"}}>{t.student[0]}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:600,color:A.text,fontFamily:"'Space Grotesk',sans-serif",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.student}</p>
                <p style={{fontSize:11,color:A.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.book}</p>
              </div>
              <span style={{fontSize:11,fontWeight:700,color:A.red,background:A.redG,
                border:`1px solid ${A.red}44`,padding:"3px 9px",borderRadius:20,
                fontFamily:"'Space Grotesk',sans-serif",flexShrink:0}}>
                +{Math.abs(t.daysLeft)}d
              </span>
            </div>
          ))}
        </div>

        {/* Quick stats */}
        <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,padding:"26px"}}>
          <h3 style={{fontSize:15,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:18}}>Quick Stats</h3>
          {[
            ["Available Books","3,891",A.green,"76% of total"],
            ["Currently Borrowed","683",A.red,"14% of total"],
            ["Reserved","247",A.amber,"5% of total"],
            ["New This Month","42",A.prime,"+8.7% growth"],
          ].map(([label,val,c,note])=>(
            <div key={label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"10px 0",borderBottom:`1px solid ${A.border}`}}>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:c,flexShrink:0}}/>
                <span style={{fontSize:13,color:A.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{label}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <span style={{fontSize:15,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif"}}>{val}</span>
                <p style={{fontSize:10,color:A.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── BORROW REQUESTS ──────────────────────────────────────────────
function BorrowRequestsPage(){
  const[requests,setRequests]=useState([]);
  const[filter,setFilter]=useState("all");
  useEffect(()=>{setRequests(getRequests());},[]);
  const handle=(id,status)=>{updateRequest(id,status);setRequests(getRequests());};
  const filtered=filter==="all"?requests:requests.filter(r=>r.status===filter);
  const counts={all:requests.length,
    pending:requests.filter(r=>r.status==="pending").length,
    approved:requests.filter(r=>r.status==="approved").length,
    declined:requests.filter(r=>r.status==="declined").length};

  return(
    <div style={{padding:"32px 36px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{marginBottom:28}}>
        <p style={{fontSize:13,color:A.muted,marginBottom:6,letterSpacing:"0.06em",
          textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>Review & Approve</p>
        <h1 style={{fontSize:34,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>Borrow Requests</h1>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:28}}>
        {[["all","Total",A.prime,P.requests],["pending","Pending",A.amber,P.alert],
          ["approved","Approved",A.green,P.check],["declined","Declined",A.red,P.x]].map(([id,label,c,icon])=>(
          <div key={id} onClick={()=>setFilter(id)}
            style={{background:filter===id?`${c}15`:A.card,
              border:`1px solid ${filter===id?c+"55":A.border}`,
              borderRadius:18,padding:"20px 22px",cursor:"pointer",transition:"all 0.2s"}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
              <div style={{width:36,height:36,borderRadius:11,background:`${c}20`,
                display:"flex",alignItems:"center",justifyContent:"center",color:c}}>
                <Ic p={icon} s={18}/>
              </div>
            </div>
            <p style={{fontSize:28,fontWeight:700,color:c,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:4}}>{counts[id]}</p>
            <p style={{fontSize:13,color:A.sub}}>{label}</p>
          </div>
        ))}
      </div>
      {filtered.length===0?(
        <div style={{textAlign:"center",padding:"80px 20px",background:A.card,
          border:`1px solid ${A.border}`,borderRadius:20}}>
          <div style={{color:A.muted,display:"flex",justifyContent:"center",marginBottom:16}}>
            <Ic p={P.requests} s={52}/></div>
          <p style={{fontSize:18,fontWeight:700,color:A.text,marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>
            No {filter==="all"?"":filter} requests
          </p>
          <p style={{fontSize:14,color:A.sub}}>
            {filter==="pending"?"All caught up!":"Nothing here yet."}
          </p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {filtered.map((r,i)=>{
            const isPending=r.status==="pending";
            const isApproved=r.status==="approved";
            const sc=isPending?{color:A.amber,bg:A.amberG,border:`${A.amber}44`,label:"Pending"}
              :isApproved?{color:A.green,bg:A.greenG,border:`${A.green}44`,label:"Approved"}
              :{color:A.red,bg:A.redG,border:`${A.red}44`,label:"Declined"};
            return(
              <div key={r.id}
                style={{background:A.card,border:`1px solid ${isPending?A.amber+"30":A.border}`,
                  borderRadius:18,padding:"20px 24px",display:"flex",alignItems:"center",gap:18,
                  animation:`fadeUp 0.4s ${i*60}ms ease both`}}>
                <div style={{width:50,height:50,borderRadius:15,flexShrink:0,
                  background:avatarColor(r.studentName||"A")+"22",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:20,fontWeight:700,color:avatarColor(r.studentName||"A"),
                  fontFamily:"'Space Grotesk',sans-serif"}}>{(r.studentName||"?")[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                    <p style={{fontSize:15,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif"}}>{r.studentName||"Unknown"}</p>
                    <span style={{fontSize:11,color:A.muted,background:A.card2,border:`1px solid ${A.border}`,
                      padding:"2px 8px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>{r.studentId}</span>
                  </div>
                  <p style={{fontSize:14,color:A.sub,marginBottom:5}}>
                    Requesting: <strong style={{color:A.text}}>{r.bookTitle}</strong>
                  </p>
                  <div style={{display:"flex",alignItems:"center",gap:12}}>
                    <span style={{fontSize:12,color:A.muted,display:"flex",alignItems:"center",gap:5}}>
                      <Ic p={P.clock} s={12}/>Requested: {r.date}
                    </span>
                    <span style={{fontSize:12,background:deptColor(r.bookDept)+"22",
                      color:deptColor(r.bookDept),border:`1px solid ${deptColor(r.bookDept)}40`,
                      padding:"2px 9px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>
                      {r.bookDept}
                    </span>
                  </div>
                </div>
                <div style={{background:sc.bg,border:`1px solid ${sc.border}`,
                  borderRadius:20,padding:"5px 14px",fontSize:13,fontWeight:600,
                  color:sc.color,fontFamily:"'Space Grotesk',sans-serif",flexShrink:0}}>{sc.label}</div>
                {isPending&&(
                  <div style={{display:"flex",gap:10,flexShrink:0}}>
                    <button onClick={()=>handle(r.id,"approved")} className="abtn"
                      style={{background:`linear-gradient(135deg,${A.green},#16a34a)`,
                        borderRadius:12,padding:"10px 18px",color:"#fff",fontSize:13,fontWeight:700,
                        fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:7,
                        boxShadow:`0 4px 14px ${A.green}30`}}>
                      <Ic p={P.check} s={15}/> Approve
                    </button>
                    <button onClick={()=>handle(r.id,"declined")} className="abtn"
                      style={{background:A.redG,border:`1px solid ${A.red}44`,
                        borderRadius:12,padding:"10px 18px",color:A.red,fontSize:13,fontWeight:700,
                        fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:7}}>
                      <Ic p={P.x} s={15}/> Decline
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ANNOUNCEMENTS (admin post → students see) ────────────────────
function AnnouncementsPage(){
  const[announcements,setAnnouncements]=useState(getAnnouncements);
  const[title,setTitle]=useState("");
  const[body,setBody]=useState("");
  const[priority,setPriority]=useState("normal");
  const[composing,setComposing]=useState(false);

  const post=()=>{
    if(!title||!body)return;
    const a=[{id:Date.now(),title,body,priority,
      date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}),
      time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})
    },...announcements];
    setAnnouncements(a);saveAnnouncements(a);
    setTitle("");setBody("");setPriority("normal");setComposing(false);
  };
  const del=(id)=>{const a=announcements.filter(x=>x.id!==id);setAnnouncements(a);saveAnnouncements(a);};
  const prioColor=p=>p==="urgent"?A.red:p==="important"?A.amber:A.prime;

  return(
    <div style={{padding:"32px 36px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:28}}>
        <div>
          <p style={{fontSize:13,color:A.muted,marginBottom:6,letterSpacing:"0.06em",
            textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>Post to Students</p>
          <h1 style={{fontSize:34,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>Announcements</h1>
        </div>
        <button onClick={()=>setComposing(true)} className="abtn"
          style={{background:`linear-gradient(135deg,${A.prime},${A.primeD})`,
            borderRadius:14,padding:"12px 22px",color:"#fff",fontSize:14,fontWeight:700,
            fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:8,
            boxShadow:`0 6px 20px ${A.primeG}`}}>
          <Ic p={P.plus} s={17}/> New Announcement
        </button>
      </div>

      {announcements.length===0&&!composing?(
        <div style={{textAlign:"center",padding:"80px 20px",background:A.card,
          border:`1px solid ${A.border}`,borderRadius:20}}>
          <div style={{color:A.muted,display:"flex",justifyContent:"center",marginBottom:16}}>
            <Ic p={P.announce} s={52}/></div>
          <p style={{fontSize:18,fontWeight:700,color:A.text,marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>No announcements yet</p>
          <p style={{fontSize:14,color:A.sub}}>Post an announcement to notify all library members.</p>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          {announcements.map((a,i)=>{
            const pc=prioColor(a.priority);
            return(
              <div key={a.id}
                style={{background:A.card,borderRadius:18,padding:"22px 26px",
                  border:`1px solid ${A.border}`,borderLeft:`4px solid ${pc}`,
                  animation:`fadeUp 0.4s ${i*60}ms ease both`,
                  display:"flex",gap:18}}>
                <div style={{width:44,height:44,borderRadius:13,background:`${pc}18`,
                  display:"flex",alignItems:"center",justifyContent:"center",color:pc,flexShrink:0}}>
                  <Ic p={P.megaphone} s={20}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <h3 style={{fontSize:16,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif"}}>{a.title}</h3>
                    <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,
                      background:`${pc}18`,color:pc,border:`1px solid ${pc}44`,
                      fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase",letterSpacing:"0.06em"}}>
                      {a.priority}
                    </span>
                  </div>
                  <p style={{fontSize:14,color:A.sub,lineHeight:1.7,marginBottom:10}}>{a.body}</p>
                  <p style={{fontSize:12,color:A.muted,display:"flex",alignItems:"center",gap:5}}>
                    <Ic p={P.clock} s={12}/>{a.date} at {a.time}
                  </p>
                </div>
                <button onClick={()=>del(a.id)} className="abtn"
                  style={{width:32,height:32,borderRadius:9,background:A.redG,
                    border:`1px solid ${A.red}44`,color:A.red,flexShrink:0,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ic p={P.trash} s={14}/>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Compose modal */}
      {composing&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",
          zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}
          onClick={()=>setComposing(false)}>
          <div style={{background:A.surface,border:`1px solid ${A.border}`,borderRadius:24,
            padding:"36px",width:520,animation:"scaleIn 0.25s ease"}}
            onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:22,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:24}}>New Announcement</h3>
            <div style={{marginBottom:18}}>
              <label style={{fontSize:12,color:A.sub,fontWeight:600,letterSpacing:"0.07em",
                textTransform:"uppercase",display:"block",marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Title</label>
              <input className="ainp" value={title} onChange={e=>setTitle(e.target.value)}
                placeholder="Announcement title..."
                style={{width:"100%",background:A.card,border:`1px solid ${A.border}`,
                  borderRadius:12,padding:"13px 16px",color:A.text,fontSize:14,
                  fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
            </div>
            <div style={{marginBottom:18}}>
              <label style={{fontSize:12,color:A.sub,fontWeight:600,letterSpacing:"0.07em",
                textTransform:"uppercase",display:"block",marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Message</label>
              <textarea value={body} onChange={e=>setBody(e.target.value)}
                placeholder="Write your announcement..."
                className="ainp"
                rows={4}
                style={{width:"100%",background:A.card,border:`1px solid ${A.border}`,
                  borderRadius:12,padding:"13px 16px",color:A.text,fontSize:14,
                  fontFamily:"'Plus Jakarta Sans',sans-serif",resize:"none"}}/>
            </div>
            <div style={{marginBottom:26}}>
              <label style={{fontSize:12,color:A.sub,fontWeight:600,letterSpacing:"0.07em",
                textTransform:"uppercase",display:"block",marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>Priority</label>
              <div style={{display:"flex",gap:10}}>
                {[["normal","Normal",A.prime],["important","Important",A.amber],["urgent","Urgent",A.red]].map(([id,label,c])=>(
                  <button key={id} onClick={()=>setPriority(id)} className="abtn"
                    style={{flex:1,background:priority===id?`${c}22`:"transparent",
                      border:`1px solid ${priority===id?c+"66":A.border}`,
                      borderRadius:10,padding:"10px",color:priority===id?c:A.sub,
                      fontSize:13,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>{label}</button>
                ))}
              </div>
            </div>
            <div style={{display:"flex",gap:12}}>
              <button onClick={post} className="abtn"
                style={{flex:1,background:`linear-gradient(135deg,${A.prime},${A.primeD})`,
                  borderRadius:12,padding:"14px",color:"#fff",fontSize:14,fontWeight:700,
                  fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <Ic p={P.megaphone} s={16}/> Post Announcement
              </button>
              <button onClick={()=>setComposing(false)} className="abtn"
                style={{flex:1,background:A.card,border:`1px solid ${A.border}`,
                  borderRadius:12,padding:"14px",color:A.sub,fontSize:14,fontFamily:"'Space Grotesk',sans-serif"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BOOKS ─────────────────────────────────────────────────────────
function BooksPage(){
  const[books,setBooks]=useState(BOOKS_DATA);
  const[q,setQ]=useState("");
  const[showAdd,setShowAdd]=useState(false);
  const[delId,setDelId]=useState(null);
  const[form,setForm]=useState({title:"",author:"",isbn:"",dept:"Engineering",copies:"1"});
  const filtered=books.filter(b=>!q||b.title.toLowerCase().includes(q.toLowerCase())||b.author.toLowerCase().includes(q.toLowerCase()));
  const addBook=()=>{
    if(!form.title||!form.author)return;
    setBooks(b=>[{id:`B${String(b.length+1).padStart(3,"0")}`,
      ...form,copies:parseInt(form.copies)||1,borrowed:0,status:"available",
      added:new Date().toLocaleDateString("en-GB",{month:"short",day:"2-digit",year:"numeric"})},...b]);
    setShowAdd(false);setForm({title:"",author:"",isbn:"",dept:"Engineering",copies:"1"});
  };
  return(
    <div style={{padding:"32px 36px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:28}}>
        <div>
          <p style={{fontSize:13,color:A.muted,marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>Library Collection</p>
          <h1 style={{fontSize:34,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>Books</h1>
        </div>
        <button onClick={()=>setShowAdd(true)} className="abtn"
          style={{background:`linear-gradient(135deg,${A.prime},${A.primeD})`,borderRadius:13,
            padding:"12px 22px",color:"#fff",fontSize:14,fontWeight:700,
            fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:8,
            boxShadow:`0 6px 20px ${A.primeG}`}}>
          <Ic p={P.plus} s={17}/> Add Book
        </button>
      </div>
      <div style={{position:"relative",marginBottom:22}}>
        <div style={{position:"absolute",left:15,top:"50%",transform:"translateY(-50%)",color:A.muted}}><Ic p={P.search} s={17}/></div>
        <input className="ainp" value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Search books..."
          style={{width:"100%",background:A.card,border:`1px solid ${A.border}`,
            borderRadius:13,padding:"13px 16px 13px 44px",color:A.text,fontSize:14,
            fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
      </div>
      <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr 1fr",
          padding:"12px 22px",borderBottom:`1px solid ${A.border}`,background:A.card2}}>
          {["Title","Author","Dept","Status","Copies",""].map((h,i)=>(
            <span key={i} style={{fontSize:11,fontWeight:700,color:A.muted,letterSpacing:"0.08em",
              textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{h}</span>
          ))}
        </div>
        {filtered.map((b,i)=>{
          const sc=b.status==="available"?A.green:b.status==="borrowed"?A.red:A.amber;
          return(
            <div key={b.id} className="arow"
              style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr 1fr 1fr",
                padding:"16px 22px",borderBottom:`1px solid ${A.border}`,
                background:"transparent",transition:"background 0.2s",alignItems:"center"}}>
              <div>
                <p style={{fontSize:14,fontWeight:600,color:A.text,marginBottom:3,fontFamily:"'Space Grotesk',sans-serif"}}>{b.title}</p>
                <p style={{fontSize:11,color:A.muted}}>{b.id}</p>
              </div>
              <p style={{fontSize:13,color:A.sub}}>{b.author}</p>
              <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,width:"fit-content",
                background:deptColor(b.dept)+"22",color:deptColor(b.dept),
                border:`1px solid ${deptColor(b.dept)}44`,fontFamily:"'Space Grotesk',sans-serif"}}>{b.dept}</span>
              <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,width:"fit-content",
                background:`${sc}18`,color:sc,border:`1px solid ${sc}44`,
                fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{b.status}</span>
              <p style={{fontSize:13,color:A.sub,fontFamily:"'Space Grotesk',sans-serif"}}>
                <strong style={{color:A.text}}>{b.borrowed}</strong>/{b.copies}
              </p>
              <div style={{display:"flex",gap:8}}>
                <button className="abtn" style={{width:32,height:32,borderRadius:9,background:A.primeG,
                  border:`1px solid ${A.prime}44`,color:A.prime,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ic p={P.edit} s={14}/></button>
                <button onClick={()=>setDelId(b.id)} className="abtn"
                  style={{width:32,height:32,borderRadius:9,background:A.redG,
                    border:`1px solid ${A.red}44`,color:A.red,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ic p={P.trash} s={14}/></button>
              </div>
            </div>
          );
        })}
      </div>
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",
          zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setShowAdd(false)}>
          <div style={{background:A.surface,border:`1px solid ${A.border}`,borderRadius:24,
            padding:"36px",width:480,animation:"scaleIn 0.25s ease"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:20,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:24}}>Add New Book</h3>
            {[["Title",form.title,"title","Book title"],["Author",form.author,"author","Author name"],
              ["ISBN",form.isbn,"isbn","ISBN number"],["Copies",form.copies,"copies","Number"]].map(([label,val,key,ph])=>(
              <div key={key} style={{marginBottom:16}}>
                <label style={{fontSize:12,color:A.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",
                  display:"block",marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>{label}</label>
                <input className="ainp" value={val} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
                  placeholder={ph}
                  style={{width:"100%",background:A.card,border:`1px solid ${A.border}`,
                    borderRadius:11,padding:"12px 14px",color:A.text,fontSize:14,
                    fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
              </div>
            ))}
            <div style={{marginBottom:24}}>
              <label style={{fontSize:12,color:A.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",
                display:"block",marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>Department</label>
              <select value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}
                style={{width:"100%",background:A.card,border:`1px solid ${A.border}`,borderRadius:11,
                  padding:"12px 14px",color:A.text,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}>
                {["Engineering","Medicine","Pharmacy","Science","Arts","Law","Commerce","Computer Science","Architecture"].map(d=>(
                  <option key={d}>{d}</option>))}
              </select>
            </div>
            <div style={{display:"flex",gap:12}}>
              <button onClick={addBook} className="abtn"
                style={{flex:1,background:`linear-gradient(135deg,${A.prime},${A.primeD})`,
                  borderRadius:12,padding:"13px",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif"}}>Add Book</button>
              <button onClick={()=>setShowAdd(false)} className="abtn"
                style={{flex:1,background:A.card,border:`1px solid ${A.border}`,
                  borderRadius:12,padding:"13px",color:A.sub,fontSize:14,fontFamily:"'Space Grotesk',sans-serif"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {delId&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",
          zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setDelId(null)}>
          <div style={{background:A.surface,border:`1px solid ${A.red}44`,borderRadius:24,
            padding:"36px",width:380,textAlign:"center",animation:"scaleIn 0.25s ease"}} onClick={e=>e.stopPropagation()}>
            <div style={{width:56,height:56,borderRadius:18,background:A.redG,border:`1px solid ${A.red}44`,
              margin:"0 auto 20px",display:"flex",alignItems:"center",justifyContent:"center",color:A.red}}>
              <Ic p={P.trash} s={26}/></div>
            <h3 style={{fontSize:20,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:10}}>Delete Book?</h3>
            <p style={{fontSize:14,color:A.sub,marginBottom:26}}>This action cannot be undone.</p>
            <div style={{display:"flex",gap:12}}>
              <button onClick={()=>{setBooks(b=>b.filter(x=>x.id!==delId));setDelId(null);}} className="abtn"
                style={{flex:1,background:`linear-gradient(135deg,${A.red},#dc2626)`,
                  borderRadius:12,padding:"13px",color:"#fff",fontSize:14,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif"}}>Delete</button>
              <button onClick={()=>setDelId(null)} className="abtn"
                style={{flex:1,background:A.card,border:`1px solid ${A.border}`,
                  borderRadius:12,padding:"13px",color:A.sub,fontSize:14,fontFamily:"'Space Grotesk',sans-serif"}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BORROWINGS ────────────────────────────────────────────────────
function BorrowingsPage(){
  const[filter,setFilter]=useState("all");
  const filtered=filter==="all"?TXNS:TXNS.filter(t=>t.status===filter);
  return(
    <div style={{padding:"32px 36px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{marginBottom:28}}>
        <p style={{fontSize:13,color:A.muted,marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>Monitor Loans</p>
        <h1 style={{fontSize:34,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>Borrowings</h1>
      </div>
      <div style={{display:"flex",background:A.card,border:`1px solid ${A.border}`,
        borderRadius:14,padding:5,marginBottom:24,width:"fit-content",gap:4}}>
        {[["all","All"],["active","Active"],["overdue","Overdue"]].map(([id,label])=>(
          <button key={id} onClick={()=>setFilter(id)} className="abtn"
            style={{background:filter===id?`linear-gradient(135deg,${A.prime},${A.primeD})`:"transparent",
              borderRadius:10,padding:"9px 20px",color:filter===id?"#fff":A.sub,
              fontSize:13,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif",
              boxShadow:filter===id?`0 4px 14px ${A.primeG}`:"none"}}>{label}</button>
        ))}
      </div>
      <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr 1fr 1fr",
          padding:"12px 22px",borderBottom:`1px solid ${A.border}`,background:A.card2}}>
          {["Student","Book","Borrowed","Due","Status"].map(h=>(
            <span key={h} style={{fontSize:11,fontWeight:700,color:A.muted,letterSpacing:"0.08em",
              textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{h}</span>
          ))}
        </div>
        {filtered.map((t,i)=>{
          const over=t.status==="overdue";
          return(
            <div key={t.id} className="arow"
              style={{display:"grid",gridTemplateColumns:"1fr 1.5fr 1fr 1fr 1fr",
                padding:"16px 22px",borderBottom:`1px solid ${A.border}`,
                background:over?"rgba(239,68,68,0.03)":"transparent",
                borderLeft:over?`3px solid ${A.red}`:"3px solid transparent",
                transition:"background 0.2s",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:34,height:34,borderRadius:10,background:avatarColor(t.student)+"22",flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:13,fontWeight:700,color:avatarColor(t.student),fontFamily:"'Space Grotesk',sans-serif"}}>{t.student[0]}</div>
                <div>
                  <p style={{fontSize:13,fontWeight:600,color:A.text,fontFamily:"'Space Grotesk',sans-serif"}}>{t.student}</p>
                  <p style={{fontSize:11,color:A.muted}}>{t.studentId}</p>
                </div>
              </div>
              <div>
                <p style={{fontSize:13,fontWeight:600,color:A.text,marginBottom:3,fontFamily:"'Space Grotesk',sans-serif"}}>{t.book}</p>
                <span style={{fontSize:10,background:deptColor(t.dept)+"22",color:deptColor(t.dept),
                  border:`1px solid ${deptColor(t.dept)}40`,padding:"2px 8px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>{t.dept}</span>
              </div>
              <p style={{fontSize:13,color:A.sub,fontFamily:"'Space Grotesk',sans-serif"}}>{t.borrowed}</p>
              <p style={{fontSize:13,color:over?A.red:A.sub,fontWeight:over?700:400,fontFamily:"'Space Grotesk',sans-serif"}}>{t.due}</p>
              <span style={{fontSize:12,fontWeight:700,padding:"4px 12px",borderRadius:20,width:"fit-content",
                background:over?A.redG:A.greenG,color:over?A.red:A.green,
                border:`1px solid ${over?A.red:A.green}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{t.status}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── STUDENTS ──────────────────────────────────────────────────────
function StudentsPage(){
  const[students,setStudents]=useState(STUDENTS);
  const[q,setQ]=useState("");
  const[viewing,setViewing]=useState(null);
  const filtered=students.filter(s=>!q||s.name.toLowerCase().includes(q.toLowerCase())||s.id.includes(q));
  return(
    <div style={{padding:"32px 36px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:28}}>
        <div>
          <p style={{fontSize:13,color:A.muted,marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>Library Members</p>
          <h1 style={{fontSize:34,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>Students</h1>
        </div>
      </div>
      <div style={{position:"relative",marginBottom:22}}>
        <div style={{position:"absolute",left:15,top:"50%",transform:"translateY(-50%)",color:A.muted}}><Ic p={P.search} s={17}/></div>
        <input className="ainp" value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Search by name or ID..."
          style={{width:"100%",background:A.card,border:`1px solid ${A.border}`,
            borderRadius:13,padding:"13px 16px 13px 44px",color:A.text,fontSize:14,
            fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
      </div>
      <div style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:20,overflow:"hidden"}}>
        <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1.5fr 1fr 1fr 1fr",
          padding:"12px 22px",borderBottom:`1px solid ${A.border}`,background:A.card2}}>
          {["Student","ID","Email","Loans","Status","Actions"].map(h=>(
            <span key={h} style={{fontSize:11,fontWeight:700,color:A.muted,letterSpacing:"0.08em",
              textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{h}</span>
          ))}
        </div>
        {filtered.map((s)=>{
          const ac=avatarColor(s.name);const susp=s.status==="suspended";
          return(
            <div key={s.id} className="arow"
              style={{display:"grid",gridTemplateColumns:"2fr 1fr 1.5fr 1fr 1fr 1fr",
                padding:"16px 22px",borderBottom:`1px solid ${A.border}`,
                background:"transparent",transition:"background 0.2s",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div style={{width:38,height:38,borderRadius:11,background:`${ac}22`,flexShrink:0,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:14,fontWeight:700,color:ac,fontFamily:"'Space Grotesk',sans-serif"}}>{s.name[0]}</div>
                <div>
                  <p style={{fontSize:14,fontWeight:600,color:A.text,fontFamily:"'Space Grotesk',sans-serif"}}>{s.name}</p>
                  <p style={{fontSize:11,color:A.muted}}>{s.dept}</p>
                </div>
              </div>
              <p style={{fontSize:12,color:A.sub,fontFamily:"'Space Grotesk',sans-serif"}}>{s.id}</p>
              <p style={{fontSize:12,color:A.sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.email}</p>
              <p style={{fontSize:13,color:A.text,fontFamily:"'Space Grotesk',sans-serif"}}>
                <strong>{s.active}</strong><span style={{color:A.muted}}> / {s.loans}</span>
              </p>
              <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,width:"fit-content",
                background:susp?A.redG:A.greenG,color:susp?A.red:A.green,
                border:`1px solid ${susp?A.red:A.green}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{s.status}</span>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setViewing(s)} className="abtn"
                  style={{width:32,height:32,borderRadius:9,background:A.primeG,
                    border:`1px solid ${A.prime}44`,color:A.prime,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ic p={P.eye} s={14}/></button>
                <button onClick={()=>setStudents(st=>st.map(x=>x.id===s.id?{...x,status:x.status==="active"?"suspended":"active"}:x))}
                  className="abtn"
                  style={{width:32,height:32,borderRadius:9,background:susp?A.greenG:A.redG,
                    border:`1px solid ${susp?A.green:A.red}44`,color:susp?A.green:A.red,
                    display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Ic p={susp?P.check:P.x} s={14}/></button>
              </div>
            </div>
          );
        })}
      </div>
      {viewing&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",backdropFilter:"blur(8px)",
          zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setViewing(null)}>
          <div style={{background:A.surface,border:`1px solid ${A.border}`,borderRadius:24,
            padding:"36px",width:460,animation:"scaleIn 0.25s ease"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:26}}>
              <div style={{width:60,height:60,borderRadius:18,background:avatarColor(viewing.name)+"22",
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:24,fontWeight:700,color:avatarColor(viewing.name),fontFamily:"'Space Grotesk',sans-serif"}}>{viewing.name[0]}</div>
              <div>
                <p style={{fontSize:20,fontWeight:700,color:A.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4}}>{viewing.name}</p>
                <p style={{fontSize:13,color:A.sub}}>{viewing.dept} · {viewing.id}</p>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:22}}>
              {[["Total Loans",viewing.loans,A.prime],["Active Now",viewing.active,A.amber],["Status",viewing.status,viewing.status==="active"?A.green:A.red]].map(([l,v,c])=>(
                <div key={l} style={{background:A.card,border:`1px solid ${A.border}`,borderRadius:14,padding:"16px",textAlign:"center"}}>
                  <p style={{fontSize:22,fontWeight:700,color:c,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4}}>{v}</p>
                  <p style={{fontSize:12,color:A.sub}}>{l}</p>
                </div>
              ))}
            </div>
            <p style={{fontSize:13,color:A.sub,marginBottom:8}}>{viewing.email}</p>
            <button onClick={()=>setViewing(null)} className="abtn"
              style={{width:"100%",background:A.card,border:`1px solid ${A.border}`,
                borderRadius:12,padding:"13px",color:A.sub,fontSize:14,marginTop:16,fontFamily:"'Space Grotesk',sans-serif"}}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────
function Sidebar({active,setActive,onLogout}){
  const requests=getRequests();
  const pending=requests.filter(r=>r.status==="pending").length;
  const NAVS=[
    {id:"dashboard",label:"Dashboard",icon:P.dash},
    {id:"requests",label:"Borrow Requests",icon:P.requests,badge:pending},
    {id:"books",label:"Books",icon:P.books},
    {id:"borrowings",label:"Borrowings",icon:P.borrow},
    {id:"students",label:"Students",icon:P.students},
    {id:"announcements",label:"Announcements",icon:P.announce},
  ];
  return(
    <aside style={{width:242,flexShrink:0,background:A.surface,
      borderRight:`1px solid ${A.border}`,minHeight:"100vh",
      display:"flex",flexDirection:"column",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{padding:"28px 22px 20px",borderBottom:`1px solid ${A.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:38,height:38,borderRadius:11,
            background:`linear-gradient(135deg,${A.prime},${A.primeD})`,
            display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",
            boxShadow:`0 4px 14px ${A.primeG}`}}>
            <Ic p={P.bookOpen} s={20}/></div>
          <div>
            <p style={{fontSize:17,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",
              color:A.text,letterSpacing:"-0.01em"}}>
              Biblio<span style={{color:A.prime}}>Tech</span>
            </p>
            <p style={{fontSize:11,color:A.muted}}>Admin Panel</p>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:"16px 12px"}}>
        {NAVS.map(n=>{
          const isA=active===n.id;
          return(
            <button key={n.id} onClick={()=>setActive(n.id)} className="abtn"
              style={{display:"flex",alignItems:"center",gap:12,width:"100%",
                padding:"11px 14px",borderRadius:12,marginBottom:4,
                background:isA?A.primeG:"transparent",
                border:`1px solid ${isA?A.prime+"44":"transparent"}`,
                color:isA?A.prime:A.sub,
                fontSize:14,fontWeight:isA?600:400,textAlign:"left",
                transition:"all 0.2s",position:"relative"}}>
              <Ic p={n.icon} s={17}/>{n.label}
              {n.badge>0&&<span style={{position:"absolute",right:12,
                background:A.amber,color:"#000",fontSize:10,fontWeight:800,
                minWidth:20,height:20,borderRadius:10,
                display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px"}}>{n.badge}</span>}
            </button>
          );
        })}
      </nav>
      <div style={{padding:"16px 12px",borderTop:`1px solid ${A.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
          background:A.card,borderRadius:13,border:`1px solid ${A.border}`,marginBottom:10}}>
          <div style={{width:36,height:36,borderRadius:10,
            background:`linear-gradient(135deg,${A.prime},${A.accent})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:15,fontWeight:700,color:"#fff",fontFamily:"'Space Grotesk',sans-serif"}}>A</div>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontSize:13,fontWeight:600,color:A.text,fontFamily:"'Space Grotesk',sans-serif"}}>Administrator</p>
            <p style={{fontSize:11,color:A.muted,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>admin@library.edu</p>
          </div>
        </div>
        <button onClick={onLogout} className="abtn"
          style={{display:"flex",alignItems:"center",gap:9,width:"100%",
            padding:"10px 14px",borderRadius:11,color:A.muted,fontSize:13,
            fontFamily:"'Plus Jakarta Sans',sans-serif",border:`1px solid ${A.border}`}}>
          <Ic p={P.logout} s={15}/> Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────
export default function BiblioTechAdmin(){
  const[loggedIn,setLoggedIn]=useState(()=>isAdminLoggedIn());
  const[active,setActive]=useState("dashboard");
  const handleLogout=()=>{adminLogout();setLoggedIn(false);};
  return(
    <>
      <style>{CSS}</style>
      {!loggedIn
        ?<AdminLogin onLogin={()=>setLoggedIn(true)}/>
        :<div style={{display:"flex",minHeight:"100vh",background:A.bg,color:A.text}}>
          <Sidebar active={active} setActive={setActive} onLogout={handleLogout}/>
          <main style={{flex:1,overflowY:"auto",minHeight:"100vh"}}>
            {active==="dashboard"    &&<Dashboard setActive={setActive}/>}
            {active==="requests"     &&<BorrowRequestsPage/>}
            {active==="books"        &&<BooksPage/>}
            {active==="borrowings"   &&<BorrowingsPage/>}
            {active==="students"     &&<StudentsPage/>}
            {active==="announcements"&&<AnnouncementsPage/>}
          </main>
        </div>
      }
    </>
  );
}

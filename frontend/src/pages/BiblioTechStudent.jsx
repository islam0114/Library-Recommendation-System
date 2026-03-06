import { useState, useEffect, useRef } from "react";
import { saveRequest, hasActiveRequest, getRequests } from "../store.js";

/* ═══════════════════════════════════════════════════════════════
   BIBLIO TECH — Student Portal  v4
   + Announcements section on Home page (reads from admin posts)
═══════════════════════════════════════════════════════════════ */

const T = {
  bg:"#07090f", surface:"#0f1219", card:"#141824", card2:"#1a1f2e",
  border:"rgba(255,255,255,0.07)",
  prime:"#0d9488", primeL:"#14b8a6", primeD:"#0f766e", primeG:"#0d948822",
  violet:"#8b5cf6", violetG:"#8b5cf618",
  cyan:"#06b6d4", indigo:"#6366f1",
  green:"#22c55e", red:"#ef4444", amber:"#f59e0b",
  text:"#f0eef9", sub:"#8b9ab0", muted:"#3d4a5c", dim:"#151b28",
};

const DEPTS=["All","Engineering","Medicine","Pharmacy","Science","Arts","Law","Commerce","Computer Science","Architecture"];

const BOOKS=[
  {id:"B001",title:"Calculus: Early Transcendentals",author:"James Stewart",dept:"Engineering",rating:4.8,borrows:134,status:"available",cover:["#1e3a8a","#1e40af","#1d4ed8"],year:2015,isbn:"978-1285741550",pages:1368,desc:"The most widely used calculus textbook, covering single-variable and multivariable calculus.",isNew:false},
  {id:"B002",title:"Gray's Anatomy",author:"Henry Gray",dept:"Medicine",rating:4.9,borrows:201,status:"borrowed",cover:["#7f1d1d","#991b1b","#b91c1c"],year:2020,isbn:"978-0702077357",pages:1576,desc:"The definitive anatomical reference, used by medical students worldwide for over 150 years.",isNew:true},
  {id:"B003",title:"Introduction to Algorithms",author:"Cormen et al.",dept:"Computer Science",rating:4.9,borrows:178,status:"available",cover:["#064e3b","#065f46","#047857"],year:2009,isbn:"978-0262033848",pages:1292,desc:"The most comprehensive textbook on computer algorithms — known as CLRS.",isNew:false},
  {id:"B004",title:"Organic Chemistry",author:"Paula Y. Bruice",dept:"Pharmacy",rating:4.6,borrows:89,status:"available",cover:["#3b0764","#4c1d95","#5b21b6"],year:2016,isbn:"978-0134042282",pages:1344,desc:"A modern approach to organic chemistry with a focus on biological applications.",isNew:true},
  {id:"B005",title:"Principles of Physics",author:"Serway & Jewett",dept:"Science",rating:4.7,borrows:112,status:"reserved",cover:["#0c4a6e","#075985","#0369a1"],year:2013,isbn:"978-1133104261",pages:1152,desc:"Comprehensive physics covering mechanics, thermodynamics and electromagnetism.",isNew:false},
  {id:"B006",title:"The Architecture of Happiness",author:"Alain de Botton",dept:"Architecture",rating:4.5,borrows:67,status:"available",cover:["#78350f","#92400e","#b45309"],year:2006,isbn:"978-0375424434",pages:280,desc:"A philosophical meditation on how architecture shapes identity and moods.",isNew:true},
  {id:"B007",title:"Business Law",author:"Henry R. Cheeseman",dept:"Law",rating:4.4,borrows:55,status:"available",cover:["#1c1917","#292524","#44403c"],year:2019,isbn:"978-0135085929",pages:912,desc:"Comprehensive coverage of business law, contracts, torts, and commercial law.",isNew:false},
  {id:"B008",title:"Macroeconomics",author:"N. Gregory Mankiw",dept:"Commerce",rating:4.7,borrows:143,status:"borrowed",cover:["#052e16","#064e3b","#065f46"],year:2018,isbn:"978-1319105990",pages:544,desc:"The leading macroeconomics textbook, balancing theory with real-world applications.",isNew:true},
  {id:"B009",title:"Clean Code",author:"Robert C. Martin",dept:"Computer Science",rating:4.8,borrows:156,status:"available",cover:["#0f172a","#1e293b","#334155"],year:2008,isbn:"978-0132350884",pages:431,desc:"A handbook of agile software craftsmanship — essential reading for developers.",isNew:false},
  {id:"B010",title:"Human Anatomy & Physiology",author:"Marieb & Hoehn",dept:"Medicine",rating:4.8,borrows:167,status:"available",cover:["#7c2d12","#9a3412","#c2410c"],year:2018,isbn:"978-0134580999",pages:1264,desc:"The gold standard for human anatomy and physiology with vivid illustrations.",isNew:true},
  {id:"B011",title:"Strength of Materials",author:"R.K. Bansal",dept:"Engineering",rating:4.5,borrows:78,status:"available",cover:["#1e1b4b","#312e81","#3730a3"],year:2010,isbn:"978-8131808146",pages:1040,desc:"A comprehensive text on mechanics of materials, stress and structural analysis.",isNew:false},
  {id:"B012",title:"World Literature Anthology",author:"Various Authors",dept:"Arts",rating:4.3,borrows:42,status:"available",cover:["#500724","#701a75","#86198f"],year:2014,isbn:"978-0393934168",pages:2800,desc:"A sweeping collection of world literature from ancient epics to contemporary prose.",isNew:true},
];

const MY_LOANS=[
  {bookId:"B001",title:"Calculus: Early Transcendentals",author:"James Stewart",borrowed:"Feb 20, 2026",due:"Mar 13, 2026",daysLeft:8,cover:["#1e3a8a","#1e40af","#1d4ed8"]},
  {bookId:"B009",title:"Clean Code",author:"Robert C. Martin",borrowed:"Feb 25, 2026",due:"Mar 11, 2026",daysLeft:6,cover:["#0f172a","#1e293b","#334155"]},
  {bookId:"B005",title:"Principles of Physics",author:"Serway & Jewett",borrowed:"Feb 10, 2026",due:"Mar 03, 2026",daysLeft:-2,cover:["#0c4a6e","#075985","#0369a1"]},
];
const READ_HISTORY=[
  {title:"Data Structures & Algorithms",author:"Mark Allen Weiss",cover:["#134e4a","#115e59","#0f766e"],date:"Jan 2026"},
  {title:"Discrete Mathematics",author:"Kenneth H. Rosen",cover:["#1e3a5f","#1e3a8a","#1e40af"],date:"Dec 2025"},
  {title:"Operating Systems",author:"Abraham Silberschatz",cover:["#1c1917","#292524","#44403c"],date:"Nov 2025"},
  {title:"Database System Concepts",author:"Silberschatz et al.",cover:["#0f0f23","#1a1a2e","#16213e"],date:"Oct 2025"},
];

const FEATURED=[BOOKS[1],BOOKS[3],BOOKS[8],BOOKS[0],BOOKS[5],BOOKS[9],BOOKS[7],BOOKS[2]];
const AI_RECS=[BOOKS[2],BOOKS[8],BOOKS[0],BOOKS[4]];
const TRENDING=[BOOKS[1],BOOKS[7],BOOKS[9],BOOKS[2],BOOKS[0],BOOKS[8]];

const ANNOUNCEMENTS_KEY="bt_announcements";
const getAnnouncements=()=>{try{return JSON.parse(localStorage.getItem(ANNOUNCEMENTS_KEY)||"[]");}catch{return[];}};

const deptColor=d=>({Engineering:"#f97316",Medicine:"#ef4444",Pharmacy:"#8b5cf6",Science:"#06b6d4",Arts:"#ec4899",Law:"#f59e0b",Commerce:"#22c55e","Computer Science":"#3b82f6",Architecture:"#a78bfa"}[d]||"#64748b");
const statusCfg=s=>({available:{label:"Available",color:"#22c55e",bg:"#22c55e15",border:"#22c55e40"},borrowed:{label:"Borrowed",color:"#ef4444",bg:"#ef444415",border:"#ef444440"},reserved:{label:"Reserved",color:"#f59e0b",bg:"#f59e0b15",border:"#f59e0b40"}}[s]||{label:s,color:"#64748b",bg:"#64748b15",border:"#64748b40"});

const Ic=({p,s=18,fill=false,color="currentColor"})=>(
  <svg width={s} height={s} viewBox="0 0 24 24" fill={fill?color:"none"}
    stroke={fill?"none":color} strokeWidth="1.8"
    strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>
    {(Array.isArray(p)?p:[p]).map((d,i)=><path key={i} d={d}/>)}
  </svg>
);

const P={
  book:["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"],
  bookOpen:["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z","M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
  search:"M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  home:["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],
  explore:["M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z","M8 2v16","M16 6v16"],
  bell:["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],
  logout:["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],
  lock:["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],
  id:["M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z","M16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"],
  send:["M22 2L11 13","M22 2L15 22l-4-9-9-4 22-7z"],
  back:["M19 12H5","M12 5l-7 7 7 7"],
  star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  filter:"M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  lib:["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  chevL:"M15 18l-6-6 6-6",
  chevR:"M9 6l6 6-6 6",
  clock:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 6v6l4 2"],
  bot:["M12 2a2 2 0 0 1 2 2v1h4v14H6V5h4V4a2 2 0 0 1 2-2z","M9 12h.01","M15 12h.01","M9 16s1 1 3 1 3-1 3-1"],
  check:["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4L12 14.01l-3-3"],
  heart:"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  grid:["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],
  list:["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"],
  spark:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  pending:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 6v6l4 2"],
  approved:"M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
  megaphone:["M3 11l19-9-9 19-2-8-8-2z"],
  announce:["M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"],
  alert:["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],
};

const CSS=`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:#07090f;overflow-x:hidden;}
  ::-webkit-scrollbar{width:4px;height:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#1a2035;border-radius:6px;}
  input::placeholder{color:#243050;}select option{background:#141824;}
  @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.9)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
  @keyframes glow{0%,100%{box-shadow:0 0 22px #0d948838}50%{box-shadow:0 0 50px #0d948868}}
  @keyframes bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}}
  @keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}
  .card{transition:all 0.3s cubic-bezier(0.34,1.2,0.64,1);cursor:pointer;}
  .card:hover{transform:translateY(-6px) scale(1.022);}
  .btn{transition:all 0.2s ease;cursor:pointer;border:none;background:none;}
  .btn:hover{filter:brightness(1.1);transform:translateY(-1px);}
  .btn:active{transform:scale(0.97);}
  .inp:focus{outline:none;border-color:#0d948866!important;}
`;

// ── COVER ─────────────────────────────────────────────────────────
function Cover({colors,h=190,children}){
  const[c1,c2,c3]=colors;
  return(
    <div style={{width:"100%",height:h,position:"relative",overflow:"hidden",
      background:`linear-gradient(155deg,${c1} 0%,${c2} 45%,${c3} 80%,#07090f 100%)`,
      display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{position:"absolute",left:"16%",top:0,bottom:0,width:2,background:"rgba(255,255,255,0.06)"}}/>
      {[18,34,50,66,82].map((t,i)=>(
        <div key={i} style={{position:"absolute",left:"20%",right:"8%",top:`${t}%`,
          height:1,background:`rgba(255,255,255,${0.025+i*0.007})`}}/>
      ))}
      <div style={{position:"absolute",top:0,left:0,right:0,height:"40%",
        background:"linear-gradient(180deg,rgba(255,255,255,0.07),transparent)",pointerEvents:"none"}}/>
      <div style={{color:"rgba(255,255,255,0.17)",position:"relative"}}>
        <Ic p={P.bookOpen} s={h>250?68:h>150?44:28}/>
      </div>
      {children}
    </div>
  );
}

function SmallCover({colors,w=54,h=72}){
  const[c1,c2]=colors;
  return(
    <div style={{width:w,height:h,flexShrink:0,borderRadius:8,overflow:"hidden",
      background:`linear-gradient(145deg,${c1},${c2}aa)`,
      display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
      <div style={{position:"absolute",left:"18%",top:0,bottom:0,width:1,background:"rgba(255,255,255,0.07)"}}/>
      <div style={{color:"rgba(255,255,255,0.18)"}}><Ic p={P.book} s={w>40?22:16}/></div>
    </div>
  );
}

// ── FEATURED SLIDER ───────────────────────────────────────────────
function Slider({books,onView}){
  const[act,setAct]=useState(2);
  const total=books.length;
  const next=()=>setAct(a=>(a+1)%total);
  useEffect(()=>{const t=setInterval(next,4200);return()=>clearInterval(t);},[]);
  const getPos=i=>{let d=i-act;if(d>total/2)d-=total;if(d<-total/2)d+=total;return d;};
  return(
    <div style={{position:"relative",height:420,overflow:"hidden",
      background:`linear-gradient(180deg,#0c0f1a,${T.bg})`}}>
      <div style={{position:"absolute",inset:0,pointerEvents:"none",
        background:`radial-gradient(ellipse at 50% 30%,${books[act].cover[1]}28 0%,transparent 68%)`,
        filter:"blur(40px)",transition:"background 1s ease"}}/>
      <div style={{position:"relative",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {books.map((bk,i)=>{
          const p=getPos(i),abs=Math.abs(p);
          if(abs>3)return null;
          const isC=p===0,scale=isC?1:abs===1?0.79:0.63;
          const x=p*240,z=isC?10:abs===1?6:3,op=isC?1:abs===1?0.62:0.32;
          const dc=deptColor(bk.dept),sc=statusCfg(bk.status);
          return(
            <div key={bk.id} onClick={()=>isC?onView(bk):setAct(i)}
              style={{position:"absolute",transform:`translateX(${x}px) scale(${scale})`,
                transition:"all 0.55s cubic-bezier(0.4,0,0.2,1)",
                zIndex:z,opacity:op,cursor:"pointer",width:200}}>
              <div style={{width:200,height:290,borderRadius:14,overflow:"hidden",
                border:`2px solid ${isC?dc+"90":"rgba(255,255,255,0.05)"}`,
                boxShadow:isC?`0 32px 80px ${bk.cover[1]}55`:"0 8px 24px rgba(0,0,0,0.5)",
                transition:"all 0.55s ease",position:"relative"}}>
                <Cover colors={bk.cover} h={290}>
                  <div style={{position:"absolute",top:11,left:11,background:sc.bg,color:sc.color,
                    border:`1px solid ${sc.border}`,fontSize:9,fontWeight:700,
                    padding:"3px 9px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",
                    textTransform:"uppercase",letterSpacing:"0.07em"}}>{sc.label}</div>
                  {bk.isNew&&<div style={{position:"absolute",top:11,right:11,background:T.prime,
                    color:"#fff",fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,
                    fontFamily:"'Space Grotesk',sans-serif"}}>NEW</div>}
                  {isC&&<div style={{position:"absolute",bottom:12,right:11,
                    background:"rgba(0,0,0,0.75)",backdropFilter:"blur(8px)",
                    border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,
                    padding:"4px 11px",display:"flex",alignItems:"center",gap:5}}>
                    <Ic p={P.star} s={11} fill color="#f59e0b"/>
                    <span style={{fontSize:12,fontWeight:700,color:"#f59e0b",
                      fontFamily:"'Space Grotesk',sans-serif"}}>{bk.rating}</span>
                  </div>}
                </Cover>
              </div>
              {abs<=1&&<div style={{textAlign:"center",marginTop:14,padding:"0 6px"}}>
                <p style={{fontSize:isC?14:12,fontWeight:isC?700:500,
                  color:isC?T.text:"#374151",lineHeight:1.3,
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",
                  fontFamily:"'Space Grotesk',sans-serif"}}>{bk.title}</p>
                {isC&&<p style={{fontSize:12,color:T.sub,marginTop:3,
                  fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{bk.author}</p>}
              </div>}
            </div>
          );
        })}
      </div>
      <button onClick={()=>setAct(a=>(a-1+total)%total)} className="btn"
        style={{position:"absolute",left:22,top:"44%",transform:"translateY(-50%)",
          background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,0.1)",borderRadius:"50%",
          width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",
          color:"rgba(255,255,255,0.85)",zIndex:20}}>
        <Ic p={P.chevL} s={21}/>
      </button>
      <button onClick={next} className="btn"
        style={{position:"absolute",right:22,top:"44%",transform:"translateY(-50%)",
          background:"rgba(0,0,0,0.6)",backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,0.1)",borderRadius:"50%",
          width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",
          color:"rgba(255,255,255,0.85)",zIndex:20}}>
        <Ic p={P.chevR} s={21}/>
      </button>
      <div style={{position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",
        display:"flex",gap:7,zIndex:20}}>
        {books.map((_,i)=>(
          <div key={i} onClick={()=>setAct(i)}
            style={{width:i===act?24:7,height:7,borderRadius:4,
              background:i===act?T.prime:"rgba(255,255,255,0.18)",
              cursor:"pointer",transition:"all 0.35s ease"}}/>
        ))}
      </div>
    </div>
  );
}

// ── ANNOUNCEMENT TICKER (marquee bar) ─────────────────────────────
function AnnouncementTicker({announcements}){
  if(!announcements.length)return null;
  const prioColor=p=>p==="urgent"?T.red:p==="important"?T.amber:T.prime;
  const items=[...announcements,...announcements]; // duplicate for seamless loop
  return(
    <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,
      padding:"10px 0",overflow:"hidden",position:"relative"}}>
      <div style={{position:"absolute",left:0,top:0,bottom:0,width:120,zIndex:2,
        background:`linear-gradient(90deg,${T.surface},transparent)`,pointerEvents:"none"}}/>
      <div style={{position:"absolute",right:0,top:0,bottom:0,width:120,zIndex:2,
        background:`linear-gradient(270deg,${T.surface},transparent)`,pointerEvents:"none"}}/>
      <div style={{display:"flex",alignItems:"center",gap:0,
        animation:`marquee ${announcements.length*8}s linear infinite`,
        width:"max-content"}}>
        {items.map((a,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"0 40px",
            borderRight:`1px solid ${T.border}`,flexShrink:0}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:prioColor(a.priority),flexShrink:0}}/>
            <span style={{fontSize:13,fontWeight:600,color:prioColor(a.priority),
              fontFamily:"'Space Grotesk',sans-serif",whiteSpace:"nowrap"}}>{a.title}:</span>
            <span style={{fontSize:13,color:T.sub,fontFamily:"'Plus Jakarta Sans',sans-serif",
              whiteSpace:"nowrap"}}>{a.body}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ANNOUNCEMENTS SECTION (full cards) ───────────────────────────
function AnnouncementsSection({announcements}){
  if(!announcements.length)return null;
  const prioColor=p=>p==="urgent"?T.red:p==="important"?T.amber:T.prime;
  const prioIcon=p=>p==="urgent"?P.alert:p==="important"?P.announce:P.megaphone;
  return(
    <div style={{padding:"0 36px 48px"}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{width:4,height:28,borderRadius:4,
            background:`linear-gradient(180deg,${T.amber},${T.amber}88)`}}/>
          <div>
            <h2 style={{fontSize:21,fontWeight:700,color:T.text,
              fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.01em"}}>
              Library Announcements
            </h2>
            <p style={{fontSize:13,color:T.sub,marginTop:3,
              fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              Latest updates from the library administration
            </p>
          </div>
        </div>
        <span style={{fontSize:12,fontWeight:600,padding:"4px 12px",borderRadius:20,
          background:T.amber+"18",color:T.amber,border:`1px solid ${T.amber}44`,
          fontFamily:"'Space Grotesk',sans-serif"}}>{announcements.length} Active</span>
      </div>

      {/* Urgent ones first, full width */}
      {announcements.filter(a=>a.priority==="urgent").map((a,i)=>(
        <div key={a.id} style={{background:`linear-gradient(135deg,${T.red}12,${T.red}06)`,
          border:`1px solid ${T.red}44`,borderLeft:`4px solid ${T.red}`,
          borderRadius:18,padding:"22px 26px",marginBottom:14,
          display:"flex",alignItems:"flex-start",gap:18,
          animation:`fadeUp 0.4s ${i*60}ms ease both`}}>
          <div style={{width:46,height:46,borderRadius:14,background:`${T.red}18`,
            display:"flex",alignItems:"center",justifyContent:"center",color:T.red,flexShrink:0}}>
            <Ic p={P.alert} s={22}/>
          </div>
          <div style={{flex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <h3 style={{fontSize:16,fontWeight:700,color:T.text,
                fontFamily:"'Space Grotesk',sans-serif"}}>{a.title}</h3>
              <span style={{fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:20,
                background:`${T.red}20`,color:T.red,border:`1px solid ${T.red}44`,
                fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase",letterSpacing:"0.07em"}}>
                URGENT
              </span>
            </div>
            <p style={{fontSize:14,color:T.sub,lineHeight:1.7,marginBottom:10,
              fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{a.body}</p>
            <p style={{fontSize:12,color:T.muted,display:"flex",alignItems:"center",gap:5,
              fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              <Ic p={P.clock} s={12}/>{a.date} at {a.time}
            </p>
          </div>
        </div>
      ))}

      {/* Normal + important in grid */}
      {announcements.filter(a=>a.priority!=="urgent").length>0&&(
        <div style={{display:"grid",
          gridTemplateColumns:announcements.filter(a=>a.priority!=="urgent").length===1?"1fr":"repeat(2,1fr)",
          gap:14}}>
          {announcements.filter(a=>a.priority!=="urgent").map((a,i)=>{
            const pc=prioColor(a.priority);
            return(
              <div key={a.id}
                style={{background:T.card,border:`1px solid ${T.border}`,borderLeft:`4px solid ${pc}`,
                  borderRadius:18,padding:"22px 24px",
                  display:"flex",gap:16,animation:`fadeUp 0.4s ${i*80}ms ease both`}}>
                <div style={{width:42,height:42,borderRadius:13,background:`${pc}18`,
                  display:"flex",alignItems:"center",justifyContent:"center",color:pc,flexShrink:0}}>
                  <Ic p={prioIcon(a.priority)} s={20}/>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:7}}>
                    <h3 style={{fontSize:15,fontWeight:700,color:T.text,
                      fontFamily:"'Space Grotesk',sans-serif",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.title}</h3>
                    {a.priority==="important"&&(
                      <span style={{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,
                        background:`${pc}18`,color:pc,border:`1px solid ${pc}44`,
                        fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase",
                        letterSpacing:"0.07em",flexShrink:0}}>Important</span>
                    )}
                  </div>
                  <p style={{fontSize:13,color:T.sub,lineHeight:1.65,marginBottom:10,
                    fontFamily:"'Plus Jakarta Sans',sans-serif",
                    display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",
                    overflow:"hidden"}}>{a.body}</p>
                  <p style={{fontSize:11,color:T.muted,display:"flex",alignItems:"center",gap:5,
                    fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                    <Ic p={P.clock} s={11}/>{a.date}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── BOOK CARD ─────────────────────────────────────────────────────
function BookCard({book,onView,delay=0,variant="grid"}){
  const[hov,setHov]=useState(false);
  const sc=statusCfg(book.status),dc=deptColor(book.dept);
  if(variant==="list")return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onView(book)} className="card"
      style={{display:"flex",alignItems:"center",gap:18,padding:"14px 20px",
        background:hov?T.card:T.surface,borderRadius:14,
        border:`1px solid ${hov?dc+"50":T.border}`,
        animation:`fadeUp 0.4s ${delay}ms ease both`,transition:"all 0.25s"}}>
      <SmallCover colors={book.cover} w={50} h={68}/>
      <div style={{flex:1,minWidth:0}}>
        <p style={{fontSize:15,fontWeight:600,color:T.text,marginBottom:4,
          fontFamily:"'Space Grotesk',sans-serif",
          overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{book.title}</p>
        <p style={{fontSize:13,color:T.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{book.author} · {book.dept}</p>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14,flexShrink:0}}>
        <span style={{fontSize:13,color:"#f59e0b",display:"flex",alignItems:"center",gap:5,
          fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>
          <Ic p={P.star} s={13} fill color="#f59e0b"/>{book.rating}
        </span>
        <div style={{fontSize:12,fontWeight:600,padding:"4px 13px",borderRadius:20,
          background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,
          fontFamily:"'Space Grotesk',sans-serif"}}>{sc.label}</div>
      </div>
    </div>
  );
  return(
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onView(book)} className="card"
      style={{background:hov?"#1a1f30":T.card,borderRadius:16,overflow:"hidden",
        border:`1px solid ${hov?dc+"55":T.border}`,
        boxShadow:hov?`0 20px 50px ${dc}22`:"0 2px 12px rgba(0,0,0,0.4)",
        animation:`fadeUp 0.45s ${delay}ms ease both`}}>
      <Cover colors={book.cover} h={190}>
        <div style={{position:"absolute",top:11,left:11,background:sc.bg,color:sc.color,
          border:`1px solid ${sc.border}`,fontSize:9,fontWeight:700,
          padding:"3px 9px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",
          textTransform:"uppercase",letterSpacing:"0.07em"}}>{sc.label}</div>
        {book.isNew&&<div style={{position:"absolute",top:11,right:11,background:T.prime,
          color:"#fff",fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,
          fontFamily:"'Space Grotesk',sans-serif"}}>NEW</div>}
        <div style={{position:"absolute",bottom:11,right:11,background:dc+"28",color:dc,
          border:`1px solid ${dc}50`,fontSize:9,fontWeight:700,padding:"3px 10px",
          borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>{book.dept}</div>
      </Cover>
      <div style={{padding:"16px 18px 18px"}}>
        <p style={{fontSize:14,fontWeight:700,color:T.text,lineHeight:1.4,marginBottom:5,
          fontFamily:"'Space Grotesk',sans-serif",
          overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{book.title}</p>
        <p style={{fontSize:12,color:T.sub,marginBottom:12,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{book.author}</p>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:13,color:"#f59e0b",display:"flex",alignItems:"center",gap:5,
            fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>
            <Ic p={P.star} s={13} fill color="#f59e0b"/>{book.rating}
          </span>
          <span style={{fontSize:11,color:T.muted,fontFamily:"'Space Grotesk',sans-serif"}}>{book.borrows} borrows</span>
        </div>
      </div>
    </div>
  );
}

function SHead({accent=T.prime,label,sub,extra}){
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{width:4,height:28,borderRadius:4,background:`linear-gradient(180deg,${accent},${accent}88)`}}/>
        <div>
          <h2 style={{fontSize:21,fontWeight:700,color:T.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.01em"}}>{label}</h2>
          {sub&&<p style={{fontSize:13,color:T.sub,marginTop:3,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{sub}</p>}
        </div>
      </div>
      {extra}
    </div>
  );
}

// ── AUTH ──────────────────────────────────────────────────────────
function AuthPage({onLogin}){
  const[libId,setLibId]=useState("");const[pass,setPass]=useState("");
  const[loading,setLoading]=useState(false);const[err,setErr]=useState("");
  const submit=()=>{
    if(!libId||!pass){setErr("Please fill in all fields.");return;}
    setLoading(true);setErr("");
    setTimeout(()=>{setLoading(false);onLogin({name:"Ahmed Youssef",libId,dept:"Computer Science"});},1400);
  };
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",
      justifyContent:"center",position:"relative",overflow:"hidden",
      fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{position:"absolute",top:"-12%",left:"-8%",width:520,height:520,
        borderRadius:"50%",background:T.prime+"0f",filter:"blur(130px)",pointerEvents:"none"}}/>
      <div style={{position:"absolute",bottom:"-12%",right:"-8%",width:440,height:440,
        borderRadius:"50%",background:T.indigo+"0b",filter:"blur(110px)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:440,padding:"0 24px",
        display:"flex",flexDirection:"column",alignItems:"center",animation:"fadeUp 0.6s ease"}}>
        <div style={{textAlign:"center",marginBottom:52}}>
          <div style={{width:66,height:66,borderRadius:20,margin:"0 auto 22px",
            background:`linear-gradient(135deg,${T.prime},${T.primeD})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 10px 36px ${T.primeG}`,animation:"glow 3s ease infinite",color:"#fff"}}>
            <Ic p={P.bookOpen} s={30}/>
          </div>
          <h1 style={{fontSize:38,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",
            letterSpacing:"-0.03em",color:T.text,lineHeight:1,marginBottom:10}}>
            Biblio<span style={{color:T.prime}}>Tech</span>
          </h1>
          <p style={{fontSize:14,color:T.sub}}>Public Library Management System</p>
        </div>
        <div style={{width:"100%",background:T.surface,
          border:"1px solid rgba(13,148,136,0.15)",borderRadius:24,
          padding:"44px 44px 40px",boxShadow:"0 40px 100px rgba(0,0,0,0.55)"}}>
          <div style={{textAlign:"center",marginBottom:38}}>
            <h2 style={{fontSize:26,fontWeight:700,color:T.text,
              fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:10}}>Welcome Back</h2>
            <p style={{fontSize:14,color:T.sub,lineHeight:1.65}}>Sign in with your library card ID</p>
          </div>
          {[["Library Card ID",libId,setLibId,P.id,"LIB-20411","text"],
            ["Password",pass,setPass,P.lock,"••••••••","password"]].map(([label,val,setVal,icon,ph,type])=>(
            <div key={label} style={{marginBottom:20}}>
              <label style={{fontSize:12,color:T.sub,fontWeight:600,letterSpacing:"0.07em",
                textTransform:"uppercase",display:"block",marginBottom:10,
                fontFamily:"'Space Grotesk',sans-serif"}}>{label}</label>
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",
                  color:T.muted,pointerEvents:"none"}}><Ic p={icon} s={17}/></div>
                <input className="inp" type={type} value={val}
                  onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}
                  placeholder={ph}
                  style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,
                    borderRadius:13,padding:"16px 16px 16px 48px",
                    color:T.text,fontSize:15,fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
              </div>
            </div>
          ))}
          {err&&<div style={{background:"#ef444415",border:"1px solid #ef444435",
            borderRadius:11,padding:"11px 16px",marginBottom:18}}>
            <p style={{fontSize:13,color:T.red}}>{err}</p>
          </div>}
          <button onClick={submit} className="btn" disabled={loading}
            style={{width:"100%",background:`linear-gradient(135deg,${T.prime},${T.primeD})`,
              borderRadius:14,padding:"16px",color:"#fff",fontSize:15,fontWeight:700,
              fontFamily:"'Space Grotesk',sans-serif",
              boxShadow:`0 8px 30px ${T.primeG}`,opacity:loading?0.75:1,
              display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
            {loading?<><span style={{width:18,height:18,borderRadius:"50%",
              border:"2.5px solid rgba(255,255,255,0.25)",borderTopColor:"#fff",
              animation:"spin 0.7s linear infinite",display:"inline-block"}}/> Signing in...</>:"Sign In"}
          </button>
          <p style={{textAlign:"center",fontSize:13,color:T.muted,marginTop:22,
            fontFamily:"'Plus Jakarta Sans',sans-serif"}}>No account? Visit the library front desk.</p>
        </div>
      </div>
    </div>
  );
}

// ── HOME PAGE ─────────────────────────────────────────────────────
function HomePage({user,onView,onNavigate}){
  const[announcements,setAnnouncements]=useState([]);
  useEffect(()=>{setAnnouncements(getAnnouncements());},[]);

  return(
    <div>
      <Slider books={FEATURED} onView={onView}/>

      {/* Ticker if announcements exist */}
      {announcements.length>0&&<AnnouncementTicker announcements={announcements}/>}

      {/* Stats bar */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,
        padding:"18px 36px",display:"flex",gap:36,alignItems:"center"}}>
        {[["4,821","Books"],["386","Active Loans"],["12","Departments"],["1,247","Members"]].map(([v,l])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:21,fontWeight:700,color:T.prime,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</span>
            <span style={{fontSize:13,color:T.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{l}</span>
          </div>
        ))}
        <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:8,
          background:T.violetG,border:`1px solid ${T.violet}44`,borderRadius:20,padding:"7px 16px"}}>
          <Ic p={P.spark} s={14}/>
          <span style={{fontSize:12,color:T.violet,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>AI Recommendations</span>
        </div>
      </div>

      <div style={{padding:"42px 36px 0"}}>
        {/* AI Recs */}
        <div style={{marginBottom:50}}>
          <SHead accent={T.violet} label="Recommended For You" sub="Curated picks based on your reading history"/>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
            {AI_RECS.map((b,i)=><BookCard key={b.id} book={b} onView={onView} delay={i*80}/>)}
          </div>
        </div>
        {/* Trending */}
        <div style={{marginBottom:50}}>
          <SHead accent={T.cyan} label="Trending Now" sub="Most borrowed this week"
            extra={<span onClick={()=>onNavigate("explore")}
              style={{fontSize:13,color:T.prime,fontWeight:600,cursor:"pointer",
                fontFamily:"'Space Grotesk',sans-serif"}}>Browse all →</span>}
          />
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:18}}>
            {TRENDING.map((b,i)=><BookCard key={b.id} book={b} onView={onView} delay={i*70}/>)}
          </div>
        </div>
      </div>

      {/* Announcements section — full width below books */}
      <AnnouncementsSection announcements={announcements}/>
    </div>
  );
}

// ── EXPLORE ───────────────────────────────────────────────────────
function ExplorePage({onView}){
  const[q,setQ]=useState("");const[dept,setDept]=useState("All");
  const[stat,setStat]=useState("All");const[vw,setVw]=useState("grid");const[sort,setSort]=useState("popular");
  const filtered=BOOKS.filter(b=>{
    const lq=q.toLowerCase();
    return(!lq||b.title.toLowerCase().includes(lq)||b.author.toLowerCase().includes(lq)||b.dept.toLowerCase().includes(lq))
      &&(dept==="All"||b.dept===dept)&&(stat==="All"||b.status===stat);
  }).sort((a,b)=>sort==="popular"?b.borrows-a.borrows:sort==="rating"?b.rating-a.rating:a.title.localeCompare(b.title));
  return(
    <div style={{display:"flex",minHeight:"calc(100vh - 74px)"}}>
      <aside style={{width:224,flexShrink:0,background:T.surface,borderRight:`1px solid ${T.border}`,
        padding:"28px 16px",position:"sticky",top:74,height:"calc(100vh - 74px)",overflowY:"auto"}}>
        <p style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:18,display:"flex",alignItems:"center",gap:7,
          fontFamily:"'Space Grotesk',sans-serif"}}><Ic p={P.filter} s={13}/> Filters</p>
        <p style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>Department</p>
        {DEPTS.map(d=>(
          <button key={d} onClick={()=>setDept(d)} className="btn"
            style={{display:"block",width:"100%",background:dept===d?T.primeG:"transparent",
              border:`1px solid ${dept===d?T.prime+"44":T.border}`,borderRadius:9,
              padding:"9px 13px",color:dept===d?T.prime:T.sub,
              fontSize:13,fontWeight:dept===d?600:400,fontFamily:"'Plus Jakarta Sans',sans-serif",
              textAlign:"left",transition:"all 0.2s",marginBottom:3}}>{d}</button>
        ))}
        <p style={{fontSize:11,color:T.muted,fontWeight:700,letterSpacing:"0.1em",
          textTransform:"uppercase",marginBottom:12,marginTop:20,fontFamily:"'Space Grotesk',sans-serif"}}>Availability</p>
        {["All","available","borrowed","reserved"].map(s=>(
          <button key={s} onClick={()=>setStat(s)} className="btn"
            style={{display:"block",width:"100%",background:stat===s?T.card:"transparent",
              border:`1px solid ${stat===s?T.border:"transparent"}`,borderRadius:9,
              padding:"9px 13px",color:stat===s?T.text:T.sub,
              fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",
              textAlign:"left",transition:"all 0.2s",marginBottom:3}}>
            {s==="All"?"All Statuses":statusCfg(s).label}
          </button>
        ))}
      </aside>
      <div style={{flex:1,padding:"30px 32px"}}>
        <div style={{display:"flex",gap:12,marginBottom:24,alignItems:"center"}}>
          <div style={{flex:1,position:"relative"}}>
            <div style={{position:"absolute",left:15,top:"50%",transform:"translateY(-50%)",
              color:T.muted,pointerEvents:"none"}}><Ic p={P.search} s={17}/></div>
            <input className="inp" value={q} onChange={e=>setQ(e.target.value)}
              placeholder="Search by title, author, or department..."
              style={{width:"100%",background:T.card,border:`1px solid ${T.border}`,
                borderRadius:12,padding:"13px 16px 13px 44px",color:T.text,fontSize:14,
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,
              padding:"13px 16px",color:T.sub,fontSize:13,
              fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",cursor:"pointer"}}>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="alpha">A to Z</option>
          </select>
          <div style={{display:"flex",background:T.card,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
            {[["grid",P.grid],["list",P.list]].map(([v,ic])=>(
              <button key={v} onClick={()=>setVw(v)} className="btn"
                style={{background:vw===v?T.prime+"22":"transparent",padding:"11px 14px",
                  color:vw===v?T.prime:T.muted}}><Ic p={ic} s={16}/></button>
            ))}
          </div>
        </div>
        <p style={{fontSize:14,color:T.sub,marginBottom:20,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
          <strong style={{color:T.text,fontFamily:"'Space Grotesk',sans-serif"}}>{filtered.length}</strong> books found
        </p>
        {vw==="grid"
          ?<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
            {filtered.map((b,i)=><BookCard key={b.id} book={b} onView={onView} delay={i*40}/>)}
          </div>
          :<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {filtered.map((b,i)=><BookCard key={b.id} book={b} onView={onView} delay={i*30} variant="list"/>)}
          </div>}
        {!filtered.length&&<div style={{textAlign:"center",padding:"80px 20px"}}>
          <div style={{color:T.muted,display:"flex",justifyContent:"center",marginBottom:16}}>
            <Ic p={P.search} s={52}/></div>
          <p style={{fontSize:18,fontWeight:700,color:T.text,marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>No books found</p>
          <p style={{fontSize:14,color:T.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Try different keywords or clear the filters</p>
        </div>}
      </div>
    </div>
  );
}

// ── BOOK DETAIL ───────────────────────────────────────────────────
function BookDetailPage({book,user,onBack}){
  const[sending,setSending]=useState(false);
  const[requested,setRequested]=useState(()=>hasActiveRequest(book.id,user.libId));
  const sc=statusCfg(book.status),dc=deptColor(book.dept);
  const handleBorrow=()=>{
    if(book.status!=="available"||requested)return;
    setSending(true);
    setTimeout(()=>{
      const ok=saveRequest({bookId:book.id,bookTitle:book.title,bookAuthor:book.author,
        bookDept:book.dept,bookCover:book.cover,
        studentId:user.libId,studentName:user.name,studentDept:user.dept});
      setSending(false);if(ok)setRequested(true);
    },1200);
  };
  return(
    <div style={{padding:"36px",maxWidth:940,margin:"0 auto",animation:"fadeIn 0.4s ease",
      fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <button onClick={onBack} className="btn"
        style={{display:"flex",alignItems:"center",gap:9,border:`1px solid ${T.border}`,
          borderRadius:11,padding:"10px 18px",color:T.sub,fontSize:14,
          fontFamily:"'Plus Jakarta Sans',sans-serif",marginBottom:30,cursor:"pointer"}}>
        <Ic p={P.back} s={16}/> Back
      </button>
      <div style={{display:"grid",gridTemplateColumns:"310px 1fr",gap:36}}>
        <div>
          <div style={{borderRadius:18,overflow:"hidden",border:`2px solid ${dc}44`,
            boxShadow:`0 28px 70px ${book.cover[1]}40`,animation:"float 4s ease infinite"}}>
            <Cover colors={book.cover} h={380}>
              <div style={{position:"absolute",bottom:16,left:"50%",transform:"translateX(-50%)",
                background:sc.bg,color:sc.color,border:`1px solid ${sc.border}`,
                fontSize:11,fontWeight:700,padding:"6px 18px",borderRadius:20,whiteSpace:"nowrap",
                fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase",letterSpacing:"0.07em"}}>{sc.label}</div>
            </Cover>
          </div>
          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"20px",marginTop:18}}>
            {[["Book ID",book.id],["ISBN",book.isbn],["Pages",book.pages],["Year",book.year]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:13,color:T.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{k}</span>
                <span style={{fontSize:13,color:T.text,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
            <span style={{background:dc+"22",color:dc,border:`1px solid ${dc}44`,fontSize:12,fontWeight:600,
              padding:"5px 14px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>{book.dept}</span>
            <span style={{fontSize:13,color:"#f59e0b",display:"flex",alignItems:"center",gap:5,
              fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>
              <Ic p={P.star} s={13} fill color="#f59e0b"/>{book.rating}/5
            </span>
          </div>
          <h1 style={{fontSize:32,fontWeight:700,color:T.text,lineHeight:1.2,marginBottom:10,
            fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>{book.title}</h1>
          <p style={{fontSize:16,color:T.sub,marginBottom:24,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            by <strong style={{color:T.text}}>{book.author}</strong>
          </p>
          <p style={{fontSize:15,color:T.sub,lineHeight:1.8,marginBottom:30,
            background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,
            padding:"20px 22px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{book.desc}</p>
          {requested?(
            <div style={{background:"#f59e0b12",border:"1px solid #f59e0b40",borderRadius:16,
              padding:"24px 28px",display:"flex",alignItems:"center",gap:16,animation:"scaleIn 0.3s ease"}}>
              <div style={{width:48,height:48,borderRadius:14,background:"#f59e0b22",
                display:"flex",alignItems:"center",justifyContent:"center",color:T.amber,flexShrink:0}}>
                <Ic p={P.pending} s={24}/></div>
              <div>
                <p style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>Request Sent — Awaiting Approval</p>
                <p style={{fontSize:13,color:T.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>The librarian will review your request and notify you.</p>
              </div>
            </div>
          ):(
            <div style={{display:"flex",gap:14}}>
              <button onClick={handleBorrow} disabled={book.status!=="available"||sending} className="btn"
                style={{flex:2,background:book.status==="available"?`linear-gradient(135deg,${T.prime},${T.primeD})`:T.dim,
                  borderRadius:14,padding:"17px",color:"#fff",fontSize:15,fontWeight:700,
                  fontFamily:"'Space Grotesk',sans-serif",cursor:book.status==="available"?"pointer":"not-allowed",
                  boxShadow:book.status==="available"?`0 8px 28px ${T.primeG}`:"none",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
                {sending?<><span style={{width:18,height:18,borderRadius:"50%",
                  border:"2.5px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",
                  animation:"spin 0.7s linear infinite",display:"inline-block"}}/> Sending...</>
                  :book.status==="available"?<><Ic p={P.bookOpen} s={17}/> Request to Borrow</>:sc.label}
              </button>
              <button className="btn"
                style={{flex:1,background:T.surface,border:`1px solid ${T.border}`,
                  borderRadius:14,padding:"17px",color:T.sub,fontSize:14,fontWeight:600,
                  fontFamily:"'Space Grotesk',sans-serif",cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <Ic p={P.heart} s={16}/> Wishlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── MY LIBRARY ────────────────────────────────────────────────────
function MyLibraryPage({user}){
  const[tab,setTab]=useState("loans");
  const myRequests=getRequests().filter(r=>r.studentId===user.libId);
  return(
    <div style={{padding:"36px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{background:`linear-gradient(135deg,${T.surface},${T.card})`,
        border:`1px solid ${T.border}`,borderRadius:20,padding:"30px 36px",
        marginBottom:30,display:"flex",alignItems:"center",gap:26,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-50,right:-50,width:200,height:200,
          borderRadius:"50%",background:T.prime+"0e",filter:"blur(60px)",pointerEvents:"none"}}/>
        <div style={{width:72,height:72,borderRadius:20,flexShrink:0,
          background:`linear-gradient(135deg,#1d4ed8,${T.cyan}50)`,border:`2px solid ${T.cyan}40`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:28,fontWeight:700,color:T.cyan,fontFamily:"'Space Grotesk',sans-serif"}}>{user.name[0]}</div>
        <div style={{flex:1}}>
          <p style={{fontSize:22,fontWeight:700,color:T.text,fontFamily:"'Space Grotesk',sans-serif",
            letterSpacing:"-0.01em",marginBottom:5}}>{user.name}</p>
          <p style={{fontSize:14,color:T.sub}}>Card ID: <strong style={{color:T.text,fontFamily:"'Space Grotesk',sans-serif"}}>{user.libId}</strong> · {user.dept}</p>
        </div>
        <div style={{display:"flex",gap:28}}>
          {[["3","Active",T.prime],["4","Read",T.cyan],[String(myRequests.filter(r=>r.status==="pending").length),"Pending",T.amber]].map(([v,l,c])=>(
            <div key={l} style={{textAlign:"center"}}>
              <p style={{fontSize:28,fontWeight:700,color:c,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>{v}</p>
              <p style={{fontSize:12,color:T.sub}}>{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div style={{display:"flex",background:T.surface,border:`1px solid ${T.border}`,
        borderRadius:14,padding:5,marginBottom:26,width:"fit-content"}}>
        {[["loans","Current Loans"],["requests","My Requests"],["history","History"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} className="btn"
            style={{background:tab===id?`linear-gradient(135deg,${T.prime},${T.primeD})`:"transparent",
              borderRadius:10,padding:"10px 22px",color:tab===id?"#fff":T.sub,fontSize:14,
              fontWeight:600,fontFamily:"'Space Grotesk',sans-serif",
              boxShadow:tab===id?`0 4px 14px ${T.primeG}`:"none",position:"relative"}}>
            {label}
            {id==="requests"&&myRequests.filter(r=>r.status==="pending").length>0&&(
              <span style={{position:"absolute",top:-4,right:-4,width:16,height:16,
                borderRadius:"50%",background:T.amber,color:"#000",
                fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",
                border:`2px solid ${T.bg}`}}>{myRequests.filter(r=>r.status==="pending").length}</span>
            )}
          </button>
        ))}
      </div>
      {tab==="loans"&&(
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {MY_LOANS.map((loan,i)=>{
            const over=loan.daysLeft<0,soon=!over&&loan.daysLeft<=3;
            const sc=over?T.red:soon?T.amber:T.green;
            return(
              <div key={i} style={{background:T.surface,border:`1px solid ${over?"#ef444440":T.border}`,
                borderRadius:18,padding:"24px 28px",display:"flex",alignItems:"center",gap:22,
                animation:`fadeUp 0.4s ${i*100}ms ease both`}}>
                <SmallCover colors={loan.cover} w={56} h={74}/>
                <div style={{flex:1}}>
                  <p style={{fontSize:16,fontWeight:700,color:T.text,marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{loan.title}</p>
                  <p style={{fontSize:13,color:T.sub,marginBottom:6}}>{loan.author}</p>
                  <p style={{fontSize:12,color:T.muted,display:"flex",alignItems:"center",gap:6}}>
                    <Ic p={P.clock} s={13}/>Borrowed: {loan.borrowed}
                  </p>
                </div>
                <div style={{textAlign:"center",background:over?"#ef444418":soon?"#f59e0b18":"#22c55e18",
                  border:`1px solid ${sc}44`,borderRadius:16,padding:"14px 24px"}}>
                  <p style={{fontSize:30,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:sc,lineHeight:1}}>
                    {over?`+${Math.abs(loan.daysLeft)}`:loan.daysLeft}
                  </p>
                  <p style={{fontSize:11,fontWeight:600,color:sc,textTransform:"uppercase",letterSpacing:"0.07em",marginTop:3,fontFamily:"'Space Grotesk',sans-serif"}}>
                    {over?"overdue":"days left"}
                  </p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:12,color:T.sub,marginBottom:10}}>
                    Due: <strong style={{color:T.text,fontFamily:"'Space Grotesk',sans-serif"}}>{loan.due}</strong>
                  </p>
                  <div style={{fontSize:12,fontWeight:600,padding:"5px 12px",borderRadius:20,
                    background:over?"#ef444420":soon?"#f59e0b20":"#22c55e20",
                    color:sc,border:`1px solid ${sc}44`,fontFamily:"'Space Grotesk',sans-serif"}}>
                    {over?"Overdue":soon?"Due Soon":"Active"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {tab==="requests"&&(
        <div>
          {myRequests.length===0?(
            <div style={{textAlign:"center",padding:"60px 20px"}}>
              <div style={{color:T.muted,display:"flex",justifyContent:"center",marginBottom:16}}><Ic p={P.bookOpen} s={52}/></div>
              <p style={{fontSize:17,fontWeight:700,color:T.text,marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>No requests yet</p>
              <p style={{fontSize:14,color:T.sub}}>When you request to borrow a book, it will appear here.</p>
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {myRequests.map((r,i)=>{
                const isPending=r.status==="pending",isApproved=r.status==="approved";
                const sc=isPending?{color:T.amber,bg:"#f59e0b15",border:"#f59e0b40",label:"Pending"}
                  :isApproved?{color:T.green,bg:"#22c55e15",border:"#22c55e40",label:"Approved"}
                  :{color:T.red,bg:"#ef444415",border:"#ef444440",label:"Declined"};
                return(
                  <div key={r.id} style={{background:T.surface,border:`1px solid ${T.border}`,
                    borderRadius:16,padding:"20px 24px",display:"flex",alignItems:"center",gap:18,
                    animation:`fadeUp 0.4s ${i*80}ms ease both`}}>
                    <SmallCover colors={r.bookCover||["#1e3a8a","#1e40af","#1d4ed8"]} w={50} h={68}/>
                    <div style={{flex:1}}>
                      <p style={{fontSize:15,fontWeight:700,color:T.text,marginBottom:4,fontFamily:"'Space Grotesk',sans-serif"}}>{r.bookTitle}</p>
                      <p style={{fontSize:13,color:T.sub,marginBottom:4}}>{r.bookAuthor}</p>
                      <p style={{fontSize:12,color:T.muted,display:"flex",alignItems:"center",gap:5}}>
                        <Ic p={P.clock} s={12}/>Requested: {r.date}
                      </p>
                    </div>
                    <div style={{background:sc.bg,border:`1px solid ${sc.border}`,borderRadius:20,
                      padding:"6px 16px",fontSize:13,fontWeight:700,color:sc.color,
                      fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:7}}>
                      <Ic p={isPending?P.pending:P.approved} s={14}/>{sc.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
      {tab==="history"&&(
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:18}}>
          {READ_HISTORY.map((b,i)=>(
            <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,
              borderRadius:16,overflow:"hidden",animation:`fadeUp 0.4s ${i*80}ms ease both`}}>
              <Cover colors={b.cover} h={130}/>
              <div style={{padding:"16px 18px"}}>
                <p style={{fontSize:14,fontWeight:700,color:T.text,marginBottom:5,fontFamily:"'Space Grotesk',sans-serif",
                  overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{b.title}</p>
                <p style={{fontSize:12,color:T.sub,marginBottom:10,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{b.author}</p>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:T.muted,fontFamily:"'Space Grotesk',sans-serif"}}>{b.date}</span>
                  <span style={{background:"#22c55e15",color:T.green,border:"1px solid #22c55e35",
                    fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,
                    fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:5}}>
                    <Ic p={P.check} s={11}/>Read
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CHATBOT ───────────────────────────────────────────────────────
function ChatbotWidget(){
  const[open,setOpen]=useState(false);
  const[msgs,setMsgs]=useState([{role:"ai",text:"Hello! Ask me about any book or what you'd like to read."}]);
  const[input,setInput]=useState("");const[loading,setLoading]=useState(false);const[unread,setUnread]=useState(1);
  const ref=useRef(null);
  useEffect(()=>{ref.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  useEffect(()=>{if(open)setUnread(0);},[open]);
  const send=async(text)=>{
    const q=(text||input).trim();if(!q)return;
    setInput("");setMsgs(m=>[...m,{role:"user",text:q}]);setLoading(true);
    const list=BOOKS.slice(0,8).map(b=>`"${b.title}" by ${b.author} (${b.dept}, ${b.status})`).join("\n");
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:600,
          system:`You are BiblioTech library assistant. Be friendly, concise (2-3 sentences). Books:\n${list}\nBold titles with **title**.`,
          messages:[{role:"user",content:q}]})});
      const data=await res.json();
      const txt=data.content?.map(c=>c.text||"").join("")||"Let me check that.";
      setMsgs(m=>[...m,{role:"ai",text:txt}]);
    }catch{setMsgs(m=>[...m,{role:"ai",text:"Connection issue. Please try again."}]);}
    setLoading(false);
  };
  const renderText=t=>t.split(/(\*\*[^*]+\*\*)/g).map((p,i)=>
    p.startsWith("**")?<strong key={i} style={{color:T.prime}}>{p.slice(2,-2)}</strong>:p);
  return(
    <div style={{position:"fixed",bottom:26,right:26,zIndex:9999,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      {open&&(
        <div style={{position:"absolute",bottom:74,right:0,width:356,
          background:T.surface,border:"1px solid rgba(13,148,136,0.2)",
          borderRadius:22,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.75)",
          animation:"scaleIn 0.25s cubic-bezier(0.34,1.4,0.64,1)",
          transformOrigin:"bottom right",display:"flex",flexDirection:"column",height:450}}>
          <div style={{background:`linear-gradient(135deg,${T.prime},${T.primeD})`,
            padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:12}}>
              <div style={{width:36,height:36,borderRadius:11,background:"rgba(0,0,0,0.2)",
                display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
                <Ic p={P.bot} s={18}/></div>
              <div>
                <p style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:"'Space Grotesk',sans-serif"}}>Library Assistant</p>
                <p style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>Online · AI Powered</p>
              </div>
            </div>
            <button onClick={()=>setOpen(false)} className="btn"
              style={{background:"rgba(0,0,0,0.2)",borderRadius:"50%",width:30,height:30,
                display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
              <Ic p={P.back} s={15}/></button>
          </div>
          <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",
                marginBottom:12,animation:"fadeUp 0.25s ease"}}>
                {m.role==="ai"&&<div style={{width:28,height:28,borderRadius:"50%",background:T.prime,
                  flexShrink:0,marginRight:9,marginTop:2,
                  display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
                  <Ic p={P.bot} s={14}/></div>}
                <div style={{maxWidth:"80%",padding:"10px 14px",
                  borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  background:m.role==="user"?`linear-gradient(135deg,${T.prime},${T.primeD})`:T.card,
                  border:m.role==="ai"?`1px solid ${T.border}`:"none",
                  fontSize:14,color:T.text,lineHeight:1.6}}>
                  {renderText(m.text)}
                </div>
              </div>
            ))}
            {loading&&<div style={{display:"flex",gap:9,alignItems:"center",marginBottom:12}}>
              <div style={{width:28,height:28,borderRadius:"50%",background:T.prime,
                display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}>
                <Ic p={P.bot} s={14}/></div>
              <div style={{background:T.card,border:`1px solid ${T.border}`,
                borderRadius:"16px 16px 16px 4px",padding:"10px 15px",display:"flex",gap:6}}>
                {[0,1,2].map(i=><span key={i} style={{width:7,height:7,borderRadius:"50%",
                  background:T.prime,display:"inline-block",animation:`bounce 1s ${i*0.2}s infinite`}}/>)}
              </div>
            </div>}
            <div ref={ref}/>
          </div>
          <div style={{padding:"12px 14px",borderTop:`1px solid ${T.border}`,display:"flex",gap:9}}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about a book..."
              className="inp"
              style={{flex:1,background:T.card,border:`1px solid ${T.border}`,
                borderRadius:12,padding:"10px 14px",color:T.text,fontSize:14,
                fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
            <button onClick={()=>send()} className="btn"
              style={{background:`linear-gradient(135deg,${T.prime},${T.primeD})`,
                borderRadius:12,width:42,color:"#fff",
                display:"flex",alignItems:"center",justifyContent:"center",
                boxShadow:`0 4px 16px ${T.primeG}`}}>
              <Ic p={P.send} s={16}/></button>
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(o=>!o)} className="btn"
        style={{width:58,height:58,borderRadius:"50%",
          background:open?T.dim:`linear-gradient(135deg,${T.prime},${T.primeD})`,
          color:"#fff",boxShadow:open?"none":`0 8px 32px ${T.primeG}`,
          transition:"all 0.3s cubic-bezier(0.34,1.4,0.64,1)",
          animation:open?"none":"glow 3s ease infinite",
          display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        <Ic p={open?P.back:P.bot} s={24}/>
        {!open&&unread>0&&<span style={{position:"absolute",top:-2,right:-2,
          background:T.red,color:"#fff",fontSize:10,fontWeight:700,
          width:19,height:19,borderRadius:"50%",
          display:"flex",alignItems:"center",justifyContent:"center",
          border:`2px solid ${T.bg}`,animation:"pulse 2s infinite"}}>{unread}</span>}
      </button>
    </div>
  );
}

// ── NAVBAR ────────────────────────────────────────────────────────
function Navbar({user,activePage,onNavigate,onLogout}){
  const NAVS=[{id:"home",label:"Home",icon:P.home},{id:"explore",label:"Explore",icon:P.explore},{id:"library",label:"My Library",icon:P.lib}];
  return(
    <nav style={{position:"sticky",top:0,zIndex:100,height:74,
      background:"rgba(7,9,15,0.96)",backdropFilter:"blur(20px)",
      borderBottom:"1px solid rgba(13,148,136,0.12)",
      display:"flex",alignItems:"center",padding:"0 36px",
      justifyContent:"space-between",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={()=>onNavigate("home")}>
        <div style={{width:40,height:40,borderRadius:12,
          background:`linear-gradient(135deg,${T.prime},${T.primeD})`,
          display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",
          boxShadow:`0 4px 16px ${T.primeG}`}}><Ic p={P.bookOpen} s={21}/></div>
        <span style={{fontSize:21,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",
          letterSpacing:"-0.02em",color:T.text}}>
          Biblio<span style={{color:T.prime}}>Tech</span>
        </span>
      </div>
      <div style={{display:"flex",gap:6}}>
        {NAVS.map(n=>(
          <button key={n.id} onClick={()=>onNavigate(n.id)} className="btn"
            style={{display:"flex",alignItems:"center",gap:8,
              background:activePage===n.id?T.primeG:"transparent",
              border:`1px solid ${activePage===n.id?T.prime+"44":"transparent"}`,
              borderRadius:12,padding:"10px 18px",
              color:activePage===n.id?T.prime:T.sub,
              fontSize:14,fontWeight:activePage===n.id?600:400,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
            <Ic p={n.icon} s={16}/>{n.label}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14}}>
        <div style={{position:"relative"}}>
          <div style={{width:42,height:42,borderRadius:12,background:T.surface,
            border:`1px solid ${T.border}`,display:"flex",alignItems:"center",
            justifyContent:"center",color:T.sub,cursor:"pointer"}}>
            <Ic p={P.bell} s={18}/></div>
          <span style={{position:"absolute",top:9,right:9,width:8,height:8,
            borderRadius:"50%",background:T.prime,border:`1.5px solid ${T.bg}`,animation:"pulse 2s infinite"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,background:T.surface,
          border:`1px solid ${T.border}`,borderRadius:12,padding:"6px 16px 6px 8px",cursor:"pointer"}}>
          <div style={{width:34,height:34,borderRadius:11,
            background:`linear-gradient(135deg,#1d4ed8,${T.cyan}50)`,border:`1px solid ${T.cyan}40`,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:15,fontWeight:700,color:T.cyan,fontFamily:"'Space Grotesk',sans-serif"}}>{user.name[0]}</div>
          <span style={{fontSize:14,color:T.text,fontWeight:500,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{user.name.split(" ")[0]}</span>
        </div>
        <button onClick={onLogout} className="btn"
          style={{border:`1px solid ${T.border}`,borderRadius:11,padding:"10px 16px",
            color:T.sub,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
          <Ic p={P.logout} s={16}/>
          <span style={{fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Logout</span>
        </button>
      </div>
    </nav>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────
export default function BiblioTech(){
  const[user,setUser]=useState(null);
  const[page,setPage]=useState("home");
  const[book,setBook]=useState(null);
  const handleView=b=>{setBook(b);setPage("detail");};
  const handleNav=p=>{setPage(p);setBook(null);};
  return(
    <>
      <style>{CSS}</style>
      {!user
        ?<AuthPage onLogin={setUser}/>
        :<div style={{minHeight:"100vh",background:T.bg,color:T.text}}>
          <Navbar user={user} activePage={page} onNavigate={handleNav} onLogout={()=>setUser(null)}/>
          {page==="home"   &&<HomePage user={user} onView={handleView} onNavigate={handleNav}/>}
          {page==="explore"&&<ExplorePage onView={handleView}/>}
          {page==="library"&&<MyLibraryPage user={user}/>}
          {page==="detail" &&book&&<BookDetailPage book={book} user={user} onBack={()=>setPage("explore")}/>}
          <ChatbotWidget/>
          <footer style={{borderTop:`1px solid ${T.border}`,padding:"20px 36px",
            display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:15,fontWeight:700,color:T.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.01em"}}>
              Biblio<span style={{color:T.prime}}>Tech</span>
            </span>
            <p style={{fontSize:12,color:T.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>© 2026 BiblioTech · Public Library System</p>
          </footer>
        </div>
      }
    </>
  );
}

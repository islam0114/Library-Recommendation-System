import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   BIBLIO TECH — Benha University Library · Student Frontend
   Pages: Auth → Home → Explore → Book Detail → My Library
   + Floating AI Chatbot Widget
═══════════════════════════════════════════════════════════════ */

// ── THEME ────────────────────────────────────────────────────────
const T = {
  bg:      "#08090d",
  bg2:     "#0e101a",
  surface: "#12151f",
  card:    "#181c28",
  border:  "rgba(255,255,255,0.07)",
  orange:  "#f97316",
  orangeL: "#fb923c",
  orangeD: "#ea580c",
  orangeG: "#f9731630",
  cyan:    "#06b6d4",
  cyanG:   "#06b6d420",
  purple:  "#8b5cf6",
  purpleG: "#8b5cf620",
  green:   "#22c55e",
  red:     "#ef4444",
  yellow:  "#f59e0b",
  text:    "#eceaf5",
  muted:   "#64748b",
  dim:     "#1e2535",
};

// ── MOCK DATA ────────────────────────────────────────────────────
const DEPARTMENTS = ["All","Engineering","Medicine","Pharmacy","Science","Arts","Law","Commerce","Computer Science","Architecture"];

const BOOKS = [
  { id:"B001", title:"Calculus: Early Transcendentals", author:"James Stewart",      dept:"Engineering",       rating:4.8, borrows:134, status:"available",  cover:"#1e40af", year:2015, isbn:"978-1285741550", pages:1368, desc:"The most widely used calculus textbook, covering single-variable and multivariable calculus with clarity and depth." },
  { id:"B002", title:"Gray's Anatomy",                  author:"Henry Gray",          dept:"Medicine",          rating:4.9, borrows:201, status:"borrowed",   cover:"#7f1d1d", year:2020, isbn:"978-0702077357", pages:1576, desc:"The definitive anatomical reference, used by medical students worldwide for over 150 years." },
  { id:"B003", title:"Introduction to Algorithms",      author:"Cormen et al.",       dept:"Computer Science",  rating:4.9, borrows:178, status:"available",  cover:"#14532d", year:2009, isbn:"978-0262033848", pages:1292, desc:"The most comprehensive textbook on computer algorithms — known as CLRS, essential for every CS student." },
  { id:"B004", title:"Organic Chemistry",               author:"Paula Y. Bruice",     dept:"Pharmacy",          rating:4.6, borrows:89,  status:"available",  cover:"#4c1d95", year:2016, isbn:"978-0134042282", pages:1344, desc:"A modern approach to organic chemistry with a focus on biological applications and reaction mechanisms." },
  { id:"B005", title:"Principles of Physics",           author:"Serway & Jewett",     dept:"Science",           rating:4.7, borrows:112, status:"reserved",   cover:"#0c4a6e", year:2013, isbn:"978-1133104261", pages:1152, desc:"Comprehensive physics covering mechanics, thermodynamics, electromagnetism, optics, and modern physics." },
  { id:"B006", title:"The Architecture of Happiness",   author:"Alain de Botton",     dept:"Architecture",      rating:4.5, borrows:67,  status:"available",  cover:"#78350f", year:2006, isbn:"978-0375424434", pages:280,  desc:"A philosophical meditation on how architecture shapes our identity, moods, and sense of self." },
  { id:"B007", title:"Business Law",                    author:"Henry R. Cheeseman",  dept:"Law",               rating:4.4, borrows:55,  status:"available",  cover:"#1c1917", year:2019, isbn:"978-0135085929", pages:912,  desc:"Comprehensive coverage of the legal environment of business, contracts, torts, and commercial law." },
  { id:"B008", title:"Macroeconomics",                  author:"N. Gregory Mankiw",   dept:"Commerce",          rating:4.7, borrows:143, status:"borrowed",   cover:"#064e3b", year:2018, isbn:"978-1319105990", pages:544,  desc:"The leading macroeconomics textbook, balancing theory with real-world applications and policy analysis." },
  { id:"B009", title:"Clean Code",                      author:"Robert C. Martin",    dept:"Computer Science",  rating:4.8, borrows:156, status:"available",  cover:"#1e293b", year:2008, isbn:"978-0132350884", pages:431,  desc:"A handbook of agile software craftsmanship — essential reading for every professional developer." },
  { id:"B010", title:"Human Anatomy & Physiology",      author:"Marieb & Hoehn",      dept:"Medicine",          rating:4.8, borrows:167, status:"available",  cover:"#7c2d12", year:2018, isbn:"978-0134580999", pages:1264, desc:"The gold standard for human anatomy and physiology, with vivid illustrations and clinical applications." },
  { id:"B011", title:"Strength of Materials",           author:"R.K. Bansal",         dept:"Engineering",       rating:4.5, borrows:78,  status:"available",  cover:"#312e81", year:2010, isbn:"978-8131808146", pages:1040, desc:"A comprehensive text on the mechanics of materials, stress, strain, and structural analysis." },
  { id:"B012", title:"World Literature Anthology",      author:"Various Authors",      dept:"Arts",              rating:4.3, borrows:42,  status:"available",  cover:"#701a75", year:2014, isbn:"978-0393934168", pages:2800, desc:"A sweeping collection of world literature from ancient epics to contemporary prose and poetry." },
];

const MY_LOANS = [
  { bookId:"B001", title:"Calculus: Early Transcendentals", author:"James Stewart",     borrowed:"Feb 20, 2026", due:"Mar 13, 2026", daysLeft:8,  cover:"#1e40af" },
  { bookId:"B009", title:"Clean Code",                      author:"Robert C. Martin",  borrowed:"Feb 25, 2026", due:"Mar 11, 2026", daysLeft:6,  cover:"#1e293b" },
  { bookId:"B005", title:"Principles of Physics",           author:"Serway & Jewett",   borrowed:"Feb 10, 2026", due:"Mar 03, 2026", daysLeft:-2, cover:"#0c4a6e" },
];

const READ_HISTORY = [
  { title:"Data Structures & Algorithms", author:"Mark Allen Weiss",   cover:"#134e4a", date:"Jan 2026" },
  { title:"Discrete Mathematics",         author:"Kenneth H. Rosen",   cover:"#1e3a5f", date:"Dec 2025" },
  { title:"Operating Systems",            author:"Abraham Silberschatz",cover:"#292524", date:"Nov 2025" },
  { title:"Database System Concepts",     author:"Silberschatz et al.", cover:"#1a1a2e", date:"Oct 2025" },
];

const AI_RECOMMENDATIONS = [BOOKS[2], BOOKS[8], BOOKS[0], BOOKS[4]];
const TRENDING = [BOOKS[1], BOOKS[7], BOOKS[9], BOOKS[2], BOOKS[0], BOOKS[8]];

// ── HELPERS ──────────────────────────────────────────────────────
const deptColor = (d) => ({ Engineering:"#f97316", Medicine:"#ef4444", Pharmacy:"#8b5cf6", Science:"#06b6d4", Arts:"#ec4899", Law:"#f59e0b", Commerce:"#22c55e", "Computer Science":"#3b82f6", Architecture:"#a78bfa" }[d] || "#64748b");

const statusConfig = (s) => ({
  available: { label:"Available",  color:"#22c55e", bg:"#22c55e18", border:"#22c55e44", dot:"●" },
  borrowed:  { label:"Borrowed",   color:"#ef4444", bg:"#ef444418", border:"#ef444444", dot:"○" },
  reserved:  { label:"Reserved",   color:"#f59e0b", bg:"#f59e0b18", border:"#f59e0b44", dot:"◐" },
}[s] || { label:s, color:"#64748b", bg:"#64748b18", border:"#64748b44", dot:"○" });

// ── GLOBAL CSS ───────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Bebas+Neue&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #08090d; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #1e2535; border-radius: 6px; }
  input::placeholder, textarea::placeholder { color: #2a3347; }
  input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.4); }
  select option { background: #12151f; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes scaleIn  { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
  @keyframes slideLeft{ from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:0.35} }
  @keyframes bounce   { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-7px)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes shimmer  { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  @keyframes glow     { 0%,100%{box-shadow:0 0 16px #f9731640} 50%{box-shadow:0 0 36px #f9731670} }
  @keyframes floatUp  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

  .bt-card { transition: all 0.28s cubic-bezier(0.34,1.2,0.64,1); cursor:pointer; }
  .bt-card:hover { transform: translateY(-6px) scale(1.02); }
  .bt-btn { transition: all 0.2s ease; cursor:pointer; }
  .bt-btn:hover { opacity:0.88; transform:translateY(-1px); }
  .bt-btn:active { transform:scale(0.97); }
  .bt-input:focus { outline:none; border-color: #f9731666 !important; }
  .bt-row:hover { background: rgba(255,255,255,0.025) !important; }
  .nav-link { transition: color 0.2s; cursor:pointer; }
  .nav-link:hover { color: #f97316 !important; }
`;

// ── ICON ─────────────────────────────────────────────────────────
const Ico = ({ d, s=18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    <path d={d}/>
  </svg>
);
const ICONS = {
  search: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  book:   "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  home:   "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10",
  user:   "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  explore:"M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z M8 2v16 M16 6v16",
  bot:    "M12 2a2 2 0 0 1 2 2v1h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h3V4a2 2 0 0 1 2-2z M8 12h.01 M16 12h.01 M10 16s.667.667 2 .667S14 16 14 16",
  star:   "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  clock:  "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2",
  send:   "M22 2L11 13 M22 2L15 22l-4-9-9-4 22-7z",
  x:      "M18 6L6 18 M6 6l12 12",
  back:   "M19 12H5 M12 5l-7 7 7 7",
  filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  eye:    "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  plus:   "M12 5v14 M5 12h14",
  bell:   "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  id:     "M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z M16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z",
  mail:   "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6",
  lock:   "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z M7 11V7a5 5 0 0 1 10 0v4",
  logout: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  trend:  "M23 6l-9.5 9.5-5-5L1 18",
  lib:    "M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z",
};

// ══════════════════════════════════════════════════════════════════
//  COMPONENTS
// ══════════════════════════════════════════════════════════════════

// ── BOOK CARD (compact) ──────────────────────────────────────────
function BookCard({ book, onView, delay=0, variant="grid" }) {
  const [hov, setHov] = useState(false);
  const sc = statusConfig(book.status);
  const dc = deptColor(book.dept);

  if (variant === "list") return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onView(book)} className="bt-card bt-row"
      style={{ display:"flex", alignItems:"center", gap:16, padding:"14px 18px",
        background:hov?T.card:T.surface, borderRadius:12, border:`1px solid ${hov?dc+"44":T.border}`,
        animation:`fadeUp 0.4s ${delay}ms ease both`, transition:"all 0.25s" }}>
      <div style={{ width:48, height:64, borderRadius:8, flexShrink:0,
        background:`linear-gradient(145deg, ${book.cover}, ${book.cover}88)`,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>📘</div>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:3,
          overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{book.title}</p>
        <p style={{ fontSize:12, color:T.muted }}>{book.author} · {book.dept}</p>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
        <span style={{ fontSize:11, color:"#f59e0b" }}>★ {book.rating}</span>
        <div style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20,
          background:sc.bg, color:sc.color, border:`1px solid ${sc.border}` }}>{sc.dot} {sc.label}</div>
      </div>
    </div>
  );

  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={()=>onView(book)} className="bt-card"
      style={{ background:hov?"#1c2030":T.card, borderRadius:14, overflow:"hidden",
        border:`1px solid ${hov?dc+"55":T.border}`,
        boxShadow:hov?`0 18px 50px ${dc}22, 0 0 0 1px ${dc}28`:"0 2px 10px rgba(0,0,0,0.35)",
        animation:`fadeUp 0.45s ${delay}ms ease both` }}>
      {/* Cover */}
      <div style={{ height:170, background:`linear-gradient(145deg, ${book.cover} 0%, ${book.cover}77 55%, #0e101a 100%)`,
        position:"relative", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:48, filter:"drop-shadow(0 6px 18px rgba(0,0,0,0.6))" }}>📘</div>
        <div style={{ position:"absolute", top:10, left:10,
          background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`,
          fontSize:9, fontWeight:800, padding:"3px 8px", borderRadius:20, letterSpacing:"0.07em", textTransform:"uppercase" }}>
          {sc.dot} {sc.label}</div>
        <div style={{ position:"absolute", bottom:10, right:10,
          background:dc+"28", color:dc, border:`1px solid ${dc}50`,
          fontSize:9, fontWeight:700, padding:"3px 9px", borderRadius:20 }}>{book.dept}</div>
        {hov && <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,rgba(255,255,255,0.05),transparent)", pointerEvents:"none" }}/>}
      </div>
      {/* Body */}
      <div style={{ padding:"14px 16px 16px" }}>
        <p style={{ fontSize:13, fontWeight:700, color:T.text, lineHeight:1.35, marginBottom:4,
          overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>{book.title}</p>
        <p style={{ fontSize:11, color:T.muted, marginBottom:10 }}>{book.author}</p>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#f59e0b" }}>{"★".repeat(Math.floor(book.rating))} <span style={{ color:T.muted }}>{book.rating}</span></span>
          <span style={{ fontSize:10, color:T.dim }}>{book.borrows} borrows</span>
        </div>
      </div>
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────────────
function SectionHead({ accent=T.orange, label, sub, extra }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:4, height:24, background:`linear-gradient(180deg,${accent},${accent}88)`, borderRadius:4 }}/>
        <div>
          <h2 style={{ fontSize:22, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em", color:T.text }}>{label}</h2>
          {sub && <p style={{ fontSize:11, color:T.muted, marginTop:1 }}>{sub}</p>}
        </div>
      </div>
      {extra}
    </div>
  );
}

// ── PILL BADGE ────────────────────────────────────────────────────
function Pill({ label, active, color=T.orange, onClick }) {
  return (
    <button onClick={onClick} className="bt-btn"
      style={{ background:active?`linear-gradient(135deg,${color},${color}cc)`:T.card,
        border:`1px solid ${active?"transparent":T.border}`, borderRadius:20,
        padding:"7px 16px", color:active?"#fff":T.muted, fontSize:12, fontWeight:700,
        fontFamily:"inherit", boxShadow:active?`0 4px 14px ${color}40`:"none",
        cursor:"pointer", transition:"all 0.2s" }}>
      {label}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PAGE: AUTH
// ══════════════════════════════════════════════════════════════════
function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("id"); // id | email
  const [val, setVal] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = () => {
    if (!val || !pass) { setErr("Please fill in all fields."); return; }
    setLoading(true); setErr("");
    setTimeout(() => { setLoading(false); onLogin({ name:"Ahmed Youssef", id:"S-20411", dept:"Computer Science" }); }, 1400);
  };

  return (
    <div style={{ minHeight:"100vh", background:T.bg, display:"flex", alignItems:"center", justifyContent:"center",
      position:"relative", overflow:"hidden" }}>
      {/* BG orbs */}
      {[["-10%","15%",T.orange,"220px"],["80%","70%",T.cyan,"180px"],["40%","-5%",T.purple,"150px"]].map(([l,t,c,w],i)=>(
        <div key={i} style={{ position:"absolute", left:l, top:t, width:w, height:w, borderRadius:"50%",
          background:c+"12", filter:"blur(80px)", pointerEvents:"none" }}/>
      ))}
      {/* Noise texture */}
      <div style={{ position:"absolute", inset:0, opacity:0.018,
        backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
        pointerEvents:"none" }}/>

      <div style={{ position:"relative", width:440, animation:"scaleIn 0.5s ease" }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:12, marginBottom:12 }}>
            <div style={{ width:48, height:48, borderRadius:14,
              background:`linear-gradient(135deg,${T.orange},${T.orangeD})`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:24,
              boxShadow:`0 8px 28px ${T.orangeG}, 0 0 0 1px ${T.orange}44`,
              animation:"glow 3s ease infinite" }}>📚</div>
            <div style={{ textAlign:"left" }}>
              <p style={{ fontSize:28, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif",
                letterSpacing:"0.12em", color:T.text, lineHeight:1 }}>
                BIBLIO<span style={{ color:T.orange }}>TECH</span>
              </p>
              <p style={{ fontSize:10, color:T.muted, letterSpacing:"0.15em", textTransform:"uppercase" }}>Benha University Library</p>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background:T.surface, border:`1px solid rgba(249,115,22,0.18)`,
          borderRadius:20, padding:"36px 36px 32px",
          boxShadow:"0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(249,115,22,0.1)" }}>
          <h3 style={{ fontSize:22, fontWeight:800, color:T.text, marginBottom:6 }}>Welcome back 👋</h3>
          <p style={{ fontSize:13, color:T.muted, marginBottom:28 }}>Sign in to your student library account</p>

          {/* Toggle */}
          <div style={{ display:"flex", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:4, marginBottom:24 }}>
            {[["id","🪪 University ID"],["email","✉️ Email"]].map(([m,l])=>(
              <button key={m} onClick={()=>{ setMode(m); setVal(""); setErr(""); }}
                className="bt-btn" style={{ flex:1, background:mode===m?`linear-gradient(135deg,${T.orange},${T.orangeD})`:"transparent",
                  border:"none", borderRadius:8, padding:"9px", color:mode===m?"#fff":T.muted,
                  fontSize:12, fontWeight:700, fontFamily:"inherit", boxShadow:mode===m?`0 4px 12px ${T.orangeG}`:"none" }}>{l}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:7 }}>
              {mode==="id"?"University ID":"Email Address"}
            </label>
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>
                <Ico d={mode==="id"?ICONS.id:ICONS.mail} s={16}/>
              </div>
              <input className="bt-input" value={val} onChange={e=>setVal(e.target.value)}
                placeholder={mode==="id"?"e.g. S-20411":"student@bu.edu.eg"}
                onKeyDown={e=>e.key==="Enter"&&submit()}
                style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
                  padding:"12px 14px 12px 42px", color:T.text, fontSize:14, fontFamily:"inherit", transition:"border-color 0.2s" }}/>
            </div>
          </div>
          <div style={{ marginBottom:err?12:24 }}>
            <label style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:7 }}>Password</label>
            <div style={{ position:"relative" }}>
              <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>
                <Ico d={ICONS.lock} s={16}/>
              </div>
              <input className="bt-input" type="password" value={pass} onChange={e=>setPass(e.target.value)}
                placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&submit()}
                style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
                  padding:"12px 14px 12px 42px", color:T.text, fontSize:14, fontFamily:"inherit", transition:"border-color 0.2s" }}/>
            </div>
          </div>

          {err && <p style={{ fontSize:12, color:T.red, marginBottom:16, background:"#ef444418", border:"1px solid #ef444433", borderRadius:8, padding:"9px 12px" }}>⚠ {err}</p>}

          <button onClick={submit} className="bt-btn" disabled={loading}
            style={{ width:"100%", background:`linear-gradient(135deg,${T.orange},${T.orangeD})`,
              border:"none", borderRadius:12, padding:"14px", color:"#fff", fontSize:15, fontWeight:800,
              fontFamily:"inherit", boxShadow:`0 8px 28px ${T.orangeG}`,
              opacity:loading?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
            {loading ? <><span style={{ width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,0.25)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite",display:"inline-block" }}/> Signing in...</> : "Sign In →"}
          </button>

          <p style={{ textAlign:"center", fontSize:12, color:T.dim, marginTop:18 }}>
            Demo: any ID + any password works
          </p>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PAGE: HOME / DISCOVER
// ══════════════════════════════════════════════════════════════════
function HomePage({ user, onView, onNavigate }) {
  return (
    <div>
      {/* ── HERO ── */}
      <div style={{ background:`linear-gradient(135deg, #0e0f18 0%, #12151f 60%, #0e101a 100%)`,
        borderBottom:`1px solid ${T.border}`, padding:"52px 32px 48px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-80, right:-80, width:400, height:400, borderRadius:"50%", background:T.orange+"0d", filter:"blur(100px)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", bottom:-60, left:80, width:300, height:300, borderRadius:"50%", background:T.cyan+"08", filter:"blur(80px)", pointerEvents:"none" }}/>
        {/* Decorative circuit lines */}
        <svg style={{ position:"absolute", right:0, top:0, opacity:0.03, pointerEvents:"none" }} width="500" height="300" viewBox="0 0 500 300">
          <path d="M500 0 L400 100 L300 100 L200 200 L100 200 L0 300" stroke="#f97316" strokeWidth="1" fill="none"/>
          <path d="M500 50 L380 170 L280 170 L180 270" stroke="#06b6d4" strokeWidth="1" fill="none"/>
          <circle cx="300" cy="100" r="4" fill="#f97316"/>
          <circle cx="200" cy="200" r="4" fill="#06b6d4"/>
          <circle cx="280" cy="170" r="3" fill="#8b5cf6"/>
        </svg>

        <div style={{ maxWidth:680, position:"relative" }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:8,
            background:T.orangeG, border:`1px solid ${T.orange}44`, borderRadius:20,
            padding:"5px 14px", marginBottom:18 }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:T.orange, animation:"bounce 2s infinite", display:"inline-block" }}/>
            <span style={{ fontSize:11, color:T.orange, fontWeight:700, letterSpacing:"0.1em" }}>BENHA UNIVERSITY LIBRARY</span>
          </div>
          <h1 style={{ fontSize:52, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif",
            letterSpacing:"0.04em", lineHeight:1.02, marginBottom:16, color:T.text }}>
            WELCOME BACK,<br/>
            <span style={{ color:T.orange }}>{user.name.split(" ")[0].toUpperCase()}</span> 👋
          </h1>
          <p style={{ fontSize:15, color:T.muted, lineHeight:1.7, marginBottom:28, maxWidth:520 }}>
            Your smart gateway to <strong style={{ color:T.text }}>4,821 books</strong> across all university departments. Discover, borrow, and track your reading journey.
          </p>
          {/* Quick search */}
          <div style={{ display:"flex", gap:0, background:T.card, border:`1px solid rgba(249,115,22,0.3)`,
            borderRadius:14, overflow:"hidden", maxWidth:520, boxShadow:`0 8px 32px rgba(0,0,0,0.4)` }}>
            <div style={{ padding:"0 16px", display:"flex", alignItems:"center", color:T.muted }}>
              <Ico d={ICONS.search} s={16}/>
            </div>
            <input placeholder="Quick search — title, author, department…"
              onKeyDown={e=>e.key==="Enter"&&onNavigate("explore")}
              className="bt-input"
              style={{ flex:1, background:"none", border:"none", padding:"14px 0", color:T.text, fontSize:14, fontFamily:"inherit" }}/>
            <button onClick={()=>onNavigate("explore")} className="bt-btn"
              style={{ background:`linear-gradient(135deg,${T.orange},${T.orangeD})`,
                border:"none", padding:"0 24px", color:"#fff", fontSize:13, fontWeight:700,
                fontFamily:"inherit", letterSpacing:"0.04em" }}>SEARCH</button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:"flex", gap:20, marginTop:36, position:"relative" }}>
          {[["4,821","Total Books","#f97316"],["1,247","Students","#06b6d4"],["386","Active Loans","#22c55e"],["12","Departments","#8b5cf6"]].map(([v,l,c])=>(
            <div key={l} style={{ background:T.surface, border:`1px solid ${c}22`,
              borderRadius:12, padding:"14px 20px", textAlign:"center" }}>
              <p style={{ fontSize:24, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", color:c, letterSpacing:"0.04em" }}>{v}</p>
              <p style={{ fontSize:11, color:T.muted }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"36px 32px" }}>
        {/* AI Recommendations */}
        <div style={{ marginBottom:40 }}>
          <SectionHead accent={T.purple} label="RECOMMENDED FOR YOU"
            sub="AI-curated picks based on your reading history"
            extra={<div style={{ display:"flex", alignItems:"center", gap:6, background:T.purpleG, border:`1px solid ${T.purple}44`, borderRadius:20, padding:"4px 12px" }}>
              <span style={{ fontSize:12 }}>✨</span>
              <span style={{ fontSize:11, color:T.purple, fontWeight:700 }}>Powered by AI</span>
            </div>}
          />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {AI_RECOMMENDATIONS.map((b,i)=><BookCard key={b.id} book={b} onView={onView} delay={i*80}/>)}
          </div>
        </div>

        {/* Trending */}
        <div>
          <SectionHead accent={T.cyan} label="TRENDING NOW"
            sub="Most borrowed books this week"
            extra={<span style={{ fontSize:11, color:T.cyan, fontWeight:700, cursor:"pointer" }}
              onClick={()=>onNavigate("explore")}>View all →</span>}
          />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            {TRENDING.map((b,i)=><BookCard key={b.id} book={b} onView={onView} delay={i*70}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PAGE: EXPLORE & SEARCH
// ══════════════════════════════════════════════════════════════════
function ExplorePage({ onView }) {
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState("popular");

  const filtered = BOOKS.filter(b=>{
    const q = query.toLowerCase();
    const matchQ = !q || b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.dept.toLowerCase().includes(q);
    const matchD = dept==="All" || b.dept===dept;
    const matchS = status==="All" || b.status===status;
    return matchQ && matchD && matchS;
  }).sort((a,b)=> sort==="popular"?b.borrows-a.borrows : sort==="rating"?b.rating-a.rating : a.title.localeCompare(b.title));

  return (
    <div style={{ display:"flex", gap:0, minHeight:"calc(100vh - 62px)" }}>
      {/* SIDEBAR FILTERS */}
      <aside style={{ width:220, flexShrink:0, background:T.surface, borderRight:`1px solid ${T.border}`,
        padding:"28px 18px", position:"sticky", top:62, height:"calc(100vh - 62px)", overflowY:"auto" }}>
        <p style={{ fontSize:12, color:T.muted, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:16, display:"flex", alignItems:"center", gap:6 }}>
          <Ico d={ICONS.filter} s={13}/> Filters
        </p>

        <div style={{ marginBottom:24 }}>
          <p style={{ fontSize:11, color:T.dim, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Department</p>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {DEPARTMENTS.map(d=>(
              <button key={d} onClick={()=>setDept(d)} className="bt-btn"
                style={{ background:dept===d?T.orangeG:"transparent", border:`1px solid ${dept===d?T.orange+"44":T.border}`,
                  borderRadius:8, padding:"8px 12px", color:dept===d?T.orange:T.muted,
                  fontSize:12, fontWeight:dept===d?700:400, fontFamily:"inherit", textAlign:"left",
                  transition:"all 0.2s" }}>{d}</button>
            ))}
          </div>
        </div>

        <div>
          <p style={{ fontSize:11, color:T.dim, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:10 }}>Availability</p>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {["All","available","borrowed","reserved"].map(s=>{
              const sc = s==="All"?{color:T.muted,label:"All"}:statusConfig(s);
              return (
                <button key={s} onClick={()=>setStatus(s)} className="bt-btn"
                  style={{ background:status===s?T.card:"transparent", border:`1px solid ${status===s?T.border:"transparent"}`,
                    borderRadius:8, padding:"8px 12px", color:status===s?T.text:T.muted,
                    fontSize:12, fontFamily:"inherit", textAlign:"left", transition:"all 0.2s" }}>
                  {s==="All"?"All Statuses":sc.label}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex:1, padding:"28px 28px" }}>
        {/* Search + Controls */}
        <div style={{ display:"flex", gap:12, marginBottom:24, alignItems:"center" }}>
          <div style={{ flex:1, position:"relative" }}>
            <div style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>
              <Ico d={ICONS.search} s={16}/>
            </div>
            <input className="bt-input" value={query} onChange={e=>setQuery(e.target.value)}
              placeholder="Search by title, author, ISBN, or department…"
              style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
                padding:"12px 14px 12px 42px", color:T.text, fontSize:14, fontFamily:"inherit", transition:"border-color 0.2s" }}/>
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)}
            style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
              padding:"12px 14px", color:T.text, fontSize:12, fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="alpha">A → Z</option>
          </select>
          <div style={{ display:"flex", background:T.card, border:`1px solid ${T.border}`, borderRadius:10, overflow:"hidden" }}>
            {[["grid","⊞"],["list","☰"]].map(([v,ic])=>(
              <button key={v} onClick={()=>setView(v)} className="bt-btn"
                style={{ background:view===v?T.orange+"22":"transparent", border:"none",
                  padding:"10px 14px", color:view===v?T.orange:T.muted, fontSize:16, cursor:"pointer" }}>{ic}</button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div style={{ marginBottom:18, display:"flex", alignItems:"center", gap:8 }}>
          <p style={{ fontSize:13, color:T.muted }}><strong style={{ color:T.text }}>{filtered.length}</strong> books found</p>
          {dept!=="All" && <span style={{ background:T.orangeG, color:T.orange, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, border:`1px solid ${T.orange}44` }}>{dept}</span>}
          {status!=="All" && <span style={{ ...statusConfig(status), fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, border:`1px solid ${statusConfig(status).border}`, background:statusConfig(status).bg }}>{statusConfig(status).label}</span>}
        </div>

        {view==="grid" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
            {filtered.map((b,i)=><BookCard key={b.id} book={b} onView={onView} delay={i*50}/>)}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {filtered.map((b,i)=><BookCard key={b.id} book={b} onView={onView} delay={i*40} variant="list"/>)}
          </div>
        )}

        {filtered.length===0 && (
          <div style={{ textAlign:"center", padding:"80px 20px", color:T.muted }}>
            <div style={{ fontSize:52, marginBottom:14 }}>🔍</div>
            <p style={{ fontSize:17, fontWeight:700, color:T.text }}>No books found</p>
            <p style={{ fontSize:13, marginTop:8 }}>Try a different keyword or clear the filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PAGE: BOOK DETAIL
// ══════════════════════════════════════════════════════════════════
function BookDetailPage({ book, onBack, onBorrow }) {
  const [borrowing, setBorrowing] = useState(false);
  const [done, setDone] = useState(false);
  const sc = statusConfig(book.status);
  const dc = deptColor(book.dept);

  const handleBorrow = () => {
    setBorrowing(true);
    setTimeout(()=>{ setBorrowing(false); setDone(true); }, 1500);
  };

  return (
    <div style={{ padding:"32px", maxWidth:900, margin:"0 auto", animation:"fadeIn 0.4s ease" }}>
      {/* Back */}
      <button onClick={onBack} className="bt-btn"
        style={{ display:"flex", alignItems:"center", gap:8, background:"none",
          border:`1px solid ${T.border}`, borderRadius:10, padding:"9px 16px",
          color:T.muted, fontSize:13, fontFamily:"inherit", marginBottom:28, cursor:"pointer" }}>
        <Ico d={ICONS.back} s={15}/> Back to results
      </button>

      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:32 }}>
        {/* Cover */}
        <div>
          <div style={{ height:380, borderRadius:16, overflow:"hidden",
            background:`linear-gradient(145deg, ${book.cover} 0%, ${book.cover}88 50%, #0e101a 100%)`,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:80,
            boxShadow:`0 24px 60px ${dc}30, 0 0 0 1px ${dc}22`,
            border:`1px solid ${dc}30`, animation:"floatUp 4s ease infinite",
            position:"relative" }}>
            📘
            <div style={{ position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)",
              background:sc.bg, color:sc.color, border:`1px solid ${sc.border}`,
              fontSize:11, fontWeight:800, padding:"5px 14px", borderRadius:20, whiteSpace:"nowrap",
              letterSpacing:"0.06em", textTransform:"uppercase" }}>
              {sc.dot} {sc.label}
            </div>
          </div>

          {/* Quick info */}
          <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14, padding:"18px", marginTop:16 }}>
            {[["Book ID", book.id],["ISBN", book.isbn],["Pages", book.pages],["Year", book.year]].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:`1px solid ${T.border}` }}>
                <span style={{ fontSize:11, color:T.muted }}>{k}</span>
                <span style={{ fontSize:11, color:T.text, fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <span style={{ background:dc+"22", color:dc, border:`1px solid ${dc}44`,
              fontSize:11, fontWeight:800, padding:"4px 12px", borderRadius:20 }}>{book.dept}</span>
            <span style={{ fontSize:12, color:"#f59e0b" }}>{"★".repeat(Math.floor(book.rating))} {book.rating}/5</span>
            <span style={{ fontSize:12, color:T.muted }}>{book.borrows} borrows</span>
          </div>

          <h1 style={{ fontSize:32, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif",
            letterSpacing:"0.04em", color:T.text, lineHeight:1.1, marginBottom:10 }}>{book.title}</h1>
          <p style={{ fontSize:15, color:T.muted, marginBottom:20 }}>by <strong style={{ color:T.text }}>{book.author}</strong></p>

          <p style={{ fontSize:14, color:"#9ca3af", lineHeight:1.75, marginBottom:28,
            background:T.surface, border:`1px solid ${T.border}`, borderRadius:12,
            padding:"18px 20px" }}>{book.desc}</p>

          {done ? (
            <div style={{ background:"#22c55e15", border:"1px solid #22c55e44", borderRadius:14, padding:"20px",
              textAlign:"center", animation:"scaleIn 0.3s ease" }}>
              <div style={{ fontSize:42, marginBottom:10 }}>✅</div>
              <p style={{ fontSize:17, fontWeight:800, color:T.text, marginBottom:6 }}>Borrow Request Sent!</p>
              <p style={{ fontSize:13, color:T.muted }}>You'll receive a confirmation shortly. Return due in <strong style={{ color:T.cyan }}>14 days</strong>.</p>
            </div>
          ) : (
            <div style={{ display:"flex", gap:14 }}>
              <button onClick={handleBorrow} disabled={book.status!=="available"||borrowing} className="bt-btn"
                style={{ flex:2, background:book.status==="available"?`linear-gradient(135deg,${T.orange},${T.orangeD})`:T.dim,
                  border:"none", borderRadius:13, padding:"16px", color:"#fff", fontSize:15, fontWeight:800,
                  fontFamily:"inherit", cursor:book.status==="available"?"pointer":"not-allowed",
                  boxShadow:book.status==="available"?`0 8px 28px ${T.orangeG}`:"none",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                {borrowing ? <><span style={{ width:18,height:18,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite",display:"inline-block" }}/> Processing…</> :
                  book.status==="available" ? "📖 Request Borrow" : `⏳ ${sc.label}`}
              </button>
              <button className="bt-btn"
                style={{ flex:1, background:T.surface, border:`1px solid ${T.border}`, borderRadius:13,
                  padding:"16px", color:T.muted, fontSize:14, fontWeight:700, fontFamily:"inherit", cursor:"pointer" }}>
                ♡ Wishlist
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PAGE: MY LIBRARY
// ══════════════════════════════════════════════════════════════════
function MyLibraryPage({ user, onView }) {
  const [tab, setTab] = useState("loans");

  return (
    <div style={{ padding:"32px" }}>
      {/* Profile Header */}
      <div style={{ background:`linear-gradient(135deg, ${T.surface}, ${T.card})`,
        border:`1px solid ${T.border}`, borderRadius:18, padding:"28px 32px", marginBottom:28,
        display:"flex", alignItems:"center", gap:24, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-40, right:-40, width:180, height:180, borderRadius:"50%",
          background:T.orange+"0f", filter:"blur(50px)", pointerEvents:"none" }}/>
        <div style={{ width:72, height:72, borderRadius:18, flexShrink:0,
          background:`linear-gradient(135deg, #1d4ed8, ${T.cyan}44)`,
          border:`2px solid ${T.cyan}44`, display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:28, fontWeight:900, color:T.cyan }}>
          {user.name[0]}
        </div>
        <div style={{ flex:1 }}>
          <p style={{ fontSize:22, fontWeight:900, color:T.text, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.05em" }}>{user.name}</p>
          <p style={{ fontSize:13, color:T.muted }}>{user.id} · {user.dept}</p>
        </div>
        <div style={{ display:"flex", gap:20 }}>
          {[["3","Active Loans",T.orange],["4","Books Read",T.cyan],["1","Overdue",T.red]].map(([v,l,c])=>(
            <div key={l} style={{ textAlign:"center" }}>
              <p style={{ fontSize:26, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", color:c }}>{v}</p>
              <p style={{ fontSize:11, color:T.muted }}>{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", background:T.surface, border:`1px solid ${T.border}`, borderRadius:12, padding:4, marginBottom:24, width:"fit-content" }}>
        {[["loans","📚 Current Loans"],["history","📖 Reading History"]].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} className="bt-btn"
            style={{ background:tab===id?`linear-gradient(135deg,${T.orange},${T.orangeD})`:"transparent",
              border:"none", borderRadius:9, padding:"9px 20px",
              color:tab===id?"#fff":T.muted, fontSize:13, fontWeight:700, fontFamily:"inherit",
              boxShadow:tab===id?`0 4px 12px ${T.orangeG}`:"none" }}>{label}</button>
        ))}
      </div>

      {tab==="loans" && (
        <div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {MY_LOANS.map((loan, i) => {
              const overdue = loan.daysLeft < 0;
              const soon = loan.daysLeft >= 0 && loan.daysLeft <= 3;
              const statusC = overdue ? T.red : soon ? T.yellow : T.green;
              return (
                <div key={i} style={{ background:T.surface, border:`1px solid ${overdue?"#ef444444":T.border}`,
                  borderRadius:16, padding:"22px 24px", display:"flex", alignItems:"center", gap:20,
                  animation:`fadeUp 0.4s ${i*100}ms ease both`,
                  boxShadow:overdue?`0 0 0 1px #ef444422, 0 4px 20px #ef444414`:"none" }}>
                  <div style={{ width:52, height:70, borderRadius:10, flexShrink:0,
                    background:`linear-gradient(145deg,${loan.cover},${loan.cover}88)`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:26 }}>📘</div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:15, fontWeight:800, color:T.text, marginBottom:4 }}>{loan.title}</p>
                    <p style={{ fontSize:12, color:T.muted }}>{loan.author}</p>
                    <p style={{ fontSize:11, color:T.dim, marginTop:4 }}>Borrowed: {loan.borrowed}</p>
                  </div>
                  {/* Day counter */}
                  <div style={{ textAlign:"center", background:overdue?"#ef444418":soon?"#f59e0b18":"#22c55e18",
                    border:`1px solid ${statusC}44`, borderRadius:14, padding:"12px 20px" }}>
                    <p style={{ fontSize:28, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif",
                      color:statusC, letterSpacing:"0.04em", lineHeight:1 }}>
                      {overdue ? `+${Math.abs(loan.daysLeft)}` : loan.daysLeft}
                    </p>
                    <p style={{ fontSize:10, fontWeight:700, color:statusC, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                      {overdue ? "days overdue" : "days left"}
                    </p>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <p style={{ fontSize:11, color:T.muted, marginBottom:6 }}>Due: <strong style={{ color:T.text }}>{loan.due}</strong></p>
                    {overdue && <div style={{ background:"#ef444420", color:T.red, border:"1px solid #ef444444",
                      fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>⚠ Overdue!</div>}
                    {!overdue && soon && <div style={{ background:"#f59e0b20", color:T.yellow, border:"1px solid #f59e0b44",
                      fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>⏰ Due Soon</div>}
                    {!overdue && !soon && <div style={{ background:"#22c55e20", color:T.green, border:"1px solid #22c55e44",
                      fontSize:11, fontWeight:700, padding:"4px 10px", borderRadius:20 }}>● Active</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="history" && (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {READ_HISTORY.map((b, i) => (
            <div key={i} style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:14,
              overflow:"hidden", animation:`fadeUp 0.4s ${i*80}ms ease both` }}>
              <div style={{ height:120, background:`linear-gradient(145deg,${b.cover},${b.cover}88)`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>📘</div>
              <div style={{ padding:"14px 16px" }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:4,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.title}</p>
                <p style={{ fontSize:11, color:T.muted, marginBottom:8 }}>{b.author}</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:10, color:T.dim }}>{b.date}</span>
                  <span style={{ background:"#22c55e18", color:T.green, border:"1px solid #22c55e33",
                    fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:20 }}>✓ Read</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  CHATBOT WIDGET
// ══════════════════════════════════════════════════════════════════
function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([
    { role:"ai", text:"Hey! 👋 I'm your BiblioTech assistant. Ask me about any book, or tell me what you want to read!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(1);
  const bottomRef = useRef(null);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs]);
  useEffect(()=>{ if(open) setUnread(0); }, [open]);

  const send = async (text) => {
    const q = (text||input).trim();
    if(!q) return;
    setInput("");
    setMsgs(m=>[...m, { role:"user", text:q }]);
    setLoading(true);
    const bookList = BOOKS.slice(0,8).map(b=>`"${b.title}" by ${b.author} (${b.dept}, ${b.status})`).join("\n");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:800,
          system:`You are BiblioTech, the AI assistant for Benha University Library. Be friendly, concise (2-3 sentences), and helpful. Available books:\n${bookList}\nBold book titles with **title**. Always end with a follow-up question.`,
          messages:[{ role:"user", content:q }]
        })
      });
      const data = await res.json();
      const txt = data.content?.map(c=>c.text||"").join("") || "Let me think about that!";
      setMsgs(m=>[...m, { role:"ai", text:txt }]);
    } catch {
      setMsgs(m=>[...m, { role:"ai", text:"Oops! Connection issue. Try the search page instead!" }]);
    }
    setLoading(false);
  };

  const renderText = t => t.split(/(\*\*[^*]+\*\*)/g).map((p,i)=>
    p.startsWith("**") ? <strong key={i} style={{ color:T.orange }}>{p.slice(2,-2)}</strong> : p
  );

  const CHIPS = ["Books like Dune", "Best CS textbooks", "Something short to read", "Top engineering books"];

  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, fontFamily:"'Outfit','Segoe UI',sans-serif" }}>
      {/* Popup */}
      {open && (
        <div style={{ position:"absolute", bottom:70, right:0, width:360,
          background:T.surface, border:`1px solid rgba(249,115,22,0.25)`,
          borderRadius:20, overflow:"hidden",
          boxShadow:"0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(249,115,22,0.12)",
          animation:"scaleIn 0.25s cubic-bezier(0.34,1.4,0.64,1)",
          transformOrigin:"bottom right", display:"flex", flexDirection:"column", height:460 }}>

          {/* Header */}
          <div style={{ background:`linear-gradient(135deg,${T.orange},${T.orangeD})`,
            padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:22 }}>🤖</div>
              <div>
                <p style={{ fontSize:14, fontWeight:800, color:"#fff", letterSpacing:"0.03em" }}>BiblioTech AI</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.75)" }}>● Online · Always ready to help</p>
              </div>
            </div>
            <button onClick={()=>setOpen(false)} style={{ background:"rgba(0,0,0,0.25)", border:"none",
              color:"#fff", width:28, height:28, borderRadius:"50%", cursor:"pointer", fontSize:14,
              display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"14px" }}>
            {msgs.map((m,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start",
                marginBottom:10, animation:"fadeUp 0.25s ease" }}>
                {m.role==="ai" && <div style={{ width:26, height:26, borderRadius:"50%", background:T.orange,
                  flexShrink:0, marginRight:8, marginTop:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🤖</div>}
                <div style={{ maxWidth:"80%", padding:"9px 13px",
                  borderRadius:m.role==="user"?"16px 16px 4px 16px":"16px 16px 16px 4px",
                  background:m.role==="user"?`linear-gradient(135deg,${T.orange},${T.orangeD})`:T.card,
                  border:m.role==="ai"?`1px solid ${T.border}`:"none",
                  fontSize:13, color:T.text, lineHeight:1.55 }}>
                  {renderText(m.text)}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
                <div style={{ width:26, height:26, borderRadius:"50%", background:T.orange, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13 }}>🤖</div>
                <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:"16px 16px 16px 4px",
                  padding:"10px 14px", display:"flex", gap:5 }}>
                  {[0,1,2].map(i=><span key={i} style={{ width:7,height:7,borderRadius:"50%",background:T.orange,display:"inline-block",animation:`bounce 1s ${i*0.2}s infinite` }}/>)}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Chips */}
          {msgs.length<=2 && (
            <div style={{ padding:"0 12px 8px", display:"flex", gap:6, flexWrap:"wrap" }}>
              {CHIPS.map((c,i)=>(
                <button key={i} onClick={()=>send(c)} style={{ background:T.card, border:`1px solid ${T.border}`,
                  borderRadius:20, padding:"5px 11px", fontSize:11, color:T.muted, cursor:"pointer",
                  fontFamily:"inherit", transition:"all 0.2s" }}
                  onMouseEnter={e=>{e.target.style.borderColor=T.orange+"66";e.target.style.color=T.orange;}}
                  onMouseLeave={e=>{e.target.style.borderColor=T.border;e.target.style.color=T.muted;}}
                >{c}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:"10px 12px", borderTop:`1px solid ${T.border}`, display:"flex", gap:8 }}>
            <input value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&send()}
              placeholder="Ask about any book…"
              className="bt-input"
              style={{ flex:1, background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
                padding:"9px 13px", color:T.text, fontSize:13, fontFamily:"inherit" }}/>
            <button onClick={()=>send()} style={{ background:`linear-gradient(135deg,${T.orange},${T.orangeD})`,
              border:"none", borderRadius:10, width:38, color:"#fff", fontSize:16, cursor:"pointer",
              boxShadow:`0 4px 14px ${T.orangeG}`, transition:"transform 0.15s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="scale(1.08)"}
              onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
            >➤</button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={()=>setOpen(o=>!o)} style={{
        width:56, height:56, borderRadius:"50%",
        background:open?T.dim:`linear-gradient(135deg,${T.orange},${T.orangeD})`,
        border:"none", cursor:"pointer", color:"#fff", fontSize:24,
        boxShadow:open?"none":`0 8px 28px ${T.orangeG}, 0 0 0 3px ${T.orange}22`,
        transition:"all 0.3s cubic-bezier(0.34,1.4,0.64,1)",
        animation:open?"none":"glow 3s ease infinite",
        display:"flex", alignItems:"center", justifyContent:"center",
        position:"relative"
      }}>
        {open ? "✕" : "🤖"}
        {!open && unread > 0 && (
          <span style={{ position:"absolute", top:-2, right:-2,
            background:T.red, color:"#fff", fontSize:10, fontWeight:800,
            width:18, height:18, borderRadius:"50%",
            display:"flex", alignItems:"center", justifyContent:"center",
            border:`2px solid ${T.bg}`, animation:"pulse 2s infinite" }}>{unread}</span>
        )}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  NAVBAR
// ══════════════════════════════════════════════════════════════════
function Navbar({ user, activePage, onNavigate, onLogout }) {
  const NAVS = [
    { id:"home",    label:"Home",    icon:ICONS.home },
    { id:"explore", label:"Explore", icon:ICONS.explore },
    { id:"library", label:"My Library", icon:ICONS.lib },
  ];
  return (
    <nav style={{ position:"sticky", top:0, zIndex:100, height:62,
      background:"rgba(8,9,13,0.92)", backdropFilter:"blur(16px)",
      borderBottom:`1px solid rgba(249,115,22,0.12)`,
      display:"flex", alignItems:"center", padding:"0 32px",
      justifyContent:"space-between" }}>
      {/* Logo */}
      <div style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer" }} onClick={()=>onNavigate("home")}>
        <div style={{ width:32, height:32, borderRadius:9,
          background:`linear-gradient(135deg,${T.orange},${T.orangeD})`,
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:16,
          boxShadow:`0 4px 14px ${T.orangeG}` }}>📚</div>
        <span style={{ fontSize:19, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif",
          letterSpacing:"0.12em", color:T.text }}>
          BIBLIO<span style={{ color:T.orange }}>TECH</span>
        </span>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:4 }}>
        {NAVS.map(n=>(
          <button key={n.id} onClick={()=>onNavigate(n.id)} className="bt-btn"
            style={{ display:"flex", alignItems:"center", gap:7,
              background:activePage===n.id?T.orangeG:"transparent",
              border:`1px solid ${activePage===n.id?T.orange+"44":"transparent"}`,
              borderRadius:10, padding:"8px 14px",
              color:activePage===n.id?T.orange:T.muted,
              fontSize:13, fontWeight:activePage===n.id?700:500, fontFamily:"inherit" }}>
            <Ico d={n.icon} s={15}/>{n.label}
          </button>
        ))}
      </div>

      {/* Right */}
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ position:"relative" }}>
          <div style={{ width:36, height:36, borderRadius:9, background:T.surface,
            border:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"center",
            color:T.muted, cursor:"pointer" }}>
            <Ico d={ICONS.bell} s={16}/>
          </div>
          <span style={{ position:"absolute", top:5, right:5, width:7, height:7, borderRadius:"50%",
            background:T.orange, border:`1.5px solid ${T.bg}`, animation:"pulse 2s infinite" }}/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:9,
          background:T.surface, border:`1px solid ${T.border}`, borderRadius:10, padding:"5px 12px 5px 6px", cursor:"pointer" }}>
          <div style={{ width:28, height:28, borderRadius:8,
            background:`linear-gradient(135deg,#1d4ed8,${T.cyan}44)`,
            border:`1px solid ${T.cyan}44`, display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:800, color:T.cyan }}>{user.name[0]}</div>
          <span style={{ fontSize:12, color:T.text, fontWeight:600 }}>{user.name.split(" ")[0]}</span>
        </div>
        <button onClick={onLogout} className="bt-btn"
          style={{ background:"none", border:`1px solid ${T.border}`, borderRadius:9,
            padding:"8px 12px", color:T.muted, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
          <Ico d={ICONS.logout} s={14}/><span style={{ fontSize:12, fontFamily:"inherit" }}>Logout</span>
        </button>
      </div>
    </nav>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════════
export default function BiblioTech() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("home");
  const [selectedBook, setSelectedBook] = useState(null);

  const handleView = (book) => { setSelectedBook(book); setPage("detail"); };
  const handleNavigate = (p) => { setPage(p); setSelectedBook(null); };
  const handleLogin = (u) => setUser(u);
  const handleLogout = () => { setUser(null); setPage("home"); };

  if (!user) return (
    <>
      <style>{GLOBAL_CSS}</style>
      <AuthPage onLogin={handleLogin}/>
    </>
  );

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'Outfit','Segoe UI',sans-serif" }}>
        <Navbar user={user} activePage={page} onNavigate={handleNavigate} onLogout={handleLogout}/>

        {page==="home"    && <HomePage    user={user} onView={handleView} onNavigate={handleNavigate}/>}
        {page==="explore" && <ExplorePage onView={handleView}/>}
        {page==="library" && <MyLibraryPage user={user} onView={handleView}/>}
        {page==="detail"  && selectedBook && (
          <BookDetailPage book={selectedBook} onBack={()=>setPage("explore")} onBorrow={()=>{}}/>
        )}

        <ChatbotWidget/>

        {/* Footer */}
        <footer style={{ borderTop:`1px solid ${T.border}`, padding:"20px 32px",
          display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:13, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.1em", color:T.text }}>
              BIBLIO<span style={{ color:T.orange }}>TECH</span>
            </span>
            <span style={{ fontSize:11, color:T.dim }}>· Benha University Library</span>
          </div>
          <p style={{ fontSize:11, color:T.dim }}>© 2026 · Built with React + Claude AI</p>
        </footer>
      </div>
    </>
  );
}

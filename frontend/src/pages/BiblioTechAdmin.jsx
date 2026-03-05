import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

/* ═══════════════════════════════════════════════════════════════
   BIBLIO TECH — Admin Panel · Benha University Library
   Pages: Dashboard · Books · Borrowings · Students
═══════════════════════════════════════════════════════════════ */

const T = {
  bg:"#08090d", bg2:"#0c0e16", surface:"#10131d", card:"#161926",
  border:"rgba(255,255,255,0.06)", orange:"#f97316", orangeG:"#f9731628",
  cyan:"#06b6d4", cyanG:"#06b6d420", green:"#22c55e", red:"#ef4444",
  yellow:"#f59e0b", purple:"#8b5cf6", text:"#eceaf5", muted:"#64748b", dim:"#1e2535",
};

// ── MOCK DATA ────────────────────────────────────────────────────
const MONTHLY_ACTIVITY = [
  { month:"Aug", borrows:145, returns:132 }, { month:"Sep", borrows:189, returns:167 },
  { month:"Oct", borrows:267, returns:243 }, { month:"Nov", borrows:312, returns:298 },
  { month:"Dec", borrows:198, returns:185 }, { month:"Jan", borrows:356, returns:334 },
  { month:"Feb", borrows:289, returns:271 }, { month:"Mar", borrows:178, returns:142 },
];

const DEPT_STATS = [
  { dept:"Engineering",      books:820, color:"#f97316" },
  { dept:"Computer Science", books:640, color:"#3b82f6" },
  { dept:"Medicine",         books:590, color:"#ef4444" },
  { dept:"Pharmacy",         books:410, color:"#8b5cf6" },
  { dept:"Science",          books:380, color:"#06b6d4" },
  { dept:"Arts",             books:290, color:"#ec4899" },
  { dept:"Law",              books:260, color:"#f59e0b" },
  { dept:"Commerce",         books:430, color:"#22c55e" },
];

const ALL_BOOKS = [
  { id:"B001", title:"Calculus: Early Transcendentals", author:"James Stewart",       dept:"Engineering",      status:"available", copies:5,  borrowed:3, added:"2023-01-15" },
  { id:"B002", title:"Gray's Anatomy",                  author:"Henry Gray",           dept:"Medicine",         status:"borrowed",  copies:3,  borrowed:3, added:"2022-08-20" },
  { id:"B003", title:"Introduction to Algorithms",      author:"Cormen et al.",        dept:"Computer Science", status:"available", copies:7,  borrowed:4, added:"2023-03-10" },
  { id:"B004", title:"Organic Chemistry",               author:"Paula Y. Bruice",      dept:"Pharmacy",         status:"available", copies:4,  borrowed:1, added:"2022-11-05" },
  { id:"B005", title:"Principles of Physics",           author:"Serway & Jewett",      dept:"Science",          status:"reserved",  copies:6,  borrowed:5, added:"2023-02-28" },
  { id:"B006", title:"The Architecture of Happiness",   author:"Alain de Botton",      dept:"Architecture",     status:"available", copies:2,  borrowed:0, added:"2023-05-12" },
  { id:"B007", title:"Business Law",                    author:"Henry R. Cheeseman",   dept:"Law",              status:"available", copies:3,  borrowed:1, added:"2022-09-18" },
  { id:"B008", title:"Macroeconomics",                  author:"N. Gregory Mankiw",    dept:"Commerce",         status:"borrowed",  copies:4,  borrowed:4, added:"2023-04-02" },
  { id:"B009", title:"Clean Code",                      author:"Robert C. Martin",     dept:"Computer Science", status:"available", copies:5,  borrowed:2, added:"2023-01-30" },
  { id:"B010", title:"Human Anatomy & Physiology",      author:"Marieb & Hoehn",       dept:"Medicine",         status:"available", copies:6,  borrowed:3, added:"2022-12-14" },
];

const ALL_BORROWINGS = [
  { id:"T001", student:"Ahmed Youssef",  studentId:"S-2041", book:"Calculus: Early Transcendentals", dept:"Engineering",      borrowed:"Feb 20",  due:"Mar 13", daysLeft:8,  status:"active" },
  { id:"T002", student:"Fatima Ibrahim", studentId:"S-1892", book:"Gray's Anatomy",                  dept:"Medicine",         borrowed:"Feb 15",  due:"Mar 01", daysLeft:-4, status:"overdue" },
  { id:"T003", student:"Mohamed Karim",  studentId:"S-2213", book:"Introduction to Algorithms",      dept:"Computer Science", borrowed:"Feb 25",  due:"Mar 11", daysLeft:6,  status:"active" },
  { id:"T004", student:"Sara Ahmed",     studentId:"S-1654", book:"Macroeconomics",                  dept:"Commerce",         borrowed:"Feb 10",  due:"Feb 24", daysLeft:-9, status:"overdue" },
  { id:"T005", student:"Omar Hassan",    studentId:"S-2089", book:"Principles of Physics",           dept:"Science",          borrowed:"Mar 01",  due:"Mar 15", daysLeft:10, status:"active" },
  { id:"T006", student:"Nour Hossam",    studentId:"S-1741", book:"Organic Chemistry",               dept:"Pharmacy",         borrowed:"Feb 28",  due:"Mar 03", daysLeft:-2, status:"overdue" },
  { id:"T007", student:"Youssef Sami",   studentId:"S-2301", book:"Clean Code",                     dept:"Computer Science", borrowed:"Feb 22",  due:"Mar 08", daysLeft:3,  status:"due-soon" },
  { id:"T008", student:"Layla Reda",     studentId:"S-1998", book:"Business Law",                   dept:"Law",              borrowed:"Mar 02",  due:"Mar 16", daysLeft:11, status:"active" },
];

const ALL_STUDENTS = [
  { id:"S-2041", name:"Ahmed Youssef",  dept:"Computer Science", email:"ahmed@bu.edu.eg",   loans:12, active:2, status:"active" },
  { id:"S-1892", name:"Fatima Ibrahim", dept:"Medicine",          email:"fatima@bu.edu.eg",  loans:19, active:1, status:"active" },
  { id:"S-2213", name:"Mohamed Karim",  dept:"Computer Science",  email:"mkarim@bu.edu.eg",  loans:8,  active:2, status:"active" },
  { id:"S-1654", name:"Sara Ahmed",     dept:"Commerce",          email:"sara@bu.edu.eg",    loans:14, active:1, status:"suspended" },
  { id:"S-2089", name:"Omar Hassan",    dept:"Science",           email:"omar@bu.edu.eg",    loans:7,  active:1, status:"active" },
  { id:"S-1741", name:"Nour Hossam",    dept:"Pharmacy",          email:"nour@bu.edu.eg",    loans:11, active:1, status:"active" },
  { id:"S-2301", name:"Youssef Sami",   dept:"Computer Science",  email:"ysami@bu.edu.eg",   loans:5,  active:1, status:"active" },
  { id:"S-1998", name:"Layla Reda",     dept:"Law",               email:"layla@bu.edu.eg",   loans:9,  active:1, status:"active" },
];

// ── HELPERS ──────────────────────────────────────────────────────
const deptColor = d => ({ Engineering:"#f97316", Medicine:"#ef4444", Pharmacy:"#8b5cf6", Science:"#06b6d4", Arts:"#ec4899", Law:"#f59e0b", Commerce:"#22c55e", "Computer Science":"#3b82f6", Architecture:"#a78bfa" }[d]||"#64748b");

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Bebas+Neue&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  ::-webkit-scrollbar{width:4px;height:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1e2535;border-radius:6px}
  input::placeholder{color:#2a3347}
  select option{background:#10131d}
  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  @keyframes fadeIn{from{opacity:0}to{opacity:1}}
  @keyframes scaleIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
  @keyframes glow{0%,100%{box-shadow:0 0 14px #f9731640}50%{box-shadow:0 0 32px #f9731668}}
  .bt-btn{transition:all 0.2s ease;cursor:pointer;}
  .bt-btn:hover{opacity:0.88;transform:translateY(-1px)}
  .bt-btn:active{transform:scale(0.97)}
  .bt-input:focus{outline:none;border-color:#f9731666!important}
  .bt-row:hover{background:rgba(255,255,255,0.025)!important}
  .nav-item{transition:all 0.2s ease;cursor:pointer}
`;

// ── ICON ─────────────────────────────────────────────────────────
const Ico = ({ d, s=18 }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);
const IC = {
  dashboard:"M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  books:    "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z",
  users:    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  borrow:   "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  bell:     "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 0 1-3.46 0",
  search:   "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  logout:   "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9",
  plus:     "M12 5v14M5 12h14",
  edit:     "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7 M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z",
  trash:    "M3 6h18 M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2",
  warning:  "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6",
  ban:      "M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636",
  x:        "M18 6L6 18 M6 6l12 12",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
};

// ── TOOLTIP ──────────────────────────────────────────────────────
const Tip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:"#10131d", border:"1px solid rgba(255,255,255,0.1)",
      borderRadius:10, padding:"10px 14px" }}>
      <p style={{ color:T.orange, fontSize:12, marginBottom:6, fontWeight:700 }}>{label}</p>
      {payload.map((p,i)=><p key={i} style={{ color:p.color, fontSize:13 }}>{p.name}: <strong>{p.value}</strong></p>)}
    </div>
  );
};

// ── STAT WIDGET ──────────────────────────────────────────────────
function Widget({ label, value, sub, icon, color, trend, delay=0 }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:hov?"#161926":T.surface, border:`1px solid ${hov?color+"44":T.border}`,
        borderRadius:16, padding:"22px 24px", position:"relative", overflow:"hidden",
        transform:hov?"translateY(-3px)":"none",
        transition:"all 0.28s ease",
        boxShadow:hov?`0 14px 40px ${color}1a`:"none",
        animation:`fadeUp 0.45s ${delay}ms ease both` }}>
      <div style={{ position:"absolute", top:-40, right:-40, width:120, height:120, borderRadius:"50%",
        background:color+"18", filter:"blur(30px)", opacity:hov?1:0.5, transition:"opacity 0.3s" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative" }}>
        <div>
          <p style={{ fontSize:11, color:T.muted, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:10, fontWeight:600 }}>{label}</p>
          <p style={{ fontSize:32, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", color:T.text, letterSpacing:"0.03em", lineHeight:1 }}>{value}</p>
          {trend !== undefined && (
            <p style={{ fontSize:12, marginTop:10, color:trend>0?T.green:T.red, display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ fontWeight:700 }}>{trend>0?"▲":"▼"} {Math.abs(trend)}%</span>
              <span style={{ color:T.dim }}>vs last month</span>
            </p>
          )}
        </div>
        <div style={{ width:44, height:44, borderRadius:12, background:color+"1a",
          display:"flex", alignItems:"center", justifyContent:"center", color, border:`1px solid ${color}28` }}>
          <Ico d={icon} s={20}/>
        </div>
      </div>
      {sub && <p style={{ fontSize:11, color:T.dim, marginTop:12, borderTop:`1px solid ${T.border}`, paddingTop:10 }}>{sub}</p>}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  PAGES
// ══════════════════════════════════════════════════════════════════

// ── DASHBOARD ────────────────────────────────────────────────────
function DashboardPage() {
  return (
    <div style={{ padding:"30px 32px" }}>
      {/* Widgets */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, marginBottom:26 }}>
        <Widget label="Total Books"       value="4,821" icon={IC.books}  color={T.orange} trend={5.2}  delay={0}   sub="234 new titles this year"/>
        <Widget label="Active Students"   value="1,247" icon={IC.users}  color={T.cyan}   trend={12.1} delay={80}  sub="89 new this month"/>
        <Widget label="Active Loans"      value="386"   icon={IC.borrow} color={T.green}  trend={8.4}  delay={160} sub="Avg 3.1 books / student"/>
        <Widget label="Overdue Returns"   value="3"     icon={IC.warning}color={T.red}    trend={-33}  delay={240} sub="Action required immediately"/>
      </div>

      {/* Charts Row 1 */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:18, marginBottom:18 }}>
        {/* Line chart */}
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"24px 26px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
            <div>
              <p style={{ fontSize:15, fontWeight:800, color:T.text, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.05em" }}>BORROWING ACTIVITY</p>
              <p style={{ fontSize:12, color:T.muted, marginTop:3 }}>Monthly borrows vs returns — last 8 months</p>
            </div>
            <div style={{ display:"flex", gap:14 }}>
              {[["Borrows",T.orange],["Returns",T.cyan]].map(([l,c])=>(
                <span key={l} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:c }}>
                  <span style={{ width:18, height:2, background:c, display:"inline-block", borderRadius:2 }}/>{l}
                </span>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={MONTHLY_ACTIVITY} margin={{ top:5, right:0, left:-20, bottom:0 }}>
              <defs>
                <linearGradient id="gB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.orange} stopOpacity={0.28}/>
                  <stop offset="95%" stopColor={T.orange} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={T.cyan} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={T.cyan} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)"/>
              <XAxis dataKey="month" tick={{ fill:"#374151", fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#374151", fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip content={<Tip/>}/>
              <Area type="monotone" dataKey="borrows" name="Borrows" stroke={T.orange} strokeWidth={2.5} fill="url(#gB)" dot={false}/>
              <Area type="monotone" dataKey="returns" name="Returns" stroke={T.cyan} strokeWidth={2.5} fill="url(#gR)" dot={false}/>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar chart */}
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"24px 22px" }}>
          <p style={{ fontSize:15, fontWeight:800, color:T.text, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.05em", marginBottom:4 }}>BOOKS BY DEPT</p>
          <p style={{ fontSize:12, color:T.muted, marginBottom:18 }}>Total catalog per department</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={DEPT_STATS} layout="vertical" margin={{ top:0, right:0, left:0, bottom:0 }}>
              <XAxis type="number" tick={{ fill:"#374151", fontSize:10 }} axisLine={false} tickLine={false}/>
              <YAxis type="category" dataKey="dept" tick={{ fill:"#4b5563", fontSize:10 }} axisLine={false} tickLine={false} width={80}/>
              <Tooltip content={<Tip/>}/>
              <Bar dataKey="books" name="Books" radius={[0,6,6,0]}>
                {DEPT_STATS.map((d,i)=><Cell key={i} fill={d.color} fillOpacity={0.8}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        {/* Overdue alert */}
        <div style={{ background:"rgba(239,68,68,0.04)", border:"1px solid rgba(239,68,68,0.2)",
          borderRadius:16, padding:"22px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
            <div style={{ color:T.red }}><Ico d={IC.warning} s={16}/></div>
            <p style={{ fontSize:14, fontWeight:800, color:T.text }}>Overdue Alerts</p>
            <span style={{ marginLeft:"auto", background:T.red, color:"#fff",
              fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20 }}>3</span>
          </div>
          {ALL_BORROWINGS.filter(b=>b.status==="overdue").map((b,i)=>(
            <div key={i} style={{ background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.15)",
              borderRadius:10, padding:"12px 14px", marginBottom:8 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{b.student}</p>
                <span style={{ background:"#ef444422", color:T.red, border:"1px solid #ef444444",
                  fontSize:10, fontWeight:800, padding:"2px 8px", borderRadius:20 }}>
                  +{Math.abs(b.daysLeft)}d overdue
                </span>
              </div>
              <p style={{ fontSize:11, color:T.muted }}>{b.book}</p>
              <p style={{ fontSize:10, color:"#ef444466", marginTop:3 }}>Due: {b.due} · ID: {b.studentId}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, padding:"22px" }}>
          <p style={{ fontSize:14, fontWeight:800, color:T.text, marginBottom:16 }}>Recent Transactions</p>
          {ALL_BORROWINGS.slice(0,5).map((b,i)=>(
            <div key={i} className="bt-row" style={{ display:"flex", alignItems:"center", gap:12,
              padding:"9px 8px", borderRadius:8, marginBottom:4, transition:"background 0.2s" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", flexShrink:0,
                background:b.status==="overdue"?T.red:b.status==="due-soon"?T.yellow:T.green }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontSize:12, color:T.text, fontWeight:600,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  {b.student} → <em style={{ color:T.muted, fontStyle:"normal" }}>{b.book.slice(0,28)}…</em>
                </p>
                <p style={{ fontSize:10, color:T.dim }}>Borrowed {b.borrowed} · Due {b.due}</p>
              </div>
              <div style={{ fontSize:10, fontWeight:700,
                color:b.status==="overdue"?T.red:b.status==="due-soon"?T.yellow:T.green }}>
                {b.status==="overdue"?"OVERDUE":b.status==="due-soon"?"DUE SOON":"ACTIVE"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── BOOKS MANAGEMENT ─────────────────────────────────────────────
function BooksPage() {
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [books, setBooks] = useState(ALL_BOOKS);
  const [form, setForm] = useState({ title:"", author:"", dept:"Engineering", isbn:"", copies:1 });
  const [delId, setDelId] = useState(null);

  const filtered = books.filter(b=>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.dept.toLowerCase().includes(search.toLowerCase())
  );

  const addBook = () => {
    if (!form.title || !form.author) return;
    setBooks(bk=>[...bk, { id:`B${String(bk.length+1).padStart(3,"0")}`, ...form, status:"available", borrowed:0, added:new Date().toISOString().split("T")[0] }]);
    setForm({ title:"", author:"", dept:"Engineering", isbn:"", copies:1 });
    setShowAdd(false);
  };

  const deleteBook = id => { setBooks(bk=>bk.filter(b=>b.id!==id)); setDelId(null); };

  const sc = s => ({ available:{ c:T.green, b:"#22c55e18", br:"#22c55e44", l:"Available" }, borrowed:{ c:T.red, b:"#ef444418", br:"#ef444444", l:"Borrowed" }, reserved:{ c:T.yellow, b:"#f59e0b18", br:"#f59e0b44", l:"Reserved" } }[s]||{ c:T.muted, b:"", br:"", l:s });

  return (
    <div style={{ padding:"30px 32px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div>
          <h2 style={{ fontSize:26, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em", color:T.text }}>BOOK INVENTORY</h2>
          <p style={{ fontSize:12, color:T.muted }}>{books.length} books in catalog</p>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>
              <Ico d={IC.search} s={15}/>
            </div>
            <input className="bt-input" value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search books…"
              style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10,
                padding:"10px 14px 10px 38px", color:T.text, fontSize:13, fontFamily:"inherit",
                width:220, transition:"border-color 0.2s" }}/>
          </div>
          <button onClick={()=>setShowAdd(true)} className="bt-btn"
            style={{ background:`linear-gradient(135deg,${T.orange},#ea580c)`, border:"none",
              borderRadius:10, padding:"10px 18px", color:"#fff", fontSize:13, fontWeight:700,
              fontFamily:"inherit", display:"flex", alignItems:"center", gap:8,
              boxShadow:`0 6px 20px ${T.orangeG}` }}>
            <Ico d={IC.plus} s={15}/> Add Book
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"80px 2fr 1.2fr 1fr 1fr 80px 120px 100px",
          padding:"12px 18px", borderBottom:`1px solid ${T.border}`,
          fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
          {["ID","Title","Author","Department","Status","Copies","Added","Actions"].map(h=><div key={h}>{h}</div>)}
        </div>
        {filtered.map((b,i)=>{
          const s = sc(b.status);
          const dc = deptColor(b.dept);
          return (
            <div key={b.id} className="bt-row"
              style={{ display:"grid", gridTemplateColumns:"80px 2fr 1.2fr 1fr 1fr 80px 120px 100px",
                padding:"14px 18px", borderBottom:`1px solid ${T.border}`,
                background:"transparent", transition:"background 0.2s",
                animation:`fadeUp 0.4s ${i*40}ms ease both` }}>
              <div style={{ fontSize:12, color:T.muted, display:"flex", alignItems:"center" }}>{b.id}</div>
              <div style={{ minWidth:0, display:"flex", alignItems:"center" }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.title}</p>
              </div>
              <div style={{ fontSize:12, color:T.muted, display:"flex", alignItems:"center" }}>{b.author}</div>
              <div style={{ display:"flex", alignItems:"center" }}>
                <span style={{ background:dc+"22", color:dc, border:`1px solid ${dc}44`, fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20 }}>{b.dept}</span>
              </div>
              <div style={{ display:"flex", alignItems:"center" }}>
                <span style={{ background:s.b, color:s.c, border:`1px solid ${s.br}`, fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20 }}>{s.l}</span>
              </div>
              <div style={{ fontSize:13, fontWeight:700, color:T.text, display:"flex", alignItems:"center" }}>
                {b.borrowed}/{b.copies}
              </div>
              <div style={{ fontSize:11, color:T.muted, display:"flex", alignItems:"center" }}>{b.added}</div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <button className="bt-btn" style={{ background:"#3b82f622", border:"1px solid #3b82f633",
                  borderRadius:7, padding:"6px 8px", color:"#3b82f6", cursor:"pointer" }}>
                  <Ico d={IC.edit} s={13}/>
                </button>
                <button onClick={()=>setDelId(b.id)} className="bt-btn"
                  style={{ background:"#ef444422", border:"1px solid #ef444433",
                    borderRadius:7, padding:"6px 8px", color:T.red, cursor:"pointer" }}>
                  <Ico d={IC.trash} s={13}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center",
          backdropFilter:"blur(6px)" }} onClick={e=>e.target===e.currentTarget&&setShowAdd(false)}>
          <div style={{ background:T.surface, border:`1px solid rgba(249,115,22,0.25)`,
            borderRadius:20, width:460, padding:32,
            boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
            animation:"scaleIn 0.25s cubic-bezier(0.34,1.4,0.64,1)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h3 style={{ fontSize:20, fontWeight:900, color:T.text, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em" }}>ADD NEW BOOK</h3>
              <button onClick={()=>setShowAdd(false)} style={{ background:"none", border:"none", color:T.muted, fontSize:20, cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[["Title","title","Book title"],["Author","author","Author name"],["ISBN","isbn","ISBN number"]].map(([l,k,p])=>(
                <div key={k}>
                  <label style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:7 }}>{l}</label>
                  <input className="bt-input" value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}
                    placeholder={p}
                    style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
                      padding:"11px 14px", color:T.text, fontSize:14, fontFamily:"inherit", transition:"border-color 0.2s" }}/>
                </div>
              ))}
              <div>
                <label style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:7 }}>Department</label>
                <select value={form.dept} onChange={e=>setForm(f=>({...f,dept:e.target.value}))}
                  style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
                    padding:"11px 14px", color:T.text, fontSize:14, fontFamily:"inherit", outline:"none", cursor:"pointer" }}>
                  {["Engineering","Medicine","Pharmacy","Science","Arts","Law","Commerce","Computer Science","Architecture"].map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:7 }}>Number of Copies</label>
                <input type="number" min="1" value={form.copies} onChange={e=>setForm(f=>({...f,copies:parseInt(e.target.value)||1}))}
                  className="bt-input"
                  style={{ width:"100%", background:T.card, border:`1px solid ${T.border}`, borderRadius:10,
                    padding:"11px 14px", color:T.text, fontSize:14, fontFamily:"inherit", transition:"border-color 0.2s" }}/>
              </div>
              <div style={{ display:"flex", gap:12, marginTop:8 }}>
                <button onClick={()=>setShowAdd(false)} className="bt-btn"
                  style={{ flex:1, background:"none", border:`1px solid ${T.border}`, borderRadius:10, padding:"12px",
                    color:T.muted, fontSize:13, fontFamily:"inherit", cursor:"pointer" }}>Cancel</button>
                <button onClick={addBook} className="bt-btn"
                  style={{ flex:2, background:`linear-gradient(135deg,${T.orange},#ea580c)`, border:"none",
                    borderRadius:10, padding:"12px", color:"#fff", fontSize:14, fontWeight:800,
                    fontFamily:"inherit", boxShadow:`0 8px 24px ${T.orangeG}`, cursor:"pointer" }}>Add to Catalog</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {delId && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}
          onClick={e=>e.target===e.currentTarget&&setDelId(null)}>
          <div style={{ background:T.surface, border:"1px solid rgba(239,68,68,0.3)",
            borderRadius:18, width:360, padding:28, textAlign:"center",
            animation:"scaleIn 0.22s ease" }}>
            <div style={{ fontSize:40, marginBottom:14 }}>🗑️</div>
            <h3 style={{ fontSize:18, fontWeight:800, color:T.text, marginBottom:8 }}>Delete Book?</h3>
            <p style={{ fontSize:13, color:T.muted, marginBottom:24 }}>This action cannot be undone.</p>
            <div style={{ display:"flex", gap:12 }}>
              <button onClick={()=>setDelId(null)} className="bt-btn"
                style={{ flex:1, background:"none", border:`1px solid ${T.border}`, borderRadius:10,
                  padding:"11px", color:T.muted, fontFamily:"inherit", fontSize:13, cursor:"pointer" }}>Cancel</button>
              <button onClick={()=>deleteBook(delId)} className="bt-btn"
                style={{ flex:1, background:"linear-gradient(135deg,#ef4444,#b91c1c)", border:"none",
                  borderRadius:10, padding:"11px", color:"#fff", fontWeight:800,
                  fontFamily:"inherit", fontSize:14, cursor:"pointer" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BORROWINGS ───────────────────────────────────────────────────
function BorrowingsPage() {
  const [filter, setFilter] = useState("all");

  const filtered = filter==="all" ? ALL_BORROWINGS :
    ALL_BORROWINGS.filter(b=>b.status===filter);

  const stCfg = s => ({
    active:   { c:T.green,  b:"#22c55e18", br:"#22c55e44", l:"Active" },
    overdue:  { c:T.red,    b:"#ef444418", br:"#ef444444", l:"Overdue" },
    "due-soon":{ c:T.yellow, b:"#f59e0b18", br:"#f59e0b44", l:"Due Soon" },
    returned: { c:T.muted,  b:"#64748b18", br:"#64748b44", l:"Returned" },
  }[s]||{ c:T.muted, b:"", br:"", l:s });

  return (
    <div style={{ padding:"30px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div>
          <h2 style={{ fontSize:26, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em", color:T.text }}>BORROWING TRANSACTIONS</h2>
          <p style={{ fontSize:12, color:T.muted }}>{ALL_BORROWINGS.length} active transactions · {ALL_BORROWINGS.filter(b=>b.status==="overdue").length} overdue</p>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[["all","All"],["active","Active"],["overdue","Overdue"],["due-soon","Due Soon"]].map(([v,l])=>(
            <button key={v} onClick={()=>setFilter(v)} className="bt-btn"
              style={{ background:filter===v?`linear-gradient(135deg,${T.orange},#ea580c)`:T.surface,
                border:`1px solid ${filter===v?"transparent":T.border}`, borderRadius:20,
                padding:"7px 16px", color:filter===v?"#fff":T.muted, fontSize:12,
                fontWeight:700, fontFamily:"inherit",
                boxShadow:filter===v?`0 4px 14px ${T.orangeG}`:"none" }}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"80px 1.5fr 1.8fr 1.2fr 100px 100px 100px 120px",
          padding:"12px 18px", borderBottom:`1px solid ${T.border}`,
          fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
          {["Txn","Student","Book","Dept","Borrowed","Due","Days","Status"].map(h=><div key={h}>{h}</div>)}
        </div>
        {filtered.map((b,i)=>{
          const s = stCfg(b.status);
          const dc = deptColor(b.dept);
          const isOver = b.status==="overdue";
          return (
            <div key={b.id} className="bt-row"
              style={{ display:"grid", gridTemplateColumns:"80px 1.5fr 1.8fr 1.2fr 100px 100px 100px 120px",
                padding:"14px 18px", borderBottom:`1px solid ${T.border}`,
                background:isOver?"rgba(239,68,68,0.04)":"transparent",
                borderLeft:isOver?`2px solid #ef444488`:"2px solid transparent",
                transition:"background 0.2s",
                animation:`fadeUp 0.4s ${i*50}ms ease both` }}>
              <div style={{ fontSize:11, color:T.dim, display:"flex", alignItems:"center" }}>{b.id}</div>
              <div style={{ display:"flex", flexDirection:"column", justifyContent:"center" }}>
                <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{b.student}</p>
                <p style={{ fontSize:10, color:T.muted }}>{b.studentId}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center" }}>
                <p style={{ fontSize:12, color:T.text, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{b.book}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center" }}>
                <span style={{ background:dc+"22", color:dc, border:`1px solid ${dc}44`, fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>{b.dept.slice(0,10)}</span>
              </div>
              <div style={{ fontSize:12, color:T.muted, display:"flex", alignItems:"center" }}>{b.borrowed}</div>
              <div style={{ fontSize:12, color:isOver?T.red:T.muted, display:"flex", alignItems:"center", fontWeight:isOver?700:400 }}>{b.due}</div>
              <div style={{ fontSize:14, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif",
                color:isOver?T.red:b.status==="due-soon"?T.yellow:T.green,
                display:"flex", alignItems:"center", letterSpacing:"0.03em" }}>
                {isOver?`+${Math.abs(b.daysLeft)}d`:b.daysLeft+"d"}
              </div>
              <div style={{ display:"flex", alignItems:"center" }}>
                <span style={{ background:s.b, color:s.c, border:`1px solid ${s.br}`,
                  fontSize:11, fontWeight:800, padding:"4px 10px", borderRadius:20 }}>{s.l}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── STUDENTS ─────────────────────────────────────────────────────
function StudentsPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  const filtered = ALL_STUDENTS.filter(s=>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.dept.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding:"30px 32px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:22 }}>
        <div>
          <h2 style={{ fontSize:26, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em", color:T.text }}>STUDENT MANAGEMENT</h2>
          <p style={{ fontSize:12, color:T.muted }}>{ALL_STUDENTS.length} registered students</p>
        </div>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color:T.muted, pointerEvents:"none" }}>
            <Ico d={IC.search} s={15}/>
          </div>
          <input className="bt-input" value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search students…"
            style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:10,
              padding:"10px 14px 10px 38px", color:T.text, fontSize:13, fontFamily:"inherit",
              width:240, transition:"border-color 0.2s" }}/>
        </div>
      </div>

      <div style={{ background:T.surface, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"100px 1.8fr 1fr 1.5fr 80px 80px 80px 130px",
          padding:"12px 18px", borderBottom:`1px solid ${T.border}`,
          fontSize:11, color:T.muted, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase" }}>
          {["ID","Name","Department","Email","Total","Active","Status","Actions"].map(h=><div key={h}>{h}</div>)}
        </div>
        {filtered.map((s,i)=>{
          const dc = deptColor(s.dept);
          const active = s.status==="active";
          return (
            <div key={s.id} className="bt-row"
              style={{ display:"grid", gridTemplateColumns:"100px 1.8fr 1fr 1.5fr 80px 80px 80px 130px",
                padding:"14px 18px", borderBottom:`1px solid ${T.border}`,
                background:"transparent", transition:"background 0.2s",
                animation:`fadeUp 0.4s ${i*50}ms ease both` }}>
              <div style={{ fontSize:11, color:T.muted, display:"flex", alignItems:"center" }}>{s.id}</div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:8, flexShrink:0,
                  background:`hsl(${i*50+200},35%,16%)`, border:`1px solid hsl(${i*50+200},45%,28%)`,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:`hsl(${i*50+200},65%,62%)`, fontWeight:800, fontSize:13 }}>{s.name[0]}</div>
                <p style={{ fontSize:13, fontWeight:700, color:T.text }}>{s.name}</p>
              </div>
              <div style={{ display:"flex", alignItems:"center" }}>
                <span style={{ background:dc+"22", color:dc, border:`1px solid ${dc}44`, fontSize:10, fontWeight:700, padding:"3px 8px", borderRadius:20 }}>{s.dept.slice(0,12)}</span>
              </div>
              <div style={{ fontSize:11, color:T.muted, display:"flex", alignItems:"center" }}>{s.email}</div>
              <div style={{ fontSize:14, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", color:T.orange, display:"flex", alignItems:"center" }}>{s.loans}</div>
              <div style={{ fontSize:14, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", color:T.cyan, display:"flex", alignItems:"center" }}>{s.active}</div>
              <div style={{ display:"flex", alignItems:"center" }}>
                <span style={{ background:active?"#22c55e18":"#ef444418",
                  color:active?T.green:T.red, border:`1px solid ${active?"#22c55e44":"#ef444444"}`,
                  fontSize:11, fontWeight:700, padding:"3px 9px", borderRadius:20 }}>
                  {active?"Active":"Suspended"}
                </span>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <button onClick={()=>setSelected(s)} className="bt-btn"
                  style={{ background:"#3b82f622", border:"1px solid #3b82f633",
                    borderRadius:7, padding:"6px 8px", color:"#3b82f6", cursor:"pointer" }}>
                  <Ico d={IC.eye} s={13}/>
                </button>
                <button className="bt-btn"
                  style={{ background:active?"#ef444422":"#22c55e22",
                    border:`1px solid ${active?"#ef444433":"#22c55e33"}`,
                    borderRadius:7, padding:"6px 8px",
                    color:active?T.red:T.green, cursor:"pointer" }}>
                  <Ico d={active?IC.ban:IC.settings} s={13}/>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Detail Modal */}
      {selected && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", zIndex:1000,
          display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}
          onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div style={{ background:T.surface, border:`1px solid ${T.border}`,
            borderRadius:20, width:500, padding:32,
            boxShadow:"0 32px 80px rgba(0,0,0,0.7)",
            animation:"scaleIn 0.25s cubic-bezier(0.34,1.4,0.64,1)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
              <h3 style={{ fontSize:20, fontWeight:900, color:T.text, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em" }}>STUDENT PROFILE</h3>
              <button onClick={()=>setSelected(null)} style={{ background:"none", border:"none", color:T.muted, fontSize:20, cursor:"pointer" }}>✕</button>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24,
              background:T.card, borderRadius:14, padding:"18px" }}>
              <div style={{ width:52, height:52, borderRadius:12,
                background:`linear-gradient(135deg,#1d4ed8,${T.cyan}44)`,
                border:`1px solid ${T.cyan}44`, display:"flex", alignItems:"center",
                justifyContent:"center", fontSize:22, fontWeight:900, color:T.cyan }}>{selected.name[0]}</div>
              <div>
                <p style={{ fontSize:18, fontWeight:800, color:T.text }}>{selected.name}</p>
                <p style={{ fontSize:12, color:T.muted }}>{selected.id} · {selected.email}</p>
                <span style={{ background:deptColor(selected.dept)+"22", color:deptColor(selected.dept),
                  border:`1px solid ${deptColor(selected.dept)}44`, fontSize:11, fontWeight:700,
                  padding:"3px 10px", borderRadius:20, marginTop:6, display:"inline-block" }}>{selected.dept}</span>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:24 }}>
              {[["Total Loans",selected.loans,T.orange],["Active Now",selected.active,T.cyan],["Status",selected.status==="active"?"Active":"Suspended",selected.status==="active"?T.green:T.red]].map(([k,v,c])=>(
                <div key={k} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:12, padding:"14px", textAlign:"center" }}>
                  <p style={{ fontSize:10, color:T.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.07em" }}>{k}</p>
                  <p style={{ fontSize:20, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif", color:c }}>{v}</p>
                </div>
              ))}
            </div>
            <p style={{ fontSize:13, fontWeight:700, color:T.text, marginBottom:12 }}>Recent Borrowing History</p>
            {ALL_BORROWINGS.filter(b=>b.studentId===selected.id).length > 0 ?
              ALL_BORROWINGS.filter(b=>b.studentId===selected.id).map((b,i)=>(
                <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"10px 14px", marginBottom:8 }}>
                  <div style={{ display:"flex", justifyContent:"space-between" }}>
                    <p style={{ fontSize:13, fontWeight:600, color:T.text }}>{b.book}</p>
                    <span style={{ fontSize:10, fontWeight:700, color:b.status==="overdue"?T.red:T.green }}>{b.status.toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize:11, color:T.muted, marginTop:3 }}>Borrowed {b.borrowed} · Due {b.due}</p>
                </div>
              )) :
              <p style={{ fontSize:13, color:T.muted, textAlign:"center", padding:"16px 0" }}>No active transactions</p>
            }
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  ROOT ADMIN APP
// ══════════════════════════════════════════════════════════════════
export default function BiblioTechAdmin() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const NAV = [
    { id:"dashboard",  label:"Dashboard",   icon:IC.dashboard, badge:null },
    { id:"books",      label:"Books",       icon:IC.books,     badge:null },
    { id:"borrowings", label:"Borrowings",  icon:IC.borrow,    badge:"3" },
    { id:"students",   label:"Students",    icon:IC.users,     badge:null },
    { id:"settings",   label:"Settings",    icon:IC.settings,  badge:null },
  ];

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div style={{ display:"flex", minHeight:"100vh", background:T.bg, color:T.text, fontFamily:"'Outfit','Segoe UI',sans-serif" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width:sidebarOpen?230:66, flexShrink:0, background:T.bg2,
          borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column",
          transition:"width 0.3s cubic-bezier(0.4,0,0.2,1)", overflow:"hidden",
          position:"sticky", top:0, height:"100vh" }}>

          {/* Logo */}
          <div style={{ padding:"22px 18px", borderBottom:`1px solid ${T.border}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:36, height:36, borderRadius:10, flexShrink:0,
                background:`linear-gradient(135deg,${T.orange},#ea580c)`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
                boxShadow:`0 4px 16px ${T.orangeG}`, animation:"glow 3s ease infinite" }}>📚</div>
              {sidebarOpen && (
                <div style={{ animation:"fadeIn 0.2s ease" }}>
                  <p style={{ fontSize:16, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif",
                    letterSpacing:"0.1em", color:T.text, lineHeight:1, whiteSpace:"nowrap" }}>
                    BIBLIO<span style={{ color:T.orange }}>TECH</span>
                  </p>
                  <p style={{ fontSize:9, color:T.muted, letterSpacing:"0.12em", textTransform:"uppercase" }}>Admin Panel</p>
                </div>
              )}
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex:1, padding:"14px 10px", overflowY:"auto" }}>
            {NAV.map(n=>(
              <div key={n.id} className="nav-item" onClick={()=>setPage(n.id)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                  borderRadius:10, marginBottom:4, whiteSpace:"nowrap",
                  background:page===n.id?"rgba(249,115,22,0.1)":"transparent",
                  color:page===n.id?T.orange:"#4b5563",
                  borderLeft:page===n.id?`2px solid ${T.orange}`:"2px solid transparent" }}>
                <div style={{ flexShrink:0 }}><Ico d={n.icon} s={17}/></div>
                {sidebarOpen && <span style={{ fontSize:13, fontWeight:page===n.id?700:400, flex:1 }}>{n.label}</span>}
                {sidebarOpen && n.badge && <span style={{ background:T.red, color:"#fff", fontSize:10, fontWeight:800, borderRadius:20, padding:"1px 7px" }}>{n.badge}</span>}
              </div>
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding:"10px", borderTop:`1px solid ${T.border}` }}>
            <div className="nav-item" onClick={()=>setSidebarOpen(s=>!s)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                borderRadius:9, color:"#2a3045", justifyContent:sidebarOpen?"flex-start":"center" }}>
              <span style={{ fontSize:13, transform:sidebarOpen?"rotate(0deg)":"rotate(180deg)", transition:"transform 0.3s" }}>◂</span>
              {sidebarOpen && <span style={{ fontSize:12 }}>Collapse</span>}
            </div>
            <div className="nav-item bt-btn" style={{ display:"flex", alignItems:"center", gap:10,
              padding:"9px 12px", borderRadius:9, color:T.red, justifyContent:sidebarOpen?"flex-start":"center" }}>
              <Ico d={IC.logout} s={16}/>{sidebarOpen && <span style={{ fontSize:13 }}>Logout</span>}
            </div>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* TOPBAR */}
          <header style={{ height:62, background:"rgba(8,9,13,0.92)", backdropFilter:"blur(14px)",
            borderBottom:`1px solid rgba(249,115,22,0.1)`,
            display:"flex", alignItems:"center", padding:"0 30px",
            justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
            <div>
              <p style={{ fontSize:16, fontWeight:800, color:T.text, fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.06em" }}>
                {NAV.find(n=>n.id===page)?.label.toUpperCase()} PANEL
              </p>
              <p style={{ fontSize:11, color:"#2a3045" }}>Thursday, March 5, 2026 · Benha University</p>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <div style={{ position:"relative" }}>
                <div style={{ width:38, height:38, borderRadius:9, background:T.surface,
                  border:`1px solid ${T.border}`, display:"flex", alignItems:"center",
                  justifyContent:"center", color:T.muted, cursor:"pointer" }}>
                  <Ico d={IC.bell} s={17}/>
                </div>
                <span style={{ position:"absolute", top:7, right:7, width:7, height:7,
                  borderRadius:"50%", background:T.orange, border:`1.5px solid ${T.bg}`,
                  animation:"pulse 2s infinite" }}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10,
                background:T.surface, border:`1px solid ${T.border}`,
                borderRadius:10, padding:"5px 14px 5px 6px", cursor:"pointer" }}>
                <div style={{ width:28, height:28, borderRadius:8,
                  background:`linear-gradient(135deg,#1d4ed8,${T.cyan}44)`,
                  border:`1px solid ${T.cyan}44`, display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:13, fontWeight:800, color:T.cyan }}>L</div>
                <div>
                  <p style={{ fontSize:12, color:T.text, fontWeight:700 }}>Head Librarian</p>
                  <p style={{ fontSize:10, color:T.dim }}>System Admin</p>
                </div>
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <main style={{ flex:1, overflowY:"auto" }}>
            {page==="dashboard"  && <DashboardPage/>}
            {page==="books"      && <BooksPage/>}
            {page==="borrowings" && <BorrowingsPage/>}
            {page==="students"   && <StudentsPage/>}
            {page==="settings"   && (
              <div style={{ padding:"60px 32px", textAlign:"center" }}>
                <div style={{ fontSize:48, marginBottom:14 }}>⚙️</div>
                <p style={{ fontSize:22, fontWeight:800, color:T.text, marginBottom:8 }}>Settings</p>
                <p style={{ fontSize:13, color:T.muted }}>Configuration panel coming soon</p>
              </div>
            )}
          </main>

          {/* Footer */}
          <footer style={{ borderTop:`1px solid ${T.border}`, padding:"14px 32px",
            display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:12, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif",
              letterSpacing:"0.1em", color:T.text }}>
              BIBLIO<span style={{ color:T.orange }}>TECH</span>
              <span style={{ fontSize:11, color:T.dim, fontFamily:"'Outfit',sans-serif", fontWeight:400 }}> · Admin Panel</span>
            </span>
            <p style={{ fontSize:11, color:T.dim }}>© 2026 Benha University Library</p>
          </footer>
        </div>
      </div>
    </>
  );
}

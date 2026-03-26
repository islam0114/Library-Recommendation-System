import React, { useState, useEffect, useRef, useCallback } from "react";
import RegisterPage from "./RegisterPage";
import ForgotPassword from "./ForgotPassword";
import SocialPage from "./SocialPage";
import ExplorePage from "./ExplorePage";
import StudentHome from "./StudentHome";
import BookDetail from "./BookDetail";
import StudentLibrary from "./StudentLibrary";
import StudentAccount from "./StudentAccount";
import ChatbotModal from "../components/ChatbotModal";
import BookCard, { Cover, deptColor } from "../components/BookCard";
import { NotifBell } from "../components/SharedComponents";
import { Ic, P } from "../components/Icons";
import { useBooks, daysLeft, daysColor } from "../utils/helpers";

export default function StudentPortal({ th, t, isAr, tn, setTn, lang, setLang, onBack }) {
    const [showForgot, setShowForgot] = useState(false);
    const [user, setUser] = useState(() => {
        try {
            const saved = sessionStorage.getItem("bt_user");
            return saved ? JSON.parse(saved) : null;
        } catch { return null; }
    });
    const [page, setPage] = useState("home");
    const [pageHistory, setPageHistory] = useState([]);
    const [book, setBook] = useState(null);
    const [aiBooks, setAiBooks] = useState([]);
    const [aiLoading, setAiLoading] = useState(true);

    const AI_API_URL = "http://localhost:8000";
    const apiFetch = async (url, options = {}) => {
        const token = sessionStorage.getItem("bt_token");
        const headers = { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) };
        return fetch(`${AI_API_URL}${url}`, { ...options, headers });
    };

    // ── AI & Books Logic (With Live Reload trigger) ──
    const { books: BOOKS, depts: DEPTS, booksLoading, fetchBooks } = useBooks(AI_API_URL);

    const [anns, setAnns] = useState([]);
    const [requests, setRequests] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [notifs, setNotifs] = useState([]);
    const [searchQ, setSearchQ] = useState("");
    const [exploreFilter, setExploreFilter] = useState("All");
    const [reqFlash, setReqFlash] = useState(null);

    // ── Load + Auto-Refresh all student data every 5s (LIVE SYNC) ───────────────
    const pollRef = useRef(null);

    const refreshData = useCallback(async () => {
        if (!user) return;
        try {
            const [annsRes, reqRes, wlRes, notifRes] = await Promise.all([
                fetch(`${AI_API_URL}/api/announcements`),
                apiFetch("/api/requests/my"),
                apiFetch("/api/wishlist"),
                apiFetch("/api/notifications"),
            ]);
            if (annsRes.ok) { const d = await annsRes.json(); setAnns(d.announcements || []); }
            if (reqRes.ok)  { const d = await reqRes.json();  setRequests(d.requests || []); }
            if (wlRes.ok)   { const d = await wlRes.json();   setWishlist(d.wishlist || []); }
            if (notifRes.ok){ const d = await notifRes.json(); setNotifs(prev => {
                const prevIds = new Set(prev.map(n => n.id));
                const incoming = d.notifications || [];
                const merged = incoming.map(n => prevIds.has(n.id) ? prev.find(p => p.id === n.id) : n);
                return merged;
            }); }
        } catch { /* silently ignore network errors */ }
    }, [user]);

    useEffect(() => {
        if (!user) { clearInterval(pollRef.current); return; }
        refreshData(); 
        pollRef.current = setInterval(() => {
            refreshData();
            fetchBooks();
        }, 5000); 
        return () => clearInterval(pollRef.current);
    }, [user?.userId, fetchBooks, refreshData]);

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }, [page, book]);

    useEffect(() => {
        if (page === "home" && user && user.userId && BOOKS.length > 0) {
            setAiLoading(true);
            const token = sessionStorage.getItem("bt_token");
            
            const getFallbackBooks = () => {
                if (!user || !user.dept) return BOOKS.slice(0, 6);
                const deptStr = String(user.dept).toLowerCase();
                const deptKeyword = deptStr.split(" ")[0]; 
                
                let matched = BOOKS.filter(b => {
                    const bDept = String(b.dept || "").toLowerCase();
                    return bDept === deptStr || bDept.includes(deptKeyword) || deptStr.includes(bDept);
                });
                
                if (matched.length === 0) matched = BOOKS; 
                return matched.slice(0, 6);
            };

            fetch(`${AI_API_URL}/api/students/${user.userId}/ai-recommendations`, {
                headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) }
            })
            .then(res => res.json())
            .then(data => {
                if (data.recommendations && data.recommendations.length > 0) {
                    const recBooks = data.recommendations
                        .map(aiBk => BOOKS.find(b => b.title === aiBk.title || b.id === aiBk.id || b.book_id === aiBk.book_id))
                        .filter(Boolean);
                    setAiBooks(recBooks.length > 0 ? recBooks : getFallbackBooks());
                } else {
                    setAiBooks(getFallbackBooks());
                }
            })
            .catch(err => {
                setAiBooks(getFallbackBooks());
            })
            .finally(() => setAiLoading(false));
        }
    }, [page, user, BOOKS]);

    const sc = s => ({ available: { label: t.available, c: th.green }, borrowed: { label: t.borrowed, c: th.red }, reserved: { label: t.reserved, c: th.amber }, coming_soon: { label: t.comingSoon, c: th.cyan } }[s] || { label: s, c: th.muted });
    const studentReqStatus = bid => { const r = requests.find(x => x.bid === bid && x.status !== "rejected"); return r ? r.status : null; };
    
    // ── Borrow Request → POST /api/requests (With Live Sync Trigger) ─────────────────
    const sendBorrowRequest = async bk => {
        if (!user) return;
        const existing = requests.find(r => r.bid === bk.id && r.status !== "rejected");
        if (existing) return;
        try {
            const res = await apiFetch("/api/requests", {
                method: "POST",
                body: JSON.stringify({ book_id: bk.id, book_title: bk.title, book_author: bk.author, book_dept: bk.dept }),
            });
            if (!res.ok) return;
            
            // Reload requests, notifications, and books immediately to reflect the -1 copy
            const [reqData, notifData] = await Promise.all([
                apiFetch("/api/requests/my").then(r => r.ok ? r.json() : { requests: [] }),
                apiFetch("/api/notifications").then(r => r.ok ? r.json() : { notifications: [] }),
            ]);
            setRequests(reqData.requests || []);
            setNotifs(notifData.notifications || []);
            fetchBooks();
            
            setReqFlash(bk.id); setTimeout(() => setReqFlash(null), 2500);
        } catch (_) {}
    };

    const toggleWishlist = async bid => {
        if (!user) return;
        setWishlist(prev => prev.includes(bid) ? prev.filter(x => x !== bid) : [...prev, bid]);
        try {
            await apiFetch("/api/wishlist/toggle", { method: "POST", body: JSON.stringify({ book_id: bid }) });
            const d = await apiFetch("/api/wishlist").then(r => r.ok ? r.json() : null);
            if (d) setWishlist(d.wishlist || []);
        } catch (_) {}
    };

    const markAllRead = async () => {
        setNotifs(prev => prev.map(n => ({ ...n, read: true })));
        try { await apiFetch("/api/notifications/mark-read", { method: "PATCH", body: JSON.stringify({ ids: [] }) }); } catch (_) {}
    };
    const markOneRead = async id => {
        setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try { await apiFetch("/api/notifications/mark-read", { method: "PATCH", body: JSON.stringify({ ids: [id] }) }); } catch (_) {}
    };

    const nav = (pg, bk = null) => { 
        setPageHistory(prev => [...prev, { page, book }]);
        setPage(pg); 
        setBook(bk); 
        if (pg !== "explore" && pg !== "detail") setSearchQ(""); 
    };
    const goBack = () => {
        setPageHistory(prev => {
            if (prev.length === 0) {
               setPage("home"); setBook(null); return prev;
            }
            const newHistory = [...prev];
            const lastState = newHistory.pop();
            setPage(lastState.page); setBook(lastState.book);
            return newHistory;
        });
    };
    
    const enrichWithCover = reqs => reqs.map(r => {
        if (r.bCover) return r;
        const bk = BOOKS.find(b => b.id === r.bid);
        return { ...r, bCover: bk ? bk.cover : ["#1a1a2e","#16213e"] };
    });
    const activeLoans = enrichWithCover(requests.filter(r => r.status === "approved" && !r.returnDate));
    const history     = enrichWithCover(requests.filter(r => r.returnDate || r.status === "rejected"));
    const pendingReqs = enrichWithCover(requests.filter(r => r.status === "pending"));

    const [loginEmail, setLoginEmail] = useState("");
    const [loginPass, setLoginPass] = useState("");
    const [loginErr, setLoginErr] = useState("");
    const [loginLoading, setLoginLoading] = useState(false);
    const [showRegister, setShowRegister] = useState(false);

    const doLogin = async () => {
        if (!loginEmail || !loginPass) { setLoginErr(t.fillFields); return; }
        setLoginLoading(true); setLoginErr("");
        try {
            const res = await fetch("http://localhost:8000/api/auth/student", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: loginEmail, password: loginPass }) });
            const data = await res.json();
            if (!res.ok) { setLoginErr(data.detail || t.loginFailed); setLoginLoading(false); return; }
            sessionStorage.setItem("bt_token", data.token);
            persistUser({
                name:        data.user.name        || "",
                libId:       data.user.lib_id       || "",
                userId:      data.user.id,
                email:       data.user.email        || "",
                dept:        data.user.dept         || "",
                university:  data.user.university   || "",
                faculty:     data.user.faculty      || "",
                year:        data.user.year         || "",
                national_id: data.user.national_id  || "",
                status:      data.user.status       || "active",
                joined:      data.user.joined       || "",
            });
        } catch (e) { setLoginErr(t.cannotConnect); }
        setLoginLoading(false);
    };

    const persistUser = (userData) => {
        setUser(userData);
        try { sessionStorage.setItem("bt_user", JSON.stringify(userData)); } catch { }
    };

    if (showRegister) return <RegisterPage tn={tn} lang={lang} onBack={() => setShowRegister(false)} onSuccess={() => setShowRegister(false)} />;
    if (showForgot) return <ForgotPassword tn={tn} lang={lang} onBack={() => setShowForgot(false)} />;

    if (!user) {
        return (
            <div style={{ minHeight: "100vh", background: th.bg, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", direction:"ltr" }}>
                <div style={{ position: "absolute", top: "-15%", left: "-10%", width: 440, height: 440, borderRadius: "50%", background: `${th.prime}0d`, filter: "blur(110px)", pointerEvents: "none" }} />
                <div style={{ width: "100%", maxWidth: 420, padding: "0 20px", animation: "fadeUp 0.6s ease", position: "relative", zIndex: 1 }}>
                    <div style={{ textAlign: "center", marginBottom: 36 }}>
                        <div style={{ width: 54, height: 54, borderRadius: 16, margin: "0 auto 14px", background: `linear-gradient(135deg,${th.prime},${th.primeD})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 10px 28px ${th.primeG}`, color: "#fff" }}><Ic p={P.bookOpen} s={24} /></div>
                        <h1 style={{ fontSize: 27, fontWeight: 700, color: th.text }}>Biblio<span style={{ color: th.prime }}>Tech</span></h1>
                        <p style={{ fontSize: 12, color: th.sub }}>{t.loginSub}</p>
                    </div>
                    <div style={{ background: th.surface, border: `1px solid ${th.prime}22`, borderRadius: 20, padding: "28px 28px 24px", boxShadow: "0 24px 64px rgba(0,0,0,0.4)" }}>
                        <h2 style={{ fontSize: 19, fontWeight: 700, color: th.text, marginBottom: 22, textAlign: "center" }}>{t.welcome}</h2>
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 10, color: th.sub, fontWeight: 600, display: "block", marginBottom: 6 }}>{isAr ? "البريد الإلكتروني" : "Email"}</label>
                            <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} style={{ width: "100%", background: th.card, border: `1px solid ${th.border}`, borderRadius: 11, padding: "12px", color: th.text }} />
                        </div>
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 10, color: th.sub, fontWeight: 600, display: "block", marginBottom: 6 }}>{t.password}</label>
                            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} style={{ width: "100%", background: th.card, border: `1px solid ${th.border}`, borderRadius: 11, padding: "12px", color: th.text }} />
                        </div>
                        {loginErr && <p style={{ fontSize: 12, color: th.red, marginBottom: 11 }}>{loginErr}</p>}
                        <button onClick={doLogin} disabled={loginLoading} className="btn" style={{ width: "100%", background: `linear-gradient(135deg,${th.prime},${th.primeD})`, borderRadius: 11, padding: "13px", color: "#fff", fontWeight: 700 }}>
                            {loginLoading ? t.signingIn : t.signIn}
                        </button>
                        <button onClick={() => setShowForgot(true)} className="btn" style={{ width: "100%", color: th.sub, fontSize: 11, marginTop: 12, textAlign: "center" }}>
                            {t.forgotPass}
                        </button>
                        <p style={{ textAlign: "center", fontSize: 12, color: th.sub, marginTop: 16 }}>
                            {t.noAccount} <button onClick={() => setShowRegister(true)} style={{ color: th.prime, fontWeight: 700 }} className="btn">{t.register}</button>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

  // ── MAIN LAYOUT ──
  return(<div style={{minHeight:"100vh",background:th.bg,color:th.text,fontFamily:"'Plus Jakarta Sans',sans-serif",direction:"ltr",transition:"background 0.4s,color 0.4s"}}>
    {/* NAV */}
    <nav style={{position:"sticky",top:0,zIndex:100,height:62,background:th.navBg,backdropFilter:"blur(20px)",borderBottom:`1px solid ${th.prime}18`,display:"flex",alignItems:"center",padding:"0 24px",justifyContent:"space-between",flexDirection:"row"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>nav("home")}>
        <div style={{width:31,height:31,borderRadius:10,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Ic p={P.bookOpen} s={15}/></div>
        <span style={{fontSize:17,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",color:th.text}}>Biblio<span style={{color:th.prime}}>Tech</span></span>
      </div>
      <div style={{display:"flex",gap:2,flexDirection:"row"}}>
        {[[t.dashboard,"home",P.home],[t.explore,"explore",P.explore],[t.library,"library",P.lib],[t.socialTab,"social",P.social]].map(([label,id,icon])=>(
          <button key={id} onClick={()=>nav(id)} className="btn" style={{display:"flex",alignItems:"center",gap:6,background:page===id?th.prime+"20":"transparent",border:`1px solid ${page===id?th.prime+"44":"transparent"}`,borderRadius:10,padding:"7px 13px",color:page===id?th.prime:th.sub,fontSize:12,fontWeight:page===id?600:400,flexDirection:"row"}}>
            <Ic p={icon} s={14}/>{label}
            {id==="library"&&activeLoans.length>0&&<span style={{fontSize:9,fontWeight:700,background:th.prime,color:"#fff",borderRadius:20,padding:"1px 5px"}}>{activeLoans.length}</span>}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:"row"}}>
        <button onClick={() => setTn(tn === "dark" ? "light" : "dark")} className="btn" style={{ width: 36, height: 36, borderRadius: 10, background: th.surface, border: `1px solid ${th.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: th.sub, flexShrink: 0 }}><Ic p={tn === "dark" ? P.sun : P.moon} s={18} /></button>
        <button onClick={() => setLang(lang === "en" ? "ar" : "en")} className="btn" title={isAr ? "Switch to English" : "تغيير للعربية"} style={{ width: 36, height: 36, borderRadius: 10, background: th.surface, border: `1px solid ${th.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: th.sub, flexShrink: 0 }}><Ic p={P.globe} s={18} /></button>
        <NotifBell th={th} t={t} isAr={isAr} notifs={notifs} onMarkAll={markAllRead} onMarkOne={markOneRead}/>
        <button onClick={()=>nav("account")} className="btn" style={{display:"flex",alignItems:"center",gap:7,background:page==="account"?th.prime+"20":th.surface,border:`1px solid ${page==="account"?th.prime+"44":th.border}`,borderRadius:10,padding:"4px 11px 4px 6px",flexDirection:"row"}}>
          <div style={{width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,#1d4ed8,${th.cyan}50)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:th.cyan,fontFamily:"'Space Grotesk',sans-serif"}}>{user.name[0]}</div>
          <span style={{fontSize:12,color:th.text}}>{user.name.split(" ")[0]}</span>
        </button>
        <button onClick={() => { sessionStorage.removeItem("bt_token"); sessionStorage.removeItem("bt_user"); setUser(null); setPage("home"); }} className="btn" style={{border:`1px solid ${th.border}`,borderRadius:9,padding:"7px 11px",color:th.sub,display:"flex",alignItems:"center",gap:5,flexDirection:"row"}}><Ic p={P.logout} s={13}/></button>
      </div>
    </nav>

    {page === "home" && <StudentHome th={th} t={t} isAr={isAr} nav={nav} BOOKS={BOOKS} activeLoans={activeLoans} history={history} anns={anns} aiLoading={aiLoading} aiBooks={aiBooks} sc={sc} wishlist={wishlist} toggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} daysLeft={daysLeft} daysColor={daysColor} />}
    {page==="detail"&&book&&<BookDetail th={th} t={t} isAr={isAr} book={book} sc={sc} wishlist={wishlist} toggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} requests={requests} sendBorrowRequest={sendBorrowRequest} reqFlash={reqFlash} onBack={goBack} daysLeft={daysLeft} daysColor={daysColor} BOOKS={BOOKS} onBook={bk => nav("detail", bk)}/>}
    {page==="explore"&&<ExplorePage th={th} t={t} isAr={isAr} searchQ={searchQ} setSearchQ={setSearchQ} exploreFilter={exploreFilter} setExploreFilter={setExploreFilter} sc={sc} wishlist={wishlist} toggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} onBook={bk=>{nav("detail", bk);}} books={BOOKS} depts={DEPTS} booksLoading={booksLoading}/>}
    {page==="social"&&<div style={{height:"calc(100vh - 62px)",overflow:"hidden"}}><SocialPage th={th} token={sessionStorage.getItem("bt_token")||""} myId={user.userId} myName={user.name}/></div>}
    {page === "library" && <StudentLibrary th={th} t={t} isAr={isAr} nav={nav} activeLoans={activeLoans} history={history} wishlist={wishlist} pendingReqs={pendingReqs} BOOKS={BOOKS} daysLeft={daysLeft} daysColor={daysColor} sc={sc} toggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} />}
    {page === "account" && <StudentAccount th={th} t={t} isAr={isAr} user={user} activeLoans={activeLoans} history={history} wishlist={wishlist} apiFetch={apiFetch} persistUser={persistUser} />}

    {(page === "home" || page === "explore") && <ChatbotModal th={th} t={t} isAr={isAr} BOOKS={BOOKS} nav={nav} AI_API_URL={AI_API_URL} />}
  </div>);
}
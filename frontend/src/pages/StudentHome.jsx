/**
 * Page: StudentHome (Dashboard)
 * Purpose: The main landing view for students.
 * Features: Trending books slider, AI 'For You' recommendations, quick loan stats, and announcements.
 */

import React, { useState, useEffect } from "react";
import { Ic, P } from "../components/Icons";
import BookCard, { Cover } from "../components/BookCard";

export default function StudentHome({
  th, t, isAr, nav, BOOKS, activeLoans, history, anns,
  aiLoading, aiBooks, sc, wishlist, toggleWishlist,
  studentReqStatus, daysLeft, daysColor
}) 

{
  const parseDate = (dateStr) => {
    if (!dateStr) return 0;
    const safeDate = String(dateStr).replace(' ', 'T'); 
    const time = new Date(safeDate).getTime();
    return isNaN(time) ? 0 : time;
  };

  const trendingBooks = [...BOOKS]
    .sort((a, b) => (Number(b.borrows) || 0) - (Number(a.borrows) || 0))
    .slice(0, 7);

  const newArrivals = [...BOOKS]
    .sort((a, b) => {
      const tB = parseDate(b.created_at);
      const tA = parseDate(a.created_at);
      return tB !== tA ? tB - tA : (Number(b.book_id) || 0) - (Number(a.book_id) || 0);
    })
    .slice(0, 15);
  
  const nextDueLoan = activeLoans.slice().sort((a,b) => new Date(a.dueDateISO) - new Date(b.dueDateISO))[0];

  const [si, setSi] = useState(0);
  useEffect(() => {
    const len = trendingBooks.length || 1;
    const i = setInterval(() => setSi(a => (a + 1) % len), 4000);
    return () => clearInterval(i);
  }, [trendingBooks.length]);

  const getPos = i => {
    let d = i - si;
    const len = trendingBooks.length;
    if (d > len / 2) d -= len;
    if (d < -len / 2) d += len;
    return d;
  };

  const sectionStyle = {
    background: th.surface, border: `1px solid ${th.border}`, borderRadius: 24,
    padding: 32, boxShadow: `0 12px 40px rgba(0,0,0,0.06)`, position: "relative", overflow: "hidden"
  };

  return (
    <div style={{direction: "ltr", display: "flex", flexDirection: "column", paddingBottom: 60}}>
      {/* 1. TOP TRENDING HERO SLIDER SECTION */}
      <div style={{position:"relative", height:460, overflow:"hidden", background:`linear-gradient(180deg,#0b0e18,${th.bg})`, display: "flex", alignItems: "center", justifyContent: "center"}}>
        <div style={{position:"absolute", inset:0, pointerEvents:"none", background:`radial-gradient(ellipse at 50% 30%, ${trendingBooks[si % trendingBooks.length]?.cover?.[1]||th.red}44 0%, transparent 65%)`, filter:"blur(40px)", transition:"background 1s ease"}}/>
        
        <div style={{position: "absolute", left: isAr ? "auto" : "8%", right: isAr ? "8%" : "auto", top: "50%", transform: "translateY(-50%)", zIndex: 10, maxWidth: 380, textAlign: isAr ? "right" : "left"}} dir={isAr ? "rtl" : "ltr"}>
            <span style={{fontSize: 13, fontWeight: 800, color: th.red, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8, justifyContent: isAr ? "flex-start" : "flex-start"}}>
              <span style={{fontSize: 18}}>🔥</span> {isAr ? "الأكثر إقبالاً هذا الأسبوع" : "Trending This Week"}
            </span>
            <h1 style={{fontSize: 42, fontWeight: 800, color: "#fff", fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.15, marginBottom: 16}}>
              {isAr ? "اكتشف ما يقرأه" : "Discover what"} <br/>
              <span style={{
                backgroundImage: `linear-gradient(135deg, ${th.amber}, ${th.red})`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
                display: "inline-block",
                lineHeight: "normal"
              }}>
                {isAr ? "الجميع الآن." : "everyone is reading."}
              </span>
            </h1>
            <p style={{fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.7, marginBottom: 28}}>
              {isAr ? "انضم لزملائك واستكشف الكتب التي تتصدر قائمة الاستعارات في مكتبة الجامعة." : "Join your peers and explore the books topping the borrow charts in the university library."}
            </p>
            <button onClick={() => nav("explore")} className="btn" style={{background: `linear-gradient(135deg, ${th.red}, #b91c1c)`, color: "#fff", padding: "12px 28px", borderRadius: 12, fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", display: "inline-flex", alignItems: "center", gap: 8}}><Ic p={P.explore} s={16}/> {t.explore}</button>
        </div>

        <div style={{position:"relative", height:"100%", width: "100%", display:"flex", alignItems:"center", justifyContent: isAr ? "flex-start" : "flex-end", paddingRight: isAr ? 0 : "8%", paddingLeft: isAr ? "8%" : 0}}>
          {trendingBooks.map((bk,i)=>{
            const pos = getPos(i);
            const abs = Math.abs(pos);
            if(abs>3) return null;
            const isC = pos===0, scale = isC?1:abs===1?0.78:0.61, x = pos*190, z = isC?10:abs===1?6:3, op = isC?1:abs===1?0.58:0.26;
            
            return(
              <div key={bk.id} onClick={()=>{if(isC){nav("detail", bk);}else setSi(i);}} style={{position:"absolute", transform:`translateX(${x}px) scale(${scale})`, transition:"all 0.6s cubic-bezier(0.25, 1, 0.5, 1)", zIndex:z, opacity:op, cursor:"pointer", width:210, right: isAr ? "auto" : "20%", left: isAr ? "20%" : "auto"}}>
                {isC && <div style={{position:"absolute", top:-16, left:"50%", transform:"translateX(-50%)", background: `linear-gradient(135deg, ${th.amber}, ${th.red})`, color:"#fff", fontSize:12, fontWeight:800, padding:"4px 14px", borderRadius:20, fontFamily:"'Space Grotesk',sans-serif", boxShadow:`0 6px 16px ${th.red}66`, whiteSpace:"nowrap", zIndex:20}}>
                  {isAr ? `المركز #${i+1}` : `Rank #${i+1}`}
                </div>}
                <div style={{width:210, height:290, borderRadius:16, overflow:"hidden", border:`2px solid ${isC ? th.red+"90" : "rgba(255,255,255,0.05)"}`, boxShadow:isC ? `0 24px 60px ${bk.cover?.[1]||"#000"}66` : "0 8px 20px rgba(0,0,0,0.4)", transition:"all 0.6s ease"}}>
                  <Cover colors={bk.cover} h={290} imageUrl={bk.image_proxy_url||bk.image_url} title={bk.title}/>
                </div>
                {abs<=1 && <div style={{textAlign:"center", marginTop:16}}>
                  <p style={{fontSize:isC?15:12, fontWeight:isC?800:600, color:isC?"#fff":"rgba(255,255,255,0.5)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontFamily:"'Space Grotesk',sans-serif"}}>{bk.title}</p>
                  <p style={{fontSize:11, color:isC?th.amber:"rgba(255,255,255,0.4)", marginTop:4, fontWeight: 700}}>{bk.borrows} {isAr ? "استعارة" : "Reads"}</p>
                </div>}
              </div>
            );
          })}
        </div>

        <button onClick={()=>setSi(a=>(a-1+trendingBooks.length)%trendingBooks.length)} className="btn" style={{position:"absolute", left:24, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"50%", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", zIndex:20}}><Ic p={isAr?P.chevR:P.chevL} s={20}/></button>
        <button onClick={()=>setSi(a=>(a+1)%trendingBooks.length)} className="btn" style={{position:"absolute", right:24, top:"50%", transform:"translateY(-50%)", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:"50%", width:44, height:44, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", zIndex:20}}><Ic p={isAr?P.chevL:P.chevR} s={20}/></button>
        <div style={{position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)", display:"flex", gap:6, zIndex:20}}>
          {trendingBooks.map((_,i)=>(<div key={i} onClick={()=>setSi(i)} style={{width:i===si?24:6, height:6, borderRadius:4, background:i===si?th.red:"rgba(255,255,255,0.2)", cursor:"pointer", transition:"all 0.3s ease"}}/>))}
        </div>
      </div>

      {/* 2. ANNOUNCEMENTS TICKER */}
      {anns.length>0 && <div style={{background:th.surface, borderBottom:`1px solid ${th.border}`, padding:"10px 0", overflow:"hidden", position:"relative", boxShadow:`0 4px 12px rgba(0,0,0,0.05)`}}>
        <div style={{position:"absolute", left:0, top:0, bottom:0, width:80, zIndex:2, background:`linear-gradient(90deg,${th.surface},transparent)`, pointerEvents:"none"}}/>
        <div style={{position:"absolute", right:0, top:0, bottom:0, width:80, zIndex:2, background:`linear-gradient(270deg,${th.surface},transparent)`, pointerEvents:"none"}}/>
        <div style={{display:"flex", alignItems:"center", animation:`marquee ${anns.length*14+10}s linear infinite`, width:"max-content"}}>
          {[...anns,...anns,...anns].map((a,i)=>(
            <div key={i} style={{display:"flex", alignItems:"center", gap:8, padding:"0 32px", borderRight:`1px solid ${th.border}`, flexShrink:0}}>
              <span style={{width:6, height:6, borderRadius:"50%", background:a.priority==="urgent"?th.red:a.priority==="important"?th.amber:th.prime, display:"inline-block", flexShrink:0, boxShadow:`0 0 8px ${a.priority==="urgent"?th.red:a.priority==="important"?th.amber:th.prime}`}}/>
              <span style={{fontSize:13, fontWeight:700, color:a.priority==="urgent"?th.red:a.priority==="important"?th.amber:th.prime, fontFamily:"'Space Grotesk',sans-serif", whiteSpace:"nowrap"}}>{a.title}:</span>
              <span style={{fontSize:13, color:th.text, whiteSpace:"nowrap"}}>{a.body}</span>
            </div>
          ))}
        </div>
      </div>}

      <div style={{maxWidth: 1400, margin: "0 auto", padding: "36px 24px", display: "flex", flexDirection: "column", gap: 36, width: "100%"}}>
        {/* 3. FOR YOU (AI POWERED) */}
        <div style={sectionStyle}>
          <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 28, flexDirection: "row"}}>
            <div style={{width: 4, height: 26, borderRadius: 4, background: `linear-gradient(180deg, ${th.accent}, ${th.accent}88)`}}/>
            <h2 style={{fontSize: 24, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif"}}>{isAr ? "لك" : "For You"}</h2>
            <span style={{fontSize: 11, background: th.accent+"18", color: th.accent, border: `1px solid ${th.accent}44`, padding: "4px 12px", borderRadius: 20, fontWeight: 700, letterSpacing: "0.05em", marginLeft: isAr?0:"auto", marginRight: isAr?"auto":0}}>AI POWERED</span>
          </div>
          
          <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 20}}>
            {aiLoading ? (
              [1,2,3,4,5,6].map(i => <div key={i} style={{width: "100%", height: 320, borderRadius: 16, background: th.card, border: `1px solid ${th.border}`, animation: "blink 1.5s ease infinite"}}/>)
            ) : aiBooks.length > 0 ? (
              aiBooks.slice(0, 6).map(bk => (
                <div key={bk.id} style={{width: "100%", animation: "fadeUp 0.4s ease both"}}>
                  <BookCard bk={bk} th={th} sc={sc} onClick={()=>{nav("detail", bk);}} wishlist={wishlist} onToggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} isAr={isAr}/>
                </div>
              ))
            ) : (
              <p style={{color: th.sub, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif"}}>{isAr ? "لا توجد توصيات متاحة حالياً." : "No recommendations available right now."}</p>
            )}
          </div>
        </div>

        {/* 4. DUE SOON & QUICK STATS */}
        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24}}>
          <div style={{...sectionStyle, padding: 32, display: "flex", alignItems: "center", gap: 24, flexDirection: "row"}}>
            <div style={{width: 72, height: 72, borderRadius: 20, background: nextDueLoan ? th.amber+"18" : th.green+"18", color: nextDueLoan ? th.amber : th.green, border: `1px solid ${nextDueLoan ? th.amber : th.green}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0}}>
              <Ic p={nextDueLoan ? P.calendar : P.check} s={32}/>
            </div>
            <div style={{textAlign: isAr ? "right" : "left", flex: 1}}>
              <h3 style={{fontSize: 20, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6}}>{nextDueLoan ? (isAr ? "موعد تسليم قريب" : "Due Soon") : (isAr ? "لا توجد متأخرات" : "All Clear!")}</h3>
              <p style={{fontSize: 14, color: th.sub, lineHeight: 1.6}}>
                {nextDueLoan ?
                  <span dir={isAr ? "rtl" : "ltr"}>{isAr ? "كتاب" : "Book"} <strong style={{color: th.text}}>"{nextDueLoan.bTitle}"</strong> {isAr ? "يجب تسليمه في خلال" : "is due in"} <strong style={{color: daysColor(daysLeft(nextDueLoan.dueDateISO), th)}}><span dir="ltr">{daysLeft(nextDueLoan.dueDateISO)}</span> {isAr ? "أيام" : "days"}</strong>.</span>
                  : (isAr ? "ليس لديك أي كتب يجب تسليمها قريباً." : "You have no upcoming due dates.")}
              </p>
            </div>
          </div>
          <div style={{...sectionStyle, padding: 32, display: "flex", alignItems: "center", justifyContent: "space-around", flexDirection: "row", background: `linear-gradient(135deg, ${th.surface}, ${th.card})`}}>
            <div style={{textAlign: "center"}}>
                <p style={{fontSize: 42, fontWeight: 800, color: th.prime, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1}}>{activeLoans.length}</p>
                <p style={{fontSize: 13, color: th.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 8}}>{t.activeLoans}</p>
            </div>
            <div style={{width: 1, height: 60, background: th.border}}/>
            <div style={{textAlign: "center"}}>
                <p style={{fontSize: 42, fontWeight: 800, color: th.cyan, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1}}>{history.filter(r=>r.returnDate).length}</p>
                <p style={{fontSize: 13, color: th.sub, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: 8}}>{t.totalRead || (isAr ? "إجمالي المقروء" : "Total Read")}</p>
            </div>
          </div>
        </div>

        {/* 5. NEW ARRIVALS */}
        <div style={{...sectionStyle, padding: "32px 28px", width: "100%"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28, flexDirection: "row"}}>
            <div style={{width:4,height:26,borderRadius:4,background:`linear-gradient(180deg,${th.green},${th.green}88)`}}/>
            <h2 style={{fontSize:24,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr ? "أحدث الإضافات" : "New Arrivals"}</h2>
          </div>
          <div className="no-scroll" style={{display: "flex", gap: 18, overflowX: "auto", paddingBottom: 16, flexDirection: "row", scrollSnapType: "x mandatory"}}>
            {newArrivals.map(bk => (
              <div key={bk.id} style={{width: 175, flexShrink: 0, scrollSnapAlign: "start"}}>
                <BookCard bk={bk} th={th} sc={sc} onClick={()=>{nav("detail", bk);}} wishlist={wishlist} onToggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} isAr={isAr}/>
              </div>
            ))}
          </div>
        </div>

        {/* 6. ANNOUNCEMENTS CARDS */}
        {anns.length>0 && <div style={sectionStyle}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28,flexDirection:"row"}}>
            <div style={{width:4,height:26,borderRadius:4,background:`linear-gradient(180deg,${th.amber},${th.amber}88)`}}/>
            <h2 style={{fontSize:24,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{t.announcements}</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
            {anns.map((a,i)=>{
              const c=a.priority==="urgent"?th.red:a.priority==="important"?th.amber:th.prime;
              return(
              <div key={a.id} style={{background:th.card,border:`1px solid ${th.border}`,borderLeft:`4px solid ${c}`,borderRadius:16,padding:"20px",display:"flex",gap:16,animation:`fadeUp 0.4s ${i*55}ms ease both`,flexDirection:"row"}}>
                <div style={{width:42,height:42,borderRadius:12,background:`${c}18`,display:"flex",alignItems:"center",justifyContent:"center",color:c,flexShrink:0}}><Ic p={P.megaphone} s={20}/></div>
                <div style={{flex:1,minWidth:0,textAlign:isAr?"right":"left"}} dir={isAr?"rtl":"ltr"}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,flexDirection:"row",justifyContent:"space-between"}}>
                    <h3 style={{fontSize:15,fontWeight:800,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{a.title}</h3>
                    <span style={{fontSize:10,fontWeight:800,padding:"3px 8px",borderRadius:20,background:`${c}18`,color:c,border:`1px solid ${c}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase",flexShrink:0}}>{a.priority}</span>
                  </div>
                  <p style={{fontSize:13,color:th.sub,lineHeight:1.7,marginBottom:8,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{a.body}</p>
                  <p style={{fontSize:11,color:th.muted,display:"flex",alignItems:"center",gap:5,flexDirection:"row"}}><Ic p={P.clock} s={12}/>{a.date}</p>
                </div>
              </div>);
            })}
          </div>
        </div>}
      </div>
    </div>
  );
}
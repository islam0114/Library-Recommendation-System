import React from "react";
import { Ic, P } from "../components/Icons";

const FloatBook = ({ colors, top, left, delay, flip }) => (
  <div style={{ position: "absolute", top, left, animation: `floatY 6s ease-in-out infinite`, animationDelay: `${delay}s`, transform: flip ? "scaleX(-1) rotate(10deg)" : "rotate(-10deg)", opacity: 0.8 }}>
    <div style={{ width: 80, height: 110, borderRadius: "4px 12px 12px 4px", background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})`, boxShadow: "12px 16px 32px rgba(0,0,0,0.25), inset -2px 0 8px rgba(0,0,0,0.2)", position: "relative", borderLeft: "4px solid rgba(255,255,255,0.4)" }} >
      <div style={{ position: "absolute", left: 8, top: 0, bottom: 0, width: 2, background: "rgba(0,0,0,0.1)" }} />
    </div>
  </div>
);

const PortalCard = ({ th, title, desc, btn, accent, icon, onClick, isAr }) => (
  <div onClick={onClick} className="portal-card" style={{ background: th.surface, borderRadius: 24, padding: 32, cursor: "pointer", border: `1px solid ${th.border}`, transition: "all 0.3s cubic-bezier(0.34,1.2,0.64,1)", position: "relative", overflow: "hidden" }} >
    <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle at top right, ${accent}22, transparent 70%)` }} />
    <div style={{ width: 56, height: 56, borderRadius: 16, background: `${accent}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, border: `1px solid ${accent}33` }} >
      <Ic p={icon} s={28} color={accent} />
    </div>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>{title}</h2>
    <p style={{ fontSize: 13, color: th.sub, lineHeight: 1.6, marginBottom: 28, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{desc}</p>
    <div style={{ display: "flex", alignItems: "center", gap: 8, color: accent, fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }} >
      {btn} <Ic p={isAr ? P.chevL : P.chevR} s={14} />
    </div>
  </div>
);

export default function Landing({ th, t, tn, setTn, lang, setLang, isAr, onStudent, onAdmin, CtrlBar }) {
  return (
    <div style={{ minHeight: "100vh", background: th.bg, color: th.text, fontFamily: "'Plus Jakarta Sans',sans-serif", position: "relative", overflow: "hidden", direction: "ltr", transition: "background 0.4s,color 0.4s" }}>
      <div style={{ position: "absolute", top: "-18%", left: "-12%", width: 560, height: 560, borderRadius: "50%", background: `radial-gradient(circle,${th.prime}16,transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-18%", right: "-12%", width: 460, height: 460, borderRadius: "50%", background: `radial-gradient(circle,${th.accent}12,transparent 70%)`, filter: "blur(60px)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(${th.gridLine} 1px,transparent 1px),linear-gradient(90deg,${th.gridLine} 1px,transparent 1px)`, backgroundSize: "60px 60px" }} />
      
      <nav style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${th.border}`, background: th.navBg, backdropFilter: "blur(20px)", flexDirection: "row" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <Ic p={P.bookOpen} s={18} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em", color: th.text }}>Biblio<span style={{ color: th.prime }}>Tech</span></span>
        </div>
        
        {CtrlBar && <CtrlBar th={th} t={t} tn={tn} setTn={setTn} lang={lang} setLang={setLang} isAr={isAr} />}
      </nav>

      <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "56px 36px 40px", position: "relative", zIndex: 1 }}>
        <div style={{ position: "absolute", left: 36, top: "4%", pointerEvents: "none", zIndex: 0 }}>
          <FloatBook colors={["#1e3a8a", "#1e40af"]} top={0} left={0} delay={0} />
          <FloatBook colors={["#064e3b", "#065f46"]} top={112} left={38} delay={0.8} flip />
          <FloatBook colors={["#3b0764", "#4c1d95"]} top={228} left={0} delay={0.4} />
        </div>
        <div style={{ position: "absolute", right: 36, top: "4%", pointerEvents: "none", zIndex: 0 }}>
          <FloatBook colors={["#7f1d1d", "#991b1b"]} top={0} left={0} delay={0.6} flip />
          <FloatBook colors={["#0c4a6e", "#075985"]} top={122} left={-20} delay={0.2} />
          <FloatBook colors={["#78350f", "#92400e"]} top={242} left={5} delay={1} flip />
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, background: `${th.prime}14`, border: `1px solid ${th.prime}44`, borderRadius: 28, padding: "6px 16px", marginBottom: 26, animation: "fadeUp 0.5s ease both", flexDirection: "row" }}>
            <Ic p={P.spark} s={13} color={th.prime} />
            <span style={{ fontSize: 12, color: th.prime, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" }}>{t.badge}</span>
          </div>
          <h1 style={{ fontSize: "clamp(36px,5.5vw,56px)", fontWeight: 800, textAlign: "center", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.04em", lineHeight: 1.08, marginBottom: 16, animation: "fadeUp 0.55s 100ms ease both", maxWidth: 660, color: th.text }}>
            {t.h1}<br /><span style={{ backgroundImage: `linear-gradient(135deg,${th.prime},#14b8a6,${th.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "inline-block" }}>{t.h2}</span>
          </h1>
          <p style={{ fontSize: 15, color: th.sub, textAlign: "center", lineHeight: 1.75, maxWidth: 460, marginBottom: 40, fontFamily: "'Plus Jakarta Sans',sans-serif", animation: "fadeUp 0.55s 180ms ease both" }}>{t.sub}</p>
          
          <div style={{ display: "flex", gap: 16, marginBottom: 40, animation: "fadeUp 0.55s 240ms ease both", flexDirection: "row" }}>
            {[["4,821", t.stat1], ["1,247", t.stat2], ["12", t.stat3]].map(([v, l]) => (
              <div key={l} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "12px 22px", textAlign: "center" }}>
                <p style={{ fontSize: 22, fontWeight: 700, color: th.prime, fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.02em" }}>{v}</p>
                <p style={{ fontSize: 11, color: th.muted, marginTop: 3 }}>{l}</p>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, width: "100%", maxWidth: 640, animation: "fadeUp 0.6s 300ms ease both" }}>
            <PortalCard th={th} title={t.studentTitle} desc={t.studentDesc} btn={t.studentBtn} accent={th.prime} icon={P.student} onClick={onStudent} isAr={isAr} />
            <PortalCard th={th} title={t.adminTitle} desc={t.adminDesc} btn={t.adminBtn} accent={th.accent} icon={P.shield} onClick={onAdmin} isAr={isAr} />
          </div>

          <div style={{ display: "flex", gap: 9, marginTop: 32, flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.6s 400ms ease both", flexDirection: "row" }}>
            {[t.feat1, t.feat2, t.feat3].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: th.sub, fontFamily: "'Plus Jakarta Sans',sans-serif", flexDirection: "row" }}>
                <Ic p={P.check} s={11} color={th.prime} />{f}
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer style={{ position: "relative", zIndex: 1, borderTop: `1px solid ${th.border}`, padding: "16px 36px", display: "flex", justifyContent: "center" }}>
        <p style={{ fontSize: 11, color: th.muted, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.footer}</p>
      </footer>
    </div>
  );
}
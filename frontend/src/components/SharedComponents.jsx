import React, { useState, useEffect, useRef } from "react";
import { Ic, P } from "./Icons";

// ─────────────────────────────────────────────────────────
// 1. Notification Bell Component
// ─────────────────────────────────────────────────────────
export function NotifBell({ th, t, isAr, notifs, onMarkAll, onMarkOne }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  const unread = notifs.filter(n => !n.read).length;
  
  // إغلاق القائمة عند الضغط خارجها
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  
  const nIcon = type => type === "approved" ? P.checkO : type === "rejected" ? P.xO : type === "due_soon" ? P.clock : P.alert;
  const nColor = (type, th) => type === "approved" ? th.green : type === "rejected" ? th.red : type === "due_soon" ? th.amber : th.red;
  
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="btn" style={{ width: 36, height: 36, borderRadius: 10, background: open ? th.prime + "20" : th.surface, border: `1px solid ${open ? th.prime + "44" : th.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: open ? th.prime : th.sub, position: "relative" }}>
        <Ic p={P.bell} s={15} />
        {unread > 0 && <div style={{ position: "absolute", top: 5, right: 5, width: 8, height: 8, borderRadius: "50%", background: th.red, border: `2px solid ${th.navBg || th.surface}`, animation: "blink 2s ease infinite" }} />}
      </button>
      
      {open && (
        <div style={{
          position: "absolute",
          top: 44,
          // 👇 التعديل السحري لضبط الاتجاه ومنع خروج القائمة عن الشاشة 👇
          right: isAr ? "auto" : 0,
          left: isAr ? -280 : "auto",
          width: 320,
          background: th.surface,
          border: `1px solid ${th.border}`,
          borderRadius: 16,
          boxShadow: `0 20px 50px rgba(0,0,0,0.5)`,
          zIndex: 9999,
          animation: "scaleIn 0.2s ease",
          transformOrigin: isAr ? "top left" : "top right",
          overflow: "hidden"
        }}>
          <div style={{ padding: "13px 16px 10px", borderBottom: `1px solid ${th.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, flexDirection: "row" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>{t.notifications || "Notifications"}</span>
              {unread > 0 && <span style={{ fontSize: 10, fontWeight: 700, background: th.red, color: "#fff", borderRadius: 20, padding: "1px 7px" }}>{unread}</span>}
            </div>
            {unread > 0 && <button onClick={onMarkAll} className="btn" style={{ fontSize: 10, color: th.prime, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" }}>{t.markAllRead || "Mark all read"}</button>}
          </div>
          
          <div style={{ maxHeight: 300, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center" }}>
                <div style={{ color: th.muted, display: "flex", justifyContent: "center", marginBottom: 8 }}><Ic p={P.bell} s={28} /></div>
                <p style={{ fontSize: 12, color: th.muted, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.noNotifs || "No notifications"}</p>
              </div>
            ) : (
              notifs.slice(0, 15).map(n => (
                <div key={n.id} onClick={() => onMarkOne(n.id)} className="rh" style={{ padding: "11px 16px", borderBottom: `1px solid ${th.border}`, display: "flex", gap: 10, cursor: "pointer", background: n.read ? "transparent" : th.prime + "09", flexDirection: "row" }}>
                  <div style={{ width: 29, height: 29, borderRadius: 8, background: nColor(n.type, th) + "18", display: "flex", alignItems: "center", justifyContent: "center", color: nColor(n.type, th), flexShrink: 0, marginTop: 1 }}><Ic p={nIcon(n.type)} s={13} /></div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: isAr ? "right" : "left" }}>
                    <p style={{ fontSize: 11, fontWeight: n.read ? 500 : 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2 }}>{n.title}</p>
                    <p style={{ fontSize: 11, color: th.sub, lineHeight: 1.5, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{n.msg}</p>
                    <p style={{ fontSize: 10, color: th.muted, marginTop: 3 }}>{n.date}</p>
                  </div>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: "50%", background: th.prime, flexShrink: 0, marginTop: 5 }} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// 2. Control Bar (Theme & Language Toggle)
// ─────────────────────────────────────────────────────────
export function CtrlBar({ th, t, tn, setTn, lang, setLang, isAr, onBack }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, flexDirection: "row" }}>
      {onBack && (
        <button onClick={onBack} className="btn" style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${th.border}`, borderRadius: 9, padding: "6px 12px", color: th.sub, fontSize: 11, fontFamily: "'Space Grotesk',sans-serif", background: th.surface, flexDirection: "row" }}>
          <Ic p={P.back} s={13} />{t.back || "Back"}
        </button>
      )}
      
      <div style={{ display: "flex", background: th.surface, border: `1px solid ${th.border}`, borderRadius: 9, overflow: "hidden" }}>
        {[["dark", P.moon], ["medium", null], ["light", P.sun]].map(([name, icon]) => (
          <button key={name} onClick={() => setTn(name)} className="btn" style={{ padding: "6px 9px", fontSize: 10, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif", color: tn === name ? th.prime : th.muted, background: tn === name ? th.prime + "18" : "transparent", display: "flex", alignItems: "center", gap: 3 }}>
            {icon && <Ic p={icon} s={10} />}
            {t[name] || name}
          </button>
        ))}
      </div>
      
      <button onClick={() => setLang(l => l === "en" ? "ar" : "en")} className="btn" style={{ display: "flex", alignItems: "center", gap: 6, background: th.surface, border: `1px solid ${th.border}`, borderRadius: 9, padding: "5px 11px", color: th.sub, fontSize: 11, fontWeight: 600, fontFamily: "'Space Grotesk',sans-serif" }}>
        <Ic p={P.globe} s={12} />
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ opacity: isAr ? 0.45 : 1, fontWeight: isAr ? 400 : 700, color: isAr ? th.muted : th.prime, fontSize: 10, letterSpacing: "0.02em" }}>EN</span>
          <span style={{ width: 1, height: 10, background: th.border, display: "inline-block" }} />
          <span style={{ opacity: isAr ? 1 : 0.45, fontWeight: isAr ? 700 : 400, color: isAr ? th.prime : th.muted, fontSize: 10 }}>ع</span>
        </span>
      </button>
    </div>
  );
}
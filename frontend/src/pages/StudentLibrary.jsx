import React, { useState } from "react";
import { Ic, P } from "../components/Icons";
import BookCard, { Cover } from "../components/BookCard";

export default function StudentLibrary({
  th, t, isAr, nav, activeLoans, history, wishlist, pendingReqs,
  BOOKS, daysLeft, daysColor, sc, toggleWishlist, studentReqStatus
}) {
  const [libTab, setLibTab] = useState("active");

  return (
    <div style={{ padding: "28px 26px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 4, height: 24, borderRadius: 4, background: `linear-gradient(180deg,${th.accent},${th.accent}88)` }} />
        <h2 style={{ fontSize: 20, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", textAlign: isAr ? "right" : "left", direction: isAr ? "rtl" : "ltr" }}>{t.library}</h2>
      </div>
      
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
        {[[String(activeLoans.length), t.activeLoans, th.prime, P.bookOpen], [String(history.filter(r => r.returnDate).length), t.totalBorrowed || "Total Read", th.cyan, P.book], [String(wishlist.length), t.wishlistCount, th.red, P.heart]].map(([v, l, c, icon]) => (
          <div key={l} style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center", color: c, flexShrink: 0 }}><Ic p={icon} s={20} /></div>
            <div style={{ textAlign: isAr ? "right" : "left", direction: isAr ? "rtl" : "ltr" }}><p style={{ fontSize: 24, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</p><p style={{ fontSize: 13, color: th.sub }}>{l}</p></div>
          </div>
        ))}
      </div>
      
      {/* Tabs */}
      <div style={{ display: "flex", background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: 6, gap: 6, marginBottom: 20 }}>
        {[[t.activeTab, "active", activeLoans.length], [t.historyTab, "history", history.length], [t.wishlistTab, "wishlist", wishlist.length]].map(([lbl, id, cnt]) => (
          <button key={id} onClick={() => setLibTab(id)} className="btn" style={{ flex: 1, padding: "10px", borderRadius: 10, fontSize: 14, fontWeight: libTab === id ? 700 : 500, color: libTab === id ? th.prime : th.sub, background: libTab === id ? th.prime + "20" : "transparent", border: `1px solid ${libTab === id ? th.prime + "44" : "transparent"}`, fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {lbl}{cnt > 0 && <span style={{ fontSize: 11, fontWeight: 700, background: libTab === id ? th.prime : th.muted + "33", color: libTab === id ? "#fff" : th.sub, borderRadius: 20, padding: "2px 8px" }}>{cnt}</span>}
          </button>
        ))}
      </div>

      {/* ACTIVE TAB */}
      {libTab === "active" && <div style={{ textAlign: isAr ? "right" : "left", direction: isAr ? "rtl" : "ltr" }}>
        {pendingReqs.length > 0 && <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 12, color: th.muted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>
            {t.pending} <span dir="ltr">({pendingReqs.length})</span>
          </p>
          {pendingReqs.map((r, i) => (
            <div key={r.id} style={{ background: th.card, border: `1px solid ${th.amber}33`, borderRadius: 14, padding: "16px 20px", marginBottom: 10, display: "flex", alignItems: "center", gap: 16, animation: `fadeUp 0.35s ${i * 50}ms ease both` }}>
              <div style={{ width: 44, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0 }}><Cover colors={r.bCover} h={60} imageUrl={r.image_url} title={r.bTitle} /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>{r.bTitle}</p>
                <p style={{ fontSize: 13, color: th.sub }}>{r.bAuthor}</p>
                <p style={{ fontSize: 12, color: th.muted, marginTop: 4, display: "flex", gap: 4, alignItems: "center" }}>
                  <span>{t.reqDate}:</span> <span dir="ltr">{r.reqDate}</span>
                </p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: th.amber + "18", color: th.amber, border: `1px solid ${th.amber}44`, fontFamily: "'Space Grotesk',sans-serif" }}>{t.pending}</span>
            </div>
          ))}
        </div>}
        {activeLoans.length === 0 && pendingReqs.length === 0
          ? <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 16, padding: "40px", textAlign: "center" }}><div style={{ color: th.muted, display: "flex", justifyContent: "center", marginBottom: 14 }}><Ic p={P.bookOpen} s={48} /></div><p style={{ fontSize: 16, fontWeight: 700, color: th.text, marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{t.noActiveLoans}</p><button onClick={() => nav("explore")} className="btn" style={{ background: `linear-gradient(135deg,${th.prime},${th.primeD})`, borderRadius: 12, padding: "12px 24px", color: "#fff", fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>{t.explore}</button></div>
          : <div>
            {activeLoans.length > 0 && <p style={{ fontSize: 12, color: th.muted, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif" }}>
              {t.approved} <span dir="ltr">({activeLoans.length})</span>
            </p>}
            {activeLoans.map((r, i) => {
              const days = daysLeft(r.dueDateISO); const dc2 = daysColor(days, th);
              return (<div key={r.id} style={{ background: th.card, border: `1px solid ${days !== null && days <= 3 ? th.red + "44" : th.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16, animation: `fadeUp 0.35s ${i * 50}ms ease both` }}>
                <div style={{ width: 50, height: 70, borderRadius: 10, overflow: "hidden", flexShrink: 0, boxShadow: `0 6px 16px ${r.bCover[1]}44` }}><Cover colors={r.bCover} h={70} imageUrl={r.image_url} title={r.bTitle} /></div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 3 }}>{r.bTitle}</p>
                  <p style={{ fontSize: 13, color: th.sub }}>{r.bAuthor}</p>
                  <p style={{ fontSize: 12, color: th.muted, marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                    <Ic p={P.calendar} s={12} /> <span>{t.returnBy}:</span> <span dir="ltr">{r.dueDate}</span>
                  </p>
                </div>
                <div style={{ textAlign: "center", background: dc2 + "14", border: `1px solid ${dc2}33`, borderRadius: 12, padding: "10px 16px", minWidth: 75, flexShrink: 0 }}>
                  <p style={{ fontSize: 24, fontWeight: 700, color: dc2, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{Math.abs(days !== null ? days : 0)}</p>
                  <p style={{ fontSize: 11, color: dc2, marginTop: 4, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700 }}>{days !== null && days < 0 ? t.overdueLbl : days === 0 ? t.dueToday : "days"}</p>
                </div>
              </div>);
            })}
          </div>
        }
      </div>}

      {/* HISTORY TAB */}
      {libTab === "history" && <div style={{ textAlign: isAr ? "right" : "left", direction: isAr ? "rtl" : "ltr" }}>
        {history.length === 0
          ? <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 16, padding: "40px", textAlign: "center" }}><div style={{ color: th.muted, display: "flex", justifyContent: "center", marginBottom: 14 }}><Ic p={P.book} s={48} /></div><p style={{ fontSize: 16, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>{t.noHistory}</p></div>
          : history.map((r, i) => {
            const c = r.status === "rejected" ? th.red : th.cyan; const lbl = r.status === "rejected" ? t.rejected : t.returned;
            return (<div key={r.id} style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 12, display: "flex", alignItems: "center", gap: 16, animation: `fadeUp 0.35s ${i * 40}ms ease both` }}>
              <div style={{ width: 44, height: 60, borderRadius: 8, overflow: "hidden", flexShrink: 0, opacity: 0.7 }}><Cover colors={r.bCover} h={60} imageUrl={r.image_url} title={r.bTitle} /></div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>{r.bTitle}</p>
                <p style={{ fontSize: 13, color: th.sub }}>{r.bAuthor}</p>
                <p style={{ fontSize: 12, color: th.muted, marginTop: 4, display: "flex", gap: 4 }}>
                  {r.returnDate ? <><span>{t.returned}:</span> <span dir="ltr">{r.returnDate}</span></> : <span dir="ltr">{r.reqDate}</span>}
                </p>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: `${c}18`, color: c, border: `1px solid ${c}44`, fontFamily: "'Space Grotesk',sans-serif" }}>{lbl}</span>
            </div>);
          })
        }
      </div>}

      {/* WISHLIST TAB */}
      {libTab === "wishlist" && <div style={{ textAlign: isAr ? "right" : "left", direction: isAr ? "rtl" : "ltr" }}>
        {wishlist.length === 0
          ? <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 16, padding: "40px", textAlign: "center" }}><div style={{ color: th.muted, display: "flex", justifyContent: "center", marginBottom: 14 }}><Ic p={P.heart} s={48} /></div><p style={{ fontSize: 16, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>{t.noWishlistItems}</p></div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
            {BOOKS.filter(b => wishlist.includes(b.id)).map(bk => (
              <BookCard key={bk.id} bk={bk} th={th} sc={sc} onClick={() => { nav("detail", bk); }} wishlist={wishlist} onToggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} isAr={isAr} />
            ))}
          </div>
        }
      </div>}
    </div>
  );
}
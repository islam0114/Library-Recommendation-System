import React, { useState, useRef, useEffect } from "react";
import { Ic, P } from "./Icons";
import { Cover, deptColor } from "./BookCard";

export default function ChatbotModal({ th, t, isAr, BOOKS, nav, AI_API_URL }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [msgs, setMsgs] = useState([{ role: "ai", text: isAr ? "مرحباً! اسألني عن أي كتاب أو موضوع وسأساعدك في إيجاد أفضل المراجع من مكتبتنا." : "Hi! Ask me about any book or topic and I'll help you find the best references in our library." }]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => { if (chatRef.current) chatRef.current.scrollIntoView({ behavior: "smooth" }); }, [msgs, chatOpen]);

  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim(); setChatInput("");
    setMsgs(m => [...m, { role: "user", text: q }, { role: "ai", text: "...", loading: true }]);
    setChatLoading(true);
    try {
      const res = await fetch(`${AI_API_URL}/api/chat`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: q }) });
      const data = await res.json();
      setMsgs(m => m.map((msg, i) => i === m.length - 1 ? { role: "ai", text: data.bot_reply || "عذراً، حدث خطأ.", books: data.recommended_books || [] } : msg));
    } catch (e) {
      setMsgs(m => m.map((msg, i) => i === m.length - 1 ? { role: "ai", text: "تعذّر الاتصال بالخادم." } : msg));
    } finally { setChatLoading(false); }
  };

  return (
    <>
      {/* FAB STACK */}
      <div style={{ position: "fixed", bottom: 18, right: 18, zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, direction: "ltr" }}>
        <button onClick={() => setChatOpen(o => !o)} className="btn" style={{ width: 52, height: 52, borderRadius: "50%", background: chatOpen ? th.dim : `linear-gradient(135deg,${th.prime},${th.primeD})`, color: "#fff", boxShadow: chatOpen ? "none" : `0 5px 20px ${th.prime}44`, animation: chatOpen ? "none" : "glow 3s ease infinite", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Ic p={chatOpen ? P.xO : P.bot} s={20} />
        </button>
      </div>

      {/* CHATBOT MODAL */}
      {chatOpen && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(18px)", WebkitBackdropFilter: "blur(18px)", zIndex: 9998, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.25s ease" }} onClick={() => setChatOpen(false)}>
        <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 760, height: "min(82vh,720px)", background: th.surface, border: `1px solid ${th.prime}30`, borderRadius: 24, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: `0 30px 80px rgba(0,0,0,0.6),0 0 0 1px ${th.prime}18`, animation: "scaleIn 0.28s cubic-bezier(0.34,1.2,0.64,1)", direction: "ltr" }}>
          
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg,${th.prime},${th.primeD})`, padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: "row" }}>
              <div style={{ width: 42, height: 42, borderRadius: 14, background: "rgba(0,0,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}><Ic p={P.bot} s={20} /></div>
              <div style={{ textAlign: isAr ? "right" : "left" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-0.01em" }}>{t.libAI}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 5, flexDirection: "row" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", boxShadow: "0 0 8px #4ade8088" }} />
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{t.libOnline}</p>
                </div>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="btn" style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,0,0,0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.9)" }}><Ic p={P.xO} s={16} /></button>
          </div>
          
          <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${th.prime}44,transparent)`, flexShrink: 0 }} />
          
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            {msgs.map((m, i) => (
              <div key={i}>
                <div style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8, flexDirection: "row" }}>
                  {m.role === "ai" && <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${th.prime},${th.primeD})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: `0 3px 10px ${th.prime}44` }}><Ic p={P.bot} s={13} /></div>}
                  <div style={{ maxWidth: "70%", padding: "11px 15px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: m.role === "user" ? `linear-gradient(135deg,${th.prime},${th.primeD})` : th.card, border: m.role === "ai" ? `1px solid ${th.border}` : "none", fontSize: 13, color: m.loading ? th.muted : m.role === "user" ? "#fff" : th.text, lineHeight: 1.7, fontStyle: m.loading ? "italic" : "normal", whiteSpace: "pre-wrap", fontFamily: "'Plus Jakarta Sans',sans-serif", boxShadow: m.role === "user" ? `0 4px 14px ${th.prime}33` : "0 2px 8px rgba(0,0,0,0.1)" }}>
                    {m.loading ? "⏳ " + t.thinking : m.text}
                  </div>
                  {m.role === "user" && <div style={{ width: 30, height: 30, borderRadius: "50%", background: th.accent + "33", border: `1px solid ${th.accent}44`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: th.accent }}><Ic p={P.user} s={13} /></div>}
                </div>
                {m.books && m.books.length > 0 && <div style={{ marginTop: 10, [isAr ? "marginRight" : "marginLeft"]: 38, display: "flex", flexDirection: "column", gap: 6 }}>
                  {m.books.map((bk, bi) => {
                    const fullBook = BOOKS.find(b => b.title === bk.title || b.id === bk.id);
                    const dc = fullBook ? deptColor(fullBook.dept) : th.prime;
                    return (<div key={bi}
                      onClick={() => { if (fullBook) { setChatOpen(false); nav("detail", fullBook); } }}
                      className="btn"
                      style={{ background: th.card, border: `1px solid ${fullBook ? dc + "44" : th.border}`, borderRadius: 13, padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, direction: "ltr", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", cursor: fullBook ? "pointer" : "default", transition: "all 0.2s ease", width: "100%", textAlign: "left", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: fullBook ? `linear-gradient(180deg,${dc},${dc}88)` : "transparent", borderRadius: "13px 0 0 13px" }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingLeft: 6, flex: 1, minWidth: 0 }}>
                        {fullBook && <div style={{ width: 36, height: 50, borderRadius: 7, overflow: "hidden", flexShrink: 0 }}><Cover colors={fullBook.cover} h={50} imageUrl={fullBook.image_proxy_url || fullBook.image_url} /></div>}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{bk.title}</p>
                          {bk.author && <p style={{ fontSize: 10, color: th.sub, marginBottom: 3 }}>{bk.author}</p>}
                          {fullBook && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: dc + "18", color: dc, border: `1px solid ${dc}33`, fontFamily: "'Space Grotesk',sans-serif" }}>{fullBook.dept}</span>}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: th.prime, fontFamily: "'Space Grotesk',sans-serif", background: th.primeG, borderRadius: 8, padding: "3px 9px" }}>{bk.match_score}%</span>
                        {fullBook && <span style={{ fontSize: 9, color: th.sub, display: "flex", alignItems: "center", gap: 3, fontFamily: "'Space Grotesk',sans-serif" }}><Ic p={P.arrowR} s={9} />{isAr ? "فتح" : "Open"}</span>}
                      </div>
                    </div>);
                  })}
                </div>}
              </div>
            ))}
            <div ref={chatRef} />
          </div>
          
          {/* Input area */}
          <div style={{ padding: "14px 18px", borderTop: `1px solid ${th.border}`, background: th.surface, display: "flex", gap: 10, alignItems: "center", flexDirection: "row", flexShrink: 0 }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()} placeholder={t.chatPlaceholder} style={{ flex: 1, background: th.card, border: `1px solid ${th.border}`, borderRadius: 14, padding: "12px 16px", color: th.text, fontSize: 13, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", transition: "border-color 0.2s" }} onFocus={e => { e.target.style.borderColor = th.prime + "66" }} onBlur={e => { e.target.style.borderColor = th.border }} />
            <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="btn" style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${th.prime}44`, opacity: chatLoading || !chatInput.trim() ? 0.55 : 1, flexShrink: 0 }}><Ic p={P.send} s={16} /></button>
          </div>
        </div>
      </div>}
    </>
  );
}
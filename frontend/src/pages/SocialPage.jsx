/**
 * SocialPage.jsx — BiblioTech Social Layer
 * ══════════════════════════════════════════════════════════
 * Friends · Direct Messages · Communities
 * ══════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { THEMES } from "../styles/theme";
import { Ic, P } from "../components/Icons";

const API = "http://localhost:8000";

// ══════════════════════════════════════════════════════════
//  HELPERS & CONSTANTS
// ══════════════════════════════════════════════════════════
const Spin = ({ s = 16, color = "currentColor" }) => (
  <span style={{
    width: s, height: s, borderRadius: "50%",
    border: `2px solid ${color}33`, borderTopColor: color,
    animation: "spin 0.7s linear infinite",
    display: "inline-block", flexShrink: 0,
  }} />
);

const Avatar = ({ name = "", size = 38, color = "#0d9488", th, onClick }) => {
  const initials = name.split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
  return (
    <div onClick={onClick} style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: color + "28", border: `2px solid ${color}44`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.35, fontWeight: 700, color,
      fontFamily: "'Space Grotesk',sans-serif",
      cursor: onClick ? "pointer" : "default"
    }}>
      {initials || "?"}
    </div>
  );
};

const nameColor = name => {
  const colors = ["#0d9488","#6366f1","#f59e0b","#ef4444","#22c55e","#06b6d4","#ec4899","#8b5cf6","#f97316","#3b82f6"];
  let hash = 0;
  for (let c of (name || "")) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

const fmtTime = ts => {
  if (!ts || ts === "just now") return "just now";
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)  return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

// خريطة أيقونات ذكية لتصنيفات الـ Communities
const COMM_ICONS = {
  "Books & Reading": P.bookOpen,
  "Science": P.explore,
  "Technology": P.check, // Using check/explore as fallbacks if specific icons aren't available
  "Medicine": P.heart,
  "History": P.globe,
  "Law": P.shield,
  "Arts": P.star,
  "Philosophy": P.book,
  "General": P.hash,
  "Other": P.hash
};

const getCommIcon = (cat) => COMM_ICONS[cat] || P.hash;

// ══════════════════════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════════════════════
function Toast({ msg, type, th, onClose }) {
  const c = type === "success" ? th.green : type === "error" ? th.red : th.amber;
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: 80, right: 20, zIndex: 99999,
      background: th.surface, border: `1px solid ${c}44`, borderRadius: 12,
      padding: "12px 18px", display: "flex", alignItems: "center", gap: 10,
      boxShadow: `0 8px 32px rgba(0,0,0,0.5)`, animation: "fadeUp 0.3s ease",
    }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, background: c + "18", display: "flex", alignItems: "center", justifyContent: "center", color: c }}>
        <Ic p={type === "success" ? P.check : P.x} s={13} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>{msg}</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  PROFILE MODAL
// ══════════════════════════════════════════════════════════
function ProfileModal({ th, token, userId, myId, onClose, onStartChat }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actLoading, setActLoading] = useState(false);

  const apiFetch = (url, opts = {}) => fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });

  useEffect(() => {
    apiFetch(`/api/social/users/${userId}/profile`)
      .then(r => r.json()).then(setProfile).finally(() => setLoading(false));
  }, [userId]);

  const sendRequest = async () => {
    setActLoading(true);
    await apiFetch("/api/social/friends/request", { method: "POST", body: JSON.stringify({ receiver_id: userId }) });
    setProfile(p => ({ ...p, friendship_status: "pending", friendship_sender: myId }));
    setActLoading(false);
  };

  const accept = async () => {
    setActLoading(true);
    await apiFetch(`/api/social/friends/${userId}/accept`, { method: "POST" });
    setProfile(p => ({ ...p, friendship_status: "accepted" }));
    setActLoading(false);
  };

  const remove = async () => {
    setActLoading(true);
    await apiFetch(`/api/social/friends/${userId}`, { method: "DELETE" });
    setProfile(p => ({ ...p, friendship_status: null }));
    setActLoading(false);
  };

  const color = profile ? nameColor(profile.name) : th.prime;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 22, width: "100%", maxWidth: 420, animation: "scaleIn 0.22s ease", overflow: "hidden" }} onClick={e => e.stopPropagation()}>
        <div style={{ background: `linear-gradient(135deg,${color}22,${color}08)`, borderBottom: `1px solid ${th.border}`, padding: "24px 24px 20px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: 9, background: th.card, border: `1px solid ${th.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: th.sub }}>
            <Ic p={P.x} s={14} />
          </button>
          {loading ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}><Spin s={28} color={th.prime} /></div>
          ) : profile ? (
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Avatar name={profile.name} size={64} color={color} th={th} />
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>{profile.name}</h2>
                <p style={{ fontSize: 12, color: color, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2 }}>{profile.lib_id}</p>
                <p style={{ fontSize: 12, color: th.sub }}>{profile.faculty}{profile.university ? ` · ${profile.university}` : ""}</p>
              </div>
            </div>
          ) : null}
        </div>

        {profile && (
          <div style={{ padding: "20px 24px 24px" }}>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {[["Friends", profile.friends_count], ["Year", profile.year || "—"]].map(([l, v]) => (
                <div key={l} style={{ flex: 1, background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                  <p style={{ fontSize: 18, fontWeight: 700, color: th.prime, fontFamily: "'Space Grotesk',sans-serif" }}>{v}</p>
                  <p style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>{l}</p>
                </div>
              ))}
              <div style={{ flex: 1, background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 14px", textAlign: "center" }}>
                <p style={{ fontSize: 18, fontWeight: 700, color: th.prime, fontFamily: "'Space Grotesk',sans-serif" }}>{profile.shared_communities?.length || 0}</p>
                <p style={{ fontSize: 11, color: th.muted, marginTop: 2 }}>Shared</p>
              </div>
            </div>

            {profile.shared_communities?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, color: th.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>Shared Communities</p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {profile.shared_communities.map(c => (
                    <span key={c.id} style={{ fontSize: 12, background: c.color + "18", color: c.color, border: `1px solid ${c.color}33`, padding: "4px 12px", borderRadius: 20, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 600 }}>
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              {profile.friendship_status === "accepted" ? (
                <>
                  <button onClick={() => { onStartChat(profile); onClose(); }} style={{ flex: 2, padding: "12px", borderRadius: 12, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                    <Ic p={P.msg} s={16} />Message
                  </button>
                  <button onClick={remove} disabled={actLoading} style={{ flex: 1, padding: "12px", borderRadius: 12, background: th.red + "14", border: `1px solid ${th.red}33`, color: th.red, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
                    {actLoading ? <Spin s={14} color={th.red} /> : "Unfriend"}
                  </button>
                </>
              ) : profile.friendship_status === "pending" && profile.friendship_sender !== myId ? (
                <>
                  <button onClick={accept} disabled={actLoading} style={{ flex: 1, padding: "12px", borderRadius: 12, background: `linear-gradient(135deg,${th.green},${th.green}cc)`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    {actLoading ? <Spin s={14} color="#fff" /> : <><Ic p={P.check} s={15} />Accept</>}
                  </button>
                  <button onClick={remove} style={{ flex: 1, padding: "12px", borderRadius: 12, background: th.card, border: `1px solid ${th.border}`, color: th.text, fontSize: 13, cursor: "pointer", fontWeight: 600 }}>Decline</button>
                </>
              ) : profile.friendship_status === "pending" ? (
                <button disabled style={{ flex: 1, padding: "12px", borderRadius: 12, background: th.card, border: `1px solid ${th.border}`, color: th.sub, fontSize: 13, cursor: "not-allowed", fontFamily: "'Space Grotesk',sans-serif" }}>
                  Request Sent
                </button>
              ) : (
                <button onClick={sendRequest} disabled={actLoading} style={{ flex: 1, padding: "12px", borderRadius: 12, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {actLoading ? <Spin s={14} color="#fff" /> : <><Ic p={P.userPlus} s={16} />Add Friend</>}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  CHAT WINDOW — DM or Community
// ══════════════════════════════════════════════════════════
function ChatWindow({ th, token, myId, myName, target, type, onBack }) {
  const [messages, setMessages]  = useState([]);
  const [input,    setInput]     = useState("");
  const [loading,  setLoading]   = useState(true);
  const [sending,  setSending]   = useState(false);
  const [hasMore,  setHasMore]   = useState(true);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const apiFetch = (url, opts = {}) => fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  });

  const loadMessages = useCallback(async (before = 0) => {
    const url = type === "dm"
      ? `/api/social/dm/${target.id}?limit=40${before ? `&before_id=${before}` : ""}`
      : `/api/social/communities/${target.id}/messages?limit=40${before ? `&before_id=${before}` : ""}`;
    const res  = await apiFetch(url);
    const data = await res.json();
    const msgs = data.messages || [];
    if (before) {
      setMessages(prev => [...msgs, ...prev]);
    } else {
      setMessages(msgs);
    }
    if (msgs.length < 40) setHasMore(false);
    setLoading(false);
  }, [target.id, type]);

  useEffect(() => {
    setMessages([]); setLoading(true); setHasMore(true);
    loadMessages();
    pollRef.current = setInterval(() => loadMessages(), 3000);
    return () => clearInterval(pollRef.current);
  }, [target.id]);

  useEffect(() => {
    if (!loading) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, loading]);

  const send = async () => {
    const content = input.trim();
    if (!content) return;
    setInput("");
    setSending(true);
    const url = type === "dm"
      ? `/api/social/dm/${target.id}`
      : `/api/social/communities/${target.id}/messages`;
    try {
      const res  = await apiFetch(url, { method: "POST", body: JSON.stringify({ content }) });
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: data.id, sender_id: myId, sender_name: myName,
        content, seen: true, created_at: new Date().toISOString(),
      }]);
    } catch { }
    setSending(false);
  };

  const color = type === "community" ? (target.cover_color || th.prime) : nameColor(target.name);
  const commIcon = type === "community" ? getCommIcon(target.category) : P.user;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: th.bg }}>
      {/* Header */}
      <div style={{ background: th.surface, borderBottom: `1px solid ${th.border}`, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14, flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 12, background: th.card, border: `1px solid ${th.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: th.text, transition: "0.2s" }}>
          <Ic p={P.back} s={18} />
        </button>
        <div style={{ width: 48, height: 48, borderRadius: type === "community" ? 14 : "50%", background: color + "22", border: `2px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {type === "community"
            ? <Ic p={commIcon} s={22} color={color} />
            : <span style={{ fontSize: 18, fontWeight: 700, color, fontFamily: "'Space Grotesk',sans-serif" }}>{target.name?.[0]?.toUpperCase()}</span>}
        </div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.2 }}>{target.name}</p>
          <p style={{ fontSize: 13, color: th.sub, marginTop: 4 }}>
            {type === "dm" ? (target.faculty || target.lib_id) : `${target.member_count || ""} members`}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 4 }}>
        {hasMore && !loading && (
          <button onClick={() => loadMessages(messages[0]?.id)} style={{ alignSelf: "center", padding: "8px 20px", borderRadius: 20, background: th.card, border: `1px solid ${th.border}`, color: th.text, fontSize: 12, fontWeight: 700, cursor: "pointer", marginBottom: 16, fontFamily: "'Space Grotesk',sans-serif" }}>
            Load older messages
          </button>
        )}
        {loading && <div style={{ textAlign: "center", padding: "40px 0" }}><Spin s={28} color={th.prime} /></div>}
        {messages.map((msg, i) => {
          const isMe = Number(msg.sender_id) === Number(myId);
          // لا نعرض اسم المرسل إذا كانت الرسالة مني أنا
          const showName = type === "community" && !isMe && (i === 0 || Number(messages[i - 1]?.sender_id) !== Number(msg.sender_id));
          const showTime = i === messages.length - 1 || Number(messages[i + 1]?.sender_id) !== Number(msg.sender_id);
          const msgColor = nameColor(msg.sender_name);

          return (
            <div key={msg.id} style={{
              display: "flex",
              flexDirection: isMe ? "row-reverse" : "row",
              alignItems: "flex-end",
              gap: 10,
              marginBottom: showTime ? 16 : 4,
            }}>
              {type === "community" && !isMe && (
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: msgColor + "28", border: `2px solid ${msgColor}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: msgColor,
                  fontFamily: "'Space Grotesk',sans-serif",
                  visibility: showTime ? "visible" : "hidden",
                }}>
                  {(msg.sender_name || "?")[0].toUpperCase()}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                {showName && (
                  <span style={{
                    fontSize: 12, color: msgColor, fontWeight: 700,
                    marginBottom: 5, fontFamily: "'Space Grotesk',sans-serif",
                    paddingLeft: 4,
                  }}>
                    {msg.sender_name}
                  </span>
                )}

                <div style={{
                  padding: "12px 16px",
                  borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  background: isMe ? `linear-gradient(135deg,${th.prime},${th.primeD})` : th.card,
                  border: isMe ? "none" : `1px solid ${th.border}`,
                  color: isMe ? "#fff" : th.text,
                  fontSize: 14, lineHeight: 1.6, wordBreak: "break-word",
                  boxShadow: isMe ? `0 4px 16px ${th.prime}33` : "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                  {msg.content}
                </div>

                {showTime && (
                  <span style={{ fontSize: 11, color: th.muted, marginTop: 5, paddingLeft: isMe ? 0 : 4, paddingRight: isMe ? 4 : 0 }}>
                    {fmtTime(msg.created_at)}
                    {isMe && type === "dm" && <span style={{ marginLeft: 6, color: msg.seen ? th.prime : th.muted }}>{msg.seen ? "✓✓" : "✓"}</span>}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ borderTop: `1px solid ${th.border}`, padding: "16px 20px", background: th.surface, display: "flex", gap: 12, alignItems: "flex-end", flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          style={{
            flex: 1, background: th.card, border: `1px solid ${th.border}`, borderRadius: 14,
            padding: "14px 18px", color: th.text, fontSize: 14, outline: "none", resize: "none",
            fontFamily: "'Plus Jakarta Sans',sans-serif", lineHeight: 1.5, maxHeight: 120,
          }}
        />
        <button onClick={send} disabled={sending || !input.trim()} style={{
          width: 50, height: 50, borderRadius: 14, flexShrink: 0,
          background: input.trim() ? `linear-gradient(135deg,${th.prime},${th.primeD})` : th.card,
          border: input.trim() ? "none" : `1px solid ${th.border}`,
          cursor: input.trim() ? "pointer" : "not-allowed",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: input.trim() ? "#fff" : th.muted,
          boxShadow: input.trim() ? `0 6px 20px ${th.prime}44` : "none",
          transition: "all 0.2s",
        }}>
          {sending ? <Spin s={18} color="#fff" /> : <Ic p={P.send} s={20} />}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  CREATE COMMUNITY MODAL
// ══════════════════════════════════════════════════════════
const COMMUNITY_COLORS = ["#0d9488","#6366f1","#f59e0b","#ef4444","#22c55e","#06b6d4","#ec4899","#8b5cf6","#f97316","#3b82f6"];
const COMMUNITY_CATS   = ["General","Books & Reading","Science","Technology","Medicine","History","Law","Arts","Philosophy","Other"];

function CreateCommunityModal({ th, token, onClose, onDone }) {
  const [form,    setForm]    = useState({ name: "", description: "", category: "General", cover_color: "#0d9488" });
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  const submit = async () => {
    if (!form.name.trim() || form.name.trim().length < 3) { setErr("Name must be at least 3 characters"); return; }
    setLoading(true); setErr("");
    try {
      const res  = await fetch(`${API}/api/social/communities`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.detail || "Failed"); setLoading(false); return; }
      onDone(data.community);
      onClose();
    } catch { setErr("Cannot connect to server."); }
    setLoading(false);
  };

  const selectedIcon = getCommIcon(form.category);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(10px)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 22, padding: "28px", width: "100%", maxWidth: 460, animation: "scaleIn 0.22s ease" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: form.cover_color + "22", border: `2px solid ${form.cover_color}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Ic p={selectedIcon} s={22} color={form.cover_color} />
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>New Community</h2>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: th.card, border: `1px solid ${th.border}`, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: th.text }}>
            <Ic p={P.x} s={16} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: th.sub, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>Community Name *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. CS Study Group" style={{ width: "100%", background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "14px 16px", color: th.text, fontSize: 14, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: th.sub, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="What is this community about?" rows={3} style={{ width: "100%", background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "14px 16px", color: th.text, fontSize: 14, outline: "none", resize: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: th.sub, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>Category</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ width: "100%", background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "14px 16px", color: th.text, fontSize: 14, outline: "none", cursor: "pointer", appearance: "none", fontFamily: "'Space Grotesk',sans-serif", boxSizing: "border-box" }}>
              {COMMUNITY_CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, color: th.sub, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 12, fontFamily: "'Space Grotesk',sans-serif" }}>Theme Color</label>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {COMMUNITY_COLORS.map(c => (
                <button key={c} onClick={() => setForm(f => ({ ...f, cover_color: c }))} style={{ width: 36, height: 36, borderRadius: "50%", background: c, border: `3px solid ${form.cover_color === c ? "#fff" : "transparent"}`, cursor: "pointer", outline: "none", transition: "transform 0.15s", transform: form.cover_color === c ? "scale(1.15)" : "scale(1)" }} />
              ))}
            </div>
          </div>
        </div>

        {err && <div style={{ background: th.red + "14", border: `1px solid ${th.red}30`, borderRadius: 10, padding: "12px 16px", marginTop: 18, fontSize: 13, color: th.red, fontWeight: 600 }}>{err}</div>}

        <div style={{ display: "flex", gap: 14, marginTop: 28 }}>
          <button onClick={submit} disabled={loading} style={{ flex: 1, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, borderRadius: 12, padding: "16px", color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, opacity: loading ? 0.8 : 1 }}>
            {loading ? <><Spin s={16} />&nbsp;Creating...</> : <><Ic p={P.plus} s={18} />Create Community</>}
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: "16px", borderRadius: 12, background: th.card, border: `1px solid ${th.border}`, color: th.text, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
//  MAIN SOCIAL PAGE
// ══════════════════════════════════════════════════════════
export default function SocialPage({ th, token, myId, myName }) {
  // Tabs: "friends" (unified friends + chats) | "communities" | "people"
  const [tab,          setTab]         = useState("friends");
  const [chatTarget,  setChatTarget]  = useState(null);
  const [chatType,    setChatType]    = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [showCreate,  setShowCreate]  = useState(false);

  // Data
  const [friends,       setFriends]       = useState([]);
  const [requests,      setRequests]      = useState([]);
  const [conversations, setConversations] = useState([]);
  const [communities,   setCommunities]   = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [summary,       setSummary]       = useState(null);

  // UI State
  const [loadingFriends, setLoadingFriends]     = useState(false);
  const [loadingComm,    setLoadingComm]        = useState(false);
  const [searchQ,        setSearchQ]            = useState("");
  const [searchLoading,  setSearchLoading]      = useState(false);
  const [commSearchQ,    setCommSearchQ]        = useState("");
  const [toast,          setToast]              = useState(null);

  const searchTimer = useRef(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  const apiFetch = useCallback((url, opts = {}) => fetch(`${API}${url}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(opts.headers || {}) },
  }), [token]);

  const loadSummary = async () => {
    const res  = await apiFetch("/api/social/summary");
    const data = await res.json();
    setSummary(data);
  };

  const loadFriendsAndConvos = async () => {
    setLoadingFriends(true);
    const [fr, rq, cv] = await Promise.all([
      apiFetch("/api/social/friends").then(r => r.json()),
      apiFetch("/api/social/friends/requests").then(r => r.json()),
      apiFetch("/api/social/dm/conversations").then(r => r.json()),
    ]);
    setFriends(fr.friends || []);
    setRequests(rq.requests || []);
    setConversations(cv.conversations || []);
    setLoadingFriends(false);
  };

  const loadCommunities = async (q = "") => {
    setLoadingComm(true);
    const [all, mine] = await Promise.all([
      apiFetch(`/api/social/communities${q ? `?q=${encodeURIComponent(q)}` : ""}`).then(r => r.json()),
      apiFetch("/api/social/communities/mine").then(r => r.json()),
    ]);
    setCommunities(all.communities || []);
    setMyCommunities(mine.communities || []);
    setLoadingComm(false);
  };

  useEffect(() => {
    loadSummary();
    loadFriendsAndConvos();
    loadCommunities();
  }, []);

  const handleSearch = val => {
    setSearchQ(val);
    clearTimeout(searchTimer.current);
    if (val.trim().length < 2) { setSearchResults([]); return; }
    setSearchLoading(true);
    searchTimer.current = setTimeout(async () => {
      const res  = await apiFetch(`/api/social/users/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      setSearchResults(data.users || []);
      setSearchLoading(false);
    }, 400);
  };

  const handleCommSearch = val => {
    setCommSearchQ(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadCommunities(val), 400);
  };

  const joinCommunity = async (id) => {
    const res  = await apiFetch(`/api/social/communities/${id}/join`, { method: "POST" });
    if (res.ok) { showToast("Joined successfully!"); loadCommunities(); } 
    else { const d = await res.json(); showToast(d.detail || "Failed to join", "error"); }
  };

  const leaveCommunity = async (id) => {
    const res  = await apiFetch(`/api/social/communities/${id}/leave`, { method: "DELETE" });
    if (res.ok) { showToast("Left community"); loadCommunities(); }
    else { const d = await res.json(); showToast(d.detail || "Failed", "error"); }
  };

  const acceptFriend = async (senderId) => {
    await apiFetch(`/api/social/friends/${senderId}/accept`, { method: "POST" });
    showToast("Friend added!");
    loadFriendsAndConvos(); loadSummary();
  };

  const rejectFriend = async (senderId) => {
    await apiFetch(`/api/social/friends/${senderId}/reject`, { method: "POST" });
    loadFriendsAndConvos(); loadSummary();
  };

  if (chatTarget) {
    return (
      <>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}`}</style>
        <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <ChatWindow
            th={th} token={token} myId={myId} myName={myName}
            target={chatTarget} type={chatType}
            onBack={() => { setChatTarget(null); setChatType(null); loadFriendsAndConvos(); }}
          />
        </div>
        {viewProfile && <ProfileModal th={th} token={token} userId={viewProfile} myId={myId} onClose={() => setViewProfile(null)} onStartChat={(u) => { setChatTarget(u); setChatType("dm"); setViewProfile(null); }} />}
      </>
    );
  }

  const unreadDMs = conversations.reduce((s, c) => s + c.unread_count, 0);
  const tabs = [
    { id: "friends",     label: "Chats & Friends", icon: P.msg,    badge: unreadDMs > 0 ? unreadDMs : requests.length },
    { id: "communities", label: "Communities",     icon: P.hash,   badge: 0 },
    { id: "people",      label: "Find People",     icon: P.search, badge: 0 },
  ];

  // دمج الأصدقاء والمحادثات في قائمة واحدة ذكية
  const enrichedFriends = friends.map(f => {
    const c = conversations.find(x => x.other_id === f.id);
    return { ...f, ...c };
  }).sort((a, b) => {
    if (a.last_msg_time && b.last_msg_time) return new Date(b.last_msg_time) - new Date(a.last_msg_time);
    if (a.last_msg_time) return -1;
    if (b.last_msg_time) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}`}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: th.bg }}>

        {summary && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, padding: "24px 28px 0", flexShrink: 0 }}>
            {[
              { label: "Friends",    val: summary.friends_count,     color: th.prime },
              { label: "Requests",   val: summary.pending_requests,  color: th.amber },
              { label: "Unread DMs", val: summary.unread_dms,        color: th.red   },
              { label: "Groups",     val: summary.communities_count, color: th.accent},
            ].map(({ label, val, color }) => (
              <div key={label} style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: "16px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <p style={{ fontSize: 24, fontWeight: 800, color, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: 12, color: th.sub, marginTop: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, padding: "24px 28px 0", flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "14px 10px", borderRadius: 14, border: "none",
              background: tab === t.id ? th.prime + "18" : "transparent",
              color: tab === t.id ? th.prime : th.muted,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Space Grotesk',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              position: "relative", transition: "all 0.2s",
            }}>
              <Ic p={t.icon} s={20} />
              {t.label}
              {t.badge > 0 && (
                <span style={{ background: t.id === "friends" && unreadDMs > 0 ? th.red : th.amber, color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, marginLeft: 6 }}>
                  {t.badge > 9 ? "9+" : t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px 28px" }}>

          {/* ════ FRIENDS & CHATS TAB ════ */}
          {tab === "friends" && (
            <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 800, margin: "0 auto" }}>
              {requests.length > 0 && (
                <div style={{ marginBottom: 36 }}>
                  <p style={{ fontSize: 13, color: th.amber, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    <Ic p={P.alert} s={16} /> Friend Requests ({requests.length})
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 14 }}>
                    {requests.map(u => (
                      <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px", background: th.surface, border: `1px solid ${th.amber}44`, borderRadius: 18, animation: "fadeUp 0.3s ease" }}>
                        <Avatar name={u.name} size={50} color={nameColor(u.name)} th={th} onClick={() => setViewProfile(u.id)} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 16, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>{u.name}</p>
                          <p style={{ fontSize: 12, color: th.sub, marginTop: 4 }}>{u.faculty || u.lib_id}</p>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => acceptFriend(u.id)} style={{ width: 40, height: 40, borderRadius: 12, background: th.green + "18", border: `1px solid ${th.green}44`, color: th.green, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Accept"><Ic p={P.check} s={20} /></button>
                          <button onClick={() => rejectFriend(u.id)} style={{ width: 40, height: 40, borderRadius: 12, background: th.card, border: `1px solid ${th.border}`, color: th.sub, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }} title="Decline"><Ic p={P.x} s={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: th.prime, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                    <Ic p={P.msg} s={16} /> My Friends & Chats ({friends.length})
                  </p>
                </div>
                {loadingFriends ? <div style={{ textAlign: "center", padding: "40px 0" }}><Spin s={32} color={th.prime} /></div> : enrichedFriends.length === 0 ? (
                  <div style={{ padding: "50px 20px", textAlign: "center", background: th.surface, borderRadius: 20, border: `1px dashed ${th.border}` }}>
                    <Ic p={P.users} s={42} color={th.muted} />
                    <p style={{ fontSize: 16, color: th.text, marginTop: 16, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>No friends yet</p>
                    <p style={{ fontSize: 14, color: th.muted, marginTop: 6 }}>Search in the "Find People" tab to connect.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {enrichedFriends.map(f => {
                      const isUnread = f.unread_count > 0;
                      const color = nameColor(f.name);
                      return (
                        <div key={f.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: isUnread ? th.prime + "11" : th.surface, border: `1px solid ${isUnread ? th.prime + "44" : th.border}`, borderRadius: 18, transition: "all 0.2s" }}>
                          <div style={{ position: "relative" }}>
                            <Avatar name={f.name} size={54} color={color} th={th} onClick={() => setViewProfile(f.id)} />
                            {isUnread && (
                              <div style={{ position: "absolute", bottom: -2, right: -2, width: 20, height: 20, borderRadius: "50%", background: th.red, border: `2px solid ${th.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 10, color: "#fff", fontWeight: 800 }}>{f.unread_count > 9 ? "9+" : f.unread_count}</span>
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => { setChatTarget({ id: f.id, name: f.name, lib_id: f.lib_id, faculty: f.faculty }); setChatType("dm"); }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                              <p style={{ fontSize: 16, fontWeight: isUnread ? 800 : 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{f.name}</p>
                              {f.last_msg_time && <span style={{ fontSize: 11, color: isUnread ? th.prime : th.muted, fontWeight: isUnread ? 700 : 500 }}>{fmtTime(f.last_msg_time)}</span>}
                            </div>
                            <p style={{ fontSize: 14, color: isUnread ? th.text : th.sub, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", fontWeight: isUnread ? 600 : 400 }}>
                              {f.last_message ? (f.last_sender_me ? <span style={{ color: th.muted, marginRight: 6 }}>You:</span> : null) : null}
                              {f.last_message || (f.faculty || f.lib_id)}
                            </p>
                          </div>
                          <button onClick={() => { setChatTarget({ id: f.id, name: f.name, lib_id: f.lib_id, faculty: f.faculty }); setChatType("dm"); }} style={{
                            padding: "10px 18px", borderRadius: 12, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 4px 16px ${th.prime}44`
                          }}><Ic p={P.msg} s={15} /> Chat</button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════ COMMUNITIES TAB ════ */}
          {tab === "communities" && (
            <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 1000, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: th.muted }}><Ic p={P.search} s={18} /></div>
                  <input value={commSearchQ} onChange={e => handleCommSearch(e.target.value)} placeholder="Find communities..." style={{ width: "100%", background: th.surface, border: `1px solid ${th.border}`, borderRadius: 14, padding: "16px 16px 16px 46px", color: th.text, fontSize: 15, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
                </div>
                <button onClick={() => setShowCreate(true)} style={{ padding: "0 28px", borderRadius: 14, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 8, boxShadow: `0 4px 16px ${th.prime}44` }}>
                  <Ic p={P.plus} s={18} />Create
                </button>
              </div>

              {myCommunities.length > 0 && (
                <div style={{ marginBottom: 36 }}>
                  <p style={{ fontSize: 13, color: th.prime, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif" }}>My Communities</p>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                    {myCommunities.map(c => (
                      <CommunityCard key={c.id} c={c} th={th} isMember
                        onOpen={() => { setChatTarget(c); setChatType("community"); }}
                        onLeave={() => leaveCommunity(c.id)} />
                    ))}
                  </div>
                </div>
              )}

              <p style={{ fontSize: 13, color: th.sub, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14, fontFamily: "'Space Grotesk',sans-serif" }}>
                {commSearchQ ? "Search Results" : "Discover New Groups"}
              </p>
              {loadingComm && <div style={{ textAlign: "center", padding: "40px 0" }}><Spin s={32} color={th.prime} /></div>}
              {!loadingComm && communities.filter(c => !myCommunities.find(m => m.id === c.id)).length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px 20px", background: th.surface, borderRadius: 18, border: `1px dashed ${th.border}` }}>
                  <Ic p={P.hash} s={46} color={th.muted} />
                  <p style={{ fontSize: 16, color: th.text, marginTop: 16, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>No more communities to explore</p>
                  <p style={{ fontSize: 14, color: th.sub, marginTop: 6 }}>Why not create your own?</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                  {communities.filter(c => !myCommunities.find(m => m.id === c.id)).map(c => (
                    <CommunityCard key={c.id} c={c} th={th} isMember={c.is_member}
                      onOpen={() => { setChatTarget(c); setChatType("community"); }}
                      onJoin={() => joinCommunity(c.id)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ════ FIND PEOPLE TAB ════ */}
          {tab === "people" && (
            <div style={{ animation: "fadeIn 0.3s ease", maxWidth: 700, margin: "0 auto" }}>
              <div style={{ position: "relative", marginBottom: 28 }}>
                <div style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: th.muted }}><Ic p={P.search} s={20} /></div>
                <input value={searchQ} onChange={e => handleSearch(e.target.value)} placeholder="Search by name, library ID or faculty…" autoFocus style={{ width: "100%", background: th.surface, border: `2px solid ${th.border}`, borderRadius: 16, padding: "18px 18px 18px 50px", color: th.text, fontSize: 16, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", boxSizing: "border-box", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = th.prime + "88"} onBlur={e => e.target.style.borderColor = th.border} />
                {searchLoading && <div style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)" }}><Spin s={20} color={th.prime} /></div>}
              </div>

              {searchQ.length > 0 && searchQ.length < 2 && (
                <p style={{ fontSize: 15, color: th.muted, textAlign: "center", padding: "30px 0" }}>Type at least 2 characters to search</p>
              )}

              {searchQ.length >= 2 && !searchLoading && searchResults.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", background: th.surface, borderRadius: 18, border: `1px dashed ${th.border}` }}>
                  <Ic p={P.user} s={54} color={th.muted} />
                  <p style={{ fontSize: 18, color: th.text, marginTop: 16, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif" }}>No users found for "{searchQ}"</p>
                </div>
              )}

              {!searchQ && (
                <div style={{ textAlign: "center", padding: "80px 20px" }}>
                  <div style={{ width: 90, height: 90, borderRadius: "50%", background: th.surface, border: `1px dashed ${th.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", color: th.muted }}>
                    <Ic p={P.search} s={42} />
                  </div>
                  <p style={{ fontSize: 20, color: th.text, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>Find your peers</p>
                  <p style={{ fontSize: 15, color: th.sub }}>Connect with students across Benha University.</p>
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {searchResults.map(u => {
                  const color    = nameColor(u.name);
                  const fs       = u.friendship_status;
                  const isFriend = fs === "accepted";
                  return (
                    <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 22px", background: th.surface, border: `1px solid ${th.border}`, borderRadius: 18, animation: "fadeUp 0.25s ease" }}>
                      <Avatar name={u.name} size={58} color={color} th={th} onClick={() => setViewProfile(u.id)} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p onClick={() => setViewProfile(u.id)} style={{ fontSize: 17, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 5, cursor: "pointer" }}>{u.name}</p>
                        <p style={{ fontSize: 13, color: th.sub }}>{u.faculty}{u.university ? ` · ${u.university}` : ""}</p>
                      </div>
                      <div style={{ flexShrink: 0 }}>
                        {isFriend ? (
                          <button onClick={() => { setChatTarget(u); setChatType("dm"); }} style={{ padding: "12px 20px", borderRadius: 12, background: th.prime + "18", border: `1px solid ${th.prime}33`, color: th.prime, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                            <Ic p={P.msg} s={16} />Message
                          </button>
                        ) : fs === "pending" ? (
                          <span style={{ fontSize: 14, color: th.amber, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", padding: "12px 20px", background: th.amber + "14", borderRadius: 12, border: `1px solid ${th.amber}33` }}>Pending Request</span>
                        ) : (
                          <button onClick={async () => {
                            await apiFetch("/api/social/friends/request", { method: "POST", body: JSON.stringify({ receiver_id: u.id }) });
                            setSearchResults(prev => prev.map(x => x.id === u.id ? { ...x, friendship_status: "pending" } : x));
                            showToast(`Request sent to ${u.name}`);
                            loadSummary();
                          }} style={{ padding: "12px 20px", borderRadius: 12, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 6, boxShadow: `0 4px 16px ${th.prime}44` }}>
                            <Ic p={P.userPlus} s={16} />Add Friend
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {viewProfile && (
        <ProfileModal th={th} token={token} userId={viewProfile} myId={myId}
          onClose={() => setViewProfile(null)}
          onStartChat={(u) => { setChatTarget(u); setChatType("dm"); setViewProfile(null); }} />
      )}
      {showCreate && (
        <CreateCommunityModal th={th} token={token}
          onClose={() => setShowCreate(false)}
          onDone={(community) => { showToast(`"${community.name}" created!`); loadCommunities(); loadSummary(); }} />
      )}
      {toast && <Toast {...toast} th={th} onClose={() => setToast(null)} />}
    </>
  );
}

// ══════════════════════════════════════════════════════════
//  COMMUNITY CARD
// ══════════════════════════════════════════════════════════
function CommunityCard({ c, th, isMember, onOpen, onJoin }) {
  const [hov, setHov] = useState(false);
  const color = c.cover_color || th.prime;
  const icon = getCommIcon(c.category);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", background: hov ? th.card2 : th.surface, border: `1px solid ${hov ? color + "55" : th.border}`, borderRadius: 18, transition: "all 0.2s", cursor: "pointer", animation: "fadeUp 0.3s ease" }}
      onClick={isMember ? onOpen : undefined}>
      <div style={{ width: 54, height: 54, borderRadius: 16, background: color + "22", border: `2px solid ${color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Ic p={icon} s={26} color={color} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 16, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 5 }}>{c.name}</p>
        <p style={{ fontSize: 13, color: th.sub, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
          <span style={{ color: color, fontWeight: 700 }}>{c.category}</span> · {c.member_count} member{c.member_count !== 1 ? "s" : ""}
        </p>
      </div>
      <div onClick={e => e.stopPropagation()}>
        {isMember ? (
          <button onClick={onOpen} style={{ padding: "10px 18px", borderRadius: 12, background: color + "18", border: `1px solid ${color}33`, color, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
            Open
          </button>
        ) : (
          <button onClick={onJoin} style={{ padding: "10px 18px", borderRadius: 12, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, border: "none", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", boxShadow: `0 4px 14px ${th.prime}44` }}>
            Join
          </button>
        )}
      </div>
    </div>
  );
}
/**
 * Page: AdminProfilePage
 * Purpose: Displays and edits the admin's personal profile information.
 * Features: Canvas particle background, super-admin detection, and inline editing modal.
 */

import React, { useState, useEffect, useRef } from "react";
import { Ic, P } from "../components/Icons";

const ProfileFld = ({ label, fkey, type = "text", ph, maxLen, form, setForm, showPw, setShowPw }) => (
  <div>
    <label style={{fontSize:9,fontWeight:700,color:"#8b9ab0",letterSpacing:".07em",textTransform:"uppercase",marginBottom:4,display:"block",fontFamily:"'Space Grotesk',sans-serif"}}>{label}</label>
    <div style={{position:"relative"}}>
      <input
        type={fkey === "new_password" && !showPw ? "password" : type}
        placeholder={ph}
        maxLength={maxLen}
        value={form[fkey]}
        onChange={(e) => setForm({ ...form, [fkey]: e.target.value })}
        style={{width:"100%",background:"rgba(0,0,0,0.2)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:10,padding:"10px 14px",color:"#f0eef9",fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",transition:"border-color .2s"}}
      />
      {fkey === "new_password" && (
        <button onClick={() => setShowPw(!showPw)} className="btn" style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",color:"#8b9ab0",cursor:"pointer", padding: 4}}>
          <Ic p={showPw ? P.eyeOff : P.eye} s={14} />
        </button>
      )}
    </div>
  </div>
);

export default function AdminProfilePage({ th, isAr, adminFetch, isSuperAdmin, initialProfile }) {
  const [profile, setProfile] = useState(initialProfile || { full_name: "", email: "", phone: "", national_id: "", role: "admin", is_super: false, joined: "" });
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", national_id: "", new_password: "" });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [showPw, setShowPw] = useState(false);

  // ── Shared particle drawer ──────────────────────────────
  const startParticles = (cv) => {
    if (!cv) return () => {};
    const ctx = cv.getContext("2d"); let raf, running = true;
    const resize = () => { cv.width = cv.offsetWidth; cv.height = cv.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    const cols = ["rgba(13,148,136,", "rgba(99,102,241,", "rgba(6,182,212,", "rgba(14,165,233,"];
    const orbs = [
      { px: .08, py: .12, r: 220, c: "rgba(13,148,136," },
      { px: .88, py: .18, r: 190, c: "rgba(99,102,241," },
      { px: .45, py: .92, r: 200, c: "rgba(6,182,212," },
      { px: .7, py: .55, r: 140, c: "rgba(14,165,233," },
    ];
    const pts = Array.from({ length: 65 }, () => ({
      x: Math.random() * (cv.width || 900), y: Math.random() * (cv.height || 700),
      r: Math.random() * 1.9 + 0.4, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      c: cols[Math.floor(Math.random() * cols.length)], a: Math.random() * .5 + .22
    }));
    let t = 0;
    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, cv.width, cv.height); t += .003;
      orbs.forEach((o, i) => {
        const ox = o.px * cv.width + Math.sin(t + i * 1.3) * 38, oy = o.py * cv.height + Math.cos(t + i * .9) * 28;
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, o.r);
        g.addColorStop(0, o.c + "0.13)"); g.addColorStop(.4, o.c + "0.06)"); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(ox, oy, o.r, 0, Math.PI * 2); ctx.fill();
      });
      pts.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.c + p.a + ")"; ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > cv.width) p.vx *= -1; if (p.y < 0 || p.y > cv.height) p.vy *= -1;
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 90) { ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.strokeStyle = `rgba(255,255,255,${.045 * (1 - d / 90)})`; ctx.lineWidth = .5; ctx.stroke(); }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { running = false; cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  };

  const loadProfile = async () => {
    try { const res = await adminFetch("/api/admin/profile"); if (res.ok) { const d = await res.json(); setProfile(d); } } catch {}
  };
  useEffect(() => { loadProfile(); }, []);

  const startEdit = () => {
    setForm({ full_name: profile.full_name || "", email: profile.email || "", phone: profile.phone || "", national_id: profile.national_id || "", new_password: "" });
    setEditing(true); setErr(""); setDone(false); setShowPw(false);
  };

  const save = async () => {
    setSaving(true); setErr("");
    try {
      const body = {};
      if (form.full_name && form.full_name !== profile.full_name) body.full_name = form.full_name;
      if (form.email && form.email !== profile.email) body.email = form.email;
      if (form.phone !== profile.phone) body.phone = form.phone;
      if (form.national_id !== profile.national_id) body.national_id = form.national_id;
      if (form.new_password.trim()) body.new_password = form.new_password;
      if (!Object.keys(body).length) { setEditing(false); setSaving(false); return; }
      const res = await adminFetch("/api/admin/profile", { method: "PUT", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setErr(data.detail || "Update failed"); setSaving(false); return; }
      setDone(true); setEditing(false); await loadProfile();
    } catch { setErr("Cannot connect to server."); }
    setSaving(false);
  };

  // ── Super admin: indigo/accent, regular admin: teal ────
  const accent = "#0d9488";
  const accentB = "#0f766e";
  const initials = (profile.full_name || "A").split(" ").slice(0, 2).map(w => w[0] || "").join("").toUpperCase() || "A";

  const InfoRow = ({ icon, label, value }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", flexDirection: "row" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, flexShrink: 0 }}>
        <Ic p={icon} s={15} />
      </div>
      <div style={{ flex: 1, textAlign: "left" }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(61,74,92,.9)", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 3, fontFamily: "'Space Grotesk',sans-serif" }}>{label}</p>
        <p style={{ fontSize: 13, fontWeight: 600, color: value ? "#f0eef9" : "rgba(61,74,92,.65)", fontFamily: "'Plus Jakarta Sans',sans-serif", fontStyle: value ? "normal" : "italic" }}>{value || "Not set"}</p>
      </div>
    </div>
  );

  const Sep = ({ label }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "6px 0 10px", flexDirection: "row" }}>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", color: "#344055", whiteSpace: "nowrap", fontFamily: "'Space Grotesk',sans-serif" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", position: "relative", direction: "ltr" }}>

      <div style={{ position: "relative", zIndex: 1 }}>
        <p style={{ fontSize: 11, color: "rgba(61,74,92,.9)", marginBottom: 3, letterSpacing: ".06em", textTransform: "uppercase", fontFamily: "'Space Grotesk',sans-serif" }}>Account</p>
        <h1 style={{ fontSize: 25, fontWeight: 700, color: "#f0eef9", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: "-.02em", marginBottom: 20 }}>My Profile</h1>

        {done && (
          <div style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: 12, padding: "11px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, animation: "fadeUp .4s ease", flexDirection: "row" }}>
            <Ic p={P.checkO} s={15} color="#22c55e" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#22c55e" }}>Profile updated successfully! A notification email has been sent.</span>
          </div>
        )}

        {/* ── Profile card ── */}
        <div style={{ background: "rgba(10,14,26,0.72)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20, overflow: "hidden", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", boxShadow: "0 8px 40px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.05)" }}>

          {/* Hero */}
          <div style={{ position: "relative", overflow: "hidden", padding: "24px 22px 20px" }}>
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg,${accent}1a 0%,transparent 65%)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: -50, right: -50, width: 220, height: 220, borderRadius: "50%", background: `${accent}09`, pointerEvents: "none" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative", flexDirection: "row" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <div style={{ width: 66, height: 66, borderRadius: 18, background: `linear-gradient(135deg,${accent},${accentB})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'Space Grotesk',sans-serif", boxShadow: `0 6px 24px ${accent}44` }}>{initials}</div>
                <div style={{ position: "absolute", bottom: -5, right: -5, width: 22, height: 22, borderRadius: 7, background: `linear-gradient(135deg,${accent},${accentB})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid rgba(10,14,26,.9)" }}>
                  {isSuperAdmin ? "✦" : "◈"}
                </div>
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexDirection: "row" }}>
                  <h2 style={{ fontSize: 19, fontWeight: 700, color: "#f0eef9", fontFamily: "'Space Grotesk',sans-serif" }}>{profile.full_name || "Admin"}</h2>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: `${accent}20`, color: accent, border: `1px solid ${accent}44`, fontFamily: "'Space Grotesk',sans-serif", textTransform: "uppercase", letterSpacing: ".06em" }}>{isSuperAdmin ? "Super Admin" : "Admin"}</span>
                </div>
                <p style={{ fontSize: 12, color: "rgba(139,154,176,.8)" }}>{profile.email}</p>
                {profile.joined && <p style={{ fontSize: 10, color: "rgba(61,74,92,.85)", marginTop: 4, display: "flex", alignItems: "center", gap: 4, flexDirection: "row" }}><Ic p={P.clock} s={10} />Joined {profile.joined}</p>}
              </div>
              <button onClick={startEdit}
                className="btn"
                style={{ padding: "9px 17px", borderRadius: 11, background: `${accent}1a`, border: `1px solid ${accent}44`, color: accent, fontSize: 12, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0, transition: "all .18s" }}>
                <Ic p={P.settings} s={13} />Edit Profile
              </button>
            </div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
          <InfoRow icon={P.user} label="Full Name" value={profile.full_name} />
          <InfoRow icon={P.email} label="Email Address" value={profile.email} />
          <InfoRow icon={P.bell} label="Phone Number" value={profile.phone} />
          <InfoRow icon={P.id} label="National ID" value={profile.national_id ? profile.national_id.replace(/(\d{3})(\d{7})(\d{4})/, "$1 – $2 – $3") : null} />

          {/* Access level row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", flexDirection: "row" }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `${accent}18`, display: "flex", alignItems: "center", justifyContent: "center", color: accent, flexShrink: 0 }}>
              <Ic p={P.shield} s={15} />
            </div>
            <div style={{ flex: 1, textAlign: "left" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(61,74,92,.9)", letterSpacing: ".07em", textTransform: "uppercase", marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif" }}>Access Level</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "row" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: accent, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{isSuperAdmin ? "✦ Super Admin" : "◈ Admin"}</span>
                <span style={{ fontSize: 10, color: "rgba(61,74,92,.75)" }}>—</span>
                <span style={{ fontSize: 10, color: "rgba(61,74,92,.85)" }}>{isSuperAdmin ? "Full system access — manage all admins & passwords" : "Standard access — manage students & books"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit modal ── */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(7,9,15,0.88)" }} onClick={() => setEditing(false)} />
          <div style={{ position: "relative", zIndex: 2, width: "100%", maxWidth: 480, margin: "16px", maxHeight: "92vh", overflowY: "auto", animation: "scaleIn 0.28s ease" }}>
            <div style={{ background: "rgba(10,14,26,0.80)", border: "1px solid rgba(255,255,255,0.11)", borderRadius: 22, padding: "22px 24px 22px", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", boxShadow: "0 8px 40px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07)" }}>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexDirection: "row" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, flexDirection: "row" }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: `linear-gradient(135deg,${accent},${accentB})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Ic p={P.settings} s={15} color="#fff" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 700, color: "#f0eef9" }}>Edit My Profile</p>
                    <p style={{ fontSize: 8, color: "#8b9ab0", letterSpacing: ".08em", fontFamily: "'Space Grotesk',sans-serif", textTransform: "uppercase" }}>Email notification on save</p>
                  </div>
                </div>
                <button onClick={() => setEditing(false)} className="btn" style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "rgba(139,154,176,.7)" }}>
                  <Ic p={P.xO} s={13} />
                </button>
              </div>

              <Sep label="Personal Info" />
              <div style={{ marginBottom: 9, textAlign: "left" }}>
                <ProfileFld label="Full Name" fkey="full_name" ph="Your full name" form={form} setForm={setForm} showPw={showPw} setShowPw={setShowPw} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 9, textAlign: "left" }}>
                <ProfileFld label="Email" fkey="email" type="email" ph="your@email.com" form={form} setForm={setForm} showPw={showPw} setShowPw={setShowPw} />
                <ProfileFld label="Phone" fkey="phone" type="tel" ph="+20 1XX XXX XXXX" form={form} setForm={setForm} showPw={showPw} setShowPw={setShowPw} />
              </div>
              <div style={{ marginBottom: 9, textAlign: "left" }}>
                <ProfileFld label="National ID" fkey="national_id" ph="14-digit ID" maxLen={14} form={form} setForm={setForm} showPw={showPw} setShowPw={setShowPw} />
              </div>

              <Sep label="Security" />
              <div style={{ textAlign: "left" }}>
                 <ProfileFld label="New Password (leave blank to keep)" fkey="new_password" ph="••••••••" form={form} setForm={setForm} showPw={showPw} setShowPw={setShowPw} />
              </div>

              {err && (
                <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.22)", borderRadius: 9, padding: "9px 13px", marginTop: 11, display: "flex", alignItems: "center", gap: 8, flexDirection: "row" }}>
                  <Ic p={P.alert} s={13} color="rgba(239,68,68,.85)" />
                  <p style={{ fontSize: 11.5, color: "rgba(239,68,68,.9)" }}>{err}</p>
                </div>
              )}

              <button onClick={save} disabled={saving} className="btn"
                style={{ width: "100%", marginTop: 14, background: `linear-gradient(135deg,${accent} 0%,#0891b2 50%,#6366f1 100%)`, border: "none", borderRadius: 10, padding: "12px", color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: ".02em", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Space Grotesk',sans-serif", boxShadow: `0 5px 22px ${accent}30,0 2px 8px rgba(99,102,241,.2)`, position: "relative", overflow: "hidden", opacity: saving ? .6 : 1, transition: "opacity .2s" }}>
                <span style={{ position: "absolute", top: "-50%", left: "-60%", width: "35%", height: "200%", background: "rgba(255,255,255,.14)", transform: "skewX(-20deg)", animation: "shimBtn 3s ease-in-out infinite", pointerEvents: "none" }} />
                {saving
                  ? <><span style={{ width: 13, height: 13, borderRadius: "50%", border: "2.5px solid rgba(255,255,255,.3)", borderTopColor: "#fff", animation: "spin .7s linear infinite", display: "inline-block" }} />Saving...</>
                  : <><Ic p={P.checkO} s={14} color="#fff" />Save Changes</>
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
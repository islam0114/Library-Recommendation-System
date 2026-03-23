import React, { useState, useEffect } from "react";
import { Ic, P } from "../components/Icons";
import { deptColor } from "../components/BookCard";

export default function StudentAccount({ th, t, isAr, user, activeLoans, history, wishlist, apiFetch, persistUser }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [updateDone, setUpdateDone] = useState(false);
  const [updateErr, setUpdateErr] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const YEARS_LIST = ["الفرقة الأولى", "الفرقة الثانية", "الفرقة الثالثة", "الفرقة الرابعة", "الفرقة الخامسة", "الفرقة السادسة", "دراسات عليا"];

  useEffect(() => {
    if (user) setEditForm({ ...user, full_name: user.name, department: user.dept });
  }, [user]);

  const startEditing = () => {
    setEditForm({
      full_name: user.name || "", email: user.email || "", faculty: user.faculty || "",
      university: user.university || "", department: user.dept || "", year: user.year || "", new_password: ""
    });
    setUpdateErr(""); setIsEditing(true);
  };

  const cancelEditing = () => { setIsEditing(false); setUpdateErr(""); };

  const handleUpdate = async () => {
    setUpdateLoading(true); setUpdateErr("");
    try {
      const res = await apiFetch("/api/students/update-profile", {
        method: "PUT",
        body: JSON.stringify({
          full_name: editForm.full_name || undefined, email: editForm.email || undefined,
          university: editForm.university || undefined, faculty: editForm.faculty || undefined,
          department: editForm.department || undefined, year: editForm.year || undefined,
          new_password: editForm.new_password || undefined,
        })
      });
      const data = await res.json();
      if (res.ok) {
        setIsEditing(false); setUpdateDone(true);
        if (data.user) {
          const updated = {
            ...user, name: data.user.name || user.name, email: data.user.email || user.email,
            dept: data.user.dept || user.dept, university: data.user.university || user.university,
            faculty: data.user.faculty || user.faculty, year: data.user.year || user.year,
          };
          persistUser(updated); // Updating root state
        }
        setTimeout(() => setUpdateDone(false), 2200);
      } else {
        setUpdateErr(t.updateFailed + (data.detail || (isAr ? "خطأ" : "Error")));
      }
    } catch (e) { setUpdateErr(t.connectionErr); }
    setUpdateLoading(false);
  };

  return (
    <div style={{ padding: "32px 28px", maxWidth: 760, margin: "0 auto", direction: "ltr" }}>
      {updateDone && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeUp 0.3s ease" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: th.green + "22", border: `2px solid ${th.green}44`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: th.green }}><Ic p={P.check} s={36} /></div>
          <h2 style={{ color: th.text, fontSize: 22, fontWeight: 700, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 8 }}>{t.updateSuccess}</h2>
          <p style={{ color: th.sub, fontSize: 14 }}>{t.reloading}</p>
        </div>
      </div>}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28, flexDirection: "row" }}>
        <div style={{ width: 4, height: 28, borderRadius: 4, background: `linear-gradient(180deg,${th.accent},${th.accent}66)` }} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif" }}>{t.account}</h2>
      </div>

      <div style={{ background: `linear-gradient(135deg,${th.prime}18,${th.accent}10)`, border: `1px solid ${th.prime}30`, borderRadius: 24, padding: "28px", marginBottom: 16, display: "flex", alignItems: "center", gap: 24, position: "relative", overflow: "hidden", flexDirection: "row" }}>
        <div style={{ position: "absolute", top: -30, left: -30, width: 180, height: 180, borderRadius: "50%", background: `${th.prime}08`, pointerEvents: "none" }} />
        <div style={{ position: "relative", width: 84, height: 84, borderRadius: 26, background: `linear-gradient(135deg,${th.prime},${th.accent})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, fontWeight: 800, color: "#fff", fontFamily: "'Space Grotesk',sans-serif", flexShrink: 0, boxShadow: `0 10px 30px ${th.prime}44` }}>
          {user.name[0]}
          <div style={{ position: "absolute", bottom: -4, right: -4, width: 22, height: 22, borderRadius: "50%", background: th.green, border: `3px solid ${th.bg}`, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} /></div>
        </div>
        <div style={{ flex: 1, textAlign: isAr ? "right" : "left" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>{user.name}</h2>
          <p style={{ fontSize: 13, color: th.sub, marginBottom: 10, fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{user.libId} · {user.email}</p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: isAr ? "row-reverse" : "row", justifyContent: isAr ? "flex-end" : "flex-start" }}>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, background: th.green + "18", color: th.green, border: `1px solid ${th.green}33` }}>{isAr ? "نشط" : "Active"}</span>
            {user.dept && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: deptColor(user.dept) + "18", color: deptColor(user.dept), border: `1px solid ${deptColor(user.dept)}33` }}>{user.dept}</span>}
            {user.year && <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: th.amber + "18", color: th.amber, border: `1px solid ${th.amber}33` }}>{user.year}</span>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, textAlign: "center", flexShrink: 0 }}>
          {[[String(activeLoans.length), t.activeLoans, th.prime], [String(history.filter(r => r.returnDate).length), t.totalRead, th.cyan], [String(wishlist.length), t.wishlist, th.red]].map(([v, l, c]) => (
            <div key={l}><p style={{ fontSize: 26, fontWeight: 700, color: c, fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1 }}>{v}</p><p style={{ fontSize: 12, color: th.sub, marginTop: 4 }}>{l}</p></div>
          ))}
        </div>
      </div>

      <div style={{ background: th.surface, border: `1px solid ${th.border}`, borderRadius: 20, padding: "26px 28px", marginBottom: 16, boxShadow: "0 4px 30px rgba(0,0,0,0.12)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexDirection: "row" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: th.text, display: "flex", alignItems: "center", gap: 10, flexDirection: "row" }}><Ic p={P.user} s={16} color={th.prime} />{t.accountInfo}</h3>
          <div style={{ display: "flex", gap: 10, flexDirection: "row" }}>
            {isEditing && <button onClick={cancelEditing} className="btn" style={{ fontSize: 13, color: th.sub, fontWeight: 600, background: th.card, border: `1px solid ${th.border}`, padding: "8px 18px", borderRadius: 10 }}>{t.cancel}</button>}
            <button onClick={isEditing ? handleUpdate : startEditing} disabled={updateLoading} className="btn" style={{ fontSize: 13, color: "#fff", fontWeight: 700, background: `linear-gradient(135deg,${th.prime},${th.primeD})`, padding: "8px 20px", borderRadius: 10, display: "flex", alignItems: "center", gap: 8, opacity: updateLoading ? 0.75 : 1 }}>
              {updateLoading ? <><span style={{ width: 13, height: 13, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite", display: "inline-block" }} />{t.saving}</> : isEditing ? (isAr ? "حفظ التعديلات" : "Save Changes") : (isAr ? "تعديل البيانات" : "Edit Profile")}
            </button>
          </div>
        </div>

        {updateErr && <div style={{ background: th.red + "12", border: `1px solid ${th.red}30`, borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, flexDirection: "row" }}><Ic p={["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z", "M12 9v4", "M12 17h.01"]} s={16} color={th.red} /><p style={{ fontSize: 14, color: th.red }}>{updateErr}</p></div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, textAlign: isAr ? "right" : "left" }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{t.fullName}</label>
            {isEditing
              ? <input value={editForm.full_name || ""} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} style={{ width: "100%", background: th.card, border: `1px solid ${th.prime}44`, borderRadius: 12, padding: "12px 16px", color: th.text, fontSize: 14, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", textAlign: isAr ? "right" : "left" }} dir={isAr ? "rtl" : "ltr"} />
              : <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: th.text, fontWeight: 600 }} dir={isAr ? "rtl" : "ltr"}>{user.name}</div>}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{t.email}</label>
            {isEditing
              ? <input type="email" value={editForm.email || ""} onChange={e => setEditForm({ ...editForm, email: e.target.value })} style={{ width: "100%", background: th.card, border: `1px solid ${th.prime}44`, borderRadius: 12, padding: "12px 16px", color: th.text, fontSize: 14, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", textAlign: "left" }} dir="ltr" />
              : <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: th.text, textAlign: "left" }} dir="ltr">{user.email}</div>}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{t.nationalId}</label>
            <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: th.muted, display: "flex", alignItems: "center", justifyContent: "space-between", flexDirection: "row" }}>
              <span dir="ltr">{user.national_id || "—"}</span>
              <span style={{ fontSize: 10, color: th.muted, background: th.surface, padding: "3px 8px", borderRadius: 8 }}>{t.readOnly}</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{t.university}</label>
            {isEditing
              ? <input value={editForm.university || ""} onChange={e => setEditForm({ ...editForm, university: e.target.value })} style={{ width: "100%", background: th.card, border: `1px solid ${th.prime}44`, borderRadius: 12, padding: "12px 16px", color: th.text, fontSize: 14, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", textAlign: isAr ? "right" : "left" }} dir={isAr ? "rtl" : "ltr"} />
              : <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: th.text }} dir={isAr ? "rtl" : "ltr"}>{user.university || "—"}</div>}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{t.faculty}</label>
            {isEditing
              ? <input value={editForm.faculty || ""} onChange={e => setEditForm({ ...editForm, faculty: e.target.value })} style={{ width: "100%", background: th.card, border: `1px solid ${th.prime}44`, borderRadius: 12, padding: "12px 16px", color: th.text, fontSize: 14, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", textAlign: isAr ? "right" : "left" }} dir={isAr ? "rtl" : "ltr"} />
              : <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: th.text }} dir={isAr ? "rtl" : "ltr"}>{user.faculty || "—"}</div>}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{t.academicYear}</label>
            {isEditing
              ? <select value={editForm.year || ""} onChange={e => setEditForm({ ...editForm, year: e.target.value })} style={{ width: "100%", background: th.card, border: `1px solid ${th.prime}44`, borderRadius: 12, padding: "12px 16px", color: editForm.year ? th.text : th.muted, fontSize: 14, outline: "none", appearance: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", textAlign: isAr ? "right" : "left" }} dir={isAr ? "rtl" : "ltr"}>
                <option value="">{t.academicYear}</option>
                {YEARS_LIST.map(y => <option key={y} value={y} style={{ background: th.card, color: th.text }}>{y}</option>)}
              </select>
              : <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: th.text }} dir={isAr ? "rtl" : "ltr"}>{user.year || "—"}</div>}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{t.newPassword}</label>
            {isEditing
              ? <input type="password" value={editForm.new_password || ""} onChange={e => setEditForm({ ...editForm, new_password: e.target.value })} placeholder={isAr ? "اتركه فارغاً للإبقاء" : t.leaveBlank || "Leave blank to keep"} style={{ width: "100%", background: th.card, border: `1px solid ${th.prime}44`, borderRadius: 12, padding: "12px 16px", color: th.text, fontSize: 14, outline: "none", fontFamily: "'Plus Jakarta Sans',sans-serif", textAlign: isAr ? "right" : "left" }} dir="ltr" />
              : <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: th.muted, letterSpacing: "0.2em", textAlign: "left" }} dir="ltr">••••••••</div>}
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: th.sub, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif" }}>{t.joined}</label>
            <div style={{ background: th.card, border: `1px solid ${th.border}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, color: th.muted, textAlign: "left" }} dir="ltr">{user.joined || "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
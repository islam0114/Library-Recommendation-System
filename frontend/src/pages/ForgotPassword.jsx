import { useState } from "react";
import { THEMES } from "../styles/theme";
import { Ic, P } from "../components/Icons";

const API = "http://localhost:8000";

export default function ForgotPassword({ tn = "dark", lang = "ar", onBack }) {
    const th   = THEMES[tn];
    const isAr = lang === "ar";

    // ── steps: "email" → "otp" → "done"
    const [step,     setStep]     = useState("email");
    const [email,    setEmail]    = useState("");
    const [otp,      setOtp]      = useState(["","","","","",""]);
    const [newPass,  setNewPass]  = useState("");
    const [confirm,  setConfirm]  = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading,  setLoading]  = useState(false);
    const [msg,      setMsg]      = useState({ text:"", type:"" });
    const [resendCd, setResendCd] = useState(0);   // cooldown seconds

    const T = {
        title1:   isAr ? "نسيت كلمة المرور؟" : "Forgot Password?",
        sub1:     isAr ? "أدخل بريدك وسنبعث لك كود التحقق" : "Enter your email and we'll send you a verification code",
        emailLbl: isAr ? "البريد الإلكتروني" : "Email Address",
        sendBtn:  isAr ? "إرسال الكود" : "Send Code",
        sending:  isAr ? "جاري الإرسال..." : "Sending...",
        title2:   isAr ? "أدخل كود التحقق" : "Enter Verification Code",
        sub2a:    isAr ? "أرسلنا كود من 6 أرقام إلى" : "We sent a 6-digit code to",
        noCode:   isAr ? "لم تستلم الكود؟" : "Didn't receive the code?",
        resend:   isAr ? "إعادة الإرسال" : "Resend",
        newPass:  isAr ? "كلمة المرور الجديدة" : "New Password",
        confirm:  isAr ? "تأكيد كلمة المرور" : "Confirm Password",
        resetBtn: isAr ? "تحديث كلمة المرور" : "Update Password",
        updating: isAr ? "جاري التحديث..." : "Updating...",
        success:  isAr ? "تم تحديث كلمة المرور بنجاح!" : "Password updated successfully!",
        successSub: isAr ? "يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة" : "You can now sign in with your new password",
        back:     isAr ? "العودة لتسجيل الدخول" : "Back to Login",
        errMatch: isAr ? "كلمتا المرور غير متطابقتين" : "Passwords do not match",
        errShort: isAr ? "كلمة المرور 6 أحرف على الأقل" : "Password must be at least 6 characters",
        errOtp:   isAr ? "يرجى إدخال الكود كاملاً" : "Please enter the complete code",
        inSec:    isAr ? "ثانية" : "s",
    };

    // ── Resend cooldown timer
    const startCooldown = () => {
        setResendCd(60);
        const timer = setInterval(() => setResendCd(c => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; }), 1000);
    };

    // ── Step 1: Request OTP
    const requestOtp = async () => {
        if (!email.trim()) { setMsg({ text: isAr?"أدخل بريدك الإلكتروني":"Enter your email", type:"red" }); return; }
        setLoading(true); setMsg({ text:"", type:"" });
        try {
            const res  = await fetch(`${API}/api/auth/request-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: email.trim().toLowerCase() }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Error");
            setStep("otp");
            startCooldown();
        } catch(e) {
            setMsg({ text: e.message || (isAr?"حدث خطأ":"Error occurred"), type:"red" });
        } finally { setLoading(false); }
    };

    // ── Step 2: Verify OTP + reset
    const verifyAndReset = async () => {
        const code = otp.join("");
        if (code.length < 6) { setMsg({ text: T.errOtp, type:"red" }); return; }
        if (newPass.length < 6) { setMsg({ text: T.errShort, type:"red" }); return; }
        if (newPass !== confirm) { setMsg({ text: T.errMatch, type:"red" }); return; }
        setLoading(true); setMsg({ text:"", type:"" });
        try {
            const res  = await fetch(`${API}/api/auth/verify-otp`, { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ email: email.trim().toLowerCase(), code, new_password: newPass }) });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || "Error");
            setStep("done");
            setTimeout(() => onBack(), 3000);
        } catch(e) {
            setMsg({ text: e.message || (isAr?"كود خاطئ أو منتهي":"Wrong or expired code"), type:"red" });
        } finally { setLoading(false); }
    };

    // ── OTP input helpers
    const handleOtpKey = (i, e) => {
        if (e.key === "Backspace") {
            const next = [...otp]; next[i] = "";
            setOtp(next);
            if (i > 0) document.getElementById(`otp-${i-1}`)?.focus();
            return;
        }
        if (!/^\d$/.test(e.key)) return;
        const next = [...otp]; next[i] = e.key;
        setOtp(next);
        if (i < 5) document.getElementById(`otp-${i+1}`)?.focus();
    };
    const handleOtpPaste = e => {
        const digits = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6).split("");
        const next = [...otp]; digits.forEach((d,i) => { if(i<6) next[i]=d; });
        setOtp(next);
        document.getElementById(`otp-${Math.min(digits.length,5)}`)?.focus();
    };

    // ── Success screen
    if (step === "done") return (
        <div style={{ minHeight:"100vh", background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", direction:isAr?"rtl":"ltr" }}>
            <div style={{ textAlign:"center", animation:"fadeUp 0.5s ease", padding:20 }}>
                <div style={{ width:72, height:72, borderRadius:"50%", background:th.green+"20", border:`2px solid ${th.green}44`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", color:th.green }}><Ic p={P.check} s={32}/></div>
                <h2 style={{ color:th.text, fontSize:22, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif", marginBottom:8 }}>{T.success}</h2>
                <p style={{ color:th.sub, fontSize:13 }}>{T.successSub}</p>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight:"100vh", background:th.bg, display:"flex", alignItems:"center", justifyContent:"center", direction:isAr?"rtl":"ltr", padding:20 }}>
            <div style={{ width:"100%", maxWidth:420, animation:"fadeUp 0.6s ease" }}>

                {/* Logo + title */}
                <div style={{ textAlign:"center", marginBottom:28 }}>
                    <div style={{ width:52, height:52, borderRadius:16, background:`linear-gradient(135deg,${th.prime},${th.primeD})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", margin:"0 auto 16px", boxShadow:`0 8px 24px ${th.prime}44` }}>
                        <Ic p={step==="otp"?P.key:P.shield} s={22}/>
                    </div>
                    <h1 style={{ color:th.text, fontSize:22, fontWeight:700, fontFamily:"'Space Grotesk',sans-serif" }}>{step==="email"?T.title1:T.title2}</h1>
                    <p style={{ color:th.sub, fontSize:12, marginTop:6, lineHeight:1.6 }}>
                        {step==="email" ? T.sub1 : <>{T.sub2a} <strong style={{ color:th.prime }}>{email}</strong></>}
                    </p>
                </div>

                <div style={{ background:th.surface, border:`1px solid ${th.border}`, borderRadius:20, padding:26, boxShadow:"0 20px 60px rgba(0,0,0,0.3)" }}>

                    {/* ─── STEP 1: Email ─── */}
                    {step === "email" && <>
                        <div style={{ marginBottom:16 }}>
                            <label style={{ fontSize:10, color:th.sub, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:7 }}>{T.emailLbl}</label>
                            <div style={{ position:"relative" }}>
                                <div style={{ position:"absolute", left:isAr?"auto":12, right:isAr?12:"auto", top:"50%", transform:"translateY(-50%)", color:th.muted }}><Ic p={P.email} s={14}/></div>
                                <input
                                    type="email" value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key==="Enter" && requestOtp()}
                                    placeholder="example@gmail.com"
                                    style={{ width:"100%", background:th.card, border:`1px solid ${th.border}`, borderRadius:12, padding: isAr?"12px 38px 12px 12px":"12px 12px 12px 38px", color:th.text, fontSize:13, outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                                />
                            </div>
                        </div>
                        {msg.text && <div style={{ background:th[msg.type]+"15", color:th[msg.type], padding:"10px 13px", borderRadius:9, fontSize:12, marginBottom:14, border:`1px solid ${th[msg.type]}30` }}>{msg.text}</div>}
                        <button onClick={requestOtp} disabled={loading} className="btn" style={{ width:"100%", background:`linear-gradient(135deg,${th.prime},${th.primeD})`, color:"#fff", padding:"13px", borderRadius:12, fontWeight:700, fontSize:13, opacity:loading?0.7:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, fontFamily:"'Space Grotesk',sans-serif" }}>
                            {loading ? T.sending : <><Ic p={P.send} s={14}/>{T.sendBtn}</>}
                        </button>
                    </>}

                    {/* ─── STEP 2: OTP + New Password ─── */}
                    {step === "otp" && <>

                        {/* OTP boxes */}
                        <div style={{ marginBottom:22 }}>
                            <label style={{ fontSize:10, color:th.sub, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:12, textAlign:"center" }}>
                                {isAr ? "كود التحقق" : "Verification Code"}
                            </label>
                            <div style={{ display:"flex", gap:8, justifyContent:"center", direction:"ltr" }}>
                                {otp.map((digit, i) => (
                                    <input
                                        key={i} id={`otp-${i}`}
                                        type="text" inputMode="numeric" maxLength={1} value={digit}
                                        onKeyDown={e => handleOtpKey(i, e)}
                                        onPaste={handleOtpPaste}
                                        onChange={() => {}}
                                        style={{
                                            width:46, height:54, textAlign:"center", fontSize:22, fontWeight:800,
                                            background: digit ? th.prime+"18" : th.card,
                                            border:`2px solid ${digit ? th.prime+"88" : th.border}`,
                                            borderRadius:12, color:th.prime, outline:"none",
                                            fontFamily:"'Space Grotesk',sans-serif",
                                            transition:"all 0.15s ease",
                                            caretColor:"transparent",
                                        }}
                                    />
                                ))}
                            </div>
                            {/* Resend */}
                            <div style={{ textAlign:"center", marginTop:12, fontSize:12, color:th.muted }}>
                                {T.noCode}{" "}
                                {resendCd > 0
                                    ? <span style={{ color:th.muted }}>{resendCd}{T.inSec}</span>
                                    : <button onClick={async()=>{ setMsg({text:"",type:""}); setLoading(true); try{ const r=await fetch(`${API}/api/auth/request-otp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:email.trim().toLowerCase()})}); if(r.ok)startCooldown(); }catch(e){} finally{setLoading(false);} }} className="btn" style={{ color:th.prime, fontWeight:700, fontSize:12 }}>{T.resend}</button>
                                }
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height:1, background:th.border, margin:"0 0 18px" }}/>

                        {/* New password */}
                        {[
                            { key:"new",  label:T.newPass,  val:newPass,  set:setNewPass },
                            { key:"conf", label:T.confirm,  val:confirm,  set:setConfirm },
                        ].map(({ key, label, val, set }) => (
                            <div key={key} style={{ marginBottom:14 }}>
                                <label style={{ fontSize:10, color:th.sub, fontWeight:700, letterSpacing:"0.07em", textTransform:"uppercase", display:"block", marginBottom:7 }}>{label}</label>
                                <div style={{ position:"relative" }}>
                                    <div style={{ position:"absolute", left:isAr?"auto":12, right:isAr?12:"auto", top:"50%", transform:"translateY(-50%)", color:th.muted }}><Ic p={P.lock} s={14}/></div>
                                    <input
                                        type={showPass?"text":"password"} value={val}
                                        onChange={e => set(e.target.value)}
                                        style={{ width:"100%", background:th.card, border:`1px solid ${th.border}`, borderRadius:12, padding: isAr?"12px 38px 12px 38px":"12px 38px 12px 38px", color:th.text, fontSize:13, outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif" }}
                                    />
                                    {key==="new" && (
                                        <button onClick={()=>setShowPass(s=>!s)} className="btn" style={{ position:"absolute", right:isAr?"auto":12, left:isAr?12:"auto", top:"50%", transform:"translateY(-50%)", color:th.muted }}>
                                            <Ic p={showPass?P.eyeOff:P.eye} s={14}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {msg.text && <div style={{ background:th[msg.type]+"15", color:th[msg.type], padding:"10px 13px", borderRadius:9, fontSize:12, marginBottom:14, border:`1px solid ${th[msg.type]}30` }}>{msg.text}</div>}

                        <button onClick={verifyAndReset} disabled={loading} className="btn" style={{ width:"100%", background:`linear-gradient(135deg,${th.prime},${th.primeD})`, color:"#fff", padding:"13px", borderRadius:12, fontWeight:700, fontSize:13, opacity:loading?0.7:1, fontFamily:"'Space Grotesk',sans-serif" }}>
                            {loading ? T.updating : T.resetBtn}
                        </button>

                        {/* Back to email step */}
                        <button onClick={()=>{ setStep("email"); setOtp(["","","","","",""]); setMsg({text:"",type:""}); }} className="btn" style={{ width:"100%", color:th.muted, marginTop:12, fontSize:12, textAlign:"center" }}>
                            ← {isAr?"تغيير البريد الإلكتروني":"Change email"}
                        </button>
                    </>}

                </div>

                {/* Back to login */}
                <button onClick={onBack} className="btn" style={{ width:"100%", color:th.sub, marginTop:18, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", gap:5, fontFamily:"'Space Grotesk',sans-serif" }}>
                    <Ic p={P.back} s={12}/> {T.back}
                </button>

            </div>
        </div>
    );
}

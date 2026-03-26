import { useState, useCallback, useEffect, useRef } from "react";
import { THEMES } from "../styles/theme";
import { Ic, P } from "../components/Icons";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;}
body{font-family:'Plus Jakarta Sans',sans-serif;}
input,select,button{font-family:'Plus Jakarta Sans',sans-serif;}
input::placeholder{color:rgba(61,74,92,0.75);}
select option{background:#141824;color:#f0eef9;}
::-webkit-scrollbar{width:3px;}
::-webkit-scrollbar-thumb{background:#1e2a3a;border-radius:4px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes checkPop{0%{opacity:0;transform:scale(.55) rotate(-10deg)}65%{transform:scale(1.12) rotate(2deg)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes rippleFade{0%{opacity:.6;transform:scale(0.8)}100%{opacity:0;transform:scale(1.6)}}
@keyframes shimBtn{0%,65%{left:-60%}80%{left:130%}100%{left:130%}}
.rg-page{position:relative;min-height:100vh;display:flex;align-items:center;justify-content:center;overflow:hidden;}
canvas.rg-cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;}
.rg-card{position:relative;z-index:2;width:100%;max-width:540px;margin:24px 16px;background:rgba(10,14,26,0.58);border:1px solid rgba(255,255,255,0.11);border-radius:22px;padding:24px 26px 20px;backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);box-shadow:0 8px 40px rgba(0,0,0,0.45),inset 0 1px 0 rgba(255,255,255,0.06);animation:fadeUp .45s ease;}
.fld{display:flex;flex-direction:column;gap:4px;}
.fld-lbl{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:rgba(180,195,215,0.88);font-family:'Space Grotesk',sans-serif;}
.fld-box{position:relative;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:9px;padding:8px 10px 8px 30px;transition:border-color .18s,background .18s,box-shadow .18s;}
.fld-box:focus-within{border-color:rgba(13,148,136,0.65);background:rgba(13,148,136,0.06);box-shadow:0 0 0 3px rgba(13,148,136,0.1);}
.fld-box.err{border-color:rgba(239,68,68,0.5);background:rgba(239,68,68,0.04);}
.fld-box.err:focus-within{box-shadow:0 0 0 3px rgba(239,68,68,0.09);}
.fld-ico{position:absolute;left:9px;top:50%;transform:translateY(-50%);pointer-events:none;transition:color .18s;display:flex;}
.fld-box:focus-within .fld-ico{color:rgba(13,148,136,.85)!important;}
.fld-box.err .fld-ico{color:rgba(239,68,68,.7)!important;}
.fld-inp{width:100%;background:transparent;border:none;outline:none;color:#f0eef9;font-size:12.5px;font-family:'Plus Jakarta Sans',sans-serif;}
.fld-err{font-size:10.5px;color:rgba(239,68,68,.85);display:flex;align-items:center;gap:4px;margin-top:2px;}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
.sep{display:flex;align-items:center;gap:8px;margin:10px 0 8px;}
.sep-ln{flex:1;height:1px;background:rgba(255,255,255,0.06);}
.sep-lb{font-size:8.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#344055;white-space:nowrap;font-family:'Space Grotesk',sans-serif;}
.tag-row{display:flex;align-items:center;gap:6px;justify-content:center;margin-bottom:14px;flex-wrap:wrap;}
.tag{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:50px;font-size:9.5px;font-weight:600;font-family:'Space Grotesk',sans-serif;}
.tag-t{background:rgba(13,148,136,.14);border:1px solid rgba(13,148,136,.22);color:#2dd4bf;}
.tag-c{background:rgba(6,182,212,.1);border:1px solid rgba(6,182,212,.18);color:#22d3ee;}
.tag-b{background:rgba(99,102,241,.12);border:1px solid rgba(99,102,241,.2);color:#a5b4fc;}
.sub-btn{width:100%;margin-top:11px;background:linear-gradient(135deg,#0d9488 0%,#0891b2 50%,#6366f1 100%);border:none;border-radius:10px;padding:12px;color:#fff;font-size:13px;font-weight:700;letter-spacing:.02em;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;font-family:'Space Grotesk',sans-serif;box-shadow:0 5px 22px rgba(13,148,136,.28),0 2px 8px rgba(99,102,241,.18);position:relative;overflow:hidden;transition:opacity .2s,transform .15s;}
.sub-btn::after{content:'';position:absolute;top:-50%;left:-60%;width:35%;height:200%;background:rgba(255,255,255,.13);transform:skewX(-20deg);animation:shimBtn 3s ease-in-out infinite;}
.sub-btn:hover:not(:disabled){opacity:.92;transform:translateY(-1px);}
.sub-btn:active:not(:disabled){transform:scale(.98);}
.sub-btn:disabled{opacity:.55;cursor:not-allowed;}
.logo-dot{width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#0d9488,#0f766e);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(13,148,136,.45);flex-shrink:0;}
.btn{transition:all .2s ease;cursor:pointer;border:none;background:none;}
.btn:hover{filter:brightness(1.08);transform:translateY(-1px);}
.btn:active{transform:scale(.97);}
`;


const YEARS = ["الفرقة الأولى","الفرقة الثانية","الفرقة الثالثة","الفرقة الرابعة","الفرقة الخامسة","الفرقة السادسة","دراسات عليا"];

/* ── FloatingLangButton ── */
function FloatingLangButton({ lang, setLang, th }) {
  const isAr = lang === "ar";
  const [hov, setHov] = useState(false);
  const [ripple, setRipple] = useState(false);
  const toggle = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    setLang(l => l === "en" ? "ar" : "en");
  };
  return (
    <button onClick={toggle} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      className="btn" title={isAr?"Switch to English":"التبديل للعربية"}
      style={{
        position:"relative",display:"flex",alignItems:"center",gap:0,
        background:hov?`linear-gradient(135deg,${th.prime},${th.primeD})`:`linear-gradient(135deg,${th.prime}dd,${th.primeD}cc)`,
        border:`1px solid ${th.prime}88`,borderRadius:50,padding:0,overflow:"hidden",
        boxShadow:hov?`0 8px 28px ${th.prime}55,0 2px 8px rgba(0,0,0,0.4)`:`0 4px 18px ${th.prime}33,0 2px 6px rgba(0,0,0,0.3)`,
        transform:hov?"scale(1.07) translateY(-2px)":"scale(1)",
        transition:"all 0.25s cubic-bezier(0.34,1.2,0.64,1)",
        width:hov?124:48,height:48,flexShrink:0,
      }}>
      {ripple&&<span style={{position:"absolute",inset:0,borderRadius:50,background:"rgba(255,255,255,0.25)",animation:"rippleFade 0.6s ease forwards",pointerEvents:"none"}}/>}
      <div style={{width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff"}}>
        <Ic p={P.globe} s={18}/>
      </div>
      <div style={{overflow:"hidden",maxWidth:hov?80:0,opacity:hov?1:0,transition:"all 0.25s ease",paddingRight:hov?12:0,display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
        <span style={{fontSize:10,fontWeight:700,letterSpacing:"0.06em",padding:"2px 7px",borderRadius:20,background:isAr?"rgba(255,255,255,0.15)":"rgba(255,255,255,0.9)",color:isAr?"rgba(255,255,255,0.5)":"#0d9488",fontFamily:"'Space Grotesk',sans-serif",transition:"all 0.2s"}}>EN</span>
        <span style={{fontSize:11,fontWeight:700,padding:"2px 7px",borderRadius:20,background:isAr?"rgba(255,255,255,0.9)":"rgba(255,255,255,0.15)",color:isAr?"#0d9488":"rgba(255,255,255,0.5)",fontFamily:"'Space Grotesk',sans-serif",transition:"all 0.2s"}}>ع</span>
      </div>
    </button>
  );
}

/* ── Field ── */
function Field({ fk, label, icon, type, ph, max, isSelect, value, onChange, error, showPass, onTogglePass }) {
  const isPass = fk==="password"||fk==="confirm";
  return (
    <div className="fld">
      <label className="fld-lbl">{label}</label>
      <div className={`fld-box${error?" err":""}`}>
        <div className="fld-ico" style={{color:error?"rgba(239,68,68,.65)":"rgba(122,143,168,.45)"}}>
          <Ic p={icon} s={12}/>
        </div>
        {isSelect?(
          <>
            <select value={value} onChange={onChange} style={{width:"100%",background:"transparent",border:"none",outline:"none",color:value?"#f0eef9":"rgba(61,74,92,0.75)",fontSize:"12.5px",appearance:"none",paddingRight:"20px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              <option value="" disabled style={{color:"#4a5568"}}>{ph}</option>
              {YEARS.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <div style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",pointerEvents:"none",color:"rgba(122,143,168,.45)"}}>
              <Ic p={P.chevD} s={11}/>
            </div>
          </>
        ):(
          <input
            type={isPass?(showPass?"text":"password"):(type||"text")}
            value={value} onChange={onChange} placeholder={ph} maxLength={max}
            className="fld-inp"
            style={isPass?{paddingRight:"24px"}:{}}
          />
        )}
        {isPass&&(
          <button type="button" onClick={onTogglePass}
            style={{position:"absolute",right:7,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(122,143,168,.5)",padding:2,display:"flex"}}>
            <Ic p={showPass?P.eyeOff:P.eye} s={12}/>
          </button>
        )}
      </div>
      {error&&<div className="fld-err"><Ic p="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01" s={10} c="rgba(239,68,68,.8)"/>{error}</div>}
    </div>
  );
}

function Sep({ label }) {
  return <div className="sep"><div className="sep-ln"/><span className="sep-lb">{label}</span><div className="sep-ln"/></div>;
}

/* ── Particles canvas ── */
function useParticles(ref) {
  useEffect(() => {
    const cv = ref.current; if(!cv) return;
    const ctx = cv.getContext("2d");
    let raf;
    const resize = () => { cv.width=cv.offsetWidth; cv.height=cv.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    const cols = ["rgba(13,148,136,","rgba(99,102,241,","rgba(6,182,212,","rgba(14,165,233,"];
    const orbs = [{px:.12,py:.18,r:210,c:"rgba(13,148,136,"},{px:.88,py:.25,r:180,c:"rgba(99,102,241,"},{px:.5,py:.9,r:200,c:"rgba(6,182,212,"},{px:.78,py:.6,r:140,c:"rgba(14,165,233,"}];
    const pts = Array.from({length:70},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,r:Math.random()*1.9+0.4,vx:(Math.random()-.5)*.38,vy:(Math.random()-.5)*.38,c:cols[Math.floor(Math.random()*cols.length)],a:Math.random()*.5+.25}));
    let t=0;
    const draw=()=>{
      ctx.clearRect(0,0,cv.width,cv.height); t+=.003;
      orbs.forEach((o,i)=>{
        const ox=o.px*cv.width+Math.sin(t+i*1.3)*38,oy=o.py*cv.height+Math.cos(t+i*.9)*28;
        const g=ctx.createRadialGradient(ox,oy,0,ox,oy,o.r);
        g.addColorStop(0,o.c+"0.13)"); g.addColorStop(.4,o.c+"0.07)"); g.addColorStop(1,"transparent");
        ctx.fillStyle=g; ctx.beginPath(); ctx.arc(ox,oy,o.r,0,Math.PI*2); ctx.fill();
      });
      pts.forEach(p=>{
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=p.c+p.a+")"; ctx.fill();
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>cv.width)p.vx*=-1; if(p.y<0||p.y>cv.height)p.vy*=-1;
      });
      for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
        const d=Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y);
        if(d<88){ctx.beginPath();ctx.moveTo(pts[i].x,pts[i].y);ctx.lineTo(pts[j].x,pts[j].y);ctx.strokeStyle=`rgba(255,255,255,${.045*(1-d/88)})`;ctx.lineWidth=.5;ctx.stroke();}
      }
      raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);window.removeEventListener("resize",resize);};
  },[ref]);
}

export default function RegisterPage({ tn="dark", lang:initLang="ar", onBack, onSuccess, setLang:setLangOuter }) {
  const [lang, _setLang] = useState(initLang);
  const setLang = v => { _setLang(v); setLangOuter?.(v); };
  const th = THEMES[tn]||THEMES.dark;
  const isAr = lang==="ar";
  const canvasRef = useRef(null);
  useParticles(canvasRef);

  const FACULTIES_DATA = {
    "الهندسة (Engineering)": ["Computer Science", "Technology & Engineering", "Architecture", "Mathematics"],
    "العلوم (Science)": ["Science", "Mathematics", "Computers", "Physics"],
    "الحاسبات والمعلومات (Computers & IT)": ["Computers", "Computer Science", "Technology & Engineering"],
    "الطب والصيدلة (Medicine & Pharmacy)": ["Medical", "Science", "Psychology"],
    "الأعمال والاقتصاد (Business & Economics)": ["Business & Economics", "Law", "Social Science"],
    "الآداب والتربية (Arts & Education)": ["Education", "History", "Philosophy", "Language Arts & Disciplines", "Psychology"],
    "أخرى (Other)": ["All", "Reference"]
  };
  const T = {
    ar:{h1:"انضم إلى",h1g:"بيبليوتك",sub:"مكتبة جامعة بنها الذكية",tags:["📚  آلاف الكتب","🤖  توصيات AI","📋  تتبع فوري"],s1:"البيانات الشخصية",s2:"بيانات الجامعة",s3:"كلمة المرور",fullName:"الاسم الثلاثي",fnPh:"مثال: محمد أحمد علي",email:"البريد الإلكتروني",emPh:"example@benha.edu.eg",nid:"الرقم القومي",nidPh:"14 رقماً",univ:"الجامعة",univPh:"جامعة بنها",fac:"الكلية",facPh:"كلية الحاسبات",yr:"الفرقة",yrPh:"اختر الفرقة",pw:"كلمة المرور",pwPh:"٦ أحرف على الأقل",cpw:"تأكيد كلمة المرور",cpwPh:"أعد الكتابة",submit:"إنشاء الحساب",submitting:"جاري الإنشاء…",hasAcc:"لديك حساب؟",login:"تسجيل الدخول",ok:"تم إنشاء حسابك! 🎉",okSub:"جاري تحويلك لصفحة الدخول…",eName:"الاسم يجب أن يكون ثلاثياً على الأقل",eEmail:"البريد الإلكتروني غير صحيح",eNid:"الرقم القومي يجب أن يكون 14 رقماً",eUniv:"أدخل اسم الجامعة",eFac:"أدخل اسم الكلية",eYr:"اختر الفرقة الدراسية",ePw:"كلمة المرور ٦ أحرف على الأقل",eCpw:"كلمتا المرور غير متطابقتين",eSrv:"لا يمكن الاتصال بالسيرفر"},
    en:{h1:"Join",h1g:"BiblioTech",sub:"Benha University Smart Library",tags:["📚  Thousands of books","🤖  AI recommendations","📋  Real-time tracking"],s1:"Personal Info",s2:"University Info",s3:"Password",fullName:"Full Name",fnPh:"e.g. Ahmed Mohamed Ali",email:"Email Address",emPh:"example@benha.edu.eg",nid:"National ID",nidPh:"14 digits",univ:"University",univPh:"Benha University",fac:"Faculty",facPh:"Faculty of Computers",yr:"Academic Year",yrPh:"Select year",pw:"Password",pwPh:"Min 6 characters",cpw:"Confirm Password",cpwPh:"Re-enter password",submit:"Create Account",submitting:"Creating…",hasAcc:"Already have an account?",login:"Sign In",ok:"Account Created! 🎉",okSub:"Redirecting to login…",eName:"Full name must be at least 3 words",eEmail:"Invalid email address",eNid:"National ID must be exactly 14 digits",eUniv:"Enter university name",eFac:"Enter faculty name",eYr:"Select academic year",ePw:"Password must be at least 6 characters",eCpw:"Passwords do not match",eSrv:"Cannot connect to server"},
  };
  const t = T[lang];

  const [form, setForm] = useState({ 
    name: "", email: "", national: "", university: "", 
    faculty: "", dept: "", password: "", confirm: "" 
  });  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [globalErr,setGlobalErr]=useState("");
  const [done,setDone]=useState(false);
  const [showPass,setShowPass]=useState(false);

  const onChange=useCallback((k)=>(e)=>{
    const v=e.target.value;
    setForm(p=>({...p,[k]:v}));
    setErrors(p=>p[k]?{...p,[k]:""}:p);
  },[]);

  const validate=()=>{
    const e={};
    if(form.full_name?.trim().split(/\s+/).length<3)e.full_name=t.eName;
    if(!form.email?.includes("@")||!form.email?.split("@")[1]?.includes("."))e.email=t.eEmail;
    if(!/^\d{14}$/.test(form.national_id))e.national_id=t.eNid;
    if(!form.university?.trim())e.university=t.eUniv;
    if(!form.faculty?.trim())e.faculty=t.eFac;
    if(!form.dept?.trim())e.dept=isAr ? "اختر القسم" : "Select department";
    if(!form.year)e.year=t.eYr;
    if(form.password?.length<6)e.password=t.ePw;
    if(form.password!==form.confirm)e.confirm=t.eCpw;
    return e;
  };

  const submit=async()=>{
    const e=validate();setErrors(e);
    if(Object.keys(e).length)return;
    setLoading(true);setGlobalErr("");
    try{
      const res=await fetch("http://localhost:8000/api/register",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          national_id: form.national_id.trim(),
          university: form.university.trim(),
          faculty: form.faculty.trim(),
          department: form.dept.trim(),
          year: form.year,
          password: form.password
        })
      });
      const data=await res.json();
      if(!res.ok){setGlobalErr(data.detail||"حدث خطأ");setLoading(false);return;}
      setDone(true);setTimeout(()=>onSuccess?.(),2500);
    }catch{setGlobalErr(t.eSrv);}
    setLoading(false);
  };

  if(done) return(
    <div style={{minHeight:"100vh",background:th.bg,display:"flex",alignItems:"center",justifyContent:"center",direction:isAr?"rtl":"ltr"}}>
      <style>{CSS}</style>
      <div style={{textAlign:"center",animation:"checkPop .55s cubic-bezier(.34,1.56,.64,1)"}}>
        <div style={{width:78,height:78,borderRadius:"50%",background:th.green+"18",border:`2px solid ${th.green}44`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:th.green,boxShadow:`0 0 50px ${th.green}28`}}>
          <Ic p={P.check} s={34} c={th.green}/>
        </div>
        <h2 style={{fontSize:21,fontWeight:800,color:th.text,marginBottom:8,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.ok}</h2>
        <p style={{fontSize:13,color:th.sub}}>{t.okSub}</p>
      </div>
    </div>
  );

  return(
    <div style={{direction:isAr?"rtl":"ltr"}}>
      <style>{CSS}</style>
      <div className="rg-page" style={{background:th.bg}}>
        <canvas ref={canvasRef} className="rg-cv"/>
        <div className="rg-card">

          {/* Header */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div className="logo-dot"><Ic p={P.books} s={16} c="#fff"/></div>
              <div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:15,fontWeight:700,color:"#f0eef9",letterSpacing:"-.3px"}}>
                  Biblio<span style={{color:"#0d9488"}}>Tech</span>
                </div>
                <div style={{fontSize:8,color:"#2a3548",letterSpacing:".08em",fontFamily:"'Space Grotesk',sans-serif",marginTop:1}}>BENHA UNIVERSITY</div>
              </div>
            </div>
            <FloatingLangButton lang={lang} setLang={setLang} th={th}/>
          </div>

          {/* Headline */}
          <div style={{textAlign:"center",marginBottom:13}}>
            <h1 style={{fontSize:20,fontWeight:800,color:"#f0eef9",letterSpacing:"-.4px",margin:"0 0 4px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
              {t.h1}{" "}
              <span style={{background:"linear-gradient(90deg,#0d9488,#06b6d4,#6366f1)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{t.h1g}</span>
            </h1>
            <p style={{fontSize:11,color:"#3d4a5c",margin:0}}>{t.sub}</p>
          </div>

          {/* Tags */}
          <div className="tag-row">
            <span className="tag tag-t">{t.tags[0]}</span>
            <span className="tag tag-c">{t.tags[1]}</span>
            <span className="tag tag-b">{t.tags[2]}</span>
          </div>

          {/* Personal */}
          <Sep label={t.s1}/>
          <div style={{marginBottom:8}}>
            <Field fk="full_name" label={t.fullName} icon={P.user} ph={t.fnPh} value={form.full_name} onChange={onChange("full_name")} error={errors.full_name} showPass={showPass} onTogglePass={()=>setShowPass(s=>!s)}/>
          </div>
          <div className="g2" style={{marginBottom:8}}>
            <Field fk="email" label={t.email} icon={P.mail} type="email" ph={t.emPh} value={form.email} onChange={onChange("email")} error={errors.email} showPass={showPass} onTogglePass={()=>setShowPass(s=>!s)}/>
            <Field fk="national_id" label={t.nid} icon={P.id} ph={t.nidPh} max={14} value={form.national_id} onChange={onChange("national_id")} error={errors.national_id} showPass={showPass} onTogglePass={()=>setShowPass(s=>!s)}/>
          </div>

          {/* University, Faculty, Dept, Year */}
          <Sep label={t.s2}/>
          
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16}}>
            
            <Field fk="university" label={t.univ} icon={P.globe} ph={t.univPh} value={form.university} onChange={onChange("university")} error={errors.university} showPass={showPass} onTogglePass={()=>setShowPass(s=>!s)}/>
            <Field fk="year" label={t.yr} icon={P.cap} ph={t.yrPh} isSelect value={form.year} onChange={onChange("year")} error={errors.year} showPass={showPass} onTogglePass={()=>setShowPass(s=>!s)}/>
            
            <div style={{display: "flex", flexDirection: "column", gap: 6}}>
              <label style={{fontSize: 12, fontWeight: 700, color: th.sub, display: "flex", alignItems: "center", gap: 6}}>
                <Ic p={P.book} s={14} color={th.prime}/> {t.fac || (isAr ? "الكلية" : "Faculty")}
              </label>
              <select 
                value={form.faculty} 
                onChange={e => setForm({...form, faculty: e.target.value, dept: ""})} // بنمسح القسم لما يغير الكلية
                style={{width: "100%", height: 42, background: th.surface, border: `1px solid ${errors.faculty ? th.red : th.border}`, borderRadius: 10, padding: "0 14px", color: form.faculty ? th.text : th.muted, outline: "none", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, transition: "all 0.2s"}}
              >
                <option value="">{t.facPh || (isAr ? "اختر الكلية..." : "Select Faculty...")}</option>
                {Object.keys(FACULTIES_DATA).map(f => <option key={f} value={f} style={{background: th.card, color: th.text}}>{f}</option>)}
              </select>
            </div>

            <div style={{display: "flex", flexDirection: "column", gap: 6}}>
              <label style={{fontSize: 12, fontWeight: 700, color: th.sub, display: "flex", alignItems: "center", gap: 6}}>
                <Ic p={P.bookOpen} s={14} color={th.prime}/> {isAr ? "القسم" : "Department"}
              </label>
              <select 
                value={form.dept} 
                onChange={e => setForm({...form, dept: e.target.value})}
                disabled={!form.faculty}
                style={{width: "100%", height: 42, background: form.faculty ? th.surface : th.card, border: `1px solid ${errors.dept ? th.red : th.border}`, borderRadius: 10, padding: "0 14px", color: form.dept ? th.text : th.muted, outline: "none", fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, opacity: form.faculty ? 1 : 0.6, transition: "all 0.2s", cursor: form.faculty ? "pointer" : "not-allowed"}}
              >
                <option value="">{isAr ? "اختر القسم..." : "Select Department..."}</option>
                {form.faculty && FACULTIES_DATA[form.faculty].map(d => <option key={d} value={d} style={{background: th.card, color: th.text}}>{d}</option>)}
              </select>
            </div>

          </div>
          {/* Password */}
          <Sep label={t.s3}/>
          <div className="g2" style={{marginBottom:8}}>
            <Field fk="password" label={t.pw} icon={P.lock} ph={t.pwPh} value={form.password} onChange={onChange("password")} error={errors.password} showPass={showPass} onTogglePass={()=>setShowPass(s=>!s)}/>
            <Field fk="confirm" label={t.cpw} icon={P.lock} ph={t.cpwPh} value={form.confirm} onChange={onChange("confirm")} error={errors.confirm} showPass={showPass} onTogglePass={()=>setShowPass(s=>!s)}/>
          </div>

          {globalErr&&(
            <div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:9,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:8}}>
              <Ic p={P.warn} s={13} c="rgba(239,68,68,.85)"/>
              <p style={{fontSize:11.5,color:th.red}}>{globalErr}</p>
            </div>
          )}

          <button className="sub-btn" onClick={submit} disabled={loading}>
            {loading?(
              <><span style={{width:13,height:13,borderRadius:"50%",border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite",display:"inline-block"}}/>{t.submitting}</>
            ):(
              <>{t.submit}<Ic p={P.arrow} s={14} c="#fff"/></>
            )}
          </button>

          <p style={{textAlign:"center",fontSize:12,color:"#344055",marginTop:11}}>
            {t.hasAcc}{" "}
            <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:"#0d9488",fontWeight:700,fontSize:12,padding:0,fontFamily:"'Space Grotesk',sans-serif"}}>
              {t.login}
            </button>
          </p>

        </div>
      </div>
    </div>
  );
}
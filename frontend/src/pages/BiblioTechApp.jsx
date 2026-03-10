import { useState, useEffect, useRef } from "react";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const THEMES={dark:{bg:"#07090f",surface:"#0f1219",card:"#141824",card2:"#1a1f2e",border:"rgba(255,255,255,0.07)",text:"#f0eef9",sub:"#8b9ab0",muted:"#3d4a5c",dim:"#151b28",prime:"#0d9488",primeD:"#0f766e",primeG:"#0d948822",accent:"#6366f1",cyan:"#06b6d4",green:"#22c55e",red:"#ef4444",amber:"#f59e0b",navBg:"rgba(7,9,15,0.95)",gridLine:"rgba(255,255,255,0.014)"},medium:{bg:"#141925",surface:"#1c2233",card:"#232b3e",card2:"#2a3348",border:"rgba(255,255,255,0.09)",text:"#eef0f8",sub:"#8b9ab8",muted:"#4a5568",dim:"#1e2a3a",prime:"#0d9488",primeD:"#0f766e",primeG:"#0d948828",accent:"#818cf8",cyan:"#06b6d4",green:"#22c55e",red:"#ef4444",amber:"#f59e0b",navBg:"rgba(20,25,37,0.95)",gridLine:"rgba(255,255,255,0.018)"},light:{bg:"#f0f4f8",surface:"#ffffff",card:"#ffffff",card2:"#f8fafc",border:"rgba(0,0,0,0.08)",text:"#0f172a",sub:"#475569",muted:"#94a3b8",dim:"#e2e8f0",prime:"#0d9488",primeD:"#0f766e",primeG:"#0d948815",accent:"#6366f1",cyan:"#0891b2",green:"#16a34a",red:"#dc2626",amber:"#d97706",navBg:"rgba(240,244,248,0.95)",gridLine:"rgba(0,0,0,0.025)"}};

const TR={en:{badge:"Smart Library Management System",h1:"Your University",h2:"Library — Reimagined",sub:"Borrow books, track loans, get AI recommendations — all in one place for Benha University.",studentTitle:"Student Portal",studentDesc:"Browse books, borrow, track loans & chat with the AI assistant.",studentBtn:"Enter as Student",adminTitle:"Admin Panel",adminDesc:"Manage books, approve requests & view reports.",adminBtn:"Enter as Admin",dark:"Dark",medium:"Medium",light:"Light",lang:"عربي",back:"← Home",home:"Home",explore:"Explore",library:"My Library",account:"Account",logout:"Logout",search:"Search books…",available:"Available",borrowed:"Borrowed",reserved:"Reserved",comingSoon:"Coming Soon",borrow:"Request to Borrow",reqPending:"Request Pending",reqBorrowed:"Currently Yours",reqRejected:"Re-request",wishlist:"Wishlist",inWishlist:"Saved",addWishlist:"Save",dashboard:"Dashboard",books:"Books",requests:"Borrow Requests",students:"Students",signout:"Sign Out",username:"Username",password:"Password",signin:"Sign In as Admin",welcome:"Welcome Back",loginSub:"Sign in with your library card ID",cardId:"Library Card ID",footer:"© 2026 BiblioTech · Benha University",feat1:"AI Recommendations",feat2:"Borrow Requests",feat3:"Live Announcements",stat1:"Books",stat2:"Students",stat3:"Departments",notifications:"Notifications",markAllRead:"Mark all read",noNotifs:"You're all caught up!",settings:"Settings",email:"Email",dept2:"Department",joined:"Member Since",activeTab:"Active",historyTab:"History",wishlistTab:"Wishlist",activeLoans:"Active Loans",daysLeft:"days left",overdueLbl:"Overdue",dueToday:"Due today!",returnBy:"Return by",totalBorrowed:"Total Borrowed",wishlistCount:"Saved Books",approve:"Approve",reject:"Reject",pending:"Pending",approved:"Approved",rejected:"Rejected",noActiveLoans:"No active loans — borrow a book!",noHistory:"No history yet",noWishlistItems:"Your wishlist is empty",studentDetail:"View Details",close:"Close",reqDate:"Requested",reqSent:"Request sent!",noRequests:"No borrow requests yet",all:"All",themeLabel:"Theme",languageLabel:"Language",accountInfo:"Account Info",markReturned:"Mark Returned",returned:"Returned",overdue:"Overdue",dueDate:"Due Date"},ar:{badge:"نظام إدارة المكتبة الذكي",h1:"مكتبة جامعتك",h2:"بشكل جديد كلياً",sub:"استعر الكتب وتابع القروض واحصل على توصيات ذكية لجامعة بنها.",studentTitle:"بوابة الطالب",studentDesc:"تصفح الكتب والاستعارة ومتابعة القروض والدردشة مع المساعد الذكي.",studentBtn:"دخول كطالب",adminTitle:"لوحة الأدمن",adminDesc:"إدارة الكتب وقبول الطلبات وعرض التقارير.",adminBtn:"دخول كأدمن",dark:"داكن",medium:"متوسط",light:"فاتح",lang:"English",back:"الرئيسية →",home:"الرئيسية",explore:"استكشاف",library:"مكتبتي",account:"حسابي",logout:"خروج",search:"ابحث عن كتاب…",available:"متاح",borrowed:"مستعار",reserved:"محجوز",comingSoon:"قريباً",borrow:"طلب استعارة",reqPending:"طلب قيد الانتظار",reqBorrowed:"محجوز لك",reqRejected:"إعادة الطلب",wishlist:"المفضلة",inWishlist:"محفوظ",addWishlist:"حفظ",dashboard:"لوحة التحكم",books:"الكتب",requests:"طلبات الاستعارة",students:"الطلاب",signout:"تسجيل خروج",username:"اسم المستخدم",password:"كلمة المرور",signin:"دخول كأدمن",welcome:"مرحباً بعودتك",loginSub:"سجل دخولك ببطاقة المكتبة",cardId:"رقم بطاقة المكتبة",footer:"© 2026 بيبليوتك · جامعة بنها",feat1:"توصيات ذكية",feat2:"طلبات الاستعارة",feat3:"إعلانات مباشرة",stat1:"كتاب",stat2:"طالب",stat3:"قسم",notifications:"الإشعارات",markAllRead:"تعيين الكل كمقروء",noNotifs:"لا توجد إشعارات جديدة",settings:"الإعدادات",email:"البريد الإلكتروني",dept2:"القسم",joined:"عضو منذ",activeTab:"نشط",historyTab:"السجل",wishlistTab:"المفضلة",activeLoans:"القروض النشطة",daysLeft:"يوم متبقي",overdueLbl:"متأخر",dueToday:"موعد التسليم اليوم!",returnBy:"التسليم بحلول",totalBorrowed:"إجمالي المستعار",wishlistCount:"كتب محفوظة",approve:"قبول",reject:"رفض",pending:"معلق",approved:"مقبول",rejected:"مرفوض",noActiveLoans:"لا توجد استعارات نشطة",noHistory:"لا يوجد سجل بعد",noWishlistItems:"قائمة المفضلة فارغة",studentDetail:"عرض التفاصيل",close:"إغلاق",reqDate:"تاريخ الطلب",reqSent:"تم إرسال الطلب!",noRequests:"لا توجد طلبات بعد",all:"الكل",themeLabel:"المظهر",languageLabel:"اللغة",accountInfo:"معلومات الحساب",markReturned:"تسجيل إرجاع",returned:"مُعاد",overdue:"متأخر",dueDate:"تاريخ الإرجاع"}};

const BOOKS=[{id:"B001",title:"Calculus: Early Transcendentals",author:"James Stewart",dept:"Engineering",rating:4.8,borrows:134,status:"available",cover:["#1e3a8a","#1e40af"],isNew:false,desc:"The most widely used calculus textbook worldwide, covering limits, derivatives, integrals, and series with stunning clarity."},{id:"B002",title:"Gray's Anatomy",author:"Henry Gray",dept:"Medicine",rating:4.9,borrows:201,status:"available",cover:["#7f1d1d","#991b1b"],isNew:true,desc:"The definitive anatomical reference for medical students, featuring meticulous illustrations and comprehensive coverage."},{id:"B003",title:"Introduction to Algorithms",author:"Cormen et al.",dept:"Computer Science",rating:4.9,borrows:178,status:"available",cover:["#064e3b","#065f46"],isNew:false,desc:"The most comprehensive algorithms textbook — CLRS — covering design, analysis and implementation of fundamental algorithms."},{id:"B004",title:"Organic Chemistry",author:"Paula Y. Bruice",dept:"Pharmacy",rating:4.6,borrows:89,status:"available",cover:["#3b0764","#4c1d95"],isNew:true,desc:"Modern organic chemistry with a strong biological focus, ideal for pharmacy and life science students."},{id:"B005",title:"Principles of Physics",author:"Serway & Jewett",dept:"Science",rating:4.7,borrows:112,status:"reserved",cover:["#0c4a6e","#075985"],isNew:false,desc:"Comprehensive physics textbook covering mechanics, waves, thermodynamics, and electromagnetism with real-world applications."},{id:"B006",title:"Clean Code",author:"Robert C. Martin",dept:"Computer Science",rating:4.8,borrows:156,status:"available",cover:["#0f172a","#1e293b"],isNew:false,desc:"Essential reading for every developer — principles and practices for writing maintainable, readable, and elegant code."},{id:"B007",title:"Macroeconomics",author:"N. Gregory Mankiw",dept:"Commerce",rating:4.7,borrows:143,status:"available",cover:["#052e16","#064e3b"],isNew:true,desc:"The leading macroeconomics textbook, used in universities worldwide. Clear and authoritative coverage of theory and policy."},{id:"B008",title:"World Literature",author:"Various Authors",dept:"Arts",rating:4.3,borrows:42,status:"available",cover:["#500724","#701a75"],isNew:true,desc:"A sweeping anthology of world literature spanning centuries and continents — poetry, fiction, and drama."},{id:"B009",title:"Database Systems",author:"Ramez Elmasri",dept:"Computer Science",rating:4.5,borrows:0,status:"coming_soon",cover:["#1a1a2e","#16213e"],isNew:true,desc:"Comprehensive introduction to database design, the relational model, SQL, and modern database architectures."}];

const ADMIN_STUDENTS=[{id:"STD-001",libId:"LIB-20411",name:"Ahmed Youssef",dept:"Computer Science",email:"ahmed.y@benha.edu.eg",status:"active",joined:"Sep 2024",color:"#6366f1"},{id:"STD-002",libId:"LIB-20022",name:"Sara Hassan",dept:"Medicine",email:"sara.h@benha.edu.eg",status:"active",joined:"Sep 2024",color:"#0d9488"},{id:"STD-003",libId:"LIB-20033",name:"Omar Khalil",dept:"Engineering",email:"omar.k@benha.edu.eg",status:"active",joined:"Feb 2025",color:"#f97316"},{id:"STD-004",libId:"LIB-20044",name:"Nour Ibrahim",dept:"Pharmacy",email:"nour.i@benha.edu.eg",status:"suspended",joined:"Sep 2023",color:"#8b5cf6"}];
const MONTHLY=[{m:"Sep",borrows:58,returns:51},{m:"Oct",borrows:71,returns:65},{m:"Nov",borrows:85,returns:79},{m:"Dec",borrows:63,returns:58},{m:"Jan",borrows:94,returns:87},{m:"Feb",borrows:108,returns:99},{m:"Mar",borrows:124,returns:112}];
const DEPT_STATS=[{dept:"Engineering",books:842,color:"#f97316"},{dept:"Medicine",books:671,color:"#ef4444"},{dept:"CS",books:589,color:"#3b82f6"},{dept:"Pharmacy",books:423,color:"#8b5cf6"},{dept:"Science",books:398,color:"#06b6d4"},{dept:"Commerce",books:312,color:"#22c55e"}];

const LS={get:(k,fb)=>{try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):fb;}catch(e){return fb;}},set:(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}};
const ANN_KEY="bt_ann_v5";const REQ_KEY="bt_req_v5";const DEMO_KEY="bt_demo_v5";
const wlKey=lid=>`bt_wl_v5_${lid}`;const notifKey=lid=>`bt_notif_v5_${lid}`;
const getAnns=()=>LS.get(ANN_KEY,[]);const saveAnns=a=>LS.set(ANN_KEY,a);
const getRequests=()=>LS.get(REQ_KEY,[]);const saveRequests=r=>LS.set(REQ_KEY,r);
const getWishlist=lid=>LS.get(wlKey(lid),[]);const saveWishlist=(lid,wl)=>LS.set(wlKey(lid),wl);
const getNotifs=lid=>LS.get(notifKey(lid),[]);const saveNotifs=(lid,ns)=>LS.set(notifKey(lid),ns);

const fmtD=d=>d.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const isoD=d=>d.toISOString().split("T")[0];
const relD=n=>{const d=new Date();d.setDate(d.getDate()+n);return d;};

const seedDemo=()=>{
  if(LS.get(DEMO_KEY,null))return;
  saveRequests([
    {id:9001,sid:"LIB-20411",sName:"Ahmed Youssef",bid:"B003",bTitle:"Introduction to Algorithms",bAuthor:"Cormen et al.",bCover:["#064e3b","#065f46"],bDept:"Computer Science",reqDate:fmtD(relD(-20)),status:"approved",dueDate:fmtD(relD(3)),dueDateISO:isoD(relD(3)),returnDate:null,approvedDate:fmtD(relD(-20))},
    {id:9002,sid:"LIB-20411",sName:"Ahmed Youssef",bid:"B006",bTitle:"Clean Code",bAuthor:"Robert C. Martin",bCover:["#0f172a","#1e293b"],bDept:"Computer Science",reqDate:fmtD(relD(-5)),status:"approved",dueDate:fmtD(relD(11)),dueDateISO:isoD(relD(11)),returnDate:null,approvedDate:fmtD(relD(-5))},
    {id:9003,sid:"LIB-20411",sName:"Ahmed Youssef",bid:"B001",bTitle:"Calculus: Early Transcendentals",bAuthor:"James Stewart",bCover:["#1e3a8a","#1e40af"],bDept:"Engineering",reqDate:fmtD(relD(-50)),status:"approved",dueDate:fmtD(relD(-36)),dueDateISO:isoD(relD(-36)),returnDate:fmtD(relD(-38)),approvedDate:fmtD(relD(-50))},
    {id:9004,sid:"LIB-20411",sName:"Ahmed Youssef",bid:"B004",bTitle:"Organic Chemistry",bAuthor:"Paula Y. Bruice",bCover:["#3b0764","#4c1d95"],bDept:"Pharmacy",reqDate:fmtD(relD(-2)),status:"pending",dueDate:null,dueDateISO:null,returnDate:null,approvedDate:null},
    {id:9005,sid:"LIB-20411",sName:"Ahmed Youssef",bid:"B005",bTitle:"Principles of Physics",bAuthor:"Serway & Jewett",bCover:["#0c4a6e","#075985"],bDept:"Science",reqDate:fmtD(relD(-15)),status:"rejected",dueDate:null,dueDateISO:null,returnDate:null,approvedDate:null},
    {id:9006,sid:"LIB-20022",sName:"Sara Hassan",bid:"B002",bTitle:"Gray's Anatomy",bAuthor:"Henry Gray",bCover:["#7f1d1d","#991b1b"],bDept:"Medicine",reqDate:fmtD(relD(-8)),status:"pending",dueDate:null,dueDateISO:null,returnDate:null,approvedDate:null},
  ]);
  saveNotifs("LIB-20411",[
    {id:8001,type:"approved",title:"Request Approved",msg:"Your request for \"Introduction to Algorithms\" was approved. Return by "+fmtD(relD(3))+".",bid:"B003",date:fmtD(relD(-20)),read:true},
    {id:8002,type:"approved",title:"Request Approved",msg:"Your request for \"Clean Code\" was approved. Return by "+fmtD(relD(11))+".",bid:"B006",date:fmtD(relD(-5)),read:true},
    {id:8003,type:"rejected",title:"Request Not Approved",msg:"Your request for \"Principles of Physics\" was not approved this time.",bid:"B005",date:fmtD(relD(-13)),read:false},
    {id:8004,type:"due_soon",title:"Book Due Soon",msg:"\"Introduction to Algorithms\" is due in 3 days — please return it on time.",bid:"B003",date:fmtD(new Date()),read:false},
  ]);
  saveWishlist("LIB-20411",["B002","B007"]);
  LS.set(DEMO_KEY,"1");
};

const daysLeft=iso=>{if(!iso)return null;return Math.ceil((new Date(iso+"T23:59:59")-new Date())/864e5);};
const daysColor=(d,th)=>{if(d===null)return th.muted;if(d<=0)return th.red;if(d<=3)return th.red;if(d<=7)return th.amber;return th.green;};
const daysLabel=(d,t)=>{if(d===null)return"";if(d<0)return`${t.overdueLbl} ${Math.abs(d)}d`;if(d===0)return t.dueToday;return`${d} ${t.daysLeft}`;};
const deptColor=d=>({Engineering:"#f97316",Medicine:"#ef4444",Pharmacy:"#8b5cf6",Science:"#06b6d4",Arts:"#ec4899",Law:"#f59e0b",Commerce:"#22c55e","Computer Science":"#3b82f6"}[d]||"#64748b");

const makeCSS=bg=>`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:${bg};}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-thumb{background:#1a2035;border-radius:6px;}input::placeholder,textarea::placeholder{color:#4a5568;}@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}@keyframes floatR{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-10px) rotate(-1deg)}}@keyframes glow{0%,100%{box-shadow:0 0 26px #0d948838}50%{box-shadow:0 0 52px #0d948868}}@keyframes marquee{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}.btn{transition:all .2s ease;cursor:pointer;border:none;background:none;}.btn:hover{filter:brightness(1.08);transform:translateY(-1px);}.btn:active{transform:scale(.97);}.rh:hover{background:rgba(255,255,255,0.028)!important;}`;

const Ic=({p,s=18,color="currentColor",fill=false})=>(<svg width={s} height={s} viewBox="0 0 24 24" fill={fill?color:"none"} stroke={fill?"none":color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{display:"block",flexShrink:0}}>{(Array.isArray(p)?p:[p]).map((d,i)=><path key={i} d={d}/>)}</svg>);
const P={bookOpen:["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z","M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],book:["M4 19.5A2.5 2.5 0 0 1 6.5 17H20","M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"],student:["M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2","M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],shield:["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"],home:["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],explore:["M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4z","M8 2v16","M16 6v16"],lib:["M3 3h7v7H3z","M14 3h7v7h-7z","M14 14h7v7h-7z","M3 14h7v7H3z"],logout:["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4","M16 17l5-5-5-5","M21 12H9"],search:"M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0",star:"M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",back:["M19 12H5","M12 5l-7 7 7 7"],chevL:"M15 18l-6-6 6-6",chevR:"M9 6l6 6-6 6",lock:["M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2z","M7 11V7a5 5 0 0 1 10 0v4"],id:["M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z","M16 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"],send:["M22 2L11 13","M22 2L15 22l-4-9-9-4 22-7z"],bot:["M12 2a2 2 0 0 1 2 2v1h4v14H6V5h4V4a2 2 0 0 1 2-2z","M9 12h.01","M15 12h.01","M9 16s1 1 3 1 3-1 3-1"],check:["M22 11.08V12a10 10 0 1 1-5.93-9.14","M22 4L12 14.01l-3-3"],checkO:["M9 12l2 2 4-4","M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"],xO:["M15 9l-6 6M9 9l6 6","M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"],spark:"M13 2L3 14h9l-1 8 10-12h-9l1-8z",globe:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M2 12h20","M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"],sun:["M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z","M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"],moon:"M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",plus:"M12 5v14M5 12h14",dash:["M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z","M9 22V12h6v10"],alert:["M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z","M12 9v4","M12 17h.01"],megaphone:["M3 11l19-9-9 19-2-8-8-2z"],heart:"M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",arrowR:"M5 12h14M12 5l7 7-7 7",clock:["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z","M12 6v6l4 2"],trash:["M3 6h18","M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"],bell:["M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9","M13.73 21a2 2 0 0 1-3.46 0"],settings:["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],email:["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],user:["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2","M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],calendar:["M8 2v4","M16 2v4","M3 10h18","M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"]};

function Cover({colors,h=180,children}){const[c1,c2]=colors;return(<div style={{width:"100%",height:h,position:"relative",overflow:"hidden",background:`linear-gradient(155deg,${c1} 0%,${c2} 55%,#040608 100%)`,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{position:"absolute",left:"16%",top:0,bottom:0,width:2,background:"rgba(255,255,255,0.055)"}}/>{[18,34,50,66,82].map((top,i)=><div key={i} style={{position:"absolute",left:"20%",right:"8%",top:`${top}%`,height:1,background:`rgba(255,255,255,${0.02+i*0.004})`}}/>)}<div style={{color:"rgba(255,255,255,0.14)"}}><Ic p={P.bookOpen} s={h>200?58:32}/></div>{children}</div>);}

function CtrlBar({th,t,tn,setTn,lang,setLang,isAr,onBack}){return(<div style={{display:"flex",alignItems:"center",gap:7,flexDirection:isAr?"row-reverse":"row"}}>{onBack&&<button onClick={onBack} className="btn" style={{display:"flex",alignItems:"center",gap:5,border:`1px solid ${th.border}`,borderRadius:9,padding:"6px 12px",color:th.sub,fontSize:11,fontFamily:"'Space Grotesk',sans-serif",background:th.surface,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.back} s={13}/>{t.back}</button>}<div style={{display:"flex",background:th.surface,border:`1px solid ${th.border}`,borderRadius:9,overflow:"hidden"}}>{[["dark",P.moon],["medium",null],["light",P.sun]].map(([name,icon])=>(<button key={name} onClick={()=>setTn(name)} className="btn" style={{padding:"6px 9px",fontSize:10,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif",color:tn===name?th.prime:th.muted,background:tn===name?th.prime+"18":"transparent",display:"flex",alignItems:"center",gap:3}}>{icon&&<Ic p={icon} s={10}/>}{t[name]}</button>))}</div><button onClick={()=>setLang(l=>l==="en"?"ar":"en")} className="btn" style={{display:"flex",alignItems:"center",gap:5,background:th.surface,border:`1px solid ${th.border}`,borderRadius:9,padding:"6px 11px",color:th.sub,fontSize:11,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}><Ic p={P.globe} s={12}/>{t.lang}</button></div>);}

function FloatBook({colors,top,left,right,delay,flip=false}){const[c1,c2]=colors;return(<div style={{position:"absolute",top,left,right,width:68,height:94,borderRadius:10,background:`linear-gradient(145deg,${c1},${c2}99)`,border:"1px solid rgba(255,255,255,0.07)",boxShadow:`0 10px 28px ${c1}44`,animation:`${flip?"floatR":"float"} ${3.5+delay*0.4}s ${delay}s ease-in-out infinite`,display:"flex",alignItems:"center",justifyContent:"center",opacity:0.65,pointerEvents:"none",zIndex:0}}><div style={{position:"absolute",left:"17%",top:0,bottom:0,width:1.5,background:"rgba(255,255,255,0.06)"}}/><div style={{color:"rgba(255,255,255,0.14)"}}><Ic p={P.bookOpen} s={22}/></div></div>);}

function PortalCard({th,title,desc,btn,accent,icon,onClick,isAr}){const[hov,setHov]=useState(false);return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick} style={{background:hov?th.card2||th.card:th.surface,border:`1px solid ${hov?accent+"66":th.border}`,borderRadius:20,padding:"26px 24px",cursor:"pointer",boxShadow:hov?`0 20px 50px ${accent}22`:"0 3px 14px rgba(0,0,0,0.12)",transform:hov?"translateY(-10px) scale(1.02)":"translateY(0)",transition:"all 0.35s cubic-bezier(0.34,1.2,0.64,1)",position:"relative",overflow:"hidden",direction:isAr?"rtl":"ltr"}}><div style={{position:"absolute",top:-34,right:-34,width:120,height:120,borderRadius:"50%",background:`${accent}10`,filter:"blur(22px)",pointerEvents:"none",opacity:hov?1:0.35,transition:"opacity 0.3s"}}/><div style={{width:48,height:48,borderRadius:14,marginBottom:16,background:`${accent}20`,border:`1px solid ${accent}44`,display:"flex",alignItems:"center",justifyContent:"center",color:accent}}><Ic p={icon} s={22}/></div><h2 style={{fontSize:18,fontWeight:700,color:th.text,marginBottom:8,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.01em"}}>{title}</h2><p style={{fontSize:12,color:th.sub,lineHeight:1.7,marginBottom:20,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{desc}</p><div style={{background:`linear-gradient(135deg,${accent},${accent}cc)`,borderRadius:10,padding:"9px 16px",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"inline-flex",alignItems:"center",gap:6,flexDirection:isAr?"row-reverse":"row"}}>{btn}<Ic p={P.arrowR} s={12}/></div></div>);}

function BookCard({bk,th,sc,onClick,wishlist,onToggleWishlist,studentReqStatus}){
  const[hov,setHov]=useState(false);
  const s=sc(bk.status);const dc=deptColor(bk.dept);
  const inWl=wishlist?wishlist.includes(bk.id):false;
  const sst=studentReqStatus?studentReqStatus(bk.id):null;
  return(<div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={onClick} style={{background:hov?th.card2||th.card:th.card,borderRadius:13,overflow:"hidden",border:`1px solid ${hov?dc+"55":th.border}`,cursor:"pointer",boxShadow:hov?`0 14px 36px ${dc}22`:"0 2px 8px rgba(0,0,0,0.25)",transform:hov?"translateY(-5px) scale(1.02)":"translateY(0)",transition:"all 0.3s cubic-bezier(0.34,1.2,0.64,1)"}}>
    <Cover colors={bk.cover} h={152}>
      <div style={{position:"absolute",top:7,left:7,background:s.c+"22",color:s.c,border:`1px solid ${s.c}44`,fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase"}}>{s.label}</div>
      {bk.isNew&&<div style={{position:"absolute",top:7,right:onToggleWishlist?32:7,background:th.prime,color:"#fff",fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>NEW</div>}
      {onToggleWishlist&&<button onClick={e=>{e.stopPropagation();onToggleWishlist(bk.id);}} className="btn" style={{position:"absolute",top:5,right:5,width:26,height:26,borderRadius:8,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic p={P.heart} s={12} fill={inWl} color={inWl?th.red:"rgba(255,255,255,0.8)"}/></button>}
      {sst==="approved"&&<div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",background:th.green+"ee",color:"#fff",fontSize:8,fontWeight:700,padding:"2px 9px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",whiteSpace:"nowrap"}}>✓ Yours</div>}
      {sst==="pending"&&<div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",background:th.amber+"ee",color:"#fff",fontSize:8,fontWeight:700,padding:"2px 9px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",whiteSpace:"nowrap"}}>⏳ Pending</div>}
    </Cover>
    <div style={{padding:"11px 13px 13px"}}>
      <p style={{fontSize:12,fontWeight:700,color:th.text,lineHeight:1.4,marginBottom:3,fontFamily:"'Space Grotesk',sans-serif",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{bk.title}</p>
      <p style={{fontSize:11,color:th.sub,marginBottom:8,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{bk.author}</p>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontSize:11,color:th.amber,display:"flex",alignItems:"center",gap:3,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}><Ic p={P.star} s={10} fill color={th.amber}/>{bk.rating}</span>
        <span style={{fontSize:10,color:th.muted}}>{bk.borrows>0?`${bk.borrows}`:"New"}</span>
      </div>
    </div>
  </div>);
}

function NotifBell({th,t,isAr,notifs,onMarkAll,onMarkOne}){
  const[open,setOpen]=useState(false);const ref=useRef(null);
  const unread=notifs.filter(n=>!n.read).length;
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[]);
  const nIcon=type=>type==="approved"?P.checkO:type==="rejected"?P.xO:type==="due_soon"?P.clock:P.alert;
  const nColor=(type,th)=>type==="approved"?th.green:type==="rejected"?th.red:type==="due_soon"?th.amber:th.red;
  return(<div style={{position:"relative"}} ref={ref}>
    <button onClick={()=>setOpen(o=>!o)} className="btn" style={{width:36,height:36,borderRadius:10,background:open?th.prime+"20":th.surface,border:`1px solid ${open?th.prime+"44":th.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:open?th.prime:th.sub,position:"relative"}}>
      <Ic p={P.bell} s={15}/>
      {unread>0&&<div style={{position:"absolute",top:5,right:5,width:8,height:8,borderRadius:"50%",background:th.red,border:`2px solid ${th.navBg}`,animation:"blink 2s ease infinite"}}/>}
    </button>
    {open&&<div style={{position:"absolute",top:44,right:isAr?"auto":0,left:isAr?0:"auto",width:320,background:th.surface,border:`1px solid ${th.border}`,borderRadius:16,boxShadow:`0 20px 50px rgba(0,0,0,0.5)`,zIndex:9999,animation:"scaleIn 0.2s ease",transformOrigin:isAr?"top left":"top right",overflow:"hidden"}}>
      <div style={{padding:"13px 16px 10px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexDirection:isAr?"row-reverse":"row"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,flexDirection:isAr?"row-reverse":"row"}}><span style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{t.notifications}</span>{unread>0&&<span style={{fontSize:10,fontWeight:700,background:th.red,color:"#fff",borderRadius:20,padding:"1px 7px"}}>{unread}</span>}</div>
        {unread>0&&<button onClick={onMarkAll} className="btn" style={{fontSize:10,color:th.prime,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>{t.markAllRead}</button>}
      </div>
      <div style={{maxHeight:300,overflowY:"auto"}}>
        {notifs.length===0
          ?<div style={{padding:"24px",textAlign:"center"}}><div style={{color:th.muted,display:"flex",justifyContent:"center",marginBottom:8}}><Ic p={P.bell} s={28}/></div><p style={{fontSize:12,color:th.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.noNotifs}</p></div>
          :notifs.slice(0,15).map(n=>(<div key={n.id} onClick={()=>onMarkOne(n.id)} className="rh" style={{padding:"11px 16px",borderBottom:`1px solid ${th.border}`,display:"flex",gap:10,cursor:"pointer",background:n.read?"transparent":th.prime+"09",flexDirection:isAr?"row-reverse":"row"}}>
            <div style={{width:29,height:29,borderRadius:8,background:nColor(n.type,th)+"18",display:"flex",alignItems:"center",justifyContent:"center",color:nColor(n.type,th),flexShrink:0,marginTop:1}}><Ic p={nIcon(n.type)} s={13}/></div>
            <div style={{flex:1,minWidth:0,textAlign:isAr?"right":"left"}}>
              <p style={{fontSize:11,fontWeight:n.read?500:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:2}}>{n.title}</p>
              <p style={{fontSize:11,color:th.sub,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{n.msg}</p>
              <p style={{fontSize:10,color:th.muted,marginTop:3}}>{n.date}</p>
            </div>
            {!n.read&&<div style={{width:6,height:6,borderRadius:"50%",background:th.prime,flexShrink:0,marginTop:5}}/>}
          </div>))
        }
      </div>
    </div>}
  </div>);}

function StudentDetailModal({th,t,isAr,student,allReqs,onClose}){
  const[tab,setTab]=useState("active");
  const myReqs=allReqs.filter(r=>r.sid===student.libId);
  const active=myReqs.filter(r=>r.status==="approved"&&!r.returnDate);
  const pending=myReqs.filter(r=>r.status==="pending");
  const history=myReqs.filter(r=>r.returnDate||r.status==="rejected");
  const susp=student.status==="suspended";
  const tabs=[[t.activeTab,active.length,"active"],[t.pending,pending.length,"pending"],[t.historyTab,history.length,"history"]];
  const rows=tab==="active"?active:tab==="pending"?pending:history;
  return(<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(10px)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
    <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:22,width:"100%",maxWidth:560,maxHeight:"88vh",overflow:"hidden",display:"flex",flexDirection:"column",animation:"scaleIn 0.25s ease"}} onClick={e=>e.stopPropagation()}>
      <div style={{padding:"20px 22px 16px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",gap:14,flexDirection:isAr?"row-reverse":"row"}}>
        <div style={{width:52,height:52,borderRadius:15,background:`${student.color}22`,border:`2px solid ${student.color}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:student.color,fontFamily:"'Space Grotesk',sans-serif",flexShrink:0}}>{student.name[0]}</div>
        <div style={{flex:1,textAlign:isAr?"right":"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3,flexDirection:isAr?"row-reverse":"row"}}>
            <h2 style={{fontSize:16,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{student.name}</h2>
            <span style={{fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,background:susp?th.red+"18":th.green+"18",color:susp?th.red:th.green,border:`1px solid ${susp?th.red:th.green}44`,textTransform:"capitalize",fontFamily:"'Space Grotesk',sans-serif"}}>{student.status}</span>
          </div>
          <p style={{fontSize:11,color:th.sub}}>{student.libId} · {student.dept}</p>
          <p style={{fontSize:11,color:th.muted,marginTop:1}}>{student.email} · {t.joined}: {student.joined}</p>
        </div>
        <button onClick={onClose} className="btn" style={{width:30,height:30,borderRadius:8,border:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"center",color:th.muted,flexShrink:0}}><Ic p={P.xO} s={14}/></button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",borderBottom:`1px solid ${th.border}`}}>
        {[[String(active.length),t.activeLoans,th.prime],[String(pending.length),t.pending,th.amber],[String(history.filter(r=>r.returnDate).length),t.totalBorrowed||"Total Read",th.cyan]].map(([v,l,c],i)=>(
          <div key={i} style={{padding:"12px 14px",textAlign:"center",borderRight:i<2?`1px solid ${th.border}`:"none"}}><p style={{fontSize:19,fontWeight:700,color:c,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</p><p style={{fontSize:10,color:th.sub}}>{l}</p></div>
        ))}
      </div>
      <div style={{display:"flex",borderBottom:`1px solid ${th.border}`}}>
        {tabs.map(([lbl,cnt,id])=>(<button key={id} onClick={()=>setTab(id)} className="btn" style={{flex:1,padding:"10px 8px",fontSize:11,fontWeight:tab===id?700:400,color:tab===id?th.prime:th.sub,borderBottom:`2px solid ${tab===id?th.prime:"transparent"}`,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
          {lbl}{cnt>0&&<span style={{fontSize:9,fontWeight:700,background:tab===id?th.prime+"22":th.muted+"33",color:tab===id?th.prime:th.sub,borderRadius:20,padding:"1px 5px"}}>{cnt}</span>}
        </button>))}
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"14px"}}>
        {rows.length===0
          ?<p style={{textAlign:"center",color:th.muted,padding:"28px",fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{tab==="active"?t.noActiveLoans:tab==="pending"?t.noRequests:t.noHistory}</p>
          :rows.map((r,i)=>{
            const days=daysLeft(r.dueDateISO);
            const c=r.status==="rejected"?th.red:r.status==="pending"?th.amber:r.returnDate?th.cyan:daysColor(days,th);
            const lbl=r.status==="rejected"?t.rejected:r.status==="pending"?t.pending:r.returnDate?t.returned:"Active";
            return(<div key={r.id} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:11,padding:"12px 14px",marginBottom:9,display:"flex",alignItems:"center",gap:12,animation:`fadeUp 0.3s ${i*40}ms ease both`,flexDirection:isAr?"row-reverse":"row"}}>
              <div style={{width:36,height:50,borderRadius:7,overflow:"hidden",flexShrink:0}}><Cover colors={r.bCover} h={50}/></div>
              <div style={{flex:1,minWidth:0,textAlign:isAr?"right":"left"}}>
                <p style={{fontSize:12,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.bTitle}</p>
                <p style={{fontSize:10,color:th.sub,marginTop:2}}>{r.bAuthor}</p>
                <p style={{fontSize:10,color:th.muted,marginTop:2}}>{r.returnDate?`${t.returned}: ${r.returnDate}`:r.dueDate?`${t.returnBy}: ${r.dueDate}`:`${t.reqDate}: ${r.reqDate}`}</p>
              </div>
              <div style={{textAlign:"center",flexShrink:0}}>
                {tab==="active"&&days!==null
                  ?<><p style={{fontSize:16,fontWeight:700,color:daysColor(days,th),fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{Math.abs(days)}</p><p style={{fontSize:9,color:daysColor(days,th),marginTop:2}}>{days<0?"overdue":"days"}</p></>
                  :<span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,background:`${c}18`,color:c,border:`1px solid ${c}44`,fontFamily:"'Space Grotesk',sans-serif"}}>{lbl}</span>
                }
              </div>
            </div>);
          })
        }
      </div>
    </div>
  </div>);}

function Landing({th,t,tn,setTn,lang,setLang,isAr,onStudent,onAdmin}){
  return(<div style={{minHeight:"100vh",background:th.bg,color:th.text,fontFamily:"'Plus Jakarta Sans',sans-serif",position:"relative",overflow:"hidden",direction:isAr?"rtl":"ltr",transition:"background 0.4s,color 0.4s"}}>
    <div style={{position:"absolute",top:"-18%",left:"-12%",width:560,height:560,borderRadius:"50%",background:`radial-gradient(circle,${th.prime}16,transparent 70%)`,filter:"blur(60px)",pointerEvents:"none",zIndex:0}}/>
    <div style={{position:"absolute",bottom:"-18%",right:"-12%",width:460,height:460,borderRadius:"50%",background:`radial-gradient(circle,${th.accent}12,transparent 70%)`,filter:"blur(60px)",pointerEvents:"none",zIndex:0}}/>
    <div style={{position:"absolute",inset:0,pointerEvents:"none",zIndex:0,backgroundImage:`linear-gradient(${th.gridLine} 1px,transparent 1px),linear-gradient(90deg,${th.gridLine} 1px,transparent 1px)`,backgroundSize:"60px 60px"}}/>
    <nav style={{position:"sticky",top:0,zIndex:50,padding:"16px 36px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${th.border}`,background:th.navBg,backdropFilter:"blur(20px)",flexDirection:isAr?"row-reverse":"row"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:36,height:36,borderRadius:11,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Ic p={P.bookOpen} s={18}/></div><span style={{fontSize:20,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",color:th.text}}>Biblio<span style={{color:th.prime}}>Tech</span></span></div>
      <CtrlBar th={th} t={t} tn={tn} setTn={setTn} lang={lang} setLang={setLang} isAr={isAr}/>
    </nav>
    <main style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"56px 36px 40px",position:"relative",zIndex:1}}>
      <div style={{position:"absolute",left:36,top:"4%",pointerEvents:"none",zIndex:0}}>
        <FloatBook colors={["#1e3a8a","#1e40af"]} top={0} left={0} delay={0}/><FloatBook colors={["#064e3b","#065f46"]} top={112} left={38} delay={0.8} flip/><FloatBook colors={["#3b0764","#4c1d95"]} top={228} left={0} delay={0.4}/>
      </div>
      <div style={{position:"absolute",right:36,top:"4%",pointerEvents:"none",zIndex:0}}>
        <FloatBook colors={["#7f1d1d","#991b1b"]} top={0} left={0} delay={0.6} flip/><FloatBook colors={["#0c4a6e","#075985"]} top={122} left={-20} delay={0.2}/><FloatBook colors={["#78350f","#92400e"]} top={242} left={5} delay={1} flip/>
      </div>
      <div style={{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",width:"100%"}}>
        <div style={{display:"flex",alignItems:"center",gap:7,background:`${th.prime}14`,border:`1px solid ${th.prime}44`,borderRadius:28,padding:"6px 16px",marginBottom:26,animation:"fadeUp 0.5s ease both",flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.spark} s={13} color={th.prime}/><span style={{fontSize:12,color:th.prime,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>{t.badge}</span></div>
        <h1 style={{fontSize:"clamp(36px,5.5vw,56px)",fontWeight:800,textAlign:"center",fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.04em",lineHeight:1.08,marginBottom:16,animation:"fadeUp 0.55s 100ms ease both",maxWidth:660,color:th.text}}>{t.h1}<br/><span style={{backgroundImage:`linear-gradient(135deg,${th.prime},#14b8a6,${th.accent})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text",display:"inline-block"}}>{t.h2}</span></h1>
        <p style={{fontSize:15,color:th.sub,textAlign:"center",lineHeight:1.75,maxWidth:460,marginBottom:40,fontFamily:"'Plus Jakarta Sans',sans-serif",animation:"fadeUp 0.55s 180ms ease both"}}>{t.sub}</p>
        <div style={{display:"flex",gap:16,marginBottom:40,animation:"fadeUp 0.55s 240ms ease both",flexDirection:isAr?"row-reverse":"row"}}>
          {[["4,821",t.stat1],["1,247",t.stat2],["12",t.stat3]].map(([v,l])=>(<div key={l} style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:14,padding:"12px 22px",textAlign:"center"}}><p style={{fontSize:22,fontWeight:700,color:th.prime,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>{v}</p><p style={{fontSize:11,color:th.muted,marginTop:3}}>{l}</p></div>))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,width:"100%",maxWidth:640,animation:"fadeUp 0.6s 300ms ease both"}}>
          <PortalCard th={th} title={t.studentTitle} desc={t.studentDesc} btn={t.studentBtn} accent={th.prime} icon={P.student} onClick={onStudent} isAr={isAr}/>
          <PortalCard th={th} title={t.adminTitle} desc={t.adminDesc} btn={t.adminBtn} accent={th.accent} icon={P.shield} onClick={onAdmin} isAr={isAr}/>
        </div>
        <div style={{display:"flex",gap:9,marginTop:32,flexWrap:"wrap",justifyContent:"center",animation:"fadeUp 0.6s 400ms ease both",flexDirection:isAr?"row-reverse":"row"}}>
          {[t.feat1,t.feat2,t.feat3].map((f,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:6,background:th.surface,border:`1px solid ${th.border}`,borderRadius:20,padding:"6px 14px",fontSize:12,color:th.sub,fontFamily:"'Plus Jakarta Sans',sans-serif",flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.check} s={11} color={th.prime}/>{f}</div>))}
        </div>
      </div>
    </main>
    <footer style={{position:"relative",zIndex:1,borderTop:`1px solid ${th.border}`,padding:"16px 36px",display:"flex",justifyContent:"center"}}><p style={{fontSize:11,color:th.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.footer}</p></footer>
  </div>);}

function BookDetail({th,t,isAr,book,sc,wishlist,toggleWishlist,studentReqStatus,requests,sendBorrowRequest,reqFlash,onBack,daysLeft,daysColor}){
  const s=sc(book.status);const dc=deptColor(book.dept);
  const sst=studentReqStatus(book.id);
  const inWl=wishlist.includes(book.id);
  const activeReq=requests.find(r=>r.bid===book.id&&r.status==="approved"&&!r.returnDate);
  const days=activeReq?daysLeft(activeReq.dueDateISO):null;
  const justFlashed=reqFlash===book.id;
  const btnLabel=sst==="approved"?t.reqBorrowed:sst==="pending"?t.reqPending:justFlashed?`✓ ${t.reqSent}`:t.borrow;
  const btnDisabled=sst==="approved"||sst==="pending"||book.status==="coming_soon";
  return(
    <div style={{padding:"24px",maxWidth:820,margin:"0 auto",animation:"fadeIn 0.4s ease"}}>
      <button onClick={onBack} className="btn" style={{display:"flex",alignItems:"center",gap:7,border:`1px solid ${th.border}`,borderRadius:9,padding:"7px 13px",color:th.sub,fontSize:12,marginBottom:20,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.back} s={13}/>{isAr?"رجوع":"Back"}</button>
      <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:28}}>
        <div>
          <div style={{borderRadius:14,overflow:"hidden",border:`2px solid ${dc}44`,boxShadow:`0 18px 48px ${book.cover[1]}40`,animation:"float 4s ease infinite"}}><Cover colors={book.cover} h={320}/></div>
          {days!==null&&<div style={{marginTop:12,background:daysColor(days,th)+"18",border:`1px solid ${daysColor(days,th)}44`,borderRadius:11,padding:"10px 14px",textAlign:"center"}}>
            <p style={{fontSize:22,fontWeight:700,color:daysColor(days,th),fontFamily:"'Space Grotesk',sans-serif"}}>{Math.abs(days)}</p>
            <p style={{fontSize:11,color:daysColor(days,th),fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{days<0?t.overdueLbl:days===0?t.dueToday:t.daysLeft}</p>
            {activeReq&&<p style={{fontSize:10,color:th.muted,marginTop:4}}>{t.returnBy}: {activeReq.dueDate}</p>}
          </div>}
        </div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexDirection:isAr?"row-reverse":"row"}}>
            <span style={{background:dc+"22",color:dc,border:`1px solid ${dc}44`,fontSize:11,fontWeight:600,padding:"3px 11px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>{book.dept}</span>
            <span style={{background:s.c+"18",color:s.c,border:`1px solid ${s.c}44`,fontSize:11,fontWeight:600,padding:"3px 11px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{s.label}</span>
            {book.isNew&&<span style={{background:th.prime+"18",color:th.prime,border:`1px solid ${th.prime}44`,fontSize:11,fontWeight:700,padding:"3px 11px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>NEW</span>}
          </div>
          <h1 style={{fontSize:23,fontWeight:700,color:th.text,lineHeight:1.25,marginBottom:7,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>{book.title}</h1>
          <p style={{fontSize:13,color:th.sub,marginBottom:6}}>{isAr?"بقلم":"by"} <strong style={{color:th.text}}>{book.author}</strong></p>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexDirection:isAr?"row-reverse":"row"}}>
            <span style={{display:"flex",alignItems:"center",gap:4,color:th.amber,fontSize:13,fontWeight:600}}><Ic p={P.star} s={13} fill color={th.amber}/>{book.rating}</span>
            <span style={{fontSize:12,color:th.muted}}>{book.borrows>0?`${book.borrows} borrows`:"New arrival"}</span>
          </div>
          <p style={{fontSize:13,color:th.sub,lineHeight:1.8,marginBottom:24,background:th.surface,border:`1px solid ${th.border}`,borderRadius:11,padding:"14px 16px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{book.desc}</p>
          <div style={{display:"flex",gap:10,flexDirection:isAr?"row-reverse":"row"}}>
            <button onClick={()=>{if(!btnDisabled)sendBorrowRequest(book);}} className="btn" disabled={btnDisabled} style={{flex:2,background:btnDisabled?(justFlashed?th.green+"44":th.dim):justFlashed?th.green:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:11,padding:"13px",color:btnDisabled&&!justFlashed?"#777":"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",cursor:btnDisabled&&!justFlashed?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all 0.3s"}}><Ic p={P.bookOpen} s={14}/>{btnLabel}</button>
            <button onClick={()=>toggleWishlist(book.id)} className="btn" style={{flex:1,background:inWl?th.red+"15":th.surface,border:`1px solid ${inWl?th.red+"44":th.border}`,borderRadius:11,padding:"13px",color:inWl?th.red:th.sub,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6,flexDirection:isAr?"row-reverse":"row"}}>
              <Ic p={P.heart} s={13} fill={inWl} color={inWl?th.red:th.sub}/>{inWl?t.inWishlist:t.addWishlist}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEPTS=["All","Computer Science","Engineering","Medicine","Pharmacy","Science","Commerce","Arts"];
const DEPT_ICONS={"All":P.explore,"Computer Science":P.lib,"Engineering":P.spark,"Medicine":P.heart,"Pharmacy":P.check,"Science":P.star,"Commerce":P.arrowR,"Arts":P.bookOpen};

function ExplorePage({th,t,isAr,searchQ,setSearchQ,exploreFilter,setExploreFilter,sc,wishlist,toggleWishlist,studentReqStatus,onBook}){
  const filtered=BOOKS.filter(b=>{
    const matchDept=exploreFilter==="All"||b.dept===exploreFilter;
    const matchQ=!searchQ||b.title.toLowerCase().includes(searchQ.toLowerCase())||b.author.toLowerCase().includes(searchQ.toLowerCase())||b.dept.toLowerCase().includes(searchQ.toLowerCase());
    return matchDept&&matchQ;
  });
  return(
    <div style={{display:"flex",minHeight:"calc(100vh - 62px)"}}>
      <aside style={{width:188,flexShrink:0,background:th.surface,borderRight:isAr?"none":`1px solid ${th.border}`,borderLeft:isAr?`1px solid ${th.border}`:"none",padding:"16px 8px",display:"flex",flexDirection:"column",gap:2}}>
        <p style={{fontSize:9,fontWeight:700,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase",padding:"0 8px",marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"الأقسام":"Categories"}</p>
        {DEPTS.map(d=>{
          const cnt=d==="All"?BOOKS.length:BOOKS.filter(b=>b.dept===d).length;
          const isActive=exploreFilter===d;
          const dc=d==="All"?th.prime:deptColor(d);
          return(
            <button key={d} onClick={()=>setExploreFilter(d)} className="btn" style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 10px",borderRadius:10,background:isActive?dc+"18":"transparent",border:`1px solid ${isActive?dc+"55":"transparent"}`,color:isActive?dc:th.sub,fontSize:12,fontWeight:isActive?700:400,fontFamily:"'Space Grotesk',sans-serif",transition:"all 0.18s",flexDirection:isAr?"row-reverse":"row"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:isAr?"row-reverse":"row"}}>
                <div style={{width:26,height:26,borderRadius:8,background:isActive?dc+"22":th.card,display:"flex",alignItems:"center",justifyContent:"center",color:isActive?dc:th.muted,flexShrink:0}}><Ic p={DEPT_ICONS[d]||P.book} s={12}/></div>
                <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:88}}>{d==="All"?(isAr?"الكل":d):d}</span>
              </div>
              <span style={{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:20,background:isActive?dc+"22":th.card,color:isActive?dc:th.muted,flexShrink:0}}>{cnt}</span>
            </button>
          );
        })}
        <div style={{marginTop:"auto",paddingTop:16,borderTop:`1px solid ${th.border}`}}>
          <p style={{fontSize:10,color:th.muted,padding:"0 8px",fontFamily:"'Plus Jakarta Sans',sans-serif",lineHeight:1.5}}>{isAr?`${BOOKS.length} كتاب في المجموعة`:`${BOOKS.length} books in collection`}</p>
        </div>
      </aside>
      <div style={{flex:1,padding:"22px",overflowY:"auto"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexDirection:isAr?"row-reverse":"row"}}>
          <div style={{width:4,height:22,borderRadius:4,background:`linear-gradient(180deg,${th.cyan},${th.cyan}88)`}}/>
          <h2 style={{fontSize:18,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{exploreFilter==="All"?t.explore:exploreFilter}</h2>
          <span style={{fontSize:11,color:th.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{filtered.length} {isAr?"كتاب":"books"}</span>
        </div>
        <div style={{position:"relative",marginBottom:16}}>
          <div style={{position:"absolute",left:isAr?"auto":12,right:isAr?12:"auto",top:"50%",transform:"translateY(-50%)",color:th.muted}}><Ic p={P.search} s={14}/></div>
          <input value={searchQ} onChange={e=>setSearchQ(e.target.value)} placeholder={t.search} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:11,padding:isAr?"10px 37px 10px 13px":"10px 13px 10px 37px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/>
        </div>
        {filtered.length===0
          ?<div style={{textAlign:"center",padding:"48px 0"}}><div style={{color:th.muted,display:"flex",justifyContent:"center",marginBottom:12}}><Ic p={P.search} s={36}/></div><p style={{color:th.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{isAr?"لم يتم العثور على كتب":"No books found"}</p></div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:13}}>
            {filtered.map(bk=>(<BookCard key={bk.id} bk={bk} th={th} sc={sc} onClick={()=>onBook(bk)} wishlist={wishlist} onToggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus}/>))}
          </div>
        }
      </div>
    </div>
  );
}

function StudentPortal({th,t,isAr,tn,setTn,lang,setLang,onBack}){
  const[user,setUser]=useState(null);
  const[page,setPage]=useState("home");
  const[book,setBook]=useState(null);
  const[libTab,setLibTab]=useState("active");
  const[chatOpen,setChatOpen]=useState(false);
  const[msgs,setMsgs]=useState([{role:"ai",text:"Hello! Ask me anything about our library collection."}]);
  const[chatInput,setChatInput]=useState("");
  const[anns,setAnns]=useState([]);
  const[requests,setRequests]=useState([]);
  const[wishlist,setWishlist]=useState([]);
  const[notifs,setNotifs]=useState([]);
  const[searchQ,setSearchQ]=useState("");const[exploreFilter,setExploreFilter]=useState("All");
  const[reqFlash,setReqFlash]=useState(null);
  const chatRef=useRef(null);
  const FEAT=[BOOKS[1],BOOKS[3],BOOKS[0],BOOKS[5],BOOKS[2],BOOKS[6]];
  const[si,setSi]=useState(2);

  useEffect(()=>{const i=setInterval(()=>setSi(a=>(a+1)%FEAT.length),4000);return()=>clearInterval(i);},[]);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollIntoView({behavior:"smooth"});},[msgs]);

  useEffect(()=>{
    if(!user)return;
    setAnns(getAnns());
    const r=getRequests().filter(x=>x.sid===user.libId);setRequests(r);
    setWishlist(getWishlist(user.libId));
    setNotifs(getNotifs(user.libId));
  },[user]);

  const sc=s=>({available:{label:t.available,c:th.green},borrowed:{label:t.borrowed,c:th.red},reserved:{label:t.reserved,c:th.amber},coming_soon:{label:t.comingSoon,c:th.cyan}}[s]||{label:s,c:th.muted});

  const studentReqStatus=bid=>{const r=requests.find(x=>x.bid===bid&&x.status!=="rejected");return r?r.status:null;};

  const sendBorrowRequest=bk=>{
    if(!user)return;
    const existing=requests.find(r=>r.bid===bk.id&&r.status!=="rejected");
    if(existing)return;
    const newReq={id:Date.now(),sid:user.libId,sName:user.name,bid:bk.id,bTitle:bk.title,bAuthor:bk.author,bCover:bk.cover,bDept:bk.dept,reqDate:fmtD(new Date()),status:"pending",dueDate:null,dueDateISO:null,returnDate:null,approvedDate:null};
    const all=getRequests();all.push(newReq);saveRequests(all);
    const mine=all.filter(x=>x.sid===user.libId);setRequests(mine);
    const newNotif={id:Date.now()+1,type:"pending",title:"Request Sent",msg:`Your borrow request for "${bk.title}" has been sent to the admin.`,bid:bk.id,date:fmtD(new Date()),read:false};
    const ns=[newNotif,...getNotifs(user.libId)];saveNotifs(user.libId,ns);setNotifs(ns);
    setReqFlash(bk.id);setTimeout(()=>setReqFlash(null),2500);
  };

  const toggleWishlist=bid=>{
    if(!user)return;
    const wl=getWishlist(user.libId);
    const updated=wl.includes(bid)?wl.filter(x=>x!==bid):[...wl,bid];
    saveWishlist(user.libId,updated);setWishlist(updated);
  };

  const markAllRead=()=>{const ns=notifs.map(n=>({...n,read:true}));saveNotifs(user.libId,ns);setNotifs(ns);};
  const markOneRead=id=>{const ns=notifs.map(n=>n.id===id?{...n,read:true}:n);saveNotifs(user.libId,ns);setNotifs(ns);};

  const sendChat=()=>{
    if(!chatInput.trim())return;const q=chatInput.trim();setChatInput("");
    const matched=BOOKS.filter(b=>b.title.toLowerCase().includes(q.toLowerCase())||b.dept.toLowerCase().includes(q.toLowerCase()));
    const reply=matched.length?`I found ${matched.length} book(s) matching "${q}". Top result: "${matched[0].title}" by ${matched[0].author} — ${matched[0].status}.`:`I didn't find an exact match for "${q}", but try browsing our Explore section for related titles.`;
    setMsgs(m=>[...m,{role:"user",text:q},{role:"ai",text:reply}]);
  };

  const getPos=i=>{let d=i-si;if(d>FEAT.length/2)d-=FEAT.length;if(d<-FEAT.length/2)d+=FEAT.length;return d;};

  const nav=(pg)=>{setPage(pg);setBook(null);if(pg!=="explore")setSearchQ("");};

  const activeLoans=requests.filter(r=>r.status==="approved"&&!r.returnDate);
  const history=requests.filter(r=>r.returnDate||r.status==="rejected");
  const pendingReqs=requests.filter(r=>r.status==="pending");

  // ── LOGIN ──
  if(!user)return(
    <div style={{minHeight:"100vh",background:th.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",direction:isAr?"rtl":"ltr",transition:"background 0.4s"}}>
      <div style={{position:"absolute",top:"-15%",left:"-10%",width:440,height:440,borderRadius:"50%",background:`${th.prime}0d`,filter:"blur(110px)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:420,padding:"0 20px",animation:"fadeUp 0.6s ease",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:54,height:54,borderRadius:16,margin:"0 auto 14px",background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 10px 28px ${th.primeG}`,animation:"glow 3s ease infinite",color:"#fff"}}><Ic p={P.bookOpen} s={24}/></div>
          <h1 style={{fontSize:27,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.03em",color:th.text,marginBottom:5}}>Biblio<span style={{color:th.prime}}>Tech</span></h1>
          <p style={{fontSize:12,color:th.sub,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.loginSub}</p>
        </div>
        <div style={{background:th.surface,border:`1px solid ${th.prime}22`,borderRadius:20,padding:"28px 28px 24px",boxShadow:"0 24px 64px rgba(0,0,0,0.4)"}}>
          <h2 style={{fontSize:19,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:22,textAlign:"center"}}>{t.welcome}</h2>
          {[[t.cardId,P.id,"LIB-20411","text"],[t.password,P.lock,"••••••••","password"]].map(([label,icon,ph,type])=>(
            <div key={label} style={{marginBottom:14}}>
              <label style={{fontSize:10,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>{label}</label>
              <div style={{position:"relative"}}><div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:th.muted}}><Ic p={icon} s={14}/></div><input type={type} placeholder={ph} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:11,padding:"12px 12px 12px 38px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/></div>
            </div>
          ))}
          <button onClick={()=>{seedDemo();setUser({name:"Ahmed Youssef",libId:"LIB-20411",email:"ahmed.y@benha.edu.eg",dept:"Computer Science",joined:"Sep 2024"});}} className="btn" style={{width:"100%",background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:11,padding:"13px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",boxShadow:`0 6px 20px ${th.primeG}`,marginTop:4,display:"block"}}>{isAr?"تسجيل الدخول":"Sign In"}</button>
        </div>
        <div style={{marginTop:14,display:"flex",justifyContent:"center"}}>
          <CtrlBar th={th} t={t} tn={tn} setTn={setTn} lang={lang} setLang={setLang} isAr={isAr} onBack={onBack}/>
        </div>
      </div>
    </div>
  );

  const unreadCount=notifs.filter(n=>!n.read).length;

  // ── MAIN LAYOUT ──
  return(<div style={{minHeight:"100vh",background:th.bg,color:th.text,fontFamily:"'Plus Jakarta Sans',sans-serif",direction:isAr?"rtl":"ltr",transition:"background 0.4s,color 0.4s"}}>
    {/* NAV */}
    <nav style={{position:"sticky",top:0,zIndex:100,height:62,background:th.navBg,backdropFilter:"blur(20px)",borderBottom:`1px solid ${th.prime}18`,display:"flex",alignItems:"center",padding:"0 24px",justifyContent:"space-between",flexDirection:isAr?"row-reverse":"row"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>nav("home")}>
        <div style={{width:31,height:31,borderRadius:10,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Ic p={P.bookOpen} s={15}/></div>
        <span style={{fontSize:17,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",color:th.text}}>Biblio<span style={{color:th.prime}}>Tech</span></span>
      </div>
      <div style={{display:"flex",gap:2,flexDirection:isAr?"row-reverse":"row"}}>
        {[[t.home,"home",P.home],[t.explore,"explore",P.explore],[t.library,"library",P.lib]].map(([label,id,icon])=>(
          <button key={id} onClick={()=>nav(id)} className="btn" style={{display:"flex",alignItems:"center",gap:6,background:page===id?th.prime+"20":"transparent",border:`1px solid ${page===id?th.prime+"44":"transparent"}`,borderRadius:10,padding:"7px 13px",color:page===id?th.prime:th.sub,fontSize:12,fontWeight:page===id?600:400,flexDirection:isAr?"row-reverse":"row"}}>
            <Ic p={icon} s={14}/>{label}
            {id==="library"&&activeLoans.length>0&&<span style={{fontSize:9,fontWeight:700,background:th.prime,color:"#fff",borderRadius:20,padding:"1px 5px"}}>{activeLoans.length}</span>}
          </button>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:isAr?"row-reverse":"row"}}>
        <NotifBell th={th} t={t} isAr={isAr} notifs={notifs} onMarkAll={markAllRead} onMarkOne={markOneRead}/>
        <button onClick={()=>nav("account")} className="btn" style={{display:"flex",alignItems:"center",gap:7,background:page==="account"?th.prime+"20":th.surface,border:`1px solid ${page==="account"?th.prime+"44":th.border}`,borderRadius:10,padding:"4px 11px 4px 6px",flexDirection:isAr?"row-reverse":"row"}}>
          <div style={{width:26,height:26,borderRadius:8,background:`linear-gradient(135deg,#1d4ed8,${th.cyan}50)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:th.cyan,fontFamily:"'Space Grotesk',sans-serif"}}>{user.name[0]}</div>
          <span style={{fontSize:12,color:th.text}}>{user.name.split(" ")[0]}</span>
        </button>
        <button onClick={()=>{setUser(null);setPage("home");}} className="btn" style={{border:`1px solid ${th.border}`,borderRadius:9,padding:"7px 11px",color:th.sub,display:"flex",alignItems:"center",gap:5,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.logout} s={13}/></button>
      </div>
    </nav>

    {/* HOME PAGE */}
    {page==="home"&&<div>
      {/* Slider */}
      <div style={{position:"relative",height:360,overflow:"hidden",background:`linear-gradient(180deg,#0b0e18,${th.bg})`}}>
        <div style={{position:"absolute",inset:0,pointerEvents:"none",background:`radial-gradient(ellipse at 50% 30%,${FEAT[si].cover[1]}26 0%,transparent 65%)`,filter:"blur(40px)",transition:"background 1s ease"}}/>
        <div style={{position:"relative",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
          {FEAT.map((bk,i)=>{const pos=getPos(i),abs=Math.abs(pos);if(abs>3)return null;const isC=pos===0,scale=isC?1:abs===1?0.78:0.61,x=pos*200,z=isC?10:abs===1?6:3,op=isC?1:abs===1?0.58:0.26;const s=sc(bk.status);return(
            <div key={bk.id} onClick={()=>{if(isC){setBook(bk);setPage("detail");}else setSi(i);}} style={{position:"absolute",transform:`translateX(${x}px) scale(${scale})`,transition:"all 0.5s cubic-bezier(0.4,0,0.2,1)",zIndex:z,opacity:op,cursor:"pointer",width:170}}>
              <div style={{width:170,height:240,borderRadius:12,overflow:"hidden",border:`2px solid ${isC?deptColor(bk.dept)+"90":"rgba(255,255,255,0.05)"}`,boxShadow:isC?`0 22px 58px ${bk.cover[1]}55`:"0 6px 16px rgba(0,0,0,0.5)",transition:"all 0.5s ease"}}>
                <Cover colors={bk.cover} h={240}><div style={{position:"absolute",top:8,left:8,background:s.c+"22",color:s.c,border:`1px solid ${s.c}44`,fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase"}}>{s.label}</div>{bk.isNew&&<div style={{position:"absolute",top:8,right:8,background:th.prime,color:"#fff",fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>NEW</div>}</Cover>
              </div>
              {abs<=1&&<div style={{textAlign:"center",marginTop:9}}><p style={{fontSize:isC?12:10,fontWeight:isC?700:500,color:isC?th.text:"rgba(255,255,255,0.4)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:"'Space Grotesk',sans-serif"}}>{bk.title}</p>{isC&&<p style={{fontSize:10,color:th.sub,marginTop:2}}>{bk.author}</p>}</div>}
            </div>
          );})}
        </div>
        <button onClick={()=>setSi(a=>(a-1+FEAT.length)%FEAT.length)} className="btn" style={{position:"absolute",left:13,top:"44%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:"50%",width:37,height:37,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.85)",zIndex:20}}><Ic p={isAr?P.chevR:P.chevL} s={16}/></button>
        <button onClick={()=>setSi(a=>(a+1)%FEAT.length)} className="btn" style={{position:"absolute",right:13,top:"44%",transform:"translateY(-50%)",background:"rgba(0,0,0,0.55)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:"50%",width:37,height:37,display:"flex",alignItems:"center",justifyContent:"center",color:"rgba(255,255,255,0.85)",zIndex:20}}><Ic p={isAr?P.chevL:P.chevR} s={16}/></button>
        <div style={{position:"absolute",bottom:10,left:"50%",transform:"translateX(-50%)",display:"flex",gap:5,zIndex:20}}>{FEAT.map((_,i)=>(<div key={i} onClick={()=>setSi(i)} style={{width:i===si?17:5,height:5,borderRadius:3,background:i===si?th.prime:"rgba(255,255,255,0.17)",cursor:"pointer",transition:"all 0.3s"}}/>))}</div>
      </div>
      {/* Announcements ticker */}
      {anns.length>0&&<div style={{background:th.surface,borderBottom:`1px solid ${th.border}`,padding:"7px 0",overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",left:0,top:0,bottom:0,width:70,zIndex:2,background:`linear-gradient(90deg,${th.surface},transparent)`,pointerEvents:"none"}}/>
        <div style={{position:"absolute",right:0,top:0,bottom:0,width:70,zIndex:2,background:`linear-gradient(270deg,${th.surface},transparent)`,pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",animation:`marquee ${anns.length*9}s linear infinite`,width:"max-content"}}>
          {[...anns,...anns].map((a,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"0 28px",borderRight:`1px solid ${th.border}`,flexShrink:0}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:a.priority==="urgent"?th.red:a.priority==="important"?th.amber:th.prime,display:"inline-block",flexShrink:0}}/>
              <span style={{fontSize:12,fontWeight:600,color:a.priority==="urgent"?th.red:a.priority==="important"?th.amber:th.prime,fontFamily:"'Space Grotesk',sans-serif",whiteSpace:"nowrap"}}>{a.title}:</span>
              <span style={{fontSize:12,color:th.sub,whiteSpace:"nowrap"}}>{a.body}</span>
            </div>
          ))}
        </div>
      </div>}
      {/* Books grid */}
      <div style={{padding:"24px 22px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,flexDirection:isAr?"row-reverse":"row"}}><div style={{width:4,height:22,borderRadius:4,background:`linear-gradient(180deg,${th.prime},${th.prime}88)`}}/><h2 style={{fontSize:18,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"تصفح الكتب":"Browse Books"}</h2></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13}}>
          {BOOKS.map(bk=>(<BookCard key={bk.id} bk={bk} th={th} sc={sc} onClick={()=>{setBook(bk);setPage("detail");}} wishlist={wishlist} onToggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus}/>))}
        </div>
        {/* Announcements cards */}
        {anns.length>0&&<div style={{marginTop:34}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,flexDirection:isAr?"row-reverse":"row"}}><div style={{width:4,height:22,borderRadius:4,background:`linear-gradient(180deg,${th.amber},${th.amber}88)`}}/><h2 style={{fontSize:18,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"إعلانات المكتبة":"Library Announcements"}</h2></div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:11}}>
            {anns.map((a,i)=>{const c=a.priority==="urgent"?th.red:a.priority==="important"?th.amber:th.prime;return(
              <div key={a.id} style={{background:th.card,border:`1px solid ${th.border}`,borderLeft:`4px solid ${c}`,borderRadius:13,padding:"15px 17px",display:"flex",gap:12,animation:`fadeUp 0.4s ${i*55}ms ease both`,flexDirection:isAr?"row-reverse":"row"}}>
                <div style={{width:35,height:35,borderRadius:10,background:`${c}18`,display:"flex",alignItems:"center",justifyContent:"center",color:c,flexShrink:0}}><Ic p={P.megaphone} s={15}/></div>
                <div style={{flex:1,minWidth:0,textAlign:isAr?"right":"left"}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexDirection:isAr?"row-reverse":"row"}}>
                    <h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{a.title}</h3>
                    <span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20,background:`${c}18`,color:c,border:`1px solid ${c}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase",flexShrink:0}}>{a.priority}</span>
                  </div>
                  <p style={{fontSize:12,color:th.sub,lineHeight:1.65,marginBottom:5,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{a.body}</p>
                  <p style={{fontSize:10,color:th.muted,display:"flex",alignItems:"center",gap:3,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.clock} s={10}/>{a.date}</p>
                </div>
              </div>);
            })}
          </div>
        </div>}
      </div>
    </div>}

    {/* BOOK DETAIL */}
    {page==="detail"&&book&&<BookDetail th={th} t={t} isAr={isAr} book={book} sc={sc} wishlist={wishlist} toggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} requests={requests} sendBorrowRequest={sendBorrowRequest} reqFlash={reqFlash} onBack={()=>{setPage("home");setBook(null);}} daysLeft={daysLeft} daysColor={daysColor}/>}

    {/* EXPLORE */}
    {page==="explore"&&<ExplorePage th={th} t={t} isAr={isAr} searchQ={searchQ} setSearchQ={setSearchQ} exploreFilter={exploreFilter} setExploreFilter={setExploreFilter} sc={sc} wishlist={wishlist} toggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} onBook={bk=>{setBook(bk);setPage("detail");}}/>}

    {/* MY LIBRARY */}
    {page==="library"&&<div style={{padding:"24px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexDirection:isAr?"row-reverse":"row"}}><div style={{width:4,height:22,borderRadius:4,background:`linear-gradient(180deg,${th.accent},${th.accent}88)`}}/><h2 style={{fontSize:18,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{t.library}</h2></div>
      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:11,marginBottom:20}}>
        {[[String(activeLoans.length),t.activeLoans,th.prime,P.bookOpen],[String(history.filter(r=>r.returnDate).length),t.totalBorrowed||"Total Read",th.cyan,P.book],[String(wishlist.length),t.wishlistCount,th.red,P.heart]].map(([v,l,c,icon])=>(
          <div key={l} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:13,padding:"14px 16px",display:"flex",alignItems:"center",gap:11,flexDirection:isAr?"row-reverse":"row"}}>
            <div style={{width:36,height:36,borderRadius:10,background:`${c}18`,display:"flex",alignItems:"center",justifyContent:"center",color:c,flexShrink:0}}><Ic p={icon} s={16}/></div>
            <div style={{textAlign:isAr?"right":"left"}}><p style={{fontSize:22,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</p><p style={{fontSize:11,color:th.sub}}>{l}</p></div>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div style={{display:"flex",background:th.surface,border:`1px solid ${th.border}`,borderRadius:12,padding:4,gap:4,marginBottom:18}}>
        {[[t.activeTab,"active",activeLoans.length],[t.historyTab,"history",history.length],[t.wishlistTab,"wishlist",wishlist.length]].map(([lbl,id,cnt])=>(
          <button key={id} onClick={()=>setLibTab(id)} className="btn" style={{flex:1,padding:"8px",borderRadius:9,fontSize:12,fontWeight:libTab===id?700:400,color:libTab===id?th.prime:th.sub,background:libTab===id?th.prime+"20":"transparent",border:`1px solid ${libTab===id?th.prime+"44":"transparent"}`,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
            {lbl}{cnt>0&&<span style={{fontSize:9,fontWeight:700,background:libTab===id?th.prime:th.muted+"33",color:libTab===id?"#fff":th.sub,borderRadius:20,padding:"1px 5px"}}>{cnt}</span>}
          </button>
        ))}
      </div>

      {/* ACTIVE TAB */}
      {libTab==="active"&&<div>
        {pendingReqs.length>0&&<div style={{marginBottom:16}}>
          <p style={{fontSize:11,color:th.muted,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>{t.pending} ({pendingReqs.length})</p>
          {pendingReqs.map((r,i)=>(
            <div key={r.id} style={{background:th.card,border:`1px solid ${th.amber}33`,borderRadius:12,padding:"13px 16px",marginBottom:8,display:"flex",alignItems:"center",gap:12,animation:`fadeUp 0.35s ${i*50}ms ease both`,flexDirection:isAr?"row-reverse":"row"}}>
              <div style={{width:38,height:52,borderRadius:8,overflow:"hidden",flexShrink:0}}><Cover colors={r.bCover} h={52}/></div>
              <div style={{flex:1,textAlign:isAr?"right":"left"}}><p style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{r.bTitle}</p><p style={{fontSize:11,color:th.sub}}>{r.bAuthor}</p><p style={{fontSize:10,color:th.muted,marginTop:2}}>{t.reqDate}: {r.reqDate}</p></div>
              <span style={{fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20,background:th.amber+"18",color:th.amber,border:`1px solid ${th.amber}44`,fontFamily:"'Space Grotesk',sans-serif"}}>{t.pending}</span>
            </div>
          ))}
        </div>}
        {activeLoans.length===0&&pendingReqs.length===0
          ?<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"36px",textAlign:"center"}}><div style={{color:th.muted,display:"flex",justifyContent:"center",marginBottom:11}}><Ic p={P.bookOpen} s={40}/></div><p style={{fontSize:14,fontWeight:700,color:th.text,marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>{t.noActiveLoans}</p><button onClick={()=>setPage("explore")} className="btn" style={{background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:10,padding:"9px 18px",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif"}}>{t.explore}</button></div>
          :<div>
            {activeLoans.length>0&&<p style={{fontSize:11,color:th.muted,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>{t.approved} ({activeLoans.length})</p>}
            {activeLoans.map((r,i)=>{
              const days=daysLeft(r.dueDateISO);const dc2=daysColor(days,th);
              return(<div key={r.id} style={{background:th.card,border:`1px solid ${days!==null&&days<=3?th.red+"44":th.border}`,borderRadius:12,padding:"14px 16px",marginBottom:10,display:"flex",alignItems:"center",gap:14,animation:`fadeUp 0.35s ${i*50}ms ease both`,flexDirection:isAr?"row-reverse":"row"}}>
                <div style={{width:42,height:58,borderRadius:8,overflow:"hidden",flexShrink:0,boxShadow:`0 6px 16px ${r.bCover[1]}44`}}><Cover colors={r.bCover} h={58}/></div>
                <div style={{flex:1,textAlign:isAr?"right":"left"}}>
                  <p style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:2}}>{r.bTitle}</p>
                  <p style={{fontSize:11,color:th.sub}}>{r.bAuthor}</p>
                  <p style={{fontSize:10,color:th.muted,marginTop:4,display:"flex",alignItems:"center",gap:4,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.calendar} s={10}/>{t.returnBy}: {r.dueDate}</p>
                </div>
                <div style={{textAlign:"center",background:dc2+"14",border:`1px solid ${dc2}33`,borderRadius:11,padding:"8px 12px",minWidth:60,flexShrink:0}}>
                  <p style={{fontSize:20,fontWeight:700,color:dc2,fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{Math.abs(days!==null?days:0)}</p>
                  <p style={{fontSize:9,color:dc2,marginTop:2,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>{days!==null&&days<0?t.overdueLbl:days===0?t.dueToday:"days"}</p>
                </div>
              </div>);
            })}
          </div>
        }
      </div>}

      {/* HISTORY TAB */}
      {libTab==="history"&&<div>
        {history.length===0
          ?<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"36px",textAlign:"center"}}><div style={{color:th.muted,display:"flex",justifyContent:"center",marginBottom:11}}><Ic p={P.book} s={40}/></div><p style={{fontSize:14,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{t.noHistory}</p></div>
          :history.map((r,i)=>{
            const c=r.status==="rejected"?th.red:th.cyan;const lbl=r.status==="rejected"?t.rejected:t.returned;
            return(<div key={r.id} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:12,padding:"13px 16px",marginBottom:9,display:"flex",alignItems:"center",gap:12,animation:`fadeUp 0.35s ${i*40}ms ease both`,flexDirection:isAr?"row-reverse":"row"}}>
              <div style={{width:38,height:52,borderRadius:8,overflow:"hidden",flexShrink:0,opacity:0.7}}><Cover colors={r.bCover} h={52}/></div>
              <div style={{flex:1,textAlign:isAr?"right":"left"}}><p style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{r.bTitle}</p><p style={{fontSize:11,color:th.sub}}>{r.bAuthor}</p><p style={{fontSize:10,color:th.muted,marginTop:3}}>{r.returnDate?`${t.returned}: ${r.returnDate}`:r.reqDate}</p></div>
              <span style={{fontSize:10,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${c}18`,color:c,border:`1px solid ${c}44`,fontFamily:"'Space Grotesk',sans-serif"}}>{lbl}</span>
            </div>);
          })
        }
      </div>}

      {/* WISHLIST TAB */}
      {libTab==="wishlist"&&<div>
        {wishlist.length===0
          ?<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"36px",textAlign:"center"}}><div style={{color:th.muted,display:"flex",justifyContent:"center",marginBottom:11}}><Ic p={P.heart} s={40}/></div><p style={{fontSize:14,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{t.noWishlistItems}</p></div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:13}}>
            {BOOKS.filter(b=>wishlist.includes(b.id)).map(bk=>(
              <BookCard key={bk.id} bk={bk} th={th} sc={sc} onClick={()=>{setBook(bk);setPage("detail");}} wishlist={wishlist} onToggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus}/>
            ))}
          </div>
        }
      </div>}
    </div>}

    {/* ACCOUNT PAGE */}
    {page==="account"&&<div style={{padding:"24px",maxWidth:700,margin:"0 auto"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,flexDirection:isAr?"row-reverse":"row"}}><div style={{width:4,height:22,borderRadius:4,background:`linear-gradient(180deg,${th.accent},${th.accent}88)`}}/><h2 style={{fontSize:18,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{t.account}</h2></div>
      {/* Profile card */}
      <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:18,padding:"24px",marginBottom:16,display:"flex",alignItems:"center",gap:18,flexDirection:isAr?"row-reverse":"row"}}>
        <div style={{width:70,height:70,borderRadius:20,background:`linear-gradient(135deg,${th.prime},${th.accent})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:700,color:"#fff",fontFamily:"'Space Grotesk',sans-serif",flexShrink:0}}>{user.name[0]}</div>
        <div style={{flex:1,textAlign:isAr?"right":"left"}}>
          <h2 style={{fontSize:20,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:4}}>{user.name}</h2>
          <p style={{fontSize:12,color:th.sub,marginBottom:2}}>{user.libId}</p>
          <div style={{display:"flex",gap:6,marginTop:8,flexDirection:isAr?"row-reverse":"row"}}>
            <span style={{fontSize:9,fontWeight:700,padding:"3px 9px",borderRadius:20,background:th.green+"18",color:th.green,border:`1px solid ${th.green}44`,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"نشط":"Active"}</span>
            <span style={{fontSize:9,fontWeight:600,padding:"3px 9px",borderRadius:20,background:deptColor(user.dept)+"22",color:deptColor(user.dept),border:`1px solid ${deptColor(user.dept)}44`,fontFamily:"'Space Grotesk',sans-serif"}}>{user.dept}</span>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,textAlign:"center",flexShrink:0}}>
          {[[String(activeLoans.length),t.activeLoans,th.prime],[String(history.filter(r=>r.returnDate).length),"Read",th.cyan],[String(wishlist.length),t.wishlist,th.red]].map(([v,l,c])=>(<div key={l}><p style={{fontSize:18,fontWeight:700,color:c,fontFamily:"'Space Grotesk',sans-serif"}}>{v}</p><p style={{fontSize:10,color:th.sub}}>{l}</p></div>))}
        </div>
      </div>
      {/* Info */}
      <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:16,padding:"20px 22px",marginBottom:16}}>
        <h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:14,display:"flex",alignItems:"center",gap:8,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.user} s={14} color={th.prime}/>{t.accountInfo}</h3>
        {[[t.email,P.email,user.email],[t.dept2,P.book,user.dept],[t.joined,P.calendar,user.joined]].map(([label,icon,val])=>(
          <div key={label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${th.border}`,flexDirection:isAr?"row-reverse":"row"}}>
            <div style={{display:"flex",alignItems:"center",gap:9,color:th.sub,flexDirection:isAr?"row-reverse":"row"}}><Ic p={icon} s={13}/><span style={{fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{label}</span></div>
            <span style={{fontSize:12,fontWeight:600,color:th.text,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{val}</span>
          </div>
        ))}
      </div>
      {/* Theme settings */}
      <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:16,padding:"20px 22px",marginBottom:16}}>
        <h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:14,display:"flex",alignItems:"center",gap:8,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.settings} s={14} color={th.prime}/>{t.settings}</h3>
        <div style={{marginBottom:16}}>
          <p style={{fontSize:11,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>{t.themeLabel}</p>
          <div style={{display:"flex",gap:9,flexDirection:isAr?"row-reverse":"row"}}>
            {[["dark","🌑"],["medium","🌓"],["light","☀️"]].map(([name,emoji])=>(
              <button key={name} onClick={()=>setTn(name)} className="btn" style={{flex:1,padding:"12px 8px",borderRadius:12,border:`2px solid ${tn===name?th.prime+"88":th.border}`,background:tn===name?th.prime+"14":th.surface,color:tn===name?th.prime:th.sub,fontSize:12,fontWeight:tn===name?700:500,fontFamily:"'Space Grotesk',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all 0.2s"}}>
                <span style={{fontSize:18}}>{emoji}</span>{t[name]}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p style={{fontSize:11,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:10,fontFamily:"'Space Grotesk',sans-serif"}}>{t.languageLabel}</p>
          <div style={{display:"flex",gap:9,flexDirection:isAr?"row-reverse":"row"}}>
            {[["en","English","🇬🇧"],["ar","العربية","🇪🇬"]].map(([code,name,flag])=>(
              <button key={code} onClick={()=>setLang(code)} className="btn" style={{flex:1,padding:"12px 8px",borderRadius:12,border:`2px solid ${lang===code?th.prime+"88":th.border}`,background:lang===code?th.prime+"14":th.surface,color:lang===code?th.prime:th.sub,fontSize:13,fontWeight:lang===code?700:500,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all 0.2s"}}>
                <span style={{fontSize:16}}>{flag}</span>{name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>}

    {/* CHATBOT */}
    <div style={{position:"fixed",bottom:18,right:isAr?"auto":18,left:isAr?18:"auto",zIndex:9999}}>
      {chatOpen&&<div style={{position:"absolute",bottom:58,[isAr?"left":"right"]:0,width:292,background:th.surface,border:`1px solid ${th.prime}30`,borderRadius:17,overflow:"hidden",boxShadow:"0 20px 55px rgba(0,0,0,0.7)",animation:"scaleIn 0.25s ease",transformOrigin:`bottom ${isAr?"left":"right"}`,display:"flex",flexDirection:"column",height:360}}>
        <div style={{background:`linear-gradient(135deg,${th.prime},${th.primeD})`,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",flexDirection:isAr?"row-reverse":"row"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:isAr?"row-reverse":"row"}}><div style={{width:27,height:27,borderRadius:8,background:"rgba(0,0,0,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Ic p={P.bot} s={13}/></div><div><p style={{fontSize:12,fontWeight:700,color:"#fff",fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"مساعد المكتبة":"Library AI"}</p><p style={{fontSize:9,color:"rgba(255,255,255,0.7)"}}>{isAr?"متصل":"Online"}</p></div></div>
          <button onClick={()=>setChatOpen(false)} className="btn" style={{background:"rgba(0,0,0,0.2)",borderRadius:"50%",width:24,height:24,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Ic p={P.xO} s={11}/></button>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"11px"}}>
          {msgs.map((m,i)=>(<div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start",marginBottom:8,flexDirection:isAr?"row-reverse":"row"}}>
            {m.role==="ai"&&<div style={{width:22,height:22,borderRadius:"50%",background:th.prime,flexShrink:0,marginRight:isAr?0:6,marginLeft:isAr?6:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Ic p={P.bot} s={11}/></div>}
            <div style={{maxWidth:"82%",padding:"7px 11px",borderRadius:m.role==="user"?"12px 12px 3px 12px":"12px 12px 12px 3px",background:m.role==="user"?`linear-gradient(135deg,${th.prime},${th.primeD})`:th.card,border:m.role==="ai"?`1px solid ${th.border}`:"none",fontSize:12,color:th.text,lineHeight:1.55}}>{m.text}</div>
          </div>))}
          <div ref={chatRef}/>
        </div>
        <div style={{padding:"8px 10px",borderTop:`1px solid ${th.border}`,display:"flex",gap:6,flexDirection:isAr?"row-reverse":"row"}}>
          <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder={isAr?"اسأل...":"Ask..."} style={{flex:1,background:th.card,border:`1px solid ${th.border}`,borderRadius:9,padding:"7px 11px",color:th.text,fontSize:12,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/>
          <button onClick={sendChat} className="btn" style={{background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:9,width:31,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic p={P.send} s={13}/></button>
        </div>
      </div>}
      <button onClick={()=>setChatOpen(o=>!o)} className="btn" style={{width:47,height:47,borderRadius:"50%",background:chatOpen?th.dim:`linear-gradient(135deg,${th.prime},${th.primeD})`,color:"#fff",boxShadow:chatOpen?"none":`0 5px 20px ${th.primeG}`,animation:chatOpen?"none":"glow 3s ease infinite",display:"flex",alignItems:"center",justifyContent:"center"}}><Ic p={chatOpen?P.xO:P.bot} s={18}/></button>
    </div>
  </div>);}

function AdminPanel({th,t,isAr,controls,tn,setTn,lang,setLang}){
  const[loggedIn,setLoggedIn]=useState(false);
  const[u,setU]=useState("");const[pw,setPw]=useState("");const[err,setErr]=useState("");const[loading,setLoading]=useState(false);
  const[active,setActive]=useState("dashboard");
  const[anns,setAnns]=useState(getAnns);
  const[composing,setComposing]=useState(false);const[aTitle,setATitle]=useState("");const[aBody,setABody]=useState("");const[aPrio,setAPrio]=useState("normal");
  const[allReqs,setAllReqs]=useState(getRequests);
  const[reqFilter,setReqFilter]=useState("pending");
  const[selStudent,setSelStudent]=useState(null);

  const refreshReqs=()=>{const r=getRequests();setAllReqs(r);};

  const login=()=>{if(!u||!pw){setErr("Fill all fields.");return;}setLoading(true);setErr("");setTimeout(()=>{setLoading(false);if(u==="admin"&&pw==="admin123"){setAllReqs(getRequests());setLoggedIn(true);}else setErr("Wrong credentials.");},1200);};

  const postAnn=()=>{if(!aTitle||!aBody)return;const a=[{id:Date.now(),title:aTitle,body:aBody,priority:aPrio,date:fmtD(new Date()),time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})},...anns];setAnns(a);saveAnns(a);setATitle("");setABody("");setAPrio("normal");setComposing(false);};
  const delAnn=id=>{const a=anns.filter(x=>x.id!==id);setAnns(a);saveAnns(a);};

  const approveReq=rid=>{
    const dueD=relD(14);const updated=allReqs.map(r=>{if(r.id!==rid)return r;
      const nr={...r,status:"approved",approvedDate:fmtD(new Date()),dueDate:fmtD(dueD),dueDateISO:isoD(dueD)};
      const ns=getNotifs(r.sid);ns.unshift({id:Date.now()+Math.random(),type:"approved",title:"Request Approved",msg:`Your request for "${r.bTitle}" was approved. Return by ${fmtD(dueD)}.`,bid:r.bid,date:fmtD(new Date()),read:false});saveNotifs(r.sid,ns);
      return nr;});
    saveRequests(updated);setAllReqs(updated);
  };
  const rejectReq=rid=>{const updated=allReqs.map(r=>{if(r.id!==rid)return r;const nr={...r,status:"rejected"};const ns=getNotifs(r.sid);ns.unshift({id:Date.now()+Math.random(),type:"rejected",title:"Request Not Approved",msg:`Your request for "${r.bTitle}" was not approved this time.`,bid:r.bid,date:fmtD(new Date()),read:false});saveNotifs(r.sid,ns);return nr;});saveRequests(updated);setAllReqs(updated);};
  const returnBook=rid=>{const updated=allReqs.map(r=>r.id===rid?{...r,returnDate:fmtD(new Date())}:r);saveRequests(updated);setAllReqs(updated);};

  const filteredReqs=reqFilter==="all"?allReqs:allReqs.filter(r=>r.status===reqFilter);
  const pendingCount=allReqs.filter(r=>r.status==="pending").length;
  const activeCount=allReqs.filter(r=>r.status==="approved"&&!r.returnDate).length;
  const pc=pr=>pr==="urgent"?th.red:pr==="important"?th.amber:th.prime;

  if(!loggedIn)return(
    <div style={{minHeight:"100vh",background:th.bg,display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden",direction:isAr?"rtl":"ltr",transition:"background 0.4s"}}>
      <div style={{position:"absolute",top:"-15%",right:"-10%",width:440,height:440,borderRadius:"50%",background:`${th.prime}0d`,filter:"blur(120px)",pointerEvents:"none"}}/>
      <div style={{width:"100%",maxWidth:400,padding:"0 20px",animation:"fadeUp 0.6s ease",position:"relative",zIndex:1}}>
        <div style={{textAlign:"center",marginBottom:34}}>
          <div style={{width:54,height:54,borderRadius:16,margin:"0 auto 14px",background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 10px 28px ${th.primeG}`,animation:"glow 3s ease infinite",color:"#fff"}}><Ic p={P.shield} s={24}/></div>
          <h1 style={{fontSize:25,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.03em",color:th.text,marginBottom:5}}>{isAr?"لوحة الأدمن":"Admin Panel"}</h1>
          <p style={{fontSize:12,color:th.sub}}>{isAr?"للموظفين المعتمدين فقط":"Authorized staff only"}</p>
        </div>
        <div style={{background:th.surface,border:`1px solid ${th.prime}22`,borderRadius:20,padding:"26px 26px 22px",boxShadow:"0 24px 64px rgba(0,0,0,0.4)"}}>
          {[[t.username,P.student,"admin","text",u,setU],[t.password,P.lock,"admin123","password",pw,setPw]].map(([label,icon,ph,type,val,setVal])=>(
            <div key={label} style={{marginBottom:13}}>
              <label style={{fontSize:10,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:6,fontFamily:"'Space Grotesk',sans-serif"}}>{label}</label>
              <div style={{position:"relative"}}><div style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:th.muted}}><Ic p={icon} s={14}/></div><input type={type} value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} placeholder={ph} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:11,padding:"12px 12px 12px 38px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/></div>
            </div>
          ))}
          {err&&<div style={{background:th.red+"14",border:`1px solid ${th.red}30`,borderRadius:9,padding:"8px 12px",marginBottom:11}}><p style={{fontSize:12,color:th.red}}>{err}</p></div>}
          <button onClick={login} className="btn" disabled={loading} style={{width:"100%",background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:11,padding:"13px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",boxShadow:`0 6px 20px ${th.primeG}`,opacity:loading?0.75:1,display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
            {loading?<><span style={{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"#fff",animation:"spin 0.7s linear infinite",display:"inline-block"}}/>{isAr?"جاري...":"Signing in..."}</>:<><Ic p={P.shield} s={15}/>{t.signin}</>}
          </button>
          <p style={{textAlign:"center",fontSize:11,color:th.muted,marginTop:11,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>Demo: admin / admin123</p>
        </div>
        <div style={{marginTop:12,display:"flex",justifyContent:"center"}}>{controls}</div>
      </div>
    </div>
  );

  const NAVS=[[t.dashboard,"dashboard",P.dash,null],[t.books,"books",P.book,null],[t.requests,"requests",P.alert,pendingCount>0?pendingCount:null],[t.students,"students",P.student,null],["Announcements","announce",P.megaphone,null]];

  return(<div style={{display:"flex",minHeight:"100vh",background:th.bg,color:th.text,direction:isAr?"rtl":"ltr",fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"background 0.4s,color 0.4s"}}>
    <aside style={{width:212,flexShrink:0,background:th.surface,borderRight:isAr?"none":`1px solid ${th.border}`,borderLeft:isAr?`1px solid ${th.border}`:"none",minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <div style={{padding:"17px 15px 13px",borderBottom:`1px solid ${th.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:9,flexDirection:isAr?"row-reverse":"row"}}>
          <div style={{width:31,height:31,borderRadius:9,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff"}}><Ic p={P.bookOpen} s={15}/></div>
          <div><p style={{fontSize:14,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",color:th.text}}>Biblio<span style={{color:th.prime}}>Tech</span></p><p style={{fontSize:10,color:th.muted}}>{isAr?"الأدمن":"Admin"}</p></div>
        </div>
      </div>
      <nav style={{flex:1,padding:"10px 8px"}}>
        {NAVS.map(([label,id,icon,badge])=>{const isA=active===id;return(
          <button key={id} onClick={()=>setActive(id)} className="btn" style={{display:"flex",alignItems:"center",gap:9,width:"100%",padding:"9px 11px",borderRadius:10,marginBottom:2,background:isA?th.prime+"20":"transparent",border:`1px solid ${isA?th.prime+"44":"transparent"}`,color:isA?th.prime:th.sub,fontSize:12,fontWeight:isA?600:400,flexDirection:isAr?"row-reverse":"row",justifyContent:"space-between"}}>
            <div style={{display:"flex",alignItems:"center",gap:9,flexDirection:isAr?"row-reverse":"row"}}><Ic p={icon} s={14}/>{label}</div>
            {badge&&<span style={{fontSize:9,fontWeight:700,background:th.red,color:"#fff",borderRadius:20,padding:"1px 6px",minWidth:18,textAlign:"center"}}>{badge}</span>}
          </button>);})}
      </nav>
      <div style={{padding:"12px 10px",borderTop:`1px solid ${th.border}`}}>
        {/* Theme picker */}
        <p style={{fontSize:9,fontWeight:700,color:th.muted,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:7,fontFamily:"'Space Grotesk',sans-serif",paddingLeft:2}}>{isAr?"المظهر":"Theme"}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:10}}>
          {[["dark",P.moon,isAr?"داكن":"Dark"],["medium",null,isAr?"متوسط":"Med"],["light",P.sun,isAr?"فاتح":"Light"]].map(([name,icon,label])=>(
            <button key={name} onClick={()=>setTn(name)} className="btn" style={{padding:"7px 4px",borderRadius:9,border:`1px solid ${tn===name?th.prime+"66":th.border}`,background:tn===name?th.prime+"18":th.card,color:tn===name?th.prime:th.muted,fontSize:10,fontWeight:tn===name?700:400,fontFamily:"'Space Grotesk',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",gap:3,transition:"all 0.18s"}}>
              {icon&&<Ic p={icon} s={11}/>}{label}
            </button>
          ))}
        </div>
        {/* Language picker */}
        <p style={{fontSize:9,fontWeight:700,color:th.muted,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:7,fontFamily:"'Space Grotesk',sans-serif",paddingLeft:2}}>{isAr?"اللغة":"Language"}</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
          {[["en","English"],["ar","عربي"]].map(([code,label])=>(
            <button key={code} onClick={()=>setLang(code)} className="btn" style={{padding:"7px 4px",borderRadius:9,border:`1px solid ${lang===code?th.prime+"66":th.border}`,background:lang===code?th.prime+"18":th.card,color:lang===code?th.prime:th.muted,fontSize:11,fontWeight:lang===code?700:400,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:5,transition:"all 0.18s"}}>
              <Ic p={P.globe} s={11}/>{label}
            </button>
          ))}
        </div>
        <button onClick={()=>setLoggedIn(false)} className="btn" style={{display:"flex",alignItems:"center",gap:7,width:"100%",padding:"8px 11px",borderRadius:9,color:th.muted,fontSize:11,border:`1px solid ${th.border}`,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.logout} s={13}/>{t.signout}</button>
      </div>
    </aside>

    <main style={{flex:1,overflowY:"auto",padding:"22px 24px"}}>
      {active==="dashboard"&&<div>
        <p style={{fontSize:11,color:th.muted,marginBottom:3,letterSpacing:"0.06em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"نظرة عامة":"Overview"}</p>
        <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:18}}>{t.dashboard}</h1>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:18}}>
          {[["4,821",isAr?"الكتب":"Total Books",th.prime,P.book],["1,247",isAr?"الطلاب":"Students",th.accent,P.student],[String(activeCount),isAr?"القروض":"Active Loans",th.cyan,P.bookOpen],[String(pendingCount),isAr?"طلبات معلقة":"Pending",th.amber,P.alert]].map(([val,label,c,icon])=>(
            <div key={label} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"16px 17px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-24,right:-24,width:85,height:85,borderRadius:"50%",background:`${c}0b`,pointerEvents:"none"}}/>
              <div style={{width:33,height:33,borderRadius:10,background:`${c}20`,display:"flex",alignItems:"center",justifyContent:"center",color:c,marginBottom:10}}><Ic p={icon} s={15}/></div>
              <p style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:3}}>{val}</p>
              <p style={{fontSize:11,color:th.sub}}>{label}</p>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:13}}>
          <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"17px"}}>
            <h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:2}}>{isAr?"النشاط الشهري":"Monthly Activity"}</h3>
            <p style={{fontSize:10,color:th.sub,marginBottom:12}}>{isAr?"استعارات مقابل إرجاع":"Borrows vs Returns"}</p>
            <ResponsiveContainer width="100%" height={175}>
              <AreaChart data={MONTHLY}><defs><linearGradient id="gB" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={th.prime} stopOpacity={0.3}/><stop offset="95%" stopColor={th.prime} stopOpacity={0}/></linearGradient><linearGradient id="gR" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={th.accent} stopOpacity={0.25}/><stop offset="95%" stopColor={th.accent} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke={th.border}/><XAxis dataKey="m" stroke="transparent" tick={{fontSize:9,fill:th.muted}}/><YAxis stroke="transparent" tick={{fontSize:9,fill:th.muted}}/><Tooltip contentStyle={{background:th.card2||th.card,border:`1px solid ${th.border}`,borderRadius:9,fontSize:10,color:th.text}}/><Area type="monotone" dataKey="borrows" stroke={th.prime} fill="url(#gB)" strokeWidth={2.5} name={isAr?"استعارات":"Borrows"}/><Area type="monotone" dataKey="returns" stroke={th.accent} fill="url(#gR)" strokeWidth={2} name={isAr?"إرجاع":"Returns"}/></AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"17px"}}>
            <h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:2}}>{isAr?"الكتب حسب القسم":"Books by Dept."}</h3>
            <p style={{fontSize:10,color:th.sub,marginBottom:12}}>{isAr?"توزيع المجموعة":"Collection"}</p>
            <ResponsiveContainer width="100%" height={175}>
              <BarChart data={DEPT_STATS} layout="vertical" margin={{left:0,right:5}}><CartesianGrid strokeDasharray="3 3" stroke={th.border} horizontal={false}/><XAxis type="number" stroke="transparent" tick={{fontSize:8,fill:th.muted}}/><YAxis dataKey="dept" type="category" stroke="transparent" tick={{fontSize:8,fill:th.sub}} width={50}/><Tooltip contentStyle={{background:th.card2||th.card,border:`1px solid ${th.border}`,borderRadius:9,fontSize:10,color:th.text}}/><Bar dataKey="books" radius={[0,5,5,0]} maxBarSize={13}>{DEPT_STATS.map((e,i)=><Cell key={i} fill={e.color}/>)}</Bar></BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        {/* Pending requests quick widget */}
        {allReqs.filter(r=>r.status==="pending").length>0&&<div style={{marginTop:13}}>
          <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
            <div style={{padding:"13px 16px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexDirection:isAr?"row-reverse":"row"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:isAr?"row-reverse":"row"}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:th.amber,animation:"blink 2s ease infinite"}}/>
                <h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"طلبات تنتظر الموافقة":"Awaiting Approval"}</h3>
                <span style={{fontSize:9,fontWeight:700,background:th.amber,color:"#fff",borderRadius:20,padding:"1px 7px"}}>{allReqs.filter(r=>r.status==="pending").length}</span>
              </div>
              <button onClick={()=>setActive("requests")} className="btn" style={{fontSize:11,color:th.prime,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"عرض الكل":"View all"} →</button>
            </div>
            {allReqs.filter(r=>r.status==="pending").slice(0,3).map((r,i)=>(
              <div key={r.id} className="rh" style={{display:"flex",alignItems:"center",gap:11,padding:"11px 16px",borderBottom:`1px solid ${th.border}`,transition:"background 0.2s",flexDirection:isAr?"row-reverse":"row"}}>
                <div style={{width:36,height:48,borderRadius:7,overflow:"hidden",flexShrink:0}}><Cover colors={r.bCover||["#1e3a8a","#1e40af"]} h={48}/></div>
                <div style={{flex:1,minWidth:0,textAlign:isAr?"right":"left"}}>
                  <p style={{fontSize:12,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.bTitle}</p>
                  <p style={{fontSize:11,color:th.sub,marginTop:1}}>{r.sName} · <span style={{color:th.muted}}>{r.reqDate}</span></p>
                </div>
                <div style={{display:"flex",gap:6,flexShrink:0,flexDirection:isAr?"row-reverse":"row"}}>
                  <button onClick={()=>approveReq(r.id)} className="btn" style={{background:th.green+"20",border:`1px solid ${th.green}44`,borderRadius:7,padding:"5px 10px",color:th.green,fontSize:10,fontWeight:700}}>{t.approve}</button>
                  <button onClick={()=>rejectReq(r.id)} className="btn" style={{background:th.red+"20",border:`1px solid ${th.red}44`,borderRadius:7,padding:"5px 10px",color:th.red,fontSize:10,fontWeight:700}}>{t.reject}</button>
                </div>
              </div>
            ))}
          </div>
        </div>}
      </div>}

      {active==="books"&&<div>
        <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:16}}>{t.books}</h1>
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr",padding:"9px 15px",borderBottom:`1px solid ${th.border}`,background:th.surface}}>
            {["Title","Author","Dept","Status"].map(h=>(<span key={h} style={{fontSize:9,fontWeight:700,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{h}</span>))}
          </div>
          {BOOKS.map(b=>{const c=b.status==="available"?th.green:b.status==="coming_soon"?th.cyan:b.status==="reserved"?th.amber:th.red;return(
            <div key={b.id} className="rh" style={{display:"grid",gridTemplateColumns:"2fr 1.2fr 1fr 1fr",padding:"11px 15px",borderBottom:`1px solid ${th.border}`,background:"transparent",transition:"background 0.2s",alignItems:"center"}}>
              <p style={{fontSize:12,fontWeight:600,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{b.title}</p>
              <p style={{fontSize:11,color:th.sub}}>{b.author}</p>
              <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:20,width:"fit-content",background:deptColor(b.dept)+"22",color:deptColor(b.dept),border:`1px solid ${deptColor(b.dept)}44`,fontFamily:"'Space Grotesk',sans-serif"}}>{b.dept}</span>
              <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:20,width:"fit-content",background:`${c}18`,color:c,border:`1px solid ${c}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{b.status.replace("_"," ")}</span>
            </div>);})}
        </div>
      </div>}

      {active==="requests"&&<div>
        <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:16}}>{t.requests}</h1>
        <div style={{display:"flex",gap:7,marginBottom:16,flexDirection:isAr?"row-reverse":"row"}}>
          {[["all",t.all,allReqs.length],["pending",t.pending,allReqs.filter(r=>r.status==="pending").length],["approved",t.approved,allReqs.filter(r=>r.status==="approved").length],["rejected",t.rejected,allReqs.filter(r=>r.status==="rejected").length]].map(([id,label,cnt])=>(
            <button key={id} onClick={()=>setReqFilter(id)} className="btn" style={{padding:"7px 14px",borderRadius:9,fontSize:11,fontWeight:reqFilter===id?700:400,color:reqFilter===id?th.prime:th.sub,border:`1px solid ${reqFilter===id?th.prime+"44":th.border}`,background:reqFilter===id?th.prime+"15":"transparent",display:"flex",alignItems:"center",gap:5,fontFamily:"'Space Grotesk',sans-serif"}}>
              {label}<span style={{fontSize:9,fontWeight:700,background:reqFilter===id?th.prime:th.muted+"33",color:reqFilter===id?"#fff":th.sub,borderRadius:20,padding:"1px 5px"}}>{cnt}</span>
            </button>
          ))}
        </div>
        {filteredReqs.length===0
          ?<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"30px",textAlign:"center"}}><p style={{fontSize:12,color:th.muted,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{t.noRequests}</p></div>
          :<div style={{display:"flex",flexDirection:"column",gap:9}}>
            {filteredReqs.map((r,i)=>{
              const sc2=r.status==="pending"?th.amber:r.status==="approved"?th.green:th.red;
              const days=r.dueDateISO?daysLeft(r.dueDateISO):null;
              return(<div key={r.id} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:13,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,animation:`fadeUp 0.35s ${i*40}ms ease both`,flexDirection:isAr?"row-reverse":"row"}}>
                <div style={{width:40,height:54,borderRadius:8,overflow:"hidden",flexShrink:0}}><Cover colors={r.bCover} h={54}/></div>
                <div style={{flex:1,minWidth:0,textAlign:isAr?"right":"left"}}>
                  <p style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{r.bTitle}</p>
                  <p style={{fontSize:11,color:th.sub,marginTop:1}}>{r.sName} · {r.sid}</p>
                  <p style={{fontSize:10,color:th.muted,marginTop:2}}>{t.reqDate}: {r.reqDate}{r.dueDate?` · ${t.returnBy}: ${r.dueDate}`:""}</p>
                </div>
                {r.status==="approved"&&!r.returnDate&&days!==null&&<div style={{textAlign:"center",background:daysColor(days,th)+"14",border:`1px solid ${daysColor(days,th)}33`,borderRadius:10,padding:"7px 10px",flexShrink:0}}>
                  <p style={{fontSize:17,fontWeight:700,color:daysColor(days,th),fontFamily:"'Space Grotesk',sans-serif",lineHeight:1}}>{Math.abs(days)}</p>
                  <p style={{fontSize:8,color:daysColor(days,th),marginTop:1}}>{days<0?"overdue":"days"}</p>
                </div>}
                <div style={{display:"flex",gap:7,flexShrink:0,flexDirection:isAr?"row-reverse":"row"}}>
                  {r.status==="pending"&&<>
                    <button onClick={()=>approveReq(r.id)} className="btn" style={{background:th.green+"20",border:`1px solid ${th.green}44`,borderRadius:8,padding:"7px 13px",color:th.green,fontSize:11,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:5}}><Ic p={P.checkO} s={12}/>{t.approve}</button>
                    <button onClick={()=>rejectReq(r.id)} className="btn" style={{background:th.red+"20",border:`1px solid ${th.red}44`,borderRadius:8,padding:"7px 13px",color:th.red,fontSize:11,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:5}}><Ic p={P.xO} s={12}/>{t.reject}</button>
                  </>}
                  {r.status==="approved"&&!r.returnDate&&<button onClick={()=>returnBook(r.id)} className="btn" style={{background:th.cyan+"20",border:`1px solid ${th.cyan}44`,borderRadius:8,padding:"7px 13px",color:th.cyan,fontSize:11,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif"}}>{t.markReturned}</button>}
                  {r.returnDate&&<span style={{fontSize:10,color:th.green,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:4}}><Ic p={P.checkO} s={11}/>{t.returned}</span>}
                  {!r.returnDate&&<span style={{fontSize:9,fontWeight:700,padding:"4px 10px",borderRadius:20,background:`${sc2}18`,color:sc2,border:`1px solid ${sc2}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{r.status}</span>}
                </div>
              </div>);
            })}
          </div>
        }
      </div>}

      {active==="students"&&<div>
        <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em",marginBottom:16}}>{t.students}</h1>
        <div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 90px",padding:"9px 16px",borderBottom:`1px solid ${th.border}`,background:th.surface}}>
            {["Student","Dept","Status","Loans",""].map(h=>(<span key={h} style={{fontSize:9,fontWeight:700,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Space Grotesk',sans-serif"}}>{h}</span>))}
          </div>
          {ADMIN_STUDENTS.map((s)=>{
            const myReqs=allReqs.filter(r=>r.sid===s.libId);
            const actL=myReqs.filter(r=>r.status==="approved"&&!r.returnDate).length;
            const susp=s.status==="suspended";
            return(<div key={s.id} className="rh" style={{display:"grid",gridTemplateColumns:"2fr 1.5fr 1fr 1fr 90px",padding:"12px 16px",borderBottom:`1px solid ${th.border}`,background:"transparent",transition:"background 0.2s",alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:10,flexDirection:isAr?"row-reverse":"row"}}>
                <div style={{width:32,height:32,borderRadius:9,background:`${s.color}22`,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:s.color,fontFamily:"'Space Grotesk',sans-serif"}}>{s.name[0]}</div>
                <div style={{textAlign:isAr?"right":"left"}}><p style={{fontSize:12,fontWeight:600,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{s.name}</p><p style={{fontSize:10,color:th.muted}}>{s.libId}</p></div>
              </div>
              <p style={{fontSize:11,color:th.sub}}>{s.dept}</p>
              <span style={{fontSize:9,fontWeight:600,padding:"2px 8px",borderRadius:20,width:"fit-content",background:susp?th.red+"18":th.green+"18",color:susp?th.red:th.green,border:`1px solid ${susp?th.red:th.green}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{s.status}</span>
              <span style={{fontSize:13,fontWeight:700,color:actL>0?th.prime:th.muted,fontFamily:"'Space Grotesk',sans-serif"}}>{actL}</span>
              <button onClick={()=>setSelStudent(s)} className="btn" style={{fontSize:10,fontWeight:700,color:th.prime,border:`1px solid ${th.prime}44`,borderRadius:8,padding:"6px 12px",background:th.prime+"10",fontFamily:"'Space Grotesk',sans-serif"}}>{t.studentDetail}</button>
            </div>);
          })}
        </div>
      </div>}

      {active==="announce"&&<div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,flexDirection:isAr?"row-reverse":"row"}}>
          <h1 style={{fontSize:25,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>Announcements</h1>
          <button onClick={()=>setComposing(true)} className="btn" style={{background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:11,padding:"8px 15px",color:"#fff",fontSize:12,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",gap:6,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.plus} s={13}/>{isAr?"إعلان جديد":"New Announcement"}</button>
        </div>
        {anns.length===0
          ?<div style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:14,padding:"30px",textAlign:"center"}}><div style={{color:th.muted,display:"flex",justifyContent:"center",marginBottom:11}}><Ic p={P.megaphone} s={40}/></div><p style={{fontSize:14,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"لا توجد إعلانات بعد":"No announcements yet"}</p></div>
          :<div style={{display:"flex",flexDirection:"column",gap:10}}>
            {anns.map((a,i)=>{const c=pc(a.priority);return(
              <div key={a.id} style={{background:th.card,border:`1px solid ${th.border}`,borderLeft:`4px solid ${c}`,borderRadius:13,padding:"15px 18px",display:"flex",gap:12,animation:`fadeUp 0.4s ${i*50}ms ease both`,flexDirection:isAr?"row-reverse":"row"}}>
                <div style={{width:36,height:36,borderRadius:10,background:`${c}18`,display:"flex",alignItems:"center",justifyContent:"center",color:c,flexShrink:0}}><Ic p={P.megaphone} s={15}/></div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:4,flexDirection:isAr?"row-reverse":"row"}}><h3 style={{fontSize:13,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{a.title}</h3><span style={{fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20,background:`${c}18`,color:c,border:`1px solid ${c}44`,fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase"}}>{a.priority}</span></div>
                  <p style={{fontSize:12,color:th.sub,lineHeight:1.65,marginBottom:5,fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{a.body}</p>
                  <p style={{fontSize:10,color:th.muted,display:"flex",alignItems:"center",gap:3,flexDirection:isAr?"row-reverse":"row"}}><Ic p={P.clock} s={10}/>{a.date} at {a.time}</p>
                </div>
                <button onClick={()=>delAnn(a.id)} className="btn" style={{width:27,height:27,borderRadius:8,background:th.red+"18",border:`1px solid ${th.red}44`,color:th.red,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}><Ic p={P.trash} s={12}/></button>
              </div>);})}
          </div>
        }
        {composing&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",backdropFilter:"blur(8px)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>setComposing(false)}>
          <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:19,padding:"26px",width:440,animation:"scaleIn 0.25s ease",direction:isAr?"rtl":"ltr"}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:17,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif",marginBottom:16}}>{isAr?"إعلان جديد":"New Announcement"}</h3>
            <div style={{marginBottom:12}}><label style={{fontSize:10,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"العنوان":"Title"}</label><input value={aTitle} onChange={e=>setATitle(e.target.value)} placeholder={isAr?"عنوان...":"Title..."} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"9px 12px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}/></div>
            <div style={{marginBottom:12}}><label style={{fontSize:10,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"الرسالة":"Message"}</label><textarea value={aBody} onChange={e=>setABody(e.target.value)} placeholder={isAr?"اكتب إعلانك...":"Your message..."} rows={3} style={{width:"100%",background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"9px 12px",color:th.text,fontSize:13,fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",resize:"none"}}/></div>
            <div style={{marginBottom:16}}><label style={{fontSize:10,color:th.sub,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:5,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"الأولوية":"Priority"}</label><div style={{display:"flex",gap:7}}>{[["normal",isAr?"عادي":"Normal",th.prime],["important",isAr?"مهم":"Important",th.amber],["urgent",isAr?"عاجل":"Urgent",th.red]].map(([id,label,c])=>(<button key={id} onClick={()=>setAPrio(id)} className="btn" style={{flex:1,background:aPrio===id?`${c}22`:"transparent",border:`1px solid ${aPrio===id?c+"66":th.border}`,borderRadius:9,padding:"8px",color:aPrio===id?c:th.sub,fontSize:12,fontWeight:600,fontFamily:"'Space Grotesk',sans-serif"}}>{label}</button>))}</div></div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={postAnn} className="btn" style={{flex:1,background:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:10,padding:"11px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><Ic p={P.megaphone} s={13}/>{isAr?"نشر":"Post"}</button>
              <button onClick={()=>setComposing(false)} className="btn" style={{flex:1,background:th.card,border:`1px solid ${th.border}`,borderRadius:10,padding:"11px",color:th.sub,fontSize:13,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr?"إلغاء":"Cancel"}</button>
            </div>
          </div>
        </div>}
      </div>}
    </main>
    {selStudent&&<StudentDetailModal th={th} t={t} isAr={isAr} student={selStudent} allReqs={allReqs} onClose={()=>setSelStudent(null)}/>}
  </div>);}

export default function BiblioTechApp(){
  const[page,setPage]=useState("landing");
  const[tn,setTn]=useState("dark");
  const[lang,setLang]=useState("en");
  const th=THEMES[tn];const t=TR[lang];const isAr=lang==="ar";
  const controls=<CtrlBar th={th} t={t} tn={tn} setTn={setTn} lang={lang} setLang={setLang} isAr={isAr} onBack={page!=="landing"?()=>setPage("landing"):null}/>;
  return(
    <><style>{makeCSS(th.bg)}</style>
    {page==="landing"&&<Landing th={th} t={t} tn={tn} setTn={setTn} lang={lang} setLang={setLang} isAr={isAr} onStudent={()=>setPage("student")} onAdmin={()=>setPage("admin")}/>}
    {page==="student"&&<StudentPortal th={th} t={t} isAr={isAr} tn={tn} setTn={setTn} lang={lang} setLang={setLang} onBack={()=>setPage("landing")}/>}
    {page==="admin"&&<AdminPanel th={th} t={t} isAr={isAr} controls={controls} tn={tn} setTn={setTn} lang={lang} setLang={setLang}/>}
    </>
  );
}

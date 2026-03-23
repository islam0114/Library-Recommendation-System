/**
 * Page: BookDetail
 * Purpose: Displays full details of a single book, allows borrowing/adding to wishlist.
 * Includes AI-powered similar books recommendations and user reviews.
 */

import React, { useState, useEffect } from "react";
import { Ic, P } from "../components/Icons";
import BookCard, { Cover, deptColor } from "../components/BookCard";
import { translateCat } from "../locales/ar_en";

export default function BookDetail({
  th, t, isAr, book, sc, wishlist, toggleWishlist, 
  studentReqStatus, requests, sendBorrowRequest, reqFlash, 
  onBack, daysLeft, daysColor, BOOKS, onBook
}) {
  const s = sc(book.status); 
  const dc = deptColor(book.dept);
  const sst = studentReqStatus(book.id);
  const inWl = wishlist.includes(book.id);
  const activeReq = requests.find(r => r.bid === book.id && r.status === "approved" && !r.returnDate);
  const days = activeReq ? daysLeft(activeReq.dueDateISO) : null;
  const justFlashed = reqFlash === book.id;
  const btnLabel = sst === "approved" ? t.reqBorrowed : sst === "pending" ? t.reqPending : justFlashed ? `✓ ${t.reqSent}` : t.borrow;
  const btnDisabled = sst === "approved" || sst === "pending" || book.status === "coming_soon";

  const [similarBooks, setSimilarBooks] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(true);
  
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setLoadingSimilar(true);
    const bookIdNum = book.book_id || parseInt((book.id || "").replace("DB", ""), 10) || 0;
    fetch("http://localhost:8000/api/similar-books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookIdNum, num_recommendations: 5 })
    })
    .then(res => res.json())
    .then(data => {
        if(data.similar_books && BOOKS) {
            const recs = data.similar_books.map(sb => BOOKS.find(b => b.book_id === sb.recommended_book_id || b.id === `DB${String(sb.recommended_book_id).padStart(4, '0')}`)).filter(Boolean);
            setSimilarBooks(recs);
        }
    })
    .catch(err => console.error("Similar books error:", err))
    .finally(() => setLoadingSimilar(false));

    // Fetch Reviews
    setLoadingReviews(true);
    fetch(`http://localhost:8000/api/books/${book.id}/reviews`)
      .then(res => res.json())
      .then(data => {
        if(data.reviews) setReviews(data.reviews);
      })
      .catch(err => console.error("Reviews error:", err))
      .finally(() => setLoadingReviews(false));
  }, [book.id, BOOKS]);

  const submitReview = async () => {
    if(!reviewText.trim()) return;
    setSubmittingReview(true);
    const token = sessionStorage.getItem("bt_token");
    try {
        const res = await fetch(`http://localhost:8000/api/books/${book.id}/reviews`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            },
            body: JSON.stringify({ review_text: reviewText, rating: reviewRating })
        });
        if(res.ok) {
            setReviewText("");
            setReviewRating(5);
            const rRes = await fetch(`http://localhost:8000/api/books/${book.id}/reviews`);
            const rData = await rRes.json();
            if(rData.reviews) setReviews(rData.reviews);
        }
    } catch(err) {
        console.error("Submit review error:", err);
    } finally {
        setSubmittingReview(false);
    }
  };

  // 👇 حساب التقييم الفعلي بناءً على المراجعات الموجودة (المتوسط) 👇
  const actualRating = reviews.length > 0 
    ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length).toFixed(1) 
    : (book.avg_rating || book.rating || "0.0");
    
  // استخراج عدد النسخ المتاحة بشكل آمن
  const availableCopiesCount = book.copies_avail !== undefined ? book.copies_avail : (book.copies_available || 0);

  return(
    <div style={{padding:"24px",maxWidth:820,margin:"0 auto",animation:"fadeIn 0.4s ease"}}>
      
      <button onClick={onBack} className="btn" style={{display:"flex",alignItems:"center",gap:7,border:`1px solid ${th.border}`,borderRadius:9,padding:"7px 14px",color:th.text,fontSize:13,fontWeight:600,marginBottom:20,flexDirection:"row"}}>
        <Ic p={isAr ? P.chevronR : P.chevronL} s={15}/>{t.back}
      </button>

      <div style={{display:"grid",gridTemplateColumns:"240px 1fr",gap:28,position: "relative", zIndex: 1}}>
        <div>
          <div style={{borderRadius:14,overflow:"hidden",border:`2px solid ${dc}44`,boxShadow:`0 18px 48px ${book.cover[1]}40`,animation:"float 4s ease infinite", position:"relative", zIndex:0}}><Cover colors={book.cover} h={320} imageUrl={book.image_proxy_url||book.image_url}/></div>
          {days!==null&&<div style={{marginTop:12,background:daysColor(days,th)+"18",border:`1px solid ${daysColor(days,th)}44`,borderRadius:11,padding:"10px 14px",textAlign:"center"}}>
            <p style={{fontSize:22,fontWeight:700,color:daysColor(days,th),fontFamily:"'Space Grotesk',sans-serif"}}>{Math.abs(days)}</p>
            <p style={{fontSize:11,color:daysColor(days,th),fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{days<0?t.overdueLbl:days===0?t.dueToday:t.daysLeft}</p>
            {activeReq&&<p style={{fontSize:10,color:th.muted,marginTop:4}}>{t.returnBy}: {activeReq.dueDate}</p>}
          </div>}
        </div>
        <div style={{position: "relative", zIndex: 10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,flexDirection:"row", flexWrap: "wrap"}}>
            
            <span style={{background:dc+"22",color:dc,border:`1px solid ${dc}44`,fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>
              {translateCat(book.dept || "Reference", isAr)}
            </span>
            
            <span style={{background:s.c+"18",color:s.c,border:`1px solid ${s.c}44`,fontSize:11,fontWeight:600,padding:"3px 11px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",textTransform:"capitalize"}}>{s.label}</span>
            {book.isNew&&<span style={{background:th.prime+"18",color:th.prime,border:`1px solid ${th.prime}44`,fontSize:11,fontWeight:700,padding:"3px 11px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>NEW</span>}
          </div>
          <h1 style={{fontSize:23,fontWeight:700,color:th.text,lineHeight:1.25,marginBottom:7,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.02em"}}>{book.title}</h1>
          <p style={{fontSize:13,color:th.sub,marginBottom:6}}>{isAr?"بقلم":"by"} <strong style={{color:th.text}}>{book.author}</strong></p>
          
          {/* 👇 تعديل النجوم لتعرض التقييم الفعلي والنص ليعرض النسخ المتاحة 👇 */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,flexDirection:"row"}}>
            <span style={{display:"flex",alignItems:"center",gap:4,color:th.amber,fontSize:15,fontWeight:700}}>
              <Ic p={P.star} s={16} fill color={th.amber}/>
              {actualRating} <span style={{fontSize: 12, color: th.muted, fontWeight: 500}}>({reviews.length} {isAr ? "تقييم" : "reviews"})</span>
            </span>
            <span style={{fontSize:13, color:th.prime, fontWeight:700, background: th.prime+"18", padding: "4px 10px", borderRadius: 8, border: `1px solid ${th.prime}44`}}>
              {availableCopiesCount} {isAr ? "نسخة متاحة للطلب" : "Available Copies"}
            </span>
          </div>
          
          <p style={{fontSize:14,color:th.text,opacity:0.9,lineHeight:1.8,marginBottom:24,background:th.surface,border:`1px solid ${th.border}`,borderRadius:11,padding:"14px 16px",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{book.desc}</p>
          
          <div style={{display:"flex",gap:10,flexDirection:"row"}}>
            <button onClick={()=>{if(!btnDisabled)sendBorrowRequest(book);}} className="btn" disabled={btnDisabled} style={{flex:2,background:btnDisabled?(justFlashed?th.green+"44":th.dim):justFlashed?th.green:`linear-gradient(135deg,${th.prime},${th.primeD})`,borderRadius:11,padding:"13px",color:btnDisabled&&!justFlashed?"#777":"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",cursor:btnDisabled&&!justFlashed?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:7,transition:"all 0.3s"}}><Ic p={P.bookOpen} s={14}/>{btnLabel}</button>
            <button onClick={()=>toggleWishlist(book.id)} className="btn" style={{flex:1,background:inWl?th.red+"15":th.surface,border:`1px solid ${inWl?th.red+"44":th.border}`,borderRadius:11,padding:"13px",color:inWl?th.red:th.sub,fontSize:12,fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center",gap:6,flexDirection:"row"}}>
              <Ic p={P.heart} s={13} fill={inWl} color={inWl?th.red:th.sub}/>{inWl?t.inWishlist:t.addWishlist}
            </button>
          </div>
        </div>
      </div>

      {/* Similar Books Section */}
      <div style={{marginTop: 48, paddingTop: 32, borderTop: `1px solid ${th.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,flexDirection:"row"}}>
          <div style={{width:4,height:24,borderRadius:4,background:`linear-gradient(180deg,${th.prime},${th.primeD})`}}/>
          <h2 style={{fontSize:20,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr ? "كتب مشابهة" : "Similar Books"}</h2>
        </div>
        {loadingSimilar ? (
          <div style={{display: "flex", gap: 18, overflowX: "auto", paddingBottom: 16}}>
            {[1,2,3,4,5].map(i => <div key={i} style={{width: 160, height: 260, borderRadius: 16, background: th.card, border: `1px solid ${th.border}`, animation: "blink 1.5s ease infinite", flexShrink: 0}}/>)}
          </div>
        ) : similarBooks.length > 0 ? (
          <div className="no-scroll" style={{display: "flex", gap: 18, overflowX: "auto", paddingBottom: 16, flexDirection: "row"}}>
            {similarBooks.map(bk => (
              <div key={bk.id} style={{width: 160, flexShrink: 0}}>
                <BookCard bk={bk} th={th} sc={sc} onClick={() => onBook(bk)} wishlist={wishlist} onToggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} isAr={isAr}/>
              </div>
            ))}
          </div>
        ) : (
          <p style={{fontSize:13,color:th.sub}}>{isAr ? "لا توجد كتب مشابهة حالياً." : "No similar books found."}</p>
        )}
      </div>

      {/* Reviews Section */}
      <div style={{marginTop: 48, paddingTop: 32, borderTop: `1px solid ${th.border}`}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:24,flexDirection:"row"}}>
          <div style={{width:4,height:24,borderRadius:4,background:`linear-gradient(180deg,${th.amber},${th.amber}D0)`}}/>
          <h2 style={{fontSize:20,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr ? "المراجعات والتعليقات" : "Reviews & Comments"}</h2>
        </div>
        
        {/* Add Review Box */}
        <div style={{background:th.surface,border:`1px solid ${th.border}`,borderRadius:16,padding:20,marginBottom:32}}>
          <h3 style={{fontSize:15,fontWeight:700,color:th.text,marginBottom:12,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr ? "أضف تقييمك" : "Add your review"}</h3>
          <div style={{display: "flex", gap: 6, marginBottom: 12, flexDirection: "row"}}>
            {[1,2,3,4,5].map(star => (
              <button key={star} onClick={() => setReviewRating(star)} className="btn" style={{background: "none", border: "none", padding: 0, cursor: "pointer"}}>
                <Ic p={P.star} s={22} fill={star <= reviewRating} color={star <= reviewRating ? th.amber : th.border}/>
              </button>
            ))}
          </div>
          <textarea 
            value={reviewText} 
            onChange={e => setReviewText(e.target.value)} 
            placeholder={isAr ? "اكتب رأيك أو تعليقك هنا..." : "Write your review or comment here..."}
            style={{width:"100%",background:th.bg,border:`1px solid ${th.border}`,borderRadius:12,padding:"12px 16px",color:th.text,fontSize:14,fontFamily:"'Plus Jakarta Sans',sans-serif",minHeight:100,outline:"none",resize:"vertical",marginBottom:12}}
          />
          <div style={{display: "flex", justifyContent: "flex-end"}}>
            <button onClick={submitReview} disabled={submittingReview || !reviewText.trim()} className="btn" style={{background:`linear-gradient(135deg,${th.amber},#b45309)`,borderRadius:10,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",opacity: (submittingReview || !reviewText.trim()) ? 0.6 : 1, cursor: (submittingReview || !reviewText.trim()) ? "not-allowed" : "pointer"}}>
              {submittingReview ? (isAr ? "جاري الإرسال..." : "Submitting...") : (isAr ? "إرسال التعليق" : "Submit Review")}
            </button>
          </div>
        </div>

        {/* Reviews List */}
        <div>
          {loadingReviews ? (
            <div style={{display: "flex", flexDirection: "column", gap: 16}}>
              {[1,2,3].map(i => <div key={i} style={{width: "100%", height: 100, borderRadius: 16, background: th.card, border: `1px solid ${th.border}`, animation: "blink 1.5s ease infinite"}}/>)}
            </div>
          ) : reviews.length > 0 ? (
            <div style={{display: "flex", flexDirection: "column", gap: 16}}>
              {reviews.map(rev => (
                <div key={rev.id} style={{background:th.card,border:`1px solid ${th.border}`,borderRadius:16,padding:20,animation:"fadeUp 0.4s ease both"}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexDirection:"row"}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,flexDirection:"row"}}>
                      <div style={{width:36,height:36,borderRadius:12,background:`${th.amber}18`,display:"flex",alignItems:"center",justifyContent:"center",color:th.amber,fontWeight:700,fontFamily:"'Space Grotesk',sans-serif",fontSize:14}}>
                        {rev.user_name[0].toUpperCase()}
                      </div>
                      <div>
                        <p style={{fontSize:14,fontWeight:700,color:th.text,fontFamily:"'Space Grotesk',sans-serif"}}>{rev.user_name}</p>
                        <p style={{fontSize:11,color:th.muted,marginTop:2}}>{rev.created_at}</p>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:4,flexDirection:"row"}}>
                      {[1,2,3,4,5].map(star => <Ic key={star} p={P.star} s={14} fill={star <= rev.rating} color={star <= rev.rating ? th.amber : th.border}/>)}
                    </div>
                  </div>
                  <p style={{fontSize:14,color:th.text,opacity:0.9,lineHeight:1.7,fontFamily:"'Plus Jakarta Sans',sans-serif",whiteSpace:"pre-wrap"}}>{rev.review_text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: "center", padding: "40px 0", background: th.surface, borderRadius: 16, border: `1px dashed ${th.border}`}}>
               <div style={{color:th.muted,display:"flex",justifyContent:"center",marginBottom:14}}><Ic p={P.social} s={40}/></div>
               <p style={{fontSize:15,fontWeight:700,color:th.text,marginBottom:8,fontFamily:"'Space Grotesk',sans-serif"}}>{isAr ? "لا توجد تقييمات بعد" : "No reviews yet"}</p>
               <p style={{fontSize:13,color:th.sub}}>{isAr ? "كن أول من يشارك رأيه حول هذا الكتاب!" : "Be the first to share your thoughts on this book!"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
/**
 * Component: BookCard
 * Purpose: Renders a single book item with its cover, details, status badge, and quick actions.
 */

import React, { useState, useEffect } from "react";
import { Ic, P } from "./Icons";

// 1. Department Color Mapping Utility
export const deptColor = (d) => {
  const c = {
    "Computer Science": "#06b6d4", "Mathematics": "#6366f1", "Physics": "#8b5cf6",
    "Medical": "#ef4444", "Science": "#10b981", "Architecture": "#f59e0b",
    "Business & Economics": "#14b8a6", "Law": "#64748b", "Social Science": "#ec4899",
    "Education": "#f43f5e", "History": "#d97706", "Philosophy": "#8b5cf6",
    "Language Arts & Disciplines": "#0ea5e9", "Psychology": "#f59e0b",
    "Technology & Engineering": "#3b82f6", "Computers": "#06b6d4", "Reference": "#64748b"
  };
  return c[d] || "#64748b";
};

// 2. Enhanced Cover Component with Fallback Icon
export function Cover({ children, colors, h = 240, imageUrl }) {
  const [imgError, setImgError] = useState(false); 

  return (
    <div style={{ 
      height: h, 
      width: "100%", 
      position: "relative", 
      background: `linear-gradient(135deg, ${colors?.[0]||"#2a3348"}, ${colors?.[1]||"#1a1f2e"})`,
      overflow: "hidden", 
      display: "flex", 
      alignItems: "center",
      justifyContent: "center"
    }}>
      {/* Render image if URL exists and no loading error occurred */}
      {imageUrl && !imgError && (
        <img 
          src={imageUrl} 
          alt="Book Cover"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", position: "absolute", top: 0, left: 0, zIndex: 1 }}
          onError={() => setImgError(true)} 
        />
      )}
      
      {/* Fallback placeholder if image is missing or failed to load */}
      {(imgError || !imageUrl) && (
        <div style={{ zIndex: 1, color: "rgba(255,255,255,0.15)", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <Ic p={P.book} s={48} />
        </div>
      )}
      
      {/* Gradient overlays and child elements (badges, buttons) */}
      <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60px", background: "linear-gradient(to bottom, rgba(0,0,0,0.6), transparent)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "40px", background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }} />
        {children}
      </div>
    </div>
  );
}

// 3. Main BookCard Component
export default function BookCard({ bk, th, sc, onClick, wishlist, onToggleWishlist, studentReqStatus, isAr }) {
  const [hov, setHov] = useState(false);
  
  // State management for dynamic ratings and review counts
  const [actualRating, setActualRating] = useState(bk.avg_rating || bk.rating || "0.0");
  const [reviewCount, setReviewCount] = useState(0);

  const s = sc(bk.status); 
  const dc = deptColor(bk.dept);
  const inWl = wishlist ? wishlist.includes(bk.id) : false;
  const sst = studentReqStatus ? studentReqStatus(bk.id) : null;

  const availableCopies = bk.copies_avail !== undefined ? bk.copies_avail : (bk.copies_available || 0);
  const isOutOfStock = availableCopies <= 0;
  const availColor = isOutOfStock ? th.red : th.prime;
  const availText = isOutOfStock ? (isAr ? "نفدت النسخ" : "Out of Stock") : `${availableCopies} ${isAr ? "متاح" : "Avail."}`;

  // Automatically fetch and calculate the average rating based on actual book reviews
  useEffect(() => {
    let isMounted = true;
    
    fetch(`http://localhost:8000/api/books/${bk.id}/reviews`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.reviews) {
          setReviewCount(data.reviews.length);
          
          // Calculate the average rating if reviews exist
          if (data.reviews.length > 0) {
            const sum = data.reviews.reduce((acc, rev) => acc + rev.rating, 0);
            setActualRating((sum / data.reviews.length).toFixed(1)); 
          }
        }
      })
      .catch(err => console.log("Reviews fetch error hidden for performance"));
      
    return () => { isMounted = false; };
  }, [bk.id]);
  
  return (
    <div 
      onMouseEnter={() => setHov(true)} 
      onMouseLeave={() => setHov(false)} 
      onClick={onClick} 
      style={{
        background: hov ? th.card2 || th.card : th.card, 
        borderRadius: 13, 
        overflow: "hidden", 
        border: `1px solid ${hov ? dc + "55" : th.border}`, 
        cursor: "pointer", 
        boxShadow: hov ? `0 14px 36px ${dc}22` : "0 2px 8px rgba(0,0,0,0.25)", 
        transform: hov ? "translateY(-5px) scale(1.02)" : "translateY(0)", 
        transition: "all 0.3s cubic-bezier(0.34,1.2,0.64,1)",
        display: "flex", 
        flexDirection: "column"
      }}
    >
      <Cover colors={bk.cover} h={240} imageUrl={bk.image_proxy_url || bk.image_url}>
        <div style={{position:"absolute",top:7,left:7,background:s.c+"22",color:s.c,border:`1px solid ${s.c}44`,fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",textTransform:"uppercase"}}>{s.label}</div>
        {bk.isNew && <div style={{position:"absolute",top:7,right:onToggleWishlist?32:7,background:th.prime,color:"#fff",fontSize:8,fontWeight:700,padding:"2px 7px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif"}}>NEW</div>}
        
        {onToggleWishlist && (
          <button onClick={e => { e.stopPropagation(); onToggleWishlist(bk.id); }} className="btn" style={{position:"absolute",top:5,right:5,width:26,height:26,borderRadius:8,background:"rgba(0,0,0,0.55)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <Ic p={P.heart} s={12} fill={inWl} color={inWl?th.red:"rgba(255,255,255,0.8)"}/>
          </button>
        )}
        
        {sst === "approved" && <div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",background:th.green+"ee",color:"#fff",fontSize:8,fontWeight:700,padding:"2px 9px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",whiteSpace:"nowrap"}}>✓ Yours</div>}
        {sst === "pending" && <div style={{position:"absolute",bottom:6,left:"50%",transform:"translateX(-50%)",background:th.amber+"ee",color:"#fff",fontSize:8,fontWeight:700,padding:"2px 9px",borderRadius:20,fontFamily:"'Space Grotesk',sans-serif",whiteSpace:"nowrap"}}>⏳ Pending</div>}
      </Cover>

      <div style={{padding:"10px 12px 14px", display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between"}}>
        <div>
          <p style={{fontSize:12,fontWeight:700,color:th.text,lineHeight:1.4,marginBottom:3,fontFamily:"'Space Grotesk',sans-serif",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{bk.title}</p>
          <p style={{fontSize:10,color:th.sub,marginBottom:12,fontFamily:"'Plus Jakarta Sans',sans-serif",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>{bk.author}</p>
        </div>
        
        {/* Render calculated rating and dynamic availability badge */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center", borderTop: `1px solid ${th.border}`, paddingTop: 10, marginTop: "auto"}}>
          <span style={{fontSize:11,color:th.amber,display:"flex",alignItems:"center",gap:4,fontFamily:"'Space Grotesk',sans-serif",fontWeight:700}}>
            <Ic p={P.star} s={11} fill color={th.amber}/>
            {actualRating}
            {reviewCount > 0 && <span style={{fontSize: 9, color: th.muted, fontWeight: 500}}>({reviewCount})</span>}
          </span>
          
          <span style={{fontSize:10,color:availColor, fontWeight:700, background: availColor+"18", padding: "3px 8px", borderRadius: 8, border: `1px solid ${availColor}33`}}>
            {availText}
          </span>
        </div>
      </div>
    </div>
  );
}
/**
 * Page: ExplorePage
 * Purpose: Provides a search and filtering interface for the library catalog with infinite scrolling capabilities.
 * Interactions: Search by title/author, filter by department, and view book details.
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Ic, P } from "../components/Icons";
import BookCard from "../components/BookCard";
import { translateCat } from "../locales/ar_en";

export default function ExplorePage({ th, t, isAr, searchQ, setSearchQ, exploreFilter, setExploreFilter, sc, wishlist, toggleWishlist, studentReqStatus, onBook, books, depts, booksLoading }) {
  
  const [visibleCount, setVisibleCount] = useState(24);

// تصفير العداد لـ 24 والعودة لأعلى الصفحة لما الطالب يبحث أو يغير القسم
  useEffect(() => {
    setVisibleCount(24);
    
    // السطر ده هيرجع السكرول لأول الصفحة فوراً مع كل تغيير للقسم أو البحث
    window.scrollTo({ 
      top: 0, 
      left: 0, 
      behavior: "instant" // ممكن تخليها "smooth" لو عايزها تطلع بنعومة
    });
    
  }, [searchQ, exploreFilter]);

  // 1. الطريقة الاحترافية لمراقبة العناصر المخفية (Callback Ref)
  const observer = useRef(null);
  const loaderRef = useCallback((node) => {
    // لو فيه مراقب قديم، افصله عشان منعملش زحمة
    if (observer.current) observer.current.disconnect();

    // إنشاء مراقب جديد
    observer.current = new IntersectionObserver((entries) => {
      // لو علامة التحميل ظهرت في الشاشة
      if (entries[0].isIntersecting) {
        setVisibleCount(prevCount => prevCount + 24);
      }
    }, { 
      threshold: 0.1, 
      rootMargin: "300px" // يحمل قبل ما نوصل للآخر بـ 300 بيكسل
    });

    // لو علامة التحميل موجودة حالياً في الـ DOM، راقبها
    if (node) observer.current.observe(node);
  }, []);

  // فلترة الكتب بناءً على البحث والقسم
  let filtered = books;
  if (exploreFilter !== "All") filtered = filtered.filter(b => b.dept === exploreFilter);
  if (searchQ) {
    const q = searchQ.toLowerCase();
    filtered = filtered.filter(b => (b.title || "").toLowerCase().includes(q) || (b.author || "").toLowerCase().includes(q));
  }

  // قص المصفوفة لعرض العدد المسموح به فقط
  const displayedBooks = filtered.slice(0, visibleCount);

// ... (باقي الكود والـ return زي ما هما بالظبط بدون أي تغيير)

  return (
    <div style={{ direction: isAr ? "rtl" : "ltr", display: "flex", flexDirection: "column", minHeight: "100vh", paddingBottom: 60 }}>
      
      {/* STICKY HEADER */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${th.bg}E6`, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderBottom: `1px solid ${th.border}`, padding: "24px", display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", width: "100%" }}>
          
          {/* Headline & Search Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", marginBottom: 20 }}>
            <div style={{ flex: "1 1 300px" }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: th.text, fontFamily: "'Space Grotesk',sans-serif", marginBottom: 6 }}>
                {isAr ? "استكشف المكتبة" : "Explore Library"}
              </h1>
              <p style={{ fontSize: 13, color: th.sub }}>
                {isAr ? "ابحث وتصفح آلاف الكتب في مختلف الأقسام" : "Search and browse thousands of books across all departments"}
              </p>
            </div>

            <div style={{ flex: "2 1 400px", position: "relative" }}>
              <div style={{ position: "absolute", [isAr ? "right" : "left"]: 18, top: "50%", transform: "translateY(-50%)", color: th.sub, pointerEvents: "none" }}>
                <Ic p={P.search || "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"} s={20} />
              </div>
              <input 
                type="text" 
                value={searchQ || ""} 
                onChange={(e) => setSearchQ(e.target.value)} 
                placeholder={isAr ? "ابحث باسم الكتاب، المؤلف، أو الكلمة المفتاحية..." : "Search by title, author, or keyword..."}
                style={{ width: "100%", height: 52, background: th.surface, border: `1px solid ${th.border}`, borderRadius: 16, padding: isAr ? "0 48px 0 20px" : "0 20px 0 48px", color: th.text, fontSize: 14, fontFamily: "'Plus Jakarta Sans',sans-serif", outline: "none", boxShadow: `inset 0 2px 4px rgba(0,0,0,0.02)`, transition: "all 0.2s" }}
                onFocus={(e) => { e.target.style.borderColor = th.prime; e.target.style.boxShadow = `0 0 0 3px ${th.prime}22`; }}
                onBlur={(e) => { e.target.style.borderColor = th.border; e.target.style.boxShadow = `inset 0 2px 4px rgba(0,0,0,0.02)`; }}
              />
            </div>
          </div>

            {/* CATEGORIES */}
            <div className="no-scroll" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 12, flexDirection: "row", scrollSnapType: "x mandatory" }}>
              {[...new Set(["All", ...depts])].map(cat => (
                <button
                  key={cat}
                  onClick={() => setExploreFilter(cat)}
                  className="btn"
                  style={{
                    padding: "8px 16px",
                    borderRadius: 12,
                    background: exploreFilter === cat ? th.prime : "transparent",
                    border: `1px solid ${exploreFilter === cat ? th.prime : th.border}`,
                    color: exploreFilter === cat ? "#fff" : th.sub,
                    fontSize: 13,
                    fontWeight: exploreFilter === cat ? 700 : 500,
                    whiteSpace: "nowrap",
                    scrollSnapAlign: "start",
                    fontFamily: "'Space Grotesk',sans-serif",
                    boxShadow: exploreFilter === cat ? `0 4px 12px ${th.prime}40` : "none"
                  }}
                >
                  {cat === "All" ? (isAr ? "الكل" : "All") : translateCat(cat, isAr)}
                </button>
              ))}
            </div>
        </div>
      </div>

      {/* BOOKS GRID */}
      <div style={{ padding: "32px 24px", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        {booksLoading ? (
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 24 }}>
             {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <div key={i} style={{width: "100%", height: 320, borderRadius: 16, background: th.card, border: `1px solid ${th.border}`, animation: "blink 1.5s ease infinite"}}/>)}
           </div>
        ) : filtered.length > 0 ? (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <p style={{ fontSize: 14, color: th.sub, fontWeight: 600 }}>
                {isAr ? `تم العثور على ${filtered.length} كتاب` : `Found ${filtered.length} books`}
              </p>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 24 }}>
              {displayedBooks.map((bk) => (
                <div key={bk.id} style={{ width: "100%", animation: "fadeUp 0.4s ease both" }}>
                  <BookCard bk={bk} th={th} sc={sc} onClick={() => onBook(bk)} wishlist={wishlist} onToggleWishlist={toggleWishlist} studentReqStatus={studentReqStatus} isAr={isAr} />
                </div>
              ))}
            </div>

            {/* 3. نقطة المراقبة الخفية (بديل لزرار Load More) */}
            {visibleCount < filtered.length && (
              <div ref={loaderRef} style={{ width: "100%", height: 60, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 24 }}>
                {/* علامة تحميل دائرية بتلف بتدي شكل شيك وإنت بتنزل */}
                <div style={{ width: 26, height: 26, border: `3px solid ${th.border}`, borderTopColor: th.prime, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", background: th.surface, borderRadius: 24, border: `1px dashed ${th.border}` }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: th.card, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: th.muted }}>
              <Ic p={P.search || "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"} s={32} />
            </div>
            <h3 style={{ fontSize: 18, color: th.text, marginBottom: 8 }}>{isAr ? "لم نجد أي كتب مطابقة" : "No books found"}</h3>
            <p style={{ color: th.sub, fontSize: 14 }}>{isAr ? "جرب البحث بكلمات مختلفة أو اختر قسماً آخر." : "Try searching with different keywords or select another department."}</p>
          </div>
        )}
      </div>

    </div>
  );
}

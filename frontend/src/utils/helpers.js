import { useState, useEffect, useCallback } from "react";
import { P } from "../components/Icons";

const API_BASE = "http://localhost:8000";

export const STATIC_DEPTS = [
  "All", "architecture", "business & economics", "computers", "education", "history", 
  "language arts & disciplines", "law", "literary criticism", "mathematics", 
  "medical", "philosophy", "political science", "psychology", "reference", 
  "science", "social science", "technology & engineering"
];

export const DEPT_ICONS = { 
  "All": P.explore, "computers": P.lib, "technology & engineering": P.spark, 
  "medical": P.heart, "science": P.star, "business & economics": P.arrowR, 
  "history": P.bookOpen, "philosophy": P.book, "psychology": P.bot, 
  "education": P.check, "law": P.shield, "social science": P.student, 
  "political science": P.globe, "literary criticism": P.bookOpen, 
  "language arts & disciplines": P.bookOpen, "architecture": P.home, 
  "reference": P.search, "mathematics": P.plus 
};

export const proxyImg = (url) => {
  if (!url) return "";
  if (url.startsWith("/api/book-cover/")) return `${API_BASE}${url}`;
  if (url.startsWith(API_BASE)) return url;
  return `${API_BASE}/api/image-proxy?url=${encodeURIComponent(url)}`;
};

export const makeCSS = bg => `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:${bg};}::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-thumb{background:#1a2035;border-radius:6px;}input::placeholder,textarea::placeholder{color:#4a5568;}@keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}@keyframes floatR{0%,100%{transform:translateY(0) rotate(1deg)}50%{transform:translateY(-10px) rotate(-1deg)}}@keyframes glow{0%,100%{box-shadow:0 0 26px #0d948838}50%{box-shadow:0 0 52px #0d948868}}@keyframes marquee{0%{transform:translateX(100vw)}100%{transform:translateX(-100%)}}@keyframes rippleFade{0%{opacity:0.6;transform:scale(0.8)}100%{opacity:0;transform:scale(1.6)}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}.btn{transition:all .2s ease;cursor:pointer;border:none;background:none;}.btn:hover{filter:brightness(1.08);transform:translateY(-1px);}.btn:active{transform:scale(.97);}.rh:hover{background:rgba(255,255,255,0.028)!important;}`;

export const daysLeft = iso => { if (!iso) return null; return Math.ceil((new Date(iso + "T23:59:59") - new Date()) / 864e5); };
export const daysColor = (d, th) => { if (d === null) return th.muted; if (d <= 0) return th.red; if (d <= 3) return th.red; if (d <= 7) return th.amber; return th.green; };
export const daysLabel = (d, t) => { if (d === null) return ""; if (d < 0) return `${t.overdueLbl} ${Math.abs(d)}d`; if (d === 0) return t.dueToday; return `${d} ${t.daysLeft}`; };

export function useBooks(AI_API_URL) {
  const [books, setBooks] = useState([]);
  const [depts, setDepts] = useState(STATIC_DEPTS);
  const [booksLoading, setBooksLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      const res = await fetch(`${AI_API_URL}/api/books`);
      if (res.ok) {
        const data = await res.json();
        const b = data.books || [];
        setBooks(b);
        const ud = ["All", ...Array.from(new Set(b.map(x => x.dept))).filter(g => g && g !== "All").sort((a, b) => a.localeCompare(b))];
        setDepts(ud);
      }
    } catch (err) {
    } finally {
      setBooksLoading(false);
    }
  }, [AI_API_URL]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { books, depts, booksLoading, fetchBooks };
}
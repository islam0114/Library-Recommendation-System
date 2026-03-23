/**
 * File: BiblioTechApp.jsx
 * Purpose: Main application entry point and root router.
 * Responsibilities: Manages global state (theme, language, active page) and orchestrates 
 * top-level portals (Landing, Student, Admin) over a persistent animated background.
 */

import React, { useState, useEffect } from "react";
import Landing from "./LandingPage";
import AdminPortal from "./AdminPortal";
import StudentPortal from "./StudentPortal";
import { CtrlBar } from "../components/SharedComponents";
import ParticleBackground from "../components/ParticleBackground";
import { THEMES } from "../styles/theme";
import { TR } from "../locales/ar_en";
import { makeCSS } from "../utils/helpers";

export default function BiblioTechApp() {
  // --- Global App State ---
  const [page, setPage] = useState("landing");
  const [tn, setTn] = useState("dark");
  const [lang, setLang] = useState("en");
  
  const th = THEMES[tn]; 
  const t = TR[lang]; 
  const isAr = lang === "ar";
  
  // Top control bar (Theme/Language toggler) for Landing and Admin pages
  const controls = (
    <CtrlBar 
      th={th} t={t} tn={tn} setTn={setTn} lang={lang} setLang={setLang} isAr={isAr} 
      onBack={page !== "landing" ? () => setPage("landing") : null} 
    />
  );

  // Scroll to top automatically on page change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [page]);

  return (
    <div style={{ background: th.bg, minHeight: "100vh", position: "relative", zIndex: 0, overflowX: "hidden", width: "100vw" }}>
      <style>{`
        ${makeCSS(th.bg)}
        /* Magic CSS to make main portals transparent, allowing the animated particles to show through */
        .transparent-portals > div { background: transparent !important; }
      `}</style>
      
      {/* Global Animated Particle Background */}
      <ParticleBackground />

      {/* Wrapper container rendering the active portal */}
      <div className="transparent-portals" style={{ position: "relative", zIndex: 1 }}>
        
        {/* Landing Page */}
        {page === "landing" && (
          <Landing 
            th={th} t={t} tn={tn} setTn={setTn} lang={lang} setLang={setLang} isAr={isAr} 
            onStudent={() => setPage("student")} 
            onAdmin={() => setPage("admin")} 
          />
        )}
        
        {/* Student Portal */}
        {page === "student" && (
          <StudentPortal 
            th={th} t={t} isAr={isAr} tn={tn} setTn={setTn} lang={lang} setLang={setLang} 
            onBack={() => setPage("landing")} 
          />
        )}
        
        {/* Admin Portal */}
        {page === "admin" && (
          <AdminPortal 
            th={th} t={t} isAr={isAr} controls={controls} tn={tn} setTn={setTn} lang={lang} setLang={setLang} 
          />
        )}
        
      </div>
    </div>
  );
}
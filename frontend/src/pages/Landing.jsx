import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: '#08090d',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Outfit', 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Bebas+Neue&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px #f9731640} 50%{box-shadow:0 0 50px #f9731670} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .card:hover { transform: translateY(-8px) scale(1.02) !important; border-color: var(--accent) !important; box-shadow: 0 24px 60px rgba(0,0,0,0.5) !important; }
        .card { transition: all 0.3s cubic-bezier(0.34,1.2,0.64,1) !important; cursor: pointer; }
      `}</style>

      {/* BG orbs */}
      <div style={{ position:'absolute', top:'-10%', left:'-5%', width:400, height:400,
        borderRadius:'50%', background:'#f9731610', filter:'blur(100px)', pointerEvents:'none' }}/>
      <div style={{ position:'absolute', bottom:'-10%', right:'-5%', width:350, height:350,
        borderRadius:'50%', background:'#06b6d410', filter:'blur(100px)', pointerEvents:'none' }}/>

      {/* Logo */}
      <div style={{ textAlign:'center', marginBottom:56, animation:'fadeUp 0.6s ease' }}>
        <div style={{ fontSize:64, marginBottom:16, animation:'float 3s ease infinite' }}>📚</div>
        <h1 style={{
          fontSize:64, fontWeight:900, fontFamily:"'Bebas Neue',sans-serif",
          letterSpacing:'0.1em', color:'#eceaf5', lineHeight:1, marginBottom:10
        }}>
          BIBLIO<span style={{ color:'#f97316' }}>TECH</span>
        </h1>
        <p style={{ fontSize:14, color:'#64748b', letterSpacing:'0.15em', textTransform:'uppercase' }}>
          Benha University Library System
        </p>
      </div>

      {/* Cards */}
      <div style={{ display:'flex', gap:24, animation:'fadeUp 0.7s 0.1s ease both' }}>

        {/* Student Card */}
        <div className="card"
          onClick={() => navigate('/student')}
          style={{
            '--accent': '#f97316',
            background: '#12151f',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: '36px 40px',
            width: 260,
            textAlign: 'center',
          }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 8px 28px #f9731640',
            animation: 'glow 3s ease infinite',
          }}>🎓</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#eceaf5',
            fontFamily:"'Bebas Neue',sans-serif", letterSpacing:'0.06em', marginBottom: 10 }}>
            STUDENT
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
            Browse books, borrow, track loans, and chat with the AI assistant
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            borderRadius: 12, padding: '12px',
            color: '#fff', fontSize: 14, fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: '0 6px 20px #f9731640',
          }}>
            Enter Student Portal →
          </div>
        </div>

        {/* Divider */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
          <div style={{ width:1, height:60, background:'rgba(255,255,255,0.06)' }}/>
          <span style={{ fontSize:11, color:'#2a3347', fontWeight:700, letterSpacing:'0.1em' }}>OR</span>
          <div style={{ width:1, height:60, background:'rgba(255,255,255,0.06)' }}/>
        </div>

        {/* Admin Card */}
        <div className="card"
          onClick={() => navigate('/admin')}
          style={{
            '--accent': '#06b6d4',
            background: '#12151f',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 20,
            padding: '36px 40px',
            width: 260,
            textAlign: 'center',
          }}>
          <div style={{
            width: 72, height: 72, borderRadius: 18, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, boxShadow: '0 8px 28px #06b6d440',
          }}>🛡️</div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: '#eceaf5',
            fontFamily:"'Bebas Neue',sans-serif", letterSpacing:'0.06em', marginBottom: 10 }}>
            ADMIN
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
            Manage books, monitor borrowings, and view library analytics
          </p>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
            borderRadius: 12, padding: '12px',
            color: '#fff', fontSize: 14, fontWeight: 800,
            letterSpacing: '0.04em',
            boxShadow: '0 6px 20px #06b6d440',
          }}>
            Enter Admin Panel →
          </div>
        </div>
      </div>

      <p style={{ marginTop: 48, fontSize: 12, color: '#1e2535', animation:'fadeUp 0.8s 0.2s ease both' }}>
        © 2026 BiblioTech · Benha University Library
      </p>
    </div>
  )
}

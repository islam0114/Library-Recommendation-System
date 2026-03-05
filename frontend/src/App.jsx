import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import BiblioTech from './pages/BiblioTechStudent.jsx'
import BiblioTechAdmin from './pages/BiblioTechAdmin.jsx'
import Landing from './pages/Landing.jsx'

export default function App() {
  return (
    <Routes>
      {/* Landing page - choose student or admin */}
      <Route path="/" element={<Landing />} />

      {/* Student app - all student pages live inside here */}
      <Route path="/student/*" element={<BiblioTech />} />

      {/* Admin panel */}
      <Route path="/admin/*" element={<BiblioTechAdmin />} />

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

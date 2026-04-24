import React, { useState } from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './ToastContext';

// Pages
import LandingPage    from './components/LandingPage';
import AuthModal      from './components/AuthModal';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard  from './components/DoctorDashboard';
import AdminDashboard   from './components/AdminDashboard';
import DoctorsPage    from './components/DoctorsPage';
import BookingPage    from './components/BookingPage';
import PrescriptionPage from './components/PrescriptionPage';

function AppRouter() {
  const { user, loading } = useAuth();
  const [page, setPage]   = useState('home');  // home | doctors | booking | prescription
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [viewPrescription, setViewPrescription] = useState(null);

  const navigate = (p, data) => {
    setPage(p);
    if (p === 'booking') setBookingDoctor(data);
    if (p === 'prescription') setViewPrescription(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (mode = 'login') => { setAuthMode(mode); setShowAuth(true); };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--cream)' }}>
      <div style={{ textAlign:'center' }}>
        <div className="spinner spinner-teal" style={{ width:40, height:40, margin:'0 auto 16px' }} />
        <p style={{ color:'var(--muted)', fontFamily:'Cormorant Garamond,serif', fontSize:'1.1rem' }}>Loading MedConnect BD…</p>
      </div>
    </div>
  );

  // Authenticated dashboards
  if (user) {
    if (page === 'booking' && bookingDoctor)
      return <BookingPage doctor={bookingDoctor} onBack={() => navigate('doctors')} navigate={navigate} />;
    if (page === 'prescription' && viewPrescription)
      return <PrescriptionPage prescription={viewPrescription} onBack={() => navigate(user.role === 'doctor' ? 'dashboard' : 'dashboard')} />;
    if (page === 'doctors')
      return <DoctorsPage onBook={(doc) => navigate('booking', doc)} onBack={() => navigate('home')} />;

    if (user.role === 'patient') return <PatientDashboard navigate={navigate} openAuth={openAuth} />;
    if (user.role === 'doctor')  return <DoctorDashboard  navigate={navigate} />;
    if (user.role === 'admin')   return <AdminDashboard   navigate={navigate} />;
  }

  // Public pages
  if (page === 'doctors')
    return <DoctorsPage onBook={() => openAuth('register')} onBack={() => navigate('home')} />;

  return (
    <>
      <LandingPage navigate={navigate} openAuth={openAuth} />
      {showAuth && (
        <AuthModal
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ToastProvider>
  );
}

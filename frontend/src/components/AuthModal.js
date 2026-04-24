import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

const ROLES = [
  { id: 'patient', label: 'Patient', icon: '🙋' },
  { id: 'doctor',  label: 'Doctor',  icon: '👨‍⚕️' },
  { id: 'admin',   label: 'Admin',   icon: '⚙️' },
];

const SPECS = [
  'Internal Medicine','Cardiology','Pediatrics','Dermatology',
  'Neurology','Orthopedics','Gynecology','Psychiatry','ENT','Ophthalmology',
];

export default function AuthModal({ mode, setMode, onClose }) {
  const { login, register } = useAuth();
  const { addToast }        = useToast();

  const [role,           setRole]          = useState('patient');
  const [loading,        setLoading]       = useState(false);
  const [errors,         setErrors]        = useState({});

  // ── Each field has its own state variable ──
  // This is the correct React pattern — avoids the focus-loss bug
  // that happens when a component function is defined inside another.
  const [name,           setName]          = useState('');
  const [email,          setEmail]         = useState('');
  const [phone,          setPhone]         = useState('');
  const [password,       setPassword]      = useState('');
  const [confirmPass,    setConfirmPass]   = useState('');
  const [bmdcNumber,     setBmdcNumber]    = useState('');
  const [specialization, setSpec]          = useState('');
  const [experience,     setExperience]    = useState('');

  const clearErr = (k) => setErrors((p) => ({ ...p, [k]: undefined }));

  const validate = () => {
    const e = {};
    if (mode === 'register' && !name.trim())              e.name        = 'Name is required';
    if (!email.includes('@'))                              e.email       = 'Valid email required';
    if (password.length < 6)                               e.password    = 'Min 6 characters';
    if (mode === 'register' && password !== confirmPass)   e.confirm     = 'Passwords do not match';
    if (mode === 'register' && role === 'doctor' && !bmdcNumber.trim()) e.bmdc = 'BMDC number required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email, password, role });
        addToast('Welcome back!', 'success');
      } else {
        await register({
          name, email, phone, password,
          confirm_password: confirmPass,
          bmdc_number: bmdcNumber,
          specialization, experience, role,
        });
        addToast('Account created! Welcome to MedConnect BD.', 'success');
      }
      onClose();
    } catch (err) {
      addToast(err.message || 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared styles ── */
  const inp = {
    display: 'block',
    width: '100%',
    padding: '12px 16px',
    borderRadius: 10,
    border: '1.5px solid #e5e7eb',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    fontSize: '0.92rem',
    color: '#111827',
    background: '#fafaf9',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
  const lbl = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: 5,
  };
  const grp = { display: 'flex', flexDirection: 'column' };
  const err = { fontSize: '0.74rem', color: 'var(--danger)', marginTop: 4 };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ padding: 0 }}>

        {/* Header */}
        <div style={{ padding: '28px 32px 20px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ position:'absolute',top:20,right:20,width:32,height:32,borderRadius:'50%',background:'var(--light)',border:'none',cursor:'pointer',fontSize:'0.85rem',color:'var(--muted)',display:'flex',alignItems:'center',justifyContent:'center' }}
          >✕</button>

          <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:14 }}>
            <div style={{ width:34,height:34,borderRadius:8,background:'linear-gradient(135deg,var(--teal),var(--teal-light))',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontFamily:'Cormorant Garamond,serif',fontSize:'1rem' }}>M</div>
            <span style={{ fontFamily:'Cormorant Garamond,serif',fontWeight:700,fontSize:'1.05rem' }}>MedConnect BD</span>
          </div>

          <h2 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:'1.7rem',fontWeight:700,marginBottom:4 }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color:'var(--muted)',fontSize:'0.87rem' }}>
            {mode === 'login'
              ? 'Sign in to access your dashboard'
              : "Join Bangladesh's premier telemedicine platform"}
          </p>
        </div>

        {/* Body / Form */}
        <form
          onSubmit={handleSubmit}
          style={{ padding:'24px 32px 28px', display:'flex', flexDirection:'column', gap:14 }}
          autoComplete="on"
        >
          {/* Role buttons */}
          <div>
            <label style={{ ...lbl, marginBottom: 8 }}>I am a</label>
            <div style={{ display:'flex', gap:8 }}>
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    flex:1, padding:'9px 8px', borderRadius:10,
                    border: `1.5px solid ${role === r.id ? 'var(--teal)' : 'var(--cream-dark)'}`,
                    background: role === r.id ? 'var(--teal-faint)' : 'transparent',
                    color: role === r.id ? 'var(--teal)' : 'var(--muted)',
                    fontFamily:'Plus Jakarta Sans,sans-serif', fontWeight:600, fontSize:'0.8rem',
                    cursor:'pointer', transition:'all 0.2s',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:5,
                  }}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name */}
          {mode === 'register' && (
            <div style={grp}>
              <label style={lbl}>Full Name</label>
              <input
                style={inp}
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                value={name}
                onChange={(e) => { setName(e.target.value); clearErr('name'); }}
              />
              {errors.name && <span style={err}>⚠ {errors.name}</span>}
            </div>
          )}

          {/* Email */}
          <div style={grp}>
            <label style={lbl}>Email Address</label>
            <input
              style={inp}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearErr('email'); }}
            />
            {errors.email && <span style={err}>⚠ {errors.email}</span>}
          </div>

          {/* Phone */}
          {mode === 'register' && role !== 'admin' && (
            <div style={grp}>
              <label style={lbl}>Phone Number</label>
              <input
                style={inp}
                type="tel"
                placeholder="+880 1X-XXXX-XXXX"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          )}

          {/* Password */}
          <div style={grp}>
            <label style={lbl}>Password</label>
            <input
              style={inp}
              type="password"
              placeholder="Enter password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearErr('password'); }}
            />
            {errors.password && <span style={err}>⚠ {errors.password}</span>}
          </div>

          {/* Confirm Password */}
          {mode === 'register' && (
            <div style={grp}>
              <label style={lbl}>Confirm Password</label>
              <input
                style={inp}
                type="password"
                placeholder="Re-enter password"
                autoComplete="new-password"
                value={confirmPass}
                onChange={(e) => { setConfirmPass(e.target.value); clearErr('confirm'); }}
              />
              {errors.confirm && <span style={err}>⚠ {errors.confirm}</span>}
            </div>
          )}

          {/* Doctor extra fields */}
          {mode === 'register' && role === 'doctor' && (
            <>
              <div style={grp}>
                <label style={lbl}>BMDC Registration Number</label>
                <input
                  style={inp}
                  type="text"
                  placeholder="A-XXXXX"
                  value={bmdcNumber}
                  onChange={(e) => { setBmdcNumber(e.target.value); clearErr('bmdc'); }}
                />
                <span style={{ fontSize:'0.74rem', color:'var(--muted)', marginTop:4 }}>
                  Will be verified before account activation
                </span>
                {errors.bmdc && <span style={err}>⚠ {errors.bmdc}</span>}
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                <div style={grp}>
                  <label style={lbl}>Specialization</label>
                  <select
                    style={{
                      ...inp,
                      appearance: 'none',
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 14px center',
                      paddingRight: 36,
                      cursor: 'pointer',
                    }}
                    value={specialization}
                    onChange={(e) => setSpec(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {SPECS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div style={grp}>
                  <label style={lbl}>Years of Experience</label>
                  <input
                    style={inp}
                    type="number"
                    placeholder="e.g. 10"
                    min="0"
                    max="60"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Submit button */}
          <button
            className="btn btn-primary btn-block btn-lg"
            type="submit"
            disabled={loading}
            style={{ marginTop: 6 }}
          >
            {loading
              ? <span className="spinner" />
              : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>

          {/* Toggle */}
          <p style={{ textAlign:'center', fontSize:'0.84rem', color:'var(--muted)', marginTop:2 }}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span
              style={{ color:'var(--teal)', fontWeight:600, cursor:'pointer' }}
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Register Now' : 'Sign In'}
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}

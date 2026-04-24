import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import api from '../api';
import Sidebar from './Sidebar';

const TABS = ['Overview','Manage Doctors','Manage Patients','Appointments','System'];

export default function AdminDashboard({ navigate }) {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab]           = useState('Overview');
  const [sidebarOpen, setSidebar] = useState(false);
  const [doctors, setDoctors]   = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats]       = useState({});
  const [searchDr, setSearchDr] = useState('');
  const [loading, setLoading]   = useState(false);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const [docRes, patRes, apptRes, statRes] = await Promise.all([
        api.adminUsers('doctor').catch(()=>({users:[]})),
        api.adminUsers('patient').catch(()=>({users:[]})),
        api.getAppointments().catch(()=>({appointments:[]})),
        api.adminStats().catch(()=>({ stats: {} }))
      ]);

      setDoctors((docRes.users || []).map(d => ({
        id: d.doctor_profile_id || d.id,
        name: d.name,
        spec: d.specialization || 'N/A',
        bmdc: d.bmdc_number || 'N/A',
        exp: d.experience_years ? `${d.experience_years} yrs` : 'N/A',
        rating: d.rating || 0,
        verified: Boolean(d.is_verified),
        email: d.email,
        phone: d.phone
      })));

      setPatients((patRes.users || []).map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        joined: p.created_at ? p.created_at.split(' ')[0] : 'N/A',
        appts: 0,
        active: p.is_active !== false
      })));

      setAppointments(apptRes.appointments || []);
      setStats(statRes.stats || {});
    } catch(e) {
      console.error('Error loading admin data:', e);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData, tab]);

  useEffect(() => {
    const handleRefresh = () => { loadData(false); };
    const intervalId = window.setInterval(handleRefresh, 15000);
    window.addEventListener('focus', handleRefresh);
    document.addEventListener('visibilitychange', handleRefresh);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', handleRefresh);
      document.removeEventListener('visibilitychange', handleRefresh);
    };
  }, [loadData]);

  const navItems = TABS.map(t => ({ label:t, active:tab===t, onClick:()=>setTab(t) }));

  const toggleVerify = async (id) => {
    const doc = doctors.find(d=>d.id===id);
    if (!doc) return;

    try {
      await api.adminVerifyDoctor(id, !doc.verified);
      setDoctors(p => p.map(d => d.id===id ? {...d, verified: !d.verified} : d));
      addToast(`Dr. ${doc.name} ${!doc.verified ? 'verified' : 'unverified'}.`,'success');
    } catch(e) {
      addToast(`Error: ${e.message}`,'error');
    }
  };

  const filteredDrs = doctors.filter(d =>
    d.name.toLowerCase().includes(searchDr.toLowerCase()) ||
    d.spec.toLowerCase().includes(searchDr.toLowerCase())
  );

  return (
    <div className="dashboard">
      <Sidebar title="Admin Panel" navItems={navItems} user={user} onLogout={logout} isOpen={sidebarOpen} onClose={()=>setSidebar(false)} />
      <div className="main-content">
        <div style={top.bar}>
          <button style={top.ham} onClick={()=>setSidebar(true)}>☰</button>
          <div><h3 style={top.h}>{tab}</h3><p style={top.sub}>{new Date().toLocaleDateString('en-BD',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p></div>
          <button className="btn btn-ghost btn-sm" onClick={() => loadData(false)}>Refresh</button>
          <span className="badge badge-teal">System Administrator</span>
        </div>

        <div style={{ padding:'0 32px 40px' }}>

          {/* OVERVIEW */}
          {tab==='Overview' && (
            <div style={{ display:'flex',flexDirection:'column',gap:22 }}>
              <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:16 }}>
                <Stat icon="👥" label="Total Users"       value={stats.total_users || 0} color="#0b7c6f" bg="#e6f5f3" />
                <Stat icon="👨‍⚕️" label="Active Doctors"    value={doctors.filter(d=>d.verified).length}   color="#2563eb" bg="#eff6ff" />
                <Stat icon="📅" label="Total Appointments" value={appointments.length} color="#9333ea" bg="#fdf4ff" />
                <Stat icon="⏳" label="Pending Verifications" value={doctors.filter(d=>!d.verified).length} color="#c9913a" bg="#fef9ec" />
              </div>
              <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:22 }}>
                <div className="card" style={{ padding:24 }}>
                  <h4 style={cT}>Pending Doctor Verifications</h4>
                  {doctors.filter(d=>!d.verified).map(d=>(
                    <div key={d.id} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--cream)' }}>
                      <div>
                        <div style={{ fontWeight:600,fontSize:'0.87rem' }}>Dr. {d.name}</div>
                        <div style={{ fontSize:'0.74rem',color:'var(--muted)' }}>{d.spec} · BMDC: {d.bmdc}</div>
                      </div>
                      <button className="btn btn-primary btn-sm" onClick={()=>toggleVerify(d.id)}>Verify</button>
                    </div>
                  ))}
                  {doctors.filter(d=>!d.verified).length===0 && <p style={{color:'var(--muted)',fontSize:'0.87rem',padding:'14px 0'}}>All doctors verified ✓</p>}
                </div>
                <div className="card" style={{ padding:24 }}>
                  <h4 style={cT}>Recent Activity</h4>
                  <p style={{color:'var(--muted)',fontSize:'0.87rem',padding:'14px 0'}}>Activity log will load in next update</p>
                </div>
              </div>
            </div>
          )}

          {/* DOCTORS */}
          {tab==='Manage Doctors' && (
            <div className="card">
              <div style={{ padding:'16px 20px',borderBottom:'1px solid var(--border)',display:'flex',gap:12,alignItems:'center' }}>
                <b>Doctors ({filteredDrs.length})</b>
                <input className="form-input" placeholder="Search by name or specialty…" value={searchDr} onChange={e=>setSearchDr(e.target.value)} style={{ maxWidth:280 }} />
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Doctor</th><th>Specialty</th><th>BMDC</th><th>Experience</th><th>Rating</th><th>Verified</th><th>Actions</th></tr></thead>
                  <tbody>
                    {filteredDrs.map(d=>(
                      <tr key={d.id}>
                        <td><b>Dr. {d.name}</b></td>
                        <td>{d.spec}</td>
                        <td><code>{d.bmdc}</code></td>
                        <td>{d.exp}</td>
                        <td><span className="stars">★</span> {d.rating}</td>
                        <td><span className={`badge badge-${d.verified?'green':'gold'}`}>{d.verified?'Verified':'Pending'}</span></td>
                        <td style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
                          <button className={`btn btn-sm ${d.verified?'btn-danger':'btn-primary'}`} onClick={()=>toggleVerify(d.id)}>{d.verified?'Revoke':'Verify'}</button>
                          <button className="btn btn-ghost btn-sm" onClick={()=>addToast(`Viewing Dr. ${d.name}'s profile`,'info')}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PATIENTS */}
          {tab==='Manage Patients' && (
            <div className="card">
              <div style={{ padding:'16px 20px',fontWeight:700,borderBottom:'1px solid var(--border)' }}>All Patients ({patients.length})</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Joined</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {patients.map((p,i)=>(
                      <tr key={i}>
                        <td><b>{p.name}</b></td>
                        <td>{p.email}</td>
                        <td>{p.phone}</td>
                        <td>{p.joined}</td>
                        <td><span className={`badge badge-${p.active?'green':'gray'}`}>{p.active?'Active':'Inactive'}</span></td>
                        <td style={{display:'flex',gap:6}}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>addToast(`Viewing ${p.name}'s profile`,'info')}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {tab==='Appointments' && (
            <div className="card">
              <div style={{ padding:'16px 20px',fontWeight:700,borderBottom:'1px solid var(--border)' }}>All Appointments ({appointments.length})</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {appointments.map((a,i)=>(
                      <tr key={i}>
                        <td>{a.patient_name || 'N/A'}</td>
                        <td>{a.doctor_name || 'N/A'}</td>
                        <td>{a.date} {a.time || ''}</td>
                        <td><span className="badge badge-teal">{a.type || a.consultation_type || 'N/A'}</span></td>
                        <td><span className={`badge badge-${a.status==='completed'?'gray':a.status==='pending'?'gold':'green'}`}>{a.status}</span></td>
                        <td><button className="btn btn-ghost btn-sm" onClick={()=>addToast('Details loaded','info')}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SYSTEM */}
          {tab==='System' && (
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
              <div className="card" style={{ padding:24 }}>
                <h4 style={cT}>System Information</h4>
                {[['Platform','MedConnect Bangladesh v1.0'],['Database','MySQL 8.0'],['Backend','PHP 8.2 + Apache'],['Frontend','React 18'],['Last Backup','Today 03:00 AM'],['Uptime','99.97%']].map(([k,v],i)=>(
                  <div key={i} style={{ display:'flex',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid var(--cream)',fontSize:'0.87rem' }}>
                    <span style={{ color:'var(--muted)' }}>{k}</span><b>{v}</b>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding:24 }}>
                <h4 style={cT}>Quick Actions</h4>
                <div style={{ display:'flex',flexDirection:'column',gap:10,marginTop:8 }}>
                  {[['⬇ Export Patient Data','Export all patient records to CSV'],['🗄 Backup Database','Create a manual database backup'],['📧 Send Announcement','Broadcast message to all users'],['🔄 Clear Cache','Clear system cache']].map(([label,desc],i)=>(
                    <button key={i} className="btn btn-ghost" style={{ justifyContent:'flex-start',padding:'12px 16px',borderRadius:10,flexDirection:'column',alignItems:'flex-start',gap:2,height:'auto' }} onClick={()=>addToast(`${label.replace(/^[^\s]+\s/,'')} initiated…`,'info')}>
                      <span style={{ fontWeight:600 }}>{label}</span>
                      <span style={{ fontWeight:400,fontSize:'0.76rem',color:'var(--muted)' }}>{desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function Stat({ icon,label,value,color,bg }) {
  return (
    <div className="card" style={{ padding:22,display:'flex',alignItems:'center',gap:16 }}>
      <div style={{ width:52,height:52,borderRadius:14,background:bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,flexShrink:0 }}>{icon}</div>
      <div>
        <div style={{ fontFamily:'Cormorant Garamond,serif',fontSize:'1.8rem',fontWeight:700,color,lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:'0.74rem',color:'var(--muted)',marginTop:2,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.05em' }}>{label}</div>
      </div>
    </div>
  );
}


const top = { bar:{display:'flex',alignItems:'center',gap:16,padding:'24px 32px',borderBottom:'1px solid var(--border)',background:'#fff',flexWrap:'wrap'}, ham:{background:'none',border:'none',fontSize:'1.4rem',cursor:'pointer',padding:'4px 8px'}, h:{fontFamily:'Cormorant Garamond,serif',fontSize:'1.5rem',fontWeight:700,color:'var(--ink)'}, sub:{fontSize:'0.78rem',color:'var(--muted)',marginTop:2} };
const cT = { fontFamily:'Cormorant Garamond,serif',fontSize:'1.1rem',fontWeight:700,marginBottom:14 };

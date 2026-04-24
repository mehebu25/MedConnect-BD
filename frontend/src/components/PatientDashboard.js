import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import api from '../api';
import Sidebar from './Sidebar';

const TABS = ['Overview', 'Appointments', 'Prescriptions', 'Health Records', 'Profile'];

function buildSessionUrl(appointment) {
  const room = appointment.session_room || `medconnect-${appointment.id}`;
  return `https://meet.jit.si/${room}`;
}

export default function PatientDashboard({ navigate }) {
  const { user, logout, fetchProfile } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('Overview');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sidebarOpen, setSidebar] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    blood_group: user?.blood_group || '',
    gender: user?.gender || '',
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      blood_group: user?.blood_group || '',
      gender: user?.gender || '',
    });
  }, [user]);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    const tasks = [];

    if (tab === 'Overview' || tab === 'Appointments') {
      tasks.push(['appointments', api.getAppointments()]);
    }
    if (tab === 'Overview' || tab === 'Prescriptions') {
      tasks.push(['prescriptions', api.getPrescriptions()]);
    }
    if (tab === 'Overview' || tab === 'Health Records') {
      tasks.push(['records', api.getRecords()]);
    }

    if (tasks.length === 0) {
      if (showLoader) setLoading(false);
      return;
    }

    const results = await Promise.allSettled(tasks.map(([, promise]) => promise));

    results.forEach((result, index) => {
      const key = tasks[index][0];
      if (result.status === 'fulfilled') {
        if (key === 'appointments') setAppointments(result.value.appointments || []);
        if (key === 'prescriptions') setPrescriptions(result.value.prescriptions || []);
        if (key === 'records') setRecords(result.value.records || []);
        return;
      }

      if (key === 'appointments') setAppointments([]);
      if (key === 'prescriptions') setPrescriptions([]);
      if (key === 'records') setRecords([]);
      console.error(`Patient dashboard failed to load ${key}:`, result.reason);
    });

    if (showLoader) setLoading(false);
  }, [tab]);

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

  const cancelAppointment = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await api.cancelAppointment(id);
      setAppointments((current) => current.map((appointment) => (
        appointment.id === id ? { ...appointment, status: 'cancelled' } : appointment
      )));
      addToast('Appointment cancelled.', 'info');
    } catch (error) {
      addToast(error.message || 'Could not cancel appointment.', 'error');
    }
  };

  const uploadRecord = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append('file', file);
    form.append('record_type', 'General');

    try {
      const response = await api.uploadRecord(form);
      if (response.message) addToast(response.message, 'success');
      await loadData(false);
    } catch (error) {
      addToast(error.message || 'Could not upload file.', 'error');
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await api.updateProfile(profileForm);
      await fetchProfile();
      addToast('Profile updated.', 'success');
    } catch (error) {
      addToast(error.message || 'Could not update profile.', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const joinSession = (appointment) => {
    window.open(buildSessionUrl(appointment), '_blank', 'noopener,noreferrer');
  };

  const upcoming = appointments.filter((appointment) => ['pending', 'confirmed'].includes(appointment.status));
  const past = appointments.filter((appointment) => ['completed', 'cancelled'].includes(appointment.status));
  const navItems = TABS.map((item) => ({ label: item, active: tab === item, onClick: () => setTab(item) }));

  return (
    <div className="dashboard">
      <Sidebar title="Patient Portal" navItems={navItems} user={user} onLogout={logout} isOpen={sidebarOpen} onClose={() => setSidebar(false)} />
      <div className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 32px', borderBottom: '1px solid var(--border)', background: '#fff', flexWrap: 'wrap' }}>
          <button style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px' }} onClick={() => setSidebar(true)}>☰</button>
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>{tab}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => loadData(false)}>Refresh</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('doctors')}>New Appointment</button>
        </div>

        <div style={{ padding: '0 32px 40px' }}>
          {loading && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner spinner-teal" style={{ width: 36, height: 36 }} />
            </div>
          )}

          {!loading && tab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
                <StatCard label="Upcoming" value={upcoming.length} />
                <StatCard label="Completed" value={appointments.filter((appointment) => appointment.status === 'completed').length} />
                <StatCard label="Prescriptions" value={prescriptions.length} />
                <StatCard label="Health Records" value={records.length} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                <div className="card" style={{ padding: 24 }}>
                  <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Upcoming Appointments</h4>
                  {upcoming.slice(0, 3).map((appointment) => (
                    <AppointmentRow key={appointment.id} appointment={appointment} onJoin={joinSession} />
                  ))}
                  {upcoming.length === 0 && <p style={{ color: 'var(--muted)' }}>No upcoming appointments.</p>}
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Recent Prescriptions</h4>
                  {prescriptions.slice(0, 3).map((prescription) => (
                    <div key={prescription.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--cream)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{prescription.diagnosis}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{prescription.doctor_name}</div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate('prescription', prescription)}>View</button>
                    </div>
                  ))}
                  {prescriptions.length === 0 && <p style={{ color: 'var(--muted)' }}>No prescriptions yet.</p>}
                </div>
              </div>
            </div>
          )}

          {!loading && tab === 'Appointments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card">
                <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>Appointments</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Doctor</th><th>Specialty</th><th>Date & Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>
                      {appointments.map((appointment) => (
                        <tr key={appointment.id}>
                          <td><b>{appointment.doctor_name}</b></td>
                          <td>{appointment.specialty}</td>
                          <td>{appointment.date} {appointment.time}</td>
                          <td><span className="badge badge-teal">{appointment.type}</span></td>
                          <td><span className={`badge badge-${appointment.status === 'confirmed' ? 'green' : appointment.status === 'pending' ? 'gold' : 'gray'}`}>{appointment.status}</span></td>
                          <td style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {appointment.can_join && <button className="btn btn-primary btn-sm" onClick={() => joinSession(appointment)}>Join</button>}
                            {['pending', 'confirmed'].includes(appointment.status) && <button className="btn btn-danger btn-sm" onClick={() => cancelAppointment(appointment.id)}>Cancel</button>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {appointments.length === 0 && <div style={{ padding: 20, color: 'var(--muted)' }}>No appointments found yet.</div>}
                </div>
              </div>
            </div>
          )}

          {!loading && tab === 'Prescriptions' && (
            <div className="card">
              <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>My Prescriptions</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Actions</th></tr></thead>
                  <tbody>
                    {prescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td>{new Date(prescription.date).toLocaleDateString()}</td>
                        <td><b>{prescription.doctor_name}</b></td>
                        <td>{prescription.diagnosis}</td>
                        <td>{(prescription.medicines || []).join(', ') || '—'}</td>
                        <td><button className="btn btn-primary btn-sm" onClick={() => navigate('prescription', prescription)}>View</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {prescriptions.length === 0 && <div style={{ padding: 20, color: 'var(--muted)' }}>No prescriptions yet.</div>}
              </div>
            </div>
          )}

          {!loading && tab === 'Health Records' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="card" style={{ padding: 24 }}>
                <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Upload Health Record</h4>
                <label className="btn btn-outline" style={{ cursor: 'pointer' }}>
                  Choose File
                  <input type="file" hidden onChange={uploadRecord} />
                </label>
              </div>
              <div className="card">
                <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>My Records</div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Type</th><th>File</th><th>Uploaded By</th></tr></thead>
                    <tbody>
                      {records.map((record) => (
                        <tr key={record.id}>
                          <td>{new Date(record.date).toLocaleDateString()}</td>
                          <td><span className={`badge badge-${record.color || 'gray'}`}>{record.type}</span></td>
                          <td>{record.name}</td>
                          <td>{record.uploaded_by_name || record.by || 'Self'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {records.length === 0 && <div style={{ padding: 20, color: 'var(--muted)' }}>No records uploaded yet.</div>}
                </div>
              </div>
            </div>
          )}

          {!loading && tab === 'Profile' && (
            <form onSubmit={saveProfile} className="card" style={{ maxWidth: 700, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700 }}>Personal Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={profileForm.email} readOnly /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Blood Group</label><input className="form-input" value={profileForm.blood_group} onChange={(e) => setProfileForm({ ...profileForm, blood_group: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Gender</label><select className="form-input form-select" value={profileForm.gender} onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
              </div>
              <div className="form-group"><label className="form-label">Address</label><textarea className="form-input" rows={3} value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} /></div>
              <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start' }} disabled={savingProfile}>{savingProfile ? 'Saving...' : 'Save Changes'}</button>
            </form>
          )}

          {!loading && past.length > 0 && tab === 'Overview' && (
            <div className="card" style={{ marginTop: 24, padding: 24 }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Past Activity</h4>
              {past.slice(0, 3).map((appointment) => (
                <div key={appointment.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--cream)' }}>
                  <b>{appointment.doctor_name}</b> <span style={{ color: 'var(--muted)' }}>{appointment.date} {appointment.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

function AppointmentRow({ appointment, onJoin }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--cream)' }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{appointment.doctor_name}</div>
        <div style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>{appointment.date} · {appointment.time} · {appointment.status}</div>
      </div>
      {appointment.can_join && <button className="btn btn-primary btn-sm" onClick={() => onJoin(appointment)}>Join</button>}
    </div>
  );
}

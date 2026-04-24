import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import api from '../api';
import Sidebar from './Sidebar';

const TABS = ['Overview', 'Appointments', 'Prescriptions', 'Patients', 'Schedule', 'Profile'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function buildSessionUrl(appointment) {
  const room = appointment.session_room || `medconnect-${appointment.id}`;
  return `https://meet.jit.si/${room}`;
}

export default function DoctorDashboard() {
  const { user, logout, fetchProfile } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('Overview');
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [schedule, setSchedule] = useState(DAYS.map((day) => ({ day_of_week: day, start_time: '09:00', end_time: '17:00', is_active: day !== 'Sunday' })));
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebar] = useState(false);
  const [rxModal, setRxModal] = useState(null);
  const [rxForm, setRxForm] = useState({ diagnosis: '', notes: '', medicines: [{ name: '', dose: '', freq: '', duration: '' }] });
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    specialization: user?.specialization || '',
    experience_years: user?.experience_years || 0,
    consultation_fee: user?.consultation_fee || 500,
    district: user?.district || '',
    bio: user?.bio || '',
  });

  useEffect(() => {
    setProfileForm({
      name: user?.name || '',
      phone: user?.phone || '',
      specialization: user?.specialization || '',
      experience_years: user?.experience_years || 0,
      consultation_fee: user?.consultation_fee || 500,
      district: user?.district || '',
      bio: user?.bio || '',
    });
  }, [user]);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    const tasks = [];

    if (tab === 'Overview' || tab === 'Appointments' || tab === 'Patients') {
      tasks.push(['appointments', api.getAppointments()]);
    }
    if (tab === 'Overview' || tab === 'Prescriptions') {
      tasks.push(['prescriptions', api.getPrescriptions()]);
    }
    if (tab === 'Overview' || tab === 'Schedule') {
      tasks.push(['schedule', api.getDoctorSchedule()]);
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
        if (key === 'schedule') {
          const scheduleMap = new Map((result.value.schedule || []).map((row) => [row.day_of_week, row]));
          setSchedule(DAYS.map((day) => ({
            day_of_week: day,
            start_time: scheduleMap.get(day)?.start_time?.slice(0, 5) || '09:00',
            end_time: scheduleMap.get(day)?.end_time?.slice(0, 5) || '17:00',
            is_active: scheduleMap.get(day)?.is_active ?? (day !== 'Sunday'),
          })));
        }
        return;
      }

      if (key === 'appointments') setAppointments([]);
      if (key === 'prescriptions') setPrescriptions([]);
      console.error(`Doctor dashboard failed to load ${key}:`, result.reason);
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

  const navItems = TABS.map((item) => ({ label: item, active: tab === item, onClick: () => setTab(item) }));

  const saveProfile = async () => {
    try {
      await api.updateProfile(profileForm);
      await fetchProfile();
      addToast('Profile updated.', 'success');
    } catch (error) {
      addToast(error.message || 'Could not update profile.', 'error');
    }
  };

  const saveSchedule = async () => {
    try {
      await api.updateDoctorSchedule({ schedule });
      addToast('Schedule updated.', 'success');
    } catch (error) {
      addToast(error.message || 'Could not update schedule.', 'error');
    }
  };

  const updateAppointmentStatus = async (appointment, status) => {
    try {
      await api.updateAppointment({ id: appointment.id, status, doctor_note: appointment.doctor_note || '' });
      setAppointments((current) => current.map((item) => (
        item.id === appointment.id ? { ...item, status, can_join: ['confirmed', 'completed'].includes(status) } : item
      )));
      addToast(`Appointment ${status}.`, 'success');
    } catch (error) {
      addToast(error.message || 'Could not update appointment.', 'error');
    }
  };

  const joinSession = (appointment) => {
    window.open(buildSessionUrl(appointment), '_blank', 'noopener,noreferrer');
  };

  const addMedicine = () => setRxForm((current) => ({ ...current, medicines: [...current.medicines, { name: '', dose: '', freq: '', duration: '' }] }));
  const setMedicine = (index, key, value) => setRxForm((current) => {
    const medicines = [...current.medicines];
    medicines[index] = { ...medicines[index], [key]: value };
    return { ...current, medicines };
  });
  const removeMedicine = (index) => setRxForm((current) => ({ ...current, medicines: current.medicines.filter((_, medicineIndex) => medicineIndex !== index) }));

  const submitPrescription = async () => {
    if (!rxModal) return;
    try {
      await api.createPrescription({ appointment_id: rxModal.id, ...rxForm });
      addToast('Prescription issued.', 'success');
      setRxModal(null);
      setRxForm({ diagnosis: '', notes: '', medicines: [{ name: '', dose: '', freq: '', duration: '' }] });
      await loadData(false);
    } catch (error) {
      addToast(error.message || 'Could not create prescription.', 'error');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((appointment) => appointment.date === today);
  const uniquePatients = useMemo(() => {
    const map = new Map();
    appointments.forEach((appointment) => {
      if (!map.has(appointment.patient_name)) {
        map.set(appointment.patient_name, appointment);
      }
    });
    return [...map.values()];
  }, [appointments]);

  return (
    <div className="dashboard">
      <Sidebar title="Doctor Portal" navItems={navItems} user={user} onLogout={logout} isOpen={sidebarOpen} onClose={() => setSidebar(false)} />
      <div className="main-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '24px 32px', borderBottom: '1px solid var(--border)', background: '#fff', flexWrap: 'wrap' }}>
          <button style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', padding: '4px 8px' }} onClick={() => setSidebar(true)}>☰</button>
          <div>
            <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.5rem', fontWeight: 700, color: 'var(--ink)' }}>{tab}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 2 }}>{new Date().toLocaleDateString('en-BD', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => loadData(false)}>Refresh</button>
          {!user?.is_verified && <span className="badge badge-gold">Awaiting verification</span>}
        </div>

        <div style={{ padding: '0 32px 40px' }}>
          {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner spinner-teal" style={{ width: 36, height: 36 }} /></div>}

          {!loading && tab === 'Overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16 }}>
                <StatCard label="Today's Appointments" value={todayAppointments.length} />
                <StatCard label="Total Patients" value={uniquePatients.length} />
                <StatCard label="Prescriptions Issued" value={prescriptions.length} />
                <StatCard label="Average Rating" value={user?.rating || 0} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
                <div className="card" style={{ padding: 24 }}>
                  <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Today's Schedule</h4>
                  {todayAppointments.map((appointment) => (
                    <div key={appointment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--cream)' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{appointment.patient_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{appointment.time} · {appointment.type} · {appointment.status}</div>
                      </div>
                      {appointment.can_join && <button className="btn btn-primary btn-sm" onClick={() => joinSession(appointment)}>Join</button>}
                    </div>
                  ))}
                  {todayAppointments.length === 0 && <p style={{ color: 'var(--muted)' }}>No appointments scheduled for today.</p>}
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Quick Stats</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--cream)' }}><span style={{ color: 'var(--muted)' }}>Pending confirmations</span><b>{appointments.filter((appointment) => appointment.status === 'pending').length}</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--cream)' }}><span style={{ color: 'var(--muted)' }}>Confirmed calls</span><b>{appointments.filter((appointment) => appointment.status === 'confirmed').length}</b></div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--cream)' }}><span style={{ color: 'var(--muted)' }}>Completed consults</span><b>{appointments.filter((appointment) => appointment.status === 'completed').length}</b></div>
                </div>
              </div>
            </div>
          )}

          {!loading && tab === 'Appointments' && (
            <div className="card">
              <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>Appointments</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Patient</th><th>Date & Time</th><th>Type</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {appointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td><b>{appointment.patient_name}</b><br /><small style={{ color: 'var(--muted)' }}>{appointment.patient_phone}</small></td>
                        <td>{appointment.date} {appointment.time}</td>
                        <td><span className="badge badge-teal">{appointment.type}</span></td>
                        <td><span className={`badge badge-${appointment.status === 'confirmed' ? 'green' : appointment.status === 'pending' ? 'gold' : 'gray'}`}>{appointment.status}</span></td>
                        <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {appointment.status === 'pending' && <button className="btn btn-primary btn-sm" onClick={() => updateAppointmentStatus(appointment, 'confirmed')}>Confirm</button>}
                          {appointment.can_join && <button className="btn btn-outline btn-sm" onClick={() => joinSession(appointment)}>Join</button>}
                          {appointment.status === 'confirmed' && <button className="btn btn-ghost btn-sm" onClick={() => updateAppointmentStatus(appointment, 'completed')}>Complete</button>}
                          {appointment.status === 'completed' && <button className="btn btn-outline btn-sm" onClick={() => setRxModal(appointment)}>Issue Rx</button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {appointments.length === 0 && <div style={{ padding: 20, color: 'var(--muted)' }}>No appointments assigned yet.</div>}
              </div>
            </div>
          )}

          {!loading && tab === 'Prescriptions' && (
            <div className="card">
              <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>Issued Prescriptions</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Date</th><th>Patient</th><th>Diagnosis</th><th>Medicines</th></tr></thead>
                  <tbody>
                    {prescriptions.map((prescription) => (
                      <tr key={prescription.id}>
                        <td>{new Date(prescription.date).toLocaleDateString()}</td>
                        <td><b>{prescription.patient_name}</b></td>
                        <td>{prescription.diagnosis}</td>
                        <td>{(prescription.medicines || []).join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {prescriptions.length === 0 && <div style={{ padding: 20, color: 'var(--muted)' }}>No prescriptions issued yet.</div>}
              </div>
            </div>
          )}

          {!loading && tab === 'Patients' && (
            <div className="card">
              <div style={{ padding: '16px 20px', fontWeight: 700, borderBottom: '1px solid var(--border)' }}>My Patients</div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Phone</th><th>Latest Visit</th><th>Status</th></tr></thead>
                  <tbody>
                    {uniquePatients.map((patient) => (
                      <tr key={`${patient.patient_name}-${patient.id}`}>
                        <td><b>{patient.patient_name}</b></td>
                        <td>{patient.patient_phone}</td>
                        <td>{patient.date}</td>
                        <td><span className={`badge badge-${patient.status === 'completed' ? 'gray' : patient.status === 'confirmed' ? 'green' : 'gold'}`}>{patient.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {uniquePatients.length === 0 && <div style={{ padding: 20, color: 'var(--muted)' }}>No patients yet.</div>}
              </div>
            </div>
          )}

          {!loading && tab === 'Schedule' && (
            <div className="card" style={{ padding: 28, maxWidth: 700 }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.2rem', fontWeight: 700, marginBottom: 20 }}>Manage Availability</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {schedule.map((day, index) => (
                  <div key={day.day_of_week} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid var(--cream)' }}>
                    <span style={{ width: 100, fontWeight: 600, fontSize: '0.88rem' }}>{day.day_of_week}</span>
                    <input className="form-input" type="time" value={day.start_time} onChange={(e) => updateSchedule(index, 'start_time', e.target.value, setSchedule)} style={{ width: 110 }} />
                    <span style={{ color: 'var(--muted)' }}>to</span>
                    <input className="form-input" type="time" value={day.end_time} onChange={(e) => updateSchedule(index, 'end_time', e.target.value, setSchedule)} style={{ width: 110 }} />
                    <input type="checkbox" checked={day.is_active} onChange={(e) => updateSchedule(index, 'is_active', e.target.checked, setSchedule)} style={{ width: 18, height: 18, accentColor: 'var(--teal)', cursor: 'pointer' }} />
                  </div>
                ))}
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={saveSchedule}>Save Schedule</button>
              </div>
            </div>
          )}

          {!loading && tab === 'Profile' && (
            <div className="card" style={{ maxWidth: 700, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700 }}>Doctor Profile</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">BMDC Number</label><input className="form-input" value={user?.bmdc_number || ''} readOnly /></div>
                <div className="form-group"><label className="form-label">Specialization</label><input className="form-input" value={profileForm.specialization} onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Experience</label><input className="form-input" type="number" value={profileForm.experience_years} onChange={(e) => setProfileForm({ ...profileForm, experience_years: Number(e.target.value) })} /></div>
                <div className="form-group"><label className="form-label">Consultation Fee</label><input className="form-input" type="number" value={profileForm.consultation_fee} onChange={(e) => setProfileForm({ ...profileForm, consultation_fee: Number(e.target.value) })} /></div>
                <div className="form-group"><label className="form-label">District</label><input className="form-input" value={profileForm.district} onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })} /></div>
              </div>
              <div className="form-group"><label className="form-label">Bio</label><textarea className="form-input" rows={4} value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} /></div>
              <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }} onClick={saveProfile}>Save Profile</button>
            </div>
          )}
        </div>
      </div>

      {rxModal && (
        <div className="modal-overlay" onClick={(event) => event.target === event.currentTarget && setRxModal(null)}>
          <div className="modal-box" style={{ padding: 0, maxWidth: 600 }}>
            <div style={{ padding: '24px 28px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.4rem', fontWeight: 700 }}>Issue Prescription</h3>
              <button onClick={() => setRxModal(null)} style={{ background: 'var(--light)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '22px 28px 28px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--cream)', borderRadius: 10, padding: '12px 16px', fontSize: '0.85rem' }}>
                Patient: <b>{rxModal.patient_name}</b> · Appointment: {rxModal.date} {rxModal.time}
              </div>
              <div className="form-group">
                <label className="form-label">Diagnosis</label>
                <input className="form-input" value={rxForm.diagnosis} onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })} />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label className="form-label">Medicines</label>
                  <button className="btn btn-ghost btn-sm" onClick={addMedicine}>Add</button>
                </div>
                {rxForm.medicines.map((medicine, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: 8, marginBottom: 8 }}>
                    <input className="form-input" value={medicine.name} onChange={(e) => setMedicine(index, 'name', e.target.value)} placeholder="Medicine" />
                    <input className="form-input" value={medicine.dose} onChange={(e) => setMedicine(index, 'dose', e.target.value)} placeholder="Dose" />
                    <input className="form-input" value={medicine.freq} onChange={(e) => setMedicine(index, 'freq', e.target.value)} placeholder="Frequency" />
                    <input className="form-input" value={medicine.duration} onChange={(e) => setMedicine(index, 'duration', e.target.value)} placeholder="Duration" />
                    <button className="btn btn-danger btn-sm" onClick={() => removeMedicine(index)}>×</button>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={3} value={rxForm.notes} onChange={(e) => setRxForm({ ...rxForm, notes: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setRxModal(null)}>Cancel</button>
                <button className="btn btn-primary" onClick={submitPrescription}>Issue Prescription</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function updateSchedule(index, key, value, setSchedule) {
  setSchedule((current) => current.map((day, dayIndex) => (
    dayIndex === index ? { ...day, [key]: value } : day
  )));
}

function StatCard({ label, value }) {
  return (
    <div className="card" style={{ padding: 22 }}>
      <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.8rem', fontWeight: 700, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.76rem', color: 'var(--muted)', marginTop: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    </div>
  );
}

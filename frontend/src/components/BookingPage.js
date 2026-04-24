import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useToast } from '../ToastContext';

const TYPES = [
  { id: 'video', label: 'Video Call', desc: 'Face-to-face consultation' },
  { id: 'voice', label: 'Voice Call', desc: 'Audio consultation' },
  { id: 'chat', label: 'Chat', desc: 'Text consultation' },
];

function getNextDays(count) {
  return Array.from({ length: count }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index + 1);
    return {
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-BD', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-BD', { month: 'short' }),
    };
  });
}

export default function BookingPage({ doctor, onBack, navigate }) {
  const { addToast } = useToast();
  const [selDate, setSelDate] = useState('');
  const [selSlot, setSelSlot] = useState('');
  const [selType, setSelType] = useState('video');
  const [note, setNote] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(null);

  const days = useMemo(() => getNextDays(7), []);

  useEffect(() => {
    setSelSlot('');
    if (!selDate) {
      setSlots([]);
      return;
    }

    let active = true;
    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const response = await api.getDoctorSlots(doctor.doctor_profile_id || doctor.id, selDate);
        if (active) setSlots(response.slots || []);
      } catch (error) {
        if (active) {
          setSlots([]);
          console.error('Could not load time slots:', error);
        }
      } finally {
        if (active) setLoadingSlots(false);
      }
    };

    loadSlots();
    return () => { active = false; };
  }, [doctor, selDate, addToast]);

  const handleBook = async () => {
    if (!selDate || !selSlot) {
      addToast('Please select date and time.', 'error');
      return;
    }

    setBooking(true);
    try {
      const response = await api.bookAppointment({
        doctor_id: doctor.doctor_profile_id || doctor.id,
        date: selDate,
        time: selSlot,
        type: selType,
        note,
      });

      setBooked({
        status: response.status,
        date: selDate,
        time: selSlot,
        type: TYPES.find((item) => item.id === selType)?.label || selType,
      });
    } catch (error) {
      addToast(error.message || 'Could not book appointment.', 'error');
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="card" style={{ maxWidth: 480, width: '100%', padding: '48px 40px', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>OK</div>
          <h2 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Appointment Requested</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 24, lineHeight: 1.7 }}>
            Your appointment with <b>{doctor.name}</b> is booked for <b>{booked.date}</b> at <b>{booked.time}</b>. The doctor can now confirm it from the dashboard.
          </p>
          <div style={{ background: 'var(--cream)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem' }}><span style={{ color: 'var(--muted)' }}>Doctor</span><b>{doctor.name}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem' }}><span style={{ color: 'var(--muted)' }}>Specialty</span><b>{doctor.spec}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem' }}><span style={{ color: 'var(--muted)' }}>Type</span><b>{booked.type}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.87rem' }}><span style={{ color: 'var(--muted)' }}>Status</span><b style={{ color: 'var(--teal)' }}>{booked.status}</b></div>
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn btn-outline" onClick={onBack}>Find More Doctors</button>
            <button className="btn btn-primary" onClick={() => navigate('dashboard')}>Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--teal-dark),var(--teal))', padding: '24px 5%' }}>
        <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 500, fontSize: '0.83rem', marginBottom: 12 }} onClick={onBack}>Back</button>
        <h2 style={{ fontFamily: 'Cormorant Garamond,serif', color: '#fff', fontSize: '1.7rem', fontWeight: 700 }}>Book Appointment</h2>
      </div>

      <div style={{ maxWidth: 800, margin: '32px auto', padding: '0 5%', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card" style={{ padding: 22, display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: `linear-gradient(135deg,${doctor.c || '#0b7c6f'},${doctor.c || '#0b7c6f'}99)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
              {doctor.init || doctor.initials || doctor.name?.slice(0, 1)}
            </div>
            <div>
              <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700 }}>{doctor.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{doctor.spec} · {doctor.exp}</p>
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Consultation Type</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {TYPES.map((type) => (
                <button key={type.id} onClick={() => setSelType(type.id)} style={{ padding: '14px 10px', borderRadius: 12, border: `2px solid ${selType === type.id ? 'var(--teal)' : 'var(--cream-dark)'}`, background: selType === type.id ? 'var(--teal-faint)' : 'transparent', cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: selType === type.id ? 'var(--teal)' : 'var(--ink)', marginBottom: 2 }}>{type.label}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Select Date</h4>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {days.map((day) => (
                <button key={day.date} onClick={() => setSelDate(day.date)} style={{ flexShrink: 0, padding: '12px 14px', borderRadius: 12, border: `2px solid ${selDate === day.date ? 'var(--teal)' : 'var(--cream-dark)'}`, background: selDate === day.date ? 'var(--teal)' : 'transparent', cursor: 'pointer', textAlign: 'center', minWidth: 64 }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: selDate === day.date ? 'rgba(255,255,255,0.7)' : 'var(--muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>{day.label}</div>
                  <div style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.4rem', fontWeight: 700, color: selDate === day.date ? '#fff' : 'var(--ink)', lineHeight: 1, marginBottom: 2 }}>{day.day}</div>
                  <div style={{ fontSize: '0.7rem', color: selDate === day.date ? 'rgba(255,255,255,0.7)' : 'var(--muted)' }}>{day.month}</div>
                </button>
              ))}
            </div>
          </div>

          {selDate && (
            <div className="card" style={{ padding: 22 }}>
              <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 14 }}>Available Time Slots</h4>
              {loadingSlots ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
                  <div className="spinner spinner-teal" style={{ width: 36, height: 36 }} />
                </div>
              ) : slots.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No slots available for this day.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(110px,1fr))', gap: 10 }}>
                  {slots.map((slot) => (
                    <button key={slot} onClick={() => setSelSlot(slot)} style={{ padding: '10px', borderRadius: 10, border: `2px solid ${selSlot === slot ? 'var(--teal)' : 'var(--cream-dark)'}`, background: selSlot === slot ? 'var(--teal)' : 'transparent', color: selSlot === slot ? '#fff' : 'var(--ink)', fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' }}>
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="card" style={{ padding: 22 }}>
            <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>Symptoms / Note</h4>
            <textarea className="form-input" rows={3} placeholder="Describe your symptoms or reason for the consultation" value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 24, position: 'sticky', top: 20 }}>
            <h4 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.15rem', fontWeight: 700, marginBottom: 16 }}>Booking Summary</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--cream)', fontSize: '0.86rem' }}><span style={{ color: 'var(--muted)' }}>Doctor</span><b>{doctor.name}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--cream)', fontSize: '0.86rem' }}><span style={{ color: 'var(--muted)' }}>Specialty</span><b>{doctor.spec}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--cream)', fontSize: '0.86rem' }}><span style={{ color: 'var(--muted)' }}>Type</span><b>{TYPES.find((item) => item.id === selType)?.label}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--cream)', fontSize: '0.86rem' }}><span style={{ color: 'var(--muted)' }}>Date</span><b>{selDate || '—'}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--cream)', fontSize: '0.86rem' }}><span style={{ color: 'var(--muted)' }}>Time</span><b>{selSlot || '—'}</b></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--cream)', fontSize: '0.86rem' }}><span style={{ color: 'var(--muted)' }}>Fee</span><b style={{ color: 'var(--teal)' }}>৳{doctor.fee || 0}</b></div>
            <button className="btn btn-primary btn-block btn-lg" style={{ marginTop: 20 }} onClick={handleBook} disabled={booking || !selDate || !selSlot}>
              {booking ? <span className="spinner" /> : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

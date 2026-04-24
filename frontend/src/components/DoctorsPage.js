import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';
import { useToast } from '../ToastContext';

const SPEC_OPTIONS = ['All', 'Internal Medicine', 'Cardiology', 'Pediatrics', 'Dermatology', 'Neurology', 'Orthopedics', 'Gynecology'];

export default function DoctorsPage({ onBook, onBack }) {
  const { addToast } = useToast();
  const [spec, setSpec] = useState('All');
  const [search, setSearch] = useState('');
  const [avail, setAvail] = useState(false);
  const [sort, setSort] = useState('rating');
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDoctors = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (spec !== 'All') params.set('spec', spec);
        if (search.trim()) params.set('search', search.trim());
        if (avail) params.set('available', '1');
        if (sort) params.set('sort', sort);

        const response = await api.getDoctors(`?${params.toString()}`);
        if (active) {
          setDoctors(response.doctors || []);
        }
      } catch (error) {
        if (active) {
          setDoctors([]);
          console.error('Could not load doctors:', error);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDoctors();
    return () => { active = false; };
  }, [spec, search, avail, sort, addToast]);

  const visibleDoctors = useMemo(() => doctors.filter((doctor) => {
    if (spec !== 'All' && doctor.spec !== spec) return false;
    if (avail && !doctor.avail) return false;

    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return `${doctor.name} ${doctor.spec} ${doctor.district || ''}`.toLowerCase().includes(query);
  }), [doctors, spec, avail, search]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cream)' }}>
      <div style={{ background: 'linear-gradient(135deg,var(--teal-dark),var(--teal))', padding: '28px 5%' }}>
        <button style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans,sans-serif', fontWeight: 500, fontSize: '0.84rem', marginBottom: 16 }} onClick={onBack}>Back</button>
        <h1 style={{ fontFamily: 'Cormorant Garamond,serif', color: '#fff', fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Find a Doctor</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' }}>Only admin-verified doctors appear here, ready for booking.</p>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 5%' }}>
        <div className="card" style={{ padding: '20px 24px', marginBottom: 24, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="form-input" placeholder="Search doctors or specialties" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: '1', minWidth: 200 }} />
          <select className="form-input form-select" value={sort} onChange={(e) => setSort(e.target.value)} style={{ width: 160 }}>
            <option value="rating">Sort: Rating</option>
            <option value="fee">Sort: Fee</option>
            <option value="exp">Sort: Experience</option>
            <option value="reviews">Sort: Reviews</option>
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.88rem', fontWeight: 500, userSelect: 'none' }}>
            <input type="checkbox" checked={avail} onChange={(e) => setAvail(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--teal)', cursor: 'pointer' }} />
            Available Only
          </label>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {SPEC_OPTIONS.map((option) => (
            <button key={option} className={`btn btn-sm ${spec === option ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setSpec(option)}>{option}</button>
          ))}
        </div>

        <p style={{ fontSize: '0.84rem', color: 'var(--muted)', marginBottom: 18 }}>
          {loading ? 'Loading doctors...' : `${visibleDoctors.length} doctor${visibleDoctors.length !== 1 ? 's' : ''} found`}
        </p>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner spinner-teal" style={{ width: 40, height: 40 }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(295px,1fr))', gap: 20 }}>
            {visibleDoctors.map((doctor) => (
              <div key={doctor.doctor_profile_id || doctor.id} className="card" style={{ padding: 26, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 58, height: 58, borderRadius: '50%', background: `linear-gradient(135deg,${doctor.c || '#0b7c6f'},${doctor.c || '#0b7c6f'}99)`, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem' }}>
                    {doctor.init || doctor.initials || doctor.name?.slice(0, 1)}
                  </div>
                  <span className={`badge badge-${doctor.avail ? 'green' : 'gray'}`}>{doctor.avail ? 'Online' : 'Offline'}</span>
                </div>
                <span className="badge badge-teal" style={{ marginBottom: 8, alignSelf: 'flex-start' }}>BMDC Verified</span>
                <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.1rem', fontWeight: 700, marginBottom: 3 }}>{doctor.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 8 }}>{doctor.spec} · {doctor.exp} · {doctor.district || 'Bangladesh'}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <span className="stars">{'★'.repeat(5)}</span>
                  <b style={{ fontSize: '0.88rem' }}>{doctor.rating || 0}</b>
                  <span style={{ fontSize: '0.76rem', color: 'var(--muted)' }}>({doctor.rev || 0})</span>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--teal)', fontWeight: 600, marginBottom: 14 }}>
                  Consultation Fee: ৳{doctor.fee || 0}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 'auto' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => addToast(`${doctor.name} • ${doctor.bmdc_number} • ${doctor.spec}`, 'info')}>View Profile</button>
                  <button className={`btn btn-sm ${doctor.avail ? 'btn-primary' : 'btn-ghost'}`} disabled={!doctor.avail} onClick={() => onBook(doctor)}>
                    {doctor.avail ? 'Book Now' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && visibleDoctors.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ fontFamily: 'Cormorant Garamond,serif', fontSize: '1.4rem', marginBottom: 8 }}>No doctors found</h3>
            <p style={{ color: 'var(--muted)' }}>Try another specialty or clear the filters.</p>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => { setSpec('All'); setSearch(''); setAvail(false); setSort('rating'); }}>Clear Filters</button>
          </div>
        )}
      </div>
    </div>
  );
}

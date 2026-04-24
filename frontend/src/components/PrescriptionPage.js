import React from 'react';
import { useToast } from '../ToastContext';

export default function PrescriptionPage({ prescription, onBack }) {
  const { addToast } = useToast();
  const rx = prescription;

  if (!rx) {
    return (
      <div style={{ minHeight:'100vh',background:'var(--cream)',display:'flex',alignItems:'center',justifyContent:'center',padding:24 }}>
        <div className="card" style={{ padding:32,textAlign:'center',maxWidth:420 }}>
          <h3 style={{ fontFamily:'Cormorant Garamond,serif',fontSize:'1.5rem',fontWeight:700,marginBottom:8 }}>Prescription not found</h3>
          <p style={{ color:'var(--muted)',marginBottom:16 }}>Open this page from the prescriptions list to view a real prescription.</p>
          <button className="btn btn-primary" onClick={onBack}>Back</button>
        </div>
      </div>
    );
  }

  const handlePrint = () => { window.print(); };

  return (
    <div style={{ minHeight:'100vh',background:'var(--cream)',padding:'32px 5%' }}>
      <div style={{ maxWidth:700,margin:'0 auto' }}>
        <div style={{ display:'flex',gap:12,marginBottom:20,flexWrap:'wrap' }}>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨 Print / Save PDF</button>
          <button className="btn btn-outline btn-sm" onClick={() => addToast('Prescription shared with pharmacy!','success')}>📤 Share with Pharmacy</button>
        </div>

        {/* Prescription document */}
        <div className="card" style={{ padding:'40px 48px' }} id="prescription-doc">
          {/* Header */}
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:28,paddingBottom:20,borderBottom:'2px solid var(--teal)' }}>
            <div>
              <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8 }}>
                <div style={{ width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#0b7c6f,#13b09c)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontFamily:'Cormorant Garamond,serif' }}>M</div>
                <div>
                  <span style={{ fontFamily:'Cormorant Garamond,serif',fontWeight:700,fontSize:'1.1rem',color:'var(--ink)' }}>MedConnect Bangladesh</span>
                  <div style={{ fontSize:'0.6rem',color:'var(--teal)',fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase' }}>TELEMEDICINE PLATFORM</div>
                </div>
              </div>
              <div style={{ fontSize:'0.75rem',color:'var(--muted)' }}>BMDC Registered · Digital Prescription</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontFamily:'Cormorant Garamond,serif',fontSize:'1.1rem',fontWeight:700,color:'var(--teal)' }}>Rx #{rx.id || '0001'}</div>
              <div style={{ fontSize:'0.78rem',color:'var(--muted)',marginTop:2 }}>Date: {rx.date}</div>
            </div>
          </div>

          {/* Doctor info */}
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24 }}>
            <div style={{ background:'var(--teal-faint)',borderRadius:10,padding:'14px 18px' }}>
              <div style={{ fontSize:'0.68rem',fontWeight:700,color:'var(--teal)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8 }}>Prescribing Doctor</div>
              <div style={{ fontWeight:700,fontSize:'1rem',color:'var(--ink)',marginBottom:2 }}>{rx.doctor_name}</div>
              <div style={{ fontSize:'0.8rem',color:'var(--muted)' }}>{rx.doctor_spec || 'Internal Medicine'}</div>
              <div style={{ fontSize:'0.78rem',color:'var(--teal)',marginTop:4 }}>BMDC Reg: {rx.bmdc || 'A-12345'} ✓</div>
            </div>
            <div style={{ background:'var(--cream)',borderRadius:10,padding:'14px 18px' }}>
              <div style={{ fontSize:'0.68rem',fontWeight:700,color:'var(--muted)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8 }}>Patient</div>
              <div style={{ fontWeight:700,fontSize:'1rem',color:'var(--ink)',marginBottom:2 }}>{rx.patient_name || 'Patient Name'}</div>
              <div style={{ fontSize:'0.8rem',color:'var(--muted)' }}>Age: {rx.patient_age || 'N/A'} · {rx.patient_gender || 'N/A'}</div>
              <div style={{ fontSize:'0.78rem',color:'var(--muted)',marginTop:4 }}>Phone: {rx.patient_phone || 'N/A'}</div>
            </div>
          </div>

          {/* Diagnosis */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:'0.72rem',fontWeight:700,color:'var(--muted)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6 }}>Diagnosis</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif',fontSize:'1.2rem',fontWeight:700,color:'var(--ink)',padding:'10px 16px',background:'var(--cream)',borderRadius:8,borderLeft:'3px solid var(--teal)' }}>
              {rx.diagnosis}
            </div>
          </div>

          {/* Medicines */}
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:'0.72rem',fontWeight:700,color:'var(--muted)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:12 }}>Prescribed Medicines</div>
            <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'0.86rem' }}>
              <thead>
                <tr style={{ background:'var(--teal)',color:'#fff' }}>
                  <th style={{ padding:'10px 14px',textAlign:'left',borderRadius:'8px 0 0 0',fontSize:'0.72rem',letterSpacing:'0.06em',fontWeight:700 }}>#</th>
                  <th style={{ padding:'10px 14px',textAlign:'left',fontSize:'0.72rem',letterSpacing:'0.06em',fontWeight:700 }}>Medicine</th>
                  <th style={{ padding:'10px 14px',textAlign:'left',fontSize:'0.72rem',letterSpacing:'0.06em',fontWeight:700 }}>Dose</th>
                  <th style={{ padding:'10px 14px',textAlign:'left',fontSize:'0.72rem',letterSpacing:'0.06em',fontWeight:700 }}>Frequency</th>
                  <th style={{ padding:'10px 14px',textAlign:'left',borderRadius:'0 8px 0 0',fontSize:'0.72rem',letterSpacing:'0.06em',fontWeight:700 }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {(rx.medicineList || defaultMeds).map((m,i) => (
                  <tr key={i} style={{ background: i%2===0 ? '#fff' : 'var(--cream)' }}>
                    <td style={{ padding:'10px 14px',color:'var(--muted)',fontWeight:600 }}>{i+1}</td>
                    <td style={{ padding:'10px 14px',fontWeight:700 }}>{m.name}</td>
                    <td style={{ padding:'10px 14px',color:'var(--muted)' }}>{m.dose}</td>
                    <td style={{ padding:'10px 14px',color:'var(--muted)' }}>{m.freq}</td>
                    <td style={{ padding:'10px 14px',color:'var(--muted)' }}>{m.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Notes */}
          {rx.notes && (
            <div style={{ marginBottom:24 }}>
              <div style={{ fontSize:'0.72rem',fontWeight:700,color:'var(--muted)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:6 }}>Instructions</div>
              <div style={{ background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,padding:'12px 16px',fontSize:'0.88rem',color:'#92400e',lineHeight:1.6 }}>
                {rx.notes}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ paddingTop:20,borderTop:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <div style={{ fontSize:'0.72rem',color:'var(--muted)' }}>
              <div>This is a digitally issued prescription via MedConnect Bangladesh.</div>
              <div>Verify at: medconnect.com.bd/verify/{rx.id || '0001'}</div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ width:100,height:40,borderTop:'2px solid var(--ink-mid)',marginBottom:4 }} />
              <div style={{ fontSize:'0.72rem',color:'var(--muted)' }}>Doctor's Signature</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
const defaultMeds = [{ name:'Amoxicillin 500mg', dose:'1 tablet', freq:'3 times/day', duration:'7 days' },{ name:'Paracetamol 500mg', dose:'1 tablet', freq:'Every 6 hours', duration:'3 days' }];

import React, { useState, useEffect } from 'react';

const STATS = [
  { v: '2,400+', l: 'Verified Doctors' },
  { v: '64',     l: 'Districts Covered' },
  { v: '98%',    l: 'Patient Satisfaction' },
  { v: '50k+',   l: 'Consultations Done' },
];

const SERVICES = [
  { icon:'🎥', title:'Video Consultation', desc:'HD face-to-face consultations with verified doctors from anywhere in Bangladesh.', color:'#e6f5f3', accent:'#0b7c6f' },
  { icon:'📅', title:'Smart Scheduling',  desc:'Book appointments instantly based on real-time doctor availability.', color:'#fef9ec', accent:'#c9913a' },
  { icon:'💊', title:'Digital Prescriptions', desc:'Tamper-proof e-prescriptions delivered instantly after consultation.', color:'#eff6ff', accent:'#2563eb' },
  { icon:'📂', title:'Health Records',    desc:'Secure centralised storage of your complete medical history and reports.', color:'#fef2f2', accent:'#dc2626' },
  { icon:'🏥', title:'BMDC Verified',     desc:'Every doctor passes BMDC credential and background verification.', color:'#f0fdf4', accent:'#16a34a' },
  { icon:'🚚', title:'Pharmacy Delivery', desc:'Partner pharmacies fulfil your prescriptions with home delivery.', color:'#fdf4ff', accent:'#9333ea' },
];

const STEPS = [
  { n:'01', icon:'👤', title:'Create Profile', desc:'Register and verify with your phone or NID.' },
  { n:'02', icon:'🔍', title:'Find a Doctor',  desc:'Filter by specialty, district, availability.' },
  { n:'03', icon:'📅', title:'Book Slot',      desc:'Pick a convenient time. Instant confirmation.' },
  { n:'04', icon:'🎥', title:'Consult Online', desc:'Video, voice or chat consultation.' },
  { n:'05', icon:'📋', title:'Get Prescription', desc:'Download e-prescription and order medicines.' },
];

const DOCTORS = [
  { n:'Dr. Rashida Khanam', s:'Internal Medicine', exp:'14 yrs', r:4.9, rev:312, init:'RK', c:'#0b7c6f', avail:true },
  { n:'Dr. Imran Hossain',  s:'Cardiology',        exp:'18 yrs', r:4.8, rev:248, init:'IH', c:'#2563eb', avail:true },
  { n:'Dr. Fahmida Begum',  s:'Pediatrics',        exp:'11 yrs', r:4.9, rev:401, init:'FB', c:'#c9913a', avail:true },
  { n:'Dr. Sadia Islam',    s:'Neurology',         exp:'16 yrs', r:4.8, rev:227, init:'SI', c:'#9333ea', avail:true },
  { n:'Dr. Tanvir Ahmed',   s:'Dermatology',       exp:'9 yrs',  r:4.7, rev:185, init:'TA', c:'#dc2626', avail:false },
  { n:'Dr. Mahbub Rahman',  s:'Internal Medicine', exp:'12 yrs', r:4.6, rev:196, init:'MR', c:'#16a34a', avail:true },
];

const TESTIMONIALS = [
  { name:'Farida Akter',    loc:'Sylhet',     text:'Living in a rural area I always struggled to see specialists. MedConnect changed everything — I consulted a cardiologist from my home!', r:5, init:'FA', c:'#0b7c6f' },
  { name:'Md. Karim Uddin', loc:'Rajshahi',   text:'The digital prescription was accepted at my local pharmacy immediately. Consultation to medicine took just 2 hours.', r:5, init:'KU', c:'#2563eb' },
  { name:'Taslima Begum',   loc:'Chittagong', text:'I appreciate that all doctors are BMDC verified. I feel safe and trust the advice. The video quality is also excellent.', r:5, init:'TB', c:'#c9913a' },
];

const SPECS = ['All','Internal Medicine','Cardiology','Pediatrics','Dermatology','Neurology'];

export default function LandingPage({ navigate, openAuth }) {
  const [scrolled, setScrolled]   = useState(false);
  const [spec, setSpec]           = useState('All');
  const [mobileMenu, setMobile]   = useState(false);
  const [contactForm, setContact] = useState({ name:'', email:'', message:'' });
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = id => { document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); setMobile(false); };

  const filtered = spec === 'All' ? DOCTORS : DOCTORS.filter(d => d.s === spec);

  const handleContact = e => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => setContactSent(false), 3000);
    setContact({ name:'', email:'', message:'' });
  };

  return (
    <div style={{ fontFamily:'Plus Jakarta Sans, sans-serif' }}>
      {/* ── NAVBAR ── */}
      <nav style={{ ...nav.bar, background: scrolled ? 'rgba(248,244,238,0.96)' : 'transparent', boxShadow: scrolled ? '0 1px 0 var(--border)' : 'none', backdropFilter: scrolled ? 'blur(16px)' : 'none' }}>
        <div style={nav.logo} onClick={() => scrollTo('hero')}>
          <div style={nav.logoIcon}>M</div>
          <div>
            <span style={nav.logoName}>MedConnect</span>
            <span style={nav.logoBD}>BANGLADESH</span>
          </div>
        </div>

        <ul style={{ ...nav.links, display: mobileMenu ? 'flex' : undefined, flexDirection: mobileMenu ? 'column' : undefined, position: mobileMenu ? 'absolute' : undefined, top: mobileMenu ? 68 : undefined, left:0, right:0, background: mobileMenu ? 'rgba(248,244,238,0.98)' : undefined, padding: mobileMenu ? '20px 5%' : undefined, boxShadow: mobileMenu ? '0 8px 24px rgba(0,0,0,0.08)' : undefined }}>
          {[['services','Services'],['how-it-works','How It Works'],['doctors-section','Doctors'],['contact','Contact']].map(([id,label]) => (
            <li key={id} style={{ listStyle:'none' }}>
              <span style={nav.link} onClick={() => scrollTo(id)}>{label}</span>
            </li>
          ))}
        </ul>

        <div style={nav.actions}>
          <button className="btn btn-ghost btn-sm" onClick={() => openAuth('login')}>Sign In</button>
          <button className="btn btn-primary btn-sm" onClick={() => openAuth('register')}>Get Started</button>
          <button style={nav.ham} onClick={() => setMobile(!mobileMenu)}>
            <span style={nav.bar2} /><span style={nav.bar2} /><span style={nav.bar2} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" style={hero.section}>
        <div style={hero.blob1} /><div style={hero.blob2} />
        <div style={hero.container}>
          <div style={hero.left} className="animate-fadeup">
            <div className="section-label">🏥 Bangladesh's Premier Telemedicine</div>
            <h1 style={hero.h1}>Healthcare<br /><span style={hero.accent}>At Your Fingertips</span></h1>
            <p style={hero.p}>Connect with BMDC-verified doctors from anywhere in Bangladesh. Book appointments, consult online, and receive digital prescriptions — from the comfort of your home.</p>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap' }}>
              <button className="btn btn-primary btn-lg" onClick={() => openAuth('register')}>🩺 Consult a Doctor</button>
              <button className="btn btn-outline btn-lg" onClick={() => scrollTo('how-it-works')}>▶ How It Works</button>
            </div>
            <div style={hero.stats}>
              {STATS.map((s,i) => (
                <div key={i} style={hero.stat}>
                  <span style={hero.statV}>{s.v}</span>
                  <span style={hero.statL}>{s.l}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={hero.right}>
            <div style={heroCard.wrap} className="animate-float">
              <div style={heroCard.card}>
                <div style={heroCard.header}>
                  <div style={heroCard.av}>RK</div>
                  <div style={{ flex:1 }}>
                    <div style={heroCard.name}>Dr. Rashida Khanam</div>
                    <div style={heroCard.spec}>Internal Medicine</div>
                  </div>
                  <div style={heroCard.dot} />
                </div>
                <div style={heroCard.divider} />
                <div style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--muted)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>Today's Slots</div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
                  {['10:00 AM','02:30 PM','05:00 PM'].map((t,i)=>(
                    <span key={i} style={{ ...heroCard.slot, ...(i===1 ? heroCard.slotActive : {}) }}>{t}</span>
                  ))}
                </div>
                <button className="btn btn-primary btn-block" onClick={() => openAuth('register')}>Book Consultation</button>
              </div>
              <div style={heroCard.badge1}><span>💬</span><div><b style={{fontSize:'0.82rem',color:'var(--ink)'}}>Video Consult</b><div style={{fontSize:'0.72rem',color:'var(--muted)'}}>HD Quality</div></div></div>
              <div style={heroCard.badge2}><span>📋</span><div><b style={{fontSize:'0.82rem',color:'var(--ink)'}}>e-Prescription</b><div style={{fontSize:'0.72rem',color:'var(--muted)'}}>Instant Digital</div></div></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" style={sec.white}>
        <div style={sec.container}>
          <div style={sec.center}>
            <div className="section-label">✦ Our Services</div>
            <h2 className="section-title">Everything You Need<br />for Better Healthcare</h2>
            <p className="section-sub">A complete digital health ecosystem designed for Bangladesh.</p>
          </div>
          <div style={sec.grid3}>
            {SERVICES.map((s,i) => (
              <div key={i} className="card" style={sec.sCard}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-7px)';e.currentTarget.style.boxShadow='var(--shadow-md)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='var(--shadow-sm)'}}>
                <div style={sec.sTop}>
                  <div style={{...sec.icon, background:s.color}}>{s.icon}</div>
                  <div style={sec.sAccentLine} />
                </div>
                <div style={sec.sBody}>
                  <h3 style={{...sec.sTitle, color:s.accent}}>{s.title}</h3>
                  <p style={sec.sDesc}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={sec.cream}>
        <div style={sec.container}>
          <div style={sec.center}>
            <div className="section-label">🔄 Process</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-sub">Getting quality healthcare online is now simpler than ever.</p>
          </div>
          <div style={steps.row}>
            {STEPS.map((s,i) => (
              <React.Fragment key={i}>
                <div style={steps.step}>
                  <div style={steps.stepTop}>
                    <div style={steps.num}>{s.n}</div>
                    <div style={steps.circle}>{s.icon}</div>
                  </div>
                  <div style={steps.stepBody}>
                    <h4 style={steps.title}>{s.title}</h4>
                    <p style={steps.desc}>{s.desc}</p>
                  </div>
                </div>
                {i < STEPS.length-1 && <div style={steps.arrow}>→</div>}
              </React.Fragment>
            ))}
          </div>
          <div style={steps.ctaBox}>
            <span style={{fontSize:32}}>🏥</span>
            <div>
              <h3 style={{fontFamily:'Cormorant Garamond,serif',color:'#fff',fontSize:'1.4rem',marginBottom:4}}>Ready to get started?</h3>
              <p style={{color:'rgba(255,255,255,0.75)',fontSize:'0.88rem'}}>Join thousands getting quality healthcare online.</p>
            </div>
            <button className="btn btn-lg" style={{background:'#fff',color:'var(--teal)',whiteSpace:'nowrap'}} onClick={() => openAuth('register')}>
              Start Consultation →
            </button>
          </div>
        </div>
      </section>

      {/* ── DOCTORS ── */}
      <section id="doctors-section" style={sec.white}>
        <div style={sec.container}>
          <div style={sec.center}>
            <div className="section-label">👨‍⚕️ Our Specialists</div>
            <h2 className="section-title">Meet Our Verified Doctors</h2>
            <p className="section-sub">All doctors are verified through BMDC credentials and background checks.</p>
          </div>
          <div style={{display:'flex',gap:10,flexWrap:'wrap',justifyContent:'center',marginBottom:40}}>
            {SPECS.map(s => (
              <button key={s} className={`btn btn-sm ${spec===s?'btn-primary':'btn-ghost'}`} onClick={() => setSpec(s)}>{s}</button>
            ))}
          </div>
          <div style={sec.grid3}>
            {filtered.map((d,i) => (
              <div key={i} className="card" style={doc.card}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-5px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div style={{...doc.av,background:`linear-gradient(135deg,${d.c},${d.c}99)`}}>{d.init}</div>
                  <span className={`badge ${d.avail?'badge-green':'badge-gray'}`}>{d.avail?'● Online':'○ Offline'}</span>
                </div>
                <span className="badge badge-teal" style={{marginBottom:8}}>✓ BMDC Verified</span>
                <h4 style={doc.name}>{d.n}</h4>
                <p style={doc.spec}>{d.s} · {d.exp}</p>
                <div style={{display:'flex',alignItems:'center',gap:6,margin:'8px 0'}}>
                  <span className="stars">{'★'.repeat(5)}</span>
                  <b style={{fontSize:'0.88rem'}}>{d.r}</b>
                  <span style={{fontSize:'0.78rem',color:'var(--muted)'}}>({d.rev} reviews)</span>
                </div>
                <p style={{fontSize:'0.8rem',color:'var(--teal)',fontWeight:500,marginBottom:14}}>
                  {d.avail ? '3 slots available today' : 'Not available today'}
                </p>
                <button className={`btn btn-block ${d.avail?'btn-primary':'btn-ghost'}`} disabled={!d.avail}
                  onClick={() => openAuth('register')}>
                  {d.avail ? 'Book Now' : 'Unavailable'}
                </button>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:32}}>
            <button className="btn btn-outline" onClick={() => navigate('doctors')}>View All Doctors →</button>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={sec.cream}>
        <div style={sec.container}>
          <div style={sec.center}>
            <div className="section-label">💬 Patient Stories</div>
            <h2 className="section-title">Trusted Across Bangladesh</h2>
          </div>
          <div style={sec.grid3}>
            {TESTIMONIALS.map((t,i) => (
              <div key={i} className="card" style={{padding:28,display:'flex',flexDirection:'column',gap:14}}>
                <span className="stars" style={{fontSize:'1.1rem'}}>{'★'.repeat(t.r)}</span>
                <p style={{color:'var(--ink-mid)',lineHeight:1.75,fontSize:'0.93rem',fontStyle:'italic',flex:1}}>"{t.text}"</p>
                <div style={{display:'flex',alignItems:'center',gap:12,paddingTop:12,borderTop:'1px solid var(--border)'}}>
                  <div style={{width:42,height:42,borderRadius:'50%',background:`linear-gradient(135deg,${t.c},${t.c}99)`,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.82rem',flexShrink:0}}>{t.init}</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:'0.9rem'}}>{t.name}</div>
                    <div style={{fontSize:'0.75rem',color:'var(--muted)'}}>📍 {t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={sec.white}>
        <div style={{...sec.container,maxWidth:680}}>
          <div style={sec.center}>
            <div className="section-label">📩 Contact Us</div>
            <h2 className="section-title">Get in Touch</h2>
            <p className="section-sub">Have a question? We'd love to hear from you.</p>
          </div>
          {contactSent
            ? <div style={{textAlign:'center',padding:40}}>
                <div style={{fontSize:48,marginBottom:16}}>✅</div>
                <h3 style={{fontFamily:'Cormorant Garamond,serif',fontSize:'1.6rem',marginBottom:8}}>Message Sent!</h3>
                <p style={{color:'var(--muted)'}}>We'll get back to you within 24 hours.</p>
              </div>
            : <form onSubmit={handleContact} style={{display:'flex',flexDirection:'column',gap:16}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" required placeholder="Full name" value={contactForm.name} onChange={e=>setContact({...contactForm,name:e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" required placeholder="you@example.com" value={contactForm.email} onChange={e=>setContact({...contactForm,email:e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" rows={5} required placeholder="Write your message…" value={contactForm.message} onChange={e=>setContact({...contactForm,message:e.target.value})} style={{resize:'vertical'}} />
                </div>
                <button className="btn btn-primary btn-lg btn-block" type="submit">Send Message →</button>
              </form>
          }
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={foot.footer}>
        <div style={foot.container}>
          <div style={foot.top}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
                <div style={nav.logoIcon}>M</div>
                <div>
                  <span style={{...nav.logoName,color:'#fff'}}>MedConnect</span>
                  <span style={{...nav.logoBD,color:'var(--teal-light)'}}>BANGLADESH</span>
                </div>
              </div>
              <p style={foot.desc}>Bangladesh's premier telemedicine platform. Connecting patients with BMDC-verified doctors across all 64 districts.</p>
              <div style={{display:'flex',gap:8,marginTop:12,flexWrap:'wrap'}}>
                <span className="badge" style={{background:'rgba(11,124,111,0.25)',color:'#4dd9c8'}}>🔒 BMDC Verified</span>
                <span className="badge" style={{background:'rgba(11,124,111,0.25)',color:'#4dd9c8'}}>🛡️ Secure Platform</span>
              </div>
            </div>
            {[
              {title:'Services',links:['Video Consultation','Appointment Booking','Digital Prescriptions','Health Records','Pharmacy Delivery']},
              {title:'For Doctors',links:['Join as Doctor','BMDC Verification','Doctor Dashboard','Patient Management']},
              {title:'Quick Links',links:['About Us','Privacy Policy','Terms of Service','Contact Support']},
            ].map((col,i) => (
              <div key={i}>
                <h4 style={foot.colT}>{col.title}</h4>
                {col.links.map((l,j) => <div key={j} style={foot.link} onMouseEnter={e=>e.target.style.color='var(--teal-light)'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.5)'}>{l}</div>)}
              </div>
            ))}
          </div>
          <div style={foot.bottom}>
            <p>© 2026 MedConnect Bangladesh. All rights reserved.</p>
            <p style={{marginTop:4,opacity:0.5}}>CSE309 Project · Mehebu Rubaya Reya · ID: 2211312 · Section: 05 · Independent University Bangladesh</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Styles ── */
const nav = {
  bar: { position:'fixed',top:0,left:0,right:0,zIndex:1000,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 5%',height:68,transition:'all 0.3s ease' },
  logo: { display:'flex',alignItems:'center',gap:10,cursor:'pointer',userSelect:'none' },
  logoIcon: { width:38,height:38,borderRadius:9,background:'linear-gradient(135deg,var(--teal),var(--teal-light))',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontFamily:'Cormorant Garamond,serif',fontSize:'1.1rem',flexShrink:0 },
  logoName: { display:'block',fontFamily:'Cormorant Garamond,serif',fontWeight:700,fontSize:'1.15rem',color:'var(--ink)',lineHeight:1.1 },
  logoBD: { display:'block',fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.14em',color:'var(--teal)' },
  links: { display:'flex',alignItems:'center',gap:28,listStyle:'none',margin:0,padding:0 },
  link: { color:'var(--ink-mid)',fontSize:'0.88rem',fontWeight:500,cursor:'pointer',transition:'color 0.2s',userSelect:'none' },
  actions: { display:'flex',gap:10,alignItems:'center' },
  ham: { display:'none',flexDirection:'column',gap:4,background:'none',border:'none',cursor:'pointer',padding:4 },
  bar2: { display:'block',width:22,height:2,background:'var(--ink)',borderRadius:2 },
};
const hero = {
  section: { minHeight:'100vh',display:'flex',alignItems:'center',paddingTop:68,position:'relative',overflow:'hidden', background:'linear-gradient(150deg,var(--cream) 0%,#e6f5f3 50%,var(--cream) 100%)' },
  blob1: { position:'absolute',top:'-20%',right:'-8%',width:580,height:580,borderRadius:'50%',background:'radial-gradient(circle,rgba(11,124,111,0.06),transparent 70%)',pointerEvents:'none' },
  blob2: { position:'absolute',bottom:'-10%',left:'-5%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(201,145,58,0.05),transparent 70%)',pointerEvents:'none' },
  container: { maxWidth:1200,margin:'0 auto',padding:'60px 5% 80px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center',width:'100%' },
  left: { display:'flex',flexDirection:'column',gap:22 },
  h1: { fontFamily:'Cormorant Garamond,serif',fontSize:'clamp(2.6rem,5vw,4.2rem)',fontWeight:700,color:'var(--ink)',lineHeight:1.08 },
  accent: { color:'var(--teal)',borderBottom:'4px solid var(--gold)',paddingBottom:2 },
  p: { fontSize:'1.02rem',color:'var(--ink-mid)',lineHeight:1.8,maxWidth:490 },
  stats: { display:'flex',gap:28,paddingTop:20,borderTop:'1px solid var(--border)',flexWrap:'wrap' },
  stat: { display:'flex',flexDirection:'column',gap:2 },
  statV: { fontFamily:'Cormorant Garamond,serif',fontSize:'1.9rem',fontWeight:700,color:'var(--teal)' },
  statL: { fontSize:'0.74rem',color:'var(--muted)',fontWeight:600,letterSpacing:'0.05em',textTransform:'uppercase' },
  right: { display:'flex',justifyContent:'center',alignItems:'center' },
};
const heroCard = {
  wrap: { position:'relative',padding:32 },
  card: { background:'#fff',borderRadius:22,padding:26,boxShadow:'0 24px 64px rgba(11,124,111,0.15)',width:310,position:'relative' },
  header: { display:'flex',alignItems:'center',gap:12,marginBottom:0,position:'relative' },
  av: { width:50,height:50,borderRadius:'50%',background:'linear-gradient(135deg,var(--teal),var(--teal-light))',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.88rem',flexShrink:0 },
  name: { fontWeight:700,fontSize:'0.95rem',color:'var(--ink)' },
  spec: { fontSize:'0.73rem',color:'var(--teal)',marginTop:2 },
  dot: { position:'absolute',top:2,right:0,width:10,height:10,borderRadius:'50%',background:'#22c55e',boxShadow:'0 0 0 3px rgba(34,197,94,0.2)' },
  divider: { height:1,background:'var(--border)',margin:'14px 0' },
  slot: { padding:'5px 12px',borderRadius:100,fontSize:'0.78rem',fontWeight:500,background:'var(--teal-faint)',color:'var(--teal)',cursor:'pointer',border:'1.5px solid transparent' },
  slotActive: { background:'var(--teal)',color:'#fff' },
  badge1: { position:'absolute',top:-4,right:-16,background:'#fff',borderRadius:12,padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,0.1)',display:'flex',gap:8,alignItems:'center' },
  badge2: { position:'absolute',bottom:8,left:-16,background:'#fff',borderRadius:12,padding:'10px 14px',boxShadow:'0 8px 24px rgba(0,0,0,0.1)',display:'flex',gap:8,alignItems:'center' },
};
const sec = {
  white: { padding:'90px 5%',background:'#fff' },
  cream: { padding:'90px 5%',background:'var(--cream)' },
  container: { maxWidth:1200,margin:'0 auto' },
  center: { textAlign:'center',marginBottom:52,display:'flex',flexDirection:'column',alignItems:'center' },
  grid3: { display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:24 },
  sCard: { padding:'30px 28px',transition:'all 0.3s ease',cursor:'default',minHeight:250,display:'flex',flexDirection:'column',justifyContent:'space-between',background:'linear-gradient(180deg,#fff 0%,#fcfbf8 100%)' },
  sTop: { display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:18,marginBottom:22 },
  icon: { width:56,height:56,borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:18 },
  sAccentLine: { flex:1,height:2,borderRadius:999,background:'linear-gradient(90deg,var(--border),transparent)',marginTop:28 },
  sBody: { display:'flex',flexDirection:'column',gap:10 },
  sTitle: { fontFamily:'Cormorant Garamond,serif',fontSize:'1.1rem',fontWeight:700,marginBottom:8 },
  sDesc: { color:'var(--muted)',lineHeight:1.8,fontSize:'0.92rem' },
};
const steps = {
  row: { display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:18,alignItems:'stretch' },
  step: { display:'flex',flexDirection:'column',justifyContent:'space-between',textAlign:'left',padding:'24px 20px',borderRadius:22,background:'#fff',border:'1px solid var(--border)',boxShadow:'var(--shadow-sm)',minHeight:230,position:'relative',overflow:'hidden' },
  stepTop: { display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,marginBottom:20 },
  stepBody: { display:'flex',flexDirection:'column',gap:8 },
  num: { fontFamily:'Cormorant Garamond,serif',fontSize:'0.88rem',fontWeight:700,color:'var(--teal)',letterSpacing:'0.08em' },
  circle: { width:62,height:62,borderRadius:'18px',background:'linear-gradient(135deg,rgba(11,124,111,0.08),rgba(19,176,156,0.14))',border:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0 },
  title: { fontFamily:'Cormorant Garamond,serif',fontSize:'1.15rem',fontWeight:700,color:'var(--ink)' },
  desc: { fontSize:'0.84rem',color:'var(--muted)',lineHeight:1.75 },
  arrow: { display:'none' },
  ctaBox: { marginTop:52,background:'linear-gradient(135deg,var(--teal-dark),var(--teal))',borderRadius:22,padding:'28px 36px',display:'flex',alignItems:'center',gap:24,flexWrap:'wrap',boxShadow:'0 20px 48px rgba(11,124,111,0.25)' },
};
const doc = {
  card: { padding:26,transition:'transform 0.3s ease',display:'flex',flexDirection:'column' },
  av: { width:56,height:56,borderRadius:'50%',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'1rem' },
  name: { fontFamily:'Cormorant Garamond,serif',fontSize:'1.05rem',fontWeight:700,color:'var(--ink)' },
  spec: { fontSize:'0.8rem',color:'var(--muted)',marginTop:2 },
};
const foot = {
  footer: { background:'#0a1a16',padding:'70px 5% 36px' },
  container: { maxWidth:1200,margin:'0 auto' },
  top: { display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40,paddingBottom:44,borderBottom:'1px solid rgba(255,255,255,0.06)' },
  desc: { color:'rgba(255,255,255,0.5)',fontSize:'0.85rem',lineHeight:1.7,maxWidth:280 },
  colT: { color:'#fff',fontWeight:700,fontSize:'0.88rem',marginBottom:14,letterSpacing:'0.04em' },
  link: { color:'rgba(255,255,255,0.5)',fontSize:'0.83rem',marginBottom:9,cursor:'pointer',transition:'color 0.2s' },
  bottom: { paddingTop:28,color:'rgba(255,255,255,0.3)',fontSize:'0.76rem' },
};

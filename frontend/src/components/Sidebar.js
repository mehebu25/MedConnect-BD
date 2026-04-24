import React from 'react';
import { useAuth } from '../AuthContext';

export default function Sidebar({ title, navItems, user, onLogout, isOpen, onClose }) {
  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && <div onClick={onClose} style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',zIndex:99,display:'none' }} className="sidebar-overlay" />}

      <aside className={`sidebar${isOpen?' open':''}`}>
        {/* Logo */}
        <div style={s.logoArea}>
          <div style={s.logoIcon}>M</div>
          <div>
            <div style={s.logoName}>MedConnect</div>
            <div style={s.logoBD}>BANGLADESH</div>
          </div>
        </div>

        <div style={s.roleChip}>{title}</div>

        {/* Nav */}
        <nav style={s.nav}>
          {navItems.map((item, i) => (
            <button key={i} style={{ ...s.navBtn, ...(item.active ? s.navActive : {}) }} onClick={item.onClick}>
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div style={s.bottom}>
          <div style={s.userRow}>
            <div style={s.userAv}>{user?.name?.charAt(0) || 'U'}</div>
            <div style={{ flex:1,minWidth:0 }}>
              <div style={s.userName}>{user?.name}</div>
              <div style={s.userEmail}>{user?.email}</div>
            </div>
          </div>
          <button style={s.logoutBtn} onClick={onLogout}>⬡ Sign Out</button>
        </div>
      </aside>
    </>
  );
}

const s = {
  logoArea: { display:'flex',alignItems:'center',gap:10,padding:'24px 20px 16px' },
  logoIcon: { width:36,height:36,borderRadius:9,background:'linear-gradient(135deg,#0b7c6f,#13b09c)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontFamily:'Cormorant Garamond,serif',fontSize:'1rem',flexShrink:0 },
  logoName: { color:'#fff',fontFamily:'Cormorant Garamond,serif',fontWeight:700,fontSize:'1.05rem',lineHeight:1.1 },
  logoBD: { color:'#13b09c',fontSize:'0.56rem',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase' },
  roleChip: { margin:'0 16px 16px',background:'rgba(255,255,255,0.07)',borderRadius:8,padding:'6px 14px',fontSize:'0.72rem',fontWeight:700,color:'rgba(255,255,255,0.5)',letterSpacing:'0.1em',textTransform:'uppercase' },
  nav: { flex:1,overflow:'auto',padding:'0 10px' },
  navBtn: { display:'flex',alignItems:'center',gap:10,width:'100%',padding:'11px 14px',borderRadius:10,background:'transparent',border:'none',color:'rgba(255,255,255,0.55)',fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:500,fontSize:'0.87rem',cursor:'pointer',transition:'all 0.2s',textAlign:'left',marginBottom:2 },
  navActive: { background:'rgba(11,124,111,0.35)',color:'#fff' },
  bottom: { padding:'16px',borderTop:'1px solid rgba(255,255,255,0.06)' },
  userRow: { display:'flex',alignItems:'center',gap:10,marginBottom:12 },
  userAv: { width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#0b7c6f,#13b09c)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.85rem',flexShrink:0 },
  userName: { color:'#fff',fontWeight:600,fontSize:'0.84rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' },
  userEmail: { color:'rgba(255,255,255,0.4)',fontSize:'0.72rem',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' },
  logoutBtn: { width:'100%',padding:'9px',borderRadius:8,background:'rgba(220,38,38,0.12)',border:'none',color:'#f87171',fontFamily:'Plus Jakarta Sans,sans-serif',fontWeight:600,fontSize:'0.82rem',cursor:'pointer',transition:'background 0.2s',textAlign:'center' },
};

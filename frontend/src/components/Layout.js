import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user?.id) api.get(`/notifications/user/${user.id}/unread`).then(r => setUnread(r.data));
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard',    icon: '▦',  label: 'Dashboard' },
    { to: '/assets',       icon: '🖥',  label: 'Assets' },
    { to: '/allocations',  icon: '📦', label: 'Allocations',  roles: ['ADMIN','MANAGER'] },
    { to: '/bookings',     icon: '📅', label: 'Bookings' },
    { to: '/maintenance',  icon: '🔧', label: 'Maintenance',  roles: ['ADMIN','MANAGER'] },
    { to: '/analytics',    icon: '📊', label: 'Analytics',    roles: ['ADMIN','MANAGER'] },
    { to: '/reports',      icon: '📈', label: 'Reports',      roles: ['ADMIN','MANAGER'] },
    { to: '/notifications',icon: '🔔', label: 'Alerts',       badge: unread > 0 ? unread : null },
    { to: '/audit',        icon: '📋', label: 'Audit Log',    roles: ['ADMIN','MANAGER'] },
    { to: '/users',        icon: '👥', label: 'Users',        roles: ['ADMIN'] },
    { to: '/chatbot',      icon: '🤖', label: 'AI Assistant' },
    { to: '/profile',      icon: '👤', label: 'Profile' },
  ];

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';

  return (
    <div style={s.layout}>
      <aside style={s.sidebar}>
        {/* Logo */}
        <div style={s.logoWrap}>
          <div style={s.logoIcon}>AF</div>
          <div>
            <div style={s.logoText}>AssetFlow</div>
            <div style={s.logoSub}>Enterprise</div>
          </div>
          {/* Dark mode toggle */}
          <button style={s.themeBtn} onClick={toggle} title={dark ? 'Light mode' : 'Dark mode'}>
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Nav */}
        <nav style={s.nav}>
          {navItems.filter(item => !item.roles || item.roles.includes(user?.role)).map(item => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({ ...s.link, ...(isActive ? s.linkActive : {}) })}>
              <span style={s.linkIcon}>{item.icon}</span>
              <span style={s.linkLabel}>{item.label}</span>
              {item.badge && <span style={s.badge}>{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div style={s.footer}>
          <div style={s.avatar}>{initials}</div>
          <div style={s.userInfo}>
            <div style={s.userName}>{user?.name}</div>
            <div style={s.userRole}>{user?.role}</div>
          </div>
          <button style={s.logoutBtn} onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      <main style={s.main}>{children}</main>
    </div>
  );
}

const s = {
  layout: { display:'flex', minHeight:'100vh' },
  sidebar: {
    width:'240px', background:'linear-gradient(180deg,#1e1b4b 0%,#312e81 60%,#1e1b4b 100%)',
    color:'#fff', display:'flex', flexDirection:'column', padding:'1.25rem 0.75rem',
    position:'fixed', height:'100vh', overflowY:'auto', zIndex:100,
    boxShadow:'4px 0 24px rgba(0,0,0,0.18)'
  },
  logoWrap: { display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.5rem 0.75rem', marginBottom:'1.5rem' },
  logoIcon: {
    width:'36px', height:'36px', borderRadius:'10px', flexShrink:0,
    background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff',
    display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:'0.8rem'
  },
  logoText: { fontWeight:700, fontSize:'1rem', color:'#fff', lineHeight:1.2 },
  logoSub: { fontSize:'0.6rem', color:'#a5b4fc', textTransform:'uppercase', letterSpacing:'0.08em' },
  themeBtn: {
    marginLeft:'auto', background:'rgba(255,255,255,0.1)', border:'none',
    borderRadius:'6px', cursor:'pointer', padding:'0.3rem 0.4rem', fontSize:'0.9rem', flexShrink:0
  },
  nav: { flex:1, display:'flex', flexDirection:'column', gap:'2px' },
  link: {
    display:'flex', alignItems:'center', gap:'0.65rem', padding:'0.58rem 0.75rem',
    color:'#c7d2fe', textDecoration:'none', borderRadius:'8px', fontSize:'0.85rem',
    fontWeight:500, transition:'all 0.18s'
  },
  linkActive: { background:'rgba(99,102,241,0.3)', color:'#fff', boxShadow:'inset 3px 0 0 #818cf8' },
  linkIcon: { fontSize:'0.95rem', width:'20px', textAlign:'center', flexShrink:0 },
  linkLabel: { flex:1 },
  badge: {
    background:'#ef4444', color:'#fff', fontSize:'0.62rem', fontWeight:700,
    padding:'1px 6px', borderRadius:'10px', minWidth:'18px', textAlign:'center'
  },
  footer: {
    display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.75rem',
    borderTop:'1px solid rgba(255,255,255,0.1)', marginTop:'0.5rem'
  },
  avatar: {
    width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
    background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff',
    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.72rem', fontWeight:700
  },
  userInfo: { flex:1, minWidth:0 },
  userName: { fontSize:'0.78rem', fontWeight:600, color:'#e0e7ff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' },
  userRole: { fontSize:'0.62rem', color:'#a5b4fc', textTransform:'uppercase', letterSpacing:'0.05em' },
  logoutBtn: {
    background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.3)',
    color:'#fca5a5', borderRadius:'6px', cursor:'pointer', padding:'0.3rem 0.45rem', fontSize:'0.9rem', flexShrink:0
  },
  main: { flex:1, padding:'2rem', minHeight:'100vh', background:'var(--bg)', color:'var(--text)', transition:'background 0.25s' }
};

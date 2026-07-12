import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user?.id) api.get(`/notifications/user/${user.id}/unread`).then(r => setUnread(r.data));
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/dashboard', label: '📊 Dashboard' },
    { to: '/assets', label: '🖥️ Assets' },
    { to: '/allocations', label: '📦 Allocations', roles: ['ADMIN','MANAGER'] },
    { to: '/bookings', label: '📅 Bookings' },
    { to: '/maintenance', label: '🔧 Maintenance', roles: ['ADMIN','MANAGER'] },
    { to: '/reports', label: '📈 Reports', roles: ['ADMIN','MANAGER'] },
    { to: '/notifications', label: `🔔 Alerts${unread > 0 ? ` (${unread})` : ''}` },
    { to: '/audit', label: '📋 Audit Log', roles: ['ADMIN','MANAGER'] },
    { to: '/users', label: '👥 Users', roles: ['ADMIN'] },
    { to: '/profile', label: '👤 Profile' },
  ];

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.logo}>AssetFlow</div>
        <nav>
          {navItems.filter(item => !item.roles || item.roles.includes(user?.role)).map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({ ...styles.navLink, ...(isActive ? styles.active : {}) })}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.userInfo}>
          <p style={styles.userName}>{user?.name}</p>
          <p style={styles.userRole}>{user?.role}</p>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main style={styles.main}>{children}</main>
    </div>
  );
}

const styles = {
  layout:{display:'flex',minHeight:'100vh'},
  sidebar:{width:'220px',background:'#1a1a2e',color:'#fff',display:'flex',flexDirection:'column',padding:'1rem',position:'fixed',height:'100vh'},
  logo:{fontSize:'1.25rem',fontWeight:'bold',color:'#1a73e8',marginBottom:'2rem',padding:'0.5rem 0'},
  navLink:{display:'block',padding:'0.6rem 0.75rem',color:'#ccc',textDecoration:'none',borderRadius:'4px',marginBottom:'0.25rem',fontSize:'0.9rem'},
  active:{background:'#1a73e8',color:'#fff'},
  userInfo:{marginTop:'auto',borderTop:'1px solid #333',paddingTop:'1rem'},
  userName:{margin:'0 0 0.25rem',fontWeight:600,fontSize:'0.9rem'},
  userRole:{margin:'0 0 0.75rem',color:'#aaa',fontSize:'0.8rem'},
  logoutBtn:{width:'100%',padding:'0.5rem',background:'#ea4335',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}
};

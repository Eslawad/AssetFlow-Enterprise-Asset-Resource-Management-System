import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const load = () => api.get(`/notifications/user/${user.id}`).then(r => setNotifications(r.data));
  useEffect(() => { load(); }, []);

  const markAllRead = async () => { await api.patch(`/notifications/user/${user.id}/read-all`); load(); };

  const typeColor = { ALLOCATION:'#1a73e8', BOOKING:'#34a853', BOOKING_EXPIRY:'#fbbc04', MAINTENANCE_DUE:'#ea4335' };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Notifications</h2>
        <button style={styles.btn} onClick={markAllRead}>Mark All Read</button>
      </div>
      {notifications.length === 0 && <p style={{color:'#666'}}>No notifications</p>}
      {notifications.map(n => (
        <div key={n.id} style={{...styles.card, opacity: n.read ? 0.6 : 1, borderLeft: `4px solid ${typeColor[n.type] || '#999'}`}}>
          <p style={styles.msg}>{n.message}</p>
          <div style={styles.meta}>
            <span style={{...styles.badge, background: typeColor[n.type] || '#999'}}>{n.type}</span>
            <span style={styles.time}>{new Date(n.createdAt).toLocaleString()}</span>
            {!n.read && <span style={styles.unread}>● Unread</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  page:{padding:'1.5rem'},
  header:{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'},
  card:{background:'#fff',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',marginBottom:'0.75rem'},
  msg:{margin:'0 0 0.5rem',fontWeight:500},
  meta:{display:'flex',gap:'0.75rem',alignItems:'center'},
  badge:{padding:'0.2rem 0.5rem',borderRadius:'12px',color:'#fff',fontSize:'0.7rem'},
  time:{color:'#999',fontSize:'0.8rem'},
  unread:{color:'#1a73e8',fontSize:'0.8rem',fontWeight:600},
  btn:{padding:'0.5rem 1rem',background:'#1a73e8',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'}
};

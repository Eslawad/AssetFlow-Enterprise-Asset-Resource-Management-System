import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const typeStyle = {
  ALLOCATION:       { bg:'#dbeafe', color:'#1d4ed8', border:'#3b82f6' },
  BOOKING:          { bg:'#dcfce7', color:'#15803d', border:'#22c55e' },
  BOOKING_EXPIRY:   { bg:'#fef9c3', color:'#a16207', border:'#eab308' },
  MAINTENANCE_DUE:  { bg:'#fee2e2', color:'#b91c1c', border:'#ef4444' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const load = () => api.get(`/notifications/user/${user.id}`).then(r => setNotifications(r.data));
  useEffect(() => { load(); }, []);

  const markAllRead = async () => { await api.patch(`/notifications/user/${user.id}/read-all`); load(); };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>Notifications</h2>
          <p style={s.sub}>{unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button style={s.btnPrimary} onClick={markAllRead}>✓ Mark All Read</button>
        )}
      </div>

      {notifications.length === 0 && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🔔</div>
          <p style={s.emptyText}>No notifications yet</p>
        </div>
      )}

      <div style={s.list}>
        {notifications.map(n => {
          const ts = typeStyle[n.type] || { bg:'#f1f5f9', color:'#475569', border:'#94a3b8' };
          return (
            <div key={n.id} style={{...s.card, borderLeft:`4px solid ${ts.border}`, opacity: n.read ? 0.65 : 1}}>
              <div style={s.cardTop}>
                <span style={{...s.typeBadge, background: ts.bg, color: ts.color}}>{n.type?.replace('_',' ')}</span>
                {!n.read && <span style={s.unreadDot}>● Unread</span>}
                <span style={s.time}>{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <p style={s.msg}>{n.message}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  page: { padding:'2rem' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' },
  sub: { color:'#64748b', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  list: { display:'flex', flexDirection:'column', gap:'0.75rem' },
  card: {
    background:'#fff', padding:'1rem 1.25rem', borderRadius:'12px',
    boxShadow:'0 1px 6px rgba(0,0,0,0.06)', transition:'box-shadow 0.2s'
  },
  cardTop: { display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem', flexWrap:'wrap' },
  typeBadge: { padding:'0.25rem 0.65rem', borderRadius:'20px', fontSize:'0.72rem', fontWeight:600 },
  unreadDot: { color:'#6366f1', fontSize:'0.75rem', fontWeight:700 },
  time: { color:'#94a3b8', fontSize:'0.78rem', marginLeft:'auto' },
  msg: { color:'#374151', fontSize:'0.875rem', margin:0, lineHeight:1.5 },
  btnPrimary: { padding:'0.6rem 1.25rem', background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'0.875rem', fontWeight:600 },
  empty: { textAlign:'center', padding:'4rem 2rem', color:'#94a3b8' },
  emptyIcon: { fontSize:'3rem', marginBottom:'1rem' },
  emptyText: { fontSize:'1rem', margin:0 },
};

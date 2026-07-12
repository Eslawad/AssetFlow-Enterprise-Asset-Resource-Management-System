import { useEffect, useState } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const roleStyle = {
  ADMIN:   { bg:'#fee2e2', color:'#b91c1c' },
  MANAGER: { bg:'#dbeafe', color:'#1d4ed8' },
  VIEWER:  { bg:'#dcfce7', color:'#15803d' },
};

export default function Users() {
  const [users, setUsers] = useState([]);

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const updateRole = async (id, role) => {
    await api.patch(`/users/${id}/role`, { role });
    toast.success('Role updated');
    load();
  };

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>User Management</h2>
          <p style={s.sub}>Manage team members and their access roles</p>
        </div>
        <div style={s.countBadge}>{users.length} users</div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{['User','Email','Current Role','Change Role'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan={4} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:'2rem'}}>No users found</td></tr>}
            {users.map(u => (
              <tr key={u.id}>
                <td style={s.td}>
                  <div style={s.userCell}>
                    <div style={s.avatar}>{u.name?.charAt(0).toUpperCase()}</div>
                    <span style={{fontWeight:600, color:'#1e293b'}}>{u.name}</span>
                  </div>
                </td>
                <td style={{...s.td, color:'#64748b'}}>{u.email}</td>
                <td style={s.td}>
                  <span style={{...s.badge, background: roleStyle[u.role]?.bg, color: roleStyle[u.role]?.color}}>
                    {u.role}
                  </span>
                </td>
                <td style={s.td}>
                  <select style={s.select} value={u.role} onChange={e => updateRole(u.id, e.target.value)}>
                    {['ADMIN','MANAGER','VIEWER'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  page: { padding:'2rem' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  sub: { color:'#64748b', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  countBadge: { background:'#f1f5f9', color:'#475569', padding:'0.4rem 0.9rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:600 },
  tableWrap: { background:'var(--surface)', borderRadius:'14px', boxShadow:'var(--shadow)', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'0.85rem 1rem', background:'var(--surface2)', textAlign:'left', borderBottom:'2px solid var(--border)', fontSize:'0.75rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em' },
  td: { padding:'0.85rem 1rem', borderBottom:'1px solid var(--border2)', fontSize:'0.875rem', color:'var(--text2)' },
  userCell: { display:'flex', alignItems:'center', gap:'0.75rem' },
  avatar: { width:'32px', height:'32px', borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, flexShrink:0 },
  badge: { padding:'0.3rem 0.7rem', borderRadius:'20px', fontSize:'0.72rem', fontWeight:600 },
  select: { padding:'0.5rem 0.75rem', border:'1.5px solid var(--border)', borderRadius:'7px', fontSize:'0.8rem', background:'var(--input-bg)', color:'var(--text)', cursor:'pointer' },
};

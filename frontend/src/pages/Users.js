import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Users() {
  const [users, setUsers] = useState([]);

  const load = () => api.get('/users').then(r => setUsers(r.data));
  useEffect(() => { load(); }, []);

  const updateRole = async (id, role) => { await api.patch(`/users/${id}/role`, { role }); load(); };

  return (
    <div style={styles.page}>
      <h2>User Management</h2>
      <table style={styles.table}>
        <thead><tr>{['Name','Email','Role','Change Role'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={styles.td}>{u.name}</td>
              <td style={styles.td}>{u.email}</td>
              <td style={styles.td}><span style={{...styles.badge, background: u.role==='ADMIN'?'#ea4335':u.role==='MANAGER'?'#1a73e8':'#34a853'}}>{u.role}</span></td>
              <td style={styles.td}>
                <select style={styles.select} value={u.role} onChange={e => updateRole(u.id, e.target.value)}>
                  {['ADMIN','MANAGER','VIEWER'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  page:{padding:'1.5rem'},
  table:{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:'8px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'},
  th:{padding:'0.75rem 1rem',background:'#f8f9fa',textAlign:'left',borderBottom:'1px solid #eee'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #eee'},
  badge:{padding:'0.25rem 0.6rem',borderRadius:'12px',color:'#fff',fontSize:'0.75rem'},
  select:{padding:'0.4rem',border:'1px solid #ddd',borderRadius:'4px'}
};

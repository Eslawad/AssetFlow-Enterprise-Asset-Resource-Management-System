import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ assetId: '', userId: '' });
  const [error, setError] = useState('');

  const load = () => api.get('/allocations').then(r => setAllocations(r.data));
  useEffect(() => {
    load();
    api.get('/assets', { params: { size: 100 } }).then(r => setAssets(r.data.content.filter(a => a.status === 'AVAILABLE')));
    api.get('/users').then(r => setUsers(r.data));
  }, []);

  const submit = async e => {
    e.preventDefault(); setError('');
    try { await api.post('/allocations', { assetId: Number(form.assetId), userId: Number(form.userId) }); setForm({ assetId:'', userId:'' }); toast.success('Asset allocated'); load(); }
    catch(err) { toast.error(err.response?.data?.message || 'Allocation failed'); }
  };

  const returnAsset = async id => { await api.patch(`/allocations/${id}/return`); toast.success('Asset returned'); load(); };

  return (
    <div style={styles.page}>
      <h2>Asset Allocations</h2>
      <form onSubmit={submit} style={styles.form}>
        <h4>Allocate Asset</h4>
        <select style={styles.input} value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} required>
          <option value="">Select Asset</option>
          {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
        </select>
        <select style={styles.input} value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} required>
          <option value="">Select User</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
        </select>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} type="submit">Allocate</button>
      </form>
      <table style={styles.table}>
        <thead><tr>{['Asset','User','Allocated Date','Returned Date','Status','Action'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
        <tbody>
          {allocations.map(a => (
            <tr key={a.id}>
              <td style={styles.td}>{a.asset?.name}</td>
              <td style={styles.td}>{a.user?.name}</td>
              <td style={styles.td}>{a.allocatedDate}</td>
              <td style={styles.td}>{a.returnedDate || '-'}</td>
              <td style={styles.td}><span style={{...styles.badge, background: a.status === 'ACTIVE' ? '#fbbc04' : '#34a853'}}>{a.status}</span></td>
              <td style={styles.td}>{a.status === 'ACTIVE' && <button style={styles.btnSm} onClick={() => returnAsset(a.id)}>Return</button>}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  page:{padding:'1.5rem'}, form:{background:'#fff',padding:'1.25rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',marginBottom:'1.5rem',maxWidth:'500px'},
  input:{display:'block',width:'100%',padding:'0.6rem',marginBottom:'0.75rem',border:'1px solid #ddd',borderRadius:'4px',boxSizing:'border-box'},
  btn:{padding:'0.6rem 1.25rem',background:'#1a73e8',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'},
  btnSm:{padding:'0.3rem 0.75rem',background:'#34a853',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'},
  table:{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:'8px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'},
  th:{padding:'0.75rem 1rem',background:'#f8f9fa',textAlign:'left',borderBottom:'1px solid #eee'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #eee'},
  badge:{padding:'0.25rem 0.6rem',borderRadius:'12px',color:'#fff',fontSize:'0.75rem'},
  error:{color:'red',fontSize:'0.875rem',marginBottom:'0.5rem'}
};

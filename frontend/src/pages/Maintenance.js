import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ assetId:'', description:'', scheduledDate:'' });
  const [error, setError] = useState('');

  const load = () => api.get('/maintenance').then(r => setRecords(r.data));
  useEffect(() => { load(); api.get('/assets', { params: { size: 100 } }).then(r => setAssets(r.data.content)); }, []);

  const submit = async e => {
    e.preventDefault(); setError('');
    try {
      await api.post('/maintenance', { asset: { id: Number(form.assetId) }, description: form.description, scheduledDate: form.scheduledDate });
      toast.success('Maintenance scheduled');
      setForm({ assetId:'', description:'', scheduledDate:'' }); load();
    } catch(err) { toast.error(err.response?.data?.message || 'Error scheduling maintenance'); }
  };

  const complete = async id => {
    const cost = prompt('Enter maintenance cost:');
    if (cost !== null) { await api.patch(`/maintenance/${id}/complete`, { cost: Number(cost) }); toast.success('Maintenance completed'); load(); }
  };

  const statusColor = { SCHEDULED:'#fbbc04', IN_PROGRESS:'#1a73e8', COMPLETED:'#34a853' };

  return (
    <div style={styles.page}>
      <h2>Maintenance</h2>
      <form onSubmit={submit} style={styles.form}>
        <h4>Schedule Maintenance</h4>
        <select style={styles.input} value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} required>
          <option value="">Select Asset</option>
          {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input style={styles.input} placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
        <input style={styles.input} type="date" value={form.scheduledDate} onChange={e => setForm({...form, scheduledDate: e.target.value})} required />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} type="submit">Schedule</button>
      </form>
      <table style={styles.table}>
        <thead><tr>{['Asset','Description','Scheduled','Completed','Cost','Status','Action'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
        <tbody>
          {records.map(m => (
            <tr key={m.id}>
              <td style={styles.td}>{m.asset?.name}</td>
              <td style={styles.td}>{m.description}</td>
              <td style={styles.td}>{m.scheduledDate}</td>
              <td style={styles.td}>{m.completedDate || '-'}</td>
              <td style={styles.td}>{m.cost ? `$${m.cost}` : '-'}</td>
              <td style={styles.td}><span style={{...styles.badge, background: statusColor[m.status]}}>{m.status}</span></td>
              <td style={styles.td}>{m.status !== 'COMPLETED' && <button style={styles.btnSm} onClick={() => complete(m.id)}>Complete</button>}</td>
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

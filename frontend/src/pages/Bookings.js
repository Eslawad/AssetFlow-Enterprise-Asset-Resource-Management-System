import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ assetId:'', startDate:'', endDate:'' });
  const [error, setError] = useState('');
  const { user } = useAuth();

  const load = () => api.get('/bookings').then(r => setBookings(r.data));
  useEffect(() => { load(); api.get('/assets', { params: { size: 100 } }).then(r => setAssets(r.data.content)); }, []);

  const submit = async e => {
    e.preventDefault(); setError('');
    try {
      await api.post('/bookings', { assetId: form.assetId, userId: user.id, startDate: form.startDate, endDate: form.endDate });
      toast.success('Booking confirmed');
      setForm({ assetId:'', startDate:'', endDate:'' }); load();
    } catch(err) { toast.error(err.response?.data?.message || 'Booking failed'); }
  };

  const cancel = async id => { await api.patch(`/bookings/${id}/cancel`); toast.success('Booking cancelled'); load(); };

  return (
    <div style={styles.page}>
      <h2>Resource Bookings</h2>
      <form onSubmit={submit} style={styles.form}>
        <h4>New Booking</h4>
        <select style={styles.input} value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} required>
          <option value="">Select Asset</option>
          {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <input style={styles.input} type="date" placeholder="Start Date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
        <input style={styles.input} type="date" placeholder="End Date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} type="submit">Book</button>
      </form>
      <table style={styles.table}>
        <thead><tr>{['Asset','User','Start','End','Status','Action'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td style={styles.td}>{b.asset?.name}</td>
              <td style={styles.td}>{b.user?.name}</td>
              <td style={styles.td}>{b.startDate}</td>
              <td style={styles.td}>{b.endDate}</td>
              <td style={styles.td}><span style={{...styles.badge, background: b.status==='ACTIVE'?'#1a73e8':b.status==='CANCELLED'?'#ea4335':'#34a853'}}>{b.status}</span></td>
              <td style={styles.td}>{b.status === 'ACTIVE' && <button style={styles.btnSm} onClick={() => cancel(b.id)}>Cancel</button>}</td>
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
  btnSm:{padding:'0.3rem 0.75rem',background:'#ea4335',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'},
  table:{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:'8px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'},
  th:{padding:'0.75rem 1rem',background:'#f8f9fa',textAlign:'left',borderBottom:'1px solid #eee'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #eee'},
  badge:{padding:'0.25rem 0.6rem',borderRadius:'12px',color:'#fff',fontSize:'0.75rem'},
  error:{color:'red',fontSize:'0.875rem',marginBottom:'0.5rem'}
};

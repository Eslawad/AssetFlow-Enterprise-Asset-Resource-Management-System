import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const statusStyle = {
  ACTIVE:     { bg:'#dbeafe', color:'#1d4ed8' },
  CANCELLED:  { bg:'#fee2e2', color:'#b91c1c' },
  COMPLETED:  { bg:'#dcfce7', color:'#15803d' },
};

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ assetId:'', startDate:'', endDate:'' });
  const { user } = useAuth();

  const load = () => api.get('/bookings').then(r => setBookings(r.data));
  useEffect(() => { load(); api.get('/assets', { params:{ size:100 } }).then(r => setAssets(r.data.content)); }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/bookings', { assetId: form.assetId, userId: user.id, startDate: form.startDate, endDate: form.endDate });
      toast.success('Booking confirmed'); setForm({ assetId:'', startDate:'', endDate:'' }); load();
    } catch(err) { toast.error(err.response?.data?.message || 'Booking failed'); }
  };

  const cancel = async id => { await api.patch(`/bookings/${id}/cancel`); toast.success('Booking cancelled'); load(); };

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>Resource Bookings</h2>
          <p style={s.sub}>Reserve assets for specific time periods</p>
        </div>
      </div>

      <div style={s.formCard}>
        <h4>New Booking</h4>
        <form onSubmit={submit}>
          <div style={s.formRow}>
            <div style={{flex:2}}>
              <label style={s.label}>Asset</label>
              <select style={s.input} value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} required>
                <option value="">Select asset…</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={{flex:1}}>
              <label style={s.label}>Start Date</label>
              <input style={s.input} type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
            </div>
            <div style={{flex:1}}>
              <label style={s.label}>End Date</label>
              <input style={s.input} type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
            </div>
            <div style={{alignSelf:'flex-end'}}>
              <button style={s.btnPrimary} type="submit">Book</button>
            </div>
          </div>
        </form>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{['Asset','User','Start Date','End Date','Status','Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {bookings.length === 0 && <tr><td colSpan={6} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:'2rem'}}>No bookings yet</td></tr>}
            {bookings.map(b => (
              <tr key={b.id}>
                <td style={{...s.td, fontWeight:600}}>{b.asset?.name}</td>
                <td style={s.td}>{b.user?.name}</td>
                <td style={s.td}>{b.startDate}</td>
                <td style={s.td}>{b.endDate}</td>
                <td style={s.td}>
                  <span style={{...s.badge, background: statusStyle[b.status]?.bg, color: statusStyle[b.status]?.color}}>
                    {b.status}
                  </span>
                </td>
                <td style={s.td}>
                  {b.status === 'ACTIVE' && <button style={{...s.btnSm, background:'#ef4444'}} onClick={() => cancel(b.id)}>Cancel</button>}
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
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' },
  sub: { color:'#64748b', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  formCard: { background:'var(--surface)', padding:'1.5rem', borderRadius:'14px', boxShadow:'var(--shadow)', marginBottom:'1.5rem' },
  formRow: { display:'flex', gap:'1rem', flexWrap:'wrap', alignItems:'flex-start' },
  label: { display:'block', fontSize:'0.75rem', fontWeight:600, color:'var(--text2)', marginBottom:'0.35rem', textTransform:'uppercase', letterSpacing:'0.04em' },
  input: { width:'100%', padding:'0.65rem 0.9rem', border:'1.5px solid var(--border)', borderRadius:'8px', boxSizing:'border-box', fontSize:'0.875rem', background:'var(--input-bg)', color:'var(--text)' },
  tableWrap: { background:'var(--surface)', borderRadius:'14px', boxShadow:'var(--shadow)', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'0.85rem 1rem', background:'var(--surface2)', textAlign:'left', borderBottom:'2px solid var(--border)', fontSize:'0.75rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em' },
  td: { padding:'0.85rem 1rem', borderBottom:'1px solid var(--border2)', fontSize:'0.875rem', color:'var(--text2)' },
  badge: { padding:'0.3rem 0.7rem', borderRadius:'20px', fontSize:'0.72rem', fontWeight:600 },
  btnPrimary: { padding:'0.65rem 1.25rem', background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, whiteSpace:'nowrap' },
  btnSm: { padding:'0.35rem 0.75rem', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem', fontWeight:500 },
};

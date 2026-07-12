import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Allocations() {
  const [allocations, setAllocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ assetId:'', userId:'' });

  const load = () => api.get('/allocations').then(r => setAllocations(r.data));
  useEffect(() => {
    load();
    api.get('/assets', { params:{ size:100 } }).then(r => setAssets(r.data.content.filter(a => a.status === 'AVAILABLE')));
    api.get('/users').then(r => setUsers(r.data));
  }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/allocations', { assetId: Number(form.assetId), userId: Number(form.userId) });
      setForm({ assetId:'', userId:'' }); toast.success('Asset allocated'); load();
    } catch(err) { toast.error(err.response?.data?.message || 'Allocation failed'); }
  };

  const returnAsset = async id => { await api.patch(`/allocations/${id}/return`); toast.success('Asset returned'); load(); };

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>Asset Allocations</h2>
          <p style={s.sub}>Assign assets to team members</p>
        </div>
      </div>

      <div style={s.formCard}>
        <h4>Allocate Asset</h4>
        <form onSubmit={submit}>
          <div style={s.formRow}>
            <div style={{flex:1}}>
              <label style={s.label}>Asset</label>
              <select style={s.input} value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} required>
                <option value="">Select available asset…</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.serialNumber})</option>)}
              </select>
            </div>
            <div style={{flex:1}}>
              <label style={s.label}>User</label>
              <select style={s.input} value={form.userId} onChange={e => setForm({...form, userId: e.target.value})} required>
                <option value="">Select user…</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <div style={{alignSelf:'flex-end'}}>
              <button style={s.btnPrimary} type="submit">Allocate</button>
            </div>
          </div>
        </form>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{['Asset','User','Allocated Date','Returned Date','Status','Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {allocations.length === 0 && <tr><td colSpan={6} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:'2rem'}}>No allocations yet</td></tr>}
            {allocations.map(a => (
              <tr key={a.id}>
                <td style={{...s.td, fontWeight:600}}>{a.asset?.name}</td>
                <td style={s.td}>{a.user?.name}</td>
                <td style={s.td}>{a.allocatedDate}</td>
                <td style={s.td}>{a.returnedDate || '—'}</td>
                <td style={s.td}>
                  <span style={{...s.badge, ...(a.status==='ACTIVE' ? {background:'#fef9c3',color:'#a16207'} : {background:'#dcfce7',color:'#15803d'})}}>
                    {a.status}
                  </span>
                </td>
                <td style={s.td}>
                  {a.status === 'ACTIVE' && <button style={{...s.btnSm, background:'#10b981'}} onClick={() => returnAsset(a.id)}>Return</button>}
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

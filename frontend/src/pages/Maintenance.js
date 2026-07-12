import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const statusStyle = {
  SCHEDULED:   { bg:'#fef9c3', color:'#a16207' },
  IN_PROGRESS: { bg:'#dbeafe', color:'#1d4ed8' },
  COMPLETED:   { bg:'#dcfce7', color:'#15803d' },
};

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [form, setForm] = useState({ assetId:'', description:'', scheduledDate:'' });

  const load = () => api.get('/maintenance').then(r => setRecords(r.data));
  useEffect(() => { load(); api.get('/assets', { params:{ size:100 } }).then(r => setAssets(r.data.content)); }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/maintenance', { asset:{ id: Number(form.assetId) }, description: form.description, scheduledDate: form.scheduledDate });
      toast.success('Maintenance scheduled'); setForm({ assetId:'', description:'', scheduledDate:'' }); load();
    } catch(err) { toast.error(err.response?.data?.message || 'Error scheduling maintenance'); }
  };

  const complete = async id => {
    const cost = prompt('Enter maintenance cost ($):');
    if (cost !== null) { await api.patch(`/maintenance/${id}/complete`, { cost: Number(cost) }); toast.success('Marked as completed'); load(); }
  };

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>Maintenance</h2>
          <p style={s.sub}>Schedule and track asset maintenance</p>
        </div>
      </div>

      <div style={s.formCard}>
        <h4>Schedule Maintenance</h4>
        <form onSubmit={submit}>
          <div style={s.formRow}>
            <div style={{flex:1}}>
              <label style={s.label}>Asset</label>
              <select style={s.input} value={form.assetId} onChange={e => setForm({...form, assetId: e.target.value})} required>
                <option value="">Select asset…</option>
                {assets.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div style={{flex:2}}>
              <label style={s.label}>Description</label>
              <input style={s.input} placeholder="Describe the maintenance work…" value={form.description}
                onChange={e => setForm({...form, description: e.target.value})} required />
            </div>
            <div style={{flex:1}}>
              <label style={s.label}>Scheduled Date</label>
              <input style={s.input} type="date" value={form.scheduledDate}
                onChange={e => setForm({...form, scheduledDate: e.target.value})} required />
            </div>
            <div style={{alignSelf:'flex-end'}}>
              <button style={s.btnPrimary} type="submit">Schedule</button>
            </div>
          </div>
        </form>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{['Asset','Description','Scheduled','Completed','Cost','Status','Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {records.length === 0 && <tr><td colSpan={7} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:'2rem'}}>No maintenance records</td></tr>}
            {records.map(m => (
              <tr key={m.id}>
                <td style={{...s.td, fontWeight:600}}>{m.asset?.name}</td>
                <td style={s.td}>{m.description}</td>
                <td style={s.td}>{m.scheduledDate}</td>
                <td style={s.td}>{m.completedDate || '—'}</td>
                <td style={s.td}>{m.cost ? `$${m.cost}` : '—'}</td>
                <td style={s.td}>
                  <span style={{...s.badge, background: statusStyle[m.status]?.bg, color: statusStyle[m.status]?.color}}>
                    {m.status?.replace('_',' ')}
                  </span>
                </td>
                <td style={s.td}>
                  {m.status !== 'COMPLETED' && <button style={{...s.btnSm, background:'#10b981'}} onClick={() => complete(m.id)}>Complete</button>}
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

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const empty = { name:'', category:'', serialNumber:'', location:'', purchaseDate:'', purchasePrice:'', vendor:'', warrantyExpiry:'' };
const STATUSES = ['AVAILABLE','ALLOCATED','UNDER_MAINTENANCE','RETIRED'];
const statusStyle = {
  AVAILABLE:    { bg:'#dcfce7', color:'#15803d' },
  ALLOCATED:    { bg:'#fef9c3', color:'#a16207' },
  UNDER_MAINTENANCE: { bg:'#fee2e2', color:'#b91c1c' },
  RETIRED:      { bg:'#f1f5f9', color:'#64748b' },
};

export default function Assets() {
  const [data, setData] = useState({ content:[], totalPages:0 });
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ name:'', category:'', status:'' });
  const [page, setPage] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const canEdit = user?.role !== 'VIEWER';

  const load = () => api.get('/assets', { params: { ...filters, page, size:10 } }).then(r => setData(r.data));
  useEffect(() => { load(); }, [filters, page]);

  const submit = async e => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/assets/${editing}`, form); toast.success('Asset updated'); setEditing(null); }
      else { await api.post('/assets', form); toast.success('Asset registered'); }
      setForm(empty); load();
    } catch(err) { toast.error(err.response?.data?.message || 'Error saving asset'); }
  };

  const del = async id => {
    if (!window.confirm('Delete this asset?')) return;
    try { await api.delete(`/assets/${id}`); toast.success('Asset deleted'); load(); }
    catch(err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>Assets</h2>
          <p style={s.sub}>Manage and track all organizational assets</p>
        </div>
        {canEdit && !editing && (
          <button style={s.btnPrimary} onClick={() => document.getElementById('assetForm').scrollIntoView({behavior:'smooth'})}>
            + Register Asset
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div style={s.filterBar}>
        <input style={s.filterInput} placeholder="🔍  Search by name…" value={filters.name}
          onChange={e => { setFilters({...filters, name: e.target.value}); setPage(0); }} />
        <input style={s.filterInput} placeholder="Category…" value={filters.category}
          onChange={e => { setFilters({...filters, category: e.target.value}); setPage(0); }} />
        <select style={s.filterInput} value={filters.status}
          onChange={e => { setFilters({...filters, status: e.target.value}); setPage(0); }}>
          <option value="">All Statuses</option>
          {STATUSES.map(st => <option key={st} value={st}>{st.replace('_',' ')}</option>)}
        </select>
        <button style={s.btnGhost} onClick={() => { setFilters({ name:'', category:'', status:'' }); setPage(0); }}>Clear</button>
      </div>

      {/* Form */}
      {canEdit && (
        <div id="assetForm" style={s.formCard}>
          <h4 style={{marginBottom:'1.25rem'}}>{editing ? '✏️ Edit Asset' : '➕ Register New Asset'}</h4>
          <form onSubmit={submit}>
            <div style={s.formGrid}>
              {[['name','Asset Name'],['category','Category'],['serialNumber','Serial Number'],['location','Location'],['vendor','Vendor']].map(([f,ph]) => (
                <div key={f}>
                  <label style={s.label}>{ph}</label>
                  <input style={s.input} placeholder={ph} value={form[f]}
                    onChange={e => setForm({...form,[f]:e.target.value})} required />
                </div>
              ))}
              <div>
                <label style={s.label}>Purchase Date</label>
                <input style={s.input} type="date" value={form.purchaseDate}
                  onChange={e => setForm({...form, purchaseDate: e.target.value})} />
              </div>
              <div>
                <label style={s.label}>Purchase Price ($)</label>
                <input style={s.input} type="number" placeholder="0.00" value={form.purchasePrice}
                  onChange={e => setForm({...form, purchasePrice: e.target.value})} />
              </div>
              <div>
                <label style={s.label}>Warranty Expiry</label>
                <input style={s.input} type="date" value={form.warrantyExpiry}
                  onChange={e => setForm({...form, warrantyExpiry: e.target.value})} />
              </div>
              {editing && (
                <div>
                  <label style={s.label}>Status</label>
                  <select style={s.input} value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
                    {STATUSES.map(st => <option key={st} value={st}>{st.replace('_',' ')}</option>)}
                  </select>
                </div>
              )}
            </div>
            <div style={{display:'flex', gap:'0.75rem', marginTop:'0.5rem'}}>
              <button style={s.btnPrimary} type="submit">{editing ? 'Update Asset' : 'Register Asset'}</button>
              {editing && <button style={s.btnGhost} type="button" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{['Name','Category','Serial No.','Location','Status','Price','Actions'].map(h => (
              <th key={h} style={s.th}>{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {(data.content || []).length === 0 && (
              <tr><td colSpan={7} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:'2rem'}}>No assets found</td></tr>
            )}
            {(data.content || []).map(a => (
              <tr key={a.id} style={s.tr}>
                <td style={{...s.td, fontWeight:600, color:'#1e293b'}}>{a.name}</td>
                <td style={s.td}>{a.category}</td>
                <td style={{...s.td, fontFamily:'monospace', fontSize:'0.8rem', color:'#64748b'}}>{a.serialNumber}</td>
                <td style={s.td}>{a.location}</td>
                <td style={s.td}>
                  <span style={{...s.badge, background: statusStyle[a.status]?.bg, color: statusStyle[a.status]?.color}}>
                    {a.status?.replace('_',' ')}
                  </span>
                </td>
                <td style={{...s.td, fontWeight:500}}>${a.purchasePrice}</td>
                <td style={s.td}>
                  <div style={{display:'flex', gap:'0.4rem', flexWrap:'wrap'}}>
                    <button style={{...s.btnSm, background:'#6366f1'}} onClick={() => navigate(`/assets/${a.id}`)}>View</button>
                    {canEdit && <>
                      <button style={{...s.btnSm, background:'#f59e0b'}} onClick={() => {
                        setEditing(a.id);
                        setForm({name:a.name,category:a.category,serialNumber:a.serialNumber,location:a.location,purchaseDate:a.purchaseDate||'',purchasePrice:a.purchasePrice||'',status:a.status,vendor:a.vendor||'',warrantyExpiry:a.warrantyExpiry||''});
                      }}>Edit</button>
                      {user?.role === 'ADMIN' && <button style={{...s.btnSm, background:'#ef4444'}} onClick={() => del(a.id)}>Delete</button>}
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={s.pagination}>
        <button style={{...s.pageBtn, opacity: page===0 ? 0.4 : 1}} disabled={page===0} onClick={() => setPage(p => p-1)}>← Prev</button>
        <span style={s.pageInfo}>Page {page+1} of {data.totalPages || 1}</span>
        <button style={{...s.pageBtn, opacity: page+1>=data.totalPages ? 0.4 : 1}} disabled={page+1>=data.totalPages} onClick={() => setPage(p => p+1)}>Next →</button>
      </div>
    </div>
  );
}

const s = {
  page: { padding:'2rem' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' },
  sub: { color:'#64748b', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  filterBar: { display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap', background:'var(--surface)', padding:'1rem', borderRadius:'12px', boxShadow:'var(--shadow)' },
  filterInput: { padding:'0.6rem 0.9rem', border:'1.5px solid var(--border)', borderRadius:'8px', minWidth:'160px', fontSize:'0.875rem', background:'var(--input-bg)', color:'var(--text)' },
  formCard: { background:'var(--surface)', padding:'1.5rem', borderRadius:'14px', boxShadow:'var(--shadow)', marginBottom:'1.5rem' },
  formGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' },
  label: { display:'block', fontSize:'0.75rem', fontWeight:600, color:'var(--text2)', marginBottom:'0.35rem', textTransform:'uppercase', letterSpacing:'0.04em' },
  input: { width:'100%', padding:'0.65rem 0.9rem', border:'1.5px solid var(--border)', borderRadius:'8px', boxSizing:'border-box', fontSize:'0.875rem', background:'var(--input-bg)', color:'var(--text)' },
  tableWrap: { background:'var(--surface)', borderRadius:'14px', boxShadow:'var(--shadow)', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'0.85rem 1rem', background:'var(--surface2)', textAlign:'left', borderBottom:'2px solid var(--border)', fontSize:'0.75rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em' },
  tr: { transition:'background 0.15s' },
  td: { padding:'0.85rem 1rem', borderBottom:'1px solid var(--border2)', fontSize:'0.875rem', color:'var(--text2)' },
  badge: { padding:'0.3rem 0.7rem', borderRadius:'20px', fontSize:'0.72rem', fontWeight:600 },
  btnPrimary: { padding:'0.65rem 1.25rem', background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, boxShadow:'0 2px 8px rgba(99,102,241,0.3)' },
  btnGhost: { padding:'0.65rem 1.25rem', background:'#f1f5f9', color:'#475569', border:'1.5px solid #e2e8f0', borderRadius:'8px', cursor:'pointer', fontSize:'0.875rem', fontWeight:500 },
  btnSm: { padding:'0.35rem 0.75rem', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'0.78rem', fontWeight:500 },
  pagination: { display:'flex', alignItems:'center', justifyContent:'center', gap:'1rem', marginTop:'1.25rem' },
  pageBtn: { padding:'0.55rem 1.1rem', background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'0.875rem', fontWeight:500 },
  pageInfo: { color:'#64748b', fontSize:'0.875rem', fontWeight:500 }
};

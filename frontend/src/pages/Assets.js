import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const empty = { name:'', category:'', serialNumber:'', location:'', purchaseDate:'', purchasePrice:'' };
const STATUSES = ['AVAILABLE','ALLOCATED','UNDER_MAINTENANCE','RETIRED'];

export default function Assets() {
  const [data, setData] = useState({ content:[], totalPages:0 });
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState({ name:'', category:'', status:'' });
  const [page, setPage] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const canEdit = user?.role !== 'VIEWER';

  const load = () =>
    api.get('/assets', { params: { ...filters, page, size: 10 } }).then(r => setData(r.data));

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
    if (!window.confirm('Delete asset?')) return;
    try { await api.delete(`/assets/${id}`); toast.success('Asset deleted'); load(); }
    catch(err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const statusColor = { AVAILABLE:'#34a853', ALLOCATED:'#fbbc04', UNDER_MAINTENANCE:'#ea4335', RETIRED:'#999' };

  return (
    <div style={styles.page}>
      <h2>Assets</h2>

      {/* Search/Filter Bar */}
      <div style={styles.filterBar}>
        <input style={styles.filterInput} placeholder="Search by name..." value={filters.name}
          onChange={e => { setFilters({...filters, name: e.target.value}); setPage(0); }} />
        <input style={styles.filterInput} placeholder="Category..." value={filters.category}
          onChange={e => { setFilters({...filters, category: e.target.value}); setPage(0); }} />
        <select style={styles.filterInput} value={filters.status}
          onChange={e => { setFilters({...filters, status: e.target.value}); setPage(0); }}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button style={styles.btnSecondary} onClick={() => { setFilters({ name:'', category:'', status:'' }); setPage(0); }}>Clear</button>
      </div>

      {canEdit && (
        <form onSubmit={submit} style={styles.form}>
          <h4>{editing ? 'Edit Asset' : 'Register Asset'}</h4>
          {['name','category','serialNumber','location'].map(f => (
            <input key={f} style={styles.input} placeholder={f} value={form[f]}
              onChange={e => setForm({...form,[f]:e.target.value})} required />
          ))}
          <input style={styles.input} type="date" value={form.purchaseDate}
            onChange={e => setForm({...form, purchaseDate: e.target.value})} />
          <input style={styles.input} type="number" placeholder="Purchase Price" value={form.purchasePrice}
            onChange={e => setForm({...form, purchasePrice: e.target.value})} />
          {editing && (
            <select style={styles.input} value={form.status || ''} onChange={e => setForm({...form, status: e.target.value})}>
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
          <div style={{display:'flex', gap:'0.5rem'}}>
            <button style={styles.btn} type="submit">{editing ? 'Update' : 'Register'}</button>
            {editing && <button style={styles.btnSecondary} type="button" onClick={() => { setEditing(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>
      )}

      <table style={styles.table}>
        <thead><tr>{['Name','Category','Serial','Location','Status','Price','Actions'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
        <tbody>
          {(data.content || []).map(a => (
            <tr key={a.id}>
              <td style={styles.td}>{a.name}</td>
              <td style={styles.td}>{a.category}</td>
              <td style={styles.td}>{a.serialNumber}</td>
              <td style={styles.td}>{a.location}</td>
              <td style={styles.td}><span style={{...styles.badge, background: statusColor[a.status]}}>{a.status}</span></td>
              <td style={styles.td}>${a.purchasePrice}</td>
              <td style={styles.td}>
                <button style={{...styles.btnSm, background:'#34a853'}} onClick={() => navigate(`/assets/${a.id}`)}>View</button>
                {canEdit && <>
                  <button style={styles.btnSm} onClick={() => { setEditing(a.id); setForm({name:a.name,category:a.category,serialNumber:a.serialNumber,location:a.location,purchaseDate:a.purchaseDate||'',purchasePrice:a.purchasePrice||'',status:a.status}); }}>Edit</button>
                  {user?.role === 'ADMIN' && <button style={{...styles.btnSm, background:'#ea4335'}} onClick={() => del(a.id)}>Delete</button>}
                </>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={styles.pagination}>
        <button style={styles.pageBtn} disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Prev</button>
        <span style={{padding:'0 1rem'}}>Page {page + 1} of {data.totalPages || 1}</span>
        <button style={styles.pageBtn} disabled={page + 1 >= data.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
      </div>
    </div>
  );
}

const styles = {
  page:{padding:'1.5rem'},
  filterBar:{display:'flex',gap:'0.75rem',marginBottom:'1.25rem',flexWrap:'wrap'},
  filterInput:{padding:'0.6rem',border:'1px solid #ddd',borderRadius:'4px',minWidth:'160px'},
  form:{background:'#fff',padding:'1.25rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',marginBottom:'1.5rem',maxWidth:'600px'},
  input:{display:'block',width:'100%',padding:'0.6rem',marginBottom:'0.75rem',border:'1px solid #ddd',borderRadius:'4px',boxSizing:'border-box'},
  btn:{padding:'0.6rem 1.25rem',background:'#1a73e8',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'},
  btnSecondary:{padding:'0.6rem 1.25rem',background:'#666',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'},
  btnSm:{padding:'0.3rem 0.75rem',background:'#1a73e8',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer',marginRight:'0.25rem'},
  table:{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:'8px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'},
  th:{padding:'0.75rem 1rem',background:'#f8f9fa',textAlign:'left',borderBottom:'1px solid #eee'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #eee'},
  badge:{padding:'0.25rem 0.6rem',borderRadius:'12px',color:'#fff',fontSize:'0.75rem'},
  pagination:{display:'flex',alignItems:'center',justifyContent:'center',marginTop:'1rem'},
  pageBtn:{padding:'0.5rem 1rem',background:'#1a73e8',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer',disabled:{opacity:0.5}}
};

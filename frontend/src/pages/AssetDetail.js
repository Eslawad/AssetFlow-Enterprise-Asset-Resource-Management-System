import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const statusStyle = {
  AVAILABLE:         { bg:'#dcfce7', color:'#15803d' },
  ALLOCATED:         { bg:'#fef9c3', color:'#a16207' },
  UNDER_MAINTENANCE: { bg:'#fee2e2', color:'#b91c1c' },
  RETIRED:           { bg:'#f1f5f9', color:'#64748b' },
};
const actionStyle = {
  CREATED:   { bg:'#dcfce7', color:'#15803d' },
  UPDATED:   { bg:'#dbeafe', color:'#1d4ed8' },
  DELETED:   { bg:'#fee2e2', color:'#b91c1c' },
  ALLOCATED: { bg:'#fef9c3', color:'#a16207' },
  RETURNED:  { bg:'#dcfce7', color:'#15803d' },
};

export default function AssetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [allocations, setAllocations] = useState([]);
  const [maintenance, setMaintenance] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [tab, setTab] = useState('allocations');

  useEffect(() => {
    api.get(`/assets/${id}`).then(r => setAsset(r.data));
    api.get('/allocations').then(r => setAllocations(r.data.filter(a => a.asset?.id === Number(id))));
    api.get(`/maintenance/asset/${id}`).then(r => setMaintenance(r.data));
    api.get(`/audit/asset/${id}`).then(r => setAuditLogs(r.data));
  }, [id]);

  if (!asset) return (
    <div style={s.loading}>
      <div style={s.loadingSpinner} />
      <span>Loading asset…</span>
    </div>
  );

  const ss = statusStyle[asset.status] || { bg:'#f1f5f9', color:'#64748b' };

  const TABS = [
    { key:'allocations', label:'📦 Allocations', count: allocations.length },
    { key:'maintenance', label:'🔧 Maintenance', count: maintenance.length },
    { key:'audit',       label:'📋 Audit Log',   count: auditLogs.length },
  ];

  return (
    <div style={s.page}>
      <button style={s.back} onClick={() => navigate('/assets')}>← Back to Assets</button>

      {/* Header */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <div style={s.assetIcon}>🖥</div>
          <div>
            <h2 style={{margin:'0 0 0.35rem', fontSize:'1.5rem'}}>{asset.name}</h2>
            <div style={s.metaRow}>
              <span style={s.metaChip}>{asset.category}</span>
              <span style={s.metaChip}>{asset.location}</span>
              <span style={{...s.metaChip, fontFamily:'monospace', fontSize:'0.75rem'}}>S/N: {asset.serialNumber}</span>
            </div>
          </div>
        </div>
        <div style={s.headerRight}>
          <span style={{...s.statusBadge, background: ss.bg, color: ss.color}}>{asset.status?.replace('_',' ')}</span>
          <div style={s.priceTag}>${asset.purchasePrice}</div>
          <div style={s.purchaseDate}>Purchased: {asset.purchaseDate || 'N/A'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={s.tabBar}>
        {TABS.map(t => (
          <button key={t.key} style={{...s.tab, ...(tab===t.key ? s.tabActive : {})}} onClick={() => setTab(t.key)}>
            {t.label}
            <span style={{...s.tabCount, ...(tab===t.key ? s.tabCountActive : {})}}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={s.tableWrap}>
        {tab === 'allocations' && (
          <table style={s.table}>
            <thead><tr>{['User','Allocated Date','Returned Date','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {allocations.length === 0 && <tr><td colSpan={4} style={s.empty}>No allocation history</td></tr>}
              {allocations.map(a => (
                <tr key={a.id}>
                  <td style={{...s.td, fontWeight:600}}>{a.user?.name}</td>
                  <td style={s.td}>{a.allocatedDate}</td>
                  <td style={s.td}>{a.returnedDate || '—'}</td>
                  <td style={s.td}>
                    <span style={{...s.badge, ...(a.status==='ACTIVE' ? {background:'#fef9c3',color:'#a16207'} : {background:'#dcfce7',color:'#15803d'})}}>
                      {a.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'maintenance' && (
          <table style={s.table}>
            <thead><tr>{['Description','Scheduled','Completed','Cost','Status'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {maintenance.length === 0 && <tr><td colSpan={5} style={s.empty}>No maintenance records</td></tr>}
              {maintenance.map(m => {
                const ms = { SCHEDULED:{bg:'#fef9c3',color:'#a16207'}, IN_PROGRESS:{bg:'#dbeafe',color:'#1d4ed8'}, COMPLETED:{bg:'#dcfce7',color:'#15803d'} }[m.status] || {};
                return (
                  <tr key={m.id}>
                    <td style={s.td}>{m.description}</td>
                    <td style={s.td}>{m.scheduledDate}</td>
                    <td style={s.td}>{m.completedDate || '—'}</td>
                    <td style={{...s.td, fontWeight:500}}>{m.cost ? `$${m.cost}` : '—'}</td>
                    <td style={s.td}><span style={{...s.badge, background: ms.bg, color: ms.color}}>{m.status?.replace('_',' ')}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {tab === 'audit' && (
          <table style={s.table}>
            <thead><tr>{['Action','Details','Performed At'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr></thead>
            <tbody>
              {auditLogs.length === 0 && <tr><td colSpan={3} style={s.empty}>No audit logs</td></tr>}
              {auditLogs.map(l => {
                const as = actionStyle[l.action] || { bg:'#f1f5f9', color:'#475569' };
                return (
                  <tr key={l.id}>
                    <td style={s.td}><span style={{...s.badge, background: as.bg, color: as.color}}>{l.action}</span></td>
                    <td style={s.td}>{l.details}</td>
                    <td style={{...s.td, color:'#94a3b8', fontSize:'0.8rem', whiteSpace:'nowrap'}}>{new Date(l.performedAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const s = {
  page: { padding:'2rem' },
  loading: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'3rem', color:'#64748b' },
  loadingSpinner: { width:'20px', height:'20px', border:'2px solid #e2e8f0', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.7s linear infinite' },
  back: { background:'none', border:'none', color:'#6366f1', cursor:'pointer', fontSize:'0.875rem', marginBottom:'1.25rem', padding:0, fontWeight:500, display:'flex', alignItems:'center', gap:'0.25rem' },
  header: { background:'#fff', padding:'1.5rem', borderRadius:'16px', boxShadow:'0 1px 8px rgba(0,0,0,0.07)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' },
  headerLeft: { display:'flex', alignItems:'flex-start', gap:'1rem' },
  assetIcon: { fontSize:'2.5rem', lineHeight:1, marginTop:'0.1rem' },
  metaRow: { display:'flex', gap:'0.5rem', flexWrap:'wrap', marginTop:'0.25rem' },
  metaChip: { background:'#f1f5f9', color:'#475569', padding:'0.2rem 0.65rem', borderRadius:'20px', fontSize:'0.75rem', fontWeight:500 },
  headerRight: { textAlign:'right', display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.4rem' },
  statusBadge: { padding:'0.35rem 0.9rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:600 },
  priceTag: { fontSize:'1.4rem', fontWeight:700, color:'#1e293b' },
  purchaseDate: { color:'#94a3b8', fontSize:'0.8rem' },
  tabBar: { display:'flex', gap:'0.5rem', marginBottom:'1rem', flexWrap:'wrap' },
  tab: { padding:'0.6rem 1.1rem', border:'1.5px solid #e2e8f0', borderRadius:'8px', background:'#fff', cursor:'pointer', fontSize:'0.875rem', color:'#64748b', fontWeight:500, display:'flex', alignItems:'center', gap:'0.5rem', transition:'all 0.18s' },
  tabActive: { background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', border:'1.5px solid transparent', boxShadow:'0 2px 8px rgba(99,102,241,0.3)' },
  tabCount: { background:'#f1f5f9', color:'#64748b', padding:'0.1rem 0.45rem', borderRadius:'10px', fontSize:'0.7rem', fontWeight:700 },
  tabCountActive: { background:'rgba(255,255,255,0.25)', color:'#fff' },
  tableWrap: { background:'#fff', borderRadius:'14px', boxShadow:'0 1px 8px rgba(0,0,0,0.07)', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'0.85rem 1rem', background:'#f8fafc', textAlign:'left', borderBottom:'2px solid #e2e8f0', fontSize:'0.75rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' },
  td: { padding:'0.85rem 1rem', borderBottom:'1px solid #f1f5f9', fontSize:'0.875rem', color:'#374151' },
  badge: { padding:'0.3rem 0.7rem', borderRadius:'20px', fontSize:'0.72rem', fontWeight:600 },
  empty: { padding:'2rem', textAlign:'center', color:'#94a3b8', fontSize:'0.875rem' },
};

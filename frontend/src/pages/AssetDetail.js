import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const statusColor = { AVAILABLE:'#34a853', ALLOCATED:'#fbbc04', UNDER_MAINTENANCE:'#ea4335', RETIRED:'#999' };
const actionColor = a => ({ CREATED:'#34a853', UPDATED:'#1a73e8', DELETED:'#ea4335', ALLOCATED:'#fbbc04', RETURNED:'#34a853' }[a] || '#999');

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
    api.get(`/allocations`).then(r => setAllocations(r.data.filter(a => a.asset?.id === Number(id))));
    api.get(`/maintenance/asset/${id}`).then(r => setMaintenance(r.data));
    api.get(`/audit/asset/${id}`).then(r => setAuditLogs(r.data));
  }, [id]);

  if (!asset) return <p style={{padding:'2rem'}}>Loading...</p>;

  return (
    <div style={styles.page}>
      <button style={styles.back} onClick={() => navigate('/assets')}>← Back to Assets</button>

      {/* Asset Header */}
      <div style={styles.header}>
        <div>
          <h2 style={{margin:'0 0 0.5rem'}}>{asset.name}</h2>
          <p style={styles.meta}>{asset.category} · {asset.location} · Serial: {asset.serialNumber}</p>
        </div>
        <div style={styles.headerRight}>
          <span style={{...styles.statusBadge, background: statusColor[asset.status]}}>{asset.status}</span>
          <p style={styles.price}>${asset.purchasePrice}</p>
          <p style={styles.date}>Purchased: {asset.purchaseDate || 'N/A'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['allocations','maintenance','audit'].map(t => (
          <button key={t} style={{...styles.tab, ...(tab===t ? styles.tabActive : {})}} onClick={() => setTab(t)}>
            {t === 'allocations' ? '📦 Allocations' : t === 'maintenance' ? '🔧 Maintenance' : '📋 Audit Log'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {tab === 'allocations' && (
          <table style={styles.table}>
            <thead><tr>{['User','Allocated Date','Returned Date','Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {allocations.length === 0 && <tr><td colSpan={4} style={{...styles.td, color:'#aaa'}}>No allocations</td></tr>}
              {allocations.map(a => (
                <tr key={a.id}>
                  <td style={styles.td}>{a.user?.name}</td>
                  <td style={styles.td}>{a.allocatedDate}</td>
                  <td style={styles.td}>{a.returnedDate || '-'}</td>
                  <td style={styles.td}><span style={{...styles.badge, background: a.status==='ACTIVE'?'#fbbc04':'#34a853'}}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'maintenance' && (
          <table style={styles.table}>
            <thead><tr>{['Description','Scheduled','Completed','Cost','Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {maintenance.length === 0 && <tr><td colSpan={5} style={{...styles.td, color:'#aaa'}}>No maintenance records</td></tr>}
              {maintenance.map(m => (
                <tr key={m.id}>
                  <td style={styles.td}>{m.description}</td>
                  <td style={styles.td}>{m.scheduledDate}</td>
                  <td style={styles.td}>{m.completedDate || '-'}</td>
                  <td style={styles.td}>{m.cost ? `$${m.cost}` : '-'}</td>
                  <td style={styles.td}><span style={{...styles.badge, background: {SCHEDULED:'#fbbc04',IN_PROGRESS:'#1a73e8',COMPLETED:'#34a853'}[m.status]}}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'audit' && (
          <table style={styles.table}>
            <thead><tr>{['Action','Details','Performed At'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
            <tbody>
              {auditLogs.length === 0 && <tr><td colSpan={3} style={{...styles.td, color:'#aaa'}}>No audit logs</td></tr>}
              {auditLogs.map(l => (
                <tr key={l.id}>
                  <td style={styles.td}><span style={{...styles.badge, background: actionColor(l.action)}}>{l.action}</span></td>
                  <td style={styles.td}>{l.details}</td>
                  <td style={styles.td}>{new Date(l.performedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  page:{padding:'1.5rem'},
  back:{background:'none',border:'none',color:'#1a73e8',cursor:'pointer',fontSize:'0.9rem',marginBottom:'1rem',padding:0},
  header:{background:'#fff',padding:'1.5rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'1.5rem',flexWrap:'wrap',gap:'1rem'},
  meta:{color:'#666',fontSize:'0.875rem',margin:0},
  headerRight:{textAlign:'right'},
  statusBadge:{padding:'0.35rem 0.9rem',borderRadius:'12px',color:'#fff',fontSize:'0.85rem'},
  price:{margin:'0.5rem 0 0.25rem',fontWeight:600,fontSize:'1.1rem'},
  date:{color:'#888',fontSize:'0.8rem',margin:0},
  tabs:{display:'flex',gap:'0.5rem',marginBottom:'1rem'},
  tab:{padding:'0.6rem 1.25rem',border:'1px solid #ddd',borderRadius:'6px',background:'#fff',cursor:'pointer',fontSize:'0.875rem',color:'#666'},
  tabActive:{background:'#1a73e8',color:'#fff',border:'1px solid #1a73e8'},
  tabContent:{background:'#fff',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',overflow:'hidden'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{padding:'0.75rem 1rem',background:'#f8f9fa',textAlign:'left',borderBottom:'1px solid #eee'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #eee',fontSize:'0.875rem'},
  badge:{padding:'0.2rem 0.5rem',borderRadius:'10px',color:'#fff',fontSize:'0.75rem'}
};

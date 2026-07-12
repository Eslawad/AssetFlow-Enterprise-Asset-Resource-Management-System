import { useEffect, useState } from 'react';
import api from '../services/api';

const actionStyle = {
  CREATED:   { bg:'#dcfce7', color:'#15803d' },
  UPDATED:   { bg:'#dbeafe', color:'#1d4ed8' },
  DELETED:   { bg:'#fee2e2', color:'#b91c1c' },
  ALLOCATED: { bg:'#fef9c3', color:'#a16207' },
  RETURNED:  { bg:'#dcfce7', color:'#15803d' },
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => { api.get('/audit/recent').then(r => setLogs(r.data)); }, []);

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>Audit Log</h2>
          <p style={s.sub}>Complete history of all system actions</p>
        </div>
        <div style={s.countBadge}>{logs.length} entries</div>
      </div>

      <div style={s.tableWrap}>
        <table style={s.table}>
          <thead>
            <tr>{['Action','Entity','Details','Performed By','Time'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr><td colSpan={5} style={{...s.td, textAlign:'center', color:'#94a3b8', padding:'2rem'}}>No audit logs yet</td></tr>
            )}
            {logs.map(l => {
              const as = actionStyle[l.action] || { bg:'#f1f5f9', color:'#475569' };
              return (
                <tr key={l.id}>
                  <td style={s.td}>
                    <span style={{...s.badge, background: as.bg, color: as.color}}>{l.action}</span>
                  </td>
                  <td style={{...s.td, fontFamily:'monospace', fontSize:'0.8rem', color:'#64748b'}}>
                    {l.entityType} #{l.entityId}
                  </td>
                  <td style={s.td}>{l.details}</td>
                  <td style={{...s.td, color:'#64748b'}}>User #{l.performedBy}</td>
                  <td style={{...s.td, color:'#94a3b8', fontSize:'0.8rem', whiteSpace:'nowrap'}}>
                    {new Date(l.performedAt).toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const s = {
  page: { padding:'2rem' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' },
  sub: { color:'#64748b', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  countBadge: { background:'#f1f5f9', color:'#475569', padding:'0.4rem 0.9rem', borderRadius:'20px', fontSize:'0.8rem', fontWeight:600 },
  tableWrap: { background:'#fff', borderRadius:'14px', boxShadow:'0 1px 8px rgba(0,0,0,0.07)', overflow:'hidden' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'0.85rem 1rem', background:'#f8fafc', textAlign:'left', borderBottom:'2px solid #e2e8f0', fontSize:'0.75rem', fontWeight:700, color:'#64748b', textTransform:'uppercase', letterSpacing:'0.05em' },
  td: { padding:'0.85rem 1rem', borderBottom:'1px solid #f1f5f9', fontSize:'0.875rem', color:'#374151' },
  badge: { padding:'0.3rem 0.7rem', borderRadius:'20px', fontSize:'0.72rem', fontWeight:600 },
};

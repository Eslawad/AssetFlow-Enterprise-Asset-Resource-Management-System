import { useEffect, useState } from 'react';
import api from '../services/api';

const actionColor = a => ({ CREATED:'#34a853', UPDATED:'#1a73e8', DELETED:'#ea4335', ALLOCATED:'#fbbc04', RETURNED:'#34a853' }[a] || '#999');

export default function AuditLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => { api.get('/audit/recent').then(r => setLogs(r.data)); }, []);

  return (
    <div style={styles.page}>
      <h2>Audit Log</h2>
      <table style={styles.table}>
        <thead>
          <tr>{['Action','Entity','Details','Performed By','Time'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {logs.map(l => (
            <tr key={l.id}>
              <td style={styles.td}><span style={{...styles.badge, background: actionColor(l.action)}}>{l.action}</span></td>
              <td style={styles.td}>{l.entityType} #{l.entityId}</td>
              <td style={styles.td}>{l.details}</td>
              <td style={styles.td}>User #{l.performedBy}</td>
              <td style={styles.td}>{new Date(l.performedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {logs.length === 0 && <p style={{color:'#aaa',marginTop:'1rem'}}>No audit logs yet</p>}
    </div>
  );
}

const styles = {
  page:{padding:'1.5rem'},
  table:{width:'100%',borderCollapse:'collapse',background:'#fff',borderRadius:'8px',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'},
  th:{padding:'0.75rem 1rem',background:'#f8f9fa',textAlign:'left',borderBottom:'1px solid #eee'},
  td:{padding:'0.75rem 1rem',borderBottom:'1px solid #eee',fontSize:'0.875rem'},
  badge:{padding:'0.25rem 0.6rem',borderRadius:'12px',color:'#fff',fontSize:'0.75rem'}
};

import { useEffect, useState } from 'react';
import api from '../services/api';

export default function Reports() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/reports/stats').then(r => setStats(r.data)); }, []);

  const download = async (type) => {
    const res = await api.get(`/reports/export/${type}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href = url; a.download = `${type}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.page}>
      <h2>Reports & Export</h2>
      {stats && (
        <div style={styles.statsGrid}>
          {[['Total Assets', stats.total], ['Available', stats.available], ['Allocated', stats.allocated], ['Under Maintenance', stats.underMaintenance]].map(([label, val]) => (
            <div key={label} style={styles.statCard}><p style={styles.label}>{label}</p><h3>{val}</h3></div>
          ))}
        </div>
      )}
      <div style={styles.exportSection}>
        <h4>Export Data</h4>
        <div style={styles.btnGroup}>
          <button style={styles.btn} onClick={() => download('assets')}>📥 Export Assets CSV</button>
          <button style={styles.btn} onClick={() => download('allocations')}>📥 Export Allocations CSV</button>
        </div>
      </div>
      {stats?.byCategory && (
        <div style={styles.categorySection}>
          <h4>Assets by Category</h4>
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Category</th><th style={styles.th}>Count</th></tr></thead>
            <tbody>
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <tr key={cat}><td style={styles.td}>{cat}</td><td style={styles.td}>{count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:{padding:'1.5rem'},
  statsGrid:{display:'flex',gap:'1rem',marginBottom:'2rem',flexWrap:'wrap'},
  statCard:{background:'#fff',padding:'1.25rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',flex:1,minWidth:'140px'},
  label:{color:'#666',margin:0,fontSize:'0.875rem'},
  exportSection:{background:'#fff',padding:'1.25rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',marginBottom:'1.5rem'},
  btnGroup:{display:'flex',gap:'1rem',flexWrap:'wrap'},
  btn:{padding:'0.6rem 1.25rem',background:'#1a73e8',color:'#fff',border:'none',borderRadius:'4px',cursor:'pointer'},
  categorySection:{background:'#fff',padding:'1.25rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{padding:'0.75rem',background:'#f8f9fa',textAlign:'left',borderBottom:'1px solid #eee'},
  td:{padding:'0.75rem',borderBottom:'1px solid #eee'}
};

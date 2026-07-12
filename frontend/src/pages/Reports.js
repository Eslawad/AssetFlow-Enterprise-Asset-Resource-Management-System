import { useEffect, useState } from 'react';
import api from '../services/api';

const STAT_CARDS = [
  { key:'total',            label:'Total Assets',      icon:'🖥',  grad:'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { key:'available',        label:'Available',         icon:'✅',  grad:'linear-gradient(135deg,#10b981,#059669)' },
  { key:'allocated',        label:'Allocated',         icon:'📦',  grad:'linear-gradient(135deg,#f59e0b,#d97706)' },
  { key:'underMaintenance', label:'Under Maintenance', icon:'🔧',  grad:'linear-gradient(135deg,#ef4444,#dc2626)' },
];

export default function Reports() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/reports/stats').then(r => setStats(r.data)); }, []);

  const download = async (url, filename) => {
    const res = await api.get(url, { responseType:'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(res.data);
    a.download = filename; a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>Reports & Export</h2>
          <p style={s.sub}>Analytics and data export for your assets</p>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div style={s.cards}>
          {STAT_CARDS.map(({ key, label, icon, grad }) => (
            <div key={key} style={{...s.card, background: grad}}>
              <div style={s.cardIcon}>{icon}</div>
              <div>
                <p style={s.cardLabel}>{label}</p>
                <h3 style={s.cardValue}>{stats[key]}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Export Section */}
      <div style={s.exportCard}>
        <h4>Export Data</h4>
        <p style={s.exportDesc}>Download your data as CSV or Excel files for offline analysis.</p>
        <div style={s.exportGroups}>
          <div style={s.exportGroup}>
            <p style={s.exportGroupLabel}>📋 Assets</p>
            <div style={s.btnRow}>
              <button style={{...s.exportBtn, background:'linear-gradient(135deg,#4338ca,#6366f1)'}}
                onClick={() => download('/reports/export/assets', 'assets.csv')}>
                📥 CSV
              </button>
              <button style={{...s.exportBtn, background:'linear-gradient(135deg,#059669,#10b981)'}}
                onClick={() => download('/reports/export/assets/excel', 'assets.xlsx')}>
                📊 Excel
              </button>
            </div>
          </div>
          <div style={s.exportGroup}>
            <p style={s.exportGroupLabel}>📦 Allocations</p>
            <div style={s.btnRow}>
              <button style={{...s.exportBtn, background:'linear-gradient(135deg,#4338ca,#6366f1)'}}
                onClick={() => download('/reports/export/allocations', 'allocations.csv')}>
                📥 CSV
              </button>
              <button style={{...s.exportBtn, background:'linear-gradient(135deg,#059669,#10b981)'}}
                onClick={() => download('/reports/export/allocations/excel', 'allocations.xlsx')}>
                📊 Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Warranty Expiring Soon */}
      {stats?.warrantyExpiring?.length > 0 && (
        <div style={{...s.tableCard, marginBottom:'1.5rem', borderLeft:'4px solid #ef4444'}}>
          <h4 style={{color:'#ef4444'}}>⚠️ Warranty Expiring Soon (Next 30 Days)</h4>
          <table style={s.table}>
            <thead>
              <tr>{['Asset','Category','Warranty Expiry'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {stats.warrantyExpiring.map(a => (
                <tr key={a.id}>
                  <td style={{...s.td, fontWeight:600}}>{a.name}</td>
                  <td style={s.td}>{a.category}</td>
                  <td style={{...s.td, color:'#ef4444', fontWeight:600}}>{a.warrantyExpiry}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Breakdown */}
      {stats?.byCategory && Object.keys(stats.byCategory).length > 0 && (
        <div style={s.tableCard}>
          <h4>Assets by Category</h4>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Category</th>
                <th style={s.th}>Count</th>
                <th style={s.th}>Distribution</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.byCategory).map(([cat, count]) => (
                <tr key={cat}>
                  <td style={{...s.td, fontWeight:600}}>{cat}</td>
                  <td style={s.td}>{count}</td>
                  <td style={s.td}>
                    <div style={s.barWrap}>
                      <div style={s.barTrack}>
                        <div style={{...s.barFill, width:`${Math.round((count/stats.total)*100)}%`}} />
                      </div>
                      <span style={s.barPct}>{Math.round((count/stats.total)*100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const s = {
  page: { padding:'2rem' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' },
  sub: { color:'var(--text3)', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  cards: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1.25rem', marginBottom:'1.75rem' },
  card: { padding:'1.5rem', borderRadius:'14px', display:'flex', alignItems:'center', gap:'1rem', color:'#fff', boxShadow:'var(--shadow-md)' },
  cardIcon: { fontSize:'2rem', lineHeight:1 },
  cardLabel: { color:'rgba(255,255,255,0.8)', margin:'0 0 0.25rem', fontSize:'0.8rem', fontWeight:500 },
  cardValue: { color:'#fff', margin:0, fontSize:'2rem', fontWeight:700 },
  exportCard: { background:'var(--surface)', padding:'1.5rem', borderRadius:'14px', boxShadow:'var(--shadow)', marginBottom:'1.5rem' },
  exportDesc: { color:'var(--text3)', fontSize:'0.875rem', margin:'0.25rem 0 1.25rem' },
  exportGroups: { display:'flex', gap:'2rem', flexWrap:'wrap' },
  exportGroup: { display:'flex', flexDirection:'column', gap:'0.5rem' },
  exportGroupLabel: { fontSize:'0.8rem', fontWeight:600, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em', margin:0 },
  btnRow: { display:'flex', gap:'0.5rem' },
  exportBtn: { padding:'0.6rem 1.1rem', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'0.85rem', fontWeight:600, boxShadow:'0 2px 8px rgba(0,0,0,0.15)' },
  tableCard: { background:'var(--surface)', padding:'1.5rem', borderRadius:'14px', boxShadow:'var(--shadow)' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'0.85rem 1rem', background:'var(--surface2)', textAlign:'left', borderBottom:'2px solid var(--border)', fontSize:'0.75rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em' },
  td: { padding:'0.85rem 1rem', borderBottom:'1px solid var(--border2)', fontSize:'0.875rem', color:'var(--text2)' },
  barWrap: { display:'flex', alignItems:'center', gap:'0.75rem' },
  barTrack: { flex:1, height:'6px', background:'var(--border)', borderRadius:'3px', overflow:'hidden' },
  barFill: { height:'100%', background:'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius:'3px' },
  barPct: { fontSize:'0.75rem', color:'var(--text3)', fontWeight:500, minWidth:'35px' },
};

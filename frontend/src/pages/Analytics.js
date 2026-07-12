import { useEffect, useState } from 'react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import api from '../services/api';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/reports/utilization')
      .then(r => setData(r.data))
      .catch(() => setData({ overallUtilizationRate:0, totalMaintenanceCost:0, neverAllocated:0, warrantyExpiringSoon:0, categoryUtilization:[], topMaintenanceCost:[], mostUsedAssets:[] }));
  }, []);

  if (!data) return (
    <div style={s.loading}><div style={s.spinner} /><span>Loading analytics…</span></div>
  );

  const radialData = [{ name:'Utilization', value: data.overallUtilizationRate, fill:'#6366f1' }];

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>Asset Utilization Analytics</h2>
          <p style={s.sub}>Deep insights into how your assets are being used</p>
        </div>
      </div>

      {/* KPI Row */}
      <div style={s.kpiRow}>
        <KpiCard label="Overall Utilization" value={`${data.overallUtilizationRate}%`} icon="📊" color="#6366f1" />
        <KpiCard label="Total Maintenance Cost" value={`$${Number(data.totalMaintenanceCost).toLocaleString()}`} icon="🔧" color="#f59e0b" />
        <KpiCard label="Never Allocated" value={data.neverAllocated} icon="📦" color="#ef4444" />
        <KpiCard label="Warranty Expiring (30d)" value={data.warrantyExpiringSoon} icon="⚠️" color="#dc2626" />
      </div>

      {/* Charts Row 1 */}
      <div style={s.chartsRow}>
        {/* Radial utilization gauge */}
        <div style={s.chartCard}>
          <h4>Overall Utilization Rate</h4>
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'0.5rem'}}>
            <ResponsiveContainer width="100%" height={200}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={radialData} startAngle={180} endAngle={0}>
                <RadialBar dataKey="value" cornerRadius={8} fill="#6366f1" background={{ fill:'var(--border)' }} />
                <Tooltip formatter={v => `${v}%`} contentStyle={s.tooltip} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div style={s.gaugeLabel}>{data.overallUtilizationRate}%</div>
            <p style={{color:'var(--text3)', fontSize:'0.8rem', margin:0}}>of assets currently allocated</p>
          </div>
        </div>

        {/* Category utilization bar chart */}
        <div style={{...s.chartCard, flex:2}}>
          <h4>Utilization Rate by Category</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.categoryUtilization} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="category" tick={{fontSize:11, fill:'var(--text3)'}} />
              <YAxis tick={{fontSize:11, fill:'var(--text3)'}} unit="%" domain={[0,100]} />
              <Tooltip contentStyle={s.tooltip} formatter={v => `${v}%`} />
              <Legend />
              <Bar dataKey="utilizationRate" name="Utilization %" fill="url(#utilGrad)" radius={[4,4,0,0]} />
              <defs>
                <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={s.chartsRow}>
        {/* Most used assets */}
        <div style={s.chartCard}>
          <h4>🏆 Most Used Assets</h4>
          {data.mostUsedAssets.length === 0
            ? <p style={s.empty}>No allocation data yet</p>
            : data.mostUsedAssets.map((item, i) => (
              <div key={item.asset} style={s.rankRow}>
                <span style={{...s.rankNum, background: COLORS[i]}}>{i+1}</span>
                <span style={s.rankName}>{item.asset}</span>
                <span style={s.rankCount}>{item.count} allocations</span>
              </div>
            ))}
        </div>

        {/* Top maintenance cost */}
        <div style={s.chartCard}>
          <h4>💰 Top Maintenance Costs</h4>
          {data.topMaintenanceCost.length === 0
            ? <p style={s.empty}>No maintenance cost data</p>
            : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.topMaintenanceCost} layout="vertical" barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" tick={{fontSize:10, fill:'var(--text3)'}} />
                  <YAxis dataKey="asset" type="category" tick={{fontSize:10, fill:'var(--text3)'}} width={90} />
                  <Tooltip contentStyle={s.tooltip} formatter={v => `$${v}`} />
                  <Bar dataKey="cost" fill="#f59e0b" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
        </div>

        {/* Category breakdown pie */}
        <div style={s.chartCard}>
          <h4>📦 Category Breakdown</h4>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data.categoryUtilization} dataKey="total" nameKey="category"
                cx="50%" cy="50%" outerRadius={75} innerRadius={35} paddingAngle={3} label={({category}) => category}>
                {data.categoryUtilization.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={s.tooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category utilization table */}
      <div style={s.tableCard}>
        <h4>Category Utilization Details</h4>
        <table style={s.table}>
          <thead>
            <tr>{['Category','Total','Allocated','Utilization Rate'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {data.categoryUtilization.map(row => (
              <tr key={row.category}>
                <td style={{...s.td, fontWeight:600}}>{row.category}</td>
                <td style={s.td}>{row.total}</td>
                <td style={s.td}>{row.allocated}</td>
                <td style={s.td}>
                  <div style={s.progressWrap}>
                    <div style={s.progressTrack}>
                      <div style={{...s.progressFill, width:`${row.utilizationRate}%`,
                        background: row.utilizationRate > 75 ? '#10b981' : row.utilizationRate > 40 ? '#f59e0b' : '#ef4444'}} />
                    </div>
                    <span style={s.progressPct}>{row.utilizationRate}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color }) {
  return (
    <div style={{...s.kpiCard, borderTop:`3px solid ${color}`}}>
      <div style={{fontSize:'1.75rem', marginBottom:'0.5rem'}}>{icon}</div>
      <div style={{fontSize:'1.6rem', fontWeight:700, color}}>{value}</div>
      <div style={{color:'var(--text3)', fontSize:'0.8rem', marginTop:'0.25rem'}}>{label}</div>
    </div>
  );
}

const s = {
  page: { padding:'2rem' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' },
  sub: { color:'var(--text3)', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  loading: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'3rem', color:'var(--text3)' },
  spinner: { width:'18px', height:'18px', border:'2px solid var(--border)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 0.7s linear infinite' },
  kpiRow: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'1.25rem', marginBottom:'1.5rem' },
  kpiCard: { background:'var(--surface)', padding:'1.25rem', borderRadius:'12px', boxShadow:'var(--shadow)', textAlign:'center' },
  chartsRow: { display:'flex', gap:'1.25rem', flexWrap:'wrap', marginBottom:'1.5rem' },
  chartCard: { background:'var(--surface)', padding:'1.5rem', borderRadius:'14px', boxShadow:'var(--shadow)', flex:1, minWidth:'260px' },
  tooltip: { borderRadius:'8px', border:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.15)', fontSize:'0.8rem', background:'var(--surface)', color:'var(--text)' },
  gaugeLabel: { fontSize:'2.5rem', fontWeight:800, color:'#6366f1', marginTop:'-2.5rem' },
  rankRow: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0', borderBottom:'1px solid var(--border2)' },
  rankNum: { width:'22px', height:'22px', borderRadius:'50%', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', fontWeight:700, flexShrink:0 },
  rankName: { flex:1, fontSize:'0.875rem', fontWeight:500, color:'var(--text2)' },
  rankCount: { fontSize:'0.78rem', color:'var(--text3)' },
  empty: { color:'var(--text4)', fontSize:'0.875rem', textAlign:'center', padding:'1rem 0' },
  tableCard: { background:'var(--surface)', padding:'1.5rem', borderRadius:'14px', boxShadow:'var(--shadow)' },
  table: { width:'100%', borderCollapse:'collapse' },
  th: { padding:'0.85rem 1rem', background:'var(--surface2)', textAlign:'left', borderBottom:`2px solid var(--border)`, fontSize:'0.75rem', fontWeight:700, color:'var(--text3)', textTransform:'uppercase', letterSpacing:'0.05em' },
  td: { padding:'0.85rem 1rem', borderBottom:'1px solid var(--border2)', fontSize:'0.875rem', color:'var(--text2)' },
  progressWrap: { display:'flex', alignItems:'center', gap:'0.75rem' },
  progressTrack: { flex:1, height:'6px', background:'var(--border)', borderRadius:'3px', overflow:'hidden' },
  progressFill: { height:'100%', borderRadius:'3px', transition:'width 0.5s' },
  progressPct: { fontSize:'0.78rem', fontWeight:600, color:'var(--text3)', minWidth:'35px' },
};

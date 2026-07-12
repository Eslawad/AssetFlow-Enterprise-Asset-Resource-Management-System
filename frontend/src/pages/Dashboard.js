import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444'];

const CARDS = [
  { key:'total',           label:'Total Assets',      icon:'🖥',  grad:'linear-gradient(135deg,#6366f1,#8b5cf6)' },
  { key:'available',       label:'Available',         icon:'✅',  grad:'linear-gradient(135deg,#10b981,#059669)' },
  { key:'allocated',       label:'Allocated',         icon:'📦',  grad:'linear-gradient(135deg,#f59e0b,#d97706)' },
  { key:'underMaintenance',label:'Under Maintenance', icon:'🔧',  grad:'linear-gradient(135deg,#ef4444,#dc2626)' },
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/reports/stats').then(r => setStats(r.data)); }, []);

  if (!stats) return (
    <div style={s.loading}>
      <div style={s.loadingDot} />
      <span>Loading dashboard…</span>
    </div>
  );

  const pieData = [
    { name:'Available', value: stats.available },
    { name:'Allocated', value: stats.allocated },
    { name:'Maintenance', value: stats.underMaintenance },
  ].filter(d => d.value > 0);

  const barData = Object.entries(stats.byCategory || {}).map(([name, value]) => ({ name, value }));

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>Dashboard</h2>
          <p style={s.pageSubtitle}>Overview of your asset ecosystem</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={s.cards}>
        {CARDS.map(({ key, label, icon, grad }) => (
          <div key={key} style={{...s.card, background: grad}}>
            <div style={s.cardIcon}>{icon}</div>
            <div>
              <p style={s.cardLabel}>{label}</p>
              <h3 style={s.cardValue}>{stats[key]}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={s.charts}>
        <div style={s.chartBox}>
          <h4>Asset Status Distribution</h4>
          <PieChart width={300} height={230}>
            <Pie data={pieData} cx={150} cy={105} outerRadius={85} innerRadius={40} dataKey="value" paddingAngle={3} label>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip contentStyle={s.tooltip} />
          </PieChart>
        </div>
        <div style={{...s.chartBox, flex:2}}>
          <h4>Assets by Category</h4>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={barData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{fontSize:12}} />
              <YAxis tick={{fontSize:12}} />
              <Tooltip contentStyle={s.tooltip} />
              <Legend />
              <Bar dataKey="value" fill="url(#barGrad)" radius={[4,4,0,0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div style={s.widgets}>
        <Widget title="📅 Upcoming Bookings" items={stats.upcomingBookings || []} empty="No upcoming bookings"
          render={b => <><span style={s.wName}>{b.assetName}</span><span style={s.wSub}>{b.userName} · {b.startDate} → {b.endDate}</span></>} />

        <Widget title="🔧 Upcoming Maintenance" items={stats.upcomingMaintenance || []} empty="No upcoming maintenance"
          render={m => <><span style={s.wName}>{m.assetName}</span><span style={s.wSub}>{m.description} · {m.scheduledDate}</span></>} />

        <Widget title="🕒 Recent Activity" items={stats.recentActivity || []} empty="No recent activity"
          render={a => (
            <>
              <span style={{...s.actionBadge, background: actionColor(a.action)}}>{a.action}</span>
              <span style={s.wSub}>{a.details}</span>
              <span style={s.wTime}>{new Date(a.performedAt).toLocaleString()}</span>
            </>
          )} />
      </div>
    </div>
  );
}

function Widget({ title, items, empty, render }) {
  return (
    <div style={s.widget}>
      <h4 style={{marginBottom:'0.75rem'}}>{title}</h4>
      {items.length === 0
        ? <p style={s.empty}>{empty}</p>
        : items.map((item, i) => (
          <div key={item.id || i} style={s.wRow}>{render(item)}</div>
        ))}
    </div>
  );
}

const actionColor = a => ({ CREATED:'#10b981', UPDATED:'#6366f1', DELETED:'#ef4444', ALLOCATED:'#f59e0b', RETURNED:'#10b981' }[a] || '#94a3b8');

const s = {
  page: { padding:'2rem' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.75rem' },
  pageSubtitle: { color:'var(--text3)', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  loading: { display:'flex', alignItems:'center', gap:'0.75rem', padding:'3rem', color:'var(--text3)', fontSize:'0.95rem' },
  loadingDot: { width:'10px', height:'10px', borderRadius:'50%', background:'#6366f1', animation:'pulse 1s infinite' },
  cards: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1.25rem', marginBottom:'1.75rem' },
  card: {
    padding:'1.5rem', borderRadius:'14px', display:'flex', alignItems:'center', gap:'1rem',
    color:'#fff', boxShadow:'var(--shadow-md)'
  },
  cardIcon: { fontSize:'2rem', lineHeight:1 },
  cardLabel: { color:'rgba(255,255,255,0.8)', margin:'0 0 0.25rem', fontSize:'0.8rem', fontWeight:500 },
  cardValue: { color:'#fff', margin:0, fontSize:'2rem', fontWeight:700 },
  charts: { display:'flex', gap:'1.25rem', flexWrap:'wrap', marginBottom:'1.75rem' },
  chartBox: {
    background:'var(--surface)', padding:'1.5rem', borderRadius:'14px',
    boxShadow:'var(--shadow)', flex:1, minWidth:'280px'
  },
  tooltip: { borderRadius:'8px', border:'none', boxShadow:'0 4px 16px rgba(0,0,0,0.15)', fontSize:'0.8rem', background:'var(--surface)', color:'var(--text)' },
  widgets: { display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.25rem' },
  widget: { background:'var(--surface)', padding:'1.5rem', borderRadius:'14px', boxShadow:'var(--shadow)' },
  wRow: {
    padding:'0.65rem 0', borderBottom:'1px solid var(--border2)',
    display:'flex', flexDirection:'column', gap:'0.2rem'
  },
  wName: { fontWeight:600, fontSize:'0.875rem', color:'var(--text)' },
  wSub: { color:'var(--text3)', fontSize:'0.78rem' },
  wTime: { color:'var(--text4)', fontSize:'0.72rem' },
  actionBadge: { padding:'0.15rem 0.55rem', borderRadius:'10px', color:'#fff', fontSize:'0.68rem', fontWeight:600, alignSelf:'flex-start' },
  empty: { color:'var(--text4)', fontSize:'0.85rem', margin:'0.25rem 0' }
};

import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const COLORS = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => { api.get('/reports/stats').then(r => setStats(r.data)); }, []);

  if (!stats) return <p style={{padding:'2rem'}}>Loading...</p>;

  const pieData = [
    { name: 'Available', value: stats.available },
    { name: 'Allocated', value: stats.allocated },
    { name: 'Maintenance', value: stats.underMaintenance },
  ].filter(d => d.value > 0);

  const barData = Object.entries(stats.byCategory || {}).map(([name, value]) => ({ name, value }));

  return (
    <div style={styles.page}>
      <h2>Dashboard</h2>

      {/* Stat Cards */}
      <div style={styles.cards}>
        {[['Total Assets', stats.total, '#1a73e8'], ['Available', stats.available, '#34a853'],
          ['Allocated', stats.allocated, '#fbbc04'], ['Maintenance', stats.underMaintenance, '#ea4335']].map(([label, val, color]) => (
          <div key={label} style={{...styles.card, borderTop: `4px solid ${color}`}}>
            <p style={styles.cardLabel}>{label}</p>
            <h3 style={{color, margin:0}}>{val}</h3>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={styles.charts}>
        <div style={styles.chartBox}>
          <h4>Asset Status</h4>
          <PieChart width={300} height={220}>
            <Pie data={pieData} cx={150} cy={100} outerRadius={80} dataKey="value" label>
              {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
        <div style={styles.chartBox}>
          <h4>Assets by Category</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" /><YAxis />
              <Tooltip /><Legend />
              <Bar dataKey="value" fill="#1a73e8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Widgets */}
      <div style={styles.widgets}>
        {/* Upcoming Bookings */}
        <div style={styles.widget}>
          <h4>📅 Upcoming Bookings (Next 7 Days)</h4>
          {(stats.upcomingBookings || []).length === 0
            ? <p style={styles.empty}>No upcoming bookings</p>
            : (stats.upcomingBookings || []).map(b => (
              <div key={b.id} style={styles.widgetRow}>
                <span style={styles.widgetName}>{b.assetName}</span>
                <span style={styles.widgetSub}>{b.userName} · {b.startDate} → {b.endDate}</span>
              </div>
            ))}
        </div>

        {/* Upcoming Maintenance */}
        <div style={styles.widget}>
          <h4>🔧 Upcoming Maintenance (Next 7 Days)</h4>
          {(stats.upcomingMaintenance || []).length === 0
            ? <p style={styles.empty}>No upcoming maintenance</p>
            : (stats.upcomingMaintenance || []).map(m => (
              <div key={m.id} style={styles.widgetRow}>
                <span style={styles.widgetName}>{m.assetName}</span>
                <span style={styles.widgetSub}>{m.description} · {m.scheduledDate}</span>
              </div>
            ))}
        </div>

        {/* Recent Activity */}
        <div style={styles.widget}>
          <h4>🕒 Recent Activity</h4>
          {(stats.recentActivity || []).length === 0
            ? <p style={styles.empty}>No recent activity</p>
            : (stats.recentActivity || []).map((a, i) => (
              <div key={i} style={styles.widgetRow}>
                <span style={{...styles.actionBadge, background: actionColor(a.action)}}>{a.action}</span>
                <span style={styles.widgetSub}>{a.details}</span>
                <span style={styles.widgetTime}>{new Date(a.performedAt).toLocaleString()}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

const actionColor = a => ({ CREATED:'#34a853', UPDATED:'#1a73e8', DELETED:'#ea4335', ALLOCATED:'#fbbc04', RETURNED:'#34a853' }[a] || '#999');

const styles = {
  page:{padding:'1.5rem'},
  cards:{display:'flex',gap:'1rem',marginBottom:'1.5rem',flexWrap:'wrap'},
  card:{background:'#fff',padding:'1.25rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',minWidth:'150px',flex:1},
  cardLabel:{color:'#666',margin:'0 0 0.5rem',fontSize:'0.875rem'},
  charts:{display:'flex',gap:'1.5rem',flexWrap:'wrap',marginBottom:'1.5rem'},
  chartBox:{background:'#fff',padding:'1rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',flex:1,minWidth:'280px'},
  widgets:{display:'flex',gap:'1.5rem',flexWrap:'wrap'},
  widget:{background:'#fff',padding:'1.25rem',borderRadius:'8px',boxShadow:'0 1px 4px rgba(0,0,0,0.1)',flex:1,minWidth:'260px'},
  widgetRow:{padding:'0.5rem 0',borderBottom:'1px solid #f0f0f0',display:'flex',flexDirection:'column',gap:'0.2rem'},
  widgetName:{fontWeight:600,fontSize:'0.9rem'},
  widgetSub:{color:'#666',fontSize:'0.8rem'},
  widgetTime:{color:'#aaa',fontSize:'0.75rem'},
  actionBadge:{padding:'0.15rem 0.5rem',borderRadius:'10px',color:'#fff',fontSize:'0.7rem',alignSelf:'flex-start'},
  empty:{color:'#aaa',fontSize:'0.875rem',margin:'0.5rem 0'}
};

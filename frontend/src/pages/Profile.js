import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const roleStyle = {
  ADMIN:   { bg:'#fee2e2', color:'#b91c1c' },
  MANAGER: { bg:'#dbeafe', color:'#1d4ed8' },
  VIEWER:  { bg:'#dcfce7', color:'#15803d' },
};

export default function Profile() {
  const { user, logout } = useAuth();
  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });

  const updateName = async e => {
    e.preventDefault();
    try {
      await api.put(`/users/${user.id}/profile`, { name: nameForm.name });
      localStorage.setItem('name', nameForm.name);
      toast.success('Name updated! Re-login to see changes everywhere.');
    } catch(err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const updatePassword = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    try {
      await api.put(`/users/${user.id}/password`, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated! Logging out…');
      setTimeout(() => { logout(); window.location.href = '/login'; }, 1500);
    } catch(err) { toast.error(err.response?.data?.message || 'Password update failed'); }
  };

  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) || '?';
  const rs = roleStyle[user?.role] || { bg:'#f1f5f9', color:'#475569' };

  return (
    <div style={s.page}>
      <div style={s.pageHeader}>
        <div>
          <h2 style={{margin:0}}>My Profile</h2>
          <p style={s.sub}>Manage your account settings</p>
        </div>
      </div>

      <div style={s.grid}>
        {/* Profile Card */}
        <div style={s.profileCard}>
          <div style={s.avatarWrap}>
            <div style={s.avatar}>{initials}</div>
            <div style={s.avatarRing} />
          </div>
          <h3 style={s.name}>{user?.name}</h3>
          <p style={s.email}>{user?.email}</p>
          <span style={{...s.roleBadge, background: rs.bg, color: rs.color}}>{user?.role}</span>
          <div style={s.divider} />
          <div style={s.infoRow}><span style={s.infoLabel}>Member ID</span><span style={s.infoVal}>#{user?.id}</span></div>
          <div style={s.infoRow}><span style={s.infoLabel}>Access Level</span><span style={s.infoVal}>{user?.role}</span></div>
        </div>

        {/* Forms */}
        <div style={s.forms}>
          {/* Update Name */}
          <div style={s.formCard}>
            <div style={s.formHeader}>
              <div style={s.formIcon}>✏️</div>
              <div>
                <h4 style={{margin:0}}>Update Name</h4>
                <p style={s.formDesc}>Change your display name</p>
              </div>
            </div>
            <form onSubmit={updateName}>
              <label style={s.label}>Full Name</label>
              <input style={s.input} value={nameForm.name}
                onChange={e => setNameForm({ name: e.target.value })} required />
              <button style={s.btnPrimary} type="submit">Update Name</button>
            </form>
          </div>

          {/* Change Password */}
          <div style={s.formCard}>
            <div style={s.formHeader}>
              <div style={s.formIcon}>🔒</div>
              <div>
                <h4 style={{margin:0}}>Change Password</h4>
                <p style={s.formDesc}>You'll be logged out after changing</p>
              </div>
            </div>
            <form onSubmit={updatePassword}>
              {[
                ['currentPassword','Current Password'],
                ['newPassword','New Password'],
                ['confirmPassword','Confirm New Password']
              ].map(([f, lbl]) => (
                <div key={f} style={{marginBottom:'1rem'}}>
                  <label style={s.label}>{lbl}</label>
                  <input style={s.input} type="password" value={pwForm[f]}
                    onChange={e => setPwForm({...pwForm, [f]: e.target.value})} required />
                </div>
              ))}
              <button style={{...s.btnPrimary, background:'linear-gradient(135deg,#dc2626,#ef4444)'}} type="submit">
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const s = {
  page: { padding:'2rem' },
  pageHeader: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' },
  sub: { color:'#64748b', fontSize:'0.875rem', margin:'0.25rem 0 0' },
  grid: { display:'flex', gap:'1.5rem', flexWrap:'wrap', alignItems:'flex-start' },
  profileCard: {
    background:'#fff', padding:'2rem', borderRadius:'16px',
    boxShadow:'0 1px 8px rgba(0,0,0,0.07)', textAlign:'center',
    minWidth:'220px', width:'240px', flexShrink:0
  },
  avatarWrap: { position:'relative', display:'inline-block', marginBottom:'1rem' },
  avatar: {
    width:'80px', height:'80px', borderRadius:'50%',
    background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontSize:'1.75rem', fontWeight:700, position:'relative', zIndex:1
  },
  avatarRing: {
    position:'absolute', inset:'-4px', borderRadius:'50%',
    border:'3px solid #e0e7ff', zIndex:0
  },
  name: { margin:'0 0 0.25rem', fontSize:'1.1rem', fontWeight:700, color:'#1e293b' },
  email: { color:'#64748b', fontSize:'0.85rem', margin:'0 0 0.75rem' },
  roleBadge: { padding:'0.3rem 0.85rem', borderRadius:'20px', fontSize:'0.75rem', fontWeight:600 },
  divider: { height:'1px', background:'#f1f5f9', margin:'1.25rem 0' },
  infoRow: { display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' },
  infoLabel: { color:'#94a3b8', fontSize:'0.8rem' },
  infoVal: { color:'#374151', fontSize:'0.8rem', fontWeight:600 },
  forms: { flex:1, display:'flex', flexDirection:'column', gap:'1.25rem', minWidth:'280px' },
  formCard: { background:'#fff', padding:'1.5rem', borderRadius:'14px', boxShadow:'0 1px 8px rgba(0,0,0,0.07)' },
  formHeader: { display:'flex', alignItems:'flex-start', gap:'0.75rem', marginBottom:'1.25rem' },
  formIcon: { fontSize:'1.5rem', lineHeight:1 },
  formDesc: { color:'#64748b', fontSize:'0.8rem', margin:'0.2rem 0 0' },
  label: { display:'block', fontSize:'0.75rem', fontWeight:600, color:'#374151', marginBottom:'0.35rem', textTransform:'uppercase', letterSpacing:'0.04em' },
  input: { display:'block', width:'100%', padding:'0.65rem 0.9rem', border:'1.5px solid #e2e8f0', borderRadius:'8px', boxSizing:'border-box', fontSize:'0.875rem', background:'#f8fafc', marginBottom:'1rem' },
  btnPrimary: { padding:'0.65rem 1.5rem', background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'0.875rem', fontWeight:600, boxShadow:'0 2px 8px rgba(99,102,241,0.3)' },
};

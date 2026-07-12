import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, logout } = useAuth();
  const [nameForm, setNameForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const updateName = async e => {
    e.preventDefault();
    try {
      await api.put(`/users/${user.id}/profile`, { name: nameForm.name });
      localStorage.setItem('name', nameForm.name);
      toast.success('Name updated! Please re-login to see changes.');
    } catch(err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const updatePassword = async e => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    try {
      await api.put(`/users/${user.id}/password`, { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated! Please login again.');
      setTimeout(() => { logout(); window.location.href = '/login'; }, 1500);
    } catch(err) { toast.error(err.response?.data?.message || 'Password update failed'); }
  };

  return (
    <div style={styles.page}>
      <h2>My Profile</h2>
      <div style={styles.grid}>

        {/* Profile Info */}
        <div style={styles.card}>
          <div style={styles.avatar}>{user?.name?.charAt(0).toUpperCase()}</div>
          <h3 style={styles.userName}>{user?.name}</h3>
          <p style={styles.userEmail}>{user?.email}</p>
          <span style={{...styles.roleBadge, background: user?.role==='ADMIN'?'#ea4335':user?.role==='MANAGER'?'#1a73e8':'#34a853'}}>{user?.role}</span>
        </div>

        {/* Update Name */}
        <div style={styles.formCard}>
          <h4>Update Name</h4>
          <form onSubmit={updateName}>
            <label style={styles.label}>Full Name</label>
            <input style={styles.input} value={nameForm.name}
              onChange={e => setNameForm({name: e.target.value})} required />
            <button style={styles.btn} type="submit">Update Name</button>
          </form>
        </div>

        {/* Change Password */}
        <div style={styles.formCard}>
          <h4>Change Password</h4>
          <form onSubmit={updatePassword}>
            {['currentPassword','newPassword','confirmPassword'].map(f => (
              <div key={f} style={{marginBottom:'0.75rem'}}>
                <label style={styles.label}>{f === 'currentPassword' ? 'Current Password' : f === 'newPassword' ? 'New Password' : 'Confirm New Password'}</label>
                <input style={styles.input} type="password" value={pwForm[f]}
                  onChange={e => setPwForm({...pwForm, [f]: e.target.value})} required />
              </div>
            ))}
            <button style={{...styles.btn, background:'#ea4335'}} type="submit">Change Password</button>
          </form>
        </div>

      </div>
    </div>
  );
}

const styles = {
  page: { padding:'1.5rem' },
  grid: { display:'flex', gap:'1.5rem', flexWrap:'wrap', marginTop:'1rem' },
  card: { background:'#fff', padding:'2rem', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.1)', textAlign:'center', minWidth:'220px' },
  avatar: { width:'72px', height:'72px', borderRadius:'50%', background:'#1a73e8', color:'#fff', fontSize:'2rem', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem' },
  userName: { margin:'0 0 0.25rem', fontSize:'1.1rem' },
  userEmail: { color:'#666', fontSize:'0.875rem', margin:'0 0 0.75rem' },
  roleBadge: { padding:'0.25rem 0.75rem', borderRadius:'12px', color:'#fff', fontSize:'0.75rem' },
  formCard: { background:'#fff', padding:'1.5rem', borderRadius:'8px', boxShadow:'0 1px 4px rgba(0,0,0,0.1)', flex:1, minWidth:'260px' },
  label: { display:'block', fontSize:'0.8rem', fontWeight:600, color:'#444', marginBottom:'0.35rem' },
  input: { display:'block', width:'100%', padding:'0.65rem', border:'1px solid #ddd', borderRadius:'4px', boxSizing:'border-box', marginBottom:'0.75rem' },
  btn: { padding:'0.65rem 1.5rem', background:'#1a73e8', color:'#fff', border:'none', borderRadius:'4px', cursor:'pointer', fontWeight:600 }
};

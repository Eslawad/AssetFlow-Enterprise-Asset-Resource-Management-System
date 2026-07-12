import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate('/dashboard');
      } else {
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
        await api.post('/auth/register', { name: form.name, email: form.email, password: form.password, role: 'VIEWER' });
        toast.success('Account created! Please login.');
        setMode('login');
        setForm({ name: '', email: '', password: '', confirmPassword: '' });
      }
    } catch(err) {
      setError(err.response?.data?.message || (mode === 'login' ? 'Invalid credentials' : 'Registration failed'));
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>📦</span>
          <h2 style={styles.title}>AssetFlow</h2>
          <p style={styles.subtitle}>Enterprise Asset Management</p>
        </div>

        {/* Toggle */}
        <div style={styles.toggle}>
          <button style={{...styles.toggleBtn, ...(mode==='login' ? styles.toggleActive : {})}} onClick={() => { setMode('login'); setError(''); }}>Login</button>
          <button style={{...styles.toggleBtn, ...(mode==='register' ? styles.toggleActive : {})}} onClick={() => { setMode('register'); setError(''); }}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input style={styles.input} placeholder="John Doe" value={form.name}
                onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
          )}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          {mode === 'register' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input style={styles.input} type="password" placeholder="••••••••" value={form.confirmPassword}
                onChange={e => setForm({...form, confirmPassword: e.target.value})} required />
            </div>
          )}
          {error && <p style={styles.error}>⚠ {error}</p>}
          <button style={{...styles.btn, opacity: loading ? 0.7 : 1}} type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <span style={styles.switchLink} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
            {mode === 'login' ? 'Register' : 'Login'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: { display:'flex', justifyContent:'center', alignItems:'center', minHeight:'100vh', background:'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' },
  card: { background:'#fff', padding:'2.5rem', borderRadius:'12px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', width:'400px' },
  logo: { textAlign:'center', marginBottom:'1.5rem' },
  logoIcon: { fontSize:'2.5rem' },
  title: { margin:'0.5rem 0 0.25rem', color:'#1a73e8', fontSize:'1.75rem' },
  subtitle: { color:'#888', fontSize:'0.85rem', margin:0 },
  toggle: { display:'flex', background:'#f0f2f5', borderRadius:'8px', padding:'4px', marginBottom:'1.5rem' },
  toggleBtn: { flex:1, padding:'0.5rem', border:'none', background:'transparent', borderRadius:'6px', cursor:'pointer', fontSize:'0.9rem', color:'#666', fontWeight:500 },
  toggleActive: { background:'#fff', color:'#1a73e8', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' },
  inputGroup: { marginBottom:'1rem' },
  label: { display:'block', fontSize:'0.8rem', fontWeight:600, color:'#444', marginBottom:'0.35rem' },
  input: { width:'100%', padding:'0.7rem 0.9rem', border:'1px solid #ddd', borderRadius:'6px', boxSizing:'border-box', fontSize:'0.95rem', outline:'none' },
  btn: { width:'100%', padding:'0.8rem', background:'#1a73e8', color:'#fff', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'1rem', fontWeight:600, marginTop:'0.5rem' },
  error: { color:'#ea4335', fontSize:'0.85rem', marginBottom:'0.75rem', background:'#fef2f2', padding:'0.5rem 0.75rem', borderRadius:'4px' },
  switchText: { textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'#666' },
  switchLink: { color:'#1a73e8', cursor:'pointer', fontWeight:600 }
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name:'', email:'', password:'', confirmPassword:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        navigate('/dashboard');
      } else {
        if (form.password !== form.confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
        await api.post('/auth/register', { name: form.name, email: form.email, password: form.password, role: 'VIEWER' });
        toast.success('Account created! Please login.');
        setMode('login'); setForm({ name:'', email:'', password:'', confirmPassword:'' });
      }
    } catch(err) {
      setError(err.response?.data?.message || (mode === 'login' ? 'Invalid credentials' : 'Registration failed'));
    }
    setLoading(false);
  };

  return (
    <div style={s.page}>
      {/* Left panel */}
      <div style={s.left}>
        <div style={s.brand}>
          <div style={s.brandIcon}>AF</div>
          <h1 style={s.brandName}>AssetFlow</h1>
          <p style={s.brandTagline}>Enterprise Asset & Resource Management</p>
        </div>
        <div style={s.features}>
          {['Track assets across your organization','Manage allocations & bookings','Schedule maintenance & get alerts','Role-based access control'].map(f => (
            <div key={f} style={s.feature}><span style={s.featureDot}>✓</span>{f}</div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.title}>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p style={s.subtitle}>{mode === 'login' ? 'Sign in to your workspace' : 'Join your team on AssetFlow'}</p>

          {/* Toggle */}
          <div style={s.toggle}>
            <button style={{...s.toggleBtn, ...(mode==='login' ? s.toggleActive : {})}} onClick={() => { setMode('login'); setError(''); }}>Sign In</button>
            <button style={{...s.toggleBtn, ...(mode==='register' ? s.toggleActive : {})}} onClick={() => { setMode('register'); setError(''); }}>Register</button>
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <Field label="Full Name" type="text" placeholder="John Doe" value={form.name} onChange={set('name')} />
            )}
            <Field label="Email Address" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} />
            <Field label="Password" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} />
            {mode === 'register' && (
              <Field label="Confirm Password" type="password" placeholder="••••••••" value={form.confirmPassword} onChange={set('confirmPassword')} />
            )}

            {error && (
              <div style={s.error}>
                <span>⚠</span> {error}
              </div>
            )}

            <button style={{...s.btn, opacity: loading ? 0.75 : 1}} type="submit" disabled={loading}>
              {loading ? <span style={s.spinner} /> : null}
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={s.switchText}>
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <span style={s.switchLink} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Register' : 'Sign In'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <label style={s.label}>{label}</label>
      <input style={s.input} type={type} placeholder={placeholder} value={value} onChange={onChange} required />
    </div>
  );
}

const s = {
  page: { display:'flex', minHeight:'100vh' },
  left: {
    flex:1, background:'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    display:'flex', flexDirection:'column', justifyContent:'center', padding:'3rem',
    color:'#fff'
  },
  brand: { marginBottom:'3rem' },
  brandIcon: {
    width:'56px', height:'56px', borderRadius:'14px',
    background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff',
    display:'flex', alignItems:'center', justifyContent:'center',
    fontWeight:800, fontSize:'1.1rem', marginBottom:'1rem',
    boxShadow:'0 8px 24px rgba(99,102,241,0.4)'
  },
  brandName: { fontSize:'2.25rem', fontWeight:800, margin:'0 0 0.5rem', letterSpacing:'-0.5px' },
  brandTagline: { color:'#a5b4fc', fontSize:'1rem', margin:0 },
  features: { display:'flex', flexDirection:'column', gap:'0.85rem' },
  feature: { display:'flex', alignItems:'center', gap:'0.75rem', color:'#c7d2fe', fontSize:'0.95rem' },
  featureDot: { color:'#818cf8', fontWeight:700, fontSize:'1rem', flexShrink:0 },
  right: {
    width:'480px', background:'#f8fafc', display:'flex',
    alignItems:'center', justifyContent:'center', padding:'2rem'
  },
  card: { width:'100%', maxWidth:'400px' },
  title: { fontSize:'1.6rem', fontWeight:700, color:'#1e1b4b', margin:'0 0 0.35rem' },
  subtitle: { color:'#64748b', fontSize:'0.9rem', margin:'0 0 1.75rem' },
  toggle: {
    display:'flex', background:'#e2e8f0', borderRadius:'10px',
    padding:'4px', marginBottom:'1.5rem', gap:'4px'
  },
  toggleBtn: {
    flex:1, padding:'0.55rem', border:'none', background:'transparent',
    borderRadius:'7px', cursor:'pointer', fontSize:'0.875rem', color:'#64748b',
    fontWeight:500, transition:'all 0.2s'
  },
  toggleActive: { background:'#fff', color:'#4338ca', boxShadow:'0 1px 6px rgba(0,0,0,0.12)', fontWeight:600 },
  label: { display:'block', fontSize:'0.78rem', fontWeight:600, color:'#374151', marginBottom:'0.4rem', letterSpacing:'0.02em' },
  input: {
    width:'100%', padding:'0.75rem 1rem', border:'1.5px solid #e2e8f0',
    borderRadius:'8px', boxSizing:'border-box', fontSize:'0.9rem',
    background:'#fff', color:'#1e293b'
  },
  btn: {
    width:'100%', padding:'0.85rem', marginTop:'0.5rem',
    background:'linear-gradient(135deg,#4338ca,#6366f1)', color:'#fff',
    border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'0.95rem',
    fontWeight:600, display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem',
    boxShadow:'0 4px 14px rgba(99,102,241,0.35)'
  },
  error: {
    color:'#dc2626', fontSize:'0.85rem', marginBottom:'0.75rem',
    background:'#fef2f2', border:'1px solid #fecaca',
    padding:'0.6rem 0.85rem', borderRadius:'7px', display:'flex', gap:'0.5rem', alignItems:'center'
  },
  switchText: { textAlign:'center', marginTop:'1.25rem', fontSize:'0.875rem', color:'#64748b' },
  switchLink: { color:'#4338ca', cursor:'pointer', fontWeight:600 },
  spinner: {
    width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.4)',
    borderTopColor:'#fff', borderRadius:'50%', display:'inline-block',
    animation:'spin 0.7s linear infinite'
  }
};

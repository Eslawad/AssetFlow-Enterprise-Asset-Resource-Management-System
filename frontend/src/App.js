import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Allocations from './pages/Allocations';
import Bookings from './pages/Bookings';
import Maintenance from './pages/Maintenance';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Users from './pages/Users';
import AuditLog from './pages/AuditLog';
import Profile from './pages/Profile';
import AssetDetail from './pages/AssetDetail';
import Analytics from './pages/Analytics';
import Chatbot from './pages/Chatbot';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return <Layout>{children}</Layout>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/assets" element={<PrivateRoute><Assets /></PrivateRoute>} />
            <Route path="/assets/:id" element={<PrivateRoute><AssetDetail /></PrivateRoute>} />
            <Route path="/allocations" element={<PrivateRoute roles={['ADMIN','MANAGER']}><Allocations /></PrivateRoute>} />
            <Route path="/bookings" element={<PrivateRoute><Bookings /></PrivateRoute>} />
            <Route path="/maintenance" element={<PrivateRoute roles={['ADMIN','MANAGER']}><Maintenance /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute roles={['ADMIN','MANAGER']}><Reports /></PrivateRoute>} />
            <Route path="/analytics" element={<PrivateRoute roles={['ADMIN','MANAGER']}><Analytics /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><Notifications /></PrivateRoute>} />
            <Route path="/users" element={<PrivateRoute roles={['ADMIN']}><Users /></PrivateRoute>} />
            <Route path="/audit" element={<PrivateRoute roles={['ADMIN','MANAGER']}><AuditLog /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/chatbot" element={<PrivateRoute><Chatbot /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

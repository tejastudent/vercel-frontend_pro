import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ClientsPage from './pages/ClientsPage';
import ClientDetailPage from './pages/ClientDetailPage';
import PortfolioPage from './pages/PortfolioPage';
import ChatPage from './pages/ChatPage';
import AlertsPage from './pages/AlertsPage';
import DocumentsPage from './pages/DocumentsPage';
import PortfolioGlobalPage from './pages/PortfolioGlobalPage';
import CompliancePage from './pages/CompliancePage';
import SettingsPage from './pages/SettingsPage';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/layout/LoadingScreen';
import { io } from 'socket.io-client';

const ProtectedRoute = ({ children }) => {
  const { advisor, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!advisor) return <Navigate to="/login" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { advisor, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (advisor) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  const { advisor } = useAuth();

  React.useEffect(() => {
    if (!advisor) return;

    const token = localStorage.getItem('advisor_token');
    if (!token) return;

    const socket = io(process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to Real-Time Alerts socket');
    });

    socket.on('new_alert', (alert) => {
      import('react-hot-toast').then(({ default: toast }) => {
        toast.error(`Alert: ${alert.title}\n${alert.message}`, {
          duration: 6000,
          icon: '🚨'
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [advisor]);

  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="clients/:id/portfolio" element={<PortfolioPage />} />
        <Route path="portfolio" element={<PortfolioGlobalPage />} />
        <Route path="compliance" element={<CompliancePage />} />
        <Route path="research" element={<DocumentsPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1629',
              color: '#e2e8f0',
              border: '1px solid #1a2540',
              borderRadius: '8px',
              fontFamily: 'DM Sans, sans-serif'
            }
          }}
        />
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Trades from './pages/Trades';
import Calculators from './pages/Calculators';
import Subscription from './pages/Subscription';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import SubscriptionCancelled from './pages/SubscriptionCancelled';
import Performance from './pages/Performance';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ScannerConfig from './pages/admin/ScannerConfig';
import DataSources from './pages/admin/DataSources';

// Educator Pages
import EducatorDashboard from './pages/educator/EducatorDashboard';
import TradeManagement from './pages/educator/TradeManagement';

// Protected Route Component
const ProtectedRoute = ({ children, requireSubscription = false, requireRole = null }) => {
  const { isAuthenticated, user, hasActiveSubscription, hasRole } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireSubscription && !hasActiveSubscription()) {
    return <Navigate to="/subscription" replace />;
  }

  if (requireRole && !hasRole(requireRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { fetchUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated]);

  return (
    <>
      <Router>
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/subscription/success" element={<SubscriptionSuccess />} />
            <Route path="/subscription/cancelled" element={<SubscriptionCancelled />} />
            
            {/* Routes requiring subscription */}
            <Route
              path="/scanner"
              element={
                <ProtectedRoute requireSubscription>
                  <Scanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trades"
              element={
                <ProtectedRoute requireSubscription>
                  <Trades />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calculators"
              element={
                <ProtectedRoute requireSubscription>
                  <Calculators />
                </ProtectedRoute>
              }
            />
            <Route
              path="/performance"
              element={
                <ProtectedRoute requireSubscription>
                  <Performance />
                </ProtectedRoute>
              }
            />

            {/* Educator Routes */}
            <Route
              path="/educator/dashboard"
              element={
                <ProtectedRoute requireRole={['educator', 'admin']}>
                  <EducatorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/educator/trades"
              element={
                <ProtectedRoute requireRole={['educator', 'admin']}>
                  <TradeManagement />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute requireRole={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requireRole={['admin']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/scanner"
              element={
                <ProtectedRoute requireRole={['admin']}>
                  <ScannerConfig />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/data-sources"
              element={
                <ProtectedRoute requireRole={['admin']}>
                  <DataSources />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155'
          }
        }}
      />
    </>
  );
}

export default App;

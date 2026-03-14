import React, { useEffect, useState } from 'react';
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
import MarketData from './pages/MarketData';

// Phase 2 Pages
import GoldScanner from './pages/GoldScanner';
import Community from './pages/Community';
import TradeJournal from './pages/TradeJournal';
import EconomicCalendar from './pages/EconomicCalendar';
import ReferralDashboard from './pages/ReferralDashboard';

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
  const { isAuthenticated, user, hasActiveSubscription, hasRole, _hasHydrated } = useAuthStore();

  // Wait for Zustand persist to hydrate before making redirect decisions
  if (!_hasHydrated) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400" />
      </div>
    );
  }

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
  const { fetchUser, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (_hasHydrated && isAuthenticated) {
      fetchUser();
    }
  }, [_hasHydrated, isAuthenticated]);

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
            <Route
              path="/market-data"
              element={
                <ProtectedRoute requireSubscription>
                  <MarketData />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gold-scanner"
              element={
                <ProtectedRoute requireSubscription>
                  <GoldScanner />
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute requireSubscription>
                  <Community />
                </ProtectedRoute>
              }
            />
            <Route
              path="/journal"
              element={
                <ProtectedRoute requireSubscription>
                  <TradeJournal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/calendar"
              element={
                <ProtectedRoute requireSubscription>
                  <EconomicCalendar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/referrals"
              element={
                <ProtectedRoute requireSubscription>
                  <ReferralDashboard />
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

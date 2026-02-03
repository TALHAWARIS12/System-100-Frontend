import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AuthLayout = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-500 mb-2">Trading Platform</h1>
          <p className="text-gray-400">Professional Trading Signals & Scanner</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;

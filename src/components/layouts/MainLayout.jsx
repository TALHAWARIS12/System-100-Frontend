import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import {
  HomeIcon,
  MagnifyingGlassIcon,
  SignalIcon,
  CalculatorIcon,
  CreditCardIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ServerIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const MainLayout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasActiveSubscription } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, show: true },
    { name: 'Scanner', href: '/scanner', icon: MagnifyingGlassIcon, show: hasActiveSubscription() },
    { name: 'Trades', href: '/trades', icon: SignalIcon, show: hasActiveSubscription() },
    { name: 'Performance', href: '/performance', icon: ChartBarIcon, show: hasActiveSubscription() },
    { name: 'Calculators', href: '/calculators', icon: CalculatorIcon, show: hasActiveSubscription() },
    { name: 'Subscription', href: '/subscription', icon: CreditCardIcon, show: user?.role === 'client' }
  ];

  const educatorNav = [
    { name: 'Educator Dashboard', href: '/educator/dashboard', icon: ChartBarIcon },
    { name: 'Manage Trades', href: '/educator/trades', icon: SignalIcon }
  ];

  const adminNav = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: ChartBarIcon },
    { name: 'User Management', href: '/admin/users', icon: UsersIcon },
    { name: 'Scanner Config', href: '/admin/scanner', icon: Cog6ToothIcon },
    { name: 'Data Sources', href: '/admin/data-sources', icon: ServerIcon }
  ];

  return (
    <div className="min-h-screen bg-dark-900 relative">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 -right-4 w-96 h-96 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-16 bg-dark-800/95 backdrop-blur-sm border-b border-primary-500/20">
        <h1 className="text-xl font-black text-primary-400 uppercase tracking-wider glow-text">Trading Platform</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-primary-400 hover:text-primary-300 hover:bg-primary-500/10 rounded-lg transition-all"
        >
          {sidebarOpen ? (
            <XMarkIcon className="w-6 h-6" />
          ) : (
            <Bars3Icon className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-dark-800/95 to-dark-900/95 backdrop-blur-sm border-r border-primary-500/20 transform transition-transform duration-200 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full relative">
          {/* Glow effect at top */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-primary-500/10 to-transparent pointer-events-none"></div>
          
          {/* Logo */}
          <div className="hidden lg:flex items-center justify-center h-16 px-4 border-b border-primary-500/20 relative">
            <div className="absolute inset-0 bg-primary-500/5"></div>
            <h1 className="text-xl font-black text-primary-400 uppercase tracking-wider glow-text relative z-10">Trading Platform</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto mt-16 lg:mt-0 relative z-10">
            {/* Main Navigation */}
            <div className="space-y-1">
              {navigation.filter(item => item.show).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="group flex items-center px-4 py-3 text-sm font-bold text-gray-400 rounded-lg hover:bg-primary-500/10 hover:text-primary-300 transition-all hover:translate-x-1 border border-transparent hover:border-primary-500/30"
                >
                  <item.icon className="w-5 h-5 mr-3 group-hover:text-primary-400 transition-colors" />
                  <span className="uppercase tracking-wide">{item.name}</span>
                </Link>
              ))}
            </div>

            {/* Educator Navigation */}
            {(user?.role === 'educator' || user?.role === 'admin') && (
              <div className="pt-6 mt-6 border-t border-primary-500/20">
                <p className="px-4 text-xs font-black text-primary-400/60 uppercase tracking-widest mb-3">
                  Educator
                </p>
                {educatorNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="group flex items-center px-4 py-3 text-sm font-bold text-gray-400 rounded-lg hover:bg-green-500/10 hover:text-green-300 transition-all hover:translate-x-1 border border-transparent hover:border-green-500/30"
                  >
                    <item.icon className="w-5 h-5 mr-3 group-hover:text-green-400 transition-colors" />
                    <span className="uppercase tracking-wide">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Admin Navigation */}
            {user?.role === 'admin' && (
              <div className="pt-6 mt-6 border-t border-primary-500/20">
                <p className="px-4 text-xs font-black text-yellow-400/60 uppercase tracking-widest mb-3">
                  Admin
                </p>
                {adminNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="group flex items-center px-4 py-3 text-sm font-bold text-gray-400 rounded-lg hover:bg-yellow-500/10 hover:text-yellow-300 transition-all hover:translate-x-1 border border-transparent hover:border-yellow-500/30"
                  >
                    <item.icon className="w-5 h-5 mr-3 group-hover:text-yellow-400 transition-colors" />
                    <span className="uppercase tracking-wide">{item.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-primary-500/20 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>
            <div className="flex items-center mb-3 p-2 rounded-lg bg-primary-500/5 border border-primary-500/10">
              <div className="relative">
                <UserCircleIcon className="w-10 h-10 text-primary-400" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-dark-800 pulse-glow"></div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate uppercase tracking-wide">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-primary-400/70 truncate font-semibold">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-black text-red-400 rounded-lg hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30 uppercase tracking-wide group"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 group-hover:text-red-300 transition-colors" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 pt-16 lg:pt-0 relative z-10">
        <main className="min-h-screen p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

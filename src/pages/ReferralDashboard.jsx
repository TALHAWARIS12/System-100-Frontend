import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const ReferralDashboard = () => {
  const { user } = useAuthStore();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/referrals/dashboard');
      setDashboard(res.data);
    } catch (err) {
      console.error('Referral fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralLink = dashboard?.referralLink || `${window.location.origin}/register?ref=${user?.referralCode || ''}`;

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  const stats = dashboard?.stats || {};
  const referrals = dashboard?.referrals || [];

  return (
    <div className="slide-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-white uppercase tracking-wider">Referral Program</h1>
          <p className="text-gray-400 mt-1">Earn 20% commission on every referral's subscription</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="card p-6 mb-6 border-primary-500/30 bg-gradient-to-r from-primary-500/5 to-blue-500/5">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Your Referral Link</h3>
        <div className="flex gap-2">
          <input
            type="text"
            readOnly
            value={referralLink}
            className="input flex-1 text-sm font-mono"
          />
          <button onClick={copyLink} className={`btn ${copied ? 'btn-primary' : 'btn-ghost'} px-6 min-w-[100px]`}>
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2">Share this link with fellow traders to earn commission</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Referrals</p>
          <p className="text-3xl font-black text-white">{stats.totalReferrals || 0}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Active Subs</p>
          <p className="text-3xl font-black text-green-400">{stats.activeReferrals || 0}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Total Earned</p>
          <p className="text-3xl font-black text-primary-400">${(stats.totalCommission || 0).toFixed(2)}</p>
        </div>
        <div className="card p-5 text-center">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Link Clicks</p>
          <p className="text-3xl font-black text-yellow-400">{stats.totalClicks || 0}</p>
        </div>
      </div>

      {/* How it Works */}
      <div className="card p-6 mb-6">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary-500/10 border border-primary-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-primary-400 font-black">1</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Share Your Link</p>
              <p className="text-xs text-gray-500 mt-1">Share your unique referral link with traders</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-green-400 font-black">2</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">They Subscribe</p>
              <p className="text-xs text-gray-500 mt-1">When they sign up and subscribe to any plan</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-400 font-black">3</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">Earn 20%</p>
              <p className="text-xs text-gray-500 mt-1">You earn 20% commission on their subscription fee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral List */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-primary-500/10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Your Referrals</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-primary-500/10">
                <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">User</th>
                <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Commission</th>
                <th className="text-left p-4 text-gray-500 font-bold text-[10px] uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody>
              {referrals.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-600">
                    <span className="text-3xl block mb-2">🔗</span>
                    No referrals yet. Share your link to start earning!
                  </td>
                </tr>
              ) : (
                referrals.map((ref, i) => (
                  <tr key={i} className="border-b border-primary-500/5 hover:bg-primary-500/5 transition-colors">
                    <td className="p-4 text-white font-bold">
                      {ref.referred?.firstName} {ref.referred?.lastName}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                        ref.status === 'active' ? 'bg-green-500/10 text-green-400' :
                        ref.status === 'converted' ? 'bg-primary-500/10 text-primary-400' :
                        'bg-gray-500/10 text-gray-400'
                      }`}>
                        {ref.status}
                      </span>
                    </td>
                    <td className="p-4 text-primary-400 font-bold">
                      ${(ref.totalCommission || 0).toFixed(2)}
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReferralDashboard;

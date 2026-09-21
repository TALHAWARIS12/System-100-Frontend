import React from 'react';
import useAuthStore from '../store/authStore';

const UnlimitedBadge = ({ onClick }) => {
  const { user, isUnlimitedTier } = useAuthStore();
  const isUnlimited = isUnlimitedTier();

  if (isUnlimited) {
    return (
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-500/40 rounded-full text-amber-300 text-xs font-bold shadow-lg shadow-amber-500/10 tracking-wide uppercase">
        <span className="animate-pulse text-amber-400">⚡</span>
        <span>Unlimited Tier</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/40 rounded-full text-cyan-300 hover:text-cyan-200 text-xs font-semibold shadow-md transition"
    >
      <span>🚀 Upgrade to Unlimited</span>
    </button>
  );
};

export default UnlimitedBadge;

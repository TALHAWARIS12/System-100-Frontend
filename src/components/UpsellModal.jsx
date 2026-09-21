import React from 'react';
import { useNavigate } from 'react-router-dom';

const UpsellModal = ({ isOpen, onClose, featureName = 'Unlimited Access' }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-amber-500/30 rounded-2xl p-8 shadow-2xl space-y-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-lg"
        >
          ✕
        </button>

        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/20">
            ⚡
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            Unlock <span className="text-amber-400">UNLIMITED</span> Tier
          </h2>
          <p className="text-slate-400 text-sm">
            {featureName} is reserved for Unlimited Tier subscribers. Upgrade now to gain full access to all flagship trading engines.
          </p>
        </div>

        <div className="bg-slate-950/60 rounded-xl p-5 border border-slate-800 space-y-3 text-sm">
          <div className="flex items-center space-x-3 text-slate-200">
            <span className="text-amber-400 font-bold">✓</span>
            <span>Dedicated Gold Scanner Engine (XAU/USD)</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-200">
            <span className="text-amber-400 font-bold">✓</span>
            <span>Multi-Asset Hub (Forex, BTC, ETH, SOL, XRP, Indices)</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-200">
            <span className="text-amber-400 font-bold">✓</span>
            <span>15-Minute, 1-Hour & 4-Hour Timeframe Analysis</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-200">
            <span className="text-amber-400 font-bold">✓</span>
            <span>Educator Multi-TP Trade Plans (TP1, TP2, TP3)</span>
          </div>
          <div className="flex items-center space-x-3 text-slate-200">
            <span className="text-amber-400 font-bold">✓</span>
            <span>Real-time WebSocket Data & 75%+ Confidence Filter</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => {
              onClose();
              navigate('/subscription');
            }}
            className="flex-1 py-3.5 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 transition"
          >
            Go Unlimited Now →
          </button>
          <button
            onClick={onClose}
            className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsellModal;

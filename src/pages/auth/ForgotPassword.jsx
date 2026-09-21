import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      setMessage(res.data.message || 'Password reset link sent if an account exists.');
      toast.success('Reset link dispatched!');
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to send reset link';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
          🔐
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Forgot Password</h2>
        <p className="text-slate-400 text-sm mt-2">
          Enter your registered email address to receive secure recovery instructions.
        </p>
      </div>

      {submitted ? (
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-6 text-center space-y-4">
          <div className="text-4xl">📧</div>
          <h3 className="text-lg font-bold text-emerald-400">Check Your Email</h3>
          <p className="text-slate-300 text-sm">{message}</p>
          <p className="text-slate-400 text-xs">
            The reset link expires in 30 minutes. If you don't see it, check your spam or junk folder.
          </p>
          <div className="pt-2">
            <Link
              to="/login"
              className="inline-block w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition"
            >
              Return to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@goldcirclecapital.com"
              required
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg shadow-lg shadow-amber-500/20 disabled:opacity-50 transition duration-200 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>Send Reset Instructions</span>
            )}
          </button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-sm text-amber-400 hover:text-amber-300 font-medium">
              ← Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { CheckCircleIcon, XCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';

const Subscription = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasActiveSubscription } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast.error('Please login to manage subscriptions');
      navigate('/login');
      return;
    }
    fetchSubscriptionStatus();
  }, [isAuthenticated, navigate]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/subscriptions/status');
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/subscriptions/create-checkout');
      if (response.data.url) {
        window.location.href = response.data.url;
      } else {
        toast.error('Failed to get checkout session');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.message || 'Failed to create checkout session');
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await api.post('/subscriptions/create-portal');
      window.location.href = response.data.url;
    } catch (error) {
      toast.error('Failed to open billing portal');
      setLoading(false);
    }
  };

  const hasAccess = hasActiveSubscription();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Subscription</h1>
        <p className="text-gray-400">Manage your platform subscription</p>
      </div>

      {/* Current Status */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Current Status</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {hasAccess ? (
              <>
                <CheckCircleIcon className="w-12 h-12 text-green-500 mr-4" />
                <div>
                  <p className="text-lg font-semibold text-white">Active Subscription</p>
                  <p className="text-sm text-gray-400">
                    {subscription?.endDate && `Renews on ${new Date(subscription.endDate).toLocaleDateString()}`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <XCircleIcon className="w-12 h-12 text-red-500 mr-4" />
                <div>
                  <p className="text-lg font-semibold text-white">No Active Subscription</p>
                  <p className="text-sm text-gray-400">Subscribe to access all features</p>
                </div>
              </>
            )}
          </div>
          {hasAccess && (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="btn btn-secondary"
            >
              Manage Subscription
            </button>
          )}
        </div>
      </div>

      {/* Subscription Plan */}
      {!hasAccess && (
        <div className="card p-8">
          <div className="text-center mb-8">
            <CreditCardIcon className="w-16 h-16 text-primary-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Premium Access</h2>
            <p className="text-gray-400">Get full access to all platform features</p>
          </div>

          <div className="bg-dark-700 rounded-lg p-8 mb-8">
            <div className="text-center mb-6">
              <p className="text-5xl font-bold text-white mb-2">
                $49<span className="text-2xl text-gray-400">/month</span>
              </p>
              <p className="text-gray-400">Billed monthly, cancel anytime</p>
            </div>

            <div className="space-y-3 mb-8">
              {[
                'Real-time market scanner signals',
                'Professional trade signals from educators',
                'Access to all trading calculators',
                'Live TradingView charts',
                'Email notifications for new signals',
                'Priority support',
                'Cancel anytime'
              ].map((feature, index) => (
                <div key={index} className="flex items-center">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleSubscribe}
              disabled={loading}
              className="w-full btn btn-primary text-lg py-4"
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500">
            Secure payment processing by Stripe. Your subscription will automatically renew monthly.
          </p>
        </div>
      )}

      {/* Features Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-primary-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-6 h-6 text-primary-500" />
          </div>
          <h3 className="font-semibold text-white mb-2">Market Scanner</h3>
          <p className="text-sm text-gray-400">
            Automated technical analysis across multiple currency pairs and timeframes
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="font-semibold text-white mb-2">Trade Signals</h3>
          <p className="text-sm text-gray-400">
            Expert trade ideas with entry, stop loss, and take profit levels
          </p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-12 h-12 bg-yellow-900 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircleIcon className="w-6 h-6 text-yellow-500" />
          </div>
          <h3 className="font-semibold text-white mb-2">Calculators</h3>
          <p className="text-sm text-gray-400">
            Professional tools for pip calculation, risk management, and P/L analysis
          </p>
        </div>
      </div>
    </div>
  );
};

export default Subscription;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const subscriptionPlans = [
  {
    id: 'gold-circle-monthly',
    name: 'Gold Circle Monthly Subscription',
    price: 200.77,
    currency: '£',
    period: 'month',
    setupFee: null,
    monthlyFee: 200.77,
    description: 'Perfect for traders starting their journey',
    features: [
      'Real-time market scanner trade ideas',
      'Professional trade ideas from educators',
      'Access to all trading calculators',
      'Live TradingView charts',
      'Email notifications for new trade ideas',
      '12 week beginners course',
      'Priority support',
      'Cancel anytime'
    ],
    popular: true,
    badge: null
  },
  {
    id: 'gold-circle-plus-10k',
    name: 'Gold Circle PLUS & 10k Assimilation Account',
    price: 599.00,
    currency: '£',
    period: 'one-time',
    setupFee: 599,
    monthlyFee: 249,
    description: 'Complete package with funded account access',
    features: [
      'Everything in Gold Circle Monthly',
      '10k Assimilation Account included',
      'No evaluation test required',
      'Direct funded account access',
      'Advanced trading tools',
      'Additional trade ideas',
      'Personal account manager',
      'Breakfast club 3 times a week'
    ],
    popular: false,
    badge: 'No Test'
  },
  {
    id: 'gold-circle-10k',
    name: 'Gold Circle & 10k Assimilation Account',
    price: 350.77,
    currency: '£',
    period: 'one-time',
    setupFee: 350,
    monthlyFee: 124.77,
    description: 'Great value funded account package',
    features: [
      'Everything in Gold Circle Monthly',
      '10k Assimilation Account included',
      'No evaluation test required',
      'Direct funded account access',
      'Standard trading tools',
      'Community support access',
      'Weekly trading insights'
    ],
    popular: false,
    badge: 'No Test'
  }
];

const Subscription = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, hasActiveSubscription } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('gold-circle-monthly');
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

  const handleSubscribe = async (planId) => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/subscriptions/create-checkout', { planId });
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
    <div className="max-w-6xl mx-auto px-4">
      {/* Header with Gold Theme */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 mb-6 shadow-lg shadow-yellow-500/30">
          <SparklesIcon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
          Gold Circle Membership
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Unlock premium trading tools, trade ideas, and funded account opportunities
        </p>
      </div>

      {/* Current Status */}
      <div className="gold-card p-6 mb-10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <StarIcon className="w-6 h-6 text-yellow-400 mr-2" />
          Current Status
        </h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            {hasAccess ? (
              <>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mr-4 shadow-lg shadow-green-500/30">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">Active Gold Membership</p>
                  <p className="text-sm text-gray-400">
                    {subscription?.endDate && `Renews on ${new Date(subscription.endDate).toLocaleDateString()}`}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-500 to-gray-700 flex items-center justify-center mr-4">
                  <XCircleIcon className="w-8 h-8 text-gray-300" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">No Active Membership</p>
                  <p className="text-sm text-gray-400">Choose a Gold Circle plan below to get started</p>
                </div>
              </>
            )}
          </div>
          {hasAccess && (
            <button
              onClick={handleManageSubscription}
              disabled={loading}
              className="btn-gold-secondary"
            >
              Manage Subscription
            </button>
          )}
        </div>
      </div>

      {/* Subscription Plans */}
      {!hasAccess && (
        <>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
            <p className="text-gray-400">Select the membership that fits your trading goals</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`gold-plan-card cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id 
                    ? 'ring-2 ring-yellow-400 shadow-xl shadow-yellow-500/20 scale-[1.02]' 
                    : 'hover:shadow-lg hover:shadow-yellow-500/10'
                } ${plan.popular ? 'lg:-mt-4 lg:mb-4' : ''}`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-dark-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* No Test Badge */}
                {plan.badge && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-emerald-400 to-green-500 text-dark-900 text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {/* Selection Indicator */}
                <div className={`absolute top-4 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  selectedPlan === plan.id 
                    ? 'border-yellow-400 bg-yellow-400' 
                    : 'border-gray-500'
                }`}>
                  {selectedPlan === plan.id && (
                    <CheckIcon className="w-4 h-4 text-dark-900" />
                  )}
                </div>

                <div className="pt-8 pb-6 px-6">
                  {/* Plan Name */}
                  <h3 className="text-lg font-bold text-white mb-2 pr-16">{plan.name}</h3>
                  <p className="text-sm text-gray-400 mb-6">{plan.description}</p>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold bg-gradient-to-r from-yellow-300 to-amber-400 bg-clip-text text-transparent">
                        {plan.currency}{plan.price.toFixed(2)}
                      </span>
                      {plan.period === 'month' && (
                        <span className="text-gray-400 ml-2">/month</span>
                      )}
                    </div>
                    {plan.setupFee && (
                      <div className="mt-2 text-sm text-gray-400">
                        <span>Set up fee: {plan.currency}{plan.setupFee}</span>
                        <span className="mx-2">•</span>
                        <span>{plan.currency}{plan.monthlyFee}/month</span>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          <CheckIcon className="w-3 h-3 text-dark-900" />
                        </div>
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Subscribe Button */}
          <div className="text-center mb-8">
            <button
              onClick={() => handleSubscribe(selectedPlan)}
              disabled={loading}
              className="btn-gold text-lg px-12 py-4"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-dark-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5 inline mr-2" />
                  Subscribe Now
                </>
              )}
            </button>
            <p className="mt-4 text-sm text-gray-500">
              Secure payment processing by Stripe. Your subscription will automatically renew.
            </p>
          </div>
        </>
      )}

      {/* Features Overview */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold text-white text-center mb-8">What's Included</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="gold-feature-card p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
              <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Market Scanner</h3>
            <p className="text-sm text-gray-400">
              Automated technical analysis across multiple currency pairs and timeframes
            </p>
          </div>

          <div className="gold-feature-card p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
              <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Trade Ideas</h3>
            <p className="text-sm text-gray-400">
              Expert trade ideas with entry, stop loss, and take profit levels
            </p>
          </div>

          <div className="gold-feature-card p-6 text-center">
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-yellow-500/30">
              <svg className="w-7 h-7 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">Calculators</h3>
            <p className="text-sm text-gray-400">
              Professional tools for pip calculation, risk management, and P/L analysis
            </p>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center items-center gap-6 py-8 border-t border-yellow-500/10">
        <div className="flex items-center text-gray-400 text-sm">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Secure Payments
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Money Back Guarantee
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          24/7 Support
        </div>
      </div>
    </div>
  );
};

export default Subscription;

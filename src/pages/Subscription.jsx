import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const Subscription = () => {
  const navigate = useNavigate();
  const { user, hasActiveSubscription } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('gold-circle');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptionStatus();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/subscriptions/plans');
      setPlans(res.data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setPlansLoading(false);
    }
  };

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await api.get('/subscriptions/status');
      setSubscription(response.data.subscription);
    } catch (error) {
      console.error('Failed to fetch subscription status:', error);
    }
  };

  const handleSubscribe = async (planId) => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const response = await api.post('/subscriptions/create-portal');
      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to open billing portal');
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = hasActiveSubscription();
  const currentTier = user?.subscriptionTier || subscription?.tier || 'none';

  if (plansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 mb-6 shadow-lg shadow-yellow-500/30">
          <SparklesIcon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
          Gold Circle Membership
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Join the Gold Circle and unlock your full trading potential
        </p>
      </div>

      {/* Current Status */}
      <div className="card p-6 mb-10 border border-yellow-500/10">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          <StarIcon className="w-6 h-6 text-yellow-400 mr-2" />
          Current Status
        </h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            {hasAccess ? (
              <>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mr-4 shadow-lg shadow-yellow-500/20">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    Active <span className="text-yellow-400">Gold Circle</span> Membership
                  </p>
                  <p className="text-sm text-gray-400">
                    {subscription?.endDate && `Renews on ${new Date(subscription.endDate).toLocaleDateString('en-GB')}`}
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
                  <p className="text-sm text-gray-400">Choose a plan below to join the Gold Circle</p>
                </div>
              </>
            )}
          </div>
          {hasAccess && (
            <button onClick={handleManageSubscription} disabled={loading} className="btn btn-ghost border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10">
              Manage Subscription
            </button>
          )}
        </div>
      </div>

      {/* Plans Grid */}
      {!hasAccess && plans.length > 0 && (
        <>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Choose Your Gold Circle Plan</h2>
            <p className="text-gray-400">All plans include full platform access &bull; USD pricing &bull; Cancel anytime</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.planId;
              const monthly = plan.monthlyPrice ?? plan.price ?? 0;
              const setup = plan.setupFee ?? 0;
              const isSetupPlan = setup > 0;

              return (
                <div
                  key={plan.planId}
                  onClick={() => setSelectedPlan(plan.planId)}
                  className={`relative card cursor-pointer transition-all duration-300 overflow-visible border ${
                    isSelected
                      ? 'ring-2 ring-yellow-400 shadow-xl shadow-yellow-500/20 scale-[1.02] border-yellow-500/40'
                      : 'border-primary-500/10 hover:border-yellow-500/20 hover:shadow-lg'
                  }`}
                >
                  {/* Popular badge */}
                  {plan.planId === 'gold-circle' && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-dark-900 text-xs font-bold px-4 py-1.5 rounded-full shadow-lg uppercase tracking-wider">
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* No Test badge */}
                  {plan.noTest && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                        No Test
                      </span>
                    </div>
                  )}

                  {/* Selection indicator */}
                  <div className={`absolute top-4 left-4 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    isSelected ? 'border-yellow-400 bg-yellow-500' : 'border-gray-600'
                  }`}>
                    {isSelected && <CheckIcon className="w-4 h-4 text-dark-900" />}
                  </div>

                  <div className="p-6 pt-8">
                    {/* Plan icon */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/20">
                      <SparklesIcon className="w-6 h-6 text-white" />
                    </div>

                    <h3 className="text-lg font-bold text-yellow-400 mb-1 pr-16">{plan.name}</h3>
                    <p className="text-sm text-gray-500 mb-5">{plan.description}</p>

                    {/* Pricing */}
                    <div className="mb-6">
                      {isSetupPlan ? (
                        <>
                          {/* Setup fee */}
                          <div className="flex items-baseline mb-1">
                            <span className="text-sm text-gray-400 mr-1">$</span>
                            <span className="text-3xl font-black text-white">{Number(setup).toFixed(2)}</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">One-off setup fee</p>
                          {/* Then monthly */}
                          <div className="flex items-baseline border-t border-primary-500/10 pt-3">
                            <span className="text-sm text-yellow-400 mr-1">then $</span>
                            <span className="text-xl font-bold text-yellow-400">{Number(monthly).toFixed(2)}</span>
                            <span className="text-gray-500 ml-1 text-sm">/month</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-baseline">
                          <span className="text-sm text-gray-400 mr-1">$</span>
                          <span className="text-4xl font-black text-yellow-400">{Number(monthly).toFixed(2)}</span>
                          <span className="text-gray-500 ml-1">/month</span>
                        </div>
                      )}
                    </div>

                    {/* Assimilation Account badge */}
                    {plan.hasAssimilationAccount && (
                      <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 rounded-lg p-3 mb-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-yellow-400 font-bold text-xs">{plan.accountSize}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-yellow-400">Assimilation Account</p>
                            <p className="text-xs text-gray-500">Funded {plan.accountSize} account included</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Features */}
                    <div className="space-y-2.5">
                      {[
                        'Multi-Pair Trade Scanner',
                        'Freedom Strategy Nehemiah 6:3 (XAUUSD)',
                        'Economic Calendar',
                        'Community Chat',
                        'Trade Journal & Analytics',
                        'Premium Educator Signals',
                        'Strategy Education',
                        'Referral Programme',
                        'Priority Support'
                      ].map((feature) => (
                        <div key={feature} className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-yellow-400 to-amber-500">
                            <CheckIcon className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-sm text-gray-300">{feature}</span>
                        </div>
                      ))}
                      {plan.hasAssimilationAccount && (
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gradient-to-br from-emerald-400 to-green-500">
                            <CheckIcon className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-sm text-emerald-400 font-medium">{plan.accountSize} Funded Account &mdash; No Test</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Subscribe CTA */}
          <div className="text-center mb-8">
            {(() => {
              const plan = plans.find(p => p.planId === selectedPlan);
              if (!plan) return null;
              const pm = plan.monthlyPrice ?? plan.price ?? 0;
              const ps = plan.setupFee ?? 0;
              const label = ps > 0
                ? `Get Started — $${Number(ps).toFixed(2)} + $${Number(pm).toFixed(2)}/mo`
                : `Subscribe — $${Number(pm).toFixed(2)}/mo`;
              return (
                <button
                  onClick={() => handleSubscribe(selectedPlan)}
                  disabled={loading}
                  className="btn btn-primary text-lg px-12 py-4 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-dark-900 font-bold rounded-xl shadow-lg shadow-yellow-500/30 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <SparklesIcon className="w-5 h-5 inline mr-2" />
                      {label}
                    </>
                  )}
                </button>
              );
            })()}
            <p className="mt-4 text-sm text-gray-500">Secure payment powered by Stripe &bull; Cancel anytime</p>
          </div>

          {/* Plan Comparison Table */}
          <div className="card p-6 mb-8 overflow-x-auto">
            <h3 className="text-lg font-bold text-white mb-6">Plan Comparison</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-primary-500/10">
                  <th className="text-left p-3 text-gray-500 font-bold text-[10px] uppercase">Feature</th>
                  {plans.map(p => (
                    <th key={p.planId} className="text-center p-3 font-bold text-[10px] uppercase text-yellow-400">{p.name.replace('Gold Circle ', '').replace('Subscription', '').trim() || 'Monthly'}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  'Multi-Pair Scanner',
                  'Freedom Strategy Nehemiah 6:3 (XAUUSD)',
                  'Economic Calendar',
                  'Community Chat',
                  'Trade Journal',
                  'Premium Signals',
                  'Strategy Education',
                  'Referral Programme',
                  'Priority Support',
                ].map((feature) => (
                  <tr key={feature} className="border-b border-primary-500/5">
                    <td className="p-3 text-gray-300">{feature}</td>
                    {plans.map(p => (
                      <td key={p.planId} className="text-center p-3">
                        <span className="text-green-400 font-bold">✓</span>
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Assimilation Account row */}
                <tr className="border-b border-primary-500/5">
                  <td className="p-3 text-emerald-400 font-medium">10k Funded Account</td>
                  {plans.map(p => (
                    <td key={p.planId} className="text-center p-3">
                      {p.hasAssimilationAccount ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-gray-600">&mdash;</span>}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-primary-500/5">
                  <td className="p-3 text-emerald-400 font-medium">No Test Required</td>
                  {plans.map(p => (
                    <td key={p.planId} className="text-center p-3">
                      {p.noTest ? <span className="text-emerald-400 font-bold">✓</span> : <span className="text-gray-600">&mdash;</span>}
                    </td>
                  ))}
                </tr>
                {/* Price rows */}
                <tr className="border-t border-primary-500/10">
                  <td className="p-3 text-gray-400 font-bold">Setup Fee</td>
                  {plans.map(p => (
                    <td key={p.planId} className="text-center p-3 font-bold text-gray-300">
                      {(p.setupFee ?? 0) > 0 ? `$${Number(p.setupFee).toFixed(2)}` : '—'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 text-gray-400 font-bold">Monthly</td>
                  {plans.map(p => (
                    <td key={p.planId} className="text-center p-3 font-bold text-yellow-400">${Number(p.monthlyPrice ?? p.price ?? 0).toFixed(2)}/mo</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Trust Badges */}
      <div className="flex flex-wrap justify-center items-center gap-6 py-8 border-t border-primary-500/10">
        <div className="flex items-center text-gray-400 text-sm">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
          Secure Payments
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
          USD Pricing
        </div>
        <div className="flex items-center text-gray-400 text-sm">
          <svg className="w-5 h-5 mr-2 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
          Cancel Anytime
        </div>
      </div>
    </div>
  );
};

export default Subscription;

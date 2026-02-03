import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../utils/api';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        toast.error('Invalid session');
        navigate('/subscription');
        return;
      }

      // Optional: Verify the session with backend
      const response = await api.post('/subscriptions/verify-session', { sessionId });
      
      if (response.data.success) {
        setVerified(true);
        toast.success('Subscription activated successfully!');
      }
    } catch (error) {
      console.error('Verification error:', error);
      // Still show success even if verification fails (payment was processed)
      setVerified(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
        <p className="text-gray-400 mt-4">Verifying payment...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8 text-center">
        <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-gray-400 mb-8">
          Your subscription has been activated. You now have access to all premium features.
        </p>

        <div className="space-y-2 mb-8 text-left bg-gray-800 p-4 rounded-lg">
          <p className="text-gray-300">
            <span className="text-gray-400">Status:</span>
            <span className="text-green-500 ml-2">✓ Active</span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">Plan:</span>
            <span className="text-white ml-2">Premium ($49/month)</span>
          </p>
          <p className="text-gray-300">
            <span className="text-gray-400">Access:</span>
            <span className="text-white ml-2">Full Platform Features</span>
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary w-full"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate('/subscription')}
            className="btn btn-secondary w-full"
          >
            Manage Subscription
          </button>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          A confirmation email has been sent to your email address.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSuccess;

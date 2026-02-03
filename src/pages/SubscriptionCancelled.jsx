import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircleIcon } from '@heroicons/react/24/outline';

const SubscriptionCancelled = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto">
      <div className="card p-8 text-center">
        <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-gray-400 mb-8">
          You cancelled the payment process. Your subscription was not activated.
        </p>

        <p className="text-sm text-gray-400 mb-8">
          You can try again at any time. All your data is safe.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/subscription')}
            className="btn btn-primary w-full"
          >
            Back to Subscription
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary w-full"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCancelled;

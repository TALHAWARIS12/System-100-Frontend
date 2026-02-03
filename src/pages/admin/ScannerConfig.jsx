import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { Cog6ToothIcon, PlayIcon } from '@heroicons/react/24/outline';

const ScannerConfig = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await api.get('/scanner/configs');
      setConfigs(response.data.configs);
    } catch (error) {
      toast.error('Failed to fetch scanner configs');
    } finally {
      setLoading(false);
    }
  };

  const toggleConfig = async (configId, isEnabled) => {
    try {
      await api.put(`/scanner/configs/${configId}`, { isEnabled: !isEnabled });
      toast.success('Config updated successfully');
      fetchConfigs();
    } catch (error) {
      toast.error('Failed to update config');
    }
  };

  const runScanner = async () => {
    try {
      await api.post('/scanner/run');
      toast.success('Scanner started successfully');
    } catch (error) {
      toast.error('Failed to start scanner');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Scanner Configuration</h1>
          <p className="text-gray-400">Manage scanner strategies and settings</p>
        </div>
        <button onClick={runScanner} className="btn btn-primary">
          <PlayIcon className="w-5 h-5 mr-2 inline" />
          Run Scanner Now
        </button>
      </div>

      <div className="space-y-6">
        {configs.map((config) => (
          <div key={config.id} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">{config.strategyName}</h3>
                {config.description && (
                  <p className="text-gray-400 mb-4">{config.description}</p>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Timeframes</p>
                    <div className="flex flex-wrap gap-1">
                      {config.timeframes.map((tf) => (
                        <span key={tf} className="badge badge-blue text-xs">
                          {tf}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Pairs</p>
                    <div className="flex flex-wrap gap-1">
                      {config.pairs.slice(0, 3).map((pair) => (
                        <span key={pair} className="badge badge-green text-xs">
                          {pair}
                        </span>
                      ))}
                      {config.pairs.length > 3 && (
                        <span className="badge text-xs">+{config.pairs.length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Scan Interval</p>
                    <p className="text-sm text-white">{config.scanInterval} minutes</p>
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <button
                  onClick={() => toggleConfig(config.id, config.isEnabled)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    config.isEnabled
                      ? 'bg-green-900 text-green-300 hover:bg-green-800'
                      : 'bg-red-900 text-red-300 hover:bg-red-800'
                  }`}
                >
                  {config.isEnabled ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-dark-700">
              <p className="text-xs text-gray-500">
                Last updated: {new Date(config.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {configs.length === 0 && (
        <div className="card p-12 text-center">
          <Cog6ToothIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Configurations Found</h3>
          <p className="text-gray-400">Scanner configurations will appear here</p>
        </div>
      )}
    </div>
  );
};

export default ScannerConfig;

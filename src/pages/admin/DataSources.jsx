import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { ServerIcon, PlusIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

const DataSources = () => {
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [testing, setTesting] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    provider: 'alphavantage',
    baseUrl: '',
    apiKey: '',
    rateLimit: 500,
    configuration: '{}'
  });

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const response = await api.get('/data-sources');
      setSources(response.data.sources);
    } catch (error) {
      toast.error('Failed to fetch data sources');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let config = {};
      try {
        config = JSON.parse(formData.configuration);
      } catch (err) {
        toast.error('Invalid JSON in configuration');
        return;
      }

      await api.post('/data-sources', {
        ...formData,
        configuration: config
      });

      toast.success('Data source added successfully');
      setShowModal(false);
      setFormData({
        name: '',
        provider: 'alphavantage',
        baseUrl: '',
        apiKey: '',
        rateLimit: 500,
        configuration: '{}'
      });
      fetchSources();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add data source');
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await api.put(`/data-sources/${id}`, {
        isActive: !currentStatus
      });
      toast.success(`Data source ${!currentStatus ? 'activated' : 'deactivated'}`);
      fetchSources();
    } catch (error) {
      toast.error('Failed to update data source');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this data source?')) return;

    try {
      await api.delete(`/data-sources/${id}`);
      toast.success('Data source deleted');
      fetchSources();
    } catch (error) {
      toast.error('Failed to delete data source');
    }
  };

  const handleTest = async (id) => {
    setTesting(prev => ({ ...prev, [id]: true }));
    try {
      const response = await api.post(`/data-sources/${id}/test`);
      if (response.data.success) {
        toast.success(`✅ Connection successful (${response.data.latency})`);
      } else {
        toast.error(`❌ ${response.data.error}`);
      }
    } catch (error) {
      toast.error('Test failed');
    } finally {
      setTesting(prev => ({ ...prev, [id]: false }));
    }
  };

  const providerTemplates = {
    alphavantage: {
      baseUrl: 'https://www.alphavantage.co',
      description: 'Free tier: 25 calls/day (demo key), 500 calls/day (free API key)'
    },
    twelvedata: {
      baseUrl: 'https://api.twelvedata.com',
      description: 'Free tier: 800 calls/day'
    },
    polygon: {
      baseUrl: 'https://api.polygon.io',
      description: 'Paid service'
    },
    finnhub: {
      baseUrl: 'https://finnhub.io/api/v1',
      description: 'Free tier: 60 calls/minute'
    },
    custom: {
      baseUrl: '',
      description: 'Your own API endpoint'
    }
  };

  const handleProviderChange = (provider) => {
    setFormData(prev => ({
      ...prev,
      provider,
      baseUrl: providerTemplates[provider].baseUrl
    }));
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Market Data Sources</h1>
          <p className="text-gray-400">Configure API providers for real-time market data</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <PlusIcon className="w-5 h-5 mr-2 inline" />
          Add Data Source
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : sources.length === 0 ? (
        <div className="card p-12 text-center">
          <ServerIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Data Sources Configured</h3>
          <p className="text-gray-400 mb-6">Add a data source to start fetching real market data</p>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            Add First Data Source
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sources.map((source) => (
            <div key={source.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-white">{source.name}</h3>
                    <span className={`badge ${source.isActive ? 'badge-success' : 'badge-secondary'}`}>
                      {source.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="badge badge-info capitalize">{source.provider}</span>
                    <span className="text-sm text-gray-400">Priority: {source.priority}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-400">Base URL</p>
                      <p className="text-white font-mono text-sm">{source.baseUrl}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Rate Limit</p>
                      <p className="text-white">{source.usageCount} / {source.rateLimit} calls</p>
                      <div className="w-full bg-dark-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${(source.usageCount / source.rateLimit) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Used</p>
                      <p className="text-white text-sm">
                        {source.lastUsed ? new Date(source.lastUsed).toLocaleString() : 'Never'}
                      </p>
                    </div>
                  </div>

                  {source.lastError && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded">
                      <p className="text-sm text-red-400">
                        <strong>Last Error:</strong> {source.lastError}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleTest(source.id)}
                    disabled={testing[source.id]}
                    className="btn btn-secondary text-sm"
                  >
                    {testing[source.id] ? 'Testing...' : 'Test Connection'}
                  </button>
                  <button
                    onClick={() => handleToggle(source.id, source.isActive)}
                    className={`btn text-sm ${source.isActive ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {source.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDelete(source.id)}
                    className="btn btn-danger text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Data Source Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Add Market Data Source</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Source Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="e.g., Alpha Vantage Primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Provider Type
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="input"
                >
                  {Object.entries(providerTemplates).map(([key, value]) => (
                    <option key={key} value={key}>
                      {key.charAt(0).toUpperCase() + key.slice(1)} - {value.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base URL
                </label>
                <input
                  type="url"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  className="input"
                  placeholder="https://api.example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="input"
                  placeholder="Your API key"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Leave empty if the API doesn't require authentication
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rate Limit (calls per day)
                </label>
                <input
                  type="number"
                  value={formData.rateLimit}
                  onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                  className="input"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Configuration (JSON)
                </label>
                <textarea
                  value={formData.configuration}
                  onChange={(e) => setFormData({ ...formData, configuration: e.target.value })}
                  className="input font-mono text-sm"
                  rows="3"
                  placeholder='{"customHeader": "value"}'
                />
                <p className="text-xs text-gray-400 mt-1">
                  Optional: Additional headers or parameters as JSON
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn btn-primary flex-1">
                  Add Data Source
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSources;

import React, { useEffect, useState, useMemo } from 'react';
import api from '../../utils/api';
import { toast } from 'react-hot-toast';
import { 
  UsersIcon, 
  PlusIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  ArrowPathIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ total: 0, inactive: 0, pending: 0, approved: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newEducator, setNewEducator] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  // Filtering & Search
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'inactive', 'active', 'pending', 'suspended'
  const [searchQuery, setSearchQuery] = useState('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Single Delete Confirmation Modal
  const [userToDelete, setUserToDelete] = useState(null);
  const [singleDeleting, setSingleDeleting] = useState(false);

  // Bulk Delete Confirmation Modal
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  const fetchUsers = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const params = { limit: 500 };
      if (activeTab === 'inactive') params.filter = 'inactive';
      if (activeTab === 'active') params.filter = 'active';
      if (activeTab === 'pending') params.filter = 'pending';
      if (activeTab === 'suspended') params.memberStatus = 'suspended';

      const response = await api.get('/users', { params });
      setUsers(response.data.users || []);
      if (response.data.counts) {
        setCounts(response.data.counts);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Client-side search filtering
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter((u) => {
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
      const email = (u.email || '').toLowerCase();
      const role = (u.role || '').toLowerCase();
      return fullName.includes(q) || email.includes(q) || role.includes(q);
    });
  }, [users, searchQuery]);

  // Handle single delete
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setSingleDeleting(true);
    try {
      const res = await api.delete(`/users/${userToDelete.id}`);
      toast.success(res.data.message || `User ${userToDelete.email} deleted successfully`);
      setUserToDelete(null);
      // Remove from selected list if present
      setSelectedIds((prev) => prev.filter((id) => id !== userToDelete.id));
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setSingleDeleting(false);
    }
  };

  // Handle bulk delete
  const confirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkDeleting(true);
    try {
      const res = await api.post('/users/bulk-delete', { userIds: selectedIds });
      toast.success(res.data.message || `Deleted ${selectedIds.length} users successfully`);
      setSelectedIds([]);
      setShowBulkConfirm(false);
      await fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete selected users');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const visibleIds = filteredUsers.map((u) => u.id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    } else {
      const visibleIdsSet = new Set(filteredUsers.map((u) => u.id));
      setSelectedIds((prev) => prev.filter((id) => !visibleIdsSet.has(id)));
    }
  };

  const toggleSelectUser = (userId) => {
    setSelectedIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const createEducator = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/educator', newEducator);
      toast.success('Educator created successfully');
      setShowModal(false);
      setNewEducator({ email: '', password: '', firstName: '', lastName: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create educator');
    }
  };

  const handleMemberStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/admin/users/${userId}/member-status`, { memberStatus: newStatus });
      toast.success(`Member status updated to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update member status');
    }
  };

  const handleConciergeReset = async (userId, userEmail) => {
    if (!confirm(`Trigger Concierge Password Reset for ${userEmail}? A secure recovery email will be sent.`)) return;

    try {
      const res = await api.post(`/admin/users/${userId}/reset-password`);
      toast.success(res.data.message || 'Concierge reset triggered');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to trigger reset');
    }
  };

  const getMemberStatusBadge = (status = 'pending') => {
    const badges = {
      approved: 'bg-emerald-950 text-emerald-300 border border-emerald-500/30',
      active: 'bg-emerald-950 text-emerald-300 border border-emerald-500/30',
      pending: 'bg-amber-950 text-amber-300 border border-amber-500/30',
      suspended: 'bg-orange-950 text-orange-300 border border-orange-500/30',
      revoked: 'bg-rose-950 text-rose-300 border border-rose-500/30'
    };
    return badges[status] || 'bg-gray-800 text-gray-300';
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'badge bg-purple-900 text-purple-300',
      educator: 'badge bg-blue-900 text-blue-300',
      client: 'badge bg-gray-700 text-gray-300'
    };
    return badges[role] || 'badge';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: 'badge badge-green',
      inactive: 'badge badge-red',
      cancelled: 'badge badge-yellow',
      past_due: 'badge badge-yellow'
    };
    return badges[status] || 'badge';
  };

  const isAllVisibleSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => selectedIds.includes(u.id));

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">User Management & Access Control</h1>
          <p className="text-gray-400 text-sm">
            Manage member accounts, authorization lists, cleanup inactive users, and concierge password recovery.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchUsers(true)}
            className="btn btn-secondary flex items-center gap-2 text-sm"
            disabled={refreshing}
            title="Refresh Users"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2 text-sm">
            <PlusIcon className="w-4 h-4 inline" />
            Add Educator
          </button>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="card p-4 mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'all'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              All Users ({counts.total || users.length})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'inactive'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-500/20 hover:bg-rose-950/70'
              }`}
            >
              <span>Inactive / None</span>
              <span className="px-1.5 py-0.2 bg-rose-900/60 text-white text-[10px] rounded-full">
                {counts.inactive || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'active'
                  ? 'bg-emerald-500 text-black shadow-md'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              <span>Active Subscriptions</span>
              <span className="px-1.5 py-0.2 bg-dark-800 text-gray-300 text-[10px] rounded-full">
                {counts.approved || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                activeTab === 'pending'
                  ? 'bg-amber-500 text-black shadow-md'
                  : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
              }`}
            >
              <span>Pending Approval</span>
              <span className="px-1.5 py-0.2 bg-dark-800 text-gray-300 text-[10px] rounded-full">
                {counts.pending || 0}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by email, name..."
              className="input pl-9 pr-8 py-1.5 text-xs w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bulk Action Bar (When users are selected) */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300">{selectedIds.length} user(s) selected</span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-gray-400 hover:text-white underline text-xs ml-2"
              >
                Deselect All
              </button>
            </div>
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg flex items-center gap-1.5 shadow transition"
            >
              <TrashIcon className="w-4 h-4 inline" />
              Delete Selected ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-700">
              <tr>
                <th className="px-4 py-3 text-left w-10">
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={handleSelectAll}
                    className="rounded border-gray-600 text-amber-500 focus:ring-amber-500/30 bg-dark-800 cursor-pointer"
                    title="Select / Deselect all visible"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  List Access Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-400 text-sm">
                    No users found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  const isInactive =
                    user.subscriptionStatus === 'inactive' ||
                    user.subscriptionTier === 'none' ||
                    user.memberStatus === 'suspended' ||
                    user.memberStatus === 'revoked';

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-dark-700/50 transition ${
                        isSelected ? 'bg-amber-500/5' : ''
                      }`}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectUser(user.id)}
                          className="rounded border-gray-600 text-amber-500 focus:ring-amber-500/30 bg-dark-800 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white flex items-center gap-2">
                            <span>
                              {user.firstName || user.lastName
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                : 'No Name'}
                            </span>
                            {isInactive && (
                              <span className="px-1.5 py-0.5 bg-rose-950 text-rose-300 border border-rose-500/30 rounded text-[10px] font-bold">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 font-mono">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={getRoleBadge(user.role)}>{user.role}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={user.memberStatus || 'pending'}
                          onChange={(e) => handleMemberStatusChange(user.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none ${getMemberStatusBadge(
                            user.memberStatus
                          )}`}
                        >
                          <option value="approved" className="bg-slate-900 text-emerald-400">
                            Approved
                          </option>
                          <option value="active" className="bg-slate-900 text-emerald-400">
                            Active
                          </option>
                          <option value="pending" className="bg-slate-900 text-amber-400">
                            Pending Approval
                          </option>
                          <option value="suspended" className="bg-slate-900 text-orange-400">
                            Suspended
                          </option>
                          <option value="revoked" className="bg-slate-900 text-rose-400">
                            Revoked
                          </option>
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(user.subscriptionStatus)}>
                          {user.subscriptionStatus} ({user.subscriptionTier || 'none'})
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleConciergeReset(user.id, user.email)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded text-xs font-bold transition"
                          title="Concierge Password Reset"
                        >
                          🔑 Reset Password
                        </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition inline-block align-middle"
                          title="Delete User"
                        >
                          <TrashIcon className="w-5 h-5 inline" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single User Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6 border border-rose-500/30">
            <div className="flex items-center gap-3 mb-4 text-rose-400">
              <ExclamationTriangleIcon className="w-7 h-7 flex-shrink-0" />
              <h3 className="text-xl font-bold text-white">Delete User Permanently</h3>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Are you sure you want to permanently delete user{' '}
              <span className="font-bold text-amber-300 font-mono">{userToDelete.email}</span>?
            </p>
            <p className="text-xs text-gray-400 mb-6 bg-dark-700/60 p-3 rounded border border-dark-600">
              ⚠️ This will cleanly remove all associated personal data (chat messages, trade journals, notifications, referrals, etc.). This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="btn btn-secondary text-xs"
                disabled={singleDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={singleDeleting}
                className="btn bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2"
              >
                {singleDeleting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Confirm Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkConfirm && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full p-6 border border-rose-500/30">
            <div className="flex items-center gap-3 mb-4 text-rose-400">
              <ExclamationTriangleIcon className="w-7 h-7 flex-shrink-0" />
              <h3 className="text-xl font-bold text-white">Bulk Delete {selectedIds.length} Users</h3>
            </div>
            <p className="text-sm text-gray-300 mb-3">
              Are you sure you want to permanently delete all{' '}
              <span className="font-bold text-amber-300">{selectedIds.length} selected users</span>?
            </p>
            <p className="text-xs text-gray-400 mb-6 bg-dark-700/60 p-3 rounded border border-dark-600">
              ⚠️ All associated user records will be cascaded and cleaned up safely. Master admin and your own account will be protected.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowBulkConfirm(false)}
                className="btn btn-secondary text-xs"
                disabled={bulkDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmBulkDelete}
                disabled={bulkDeleting}
                className="btn bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2"
              >
                {bulkDeleting ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Deleting Users...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-4 h-4" />
                    Delete {selectedIds.length} Users
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Educator Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-6">Create Educator Account</h2>

            <form onSubmit={createEducator} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={newEducator.firstName}
                    onChange={(e) => setNewEducator({ ...newEducator, firstName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={newEducator.lastName}
                    onChange={(e) => setNewEducator({ ...newEducator, lastName: e.target.value })}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={newEducator.email}
                  onChange={(e) => setNewEducator({ ...newEducator, email: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={newEducator.password}
                  onChange={(e) => setNewEducator({ ...newEducator, password: e.target.value })}
                  className="input"
                  required
                  minLength="8"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  Create Educator
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

export default UserManagement;

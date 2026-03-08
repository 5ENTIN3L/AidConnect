import React, { useState, useEffect } from 'react';
import { databases } from '../services/api';
import { Query } from 'appwrite';

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments('aidconnect_db', 'deliveries', [
        Query.orderDesc('$createdAt'),
        Query.limit(20)
      ]);
      setDeliveries(response.documents);
    } catch (error) {
      console.error('Failed to fetch deliveries:', error.message);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setShowRecordForm(true);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await databases.updateDocument('aidconnect_db', 'deliveries', selectedDelivery.$id, {
        status: 'delivered',
        deliveryDate: new Date().toISOString().split('T')[0],
      });
      setSuccess('Delivery recorded successfully!');
      setShowRecordForm(false);
      setSelectedDelivery(null);
      fetchDeliveries();
    } catch (err) {
      setError('Failed to update delivery. Please try again.');
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_progress': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredDeliveries = deliveries.filter(d => filterStatus === 'ALL' || d.status === filterStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.navigateTo('dashboard')}>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">AidConnect</h1>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => window.navigateTo('dashboard')} className="text-gray-600 hover:text-blue-600 font-medium transition">Dashboard</button>
              <button onClick={() => window.navigateTo('beneficiaries')} className="text-gray-600 hover:text-blue-600 font-medium transition">Beneficiaries</button>
              <button onClick={() => window.navigateTo('requests')} className="text-gray-600 hover:text-blue-600 font-medium transition">Aid Requests</button>
              <button className="text-blue-600 font-semibold">Deliveries</button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.fullName?.charAt(0)}
                </div>
              </div>
              <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Deliveries</h2>
            <p className="text-gray-600">Track and manage aid deliveries</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{deliveries.filter(d => d.status === 'scheduled').length}</div>
            <div className="text-blue-100">Scheduled</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{deliveries.filter(d => d.status === 'in_progress').length}</div>
            <div className="text-orange-100">In Progress</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{deliveries.filter(d => d.status === 'delivered').length}</div>
            <div className="text-green-100">Delivered</div>
          </div>
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{deliveries.length}</div>
            <div className="text-slate-100">Total</div>
          </div>
        </div>

        {success && <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg"><p className="text-green-700 font-medium">{success}</p></div>}
        {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"><p className="text-red-700 font-medium">{error}</p></div>}

        {/* Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Record Delivery Form */}
        {showRecordForm && selectedDelivery && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Record Delivery</h3>
              <button onClick={() => { setShowRecordForm(false); setSelectedDelivery(null); }} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-600">Beneficiary</p><p className="font-semibold text-slate-900">{selectedDelivery.beneficiaryId}</p></div>
                <div><p className="text-gray-600">Aid Type</p><p className="font-semibold text-slate-900">{selectedDelivery.aidType}</p></div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <input type="checkbox" className="w-5 h-5 text-green-600 rounded" required />
              <label className="text-sm font-medium text-green-900">Beneficiary confirmed receipt and signed acknowledgment</label>
            </div>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => { setShowRecordForm(false); setSelectedDelivery(null); }}
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition">Cancel</button>
              <button onClick={handleComplete} disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg disabled:opacity-50 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {saving ? 'Saving...' : 'Complete Delivery'}
              </button>
            </div>
          </div>
        )}

        {/* Deliveries Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-4 text-gray-600">Loading deliveries...</p>
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 font-medium">No deliveries found</p>
              <p className="text-gray-400 text-sm mt-1">Deliveries will appear here once aid requests are approved</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Delivery ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Beneficiary</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Aid Type</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Scheduled Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery, index) => (
                    <tr key={delivery.$id} className="border-t border-gray-100 hover:bg-blue-50/50 transition">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-semibold text-blue-600">{delivery.$id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${
                            index % 4 === 0 ? 'from-purple-400 to-pink-400' :
                            index % 4 === 1 ? 'from-blue-400 to-cyan-400' :
                            index % 4 === 2 ? 'from-green-400 to-emerald-400' :
                            'from-orange-400 to-red-400'
                          } rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                            {delivery.beneficiaryId?.charAt(0)}
                          </div>
                          <p className="font-semibold text-slate-900">{delivery.beneficiaryId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900">{delivery.aidType}</td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {delivery.deliveryDate ? new Date(delivery.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                          {delivery.status?.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {delivery.status === 'scheduled' && (
                          <button onClick={() => handleRecordDelivery(delivery)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition">
                            Record Delivery
                          </button>
                        )}
                        {delivery.status === 'delivered' && (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1 justify-end">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Delivered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredDeliveries.length}</span> of <span className="font-semibold">{deliveries.length}</span> deliveries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Deliveries;

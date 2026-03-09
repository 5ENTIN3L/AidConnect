import React, { useState, useEffect } from 'react';
import { databases } from '../services/api';
import { Query } from 'appwrite';
import NavBar from '../components/NavBar';

function Deliveries() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');



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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
      {/* Ambient Animated Background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-blob" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] pointer-events-none">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#80b5ff] to-[#4ade80] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-blob animation-delay-2000" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      <div className="absolute top-1/2 left-1/4 -z-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      <NavBar activePage="deliveries" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Deliveries</h2>
            <p className="text-gray-600 dark:text-gray-300">Track and manage aid deliveries</p>
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 transition-colors mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-slate-700 transition-colors mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Record Delivery</h3>
              <button onClick={() => { setShowRecordForm(false); setSelectedDelivery(null); }} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-6 mb-6 border border-blue-200 dark:border-blue-800 transition-colors">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-600 dark:text-gray-400">Beneficiary</p><p className="font-semibold text-slate-900 dark:text-white">{selectedDelivery.beneficiaryId}</p></div>
                <div><p className="text-gray-600 dark:text-gray-400">Aid Type</p><p className="font-semibold text-slate-900 dark:text-white">{selectedDelivery.aidType}</p></div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-6 transition-colors">
              <input type="checkbox" className="w-5 h-5 text-green-600 rounded" required />
              <label className="text-sm font-medium text-green-900 dark:text-green-300">Beneficiary confirmed receipt and signed acknowledgment</label>
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
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors">
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
              <p className="text-gray-500 dark:text-gray-400 font-medium">No deliveries found</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Deliveries will appear here once aid requests are approved</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Delivery ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Beneficiary</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Aid Type</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Scheduled Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery, index) => (
                    <tr key={delivery.$id} className="border-t border-gray-100 dark:border-slate-700/50 hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{delivery.$id.slice(0, 8).toUpperCase()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${index % 4 === 0 ? 'from-purple-400 to-pink-400' :
                            index % 4 === 1 ? 'from-blue-400 to-cyan-400' :
                              index % 4 === 2 ? 'from-green-400 to-emerald-400' :
                                'from-orange-400 to-red-400'
                            } rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                            {delivery.beneficiaryId?.charAt(0)}
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-white">{delivery.beneficiaryId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{delivery.aidType}</td>
                      <td className="py-4 px-6 text-gray-600 dark:text-gray-300 text-sm">
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
          <div className="bg-gray-50 dark:bg-slate-800 px-6 py-4 border-t border-gray-200 dark:border-slate-700 transition-colors">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing <span className="font-semibold">{filteredDeliveries.length}</span> of <span className="font-semibold">{deliveries.length}</span> deliveries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Deliveries;

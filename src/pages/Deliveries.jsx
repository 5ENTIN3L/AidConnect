import React, { useState } from 'react';

function Deliveries() {
  const [deliveries, setDeliveries] = useState([
    {
      id: 1,
      deliveryId: 'DEL-2024-001',
      requestId: 'REQ-2024-005',
      beneficiaryName: 'Grace Akinyi',
      aidType: 'Food',
      quantity: '3 bags (25kg maize)',
      scheduledDate: '2024-01-25',
      deliveryDate: '2024-01-25',
      status: 'COMPLETED',
      fieldOfficer: 'John Doe',
      location: 'Mukuru, Nairobi',
      photoUrl: null,
    },
    {
      id: 2,
      deliveryId: 'DEL-2024-002',
      requestId: 'REQ-2024-003',
      beneficiaryName: 'Mary Wanjiru',
      aidType: 'Education',
      quantity: 'School supplies',
      scheduledDate: '2024-01-26',
      deliveryDate: null,
      status: 'SCHEDULED',
      fieldOfficer: 'Jane Smith',
      location: 'Kawangware',
      photoUrl: null,
    },
    {
      id: 3,
      deliveryId: 'DEL-2024-003',
      requestId: 'REQ-2024-002',
      beneficiaryName: 'John Omondi',
      aidType: 'Medical',
      quantity: '1 first aid kit',
      scheduledDate: '2024-01-27',
      deliveryDate: '2024-01-27',
      status: 'IN_PROGRESS',
      fieldOfficer: 'Peter Kamau',
      location: 'Mathare, Nairobi',
      photoUrl: null,
    },
    {
      id: 4,
      deliveryId: 'DEL-2024-004',
      requestId: 'REQ-2024-004',
      beneficiaryName: 'Peter Otieno',
      aidType: 'Shelter',
      quantity: 'Housing materials',
      scheduledDate: '2024-01-28',
      deliveryDate: null,
      status: 'SCHEDULED',
      fieldOfficer: 'Mary Wanjiru',
      location: 'Dagoretti, Nairobi',
      photoUrl: null,
    },
    {
      id: 5,
      deliveryId: 'DEL-2024-005',
      requestId: 'REQ-2024-001',
      beneficiaryName: 'Jane Kamau',
      aidType: 'Food',
      quantity: '2 bags (50kg rice)',
      scheduledDate: '2024-01-29',
      deliveryDate: null,
      status: 'SCHEDULED',
      fieldOfficer: 'John Doe',
      location: 'Kibera, Nairobi',
      photoUrl: null,
    },
  ]);

  const [showRecordForm, setShowRecordForm] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const goToDashboard = () => {
    if (window.navigateTo) {
      window.navigateTo('dashboard');
    }
  };

  const goToBeneficiaries = () => {
    if (window.navigateTo) {
      window.navigateTo('beneficiaries');
    }
  };

  const goToRequests = () => {
    if (window.navigateTo) {
      window.navigateTo('requests');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredDeliveries = deliveries.filter((d) => {
    return filterStatus === 'ALL' || d.status === filterStatus;
  });

  const handleRecordDelivery = (delivery) => {
    setSelectedDelivery(delivery);
    setShowRecordForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg cursor-pointer" 
                onClick={goToDashboard}
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
                AidConnect
              </h1>
            </div>

            <div className="flex items-center gap-6">
              <button 
                onClick={goToDashboard}
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Dashboard
              </button>
              <button 
                onClick={goToBeneficiaries}
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Beneficiaries
              </button>
              <button 
                onClick={goToRequests}
                className="text-gray-600 hover:text-blue-600 font-medium transition"
              >
                Aid Requests
              </button>
              <button className="text-blue-600 font-semibold">
                Deliveries
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role?.replace('_', ' ')}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.fullName?.charAt(0)}
                </div>
              </div>

              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Deliveries</h2>
            <p className="text-gray-600">Track and manage aid deliveries</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {deliveries.filter(d => d.status === 'SCHEDULED').length}
            </div>
            <div className="text-blue-100">Scheduled</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {deliveries.filter(d => d.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-orange-100">In Progress</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {deliveries.filter(d => d.status === 'COMPLETED').length}
            </div>
            <div className="text-green-100">Completed</div>
          </div>
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{deliveries.length}</div>
            <div className="text-slate-100">Total Deliveries</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Record Delivery Form */}
        {showRecordForm && selectedDelivery && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Record Delivery</h3>
              <button 
                onClick={() => {
                  setShowRecordForm(false);
                  setSelectedDelivery(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Delivery Info Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-200">
              <h4 className="font-bold text-slate-900 mb-3">Delivery Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Delivery ID</p>
                  <p className="font-semibold text-slate-900">{selectedDelivery.deliveryId}</p>
                </div>
                <div>
                  <p className="text-gray-600">Beneficiary</p>
                  <p className="font-semibold text-slate-900">{selectedDelivery.beneficiaryName}</p>
                </div>
                <div>
                  <p className="text-gray-600">Aid Type</p>
                  <p className="font-semibold text-slate-900">{selectedDelivery.aidType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Quantity</p>
                  <p className="font-semibold text-slate-900">{selectedDelivery.quantity}</p>
                </div>
              </div>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Date *</label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Time *</label>
                  <input
                    type="time"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Status *</label>
                <div className="grid grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition">
                    <input type="radio" name="status" value="COMPLETED" defaultChecked className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Successful</p>
                      <p className="text-xs text-gray-500">Delivered completely</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 transition">
                    <input type="radio" name="status" value="PARTIAL" className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Partial</p>
                      <p className="text-xs text-gray-500">Partially delivered</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition">
                    <input type="radio" name="status" value="FAILED" className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-slate-900">Failed</p>
                      <p className="text-xs text-gray-500">Could not deliver</p>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Photo Evidence</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-600 mb-1">Drop photo here or click to browse</p>
                  <p className="text-xs text-gray-500">Max size: 5MB. Formats: JPG, PNG</p>
                  <input type="file" className="hidden" accept="image/*" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">GPS Coordinates (Optional)</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., -1.2921, 36.8219"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Notes</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any additional information about the delivery..."
                ></textarea>
              </div>

              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <input type="checkbox" className="w-5 h-5 text-green-600 rounded" />
                <label className="text-sm font-medium text-green-900">
                  Beneficiary confirmed receipt and signed acknowledgment
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowRecordForm(false);
                    setSelectedDelivery(null);
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Delivery recorded successfully! (This will connect to backend later)');
                    setShowRecordForm(false);
                    setSelectedDelivery(null);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete Delivery
                  </span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Deliveries Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Delivery ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Beneficiary</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Aid Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Field Officer</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Scheduled Date</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.map((delivery, index) => (
                  <tr key={delivery.id} className="border-t border-gray-100 hover:bg-blue-50/50 transition">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {delivery.deliveryId}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${
                          index % 4 === 0 ? 'from-purple-400 to-pink-400' :
                          index % 4 === 1 ? 'from-blue-400 to-cyan-400' :
                          index % 4 === 2 ? 'from-green-400 to-emerald-400' :
                          'from-orange-400 to-red-400'
                        } rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
                          {delivery.beneficiaryName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{delivery.beneficiaryName}</p>
                          <p className="text-xs text-gray-500">{delivery.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-900">{delivery.aidType}</p>
                        <p className="text-xs text-gray-500">{delivery.quantity}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-sm text-gray-700">{delivery.fieldOfficer}</p>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {new Date(delivery.scheduledDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(delivery.status)}`}>
                        {delivery.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {delivery.status === 'SCHEDULED' && (
                          <button 
                            onClick={() => handleRecordDelivery(delivery)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition"
                          >
                            Record Delivery
                          </button>
                        )}
                        {delivery.status === 'COMPLETED' && (
                          <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-medium flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Delivered
                          </span>
                        )}
                        <button className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredDeliveries.length}</span> of{' '}
                <span className="font-semibold">{deliveries.length}</span> deliveries
              </p>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition text-sm font-medium">
                  Previous
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium">
                  1
                </button>
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition text-sm font-medium">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Deliveries;
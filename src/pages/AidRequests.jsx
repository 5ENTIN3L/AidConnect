import React, { useState } from 'react';

function AidRequests() {
  const [requests, setRequests] = useState([
    {
      id: 1,
      requestId: 'REQ-2024-001',
      beneficiaryName: 'Jane Kamau',
      beneficiaryId: 'BEN-2024-001',
      aidType: 'Food',
      quantity: '2 bags (50kg rice)',
      urgency: 'EMERGENCY',
      priorityScore: 95,
      status: 'PENDING',
      createdDate: '2024-01-20',
      location: 'Kibera, Nairobi',
    },
    {
      id: 2,
      requestId: 'REQ-2024-002',
      beneficiaryName: 'John Omondi',
      beneficiaryId: 'BEN-2024-002',
      aidType: 'Medical',
      quantity: '1 first aid kit',
      urgency: 'HIGH',
      priorityScore: 85,
      status: 'APPROVED',
      createdDate: '2024-01-19',
      location: 'Mathare, Nairobi',
    },
    {
      id: 3,
      requestId: 'REQ-2024-003',
      beneficiaryName: 'Mary Wanjiru',
      beneficiaryId: 'BEN-2024-003',
      aidType: 'Education',
      quantity: 'School supplies for 3 children',
      urgency: 'MEDIUM',
      priorityScore: 70,
      status: 'ALLOCATED',
      createdDate: '2024-01-18',
      location: 'Kawangware',
    },
    {
      id: 4,
      requestId: 'REQ-2024-004',
      beneficiaryName: 'Peter Otieno',
      beneficiaryId: 'BEN-2024-004',
      aidType: 'Shelter',
      quantity: 'Temporary housing materials',
      urgency: 'HIGH',
      priorityScore: 88,
      status: 'PENDING',
      createdDate: '2024-01-17',
      location: 'Dagoretti, Nairobi',
    },
    {
      id: 5,
      requestId: 'REQ-2024-005',
      beneficiaryName: 'Grace Akinyi',
      beneficiaryId: 'BEN-2024-005',
      aidType: 'Food',
      quantity: '3 bags (25kg maize)',
      urgency: 'MEDIUM',
      priorityScore: 65,
      status: 'COMPLETED',
      createdDate: '2024-01-16',
      location: 'Mukuru, Nairobi',
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterAidType, setFilterAidType] = useState('ALL');

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'APPROVED':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ALLOCATED':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'EMERGENCY':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'HIGH':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getAidTypeIcon = (type) => {
    switch (type) {
      case 'Food':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        );
      case 'Medical':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      case 'Education':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
        );
      case 'Shelter':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
        );
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesAidType = filterAidType === 'ALL' || r.aidType === filterAidType;
    return matchesStatus && matchesAidType;
  });

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
              <button className="text-blue-600 font-semibold">
                Aid Requests
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Aid Requests</h2>
            <p className="text-gray-600">Create and manage aid distribution requests</p>
          </div>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/30 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Request
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {requests.filter(r => r.status === 'PENDING').length}
            </div>
            <div className="text-yellow-100">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {requests.filter(r => r.status === 'APPROVED').length}
            </div>
            <div className="text-blue-100">Approved</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {requests.filter(r => r.status === 'ALLOCATED').length}
            </div>
            <div className="text-purple-100">Allocated</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">
              {requests.filter(r => r.status === 'COMPLETED').length}
            </div>
            <div className="text-green-100">Completed</div>
          </div>
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{requests.length}</div>
            <div className="text-slate-100">Total Requests</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Aid Type</label>
              <select
                value={filterAidType}
                onChange={(e) => setFilterAidType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ALL">All Aid Types</option>
                <option value="Food">Food</option>
                <option value="Medical">Medical</option>
                <option value="Shelter">Shelter</option>
                <option value="Education">Education</option>
                <option value="Clothing">Clothing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Create Request Form */}
        {showCreateForm && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Create New Aid Request</h3>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Select Beneficiary *</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Choose a beneficiary...</option>
                    <option>Jane Kamau (BEN-2024-001)</option>
                    <option>John Omondi (BEN-2024-002)</option>
                    <option>Mary Wanjiru (BEN-2024-003)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Aid Type *</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select aid type...</option>
                    <option>Food</option>
                    <option>Medical</option>
                    <option>Shelter</option>
                    <option>Education</option>
                    <option>Clothing</option>
                    <option>Cash</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity/Details *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 2 bags (50kg rice)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level *</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>Select urgency...</option>
                    <option>EMERGENCY</option>
                    <option>HIGH</option>
                    <option>MEDIUM</option>
                    <option>LOW</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
                <textarea
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Provide additional details about the aid request..."
                ></textarea>
              </div>

              {/* Priority Score Preview */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
                <h4 className="text-lg font-bold text-slate-900 mb-4">Priority Score Preview</h4>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-4">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-4 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <div className="text-3xl font-bold text-red-600">85</div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4 text-sm">
                  <div>
                    <p className="text-gray-600">Vulnerability</p>
                    <p className="font-bold text-slate-900">+30</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Urgency</p>
                    <p className="font-bold text-slate-900">+25</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Household</p>
                    <p className="font-bold text-slate-900">+15</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Days Since Aid</p>
                    <p className="font-bold text-slate-900">+15</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Request created! (This will connect to backend later)');
                    setShowCreateForm(false);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                <tr>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Request ID</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Beneficiary</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Aid Type</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Urgency</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Priority</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-t border-gray-100 hover:bg-blue-50/50 transition">
                    <td className="py-4 px-6">
                      <span className="font-mono text-sm font-semibold text-blue-600">
                        {request.requestId}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-slate-900">{request.beneficiaryName}</p>
                        <p className="text-xs text-gray-500">{request.location}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${
                          request.aidType === 'Food' ? 'bg-blue-100 text-blue-600' :
                          request.aidType === 'Medical' ? 'bg-green-100 text-green-600' :
                          request.aidType === 'Education' ? 'bg-purple-100 text-purple-600' :
                          request.aidType === 'Shelter' ? 'bg-orange-100 text-orange-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getAidTypeIcon(request.aidType)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{request.aidType}</p>
                          <p className="text-xs text-gray-500">{request.quantity}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(request.urgency)}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div 
                            className={`h-2 rounded-full ${
                              request.priorityScore >= 90 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                              request.priorityScore >= 75 ? 'bg-gradient-to-r from-orange-500 to-yellow-500' :
                              request.priorityScore >= 60 ? 'bg-gradient-to-r from-yellow-500 to-green-500' :
                              'bg-gradient-to-r from-green-500 to-blue-500'
                            }`}
                            style={{width: `${request.priorityScore}%`}}
                          ></div>
                        </div>
                        <span className={`text-sm font-bold ${
                          request.priorityScore >= 90 ? 'text-red-600' :
                          request.priorityScore >= 75 ? 'text-orange-600' :
                          request.priorityScore >= 60 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {request.priorityScore}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 text-sm">
                      {new Date(request.createdDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {request.status === 'PENDING' && (
                          <>
                            <button className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition">
                              Approve
                            </button>
                            <button className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition">
                              Reject
                            </button>
                          </>
                        )}
                        {request.status === 'APPROVED' && (
                          <button className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium transition">
                            Allocate
                          </button>
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
                Showing <span className="font-semibold">{filteredRequests.length}</span> of{' '}
                <span className="font-semibold">{requests.length}</span> requests
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

export default AidRequests;
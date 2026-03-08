import React, { useState, useEffect } from 'react';
import { databases } from '../services/api';
import { Query, ID } from 'appwrite';

function AidRequests() {
  const [requests, setRequests] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [duplicationWarning, setDuplicationWarning] = useState('');

  const [formData, setFormData] = useState({
    beneficiaryId: '',
    beneficiaryName: '',
    aidType: '',
    quantity: '',
    urgency: '',
    description: '',
    location: '',
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    fetchRequests();
    fetchBeneficiaries();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await databases.listDocuments('aidconnect_db', 'aid_requests', [
        Query.orderDesc('$createdAt'),
        Query.limit(50)
      ]);
      setRequests(response.documents);
    } catch (error) {
      console.error('Failed to fetch requests:', error.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBeneficiaries = async () => {
    try {
      const response = await databases.listDocuments('aidconnect_db', 'beneficiaries', [Query.limit(100)]);
      setBeneficiaries(response.documents);
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error.message);
    }
  };

  const checkDuplication = (beneficiaryId, aidType) => {
    if (!beneficiaryId || !aidType) { setDuplicationWarning(''); return; }
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const duplicate = requests.find(r =>
      r.beneficiaryId === beneficiaryId &&
      r.aidType === aidType &&
      new Date(r.$createdAt) > thirtyDaysAgo &&
      r.status !== 'REJECTED'
    );

    if (duplicate) {
      setDuplicationWarning(
        `⚠️ Warning: This beneficiary already received ${aidType} aid on ${new Date(duplicate.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}. Submitting may violate the 30-day duplication policy.`
      );
    } else {
      setDuplicationWarning('');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...formData, [name]: value };

    if (name === 'beneficiaryId') {
      const selected = beneficiaries.find(b => b.$id === value);
      updated = { ...updated, beneficiaryName: selected?.fullName || '', location: selected?.location || '' };
      checkDuplication(value, formData.aidType);
    }

    if (name === 'aidType') {
      checkDuplication(formData.beneficiaryId, value);
    }

    setFormData(updated);
  };

  const getPriorityScore = (urgency, vulnerability) => {
    const urgencyScore = { EMERGENCY: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    const vulnerabilityScore = { CRITICAL: 40, HIGH: 30, MEDIUM: 20, LOW: 10 };
    return (urgencyScore[urgency] || 0) + (vulnerabilityScore[vulnerability] || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const selectedBeneficiary = beneficiaries.find(b => b.$id === formData.beneficiaryId);
      const priorityScore = getPriorityScore(formData.urgency, selectedBeneficiary?.vulnerability);
      await databases.createDocument('aidconnect_db', 'aid_requests', ID.unique(), {
        beneficiaryId: formData.beneficiaryId,
        beneficiaryName: formData.beneficiaryName,
        aidType: formData.aidType,
        quantity: formData.quantity,
        urgency: formData.urgency,
        description: formData.description,
        location: formData.location,
        status: 'PENDING',
        priorityScore: priorityScore,
      });
      setSuccess('Aid request created successfully!');
      setFormData({ beneficiaryId: '', beneficiaryName: '', aidType: '', quantity: '', urgency: '', description: '', location: '' });
      setDuplicationWarning('');
      setShowCreateForm(false);
      fetchRequests();
    } catch (err) {
      setError('Failed to create request. Please ensure the aid_requests collection is set up in Appwrite.');
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ALLOCATED': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'EMERGENCY': return 'bg-red-100 text-red-700 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const filteredRequests = requests.filter(r => filterStatus === 'ALL' || r.status === filterStatus);

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
              <button className="text-blue-600 font-semibold">Aid Requests</button>
              <button onClick={() => window.navigateTo('deliveries')} className="text-gray-600 hover:text-blue-600 font-medium transition">Deliveries</button>
              <button onClick={() => window.navigateTo('reports')} className="text-gray-600 hover:text-blue-600 font-medium transition">Reports</button>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Aid Requests</h2>
            <p className="text-gray-600">Create and manage aid distribution requests</p>
          </div>
          <button onClick={() => { setShowCreateForm(!showCreateForm); setDuplicationWarning(''); }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{requests.filter(r => r.status === 'PENDING').length}</div>
            <div className="text-yellow-100">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{requests.filter(r => r.status === 'APPROVED').length}</div>
            <div className="text-blue-100">Approved</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{requests.filter(r => r.status === 'COMPLETED').length}</div>
            <div className="text-green-100">Completed</div>
          </div>
          <div className="bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{requests.length}</div>
            <div className="text-slate-100">Total</div>
          </div>
        </div>

        {success && <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg"><p className="text-green-700 font-medium">{success}</p></div>}
        {error && <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg"><p className="text-red-700 font-medium">{error}</p></div>}

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-semibold text-gray-700">Filter by Status:</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {showCreateForm && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Create New Aid Request</h3>
              <button onClick={() => { setShowCreateForm(false); setDuplicationWarning(''); }} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Duplication Warning */}
            {duplicationWarning && (
              <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg flex items-start gap-3">
                <svg className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-orange-700 font-medium text-sm">{duplicationWarning}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Beneficiary *</label>
                <select name="beneficiaryId" value={formData.beneficiaryId} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Choose a beneficiary...</option>
                  {beneficiaries.map(b => (
                    <option key={b.$id} value={b.$id}>{b.fullName} ({b.uniqueId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Aid Type *</label>
                <select name="aidType" value={formData.aidType} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select aid type...</option>
                  <option value="Food">Food</option>
                  <option value="Medical">Medical</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Education">Education</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity/Details *</label>
                <input type="text" name="quantity" value={formData.quantity} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2 bags (50kg rice)" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency Level *</label>
                <select name="urgency" value={formData.urgency} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select urgency...</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional details about this request..."></textarea>
              </div>
              <div className="md:col-span-2 flex justify-end gap-4">
                <button type="button" onClick={() => { setShowCreateForm(false); setDuplicationWarning(''); }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition">Cancel</button>
                <button onClick={handleSubmit} disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50">
                  {saving ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-4 text-gray-600">Loading requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 font-medium">No aid requests yet</p>
              <p className="text-gray-400 text-sm mt-1">Create your first request using the button above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Beneficiary</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Aid Type</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Urgency</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Priority</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((request) => (
                    <tr key={request.$id} className="border-t border-gray-100 hover:bg-blue-50/50 transition">
                      <td className="py-4 px-6">
                        <p className="font-semibold text-slate-900">{request.beneficiaryName}</p>
                        <p className="text-xs text-gray-500">{request.location}</p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-slate-900">{request.aidType}</p>
                        <p className="text-xs text-gray-500">{request.quantity}</p>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm font-bold text-slate-900">{request.priorityScore}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {new Date(request.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredRequests.length}</span> of <span className="font-semibold">{requests.length}</span> requests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AidRequests;

import React, { useState } from 'react';
import { databases } from '../services/api';
import { ID } from 'appwrite';

function BeneficiaryPortal() {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({ aidType: '', quantity: '', urgency: '', description: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.aidType || !formData.urgency || !formData.quantity) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await databases.createDocument('aidconnect_db', 'aid_requests', ID.unique(), {
        beneficiaryName: user.fullName,
        aidType: formData.aidType,
        quantity: formData.quantity,
        urgency: formData.urgency,
        description: formData.description,
        status: 'PENDING',
        priorityScore: 0,
        location: '',
      });
      setSuccess('Your aid request has been submitted! You will be notified once it is reviewed.');
      setShowRequestForm(false);
      setFormData({ aidType: '', quantity: '', urgency: '', description: '' });
    } catch (err) {
      setError('Failed to submit request. Please try again.');
      console.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">AidConnect</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
              <p className="text-xs text-gray-500">Beneficiary</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
              {user.fullName?.charAt(0)}
            </div>
            <button onClick={handleLogout} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user.fullName}! 👋</h2>
          <p className="text-blue-100">You can submit aid requests and track your delivery status here.</p>
        </div>

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Request Aid</h3>
            <p className="text-gray-600 text-sm mb-4">Submit a new aid request for food, medical, shelter or other needs.</p>
            <button onClick={() => setShowRequestForm(true)}
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg">
              Submit Request
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">My Deliveries</h3>
            <p className="text-gray-600 text-sm mb-4">Track the status of your aid deliveries in real time.</p>
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <svg className="w-10 h-10 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm text-gray-400">No deliveries yet</p>
            </div>
          </div>
        </div>

        {showRequestForm && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Submit Aid Request</h3>
              <button onClick={() => setShowRequestForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Aid Type *</label>
                <select value={formData.aidType} onChange={(e) => setFormData({...formData, aidType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select aid type...</option>
                  <option value="Food">Food</option>
                  <option value="Medical">Medical</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Education">Education</option>
                  <option value="Clothing">Clothing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency *</label>
                <select value={formData.urgency} onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select urgency...</option>
                  <option value="EMERGENCY">Emergency</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity / Details *</label>
                <input type="text" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. 2 bags of rice" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional details..." />
              </div>
              <div className="md:col-span-2 flex justify-end gap-4">
                <button type="button" onClick={() => setShowRequestForm(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition">Cancel</button>
                <button onClick={handleSubmit} disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50">
                  {saving ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="font-semibold text-amber-800">Aid Eligibility Notice</p>
              <p className="text-amber-700 text-sm mt-1">Aid requests can only be submitted once every 30 days per category. Our system automatically checks your eligibility to ensure fair distribution.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BeneficiaryPortal;

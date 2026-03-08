import React, { useState, useEffect } from 'react';
import { appwriteService } from '../services/api';

function Beneficiaries() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVulnerability, setFilterVulnerability] = useState('ALL');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    uniqueId: '',
    location: '',
    phone: '',
    vulnerability: '',
    householdSize: '',
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const goToDashboard = () => {
    if (window.navigateTo) window.navigateTo('dashboard');
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      const response = await appwriteService.getBeneficiaries();
      setBeneficiaries(response.documents);
    } catch (error) {
      console.error('Failed to fetch beneficiaries:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await appwriteService.createBeneficiary(formData);
      setSuccess('Beneficiary registered successfully!');
      setFormData({ fullName: '', uniqueId: '', location: '', phone: '', vulnerability: '', householdSize: '' });
      setShowAddForm(false);
      fetchBeneficiaries();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getVulnerabilityColor = (level) => {
    switch (level) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchesSearch = b.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.uniqueId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterVulnerability === 'ALL' || b.vulnerability === filterVulnerability;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={goToDashboard}>
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">AidConnect</h1>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={goToDashboard} className="text-gray-600 hover:text-blue-600 font-medium transition">Dashboard</button>
              <button className="text-blue-600 font-semibold">Beneficiaries</button>
              <button onClick={() => window.navigateTo('requests')} className="text-gray-600 hover:text-blue-600 font-medium transition">Aid Requests</button>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Beneficiaries</h2>
            <p className="text-gray-600">Manage and track all registered beneficiaries</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Beneficiary
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{beneficiaries.length}</div>
            <div className="text-blue-100">Total Beneficiaries</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{beneficiaries.filter(b => b.vulnerability === 'CRITICAL').length}</div>
            <div className="text-red-100">Critical Cases</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{beneficiaries.filter(b => b.vulnerability === 'HIGH').length}</div>
            <div className="text-orange-100">High Priority</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-3xl font-bold mb-1">{beneficiaries.reduce((sum, b) => sum + (parseInt(b.householdSize) || 0), 0)}</div>
            <div className="text-green-100">Total People</div>
          </div>
        </div>

        {/* Success/Error Messages */}
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

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by name, ID, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={filterVulnerability}
              onChange={(e) => setFilterVulnerability(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Vulnerability Levels</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Add Beneficiary Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Add New Beneficiary</h3>
              <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">National ID *</label>
                <input type="text" name="uniqueId" value={formData.uniqueId} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter national ID" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location *</label>
                <input type="text" name="location" value={formData.location} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+254 712 345 678" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Household Size *</label>
                <input type="number" name="householdSize" value={formData.householdSize} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Number of people" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vulnerability Level *</label>
                <select name="vulnerability" value={formData.vulnerability} onChange={handleFormChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                  <option value="">Select level</option>
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Beneficiary'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Beneficiaries Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              <p className="ml-4 text-gray-600">Loading beneficiaries...</p>
            </div>
          ) : filteredBeneficiaries.length === 0 ? (
            <div className="text-center py-16">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No beneficiaries found</p>
              <p className="text-gray-400 text-sm mt-1">Add your first beneficiary using the button above</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Beneficiary</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Location</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Household</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Vulnerability</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBeneficiaries.map((b, index) => (
                    <tr key={b.$id} className="border-t border-gray-100 hover:bg-blue-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 bg-gradient-to-br ${
                            index % 4 === 0 ? 'from-purple-400 to-pink-400' :
                            index % 4 === 1 ? 'from-blue-400 to-cyan-400' :
                            index % 4 === 2 ? 'from-green-400 to-emerald-400' :
                            'from-orange-400 to-red-400'
                          } rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                            {b.fullName?.split(' ').map(n => n[0]).join('')}
                          </div>
                          <p className="font-semibold text-slate-900">{b.fullName}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">{b.uniqueId}</span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{b.location}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">{b.householdSize || '—'}</span>
                        {b.householdSize && <span className="text-gray-500 text-sm ml-1">people</span>}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getVulnerabilityColor(b.vulnerability)}`}>
                          {b.vulnerability || '—'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 text-sm">
                        {new Date(b.$createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredBeneficiaries.length}</span> of{' '}
              <span className="font-semibold">{beneficiaries.length}</span> beneficiaries
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Beneficiaries;

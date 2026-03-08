import React, { useState, useEffect } from 'react';
import { appwriteService } from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({
    totalBeneficiaries: 0,
    pendingRequests: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
  });
  const [recentBeneficiaries, setRecentBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user') || '{"fullName": "User", "role": "ngo_admin"}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, recentData, requestsData, deliveriesData] = await Promise.all([
          appwriteService.getStats(),
          appwriteService.getRecentBeneficiaries(),
          appwriteService.getAidRequests(),
          appwriteService.getDeliveries(),
        ]);

        const pendingRequests = requestsData.documents.filter(r => r.status === 'PENDING').length;
        const activeDeliveries = deliveriesData.documents.filter(d => d.status === 'scheduled' || d.status === 'in_progress').length;
        const completedDeliveries = deliveriesData.documents.filter(d => d.status === 'delivered').length;

        setStats({
          totalBeneficiaries: statsData.totalBeneficiaries,
          pendingRequests,
          activeDeliveries,
          completedDeliveries,
        });
        setRecentBeneficiaries(recentData.documents);
      } catch (error) {
        console.error('Dashboard data fetch failed:', error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">AidConnect</h1>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => window.navigateTo('beneficiaries')} className="text-gray-600 hover:text-blue-600 font-medium transition">Beneficiaries</button>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Welcome back, {user.fullName}! Here's your live aid distribution summary.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Live</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.totalBeneficiaries.toLocaleString()}</div>
            <div className="text-blue-100 font-medium">Total Beneficiaries</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Live</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.pendingRequests}</div>
            <div className="text-orange-100 font-medium">Pending Requests</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Live</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.activeDeliveries}</div>
            <div className="text-purple-100 font-medium">Active Deliveries</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">Live</span>
            </div>
            <div className="text-4xl font-bold mb-1">{stats.completedDeliveries}</div>
            <div className="text-green-100 font-medium">Completed Deliveries</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Recently Registered Beneficiaries</h3>
            <button onClick={() => window.navigateTo('beneficiaries')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">View All</button>
          </div>

          {recentBeneficiaries.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-gray-500 font-medium">No beneficiaries registered yet</p>
              <p className="text-gray-400 text-sm mt-1">Go to Beneficiaries to add your first one</p>
              <button onClick={() => window.navigateTo('beneficiaries')} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition">Add Beneficiary</button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vulnerability</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBeneficiaries.map((b, index) => (
                    <tr key={b.$id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br ${
                            index % 4 === 0 ? 'from-purple-400 to-pink-400' :
                            index % 4 === 1 ? 'from-blue-400 to-cyan-400' :
                            index % 4 === 2 ? 'from-green-400 to-emerald-400' :
                            'from-orange-400 to-red-400'
                          } rounded-full flex items-center justify-center text-white font-bold`}>
                            {b.fullName?.charAt(0)}
                          </div>
                          <p className="font-medium text-slate-900">{b.fullName}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4"><span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">{b.uniqueId}</span></td>
                      <td className="py-4 px-4 text-gray-600 text-sm">{b.location}</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                          b.vulnerability === 'CRITICAL' ? 'bg-red-100 text-red-700 border-red-200' :
                          b.vulnerability === 'HIGH' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                          b.vulnerability === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                          'bg-green-100 text-green-700 border-green-200'
                        }`}>{b.vulnerability}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

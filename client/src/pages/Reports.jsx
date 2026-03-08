import React, { useState, useEffect, useRef } from 'react';
import { appwriteService } from '../services/api';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function Reports() {
  const [requests, setRequests] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);

  const aidTypeChartRef = useRef(null);
  const deliveryStatusChartRef = useRef(null);
  const urgencyChartRef = useRef(null);
  const monthlyChartRef = useRef(null);

  const aidTypeChart = useRef(null);
  const deliveryStatusChart = useRef(null);
  const urgencyChart = useRef(null);
  const monthlyChart = useRef(null);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [req, del, ben] = await Promise.all([
          appwriteService.getAidRequests(),
          appwriteService.getDeliveries(),
          appwriteService.getBeneficiaries(),
        ]);
        setRequests(req.documents);
        setDeliveries(del.documents);
        setBeneficiaries(ben.documents);
      } catch (err) {
        console.error('Failed to fetch reports data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const buildCharts = () => {
      // Aid Type Distribution
      const aidTypes = {};
      requests.forEach(r => { aidTypes[r.aidType] = (aidTypes[r.aidType] || 0) + 1; });
      if (aidTypeChartRef.current) {
        if (aidTypeChart.current) aidTypeChart.current.destroy();
        aidTypeChart.current = new Chart(aidTypeChartRef.current, {
          type: 'doughnut',
          data: {
            labels: Object.keys(aidTypes),
            datasets: [{ data: Object.values(aidTypes), backgroundColor: ['#3B82F6','#F59E0B','#10B981','#8B5CF6','#EF4444','#06B6D4'], borderWidth: 0 }]
          },
          options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { padding: 20, font: { size: 13 } } } }, cutout: '65%' }
        });
      }

      // Delivery Status
      const statuses = { scheduled: 0, in_progress: 0, delivered: 0, failed: 0 };
      deliveries.forEach(d => { if (statuses[d.status] !== undefined) statuses[d.status]++; });
      if (deliveryStatusChartRef.current) {
        if (deliveryStatusChart.current) deliveryStatusChart.current.destroy();
        deliveryStatusChart.current = new Chart(deliveryStatusChartRef.current, {
          type: 'bar',
          data: {
            labels: ['Scheduled', 'In Progress', 'Delivered', 'Failed'],
            datasets: [{ label: 'Deliveries', data: Object.values(statuses), backgroundColor: ['#3B82F6','#F59E0B','#10B981','#EF4444'], borderRadius: 8, borderSkipped: false }]
          },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } } }
        });
      }

      // Urgency Breakdown
      const urgencies = { EMERGENCY: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
      requests.forEach(r => { if (urgencies[r.urgency] !== undefined) urgencies[r.urgency]++; });
      if (urgencyChartRef.current) {
        if (urgencyChart.current) urgencyChart.current.destroy();
        urgencyChart.current = new Chart(urgencyChartRef.current, {
          type: 'bar',
          data: {
            labels: ['Emergency', 'High', 'Medium', 'Low'],
            datasets: [{ label: 'Requests', data: Object.values(urgencies), backgroundColor: ['#EF4444','#F97316','#EAB308','#22C55E'], borderRadius: 8, borderSkipped: false }]
          },
          options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#F1F5F9' } }, y: { grid: { display: false } } } }
        });
      }

      // Monthly Registrations
      const months = {};
      beneficiaries.forEach(b => {
        const month = new Date(b.$createdAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        months[month] = (months[month] || 0) + 1;
      });
      if (monthlyChartRef.current) {
        if (monthlyChart.current) monthlyChart.current.destroy();
        monthlyChart.current = new Chart(monthlyChartRef.current, {
          type: 'line',
          data: {
            labels: Object.keys(months),
            datasets: [{ label: 'Beneficiaries Registered', data: Object.values(months), borderColor: '#3B82F6', backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 2, fill: true, tension: 0.4, pointBackgroundColor: '#3B82F6', pointRadius: 5 }]
          },
          options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } } }
        });
      }
    };

    buildCharts();

    return () => {
      [aidTypeChart, deliveryStatusChart, urgencyChart, monthlyChart].forEach(c => {
        if (c.current) { c.current.destroy(); c.current = null; }
      });
    };
  }, [loading, requests, deliveries, beneficiaries]);

  const exportCSV = () => {
    const rows = [
      ['Beneficiary Name', 'Aid Type', 'Urgency', 'Status', 'Priority Score', 'Date'],
      ...requests.map(r => [r.beneficiaryName, r.aidType, r.urgency, r.status, r.priorityScore, new Date(r.$createdAt).toLocaleDateString()])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'aidconnect_report.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const completionRate = deliveries.length > 0
    ? Math.round((deliveries.filter(d => d.status === 'delivered').length / deliveries.length) * 100) : 0;

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
              <button onClick={() => window.navigateTo('deliveries')} className="text-gray-600 hover:text-blue-600 font-medium transition">Deliveries</button>
              <button className="text-blue-600 font-semibold">Reports</button>
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
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Analytics & Reports</h2>
            <p className="text-gray-600">Visual insights into aid distribution across all NGOs</p>
          </div>
          <button onClick={exportCSV} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-4xl font-bold text-blue-600 mb-1">{beneficiaries.length}</div>
            <div className="text-gray-600 text-sm font-medium">Total Beneficiaries</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-4xl font-bold text-orange-500 mb-1">{requests.length}</div>
            <div className="text-gray-600 text-sm font-medium">Total Aid Requests</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-4xl font-bold text-green-600 mb-1">{deliveries.filter(d => d.status === 'delivered').length}</div>
            <div className="text-gray-600 text-sm font-medium">Successful Deliveries</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-1">{completionRate}%</div>
            <div className="text-gray-600 text-sm font-medium">Completion Rate</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Aid Type Distribution</h3>
              <canvas ref={aidTypeChartRef}></canvas>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Delivery Status Breakdown</h3>
              <canvas ref={deliveryStatusChartRef}></canvas>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Requests by Urgency Level</h3>
              <canvas ref={urgencyChartRef}></canvas>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Beneficiary Registrations Over Time</h3>
              <canvas ref={monthlyChartRef}></canvas>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;

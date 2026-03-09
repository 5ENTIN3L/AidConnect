import React, { useState, useEffect, useRef } from 'react';
import { appwriteService } from '../services/api';
import { Chart, registerables } from 'chart.js';
import NavBar from '../components/NavBar';
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
            datasets: [{ data: Object.values(aidTypes), backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EF4444', '#06B6D4'], borderWidth: 0 }]
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
            datasets: [{ label: 'Deliveries', data: Object.values(statuses), backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'], borderRadius: 8, borderSkipped: false }]
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
            datasets: [{ label: 'Requests', data: Object.values(urgencies), backgroundColor: ['#EF4444', '#F97316', '#EAB308', '#22C55E'], borderRadius: 8, borderSkipped: false }]
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative overflow-hidden">
      {/* Ambient Animated Background */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-blob" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)] pointer-events-none">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#80b5ff] to-[#4ade80] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem] animate-blob animation-delay-2000" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      <div className="absolute top-1/2 left-1/4 -z-10 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none"></div>

      <NavBar activePage="reports" />

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Analytics & Reports</h2>
            <p className="text-gray-600 dark:text-gray-300">Visual insights into aid distribution across all NGOs</p>
          </div>
          <button onClick={exportCSV} className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition shadow-lg flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-center transition-colors">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-1">{beneficiaries.length}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Beneficiaries</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-center transition-colors">
            <div className="text-4xl font-bold text-orange-500 mb-1">{requests.length}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Total Aid Requests</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-center transition-colors">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-1">{deliveries.filter(d => d.status === 'delivered').length}</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Successful Deliveries</div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 text-center transition-colors">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-1">{completionRate}%</div>
            <div className="text-gray-600 dark:text-gray-300 text-sm font-medium">Completion Rate</div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-4 text-gray-600">Loading analytics...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Aid Type Distribution</h3>
              <canvas ref={aidTypeChartRef}></canvas>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Delivery Status Breakdown</h3>
              <canvas ref={deliveryStatusChartRef}></canvas>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Requests by Urgency Level</h3>
              <canvas ref={urgencyChartRef}></canvas>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Beneficiary Registrations Over Time</h3>
              <canvas ref={monthlyChartRef}></canvas>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reports;

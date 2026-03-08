import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Beneficiaries from './pages/Beneficiaries';
import AidRequests from './pages/AidRequests';
import Deliveries from './pages/Deliveries';
import BeneficiaryPortal from './pages/BeneficiaryPortal';
import Reports from './pages/Reports';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const isLoggedIn = localStorage.getItem('token');

  if (!isLoggedIn) return <Login />;

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  window.navigateTo = (page) => setCurrentPage(page);

  if (user.role === 'beneficiary') return <BeneficiaryPortal />;
  if (currentPage === 'beneficiaries') return <Beneficiaries />;
  if (currentPage === 'requests') return <AidRequests />;
  if (currentPage === 'deliveries') return <Deliveries />;
  if (currentPage === 'reports') return <Reports />;
  return <Dashboard />;
}

export default App;

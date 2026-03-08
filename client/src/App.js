import React, { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Beneficiaries from './pages/Beneficiaries';
import AidRequests from './pages/AidRequests';
import Deliveries from './pages/Deliveries';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const isLoggedIn = localStorage.getItem('token');
  
  if (!isLoggedIn) {
    return <Login />;
  }

  // Function to navigate between pages
  window.navigateTo = (page) => {
    setCurrentPage(page);
  };

  // Render current page
  if (currentPage === 'beneficiaries') {
    return <Beneficiaries />;
  }
  
  if (currentPage === 'requests') {
    return <AidRequests />;
  }
  
  if (currentPage === 'deliveries') {
    return <Deliveries />;
  }

  return <Dashboard />;
}

export default App;
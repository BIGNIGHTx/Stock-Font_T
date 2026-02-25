import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

import { AlertProvider } from './contexts/AlertContext';

function App() {
  // Initialize from localStorage
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true';
    }
    return false;
  });

  // Toggle Dark Mode Class on HTML element & Persist
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="flex flex-col bg-gray-50 dark:bg-dark-bg min-h-screen font-sans transition-colors duration-300">
      <AlertProvider>
        {/* Topbar */}
        <Topbar darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Dynamic Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-dark-bg transition-colors duration-300">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings darkMode={darkMode} setDarkMode={setDarkMode} />} />
            </Routes>
          </main>
        </div>
      </AlertProvider>
    </div>
  );
}

export default App;

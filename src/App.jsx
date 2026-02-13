import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import { Text } from './components/text';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import { Search, Bell, HelpCircle, Moon, Sun } from 'lucide-react';

import { AlertProvider } from './contexts/AlertContext';

function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [pageParams, setPageParams] = useState({});

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

  const handleNavigate = (page, params = {}) => {
    setActivePage(page);
    setPageParams(params);
  };

  return (
    <div className="flex bg-gray-50 dark:bg-dark-bg min-h-screen font-sans transition-colors duration-300">
      <AlertProvider>
        {/* Sidebar */}
        <Sidebar activePage={activePage} setActivePage={setActivePage} darkMode={darkMode} />

        {/* Main Content */}
        <div className="flex-1 ml-64 flex flex-col">
          {/* Top Header */}
          <header className="h-16 bg-white dark:bg-dark-surface border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300">
            <Text as="h2" className="text-xl font-bold text-gray-800 dark:text-dark-text">Overview</Text>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-transparent dark:border-dark-border dark:text-dark-text dark:focus:ring-blue-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-64 transition-colors"
                />
              </div>
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-surface rounded-full transition-colors"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg rounded-full relative transition-colors">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-dark-surface"></span>
              </button>
              <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-bg rounded-full transition-colors">
                <HelpCircle size={20} />
              </button>
            </div>
          </header>

          {/* Dynamic Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-dark-bg transition-colors duration-300">
            {activePage === 'dashboard' && <Dashboard onNavigate={handleNavigate} />}
            {activePage === 'inventory' && <Inventory initialOpenModal={pageParams?.openAddModal} />}
            {activePage === 'sales' && <Sales />}
            {activePage === 'reports' && <Reports />}
            {activePage === 'settings' && <Settings darkMode={darkMode} setDarkMode={setDarkMode} />}
          </main>
        </div>
      </AlertProvider>
    </div>
  );
}

export default App;

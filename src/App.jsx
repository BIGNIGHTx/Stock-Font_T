import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import { Search, Bell, HelpCircle } from 'lucide-react';

function App() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      {/* Sidebar */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-40">
            <h2 className="text-xl font-bold text-slate-800">Overview</h2>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="pl-10 pr-4 py-2 bg-slate-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 w-64"
                    />
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
                <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                    <HelpCircle size={20} />
                </button>
            </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50">
            {activePage === 'dashboard' && <Dashboard />}
            {activePage === 'inventory' && <Inventory />}
            {activePage === 'sales' && <Sales />}
            {activePage === 'reports' && <Reports />}
        </main>
      </div>
    </div>
  );
}

export default App;

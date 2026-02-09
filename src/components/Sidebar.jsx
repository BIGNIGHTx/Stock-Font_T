import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, LogOut } from 'lucide-react';

const Sidebar = ({ activePage, setActivePage }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-xl">⚡</span>
        </div>
        <h1 className="text-xl font-bold text-slate-800">ElectroManage</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${
              activePage === item.id
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={20} className="mr-3" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile (Bottom) */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
          <img 
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" 
            alt="Admin" 
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-slate-800">Alex Morgan</p>
            <p className="text-xs text-slate-500">Store Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

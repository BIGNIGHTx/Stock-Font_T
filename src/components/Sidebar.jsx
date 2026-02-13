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
    <aside className="w-64 bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col h-screen fixed left-0 top-0 z-50 transition-colors duration-300">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-dark-border">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="text-white font-bold text-xl">⚡</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 dark:text-dark-text">ElectroManage</h1>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${activePage === item.id
              ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-semibold'
              : 'text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg hover:text-gray-900 dark:hover:text-dark-text hover:translate-x-1'
              }`}
          >
            <item.icon size={20} className="mr-3" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* User Profile (Bottom) */}
      <div className="p-4 border-t border-gray-100 dark:border-dark-border">
        <div className="flex items-center p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg cursor-pointer transition-colors">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
            alt="Admin"
            className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-dark-border"
          />
          <div className="ml-3 flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-dark-text">Alex Morgan</p>
            <p className="text-xs text-gray-500 dark:text-dark-muted">Store Manager</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

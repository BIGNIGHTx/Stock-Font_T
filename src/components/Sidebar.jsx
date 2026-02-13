import React from 'react';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, LogOut } from 'lucide-react';
import { Text } from '../components/text';

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
      <div className="h-24 flex items-center px-5 border-b border-gray-100 dark:border-dark-border bg-gray-50 dark:bg-dark-surface transition-all duration-300">
        <img
          src="/logo.jpg"
          alt="SomBoon ElecTric Logo"
          className="w-14 h-14 rounded-[18px] object-cover shadow-lg flex-shrink-0"
        />
        <div className="ml-3 flex flex-col justify-center overflow-hidden w-full pr-1">
          <div className="font-extrabold leading-none tracking-tight">
            <Text as="span" className="block text-xl bg-gradient-to-r from-gray-600 via-black to-gray-600 dark:from-gray-400 dark:via-white dark:to-gray-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] pb-0.5">
              SomBoon
            </Text>
            <Text as="span" className="block text-xl bg-gradient-to-r from-gray-600 via-black to-gray-600 dark:from-gray-400 dark:via-white dark:to-gray-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto] delay-75">
              ElecTric
            </Text>
          </div>
          <Text className="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1 tracking-wide uppercase">Stock Management</Text>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .animate-gradient {
          animation: gradient 3s linear infinite;
        }
      `}</style>

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
            <Text as="span">{item.label}</Text>
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
            <Text className="text-sm font-semibold text-gray-800 dark:text-dark-text">Alex Morgan</Text>
            <Text className="text-xs text-gray-500 dark:text-dark-muted">Store Manager</Text>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

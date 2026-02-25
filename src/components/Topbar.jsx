import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Package,
  ShoppingCart,
  BarChart2,
  Settings,
  Search,
  Moon,
  Sun,
  Bell,
  CircleHelp,
  Menu,
  X
} from 'lucide-react';

const Topbar = ({ darkMode, setDarkMode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine active page from current path
  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  const navItems = [
    { id: 'dashboard', path: '/', label: 'Dashboard', icon: LayoutGrid },
    { id: 'inventory', path: '/inventory', label: 'Inventory', icon: Package },
    { id: 'sales', path: '/sales', label: 'Sales', icon: ShoppingCart },
    { id: 'reports', path: '/reports', label: 'Reports', icon: BarChart2 },
    { id: 'settings', path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border w-full font-sans sticky top-0 z-50 transition-colors duration-300">

        {/* --- ฝั่งซ้าย: โลโก้และชื่อแบรนด์ --- */}
        <div className="flex items-center gap-3">
          {/* ไอคอน S */}
          <div className="flex items-center justify-center w-[42px] h-[42px] bg-[#0a0a0a] dark:bg-dark-bg rounded-xl text-white font-serif italic text-2xl shadow-sm transition-colors border border-transparent dark:border-dark-border">
            S
          </div>

          {/* ข้อความแบรนด์ */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1 leading-tight">
              <span className="text-[20px] font-bold text-gray-900 dark:text-dark-text">SomBoon </span>
              <span className="text-[24px] font-black italic font-display animate-electric tracking-tighter">
                Electric
              </span>
            </div>
            <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 tracking-[0.22em] mt-0.5">
              STOCK MANAGEMENT
            </div>
          </div>
        </div>

        {/* --- ตรงกลาง: เมนูเนวิเกชัน (Desktop) --- */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.id || (item.id === 'dashboard' && location.pathname === '/dashboard');
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-[15px] transition-colors cursor-pointer ${isActive
                  ? 'bg-[#f0f4f8] dark:bg-dark-bg text-gray-800 dark:text-gray-100 font-semibold shadow-inner'
                  : 'text-[#64748b] dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-dark-bg'
                  }`}
              >
                <Icon strokeWidth={2} className="w-[18px] h-[18px]" />
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* --- ฝั่งขวา: เครื่องมือค้นหาและโปรไฟล์ --- */}
        <div className="flex items-center gap-3 md:gap-5">

          {/* ช่องค้นหา (ซ่อนบน mobile เล็ก) */}
          <div className="relative hidden sm:block">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search..."
              className="w-[180px] lg:w-[260px] py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-full focus:outline-none focus:ring-2 focus:ring-[#646cff] dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700 dark:text-dark-text shadow-sm transition-colors"
            />
          </div>

          {/* เส้นแบ่ง (Divider) - ซ่อนบน mobile */}
          <div className="h-[24px] w-[1px] bg-gray-200 dark:bg-dark-border mx-1 hidden sm:block"></div>

          {/* ไอคอนการตั้งค่า/แจ้งเตือน */}
          <div className="flex items-center gap-3 text-[#64748b] dark:text-gray-400">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button className="relative hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer">
              <Bell className="w-5 h-5" />
              {/* จุดแจ้งเตือนสีแดง */}
              <span className="absolute top-[2px] right-[2px] w-2 h-2 bg-[#ef4444] rounded-full border border-white dark:border-dark-bg"></span>
            </button>

            <button className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer hidden sm:block">
              <CircleHelp className="w-5 h-5" />
            </button>
          </div>

          {/* รูปโปรไฟล์ */}
          <div className="flex items-center justify-center cursor-pointer ml-1">
            {/* กรอบสีม่วงด้านนอก */}
            <div className="p-[2px] rounded-full border-[1.5px] border-[#8b5cf6]">
              {/* รูป Avatar */}
              <div className="w-[32px] h-[32px] rounded-full bg-[#fed7aa] flex items-center justify-center">
                <div className="w-[14px] h-[14px] bg-white rounded-[3px] opacity-80"></div>
              </div>
            </div>
          </div>

          {/* Hamburger Menu Button (Mobile) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 dark:text-dark-muted hover:bg-slate-100 dark:hover:bg-dark-bg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* --- Mobile Nav Dropdown --- */}
      {mobileMenuOpen && (
        <div className="md:hidden w-full bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border sticky top-[65px] z-40 shadow-lg animate-fade-in">
          <div className="flex flex-col px-4 py-2 gap-1">
            {navItems.map((item) => {
              const isActive = currentPath === item.id || (item.id === 'dashboard' && location.pathname === '/dashboard');
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.path)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-colors cursor-pointer w-full text-left ${isActive
                    ? 'bg-[#f0f4f8] dark:bg-slate-800 text-gray-800 dark:text-gray-100 font-semibold'
                    : 'text-[#64748b] dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <Icon strokeWidth={2} className="w-[18px] h-[18px]" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Topbar;

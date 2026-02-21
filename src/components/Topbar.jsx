import React from 'react';
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
  CircleHelp 
} from 'lucide-react';

const Topbar = ({ activePage, setActivePage, darkMode, setDarkMode }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'sales', label: 'Sales', icon: ShoppingCart },
    { id: 'reports', label: 'Reports', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-dark-surface border-b border-gray-100 dark:border-dark-border w-full font-sans sticky top-0 z-50 transition-colors duration-300">
      
      {/* --- ฝั่งซ้าย: โลโก้และชื่อแบรนด์ --- */}
      <div className="flex items-center gap-3">
        {/* ไอคอน S */}
        <div className="flex items-center justify-center w-[42px] h-[42px] bg-[#141b2c] dark:bg-gray-800 rounded-xl text-white font-serif italic text-2xl shadow-sm">
          S
        </div>
        
        {/* ข้อความแบรนด์ */}
        <div className="flex flex-col">
          <div className="text-[20px] font-bold leading-tight">
            <span className="text-gray-900 dark:text-dark-text">SomBoon </span>
            <span className="text-[#646cff] dark:text-blue-400">Electric</span>
          </div>
          <div className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 tracking-[0.22em] mt-[2px]">
            STOCK MANAGEMENT
          </div>
        </div>
      </div>

      {/* --- ตรงกลาง: เมนูเนวิเกชัน --- */}
      <div className="flex items-center gap-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-[15px] transition-colors ${
                isActive 
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

      {/* --- ฝั่งขวา: เครื่องมือค้นหาและโปรไฟล์ --- */}
      <div className="flex items-center gap-5">
        
        {/* ช่องค้นหา */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="w-[260px] py-2.5 pl-10 pr-4 text-sm bg-white dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-full focus:outline-none focus:ring-2 focus:ring-[#646cff] dark:focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-gray-700 dark:text-dark-text shadow-sm transition-colors"
          />
        </div>

        {/* เส้นแบ่ง (Divider) */}
        <div className="h-[24px] w-[1px] bg-gray-200 dark:bg-dark-border mx-1"></div>

        {/* ไอคอนการตั้งค่า/แจ้งเตือน */}
        <div className="flex items-center gap-4 text-[#64748b] dark:text-gray-400">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <button className="relative hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <Bell className="w-5 h-5" />
            {/* จุดแจ้งเตือนสีแดง */}
            <span className="absolute top-[2px] right-[2px] w-2 h-2 bg-[#ef4444] rounded-full border border-white dark:border-dark-surface"></span>
          </button>
          
          <button className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            <CircleHelp className="w-5 h-5" />
          </button>
        </div>

        {/* รูปโปรไฟล์ */}
        <div className="flex items-center justify-center cursor-pointer ml-1">
          {/* กรอบสีม่วงด้านนอก */}
          <div className="p-[2px] rounded-full border-[1.5px] border-[#8b5cf6]">
            {/* รูป Avatar (จำลองตามรูปต้นฉบับ) */}
            <div className="w-[32px] h-[32px] rounded-full bg-[#fed7aa] flex items-center justify-center">
               {/* จำลองไอคอนข้างใน avatar ของ user */}
              <div className="w-[14px] h-[14px] bg-white rounded-[3px] opacity-80"></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Topbar;

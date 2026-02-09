import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Wallet, TrendingUp, AlertTriangle, Download, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- ดึงข้อมูลจาก Backend ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, salesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/products/'),
          axios.get('http://127.0.0.1:8000/sales/')
        ]);
        setProducts(productsRes.data);
        setSales(salesRes.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // --- คำนวณสถิติจากข้อมูลจริง ---
  const totalProducts = products.length;
  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + s.total_price, 0);
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  // ข้อมูลสำหรับกราฟ (จัดกลุ่มยอดขายตามวัน 7 วันล่าสุด)
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const today = new Date().toISOString().split('T')[0];

  const salesByDay = last7Days.map(date => {
    // กรองข้อมูลการขายตามวัน
    const daySales = sales.filter(s => {
      // ถ้าไม่มี created_at ให้ถือว่าเป็นวันนี้
      if (!s.created_at) {
        return date === today;
      }
      // แปลง created_at เป็น date string YYYY-MM-DD
      try {
        const saleDate = new Date(s.created_at).toISOString().split('T')[0];
        return saleDate === date;
      } catch {
        // ถ้า parse ไม่ได้ ให้นับเป็นวันนี้
        return date === today;
      }
    });
    const total = daySales.reduce((acc, s) => acc + s.total_price, 0);
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    return { day: dayName, val: Math.round(total) }; // ปัดเศษเพื่อให้กราฟดูสวย
  });

  // Debug: ดูข้อมูลที่ใช้ในกราฟ
  console.log('📊 Chart Data:', { salesByDay, totalSales: sales.length, today });

  // ข้อมูลสำหรับ Pie Chart (จัดกลุ่มสินค้าตามชื่อที่มีคำหลัก)
  const categorizeProduct = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('phone') || lower.includes('samsung') || lower.includes('iphone')) return 'Mobile';
    if (lower.includes('laptop') || lower.includes('macbook') || lower.includes('computer')) return 'Computers';
    if (lower.includes('watch') || lower.includes('band')) return 'Wearables';
    if (lower.includes('tv') || lower.includes('television') || lower.includes('oled')) return 'TV & Display';
    if (lower.includes('headphone') || lower.includes('speaker') || lower.includes('audio')) return 'Audio';
    return 'Others';
  };

  const categoryStats = products.reduce((acc, p) => {
    const cat = categorizeProduct(p.name);
    if (!acc[cat]) acc[cat] = 0;
    acc[cat] += p.price * p.stock;
    return acc;
  }, {});

  const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];
  const pieData = Object.entries(categoryStats).map(([name, value], idx) => ({
    name,
    value,
    color: colors[idx % colors.length]
  })).sort((a, b) => b.value - a.value);

  const topCategory = pieData[0] || { name: 'N/A', value: 0 };

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, Admin!</h2>
          <p className="text-slate-500 mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
            <Download size={18} className="mr-2" /> Export
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm shadow-blue-200">
            <Plus size={18} className="mr-2" /> Add Product
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Products</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">
              {isLoading ? '-' : totalProducts}
            </h3>
            <p className="text-blue-500 text-xs font-medium mt-2">Items in inventory</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Package size={24} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Stock Value</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">
              {isLoading ? '-' : `฿${totalStockValue.toLocaleString()}`}
            </h3>
            <p className="text-purple-500 text-xs font-medium mt-2">Inventory worth</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Wallet size={24} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Revenue</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">
              {isLoading ? '-' : `฿${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </h3>
            <p className="text-green-500 text-xs font-medium mt-2 flex items-center">
              <TrendingUp size={14} className="mr-1" /> From {sales.length} sales
            </p>
          </div>
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <TrendingUp size={24} />
          </div>
        </div>

        {/* Card 4 (Low Stock - Special Style) */}
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm flex justify-between items-start relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-red-600 text-sm font-medium">Low Stock Alert</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">
              {isLoading ? '-' : `${lowStockProducts} Items`}
            </h3>
            <div className="mt-3 inline-flex items-center px-2 py-1 bg-white/60 rounded-lg">
                <span className="text-red-600 text-xs font-bold mr-1">
                  {lowStockProducts > 0 ? 'Action Required' : 'All Good'}
                </span>
                <span className="text-slate-500 text-xs">
                  {lowStockProducts > 0 ? 'restock needed' : 'stock healthy'}
                </span>
            </div>
          </div>
          <div className="p-3 bg-white rounded-xl text-red-500 shadow-sm relative z-10">
            <AlertTriangle size={24} />
          </div>
          {/* Decorative Circle */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-100 rounded-full blur-2xl opacity-50"></div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sales Trends */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Sales Trends</h3>
                    <p className="text-sm text-slate-400">Daily revenue for the last 7 days</p>
                </div>
                <select className="bg-slate-50 border-none text-sm rounded-lg p-2 outline-none cursor-pointer">
                    <option>Last 7 Days</option>
                </select>
            </div>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-slate-400">Loading chart...</div>
            ) : sales.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                <TrendingUp size={48} className="mb-3 opacity-20" />
                <p className="font-medium">No sales data yet</p>
                <p className="text-xs mt-1">Start recording sales to see trends</p>
              </div>
            ) : (
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByDay}>
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                          <Tooltip 
                            cursor={{fill: '#f1f5f9'}} 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                            formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']}
                          />
                          <Bar dataKey="val" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
            )}
        </div>

        {/* Right: Top Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800">Inventory by Category</h3>
                <p className="text-sm text-slate-400">Stock value distribution</p>
            </div>
            {isLoading ? (
              <div className="flex-1 flex items-center justify-center text-slate-400">Loading...</div>
            ) : pieData.length > 0 ? (
              <>
                <div className="flex-1 flex items-center justify-center relative">
                    <div className="w-48 h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold text-slate-800">
                              {totalStockValue > 0 ? Math.round((topCategory.value / totalStockValue) * 100) : 0}%
                            </span>
                            <span className="text-xs text-slate-400">{topCategory.name}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-4 space-y-3">
                    {pieData.slice(0, 4).map((item) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                            <div className="flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: item.color}}></div>
                                <span className="text-slate-600">{item.name}</span>
                            </div>
                            <span className="font-bold text-slate-800">฿{item.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">No data available</div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

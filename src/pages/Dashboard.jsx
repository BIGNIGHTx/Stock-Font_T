import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Wallet, TrendingUp, AlertTriangle, Download, Plus, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  // Default range: Last 7 days (including today)
  const [chartStartDate, setChartStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [chartEndDate, setChartEndDate] = useState(new Date().toISOString().split('T')[0]);

  // --- Update Clock Every Second ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // --- Delete Sale ---
  const handleDeleteSale = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this sale? Stock will be restored.")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/sales/${saleId}`);
      // Update state locally to reflect changes immediately
      setSales(prevSales => prevSales.filter(s => s.id !== saleId));

      // Also update products if stock was restored (optional: re-fetch products)
      // For simplicity, we can just re-fetch everything or optimistically update
      // Let's re-fetch to be safe and accurate with stock levels
      const productsRes = await axios.get('http://127.0.0.1:8000/products/');
      setProducts(productsRes.data);

    } catch (error) {
      console.error("Error deleting sale:", error);
      alert("Failed to delete sale");
    }
  };

  // --- คำนวณสถิติจากข้อมูลจริง ---
  const totalProducts = products.length;
  // const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0); // Unused for now
  const totalRevenue = sales.reduce((acc, s) => acc + s.total_price, 0);
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  // คำนวณต้นทุนของสินค้าที่ขายไปแล้ว (COGS)
  const totalCOGS = sales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.product_id);
    if (product) {
      // ถ้ามี cost_price ให้ใช้ ถ้าไม่มีให้ใช้ 60% ของราคาขาย
      const costPrice = product.cost_price || (product.price * 0.6);
      return acc + (costPrice * sale.quantity);
    }
    return acc;
  }, 0);

  // คำนวณกำไร
  const grossProfit = totalRevenue - totalCOGS;
  const profitMargin = totalRevenue > 0
    ? ((grossProfit / totalRevenue) * 100).toFixed(1)
    : 0;

  // --- Generate Last 30 Days for Dropdown ---
  // --- Generate Last 30 Days for Dropdown --- (REMOVED)
  // const last30Days = getLast30Days();

  // --- Filter Sales by Selected Date ---
  const dailySales = sales.filter(s => {
    if (!s.created_at) return false;
    // Extract YYYY-MM-DD from created_at (assuming ISO format or similar)
    try {
      return s.created_at.startsWith(selectedDate);
    } catch {
      return false;
    }
  });

  // Calculate daily totals
  const dailyRevenue = dailySales.reduce((acc, s) => acc + s.total_price, 0);
  const dailyItemsSold = dailySales.reduce((acc, s) => acc + s.quantity, 0);


  // --- Generate Date Range for Chart ---
  const getDaysInRange = (start, end) => {
    const days = [];
    const current = new Date(start);
    const endDate = new Date(end);

    // Safety break to prevent infinite loops if something goes wrong
    let count = 0;
    while (current <= endDate && count < 31) {
      days.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
      count++;
    }
    return days;
  };

  const chartDays = getDaysInRange(chartStartDate, chartEndDate);



  const todayStr = new Date().toISOString().split('T')[0];

  const salesByDay = chartDays.map(date => {
    // กรองข้อมูลการขายตามวัน
    const daySales = sales.filter(s => {
      // ถ้าไม่มี created_at ให้ถือว่าเป็นวันนี้ (เฉพาะข้อมูลเก่า)
      if (!s.created_at) {
        return date === todayStr;
      }
      // แปลง created_at เป็น date string YYYY-MM-DD
      try {
        const saleDate = new Date(s.created_at).toISOString().split('T')[0];
        return saleDate === date;
      } catch {
        // ถ้า parse ไม่ได้ ให้นับเป็นวันนี้
        return date === todayStr;
      }
    });
    const total = daySales.reduce((acc, s) => acc + s.total_price, 0);
    // Format: Mon 10 (Day Name + Date)
    const dayName = new Date(date).toLocaleDateString('th-TH', {
      weekday: 'short',
      day: 'numeric'
    });
    return { dateStr: date, day: dayName, val: Math.round(total) }; // เก็บ dateStr ไว้ใช้ตอน click
  });

  // Debug: ดูข้อมูลที่ใช้ในกราฟ
  // console.log('📊 Chart Data:', { salesByDay, totalSales: sales.length, todayStr });

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
  const totalStockValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, Admin!</h2>
          <p className="text-slate-500 mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {/* Real-time Clock */}
          <div className="text-right">
            <div className="text-3xl font-mono font-bold text-slate-700 tracking-tight">
              {currentDateTime.toLocaleTimeString('th-TH', { hour12: false })}
            </div>
            <div className="text-sm text-slate-500 font-medium">
              {currentDateTime.toLocaleDateString('th-TH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
              <Download size={18} className="mr-2" /> Export
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-sm shadow-blue-200">
              <Plus size={18} className="mr-2" /> Add Product
            </button>
          </div>
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

        {/* Card 2: Gross Profit */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Gross Profit</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">
              {isLoading ? '-' : `฿${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </h3>
            <p className={`text-xs font-medium mt-2 ${grossProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {profitMargin}% Margin
            </p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
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

      {/* --- Daily Sales Detail View --- */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Of the Day
              <span className="text-sm font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                {new Date(selectedDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </h3>
            <p className="text-sm text-slate-400">Detailed breakdown of sales for the selected date</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-slate-600">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDate(newDate);
                // No need to sync selectedMonth/chartRange as chart is now manual
              }}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none shadow-sm"
            />
          </div>
        </div>

        {/* Daily Summary Cards (Mini) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-wide">Daily Revenue</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">฿{dailyRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
            <p className="text-orange-600 text-xs font-bold uppercase tracking-wide">Items Sold</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{dailyItemsSold}</p>
          </div>
        </div>

        {/* Daily Sales Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Product</th>
                <th className="px-6 py-3 font-medium text-center">Qty</th>
                <th className="px-6 py-3 font-medium text-right">Total</th>
                <th className="px-6 py-3 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dailySales.length > 0 ? (
                dailySales.map((sale, idx) => {
                  const product = products.find(p => p.id === sale.product_id);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-slate-400">
                        {new Date(sale.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {product ? product.name : `Product ID: ${sale.product_id}`}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-block bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">
                          x{sale.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        ฿{sale.total_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete Sale"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <Package size={32} className="mb-2 opacity-20" />
                      <p>No sales recorded for this date</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sales Trends */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Sales Trends</h3>
              <p className="text-sm text-slate-400">
                Revenue: {new Date(chartDays[0]).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {new Date(chartDays[chartDays.length - 1]).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">From</span>
                <input
                  type="date"
                  value={chartStartDate}
                  max={chartEndDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setChartStartDate(newStart);

                    // Check logic: if range > 7 days, shift End Date
                    const start = new Date(newStart);
                    const end = new Date(chartEndDate);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays > 6) { // 0-6 is 7 days
                      const newEnd = new Date(start);
                      newEnd.setDate(start.getDate() + 6);
                      setChartEndDate(newEnd.toISOString().split('T')[0]);
                    }
                  }}
                  className="bg-white border border-slate-200 text-slate-600 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none shadow-sm"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-medium">To (Max 7 Days)</span>
                <input
                  type="date"
                  value={chartEndDate}
                  min={chartStartDate}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    setChartEndDate(newEnd);

                    // Check logic: if range > 7 days, shift Start Date
                    const end = new Date(newEnd);
                    const start = new Date(chartStartDate);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays > 6) {
                      const newStart = new Date(end);
                      newStart.setDate(end.getDate() - 6);
                      setChartStartDate(newStart.toISOString().split('T')[0]);
                    }
                  }}
                  className="bg-white border border-slate-200 text-slate-600 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none shadow-sm"
                />
              </div>
            </div>
            {/* 
                <select className="bg-slate-50 border-none text-sm rounded-lg p-2 outline-none cursor-pointer">
                    <option>Last 7 Days</option>
                </select> 
                */}
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
                <BarChart
                  data={salesByDay}
                  onClick={(data) => {
                    if (data && data.activePayload && data.activePayload.length > 0) {
                      const clickedDate = data.activePayload[0].payload.dateStr;
                      setSelectedDate(clickedDate);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    dy={10}
                    interval={0} // Show all labels for week view
                  />
                  <Tooltip
                    cursor={{ fill: '#f1f5f9' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: '#64748b' }}
                  />
                  <Bar
                    dataKey="val"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                    activeBar={{ fill: '#2563EB' }} // Highlight on hover/active
                  />
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
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
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

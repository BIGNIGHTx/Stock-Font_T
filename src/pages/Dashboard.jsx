import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Download,
  Plus,
  Calendar,
  Search,
  Bell,
  HelpCircle,
  Trash2,
  Package
} from 'lucide-react';
import { Text } from '../components/text';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ onNavigate }) => {
  // --- Existing State & Logic ---
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  // Initialize selectedDate to today
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

  // --- Fetch Data from Backend ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, salesRes] = await Promise.all([
          axios.get('http://127.0.0.1:8000/products/'),
          axios.get('http://127.0.0.1:8000/sales/')
        ]);

        // Map products to ensure hasVat is consistent
        const mappedProducts = productsRes.data.map(p => ({
          ...p,
          hasVat: p.has_vat !== undefined ? p.has_vat : (p.hasVat !== undefined ? p.hasVat : false)
        }));

        setProducts(mappedProducts);
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
      // Update state locally
      setSales(prevSales => prevSales.filter(s => s.id !== saleId));

      // Update products to reflect restored stock
      const productsRes = await axios.get('http://127.0.0.1:8000/products/');
      setProducts(productsRes.data);

    } catch (error) {
      console.error("Error deleting sale:", error);
      alert("Failed to delete sale");
    }
  };

  // --- Statistics Calculations ---
  const totalProducts = products.length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.total_price, 0);
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  // Calculate COGS and Gross Profit
  const totalCOGS = sales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.product_id);
    if (product) {
      const costPrice = product.cost_price || (product.price * 0.6);
      return acc + (costPrice * sale.quantity);
    }
    return acc;
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;
  const profitMargin = totalRevenue > 0
    ? ((grossProfit / totalRevenue) * 100).toFixed(1)
    : 0;

  // --- Filter Sales by Selected Date ---
  const dailySales = sales.filter(s => {
    if (!s.created_at) return false;
    try {
      return s.created_at.startsWith(selectedDate);
    } catch {
      return false;
    }
  });

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


  // Helper date formatters for the new UI
  const formattedDate = new Date().toLocaleDateString('th-TH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const selectedDateFormatted = new Date(selectedDate).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#F3F5F9] font-sans p-6 md:p-10 text-slate-700">

      {/* ================= Header Section ================= */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 mb-10">
        <div>
          <Text as="h1" className="text-3xl font-bold text-slate-900 mb-2">Welcome back, Admin!</Text>
          <Text className="text-slate-500">Here's what's happening with your store today.</Text>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full xl:w-auto">
          {/* Time & Date Display */}
          <div className="text-right hidden md:block">
            <Text className="text-3xl font-mono font-bold text-slate-800 tracking-tight">
              {currentDateTime.toLocaleTimeString('th-TH', { hour12: false })}
            </Text>
            <Text className="text-sm font-medium text-slate-400">
              {formattedDate}
            </Text>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-all cursor-pointer">
              <Download size={18} />
              <Text as="span">Export</Text>
            </button>
            <button
              onClick={() => onNavigate && onNavigate('inventory', { openAddModal: true })}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#1e293b] text-white rounded-xl font-semibold shadow-lg shadow-slate-300 hover:bg-slate-800 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus size={18} />
              <Text as="span">Add Product</Text>
            </button>
          </div>
        </div>
      </header>

      {/* ================= Stats Grid ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

        {/* Card 1: Total Products */}
        <SoftCard
          title="Total Products"
          value={isLoading ? '-' : totalProducts}
          subLabel="Items in inventory"
          icon={Package}
          iconColor="text-[#26619C]"
          iconBg="bg-[#26619C]/10"
          iconStrokeWidth={2.25}
        />

        {/* Card 2: Gross Profit */}
        <SoftCard
          title="Gross Profit"
          value={isLoading ? '-' : `฿${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subLabel={`${profitMargin}% Margin`}
          subLabelColor={grossProfit >= 0 ? "text-green-600" : "text-red-600"}
          icon={Wallet}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
        />

        {/* Card 3: Total Revenue */}
        <SoftCard
          title="Total Revenue"
          value={isLoading ? '-' : `฿${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subLabel={`From ${sales.length} sales`}
          subLabelColor="text-green-600"
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />

        {/* Card 4: Low Stock Alert (Special Style) */}
        <div className="relative overflow-hidden bg-red-50/50 border border-red-100 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between h-36 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl cursor-pointer">
          <div className="absolute top-0 right-0 p-6">
            <div className="bg-white/80 p-2 rounded-xl shadow-sm text-red-500">
              <AlertTriangle size={24} />
            </div>
          </div>
          <div>
            <Text as="h3" className="text-red-800 text-sm font-semibold mb-1">Low Stock Alert</Text>
            <Text className="text-3xl font-bold text-slate-800">{isLoading ? '-' : `${lowStockProducts} Items`}</Text>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs font-bold px-2 py-1 rounded-md ${lowStockProducts > 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
              <Text as="span">{lowStockProducts > 0 ? 'Action Required' : 'All Good'}</Text>
            </span>
            <Text as="span" className="text-xs text-red-400">
              {lowStockProducts > 0 ? 'restock needed' : 'stock healthy'}
            </Text>
          </div>
        </div>

      </div>

      {/* ================= Daily Section ================= */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100 mb-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Text as="h2" className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Of the Day <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 font-normal">
                <Text as="span">{selectedDateFormatted}</Text>
              </span>
            </Text>
            <Text className="text-slate-400 text-sm mt-1">Detailed breakdown of sales for the selected date</Text>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl">
            <Text as="span" className="text-sm text-slate-500 font-medium">Select Date:</Text>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-slate-700 font-semibold focus:outline-none text-sm cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
          </div>
        </div>

        {/* Colored Summary Boxes */}
        <div className="flex flex-col md:flex-row gap-6 mb-10">
          <div className="flex-1 bg-[#F0F4FF] rounded-2xl p-6 border border-blue-50">
            <Text as="h4" className="text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">Daily Revenue</Text>
            <Text className="text-3xl font-bold text-slate-800">฿{dailyRevenue.toLocaleString()}</Text>
          </div>

          <div className="flex-1 bg-[#FFF8F0] rounded-2xl p-6 border border-orange-50">
            <Text as="h4" className="text-orange-800 text-xs font-bold uppercase tracking-wider mb-2">Items Sold</Text>
            <Text className="text-3xl font-bold text-slate-800">{dailyItemsSold}</Text>
          </div>
        </div>

        {/* Table Placeholder */}
        <div className="w-full overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 min-w-[600px]">
            <div className="col-span-2"><Text as="span">Time</Text></div>
            <div className="col-span-4"><Text as="span">Product</Text></div>
            <div className="col-span-1 text-center"><Text as="span">Tax</Text></div>
            <div className="col-span-1 text-center"><Text as="span">Qty</Text></div>
            <div className="col-span-2 text-right"><Text as="span">Total</Text></div>
            <div className="col-span-2 text-center"><Text as="span">Action</Text></div>
          </div>

          {/* Table Body */}
          {dailySales.length > 0 ? (
            <div className="space-y-2 min-w-[600px]">
              {dailySales.map((sale, idx) => {
                const product = products.find(p => p.id === sale.product_id);
                return (
                  <div key={idx} className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-slate-50 rounded-xl transition-colors items-center border-b border-slate-50 last:border-0 text-sm">
                    <div className="col-span-2 font-mono text-slate-400">
                      <Text as="span">{new Date(sale.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</Text>
                    </div>
                    <div className="col-span-4 font-medium text-slate-700 flex flex-col justify-center">
                      <Text as="span">{product ? product.name : `Product ID: ${sale.product_id}`}</Text>
                    </div>
                    <div className="col-span-1 text-center flex items-center justify-center">
                      {product && product.hasVat ? (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-bold border border-purple-200">VAT</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] border border-slate-200">No VAT</span>
                      )}
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-bold">
                        <Text as="span">x{sale.quantity}</Text>
                      </span>
                    </div>
                    <div className="col-span-2 text-right font-bold text-emerald-600">
                      <Text as="span">฿{sale.total_price.toLocaleString()}</Text>
                    </div>
                    <div className="col-span-2 text-center">
                      <button
                        onClick={() => handleDeleteSale(sale.id)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all cursor-pointer"
                        title="Delete Sale"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 text-slate-300">
              <Box size={48} strokeWidth={1} className="mb-4 text-slate-200" />
              <Text className="font-medium">No sales recorded for this date</Text>
            </div>
          )}
        </div>

      </div>

      {/* ================= Charts Section (Restored) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">

        {/* Sales Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer">
          <div className="flex justify-between items-center mb-6">
            <div>
              <Text as="h3" className="text-lg font-bold text-slate-800">Sales Trends</Text>
              <Text className="text-sm text-slate-400">
                Revenue: {new Date(chartDays[0]).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {new Date(chartDays[chartDays.length - 1]).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <Text as="span" className="text-[10px] text-slate-400 font-medium">From</Text>
                <input
                  type="date"
                  value={chartStartDate}
                  max={chartEndDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setChartStartDate(newStart);

                    // Logic to ensure max 7 days or similar logic if needed
                    const start = new Date(newStart);
                    const end = new Date(chartEndDate);
                    const diffTime = Math.abs(end - start);
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays > 6) {
                      const newEnd = new Date(start);
                      newEnd.setDate(start.getDate() + 6);
                      setChartEndDate(newEnd.toISOString().split('T')[0]);
                    }
                  }}
                  className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none shadow-sm cursor-pointer hover:border-blue-300 transition-colors [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
              <div className="flex flex-col">
                <Text as="span" className="text-[10px] text-slate-400 font-medium">To (Max 7 Days)</Text>
                <input
                  type="date"
                  value={chartEndDate}
                  min={chartStartDate}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    setChartEndDate(newEnd);
                    // Logic to ensure max 7 days
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
                  className="bg-slate-50 border border-slate-200 text-slate-600 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5 outline-none shadow-sm cursor-pointer hover:border-blue-300 transition-colors [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-slate-400"><Text>Loading chart...</Text></div>
          ) : sales.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <TrendingUp size={48} className="mb-3 opacity-20" />
              <Text className="font-medium">No sales data yet</Text>
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
                    interval={0}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']}
                    labelStyle={{ color: '#64748b' }}
                  />
                  <Bar
                    dataKey="val"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                    activeBar={{ fill: '#2563EB' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Categories Pie Chart */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer">
          <div className="mb-4">
            <Text as="h3" className="text-lg font-bold text-slate-800">Inventory by Category</Text>
            <Text className="text-sm text-slate-400">Stock value distribution</Text>
          </div>

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-slate-400"><Text>Loading...</Text></div>
          ) : pieData.length > 0 ? (
            <>
              <div className="flex-1 flex items-center justify-center relative">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Text */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <Text as="span" className="text-3xl font-bold text-slate-800">
                      {totalStockValue > 0 ? Math.round((topCategory.value / totalStockValue) * 100) : 0}%
                    </Text>
                    <Text as="span" className="text-xs text-slate-400">{topCategory.name}</Text>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {pieData.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                      <Text as="span" className="text-slate-600">{item.name}</Text>
                    </div>
                    <Text as="span" className="font-bold text-slate-800">฿{item.value.toLocaleString()}</Text>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400"><Text>No data available</Text></div>
          )}
        </div>

      </div>

    </div>
  );
};

// Reusable Soft Card Component
const SoftCard = ({ title, value, subLabel, icon: Icon, iconColor, iconBg, subLabelColor = "text-slate-400", iconSize = 24, iconStrokeWidth }) => {
  return (
    <div className="relative bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 h-36 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl cursor-pointer">
      <div className="absolute top-0 right-0 p-6">
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor} shadow-sm`}>
          <Icon size={iconSize} strokeWidth={iconStrokeWidth} />
        </div>
      </div>

      <div>
        <Text as="h3" className="text-slate-500 text-sm font-medium mb-1">{title}</Text>
        <Text className="text-3xl font-bold text-slate-800 tracking-tight">{value}</Text>
      </div>

      <Text className={`text-xs font-semibold ${subLabelColor}`}>
        {subLabel}
      </Text>
    </div>
  );
};

export default Dashboard;

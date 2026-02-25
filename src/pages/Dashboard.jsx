import React, { useState, useEffect } from 'react';
import dashImg from '../assets/dashr.png';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Download,
  Plus,
  Trash2,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Text } from '../components/text';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventoryByCategory, setInventoryByCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isAllCategoriesModalOpen, setIsAllCategoriesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [chartStartDate, setChartStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  });
  const [chartEndDate, setChartEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, salesRes, inventoryRes] = await Promise.all([
          axios.get('https://stock-back-t.onrender.com/products/'),
          axios.get('https://stock-back-t.onrender.com/sales/'),
          axios.get('https://stock-back-t.onrender.com/dashboard/inventory_by_category')
        ]);
        const mappedProducts = productsRes.data.map(p => ({
          ...p,
          hasVat: p.has_vat !== undefined ? p.has_vat : (p.hasVat !== undefined ? p.hasVat : false)
        }));
        setProducts(mappedProducts);
        setSales(salesRes.data);
        setInventoryByCategory(inventoryRes.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDeleteSale = async (saleId) => {
    setIsDeleting(true);
    try {
      await axios.delete(`https://stock-back-t.onrender.com/sales/${saleId}`);
      setSales(prevSales => prevSales.filter(s => s.id !== saleId));
      const productsRes = await axios.get('https://stock-back-t.onrender.com/products/');
      setProducts(productsRes.data);
      setIsDeleteModalOpen(false);
      setSaleToDelete(null);
      showToast('Sale deleted and stock restored successfully.', 'success');
    } catch (error) {
      console.error("Error deleting sale:", error);
      setIsDeleteModalOpen(false);
      setSaleToDelete(null);
      showToast('Failed to delete sale. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const totalProducts = products.length;
  const totalRevenue = sales.reduce((acc, s) => acc + s.total_price, 0);
  const lowStockProducts = products.filter(p => p.stock <= 5).length;

  const totalCOGS = sales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.product_id);
    if (product) {
      const costPrice = product.cost_price || (product.price * 0.6);
      return acc + (costPrice * sale.quantity);
    }
    return acc;
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;
  const profitMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0;

  const dailySales = sales
    .filter(s => {
      if (!s.created_at) return false;
      try { return s.created_at.startsWith(selectedDate); } catch { return false; }
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const dailyRevenue = dailySales.reduce((acc, s) => acc + s.total_price, 0);
  const dailyItemsSold = dailySales.reduce((acc, s) => acc + s.quantity, 0);

  const getDaysInRange = (start, end) => {
    const days = [];
    const current = new Date(start);
    const endDate = new Date(end);
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
    const daySales = sales.filter(s => {
      if (!s.created_at) return date === todayStr;
      try {
        const saleDate = new Date(s.created_at).toISOString().split('T')[0];
        return saleDate === date;
      } catch { return date === todayStr; }
    });
    const total = daySales.reduce((acc, s) => acc + s.total_price, 0);
    const dayName = new Date(date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric' });
    return { dateStr: date, day: dayName, val: Math.round(total) };
  });

  const colors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'];

  const pieData = inventoryByCategory.map((cat, idx) => {
    const value = cat.products.reduce((acc, p) => {
      const costPrice = p.cost_price || (p.price * 0.6);
      return acc + (costPrice * p.stock);
    }, 0);
    return {
      name: cat.category_name,
      value: value,
      color: colors[idx % colors.length],
      raw: cat
    };
  }).sort((a, b) => b.value - a.value);

  const topCategory = pieData[0] || { name: 'N/A', value: 0 };
  const totalStockValue = pieData.reduce((acc, item) => acc + item.value, 0);

  const formattedDate = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  const selectedDateFormatted = new Date(selectedDate).toLocaleDateString('th-TH', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-bg font-sans flex flex-col items-center transition-colors duration-300">

      {/* ================= Toast Notification ================= */}
      {toast && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300
            ${toast.type === 'success'
              ? 'bg-white border-green-100 text-green-700 shadow-green-100/60'
              : 'bg-white border-red-100 text-red-600 shadow-red-100/60'
            }`}
        >
          {toast.type === 'success'
            ? <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
            : <XCircle size={20} className="text-red-500 flex-shrink-0" />
          }
          <Text as="span">{toast.message}</Text>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-slate-300 hover:text-slate-500 transition-colors cursor-pointer"
          >
            <Plus size={16} className="rotate-45" />
          </button>
        </div>
      )}

      <div className="w-full max-w-[1280px] flex flex-col">
        <div className="flex-1 p-4 md:p-6 text-slate-700 dark:text-dark-text transition-colors duration-300">

          {/* ================= Header Section ================= */}
          <header className="relative mb-8 mt-2 perspective-1000 stagger-item delay-1 will-change-transform">
            {/* 3D Floor Shadow */}
            <div className="absolute inset-x-10 -bottom-3 h-6 bg-slate-900/10 blur-xl rounded-full"></div>

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center p-5 bg-[#0a0a0a] dark:bg-dark-surface border border-slate-800 dark:border-dark-border rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.6)] transform transition-transform duration-700 hover:rotate-x-1">
              <div className="flex items-center gap-4">
                {/* 3D Glowing Icon */}
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-30 animate-pulse"></div>
                  <div className="relative w-12 h-12 flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <img
                      src={dashImg}
                      alt="Dashboard"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <style dangerouslySetInnerHTML={{
                      __html: `
                      @keyframes colorCycle {
                        0% { color: #ef4444; }   /* Red */
                        20% { color: #fbbf24; }  /* Yellow */
                        40% { color: #a855f7; }  /* Purple */
                        60% { color: #2563eb; }  /* Blue */
                        80% { color: #06b6d4; }  /* Light Blue/Cyan */
                        100% { color: #ef4444; } /* Back to Red */
                      }
                      .animate-dashboard-text {
                        animation: colorCycle 6s infinite linear;
                      }
                    `}} />
                    <Text as="h1" className="text-3xl font-black tracking-tighter italic drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] animate-dashboard-text">
                      DASHBOARD
                    </Text>
                    <div className="px-2 py-0.5 bg-[#2563eb] text-white rounded-full text-[8px] font-black uppercase tracking-widest shadow-[0_4px_8px_rgba(37,99,235,0.4)] animate-bounce leading-none flex items-center justify-center h-5">
                      Active
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse"></div>
                      <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse [animation-delay:200ms]"></div>
                      <div className="w-1 h-1 rounded-full bg-blue-600 animate-pulse [animation-delay:400ms]"></div>
                    </div>
                    <Text className="text-blue-200 text-[10px] font-bold tracking-widest uppercase">
                      Premium Management Terminal
                    </Text>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 md:mt-0">
                <div className="flex flex-col items-end hidden lg:block">
                  <Text className="text-xl font-black text-white font-mono tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    {currentDateTime.toLocaleTimeString('th-TH', { hour12: false })}
                  </Text>
                  <Text className="text-xs font-bold text-slate-400 uppercase tracking-wide">{formattedDate}</Text>
                </div>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 border border-emerald-500 rounded-xl font-black text-white shadow-[0_8px_20px_rgba(16,185,129,0.3),inset_0_2px_4px_rgba(255,255,255,0.3)] hover:bg-emerald-500 hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer text-xs group">
                    <Download size={16} className="text-white group-hover:scale-125 transition-transform" />
                    <span>EXPORT PDF</span>
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* ================= Stats Grid ================= */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5 stagger-item delay-2 will-change-transform">
            <SoftCard
              title="Total Products"
              value={isLoading ? '-' : totalProducts}
              subLabel="Items in inventory"
              icon={Package}
              iconColor="text-[#26619C]"
              iconBg="bg-[#26619C]/10"
              iconStrokeWidth={2.25}
            />
            <SoftCard
              title="Gross Profit"
              value={isLoading ? '-' : `฿${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              subLabel={`${profitMargin}% Margin`}
              subLabelColor={grossProfit >= 0 ? "text-green-600" : "text-red-600"}
              icon={Wallet}
              iconColor="text-emerald-600"
              iconBg="bg-emerald-50"
            />
            <SoftCard
              title="Total Revenue"
              value={isLoading ? '-' : `฿${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              subLabel={`From ${sales.length} sales`}
              subLabelColor="text-green-600"
              icon={TrendingUp}
              iconColor="text-green-600"
              iconBg="bg-green-50"
            />
            <div
              onClick={() => setIsLowStockModalOpen(true)}
              className="relative overflow-hidden bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-[2rem] p-4 shadow-sm flex flex-col justify-between h-28 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl cursor-pointer group"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-white/80 dark:bg-red-900/40 p-2 rounded-xl shadow-sm text-red-500 group-hover:scale-110 transition-transform">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div>
                <Text as="h3" className="text-red-800 dark:text-red-400 text-xs font-semibold mb-1">Low Stock Alert</Text>
                <Text className="text-2xl font-bold text-slate-800 dark:text-dark-text">{isLoading ? '-' : `${lowStockProducts} Items`}</Text>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${lowStockProducts > 0 ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                  <Text as="span">{lowStockProducts > 0 ? 'Click to View' : 'All Good'}</Text>
                </span>
                <Text as="span" className="text-xs text-red-400">
                  {lowStockProducts > 0 ? 'restock needed' : 'stock healthy'}
                </Text>
              </div>
            </div>
          </div>

          {/* ================= Low Stock Modal ================= */}
          {isLowStockModalOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 animate-fade-in">
              <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm" onClick={() => setIsLowStockModalOpen(false)}></div>
              <div className="relative bg-white dark:bg-dark-surface rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-dark-border">
                <div className="px-8 py-6 border-b border-slate-100 dark:border-dark-border flex justify-between items-center bg-red-50 dark:bg-red-950/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl"><AlertTriangle size={24} /></div>
                    <div>
                      <Text as="h3" className="font-bold text-xl text-red-900 dark:text-red-300">Low Stock Items</Text>
                      <Text className="text-red-600 dark:text-red-400 text-sm">Products with stock 5 units or less</Text>
                    </div>
                  </div>
                  <button onClick={() => setIsLowStockModalOpen(false)} className="p-2 hover:bg-red-100 rounded-full text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="p-0 max-h-[60vh] overflow-y-auto">
                  {products.filter(p => p.stock <= 5).length > 0 ? (
                    <table className="w-full text-left text-sm text-slate-600 dark:text-dark-muted">
                      <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-100 dark:border-dark-border text-slate-500 dark:text-dark-muted font-semibold uppercase text-xs sticky top-0">
                        <tr>
                          <th className="px-6 py-4">Product Name</th>
                          <th className="px-6 py-4 text-center">SKU</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-center">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                        {products.filter(p => p.stock <= 5).map(p => (
                          <tr key={p.id} className="hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800 dark:text-dark-text">{p.name}</td>
                            <td className="px-6 py-4 text-center font-mono text-slate-500 dark:text-dark-muted">{p.sku}</td>
                            <td className="px-6 py-4 text-center">
                              {p.stock === 0
                                ? <span className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded-md text-xs font-bold border border-red-200 dark:border-red-900/50">Out of Stock</span>
                                : <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 rounded-md text-xs font-bold border border-orange-200 dark:border-orange-900/50">Low Stock</span>}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-red-600 dark:text-red-400 font-bold text-lg">{p.stock}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-12 text-center flex flex-col items-center gap-4 text-slate-400">
                      <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-2">
                        <TrendingUp size={32} />
                      </div>
                      <Text className="text-lg font-semibold text-slate-600">All stocks are healthy!</Text>
                      <Text>No items are currently below the low stock threshold.</Text>
                    </div>
                  )}
                </div>

                <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button onClick={() => setIsLowStockModalOpen(false)} className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors cursor-pointer">
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= Bottom 2-column Layout ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-6">

            {/* Left Column */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-surface rounded-[2rem] p-5 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100 dark:border-dark-border stagger-item delay-3 will-change-transform">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                  <div>
                    <Text as="h2" className="text-base font-bold text-slate-800 dark:text-dark-text flex items-center gap-2">
                      Of the Day <span className="px-3 py-1 bg-slate-100 dark:bg-dark-bg rounded-full text-xs text-slate-500 dark:text-dark-muted font-normal">
                        <Text as="span">{selectedDateFormatted}</Text>
                      </span>
                    </Text>
                    <Text className="text-slate-400 dark:text-dark-muted text-xs mt-0.5">Detailed breakdown of sales for the selected date</Text>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border px-3 py-1.5 rounded-xl">
                    <Text as="span" className="text-xs text-slate-500 dark:text-dark-muted font-medium">Select Date:</Text>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-slate-700 dark:text-dark-text font-semibold focus:outline-none text-xs cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer dark:invert dark:opacity-70"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <div className="flex-1 bg-[#F0F4FF] dark:bg-dark-bg rounded-xl p-3 border border-blue-50 dark:border-dark-border">
                    <Text as="h4" className="text-blue-800 dark:text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">Daily Revenue</Text>
                    <Text className="text-xl font-bold text-slate-800 dark:text-dark-text">฿{dailyRevenue.toLocaleString()}</Text>
                  </div>
                  <div className="flex-1 bg-[#FFF8F0] dark:bg-dark-bg rounded-xl p-3 border border-orange-50 dark:border-dark-border">
                    <Text as="h4" className="text-orange-800 dark:text-orange-400 text-[10px] font-bold uppercase tracking-wider mb-1">Items Sold</Text>
                    <Text className="text-xl font-bold text-slate-800 dark:text-dark-text">{dailyItemsSold}</Text>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 dark:bg-dark-bg rounded-xl text-xs font-bold text-slate-500 dark:text-dark-muted uppercase tracking-wider mb-2 min-w-[500px]">
                    <div className="col-span-2"><Text as="span">Time</Text></div>
                    <div className="col-span-4"><Text as="span">Product</Text></div>
                    <div className="col-span-1 text-center"><Text as="span">Tax</Text></div>
                    <div className="col-span-1 text-center"><Text as="span">Qty</Text></div>
                    <div className="col-span-2 text-right"><Text as="span">Total</Text></div>
                    <div className="col-span-2 text-center"><Text as="span">Action</Text></div>
                  </div>

                  {dailySales.length > 0 ? (
                    <div className="space-y-1 min-w-[500px]">
                      {dailySales.map((sale, idx) => {
                        const product = products.find(p => p.id === sale.product_id);
                        return (
                          <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-bg/50 rounded-xl transition-colors items-center border-b border-slate-50 dark:border-dark-border last:border-0 text-sm">
                            <div className="col-span-2 font-mono text-slate-400 dark:text-dark-muted">
                              <Text as="span">{new Date(sale.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</Text>
                            </div>
                            <div className="col-span-4 font-medium text-slate-700 dark:text-dark-text flex flex-col justify-center">
                              <Text as="span">
                                {product ? (
                                  <><span className="text-slate-400 text-xs mr-1 font-bold">[{product.sku}]</span>{product.name}</>
                                ) : `Product ID: ${sale.product_id}`}
                              </Text>
                            </div>
                            <div className="col-span-1 text-center flex items-center justify-center">
                              {product && product.hasVat
                                ? <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded text-[10px] font-bold border border-purple-200 dark:border-purple-800/50">VAT</span>
                                : <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-muted rounded text-[10px] border border-slate-200 dark:border-dark-border">No VAT</span>}
                            </div>
                            <div className="col-span-1 text-center">
                              <span className="inline-block bg-slate-100 dark:bg-dark-bg text-slate-600 dark:text-dark-text px-2 py-1 rounded text-xs font-bold">
                                <Text as="span">x{sale.quantity}</Text>
                              </span>
                            </div>
                            <div className="col-span-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                              <Text as="span">฿{sale.total_price.toLocaleString()}</Text>
                            </div>
                            <div className="col-span-2 text-center">
                              <button
                                onClick={() => {
                                  setSaleToDelete(sale);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-all cursor-pointer"
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
                    <div className="flex flex-col items-center justify-center py-10 text-slate-300">
                      <Box size={40} strokeWidth={1} className="mb-3 text-slate-200" />
                      <Text className="font-medium text-sm">No sales recorded for this date</Text>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1 flex flex-col gap-4">
              <style dangerouslySetInnerHTML={{
                __html: `
                .recharts-pie-sector:focus { outline: none !important; }
                .recharts-layer:focus { outline: none !important; }
                .recharts-surface:focus { outline: none !important; }
                .recharts-pie-sector { cursor: pointer; }
              `}} />

              {/* Inventory by Category */}
              <div
                onClick={() => setIsAllCategoriesModalOpen(true)}
                className="bg-white dark:bg-dark-surface rounded-[2rem] p-5 border border-slate-100 dark:border-dark-border shadow-sm flex flex-col hover:shadow-xl dark:hover:shadow-none transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer outline-none focus:outline-none active:scale-[0.98] select-none stagger-item delay-4 will-change-transform"
              >
                <div className="mb-3">
                  <Text as="h3" className="text-base font-bold text-slate-800 dark:text-dark-text">Inventory by Category</Text>
                  <Text className="text-xs text-slate-400 dark:text-dark-muted">Stock value distribution</Text>
                </div>

                {isLoading ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400"><Text>Loading...</Text></div>
                ) : pieData.length > 0 ? (
                  <>
                    <div className="flex items-center justify-center relative">
                      <div className="w-36 h-36">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              innerRadius={45}
                              outerRadius={62}
                              paddingAngle={5}
                              dataKey="value"
                              onClick={(data, e) => {
                                e.stopPropagation();
                                setSelectedCategory(data.raw);
                              }}
                            >
                              {pieData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} className="outline-none" />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <Text as="span" className="text-2xl font-bold text-slate-800 dark:text-dark-text">
                            {totalStockValue > 0 ? Math.round((topCategory.value / totalStockValue) * 100) : 0}%
                          </Text>
                          <Text as="span" className="text-xs text-slate-400 dark:text-dark-muted">{topCategory.name}</Text>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {pieData.slice(0, 4).map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between items-center text-xs hover:bg-slate-50 dark:hover:bg-dark-bg p-1.5 rounded-lg transition-colors cursor-pointer group/row"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(item.raw);
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                            <Text as="span" className="text-slate-600 dark:text-dark-muted">{item.name}</Text>
                          </div>
                          <Text as="span" className="font-bold text-slate-800 dark:text-dark-text">฿{item.value.toLocaleString()}</Text>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-400"><Text>No data available</Text></div>
                )}
              </div>

              {/* Sales Trends Chart */}
              <div className="bg-white dark:bg-dark-surface rounded-[2rem] p-5 border border-slate-100 dark:border-dark-border shadow-sm hover:shadow-xl dark:hover:shadow-none transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer flex-1 stagger-item delay-5 will-change-transform">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Text as="h3" className="text-base font-bold text-slate-800 dark:text-dark-text">Sales Trends</Text>
                    <Text className="text-xs text-slate-400 dark:text-dark-muted">
                      {new Date(chartDays[0]).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })} - {new Date(chartDays[chartDays.length - 1]).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="flex flex-col">
                      <Text as="span" className="text-[9px] text-slate-400 font-medium">From</Text>
                      <input
                        type="date"
                        value={chartStartDate}
                        max={chartEndDate}
                        onChange={(e) => {
                          const newStart = e.target.value;
                          setChartStartDate(newStart);
                          const start = new Date(newStart);
                          const end = new Date(chartEndDate);
                          const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
                          if (diffDays > 6) {
                            const newEnd = new Date(start);
                            newEnd.setDate(start.getDate() + 6);
                            setChartEndDate(newEnd.toISOString().split('T')[0]);
                          }
                        }}
                        className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 outline-none shadow-sm cursor-pointer hover:border-blue-300 transition-colors [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                    <div className="flex flex-col">
                      <Text as="span" className="text-[9px] text-slate-400 font-medium">To</Text>
                      <input
                        type="date"
                        value={chartEndDate}
                        min={chartStartDate}
                        onChange={(e) => {
                          const newEnd = e.target.value;
                          setChartEndDate(newEnd);
                          const end = new Date(newEnd);
                          const start = new Date(chartStartDate);
                          const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
                          if (diffDays > 6) {
                            const newStart = new Date(end);
                            newStart.setDate(end.getDate() - 6);
                            setChartStartDate(newStart.toISOString().split('T')[0]);
                          }
                        }}
                        className="bg-slate-50 border border-slate-200 text-slate-600 text-[10px] rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1 outline-none shadow-sm cursor-pointer hover:border-blue-300 transition-colors [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {isLoading ? (
                  <div className="h-36 flex items-center justify-center text-slate-400"><Text>Loading chart...</Text></div>
                ) : sales.length === 0 ? (
                  <div className="h-36 flex flex-col items-center justify-center text-slate-400">
                    <TrendingUp size={36} className="mb-2 opacity-20" />
                    <Text className="font-medium text-sm">No sales data yet</Text>
                  </div>
                ) : (
                  <div className="h-36 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={salesByDay}
                        onClick={(data) => {
                          if (data && data.activePayload && data.activePayload.length > 0) {
                            setSelectedDate(data.activePayload[0].payload.dateStr);
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 9 }} dy={8} interval={0} />
                        <Tooltip
                          cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          formatter={(value) => [`฿${value.toLocaleString()}`, 'Revenue']}
                          labelStyle={{ color: '#64748b' }}
                        />
                        <Bar dataKey="val" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={14} activeBar={{ fill: '#2563EB' }} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ================= Category Detail Popup ================= */}
        {
          selectedCategory && (
            <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 px-4">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
                onClick={() => setSelectedCategory(null)}
              ></div>
              <div className="relative bg-white rounded-[1.5rem] shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Package size={20} /></div>
                    <div>
                      <Text as="h3" className="font-bold text-lg text-slate-900">{selectedCategory.category_name} Details</Text>
                      <Text className="text-slate-500 text-[10px]">Product breakdown and inventory status</Text>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="p-0 max-h-[60vh] overflow-y-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-[10px] sticky top-0">
                      <tr>
                        <th className="px-5 py-3">Product Name</th>
                        <th className="px-5 py-3 text-center">SKU</th>
                        <th className="px-5 py-3 text-center">Stock</th>
                        <th className="px-5 py-3 text-right">Cost Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedCategory.products.length > 0 ? (
                        selectedCategory.products.map(p => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors text-xs">
                            <td className="px-5 py-3 font-bold text-slate-800">{p.name}</td>
                            <td className="px-5 py-3 text-center font-mono text-slate-400 text-[10px]">{p.sku}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${p.stock <= 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right font-bold text-blue-600">
                              ฿{((p.cost_price || (p.price * 0.6)) * p.stock).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-slate-400">
                            <Text>No products found in this category.</Text>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                  <div className="flex flex-col">
                    <Text className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Total Value</Text>
                    <Text className="text-lg font-bold text-slate-800">
                      ฿{selectedCategory.products.reduce((acc, p) => acc + ((p.cost_price || (p.price * 0.6)) * p.stock), 0).toLocaleString()}
                    </Text>
                  </div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="px-5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )
        }

        {/* ================= Full Categories List Modal ================= */}
        {
          isAllCategoriesModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 px-4">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
                onClick={() => setIsAllCategoriesModalOpen(false)}
              ></div>

              <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col">

                {/* Header */}
                <div className="px-6 pt-6 pb-4 flex justify-between items-start flex-shrink-0">
                  <div>
                    <Text as="h3" className="font-bold text-xl text-slate-900">Inventory Distribution</Text>
                    <Text className="text-slate-500 text-[10px]">Full breakdown of stock value by category</Text>
                  </div>
                  <button
                    onClick={() => setIsAllCategoriesModalOpen(false)}
                    className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <Plus size={24} className="rotate-45" />
                  </button>
                </div>

                {/* Scrollable list — shows 4 rows then scrolls */}
                <div className="px-6 pb-2 overflow-y-auto" style={{ maxHeight: '272px' }}>
                  <div className="space-y-2">
                    {pieData.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                        onClick={() => {
                          setIsAllCategoriesModalOpen(false);
                          setSelectedCategory(item.raw);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full shadow-sm flex-shrink-0" style={{ backgroundColor: item.color }}></div>
                          <div>
                            <Text className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{item.name}</Text>
                            <Text className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">{item.raw.products.length} Products</Text>
                          </div>
                        </div>
                        <div className="text-right">
                          <Text className="font-bold text-sm text-slate-900">฿{item.value.toLocaleString()}</Text>
                          <Text className="text-[9px] text-slate-400">{Math.round((item.value / totalStockValue) * 100)}%</Text>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-dark-bg border-t border-slate-100 dark:border-dark-border flex-shrink-0">
                  <div className="flex justify-between items-center mb-4">
                    <Text className="text-slate-500 dark:text-dark-muted font-medium text-xs">Total Inventory Value</Text>
                    <Text className="text-xl font-black text-slate-900 dark:text-dark-text">฿{totalStockValue.toLocaleString()}</Text>
                  </div>
                  <button
                    onClick={() => setIsAllCategoriesModalOpen(false)}
                    className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 cursor-pointer"
                  >
                    Done
                  </button>
                </div>

              </div>
            </div>
          )
        }

        {/* ================= Delete Confirmation Modal ================= */}
        {
          isDeleteModalOpen && (
            <div className="fixed inset-0 z-[70] flex items-start justify-center pt-[20vh] px-4">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
                onClick={() => !isDeleting && setIsDeleteModalOpen(false)}
              ></div>

              <div className="relative bg-white dark:bg-dark-surface rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-dark-border animate-in fade-in zoom-in duration-200 flex flex-col">
                <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                    <Trash2 size={32} />
                  </div>
                  <Text as="h3" className="font-bold text-xl text-slate-900 dark:text-dark-text mb-2">Are you sure?</Text>
                  <Text className="text-slate-500 dark:text-dark-muted text-sm px-2">
                    Do you really want to delete this sale record? This action will restore the stock for the item.
                  </Text>
                </div>

                <div className="px-8 pb-8 flex gap-3">
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteSale(saleToDelete.id)}
                    disabled={isDeleting}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition-all shadow-lg shadow-red-100 cursor-pointer active:scale-95 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                        </svg>
                        <Text as="span">Deleting...</Text>
                      </>
                    ) : (
                      <Text as="span">Delete Sale</Text>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )
        }

      </div >
    </div >
  );
};

// Reusable Soft Card Component
const SoftCard = ({ title, value, subLabel, icon: Icon, iconColor, iconBg, subLabelColor = "text-slate-400", iconSize = 20, iconStrokeWidth }) => {
  return (
    <div className="relative bg-white dark:bg-dark-surface rounded-[2rem] p-4 shadow-sm border border-slate-100 dark:border-dark-border h-28 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl dark:hover:shadow-none cursor-pointer">
      <div className="absolute top-0 right-0 p-4">
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor} shadow-sm dark:shadow-none dark:bg-slate-800`}>
          <Icon size={iconSize} strokeWidth={iconStrokeWidth} />
        </div>
      </div>
      <div>
        <Text as="h3" className="text-slate-500 dark:text-dark-muted text-xs font-medium mb-1">{title}</Text>
        <Text className="text-xl font-bold text-slate-800 dark:text-dark-text tracking-tight">{value}</Text>
      </div>
      <Text className={`text-xs font-semibold ${subLabelColor} dark:opacity-80`}>{subLabel}</Text>
    </div>
  );
};

export default Dashboard;

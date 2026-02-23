import React, { useState, useEffect } from 'react';
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
  LayoutDashboard,
  Archive,
  ShoppingCart,
  BarChart2,
  Settings,
  Search,
  Moon,
  Bell,
  HelpCircle,
} from 'lucide-react';
import { Text } from '../components/text';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ onNavigate }) => {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [inventoryByCategory, setInventoryByCategory] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLowStockModalOpen, setIsLowStockModalOpen] = useState(false);
  const [isAllCategoriesModalOpen, setIsAllCategoriesModalOpen] = useState(false);

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
          axios.get('http://127.0.0.1:8000/products/'),
          axios.get('http://127.0.0.1:8000/sales/'),
          axios.get('http://127.0.0.1:8000/dashboard/inventory_by_category')
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
    if (!window.confirm("Are you sure you want to delete this sale? Stock will be restored.")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/sales/${saleId}`);
      setSales(prevSales => prevSales.filter(s => s.id !== saleId));
      const productsRes = await axios.get('http://127.0.0.1:8000/products/');
      setProducts(productsRes.data);
    } catch (error) {
      console.error("Error deleting sale:", error);
      alert("Failed to delete sale");
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
    <div className="min-h-screen bg-[#F3F5F9] font-sans flex flex-col items-center">
      <div className="w-full max-w-[1280px] flex flex-col">
        <div className="flex-1 bg-[#F3F5F9] p-4 md:p-6 text-slate-700">

          {/* ================= Header Section ================= */}
          <header className="flex flex-row justify-between items-center gap-4 mb-5">
            <div>
              <Text as="h1" className="text-2xl font-bold text-slate-900 mb-0.5">Welcome back, Admin!</Text>
              <Text className="text-slate-500 text-sm">Here's what's happening with your store today.</Text>
            </div>

            <div className="flex flex-row items-center gap-4">
              <div className="text-right hidden md:block">
                <Text className="text-2xl font-mono font-bold text-slate-800 tracking-tight">
                  {currentDateTime.toLocaleTimeString('th-TH', { hour12: false })}
                </Text>
                <Text className="text-xs font-medium text-slate-400">{formattedDate}</Text>
              </div>

              <div className="flex gap-2">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-all cursor-pointer text-sm">
                  <Download size={16} />
                  <Text as="span">Export</Text>
                </button>
                <button
                  onClick={() => onNavigate && onNavigate('inventory', { openAddModal: true })}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1e293b] text-white rounded-xl font-semibold shadow-lg shadow-slate-300 hover:bg-slate-800 transition-all transform active:scale-95 cursor-pointer text-sm"
                >
                  <Plus size={16} />
                  <Text as="span">Add Product</Text>
                </button>
              </div>
            </div>
          </header>

          {/* ================= Stats Grid ================= */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
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
              className="relative overflow-hidden bg-red-50/50 border border-red-100 rounded-[2rem] p-4 shadow-sm flex flex-col justify-between h-28 transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl cursor-pointer group"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-white/80 p-2 rounded-xl shadow-sm text-red-500 group-hover:scale-110 transition-transform">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div>
                <Text as="h3" className="text-red-800 text-xs font-semibold mb-1">Low Stock Alert</Text>
                <Text className="text-2xl font-bold text-slate-800">{isLoading ? '-' : `${lowStockProducts} Items`}</Text>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsLowStockModalOpen(false)}></div>
              <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-slide-up border border-slate-100 m-4">
                <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 text-red-600 rounded-xl"><AlertTriangle size={24} /></div>
                    <div>
                      <Text as="h3" className="font-bold text-xl text-red-900">Low Stock Items</Text>
                      <Text className="text-red-600 text-sm">Products with stock 5 units or less</Text>
                    </div>
                  </div>
                  <button onClick={() => setIsLowStockModalOpen(false)} className="p-2 hover:bg-red-100 rounded-full text-red-400 hover:text-red-600 transition-colors cursor-pointer">
                    <Trash2 size={24} className="rotate-45" />
                  </button>
                </div>

                <div className="p-0 max-h-[60vh] overflow-y-auto">
                  {products.filter(p => p.stock <= 5).length > 0 ? (
                    <table className="w-full text-left text-sm text-slate-600">
                      <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-xs sticky top-0">
                        <tr>
                          <th className="px-6 py-4">Product Name</th>
                          <th className="px-6 py-4 text-center">SKU</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-center">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {products.filter(p => p.stock <= 5).map(p => (
                          <tr key={p.id} className="hover:bg-red-50/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800">{p.name}</td>
                            <td className="px-6 py-4 text-center font-mono text-slate-500">{p.sku}</td>
                            <td className="px-6 py-4 text-center">
                              {p.stock === 0
                                ? <span className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-xs font-bold border border-red-200">Out of Stock</span>
                                : <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded-md text-xs font-bold border border-orange-200">Low Stock</span>}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-red-600 font-bold text-lg">{p.stock}</span>
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
              <div className="bg-white rounded-[2rem] p-5 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                  <div>
                    <Text as="h2" className="text-base font-bold text-slate-800 flex items-center gap-2">
                      Of the Day <span className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 font-normal">
                        <Text as="span">{selectedDateFormatted}</Text>
                      </span>
                    </Text>
                    <Text className="text-slate-400 text-xs mt-0.5">Detailed breakdown of sales for the selected date</Text>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <Text as="span" className="text-xs text-slate-500 font-medium">Select Date:</Text>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-slate-700 font-semibold focus:outline-none text-xs cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-4">
                  <div className="flex-1 bg-[#F0F4FF] rounded-xl p-3 border border-blue-50">
                    <Text as="h4" className="text-blue-800 text-[10px] font-bold uppercase tracking-wider mb-1">Daily Revenue</Text>
                    <Text className="text-xl font-bold text-slate-800">฿{dailyRevenue.toLocaleString()}</Text>
                  </div>
                  <div className="flex-1 bg-[#FFF8F0] rounded-xl p-3 border border-orange-50">
                    <Text as="h4" className="text-orange-800 text-[10px] font-bold uppercase tracking-wider mb-1">Items Sold</Text>
                    <Text className="text-xl font-bold text-slate-800">{dailyItemsSold}</Text>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 min-w-[500px]">
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
                          <div key={idx} className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors items-center border-b border-slate-50 last:border-0 text-sm">
                            <div className="col-span-2 font-mono text-slate-400">
                              <Text as="span">{new Date(sale.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</Text>
                            </div>
                            <div className="col-span-4 font-medium text-slate-700 flex flex-col justify-center">
                              <Text as="span">
                                {product ? (
                                  <><span className="text-slate-400 text-xs mr-1 font-bold">[{product.sku}]</span>{product.name}</>
                                ) : `Product ID: ${sale.product_id}`}
                              </Text>
                            </div>
                            <div className="col-span-1 text-center flex items-center justify-center">
                              {product && product.hasVat
                                ? <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-bold border border-purple-200">VAT</span>
                                : <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] border border-slate-200">No VAT</span>}
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
              `}} />

              {/* Inventory by Category */}
              <div
                onClick={() => setIsAllCategoriesModalOpen(true)}
                className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex flex-col hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer outline-none focus:outline-none active:scale-[0.98] select-none"
              >
                <div className="mb-3">
                  <Text as="h3" className="text-base font-bold text-slate-800">Inventory by Category</Text>
                  <Text className="text-xs text-slate-400">Stock value distribution</Text>
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
                          <Text as="span" className="text-2xl font-bold text-slate-800">
                            {totalStockValue > 0 ? Math.round((topCategory.value / totalStockValue) * 100) : 0}%
                          </Text>
                          <Text as="span" className="text-xs text-slate-400">{topCategory.name}</Text>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {pieData.slice(0, 4).map((item) => (
                        <div
                          key={item.name}
                          className="flex justify-between items-center text-xs hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer group/row"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(item.raw);
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
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

              {/* Sales Trends Chart */}
              <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 ease-out hover:-translate-y-2 cursor-pointer flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <Text as="h3" className="text-base font-bold text-slate-800">Sales Trends</Text>
                    <Text className="text-xs text-slate-400">
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
        {selectedCategory && (
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
        )}

        {/* ================= Full Categories List Modal ================= */}
        {isAllCategoriesModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-start justify-center pt-16 px-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200 animate-fade-in"
              onClick={() => setIsAllCategoriesModalOpen(false)}
            ></div>

            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200 flex flex-col">

              {/* Header — ไม่ scroll */}
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

              {/* Scrollable list — แสดง 4 rows แล้วค่อย scroll, scrollbar อยู่ใน border-radius */}
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

              {/* Footer — ไม่ scroll */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <Text className="text-slate-500 font-medium text-xs">Total Inventory Value</Text>
                  <Text className="text-xl font-black text-slate-900">฿{totalStockValue.toLocaleString()}</Text>
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
        )}

      </div>
    </div>
  );
};

// Reusable Soft Card Component
const SoftCard = ({ title, value, subLabel, icon: Icon, iconColor, iconBg, subLabelColor = "text-slate-400", iconSize = 20, iconStrokeWidth }) => {
  return (
    <div className="relative bg-white rounded-[2rem] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 h-28 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl cursor-pointer">
      <div className="absolute top-0 right-0 p-4">
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor} shadow-sm`}>
          <Icon size={iconSize} strokeWidth={iconStrokeWidth} />
        </div>
      </div>
      <div>
        <Text as="h3" className="text-slate-500 text-xs font-medium mb-1">{title}</Text>
        <Text className="text-xl font-bold text-slate-800 tracking-tight">{value}</Text>
      </div>
      <Text className={`text-xs font-semibold ${subLabelColor}`}>{subLabel}</Text>
    </div>
  );
};

export default Dashboard;

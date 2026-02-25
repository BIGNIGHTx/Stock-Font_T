import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Calendar,
  Download,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Search,
  Filter,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Wallet,
  Box,
  AlertTriangle
} from 'lucide-react';
import { Text } from '../components/text';
import { useAlert } from '../contexts/AlertContext';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // View Control
  const { alert, confirm } = useAlert();
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'
  const [filterVat, setFilterVat] = useState('all'); // 'all' | 'vat' | 'no_vat'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // --- 1. Fetch Sales & Products Data ---
  useEffect(() => {
    fetchSales();
    fetchProducts();
  }, []);

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/sales/');
      // Sort by latest first
      const sorted = response.data.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      setSalesData(sorted);
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/products/');
      // Map products to ensure hasVat is consistent
      const mappedProducts = response.data.map(p => ({
        ...p,
        hasVat: p.has_vat !== undefined ? p.has_vat : (p.hasVat !== undefined ? p.hasVat : false)
      }));
      setProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // --- 2. Delete Logic ---
  const handleDeleteSale = async (saleId) => {
    const isConfirmed = await confirm("แน่ใจหรือไม่ที่จะลบรายการขายนี้? สต็อกจะถูกคืนกลับ", "ยืนยันการลบ", "warning", "ลบรายการ", "ยกเลิก");
    if (!isConfirmed) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/sales/${saleId}`);
      // Remove from local state
      setSalesData(prev => prev.filter(s => s.id !== saleId));
      await alert("ลบรายการขายเรียบร้อยแล้ว", "สำเร็จ", "success");
    } catch (error) {
      console.error("Error deleting sale:", error);
      await alert("ไม่สามารถลบรายการขายได้", "ผิดพลาด", "error");
    }
  };

  // --- 3. Filtering Logic ---
  const getFilteredSales = () => {
    return salesData.filter(sale => {
      // 1. Date Filter
      if (!sale.created_at) return false;
      const saleDate = sale.created_at.split('T')[0]; // YYYY-MM-DD
      let dateMatch = false;
      if (viewMode === 'daily') {
        dateMatch = saleDate === selectedDate;
      } else {
        dateMatch = saleDate.startsWith(selectedMonth);
      }

      if (!dateMatch) return false;

      // 2. VAT Filter
      if (filterVat === 'all') return true;

      const product = products.find(p => p.id === sale.product_id);
      if (!product) return false; // If product not found, maybe exclude or include based on policy? assuming exclude for safety

      if (filterVat === 'vat') return product.hasVat === true;
      if (filterVat === 'no_vat') return !product.hasVat;

      return true;
    });
  };

  const filteredSales = getFilteredSales();

  // --- 4. Statistics Calculation (Based on Filtered Data) ---
  const totalRevenue = filteredSales.reduce((acc, curr) => acc + curr.total_price, 0);
  const totalUnits = filteredSales.reduce((acc, curr) => acc + curr.quantity, 0);

  // Calculate COGS and Gross Profit
  const totalCOGS = filteredSales.reduce((acc, sale) => {
    const product = products.find(p => p.id === sale.product_id);
    if (product) {
      const costPrice = product.cost_price || (product.price * 0.6); // Fallback to 60% if no cost
      return acc + (costPrice * sale.quantity);
    }
    return acc;
  }, 0);

  const grossProfit = totalRevenue - totalCOGS;

  // Best Seller Logic
  const productPerformance = filteredSales.reduce((acc, curr) => {
    const name = curr.product_name || 'Unknown';
    if (!acc[name]) acc[name] = { name, sold: 0, revenue: 0 };
    acc[name].sold += curr.quantity;
    acc[name].revenue += curr.total_price;
    return acc;
  }, {});

  const topProduct = Object.values(productPerformance).sort((a, b) => b.sold - a.sold)[0] || { name: '-', sold: 0 };


  // --- 5. Monthly Grouping Logic (For Monthly View Table) ---
  const getMonthlyGroupedData = () => {
    const grouped = {};
    filteredSales.forEach(sale => {
      const dateKey = sale.created_at.split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = { date: dateKey, revenue: 0, units: 0, transactions: 0 };
      }
      grouped[dateKey].revenue += sale.total_price;
      grouped[dateKey].units += sale.quantity;
      grouped[dateKey].transactions += 1;
    });
    return Object.values(grouped).sort((a, b) => new Date(b.date) - new Date(a.date));
  };


  return (
    <div className="min-h-screen bg-[#F3F5F9] font-sans flex flex-col items-center">
      <div className="w-full max-w-[1280px] p-4 md:p-6 text-slate-700">
        {/* Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-5 stagger-item delay-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 tracking-tight">
              Sales <span className="text-rose-600 italic font-serif">Reports</span>
            </h1>
            <div className="h-5 w-[1px] bg-slate-300 hidden sm:block"></div>
          </div>

          <div className="flex flex-wrap sm:flex-row gap-2 w-full xl:w-auto">
            {/* View Toggle */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${viewMode === 'daily' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Text as="span">Daily View</Text>
              </button>
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${viewMode === 'monthly' ? 'bg-slate-100 text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Text as="span">Monthly Overview</Text>
              </button>
            </div>

            {/* Vat Filter */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
              <button
                onClick={() => setFilterVat('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${filterVat === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterVat('vat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1 ${filterVat === 'vat' ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                VAT
              </button>
              <button
                onClick={() => setFilterVat('no_vat')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${filterVat === 'no_vat' ? 'bg-slate-200 text-slate-600' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                No VAT
              </button>
            </div>

            {/* Date Pickers */}
            <div className="relative">
              {viewMode === 'daily' ? (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-100 h-full cursor-pointer shadow-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              ) : (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-100 h-full cursor-pointer shadow-sm [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards (Using SoftCard from Dashboard) */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5 stagger-item delay-2">
          <SoftCard
            title={`Total Revenue (${viewMode === 'daily' ? 'Day' : 'Month'})`}
            value={`฿${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subLabel="Gross Income"
            icon={DollarSign}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />

          <SoftCard
            title="Gross Profit"
            value={`฿${grossProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            subLabel={`${totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : 0}% Margin`}
            subLabelColor={grossProfit >= 0 ? "text-emerald-600" : "text-red-600"}
            icon={Wallet}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
          />

          <SoftCard
            title="Total Units Sold"
            value={totalUnits.toString()}
            subLabel="Items sold"
            icon={ShoppingBag}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />

          <SoftCard
            title="Best Seller"
            value={topProduct.name}
            subLabel={`${topProduct.sold} units sold`}
            icon={TrendingUp}
            iconColor="text-orange-600"
            iconBg="bg-orange-50"
          />
        </div>

        {/* Main Content Table */}
        <div className="bg-white rounded-[2rem] p-5 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100 mb-6 stagger-item delay-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-5 gap-3">
            <div>
              <Text as="h3" className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText size={20} className="text-slate-400" />
                {viewMode === 'daily' ? `Transactions: ${new Date(selectedDate).toLocaleDateString('th-TH')}` : `Daily Breakthrough: ${selectedMonth}`}
              </Text>
              <Text className="text-slate-400 text-sm mt-1">{filteredSales.length} Records found</Text>
            </div>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400"><Text>Loading data...</Text></div>
            ) : (
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 font-semibold">
                  <tr>
                    <th className="px-4 py-3"><Text as="span">Date &amp; Time</Text></th>
                    <th className="px-4 py-3"><Text as="span">Product Name</Text></th>
                    <th className="px-4 py-3 text-center"><Text as="span">Tax</Text></th>
                    <th className="px-4 py-3 text-center"><Text as="span">Qty</Text></th>
                    <th className="px-4 py-3 text-right"><Text as="span">Total</Text></th>
                    <th className="px-4 py-3 text-center"><Text as="span">Action</Text></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSales.length > 0 ? (
                    filteredSales.map((sale) => {
                      const product = products.find(p => p.id === sale.product_id);
                      return (
                        <tr key={sale.id} className="hover:bg-slate-50 transition-colors group cursor-pointer">
                          <td className="px-4 py-3 font-mono text-slate-400">
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-600">{new Date(sale.created_at).toLocaleDateString('th-TH')}</span>
                              <span className="text-xs">{new Date(sale.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-700">
                            <Text as="span">
                              {product && <span className="text-slate-400 text-xs mr-1 font-mono">[{product.sku}]</span>}
                              {sale.product_name}
                            </Text>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {product && product.hasVat ? (
                              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-bold border border-purple-200">VAT</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] border border-slate-200">No VAT</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600"><Text as="span">x{sale.quantity}</Text></span>
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">
                            <Text as="span">฿{sale.total_price.toLocaleString()}</Text>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteSale(sale.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                              title="Delete Transaction"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-400"><Text>No sales transactions found for this period.</Text></td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Soft Card Component (Same as Dashboard)
const SoftCard = ({ title, value, subLabel, icon: Icon, iconColor, iconBg, subLabelColor = "text-slate-400" }) => {
  return (
    <div className="relative bg-white rounded-[2rem] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 h-28 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-xl cursor-pointer">
      <div className="absolute top-0 right-0 p-4">
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor} shadow-sm`}>
          <Icon size={20} />
        </div>
      </div>

      <div>
        <Text as="h3" className="text-slate-500 text-xs font-medium mb-1">{title}</Text>
        <Text className="text-xl font-bold text-slate-800 tracking-tight truncate pr-10">{value}</Text>
      </div>

      <Text className={`text-xs font-semibold ${subLabelColor}`}>
        {subLabel}
      </Text>
    </div>
  );
};

export default Reports;

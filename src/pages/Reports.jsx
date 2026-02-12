import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, DollarSign, ShoppingBag, TrendingUp, Search, Filter, Trash2, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // View Control
  const [viewMode, setViewMode] = useState('daily'); // 'daily' | 'monthly'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  // --- 1. Fetch Sales Data ---
  useEffect(() => {
    fetchSales();
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

  // --- 2. Delete Logic ---
  const handleDeleteSale = async (saleId) => {
    if (!window.confirm("Are you sure you want to delete this sale? Stock will be restored.")) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/sales/${saleId}`);
      // Remove from local state
      setSalesData(prev => prev.filter(s => s.id !== saleId));
    } catch (error) {
      console.error("Error deleting sale:", error);
      alert("Failed to delete sale");
    }
  };

  // --- 3. Filtering Logic ---
  const getFilteredSales = () => {
    return salesData.filter(sale => {
      if (!sale.created_at) return false;
      const saleDate = sale.created_at.split('T')[0]; // YYYY-MM-DD

      if (viewMode === 'daily') {
        return saleDate === selectedDate;
      } else {
        // Monthly: Check if YYYY-MM matches
        return saleDate.startsWith(selectedMonth);
      }
    });
  };

  const filteredSales = getFilteredSales();

  // --- 4. Statistics Calculation (Based on Filtered Data) ---
  const totalRevenue = filteredSales.reduce((acc, curr) => acc + curr.total_price, 0);
  const totalUnits = filteredSales.reduce((acc, curr) => acc + curr.quantity, 0);

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
    // Initialize days? No, just show days with sales appropriately or all days if needed.
    // Let's list days descending
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
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Sales Reports</h2>
          <p className="text-slate-500 mt-1">Manage sales, view history, and export data.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'daily' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monthly Overview
            </button>
          </div>

          {/* Date Pickers */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            {viewMode === 'daily' ? (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-full"
              />
            ) : (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards (Dynamic) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 font-medium text-sm">Total Revenue ({viewMode === 'daily' ? 'Day' : 'Month'})</p>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">
            ฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 font-medium text-sm">Total Units Sold</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingBag size={20} /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{totalUnits}</h3>
          <p className="text-blue-600 text-xs font-bold mt-2">Items</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 font-medium text-sm">Best Seller</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 truncate">{topProduct.name}</h3>
          <p className="text-slate-500 text-xs mt-2">{topProduct.sold} units sold</p>
        </div>
      </div>

      {/* Main Content Table - Switches based on View Mode */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <FileText size={20} className="text-slate-400" />
            {viewMode === 'daily' ? `Transactions: ${new Date(selectedDate).toLocaleDateString('th-TH')}` : `Daily Breakthrough: ${selectedMonth}`}
          </h3>
          <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded">
            {filteredSales.length} Records
          </span>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center text-slate-400">Loading data...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
                {viewMode === 'daily' ? (
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Product Name</th>
                    <th className="px-6 py-4 text-center">Qty</th>
                    <th className="px-6 py-4 text-right">Total</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-center">Transactions</th>
                    <th className="px-6 py-4 text-center">Items Sold</th>
                    <th className="px-6 py-4 text-right">Total Revenue</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-slate-100">
                {viewMode === 'daily' ? (
                  // --- DAILY VIEW ROWS ---
                  filteredSales.length > 0 ? filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-mono text-slate-500">
                        {new Date(sale.created_at).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700">{sale.product_name}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">x{sale.quantity}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        ฿{sale.total_price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteSale(sale.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete Transaction"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400">No sales transactions found for this date.</td>
                    </tr>
                  )
                ) : (
                  // --- MONTHLY VIEW ROWS ---
                  getMonthlyGroupedData().length > 0 ? getMonthlyGroupedData().map((dayData) => (
                    <tr key={dayData.date} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">
                        {new Date(dayData.date).toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">{dayData.transactions}</td>
                      <td className="px-6 py-4 text-center font-bold text-blue-600">{dayData.units}</td>
                      <td className="px-6 py-4 text-right font-bold text-emerald-600">
                        ฿{dayData.revenue.toLocaleString()}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-slate-400">No sales data found for this month.</td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

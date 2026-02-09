import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Download, DollarSign, ShoppingBag, TrendingUp, Search, Filter } from 'lucide-react';

const Reports = () => {
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- 1. ดึงข้อมูลการขายจาก Backend ---
  useEffect(() => {
    const fetchSales = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/sales/');
        setSalesData(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching sales:", error);
        setIsLoading(false);
      }
    };
    fetchSales();
  }, []);

  // --- 2. คำนวณสถิติ (Real-time Calculation) ---
  // ยอดขายรวม (Total Revenue)
  const totalRevenue = salesData.reduce((acc, curr) => acc + curr.total_price, 0);
  
  // จำนวนชิ้นที่ขายได้ (Total Units)
  const totalUnits = salesData.reduce((acc, curr) => acc + curr.quantity, 0);

  // จัดกลุ่มสินค้าเพื่อหา Best Seller (Group by Product Name)
  const productPerformance = salesData.reduce((acc, curr) => {
    if (!acc[curr.product_name]) {
      acc[curr.product_name] = { 
        name: curr.product_name, 
        sold: 0, 
        revenue: 0, 
        count: 0 
      };
    }
    acc[curr.product_name].sold += curr.quantity;
    acc[curr.product_name].revenue += curr.total_price;
    acc[curr.product_name].count += 1;
    return acc;
  }, {});

  // แปลง Object เป็น Array เพื่อมาแสดงในตาราง
  const reportList = Object.values(productPerformance).sort((a, b) => b.revenue - a.revenue);

  // หา Top Category (สมมติจากสินค้าขายดีที่สุด)
  const topProduct = reportList.length > 0 ? reportList[0] : { name: '-', sold: 0 };

  // กรองข้อมูลตามคำค้นหา
  const filteredList = reportList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales Reports (Live)</h2>
          <p className="text-slate-500 text-sm">Real-time performance metrics from Database.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">
            <Calendar size={16} className="mr-2" /> Today
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm shadow-blue-200">
            <Download size={16} className="mr-2" /> Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Revenue */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 font-medium text-sm">Total Revenue</p>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><DollarSign size={20} /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">
            ฿{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-green-600 text-xs font-bold mt-2 flex items-center">
            <TrendingUp size={14} className="mr-1" /> Based on {salesData.length} transactions
          </p>
        </div>

        {/* Card 2: Units Sold */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 font-medium text-sm">Total Units Sold</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingBag size={20} /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">{totalUnits}</h3>
          <p className="text-blue-600 text-xs font-bold mt-2">Items</p>
        </div>

        {/* Card 3: Best Seller */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 font-medium text-sm">Best Selling Product</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-800 truncate" title={topProduct.name}>
            {topProduct.name}
          </h3>
          <p className="text-slate-500 text-xs mt-2">
            Sold <span className="font-bold text-slate-800">{topProduct.sold}</span> units
          </p>
        </div>
      </div>

      {/* Sales Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-slate-800 text-lg">Product Sales Breakdown</h3>
            <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="Search product..." 
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
            {isLoading ? (
                <div className="p-8 text-center text-slate-500">Loading sales data...</div>
            ) : (
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
                        <tr>
                            <th className="px-6 py-4">Product Name</th>
                            <th className="px-6 py-4 text-center">Transactions</th>
                            <th className="px-6 py-4 text-right">Qty Sold</th>
                            <th className="px-6 py-4 text-right">Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredList.length > 0 ? (
                            filteredList.map((item, index) => (
                                <tr key={index} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                                    <td className="px-6 py-4 text-center text-slate-600">{item.count}</td>
                                    <td className="px-6 py-4 text-right font-bold text-blue-600">{item.sold}</td>
                                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                                        ฿{item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                                    No sales data found. Try selling some items!
                                </td>
                            </tr>
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

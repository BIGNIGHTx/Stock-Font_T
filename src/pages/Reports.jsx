import React from 'react';
import { Calendar, Download, DollarSign, ShoppingBag, TrendingUp, Search, Filter } from 'lucide-react';

const Reports = () => {
  // Mock Data: รายงานยอดขายแยกตามสินค้า
  const reportData = [
    { id: 1, name: 'Sony WH-1000XM5', sku: 'SNY-WH5-BLK', category: 'Audio', price: 349.99, sold: 45, revenue: 15749.55, trend: [40, 60, 45, 80, 90] },
    { id: 2, name: 'Apple Watch Series 9', sku: 'APL-WTH-S9', category: 'Wearables', price: 399.00, sold: 32, revenue: 12768.00, trend: [30, 45, 60, 50, 70] },
    { id: 3, name: 'MacBook Air M2', sku: 'APL-MBA-M2', category: 'Laptops', price: 1099.00, sold: 10, revenue: 10990.00, trend: [20, 20, 25, 30, 40] },
    { id: 4, name: 'Google Nest Audio', sku: 'GGL-NST-AUD', category: 'Smart Home', price: 99.99, sold: 85, revenue: 8499.15, trend: [60, 70, 65, 80, 85] },
    { id: 5, name: 'Samsung Galaxy S23', sku: 'SMG-S23-ULT', category: 'Mobile', price: 799.00, sold: 8, revenue: 6392.00, trend: [10, 15, 10, 20, 25] },
  ];

  // Component ย่อยสำหรับวาดกราฟแท่งจิ๋วในตาราง
  const TrendBars = ({ data }) => (
    <div className="flex items-end gap-1 h-8 w-24">
      {data.map((val, idx) => (
        <div 
          key={idx} 
          className="w-1.5 bg-green-400 rounded-t-sm" 
          style={{ height: `${val}%`, opacity: 0.5 + (idx * 0.1) }} // ไล่สีจางไปเข้ม
        ></div>
      ))}
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Sales Reports</h2>
          <p className="text-slate-500 text-sm">Track your store performance and sales metrics.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50">
            <Calendar size={16} className="mr-2" /> Oct 1 - Oct 31, 2023
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
          <h3 className="text-3xl font-bold text-slate-800">$124,592.00</h3>
          <p className="text-green-600 text-xs font-bold mt-2 flex items-center">
            <TrendingUp size={14} className="mr-1" /> +12% <span className="text-slate-400 font-normal ml-1">vs last month</span>
          </p>
        </div>

        {/* Card 2: Units Sold */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 font-medium text-sm">Total Units Sold</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ShoppingBag size={20} /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">1,245</h3>
          <p className="text-green-600 text-xs font-bold mt-2 flex items-center">
            <TrendingUp size={14} className="mr-1" /> +5% <span className="text-slate-400 font-normal ml-1">vs last month</span>
          </p>
        </div>

        {/* Card 3: Top Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-slate-500 font-medium text-sm">Top Category</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><TrendingUp size={20} /></div>
          </div>
          <h3 className="text-3xl font-bold text-slate-800">Audio</h3>
          <p className="text-slate-500 text-xs mt-2">
            <span className="font-bold text-slate-800">32%</span> of total sales
          </p>
          <p className="text-slate-400 text-xs mt-1">Most popular: Headphones</p>
        </div>
      </div>

      {/* Sales Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="font-bold text-slate-800 text-lg">Product Sales Breakdown</h3>
            <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search products..." 
                        className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                    />
                </div>
                <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                    <Filter size={18} />
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
                    <tr>
                        <th className="px-6 py-4">Product</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 text-right">Unit Price</th>
                        <th className="px-6 py-4 text-right">Qty Sold</th>
                        <th className="px-6 py-4 text-right">Total Revenue</th>
                        <th className="px-6 py-4 text-center">Trend</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {reportData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div>
                                    <p className="font-bold text-slate-800">{item.name}</p>
                                    <p className="text-xs text-slate-400">SKU: {item.sku}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded text-xs font-bold 
                                    ${item.category === 'Audio' ? 'bg-purple-50 text-purple-600' : 
                                      item.category === 'Wearables' ? 'bg-blue-50 text-blue-600' : 
                                      item.category === 'Laptops' ? 'bg-slate-100 text-slate-600' :
                                      item.category === 'Smart Home' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                                    }`}>
                                    {item.category}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-right text-slate-600">${item.price.toFixed(2)}</td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">{item.sold}</td>
                            <td className="px-6 py-4 text-right font-bold text-slate-800">${item.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4 flex justify-center">
                                <TrendBars data={item.trend} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
            <span>Showing 1 to 5 of 42 results</span>
            <div className="flex gap-2">
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">Next</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

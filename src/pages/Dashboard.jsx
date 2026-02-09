import React from 'react';
import { Search, Bell, HelpCircle, Package, Wallet, TrendingUp, AlertTriangle, Download, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = () => {
  // Mock Data สำหรับกราฟ
  const salesData = [
    { day: 'Mon', val: 1200 }, { day: 'Tue', val: 2100 },
    { day: 'Wed', val: 800 }, { day: 'Thu', val: 1600 },
    { day: 'Fri', val: 2400 }, { day: 'Sat', val: 3200 },
    { day: 'Sun', val: 1800 },
  ];
  
  const pieData = [
    { name: 'Electronics', value: 65, color: '#2563EB' },
    { name: 'Accessories', value: 25, color: '#60A5FA' },
    { name: 'Services', value: 10, color: '#93C5FD' },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back, Alex!</h2>
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
            <h3 className="text-3xl font-bold text-slate-800 mt-2">1,240</h3>
            <p className="text-green-500 text-xs font-medium mt-2 flex items-center">
              <TrendingUp size={14} className="mr-1" /> +12% <span className="text-slate-400 ml-1">from last month</span>
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Package size={24} />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Total Stock Value</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">$45,230</h3>
            <p className="text-green-500 text-xs font-medium mt-2 flex items-center">
              <TrendingUp size={14} className="mr-1" /> +5% <span className="text-slate-400 ml-1">from last month</span>
            </p>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Wallet size={24} />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-start">
          <div>
            <p className="text-slate-500 text-sm font-medium">Today's Sales</p>
            <h3 className="text-3xl font-bold text-slate-800 mt-2">$2,450</h3>
            <p className="text-green-500 text-xs font-medium mt-2 flex items-center">
              <TrendingUp size={14} className="mr-1" /> +18% <span className="text-slate-400 ml-1">vs yesterday</span>
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
            <h3 className="text-3xl font-bold text-slate-800 mt-2">5 Items</h3>
            <div className="mt-3 inline-flex items-center px-2 py-1 bg-white/60 rounded-lg">
                <span className="text-red-600 text-xs font-bold mr-1">Action Required</span>
                <span className="text-slate-500 text-xs">restock needed</span>
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
                    <p className="text-sm text-slate-400">Daily revenue for the current week</p>
                </div>
                <select className="bg-slate-50 border-none text-sm rounded-lg p-2 outline-none cursor-pointer">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={salesData}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
                        <Bar dataKey="val" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Right: Top Categories */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800">Top Categories</h3>
                <p className="text-sm text-slate-400">Sales distribution</p>
            </div>
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
                        <span className="text-3xl font-bold text-slate-800">65%</span>
                        <span className="text-xs text-slate-400">Electronics</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 space-y-3">
                {pieData.map((item) => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: item.color}}></div>
                            <span className="text-slate-600">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-800">฿{(item.value * 250).toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>
      
      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
             <button className="text-blue-600 text-sm font-semibold hover:underline">View All</button>
        </div>
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
                <tr>
                    <th className="px-6 py-4 font-medium">Order ID</th>
                    <th className="px-6 py-4 font-medium">Product Name</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">#ORD-001</td>
                    <td className="px-6 py-4">Apple Watch Series 8</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600">Wearables</span></td>
                    <td className="px-6 py-4 text-slate-500">Oct 24, 2023</td>
                    <td className="px-6 py-4 font-bold text-slate-800">$399.00</td>
                    <td className="px-6 py-4 text-green-600 font-medium">Completed</td>
                </tr>
                 <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-800">#ORD-002</td>
                    <td className="px-6 py-4">Sony WH-1000XM5</td>
                    <td className="px-6 py-4"><span className="px-2 py-1 bg-purple-50 rounded text-xs text-purple-600">Audio</span></td>
                    <td className="px-6 py-4 text-slate-500">Oct 24, 2023</td>
                    <td className="px-6 py-4 font-bold text-slate-800">$349.00</td>
                    <td className="px-6 py-4 text-orange-500 font-medium">Pending</td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;

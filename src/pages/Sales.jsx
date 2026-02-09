import React, { useState } from 'react';
import { Calendar, Search, Package, TrendingDown, CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react';

const Sales = () => {
  // Mock Data (จำลองสินค้าเหมือนหน้า Inventory)
  const [products, setProducts] = useState([
    { id: 1, name: 'Sony WH-1000XM5 Wireless Headphones', price: 349.00, stock: 12 },
    { id: 2, name: 'Samsung OLED 4K TV 55"', price: 1250.00, stock: 5 },
    { id: 3, name: 'Apple Watch Series 9', price: 399.00, stock: 25 },
    { id: 4, name: 'Daikin Inverter Air Con', price: 550.00, stock: 2 },
  ]);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSuccess, setIsSuccess] = useState(false);

  // Derived State (ตัวแปรที่คำนวณจาก State อื่น)
  const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
  const totalAmount = selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00';
  const remainingStock = selectedProduct ? selectedProduct.stock - quantity : 0;

  // ฟังก์ชันจัดการการขาย
  const handleConfirmSale = () => {
    if (!selectedProduct) return;
    
    // จำลองการตัดสต๊อก
    const updatedProducts = products.map(p => 
      p.id === selectedProduct.id 
      ? { ...p, stock: p.stock - quantity } 
      : p
    );
    setProducts(updatedProducts);
    
    // แสดง Success Message
    setIsSuccess(true);
    
    // Reset Form หลัง 2 วินาที
    setTimeout(() => {
      setIsSuccess(false);
      setQuantity(1);
      setSelectedProductId('');
    }, 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold text-slate-800">Record New Sale</h2>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> System Online
            </span>
        </div>
        <p className="text-slate-500">Enter transaction details below to update inventory levels instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card: Transaction Details */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">Transaction Details</h3>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="date" 
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>
            </div>

            {/* Product Selection */}
            <div className="mb-8">
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Product</label>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <select 
                        value={selectedProductId}
                        onChange={(e) => {
                            setSelectedProductId(e.target.value);
                            setQuantity(1); // Reset qty when product changes
                        }}
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all hover:bg-white"
                    >
                        <option value="" disabled>-- Search or select a product --</option>
                        {products.map(p => (
                            <option key={p.id} value={p.id} disabled={p.stock === 0}>
                                {p.name} (Stock: {p.stock})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stock Preview Box (เหมือนในรูปต้นฉบับ) */}
            {selectedProduct && (
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8 animate-slide-up">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <Package size={20} /> Stock Preview
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${remainingStock < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {remainingStock < 0 ? 'Insufficient Stock' : 'In Stock'}
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-slate-200">
                            <p className="text-xs text-slate-400 mb-1">Current Stock</p>
                            <p className="text-2xl font-bold text-slate-800">{selectedProduct.stock} <span className="text-sm font-normal text-slate-400">units</span></p>
                        </div>
                        <div className="bg-white p-4 rounded-lg border border-slate-200 relative overflow-hidden">
                            <p className="text-xs text-blue-500 mb-1 font-bold">Projected Remaining</p>
                            <p className={`text-2xl font-bold ${remainingStock < 5 ? 'text-orange-500' : 'text-blue-600'}`}>
                                {remainingStock} <span className="text-sm font-normal text-slate-400">units</span>
                            </p>
                            <TrendingDown className="absolute right-2 bottom-2 text-slate-100" size={40} />
                        </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-blue-600 transition-all duration-500" 
                            style={{ width: `${(remainingStock / selectedProduct.stock) * 100}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {/* Quantity & Price Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Quantity</label>
                    <div className="flex items-center">
                        <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="p-3 border border-slate-200 rounded-l-xl hover:bg-slate-50"
                            disabled={!selectedProduct}
                        >
                            <Minus size={18} />
                        </button>
                        <input 
                            type="number" 
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                            className="w-full py-3 text-center border-y border-slate-200 text-lg font-bold outline-none"
                            disabled={!selectedProduct}
                        />
                        <button 
                            onClick={() => setQuantity(Math.min(selectedProduct ? selectedProduct.stock : 99, quantity + 1))}
                            className="p-3 border border-slate-200 rounded-r-xl hover:bg-slate-50"
                            disabled={!selectedProduct}
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Unit Price ($)</label>
                    <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-lg flex justify-between">
                        <span>$ {selectedProduct ? selectedProduct.price.toFixed(2) : '0.00'}</span>
                        <span className="text-xs self-center uppercase">USD</span>
                    </div>
                </div>
            </div>

            {/* Total Amount Box (Black Box) */}
            <div className="mt-8 bg-slate-900 rounded-xl p-6 flex justify-between items-center text-white shadow-lg shadow-slate-200">
                <div>
                    <p className="text-slate-400 text-sm">Total Amount</p>
                    <p className="text-xs text-slate-500">Tax included</p>
                </div>
                <div className="text-3xl font-bold tracking-tight">
                    ${parseFloat(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-4">
                <button className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-xl transition-colors">
                    Cancel
                </button>
                <button 
                    onClick={handleConfirmSale}
                    disabled={!selectedProduct || remainingStock < 0 || isSuccess}
                    className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2
                        ${isSuccess 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isSuccess ? <CheckCircle size={20} /> : null}
                    {isSuccess ? 'Sale Confirmed!' : 'Confirm Sale'}
                </button>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Quick Stats (Optional but matches design flow) */}
        <div className="hidden lg:block space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Today's Quick Stats</h3>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-blue-600"><CheckCircle size={20} /></div>
                        <div>
                            <p className="text-sm text-slate-500">Sales Count</p>
                            <p className="font-bold text-slate-800">24</p>
                        </div>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl flex items-center gap-4">
                        <div className="p-2 bg-white rounded-lg text-purple-600"><AlertCircle size={20} /></div>
                        <div>
                            <p className="text-sm text-slate-500">Revenue</p>
                            <p className="font-bold text-slate-800">$8,432.00</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Sales;

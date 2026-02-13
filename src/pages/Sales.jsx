import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, Package, TrendingDown, CheckCircle, AlertCircle, Plus, Minus } from 'lucide-react';
import { Text } from '../components/text';

const Sales = () => {
    // State สำหรับเก็บข้อมูลสินค้าจริง
    const [products, setProducts] = useState([]);

    // Form State
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSuccess, setIsSuccess] = useState(false);

    // --- 1. ดึงข้อมูลสินค้าจาก Backend ---
    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/products/');
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // หาตัวสินค้าที่ถูกเลือก
    const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

    // คำนวณยอดเงินและสต๊อกที่เหลือ
    const totalAmount = selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00';
    const remainingStock = selectedProduct ? selectedProduct.stock - quantity : 0;

    // --- 2. ฟังก์ชันยืนยันการขาย (ยิง API) ---
    const handleConfirmSale = async () => {
        if (!selectedProduct) return;

        try {
            // เตรียมข้อมูลส่งให้ Backend
            const saleData = {
                product_id: selectedProduct.id,
                product_name: selectedProduct.name,
                quantity: parseInt(quantity),
                total_price: parseFloat(totalAmount)
            };

            // ยิงไปที่ API /sales/
            await axios.post('http://127.0.0.1:8000/sales/', saleData);

            // เมื่อสำเร็จ:
            setIsSuccess(true);
            fetchProducts(); // ดึงข้อมูลใหม่ทันที (เพื่อให้สต๊อกอัปเดต)

            // Reset Form หลัง 2 วินาที
            setTimeout(() => {
                setIsSuccess(false);
                setQuantity(1);
                setSelectedProductId('');
            }, 2000);

        } catch (error) {
            console.error("Sales Error:", error);
            alert("เกิดข้อผิดพลาด: สต๊อกอาจไม่พอ หรือระบบมีปัญหา");
        }
    };

    return (
        <div className="min-h-screen bg-[#F3F5F9] font-sans p-6 md:p-10 text-slate-700 animate-fade-in pb-20">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Text as="h2" className="text-3xl font-bold text-slate-900">Record New Sale (Live POS)</Text>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> <Text as="span">DB Connected</Text>
                    </span>
                </div>
                <Text className="text-slate-500">Real-time stock deduction system.</Text>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Form */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-center mb-6">
                            <Text as="h3" className="font-bold text-lg text-slate-800">Transaction Details</Text>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="date"
                                    value={date}
                                    disabled
                                    className="pl-10 pr-4 py-2 border border-slate-200 bg-slate-50 rounded-lg text-sm text-slate-500 outline-none"
                                />
                            </div>
                        </div>

                        {/* Product Selection */}
                        <div className="mb-8">
                            <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Select Product</Text>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                <select
                                    value={selectedProductId}
                                    onChange={(e) => {
                                        setSelectedProductId(e.target.value);
                                        setQuantity(1);
                                    }}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all hover:bg-white"
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

                        {/* Stock Preview Box */}
                        {selectedProduct && (
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 animate-slide-up">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                        <Package size={20} /> <Text as="span">Stock Preview</Text>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${remainingStock < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                        <Text as="span">{remainingStock < 0 ? 'Insufficient Stock' : 'In Stock'}</Text>
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200">
                                        <Text className="text-xs text-slate-400 mb-1">Current Stock</Text>
                                        <Text className="text-2xl font-bold text-slate-800">{selectedProduct.stock} <Text as="span" className="text-sm font-normal text-slate-400">units</Text></Text>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 relative overflow-hidden">
                                        <Text className="text-xs text-blue-500 mb-1 font-bold">Projected Remaining</Text>
                                        <Text className={`text-2xl font-bold ${remainingStock < 5 ? 'text-orange-500' : 'text-blue-600'}`}>
                                            {remainingStock} <Text as="span" className="text-sm font-normal text-slate-400">units</Text>
                                        </Text>
                                        <TrendingDown className="absolute right-2 bottom-2 text-slate-100" size={40} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quantity & Price Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div>
                                <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Quantity</Text>
                                <div className="flex items-center">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-3 border border-slate-200 rounded-l-xl hover:bg-slate-50 text-slate-600 bg-white transition-colors"
                                        disabled={!selectedProduct}
                                    >
                                        <Minus size={18} />
                                    </button>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                        className="w-full py-3 text-center border-y border-slate-200 text-lg font-bold outline-none bg-white text-slate-800"
                                        disabled={!selectedProduct}
                                    />
                                    <button
                                        onClick={() => setQuantity(Math.min(selectedProduct ? selectedProduct.stock : 99, quantity + 1))}
                                        className="p-3 border border-slate-200 rounded-r-xl hover:bg-slate-50 text-slate-600 bg-white transition-colors"
                                        disabled={!selectedProduct}
                                    >
                                        <Plus size={18} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Unit Price ($)</Text>
                                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-lg flex justify-between">
                                    <Text as="span">฿ {selectedProduct ? selectedProduct.price.toLocaleString() : '0'}</Text>
                                    <Text as="span" className="text-xs self-center uppercase">THB</Text>
                                </div>
                            </div>
                        </div>

                        {/* Total Amount (Bright Version) */}
                        <div className="mt-8 bg-white rounded-2xl p-6 flex justify-between items-center text-slate-800 shadow-sm border border-slate-200">
                            <div>
                                <Text className="text-slate-400 text-sm">Total Amount</Text>
                                <Text className="text-xs text-slate-400">Tax included</Text>
                            </div>
                            <div className="text-3xl font-bold tracking-tight text-blue-600">
                                <Text as="span">฿{parseFloat(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 flex justify-end gap-4">
                            <button
                                onClick={handleConfirmSale}
                                disabled={!selectedProduct || remainingStock < 0 || isSuccess}
                                className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2
                        ${isSuccess
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-slate-800 hover:bg-slate-900 shadow-slate-300'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isSuccess ? <CheckCircle size={20} /> : null}
                                <Text as="span">{isSuccess ? 'Sale Confirmed!' : 'Confirm Sale'}</Text>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sales;

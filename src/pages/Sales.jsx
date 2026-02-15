import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, Package, TrendingDown, CheckCircle, Plus, Minus, Tag, ChevronDown } from 'lucide-react';
import { Text } from '../components/text';

const Sales = () => {
    // State สำหรับเก็บข้อมูลสินค้าจริง
    const [products, setProducts] = useState([]);

    // --- Const: หมวดหมู่ (Copy from Inventory) ---
    // eslint-disable-next-line no-unused-vars
    const CATEGORIES = [
        { id: 'All', label: 'All Products', icon: <Package size={20} />, color: 'bg-slate-500' }, // Added All option
        { id: 'Tv', label: 'TV', icon: null, color: 'bg-blue-500' },
        { id: 'Fan', label: 'Fan', icon: null, color: 'bg-teal-500' },
        { id: 'Refrigerator', label: 'Refrigerator', icon: null, color: 'bg-orange-500' },
        { id: 'Washing Machine', label: 'Washing Machine', icon: null, color: 'bg-indigo-500' },
    ];

    // Form State
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSuccess, setIsSuccess] = useState(false);

    // Custom Dropdown State
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    // eslint-disable-next-line no-undef
    const dropdownRef = React.useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // --- 1. ดึงข้อมูลสินค้าจาก Backend ---
    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/products/');
            // Map hasVat ให้ชัวร์ว่ามีค่า (default false)
            const mappedData = response.data.map(p => ({
                ...p,
                hasVat: p.has_vat !== undefined ? p.has_vat : (p.hasVat !== undefined ? p.hasVat : false)
            }));
            setProducts(mappedData);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    // Filter Products by Category
    const filteredProducts = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    // หาตัวสินค้าที่ถูกเลือก
    const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));

    // คำนวณยอดเงินและสต๊อกที่เหลือ
    const totalAmount = selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00';
    const remainingStock = selectedProduct ? selectedProduct.stock - quantity : 0;

    // --- 2. ฟังก์ชันยืนยันการขาย (ยิง API) ---
    const handleConfirmSale = async () => {
        if (!selectedProduct) return;

        try {
            const saleData = {
                product_id: selectedProduct.id,
                product_name: selectedProduct.name,
                quantity: parseInt(quantity),
                total_price: parseFloat(totalAmount)
            };

            await axios.post('http://127.0.0.1:8000/sales/', saleData);

            setIsSuccess(true);
            fetchProducts();

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

                        {/* Category Filters */}
                        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => { setSelectedCategory(cat.id); setSelectedProductId(''); }}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border
                                        ${selectedCategory === cat.id
                                            ? 'bg-slate-800 text-white border-slate-800 shadow-lg shadow-slate-200'
                                            : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-slate-100'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Product Selection (Custom Dropdown) */}
                        <div className="mb-8 relative" ref={dropdownRef}>
                            <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Select Product {selectedCategory !== 'All' && `(${selectedCategory})`}</Text>

                            {/* Dropdown Trigger */}
                            <div
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className={`w-full pl-12 pr-4 py-4 bg-slate-50 border ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200'} rounded-2xl text-slate-800 text-lg outline-none cursor-pointer transition-all hover:bg-white flex items-center justify-between`}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <Search className="text-slate-400 mr-2 flex-shrink-0" size={20} />
                                    {selectedProduct ? (
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="font-bold text-slate-500 text-sm">[{selectedProduct.sku}]</span>
                                            <span className="truncate">{selectedProduct.name}</span>
                                            {selectedProduct.hasVat ? (
                                                <span className="flex-shrink-0 px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-xs font-bold border border-purple-200">
                                                    VAT
                                                </span>
                                            ) : (
                                                <span className="flex-shrink-0 px-2 py-0.5 bg-slate-200 text-slate-500 rounded text-xs border border-slate-300">
                                                    No VAT
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400">-- Select Product --</span>
                                    )}
                                </div>
                                <div className="text-slate-400">
                                    <ChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                </div>
                            </div>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-80 overflow-y-auto animate-fade-in-up">
                                    {/* Search Input inside Dropdown (Optional but good for UX) */}
                                    <div className="p-2 sticky top-0 bg-white border-b border-slate-50">
                                        <input
                                            type="text"
                                            placeholder="Type to search..."
                                            className="w-full px-4 py-2 bg-slate-50 rounded-xl text-sm outline-none border border-transparent focus:border-blue-200 focus:bg-white transition-all"
                                            onClick={(e) => e.stopPropagation()}
                                            onChange={(e) => {
                                                // Implement search logic if needed, or just filter visually
                                                // For now, simple client-side filter could be added here
                                            }}
                                        />
                                    </div>

                                    {filteredProducts.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => {
                                                if (p.stock > 0) {
                                                    setSelectedProductId(p.id.toString());
                                                    setQuantity(1);
                                                    setIsDropdownOpen(false);
                                                }
                                            }}
                                            className={`px-4 py-3 flex justify-between items-center cursor-pointer transition-colors border-b border-slate-50 last:border-0
                                                ${p.stock === 0 ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-blue-50'}
                                                ${selectedProductId === p.id.toString() ? 'bg-blue-50' : ''}
                                            `}
                                        >
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2 font-medium text-slate-700">
                                                    <span className="text-slate-500 font-bold text-xs">[{p.sku}]</span>
                                                    {p.name}
                                                    {p.hasVat ? (
                                                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded text-[10px] font-bold border border-purple-200">
                                                            VAT
                                                        </span>
                                                    ) : (
                                                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] border border-slate-200">
                                                            No VAT
                                                        </span>
                                                    )}
                                                </div>
                                                <span className="text-xs text-slate-400">Price: ฿{p.price.toLocaleString()}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className={`text-xs font-bold ${p.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                    {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredProducts.length === 0 && (
                                        <div className="p-8 text-center text-slate-400 text-sm">No products found in this category</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Stock Preview Box */}
                        {selectedProduct && (
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-8 animate-slide-up">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                                        <Package size={20} /> <Text as="span">Product Status</Text>
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
                                <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Unit Price / Tax</Text>
                                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-lg flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <Text as="span" className="font-bold text-slate-800">฿ {selectedProduct ? selectedProduct.price.toLocaleString() : '0'}</Text>

                                        {/* --- VAT Badge (แสดงหลังเลือกสินค้า) --- */}
                                        {selectedProduct && selectedProduct.hasVat && (
                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-600 rounded text-xs font-bold border border-purple-200 ml-2">
                                                <Tag size={10} /> VAT
                                            </span>
                                        )}
                                        {selectedProduct && !selectedProduct.hasVat && (
                                            <span className="px-2 py-0.5 bg-slate-200 text-slate-500 rounded text-xs border border-slate-300 ml-2">
                                                No VAT
                                            </span>
                                        )}
                                    </div>
                                    <Text as="span" className="text-xs uppercase">THB</Text>
                                </div>
                            </div>
                        </div>

                        {/* Total Amount (Bright Version) */}
                        <div className="mt-8 bg-white rounded-2xl p-6 flex justify-between items-center text-slate-800 shadow-sm border border-slate-200">
                            <div>
                                <Text className="text-slate-400 text-sm">Total Amount</Text>
                                <Text className="text-xs text-slate-400">
                                    {selectedProduct?.hasVat ? 'VAT Included (ราคารวมภาษีแล้ว)' : 'No VAT (ราคายกเว้นภาษี)'}
                                </Text>
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
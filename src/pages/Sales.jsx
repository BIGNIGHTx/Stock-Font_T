import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Search, Package, TrendingDown, CheckCircle, Plus, Minus, Tag, ChevronDown, Clock } from 'lucide-react';
import { Text } from '../components/text';

const RecentTransactions = ({ recentSales = [] }) => {
    const today = new Date().toLocaleDateString('en-CA');
    const todaySales = recentSales.filter(sale => {
        const saleDate = sale.created_at || sale.sale_date;
        if (!saleDate) return false;
        const d = new Date(saleDate);
        return d.toLocaleDateString('en-CA') === today;
    });

    return (
        <div id="recent-transactions-section" className="bg-white dark:bg-dark-surface rounded-[24px] p-5 w-full shadow-sm border border-slate-100 dark:border-dark-border h-fit mb-4 transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-[#8BA3BA] p-1.5 rounded-full text-white">
                    <Clock size={20} />
                </div>
                <h2 className="text-xl font-bold text-[#1E293B] dark:text-dark-text tracking-tight">
                    Today's Sales
                </h2>
            </div>

            <hr className="border-slate-100 dark:border-dark-border mb-4" />

            <div className="relative">
                {todaySales.length > 1 && (
                    <div className="absolute top-2 left-[5px] bottom-4 w-[2px] bg-slate-100 dark:bg-dark-border z-0"></div>
                )}

                <div className="flex flex-col gap-6 relative z-10">
                    {todaySales.length > 0 ? todaySales.map((item, index) => {
                        const dateObj = new Date(item.created_at || item.sale_date);
                        const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
                        const isLatest = index === 0;

                        return (
                            <div key={item.id} className={`relative flex justify-between items-start pl-6 ${isLatest ? 'animate-slide-up bg-slate-50/50 dark:bg-dark-bg/50 p-2 -ml-2 rounded-xl transition-all duration-500' : ''}`}>
                                <div className={`absolute ${isLatest ? 'left-[7px] top-[14px]' : 'left-[-1px] top-1.5'} w-3 h-3 bg-[#DEE5ED] dark:bg-dark-border rounded-full border-[3px] border-white dark:border-dark-surface box-content z-10 transition-all`}></div>

                                <div className="flex flex-col mt-[-2px]">
                                    <span className="text-base font-semibold text-slate-700 dark:text-dark-text">
                                        {item.product_name} <span className="text-sm font-normal text-slate-400 dark:text-dark-muted ml-1">x{item.quantity}</span>
                                    </span>
                                    <span className="text-sm text-slate-400 dark:text-dark-muted mt-1">{timeStr}</span>
                                </div>

                                <div className="flex flex-col items-end mt-[-2px]">
                                    <span className="text-base font-bold tracking-tight text-[#FA5252] dark:text-[#ff6b6b]">
                                        ฿ {parseFloat(item.total_price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                    <div className="mt-1.5 font-bold flex items-center px-2 py-0.5 rounded-lg bg-[#FEF2F2] dark:bg-red-950/40 text-[#FA5252] dark:text-red-400 text-[11px] border border-red-100/50 dark:border-red-900/30">
                                        <Minus size={12} className="mr-1" />
                                        Sold out
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="py-8 text-center text-slate-400 dark:text-dark-muted text-sm">
                            No sales recorded today yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Sales = () => {
    const [products, setProducts] = useState([]);
    const [recentSales, setRecentSales] = useState([]);


    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedProductId, setSelectedProductId] = useState('');
    const [quantity, setQuantity] = useState(1);
    // eslint-disable-next-line no-unused-vars
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [productSearchTerm, setProductSearchTerm] = useState('');
    const dropdownRef = React.useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('https://stock-back-t.onrender.com/products/');
            const mappedData = response.data.map(p => ({
                ...p,
                hasVat: p.has_vat !== undefined ? p.has_vat : (p.hasVat !== undefined ? p.hasVat : false)
            }));
            setProducts(mappedData);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchSales = async () => {
        try {
            const response = await axios.get('https://stock-back-t.onrender.com/sales/');
            const sortedSales = response.data.sort((a, b) => {
                const dateA = a.created_at || a.sale_date;
                const dateB = b.created_at || b.sale_date;
                return new Date(dateB) - new Date(dateA);
            });
            setRecentSales(sortedSales);
        } catch (error) {
            console.error("Error fetching sales:", error);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchSales();
    }, []);

    // สร้าง Category buttons ไดนามิกจากข้อมูลสินค้าจริง
    const CAT_COLORS = ['bg-blue-500', 'bg-teal-500', 'bg-orange-500', 'bg-indigo-500', 'bg-pink-500', 'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500'];
    const uniqueCats = [...new Set(products.map(p => p.category).filter(cat => cat && cat !== 'YYYY'))];
    const CATEGORIES = [
        { id: 'All', label: 'All Products' },
        ...uniqueCats.map((cat, i) => ({ id: cat, label: cat, color: CAT_COLORS[i % CAT_COLORS.length] }))
    ];

    const filteredProductsByCat = selectedCategory === 'All'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const filteredProducts = filteredProductsByCat.filter(p =>
        p.name.toLowerCase().includes(productSearchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearchTerm.toLowerCase())
    );

    const selectedProduct = products.find(p => p.id === parseInt(selectedProductId));
    const totalAmount = selectedProduct ? (selectedProduct.price * quantity).toFixed(2) : '0.00';
    const remainingStock = selectedProduct ? selectedProduct.stock - quantity : 0;

    const handleConfirmSale = async () => {
        if (!selectedProduct) return;
        try {
            const saleData = {
                product_id: selectedProduct.id,
                product_name: selectedProduct.name,
                quantity: parseInt(quantity),
                total_price: parseFloat(totalAmount)
            };
            await axios.post('https://stock-back-t.onrender.com/sales/', saleData);
            setIsSuccess(true);
            setQuantity(1);
            setSelectedProductId('');
            fetchProducts();
            fetchSales();
            setTimeout(() => {
                const recentSection = document.getElementById('recent-transactions-section');
                if (recentSection) {
                    recentSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    recentSection.classList.add('ring-4', 'ring-blue-100');
                    setTimeout(() => recentSection.classList.remove('ring-4', 'ring-blue-100'), 1500);
                }
            }, 100);
            setTimeout(() => setIsSuccess(false), 1500);
        } catch (error) {
            console.error("Sales Error:", error);
            alert("เกิดข้อผิดพลาด: สต๊อกอาจไม่พอ หรือระบบมีปัญหา");
        }
    };

    return (
        /* ===== Outer wrapper — centered, same bg ===== */
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg font-sans flex justify-center transition-colors duration-300">
            <div className="w-full max-w-[1280px] px-6 py-4 md:px-10 md:py-5 text-slate-700 dark:text-dark-text">

                {/* Header */}
                <div className="flex items-center justify-between mb-4 stagger-item delay-1 will-change-transform">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 dark:text-dark-text tracking-tight">
                            Point of <span className="text-blue-600 italic font-serif">Sale</span>
                        </h1>
                        <div className="h-5 w-[1px] bg-slate-300 dark:bg-dark-border hidden sm:block"></div>
                        <p className="text-slate-500 dark:text-dark-muted text-sm hidden sm:block">
                            Real-time stock deduction system.
                        </p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 dark:bg-emerald-900/30 text-green-700 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm border border-green-200 dark:border-emerald-800/50">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> <Text as="span">DB Connected</Text>
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 stagger-item delay-2 will-change-transform">
                    {/* Left Column: Input Form */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-dark-surface p-5 rounded-[2rem] border border-slate-100 dark:border-dark-border shadow-sm transition-colors">
                            <div className="flex justify-between items-center mb-4">
                                <Text as="h3" className="font-bold text-lg text-slate-800 dark:text-dark-text">Transaction Details</Text>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="date"
                                        className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-dark-bg border border-slate-100 dark:border-dark-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 text-slate-700 dark:text-dark-text transition-all"
                                        value={date}
                                        disabled
                                    />
                                </div>
                            </div>

                            {/* Category Filters */}
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setSelectedCategory(cat.id); setSelectedProductId(''); setProductSearchTerm(''); }}
                                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border cursor-pointer
                                        ${selectedCategory === cat.id
                                                ? 'bg-slate-800 dark:bg-dark-bg text-white border-slate-800 dark:border-dark-border shadow-md'
                                                : 'bg-slate-50 dark:bg-dark-surface text-slate-500 dark:text-dark-muted border-slate-100 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-dark-bg'}`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>

                            {/* Product Selection (Custom Dropdown) */}
                            <div className="mb-5 relative" ref={dropdownRef}>
                                <Text as="label" className="block text-sm font-medium text-slate-700 dark:text-dark-muted mb-2">Select Product {selectedCategory !== 'All' && `(${selectedCategory})`}</Text>

                                <div
                                    onClick={() => { setIsDropdownOpen(!isDropdownOpen); if (!isDropdownOpen) setProductSearchTerm(''); }}
                                    className={`w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-dark-bg border ${isDropdownOpen ? 'border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30' : 'border-slate-200 dark:border-dark-border'} rounded-2xl text-slate-800 dark:text-dark-text text-lg outline-none cursor-pointer transition-all hover:bg-white dark:hover:bg-dark-bg flex items-center justify-between`}
                                >
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <Search className="text-slate-400 mr-2 flex-shrink-0" size={20} />
                                        {selectedProduct ? (
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="font-bold text-slate-500 dark:text-dark-muted text-sm">[{selectedProduct.sku}]</span>
                                                <span className="truncate">{selectedProduct.name}</span>
                                                {selectedProduct.hasVat ? (
                                                    <span className="flex-shrink-0 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded text-xs font-bold border border-purple-200 dark:border-purple-800/50">VAT</span>
                                                ) : (
                                                    <span className="flex-shrink-0 px-2 py-0.5 bg-slate-200 dark:bg-dark-bg text-slate-500 dark:text-dark-muted rounded text-xs border border-slate-300 dark:border-dark-border">No VAT</span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 dark:text-dark-muted">-- Select Product --</span>
                                        )}
                                    </div>
                                    <div className="text-slate-400 dark:text-dark-muted">
                                        <ChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                                    </div>
                                </div>

                                {isDropdownOpen && (
                                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-dark-surface border border-slate-100 dark:border-dark-border rounded-2xl shadow-xl max-h-80 overflow-y-auto animate-fade-in-up transition-colors">
                                        <div className="p-2 sticky top-0 bg-white dark:bg-dark-surface border-b border-slate-50 dark:border-dark-border">
                                            <input
                                                type="text"
                                                placeholder="Type to search..."
                                                autoFocus
                                                className="w-full px-4 py-2 bg-slate-50 dark:bg-dark-bg rounded-xl text-sm outline-none border border-transparent focus:border-blue-200 dark:focus:border-blue-500/50 focus:bg-white dark:focus:bg-dark-bg text-slate-700 dark:text-dark-text transition-all"
                                                onClick={(e) => e.stopPropagation()}
                                                value={productSearchTerm}
                                                onChange={(e) => setProductSearchTerm(e.target.value)}
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
                                                        setProductSearchTerm('');
                                                    }
                                                }}
                                                className={`px-4 py-3 flex justify-between items-center cursor-pointer transition-colors border-b border-slate-50 dark:border-dark-border last:border-0
                                                ${p.stock === 0 ? 'opacity-50 cursor-not-allowed bg-slate-50 dark:bg-dark-bg' : 'hover:bg-blue-50 dark:hover:bg-dark-bg'}
                                                ${selectedProductId === p.id.toString() ? 'bg-blue-50 dark:bg-dark-bg' : ''}
                                            `}
                                            >
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-dark-text">
                                                        <span className="text-slate-500 dark:text-dark-muted font-bold text-xs">[{p.sku}]</span>
                                                        {p.name}
                                                        {p.hasVat ? (
                                                            <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded text-[10px] font-bold border border-purple-200 dark:border-purple-800/50">VAT</span>
                                                        ) : (
                                                            <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-dark-bg text-slate-500 dark:text-dark-muted rounded text-[10px] border border-slate-200 dark:border-dark-border">No VAT</span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-slate-400 dark:text-dark-muted">Price: ฿ {p.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                </div>
                                                <div className="text-right">
                                                    <span className={`text-xs font-bold ${p.stock > 0 ? 'text-green-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                                                        {p.stock > 0 ? `${p.stock} in stock` : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}

                                        {filteredProducts.length === 0 && (
                                            <div className="p-8 text-center text-slate-400 dark:text-dark-muted text-sm italic">No products found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Stock Preview Box */}
                            {selectedProduct && (
                                <div className="bg-slate-50 dark:bg-dark-bg rounded-2xl p-4 border border-slate-200 dark:border-dark-border mb-4 animate-slide-up transition-colors">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-dark-text font-semibold">
                                            <Package size={20} className="text-slate-400 dark:text-dark-muted" /> <Text as="span">Product Status</Text>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${remainingStock < 0 ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-emerald-900/40 text-green-600 dark:text-emerald-400'}`}>
                                            <Text as="span">{remainingStock < 0 ? 'Insufficient Stock' : 'In Stock'}</Text>
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-200 dark:border-dark-border transition-colors">
                                            <Text className="text-xs text-slate-400 dark:text-dark-muted mb-1 uppercase tracking-tight font-bold">Current Stock</Text>
                                            <div className="flex items-baseline gap-1">
                                                <Text className="text-2xl font-bold text-slate-800 dark:text-dark-text">{selectedProduct.stock}</Text>
                                                <Text as="span" className="text-xs font-normal text-slate-400 dark:text-dark-muted">units</Text>
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-dark-surface p-4 rounded-xl border border-slate-200 dark:border-dark-border relative overflow-hidden transition-colors">
                                            <Text className="text-xs text-blue-500 dark:text-blue-400 mb-1 font-bold uppercase tracking-tight">Projected Info</Text>
                                            <div className="flex items-baseline gap-1">
                                                <Text className={`text-2xl font-bold ${remainingStock < 5 ? 'text-orange-500 dark:text-orange-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                                    {remainingStock}
                                                </Text>
                                                <Text as="span" className="text-xs font-normal text-slate-400 dark:text-dark-muted">units</Text>
                                            </div>
                                            <TrendingDown className="absolute right-2 bottom-2 text-slate-100 dark:text-dark-bg/30" size={40} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quantity & Price Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end transition-colors">
                                <div>
                                    <Text as="label" className="block text-sm font-medium text-slate-700 dark:text-dark-muted mb-2">Quantity</Text>
                                    <div className="flex items-center transition-colors">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-3 border border-slate-200 dark:border-dark-border rounded-l-xl hover:bg-slate-50 dark:hover:bg-dark-bg text-slate-600 dark:text-dark-muted bg-white dark:bg-dark-bg transition-colors cursor-pointer disabled:cursor-not-allowed"
                                            disabled={!selectedProduct}
                                        >
                                            <Minus size={18} />
                                        </button>
                                        <input
                                            type="number"
                                            value={quantity}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                                            className="w-full py-3 text-center border-y border-slate-200 dark:border-dark-border text-lg font-bold outline-none bg-white dark:bg-dark-bg text-slate-800 dark:text-dark-text transition-colors"
                                            disabled={!selectedProduct}
                                        />
                                        <button
                                            onClick={() => setQuantity(Math.min(selectedProduct ? selectedProduct.stock : 99, quantity + 1))}
                                            className="p-3 border border-slate-200 dark:border-dark-border rounded-r-xl hover:bg-slate-50 dark:hover:bg-dark-bg text-slate-600 dark:text-dark-muted bg-white dark:bg-dark-bg transition-colors cursor-pointer disabled:cursor-not-allowed"
                                            disabled={!selectedProduct}
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <Text as="label" className="block text-sm font-medium text-slate-700 dark:text-dark-muted mb-2">Unit Price / Tax</Text>
                                    <div className="w-full px-4 py-3 bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl text-slate-500 dark:text-dark-muted text-lg flex justify-between items-center transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Text as="span" className="font-bold text-slate-800 dark:text-dark-text">฿ {selectedProduct ? selectedProduct.price.toLocaleString() : '0'}</Text>
                                            {selectedProduct && selectedProduct.hasVat && (
                                                <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded text-xs font-bold border border-purple-200 dark:border-purple-800/50 ml-2">
                                                    <Tag size={10} /> VAT
                                                </span>
                                            )}
                                            {selectedProduct && !selectedProduct.hasVat && (
                                                <span className="px-2 py-0.5 bg-slate-200 dark:bg-dark-bg text-slate-500 dark:text-dark-muted rounded text-xs border border-slate-300 dark:border-dark-border ml-2 transition-colors">No VAT</span>
                                            )}
                                        </div>
                                        <Text as="span" className="text-xs uppercase opacity-80">THB</Text>
                                    </div>
                                </div>
                            </div>

                            {/* Total Amount */}
                            <div className="mt-5 bg-white dark:bg-dark-surface rounded-2xl p-4 flex justify-between items-center text-slate-800 dark:text-dark-text shadow-sm border border-slate-100 dark:border-dark-border transition-colors">
                                <div>
                                    <Text className="text-slate-400 dark:text-dark-muted text-sm">Total Amount</Text>
                                    <Text className="text-xs text-slate-400 dark:text-dark-muted opacity-80">
                                        {selectedProduct?.hasVat ? 'VAT Included (ราคารวมภาษีแล้ว)' : 'No VAT (ราคายกเว้นภาษี)'}
                                    </Text>
                                </div>
                                <div className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                                    <Text as="span">฿ {parseFloat(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-4 flex justify-end gap-4 transition-colors">
                                <button
                                    onClick={handleConfirmSale}
                                    disabled={!selectedProduct || remainingStock < 0 || isSuccess}
                                    className={`px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center gap-2 cursor-pointer
                                    ${isSuccess
                                            ? 'bg-green-600 dark:bg-emerald-600 hover:bg-green-700 dark:hover:bg-emerald-500'
                                            : 'bg-slate-800 dark:bg-blue-600 hover:bg-slate-900 dark:hover:bg-blue-500 shadow-slate-300 dark:shadow-none'
                                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                                >
                                    {isSuccess ? <CheckCircle size={20} /> : null}
                                    <Text as="span">{isSuccess ? 'Sale Confirmed!' : 'Confirm Sale'}</Text>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Recent Transactions */}
                    <div className="lg:col-span-1">
                        <RecentTransactions recentSales={recentSales} />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Sales;

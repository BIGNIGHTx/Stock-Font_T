import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Plus, Edit3, Trash2, X, CheckCircle, AlertCircle,
  ArrowLeft, Tag
} from 'lucide-react';
import { Badge } from '../components/badge';
import { Text } from '../components/text';
import { useAlert } from '../contexts/AlertContext';

// --- Const: หมวดหมู่และแบรนด์ (initial) ---
const INITIAL_CATEGORIES = [
  {
    id: 'Tv',
    name: "TV",
    thai: "โทรทัศน์",
    image:
      "https://images.unsplash.com/photo-1717295248230-93ea71f48f92?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8VFZ8ZW58MHx8MHx8fDA%3D",
    action: "View Collection",
    icon: "arrow_forward",
  },
  {
    id: 'Fan',
    name: "Fan",
    thai: "พัดลม",
    image:
      "https://media.istockphoto.com/id/1150705585/th/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2/%E0%B8%A0%E0%B8%B2%E0%B8%9E%E0%B8%A3%E0%B8%B0%E0%B8%A2%E0%B8%B0%E0%B9%83%E0%B8%81%E0%B8%A5%E0%B9%89%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%9E%E0%B8%B1%E0%B8%94%E0%B8%A5%E0%B8%A1%E0%B8%95%E0%B8%B1%E0%B9%89%E0%B8%87%E0%B8%9E%E0%B8%B7%E0%B9%89%E0%B8%99%E0%B9%84%E0%B8%9F%E0%B8%9F%E0%B9%89%E0%B8%B2.jpg?s=612x612&w=0&k=20&c=vX1hV1muUVa96MZpx4jJd6Ujl54pQX6Z8eIyyrdkLvw=",
    action: "View Collection",
    icon: "arrow_forward",
  },
  {
    id: 'Refrigerator',
    name: "Refrigerator",
    thai: "ตู้เย็น",
    image:
      "https://media.istockphoto.com/id/2162681544/th/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2/%E0%B8%AB%E0%B9%89%E0%B8%AD%E0%B8%87%E0%B8%84%E0%B8%A3%E0%B8%B1%E0%B8%A7%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%97%E0%B8%B1%E0%B8%99%E0%B8%AA%E0%B8%A1%E0%B8%B1%E0%B8%A2%E0%B8%9E%E0%B8%A3%E0%B9%89%E0%B8%AD%E0%B8%A1%E0%B8%A1%E0%B8%B8%E0%B8%A1%E0%B8%A1%E0%B8%AD%E0%B8%87%E0%B8%94%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%AB%E0%B8%99%E0%B9%89%E0%B8%B2%E0%B8%82%E0%B8%AD%E0%B8%87%E0%B8%95%E0%B8%B9%E0%B9%89%E0%B9%80%E0%B8%A2%E0%B9%87%E0%B8%99%E0%B9%81%E0%B8%A5%E0%B8%B0%E0%B8%95%E0%B8%B9%E0%B9%89%E0%B8%AA%E0%B8%B5%E0%B8%82%E0%B8%B2%E0%B8%A7.jpg?s=612x612&w=0&k=20&c=_tw1MIr3359DcIqBmiaVymUxQFWSJYNnBzlzxfA9YrI=",
    action: "Restock",
    icon: "add_shopping_cart",
  },
  {
    id: 'Washing Machine',
    name: "Washing Machine",
    thai: "เครื่องซักผ้า",
    image:
      "https://media.istockphoto.com/id/171578869/th/%E0%B8%A3%E0%B8%B9%E0%B8%9B%E0%B8%96%E0%B9%88%E0%B8%B2%E0%B8%A2/%E0%B9%80%E0%B8%84%E0%B8%A3%E0%B8%B7%E0%B9%88%E0%B8%AD%E0%B8%87%E0%B8%8B%E0%B8%B1%E0%B8%81%E0%B8%9C%E0%B9%89%E0%B8%B2.jpg?s=612x612&w=0&k=20&c=r1VoicB7w53Eo-5zAhY0aX-xf4biIVgUEVR_lwILdFM=",
    action: "Restock",
    icon: "add_shopping_cart",
  },
];

const INITIAL_BRANDS = ['All', 'Samsung', 'LG', 'Mitsubishi', 'Sharp', 'Hitachi', 'Panasonic'];

const Inventory = ({ initialOpenModal = false }) => {
  const { alert, confirm } = useAlert();

  // --- View State ---
  const [currentView, setCurrentView] = useState('categories');
  const [activeCategory, setActiveCategory] = useState(null);

  // --- Categories & Brands (dynamic) ---
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [brands, setBrands] = useState(INITIAL_BRANDS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filters ---
  const [stockFilter, setStockFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('All');
  const [vatFilter, setVatFilter] = useState('all');

  // --- Form State (product) ---
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: 'Tv', price: '', cost_price: '', stock: '', hasVat: false
  });
  const [editingId, setEditingId] = useState(null);

  // --- Add Category Modal ---
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', thai: '', image: '' });

  // --- Add Brand Modal ---
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');

  // --- Hovering brand (for delete X) ---
  const [hoveredBrand, setHoveredBrand] = useState(null);

  useEffect(() => {
    if (initialOpenModal) setIsModalOpen(true);
  }, [initialOpenModal]);

  // --- 1. Fetch Data ---
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/products/');
      const mappedData = response.data.map(p => ({
        ...p,
        hasVat: p.has_vat !== undefined ? p.has_vat : (p.hasVat !== undefined ? p.hasVat : false)
      }));
      setProducts(mappedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // --- 2. Save Product ---
  const handleSaveProduct = async () => {
    const { name, sku, category, price, cost_price, stock, hasVat } = newProduct;
    if (!name || !sku || !category || price === '' || cost_price === '' || stock === '') {
      await alert('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'ข้อมูลไม่ครบ', 'warning');
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) { await alert('ราคาไม่ถูกต้อง', 'Warning', 'warning'); return; }
    try {
      const payload = {
        name, sku, category,
        price: parseFloat(price),
        cost_price: parseFloat(cost_price),
        stock: parseInt(stock),
        has_vat: hasVat,
        hasVat: hasVat
      };
      if (editingId) {
        await axios.put(`http://127.0.0.1:8000/products/${editingId}`, payload);
        await alert("อัปเดตสินค้าเรียบร้อย!", "สำเร็จ", "success");
      } else {
        await axios.post('http://127.0.0.1:8000/products/', payload);
        await alert("บันทึกสินค้าเรียบร้อย!", "สำเร็จ", "success");
      }
      setIsModalOpen(false);
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error(error);
      await alert(`Error: ${error.response?.data?.detail || error.message}`, 'Error', 'error');
    }
  };

  const resetForm = () => {
    setNewProduct({ name: '', sku: '', category: activeCategory || 'Tv', price: '', cost_price: '', stock: '', hasVat: false });
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      cost_price: product.cost_price,
      stock: product.stock,
      hasVat: product.hasVat
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (await confirm("ลบสินค้า?", "ยืนยัน", "warning")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/products/${id}`);
        fetchProducts();
      } catch (error) {
        await alert("ลบไม่สำเร็จ", "Error", "error");
      }
    }
  };

  // --- 3. Add Category ---
  const handleAddCategory = () => {
    if (!newCat.name.trim() || !newCat.thai.trim()) {
      alert('กรุณากรอกชื่อ Category', 'ข้อมูลไม่ครบ', 'warning');
      return;
    }
    const id = newCat.name.trim();
    if (categories.find(c => c.id === id)) {
      alert('มี Category นี้อยู่แล้ว', 'ซ้ำ', 'warning');
      return;
    }
    setCategories(prev => [...prev, {
      id,
      name: newCat.name.trim(),
      thai: newCat.thai.trim(),
      image: newCat.image.trim() || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60',
      action: 'View Collection',
      icon: 'arrow_forward',
    }]);
    setNewCat({ name: '', thai: '', image: '' });
    setIsCatModalOpen(false);
  };

  const handleDeleteCategory = async (catId, e) => {
    e.stopPropagation();
    if (await confirm(`ลบ Category "${catId}"?`, "ยืนยันการลบ", "warning")) {
      setCategories(prev => prev.filter(c => c.id !== catId));
    }
  };

  // --- 4. Manage Brands ---
  const handleAddBrand = () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    if (brands.includes(trimmed)) {
      alert('มีแบรนด์นี้อยู่แล้ว', 'ซ้ำ', 'warning');
      return;
    }
    setBrands(prev => [...prev, trimmed]);
    setNewBrandName('');
    setIsBrandModalOpen(false);
  };

  const handleDeleteBrand = async (brand, e) => {
    e.stopPropagation();
    if (brand === 'All') return;
    if (await confirm(`ลบแบรนด์ "${brand}"?`, "ยืนยัน", "warning")) {
      setBrands(prev => prev.filter(b => b !== brand));
      if (brandFilter === brand) setBrandFilter('All');
    }
  };

  // --- 5. Filter Logic ---
  const filteredProducts = products.filter(p => {
    if (p.category !== activeCategory) return false;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStock = true;
    if (stockFilter === 'normal') matchesStock = p.stock >= 5;
    if (stockFilter === 'low') matchesStock = p.stock < 5;
    let matchesBrand = true;
    if (brandFilter !== 'All') {
      matchesBrand = p.name.toLowerCase().includes(brandFilter.toLowerCase());
    }
    let matchesVat = true;
    if (vatFilter === 'vat') matchesVat = p.hasVat === true;
    if (vatFilter === 'novat') matchesVat = p.hasVat === false;
    return matchesSearch && matchesStock && matchesBrand && matchesVat;
  });

  const selectCategory = (catId) => {
    setActiveCategory(catId);
    setCurrentView('products');
    setBrandFilter('All');
    setSearchTerm('');
    setStockFilter('all');
    setVatFilter('all');
  };

  return (
    <div className="min-h-screen bg-[#F3F5F9] font-sans flex flex-col items-center">
      <div className="w-full max-w-[1280px] p-4 md:p-6 text-slate-700 pb-10">

        {/* ===== HEADER ===== */}
        {currentView === 'products' ? (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('categories')}
                className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 cursor-pointer"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <Text as="h2" className="text-2xl font-bold text-slate-900">
                  {`${activeCategory} Stock`}
                </Text>
                <Text className="text-slate-500 text-sm mt-0.5">Manage your inventory</Text>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex items-center px-6 py-3 bg-[#1e293b] text-white rounded-xl font-semibold shadow-lg shadow-slate-300 hover:bg-slate-800 transition-all transform active:scale-95"
            >
              <Plus size={18} className="mr-2" /> <Text as="span">Add Product</Text>
            </button>
          </div>
        ) : (
          /* Categories Header — title centered, button floats right */
          <div className="relative flex items-center justify-center mb-5 min-h-[90px]">
            {/* Center title — truly centered in the page */}
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-display font-medium text-slate-900 mb-2 tracking-tight">
                Inventory <span className="text-[#D4AF37] italic font-serif">Categories</span>
              </h1>
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="h-[1px] w-8 bg-slate-300"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
                <div className="h-[1px] w-8 bg-slate-300"></div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed font-body max-w-xl mx-auto">
                Browse through our premium collection of household essentials.
              </p>
            </div>
            {/* Add Category button — absolute right, vertically centered */}
            <button
              onClick={() => setIsCatModalOpen(true)}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-2.5 bg-[#1e293b] text-white rounded-xl font-semibold shadow-md hover:bg-slate-700 transition-all active:scale-95 text-sm whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} />
              Add Category
            </button>
          </div>
        )}

        {/* ===== VIEW 1: CATEGORY CARDS ===== */}
        {currentView === 'categories' && (
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 max-w-[1600px] w-full mx-auto">
            {categories.map((cat) => {
              const itemCount = products.filter(p => p.category === cat.id).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-transparent hover:border-slate-100 relative"
                >
                  {/* Delete Category button — shows on hover */}
                  <button
                    onClick={(e) => handleDeleteCategory(cat.id, e)}
                    className="absolute top-3 left-3 z-30 p-1.5 rounded-full bg-white/80 backdrop-blur text-slate-400 hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                    title="ลบ Category นี้"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Image */}
                  <div className="relative h-32 overflow-hidden bg-slate-100">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <span
                        className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm ${itemCount === 0
                          ? "bg-red-500 text-white"
                          : "bg-white text-slate-700"
                          }`}
                      >
                        {itemCount} Items
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 bg-white">
                    <div className="w-8 h-[2px] bg-primary mb-3 group-hover:w-12 transition-all duration-500"></div>
                    <h3 className="text-base font-display font-bold text-slate-900 mb-0.5">{cat.name}</h3>
                    <p className="text-xs font-body text-slate-500 font-light">{cat.thai}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== VIEW 2: PRODUCT LIST ===== */}
        {currentView === 'products' && (
          <div className="">

            {/* Brand Filters — with hover + delete + add brand button */}
            <div className="flex gap-2 mt-1 pt-3 mb-3 overflow-x-auto pb-2 scrollbar-hide items-center">
              {brands.map(brand => (
                <div
                  key={brand}
                  onMouseEnter={() => setHoveredBrand(brand)}
                  onMouseLeave={() => setHoveredBrand(null)}
                  className={`relative flex-shrink-0 transition-all duration-200 ${brand !== 'All' && hoveredBrand === brand ? 'mr-2' : ''}`}
                >
                  {/* Pill */}
                  <div
                    onClick={() => setBrandFilter(brand)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer select-none
                      ${brandFilter === brand
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm'}`}
                  >
                    {brand}
                  </div>

                  {/* X Badge — ลอยที่มุมขวาบน สีแดง */}
                  {brand !== 'All' && (
                    <button
                      onClick={(e) => handleDeleteBrand(brand, e)}
                      title={`ลบแบรนด์ ${brand}`}
                      className={`absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all duration-150 cursor-pointer
                        ${hoveredBrand === brand ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              ))}

              {/* Add Brand Button */}
              <button
                onClick={() => { setNewBrandName(''); setIsBrandModalOpen(true); }}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all whitespace-nowrap cursor-pointer"
              >
                <Plus size={14} />
                Add Brand
              </button>
            </div>

            {/* Search, Stock & VAT Filters */}
            <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex flex-col xl:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder={`Search in ${activeCategory}...`}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl outline-none transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center">
                {/* Stock Filter */}
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => setStockFilter(stockFilter === 'normal' ? 'all' : 'normal')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${stockFilter === 'normal' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <CheckCircle size={14} /> Green Stock
                  </button>
                  <button
                    onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${stockFilter === 'low' ? 'bg-white text-rose-500 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    <AlertCircle size={14} /> Red Stock
                  </button>
                </div>
                {/* VAT Filter */}
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => setVatFilter(vatFilter === 'vat' ? 'all' : 'vat')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${vatFilter === 'vat' ? 'bg-white text-purple-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    VAT Only
                  </button>
                  <button
                    onClick={() => setVatFilter(vatFilter === 'novat' ? 'all' : 'novat')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                      ${vatFilter === 'novat' ? 'bg-white text-slate-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                    No VAT
                  </button>
                </div>
              </div>
            </div>

            {/* Product Table */}
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Price / Tax</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-3 font-bold text-slate-800 group-hover:text-blue-600">{p.name}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{p.sku}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-700">฿{p.price.toLocaleString()}</span>
                            {p.hasVat === true ? (
                              <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-600 text-[10px] font-bold border border-purple-200">VAT</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] border border-slate-200">No VAT</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={p.stock >= 5 ? 'emerald' : 'rose'} className="w-8 text-center inline-block">{p.stock}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right flex justify-end gap-2">
                          <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full"><Edit3 size={18} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">ไม่พบสินค้าในหมวดหมู่นี้หรือตามเงื่อนไขการกรอง</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===== MODAL: ADD / EDIT PRODUCT ===== */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-slate-100">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                <Text as="h3" className="font-bold text-xl text-slate-800">{editingId ? 'Edit Product' : 'Add New Product'}</Text>
                <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Product Name (Include Brand)</Text>
                  <input type="text" placeholder="e.g. Samsung TV 55 Inch" className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100"
                    value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">SKU</Text>
                    <input type="text" placeholder="SKU-001" className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100"
                      value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
                  </div>
                  <div>
                    <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Category</Text>
                    <select className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100"
                      value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Tax Type (VAT)</Text>
                  <div className="flex gap-4 p-1 bg-slate-50 rounded-xl border border-slate-200">
                    <button
                      onClick={() => setNewProduct({ ...newProduct, hasVat: false })}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${!newProduct.hasVat ? 'bg-white shadow-sm text-slate-800 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      No VAT (ราคาปกติ)
                    </button>
                    <button
                      onClick={() => setNewProduct({ ...newProduct, hasVat: true })}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${newProduct.hasVat ? 'bg-purple-500 shadow-md text-white' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      VAT Included (มี VAT)
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Price</Text>
                    <input type="number" className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100"
                      value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                  </div>
                  <div>
                    <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Cost</Text>
                    <input type="number" className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100"
                      value={newProduct.cost_price} onChange={e => setNewProduct({ ...newProduct, cost_price: e.target.value })} />
                  </div>
                  <div>
                    <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Stock</Text>
                    <input type="number" className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100"
                      value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 hover:bg-slate-200 rounded-xl font-bold">Cancel</button>
                <button onClick={handleSaveProduct} className="px-8 py-3 bg-[#1e293b] hover:bg-slate-800 text-white rounded-xl shadow-lg font-bold">Save Product</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: ADD CATEGORY ===== */}
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCatModalOpen(false)}></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-100">
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1e293b] flex items-center justify-center">
                    <Tag size={16} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">Add Category</h3>
                </div>
                <button onClick={() => setIsCatModalOpen(false)}>
                  <X size={24} className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category Name <span className="text-slate-400">(English)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Air Conditioner"
                    className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                    value={newCat.name}
                    onChange={e => setNewCat({ ...newCat, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    ชื่อภาษาไทย
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น เครื่องปรับอากาศ"
                    className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                    value={newCat.thai}
                    onChange={e => setNewCat({ ...newCat, thai: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Image URL <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                    value={newCat.image}
                    onChange={e => setNewCat({ ...newCat, image: e.target.value })}
                  />
                  <p className="text-xs text-slate-400 mt-1.5">หากไม่กรอก จะใช้รูป default</p>
                </div>

                {/* Preview */}
                {newCat.image && (
                  <div className="rounded-xl overflow-hidden h-24 border border-slate-100">
                    <img src={newCat.image} alt="preview" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setIsCatModalOpen(false)}
                  className="px-6 py-2.5 text-slate-500 hover:bg-slate-200 rounded-xl font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  className="px-8 py-2.5 bg-[#1e293b] hover:bg-slate-700 text-white rounded-xl shadow font-semibold transition-all active:scale-95"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: ADD BRAND ===== */}
        {isBrandModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsBrandModalOpen(false)}></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-slate-100">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-slate-800">Add Brand</h3>
                <button onClick={() => setIsBrandModalOpen(false)}>
                  <X size={22} className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <div className="p-8">
                <label className="block text-sm font-medium text-slate-700 mb-2">Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sony"
                  className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddBrand()}
                  autoFocus
                />
                <p className="text-xs text-slate-400 mt-2">กด Enter หรือปุ่ม Add Brand เพื่อเพิ่ม</p>
              </div>
              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsBrandModalOpen(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-200 rounded-xl font-semibold transition-all">Cancel</button>
                <button onClick={handleAddBrand} className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow font-semibold transition-all active:scale-95">Add Brand</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Inventory;
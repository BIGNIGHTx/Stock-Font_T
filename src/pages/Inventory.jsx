import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  Search, Plus, Edit3, Trash2, X, CheckCircle, AlertCircle,
  ArrowLeft, Tag
} from 'lucide-react';
import { Badge } from '../components/badge';
import { Text } from '../components/text';
import { useAlert } from '../contexts/AlertContext';

const DEFAULT_BRANDS = ['Samsung', 'LG', 'Mitsubishi', 'Sharp', 'Hitachi', 'Panasonic'];
const API = 'http://127.0.0.1:8000';

// "All Products" card เดียวที่ hardcode — ทุก category อื่นมาจาก DB ทั้งหมด
const ALL_PRODUCTS_CARD = {
  id: 'all_products',
  name: 'All Products',
  thai: 'สินค้าทั้งหมด',
  image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&auto=format&fit=crop&q=60',
};

const Inventory = () => {
  const { alert, confirm } = useAlert();
  const location = useLocation();

  // Parse query params
  const queryParams = new URLSearchParams(location.search);
  const initialOpenModal = queryParams.get('openAddModal') === 'true';

  const [currentView, setCurrentView] = useState('categories');
  const [activeCategory, setActiveCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [stockFilter, setStockFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('All');
  const [vatFilter, setVatFilter] = useState('all');

  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: '', price: '', cost_price: '', stock: '', hasVat: false
  });
  const [editingId, setEditingId] = useState(null);

  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', thai: '', image: '' });
  const [editingCatId, setEditingCatId] = useState(null);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [hoveredBrand, setHoveredBrand] = useState(null);

  useEffect(() => {
    if (initialOpenModal) setIsModalOpen(true);
  }, [initialOpenModal]);

  const resetForm = () => {
    const firstCat = categories.find(c => c.id !== 'all_products');
    setNewProduct({
      name: '', sku: '',
      category: activeCategory || (firstCat ? firstCat.name : ''),
      price: '', cost_price: '', stock: '', hasVat: false
    });
    setEditingId(null);
  };

  // ==================== FETCH ====================

  // ดึง Category จาก DB ล้วนๆ ไม่ hardcode
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API}/categories/`);
      const apiCats = res.data || [];
      // "All Products" ขึ้นก่อน แล้วตามด้วย DB
      setCategories([
        ALL_PRODUCTS_CARD,
        ...apiCats.map(ac => ({
          id: ac.id,
          name: ac.name,
          thai: ac.thai || '',
          image: ac.image || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&auto=format&fit=crop&q=60',
        }))
      ]);
    } catch (error) {
      console.warn('Categories API not available');
      setCategories([ALL_PRODUCTS_CARD]);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API}/products/`);
      const mapped = res.data.map(p => ({
        ...p,
        hasVat: p.has_vat !== undefined ? p.has_vat : (p.hasVat ?? false)
      }));
      setProducts(mapped);
      setIsLoading(false);
      return mapped;
    } catch (error) {
      console.error('Error fetching products:', error);
      setIsLoading(false);
      return [];
    }
  };

  const fetchBrands = async () => {
    try {
      const res = await axios.get(`${API}/brands/`);
      if (res.data && res.data.length > 0) {
        setBrands(res.data);
      } else {
        const seeded = [];
        for (const bName of DEFAULT_BRANDS) {
          try {
            const r = await axios.post(`${API}/brands/`, { name: bName });
            seeded.push(r.data);
          } catch (_) { }
        }
        setBrands(seeded.length > 0
          ? seeded
          : DEFAULT_BRANDS.map((n, i) => ({ id: `local_${i}`, name: n }))
        );
      }
    } catch {
      setBrands(DEFAULT_BRANDS.map((n, i) => ({ id: `local_${i}`, name: n })));
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchProducts();
      await fetchCategories();
      await fetchBrands();
    };
    init();
  }, []);

  // ==================== PRODUCT CRUD ====================

  const handleSaveProduct = async () => {
    const { name, sku, category, price, cost_price, stock, hasVat } = newProduct;
    if (!name || !sku || !category || price === '' || cost_price === '' || stock === '') {
      await alert('กรุณากรอกข้อมูลให้ครบทุกช่อง', 'ข้อมูลไม่ครบ', 'warning');
      return;
    }
    if (isNaN(price) || parseFloat(price) <= 0) {
      await alert('ราคาไม่ถูกต้อง', 'Warning', 'warning');
      return;
    }
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
        await axios.put(`${API}/products/${editingId}`, payload);
        await alert('อัปเดตสินค้าเรียบร้อย!', 'สำเร็จ', 'success');
      } else {
        await axios.post(`${API}/products/`, payload);
        await alert('บันทึกสินค้าเรียบร้อย!', 'สำเร็จ', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      await fetchProducts();
    } catch (error) {
      await alert(`Error: ${error.response?.data?.detail || error.message}`, 'Error', 'error');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name, sku: product.sku,
      category: product.category, price: product.price,
      cost_price: product.cost_price, stock: product.stock,
      hasVat: product.hasVat
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (await confirm('ลบสินค้า?', 'ยืนยัน', 'warning')) {
      try {
        await axios.delete(`${API}/products/${id}`);
        await fetchProducts();
      } catch {
        await alert('ลบไม่สำเร็จ', 'Error', 'error');
      }
    }
  };

  // ==================== CATEGORY CRUD ====================

  // ✅ ทุก category มาจาก DB → มี numeric id เสมอ → PUT ได้เลย
  const handleEditCategory = (cat, e) => {
    e.stopPropagation();
    setEditingCatId(cat.id);
    setNewCat({ name: cat.name, thai: cat.thai || '', image: cat.image || '' });
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!newCat.name.trim() || !newCat.thai.trim()) {
      await alert('กรุณากรอกชื่อ Category', 'ข้อมูลไม่ครบ', 'warning');
      return;
    }
    const payload = {
      name: newCat.name.trim(),
      thai: newCat.thai.trim(),
      image: newCat.image.trim() || null,
    };
    try {
      if (editingCatId) {
        // PUT — Backend จะ update ชื่อ category ในสินค้าทุกตัวด้วยอัตโนมัติ
        await axios.put(`${API}/categories/${editingCatId}`, payload);
        await alert('อัปเดต Category เรียบร้อย!', 'สำเร็จ', 'success');
      } else {
        // POST — เพิ่มใหม่
        await axios.post(`${API}/categories/`, payload);
        await alert('เพิ่ม Category เรียบร้อย!', 'สำเร็จ', 'success');
      }
      setEditingCatId(null);
      setNewCat({ name: '', thai: '', image: '' });
      setIsCatModalOpen(false);
      await fetchCategories();
      await fetchProducts(); // refresh สินค้าด้วย เผื่อชื่อ category เปลี่ยน
    } catch (error) {
      await alert(`ผิดพลาด: ${error.response?.data?.detail || error.message}`, 'Error', 'error');
    }
  };

  const handleDeleteCategory = async (catId, e) => {
    e.stopPropagation();
    if (catId === 'all_products') {
      await alert('ไม่สามารถลบ All Products ได้', 'แจ้งเตือน', 'warning');
      return;
    }
    if (await confirm('ลบ Category นี้?', 'ยืนยันการลบ', 'warning')) {
      try {
        await axios.delete(`${API}/categories/${catId}`);
        await fetchCategories();
      } catch (error) {
        await alert(`ลบไม่สำเร็จ: ${error.response?.data?.detail || error.message}`, 'Error', 'error');
      }
    }
  };

  // ==================== BRAND CRUD ====================

  const handleAddBrand = async () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    if (brands.find(b => b.name.toLowerCase() === trimmed.toLowerCase())) {
      await alert('มีแบรนด์นี้อยู่แล้ว', 'ซ้ำ', 'warning');
      return;
    }
    try {
      const res = await axios.post(`${API}/brands/`, { name: trimmed });
      setBrands(prev => [...prev, res.data]);
      setNewBrandName('');
      setIsBrandModalOpen(false);
    } catch (error) {
      await alert(`เพิ่มแบรนด์ไม่สำเร็จ: ${error.response?.data?.detail || error.message}`, 'Error', 'error');
    }
  };

  const handleDeleteBrand = async (brand, e) => {
    e.stopPropagation();
    if (!brand.id || String(brand.id).startsWith('local_')) return;
    if (await confirm(`ลบแบรนด์ "${brand.name}"?`, 'ยืนยัน', 'warning')) {
      try {
        await axios.delete(`${API}/brands/${brand.id}`);
        setBrands(prev => prev.filter(b => b.id !== brand.id));
        if (brandFilter === brand.name) setBrandFilter('All');
      } catch {
        await alert('ลบไม่สำเร็จ', 'Error', 'error');
      }
    }
  };

  // ==================== FILTER ====================

  const filteredProducts = products.filter(p => {
    if (activeCategory !== 'All Products') {
      if (String(p.category).toLowerCase().trim() !== String(activeCategory).toLowerCase().trim()) return false;
    }
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStock = true;
    if (stockFilter === 'normal') matchesStock = p.stock >= 5;
    if (stockFilter === 'low') matchesStock = p.stock < 5;
    let matchesBrand = true;
    if (brandFilter !== 'All') matchesBrand = p.name.toLowerCase().includes(brandFilter.toLowerCase());
    let matchesVat = true;
    if (vatFilter === 'vat') matchesVat = p.hasVat === true;
    if (vatFilter === 'novat') matchesVat = p.hasVat === false;
    return matchesSearch && matchesStock && matchesBrand && matchesVat;
  });

  // ==================== SUMMARY CALCULATIONS ====================
  const getSummaryData = () => {
    // We calculate based on the filters but it might be better to show global for category?
    // User asked for "Green Stock", "Red Stock", "VAT Only", "No VAT"
    // Usually summary cards show the total for the active set of products.
    const activeProducts = products.filter(p => {
      if (activeCategory === 'All Products') return true;
      return String(p.category).toLowerCase().trim() === String(activeCategory).toLowerCase().trim();
    });

    return {
      greenStock: activeProducts.filter(p => p.stock >= 5).length,
      redStock: activeProducts.filter(p => p.stock < 5).length,
      vatCount: activeProducts.filter(p => p.hasVat).length,
      noVatCount: activeProducts.filter(p => !p.hasVat).length,
    };
  };

  const summaryData = getSummaryData();

  // ==================== RENDER ====================

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
                <Text as="h2" className="text-2xl font-bold text-slate-900">{`${activeCategory} Stock`}</Text>
                <Text className="text-slate-500 text-sm mt-0.5">Manage your inventory</Text>
              </div>
            </div>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="flex items-center px-6 py-3 bg-[#1e293b] text-white rounded-xl font-semibold shadow-lg shadow-slate-300 hover:bg-slate-800 transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus size={18} className="mr-2" /> <Text as="span">Add Product</Text>
            </button>
          </div>
        ) : (
          <div className="relative flex items-center justify-center mb-5 min-h-[90px]">
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
            <button
              onClick={() => { setNewCat({ name: '', thai: '', image: '' }); setEditingCatId(null); setIsCatModalOpen(true); }}
              className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-2.5 bg-[#1e293b] text-white rounded-xl font-semibold shadow-md hover:bg-slate-700 transition-all active:scale-95 text-sm whitespace-nowrap cursor-pointer"
            >
              <Plus size={16} /> Add Category
            </button>
          </div>
        )}

        {/* ===== VIEW 1: CATEGORY CARDS ===== */}
        {currentView === 'categories' && (
          <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-4 max-w-[1600px] w-full mx-auto">
            {categories.map((cat) => {
              const itemCount = cat.name === 'All Products'
                ? products.length
                : products.filter(p =>
                  String(p.category).toLowerCase().trim() === String(cat.name).toLowerCase().trim()
                ).length;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.name);
                    setCurrentView('products');
                    setBrandFilter('All');
                    setSearchTerm('');
                    setStockFilter('all');
                    setVatFilter('all');
                  }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-transparent hover:border-slate-100 relative"
                >
                  {/* Edit/Delete — ซ่อนสำหรับ All Products */}
                  {cat.id !== 'all_products' && (
                    <div className="absolute top-3 left-3 z-30 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={(e) => handleEditCategory(cat, e)}
                        className="p-1.5 rounded-full bg-white/80 backdrop-blur text-slate-400 hover:bg-blue-50 hover:text-blue-500 shadow-sm cursor-pointer"
                        title="แก้ไข Category"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteCategory(cat.id, e)}
                        className="p-1.5 rounded-full bg-white/80 backdrop-blur text-slate-400 hover:bg-red-50 hover:text-red-500 shadow-sm cursor-pointer"
                        title="ลบ Category นี้"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}

                  <div className="relative h-32 overflow-hidden bg-slate-100">
                    <img src={cat.image} alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute top-4 right-4 z-20">
                      <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm ${itemCount === 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                        {itemCount} Items
                      </span>
                    </div>
                  </div>

                  <div className="p-5 bg-white">
                    <div className="w-8 h-[2px] bg-primary mb-3 group-hover:w-12 transition-all duration-500"></div>
                    <h3 className="text-base font-display font-bold text-slate-900 mb-0.5">{cat.name}</h3>
                    <p className="text-xs font-body text-slate-700 font-medium">{cat.thai}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ===== VIEW 2: PRODUCT LIST ===== */}
        {currentView === 'products' && (
          <div>
            {/* Brand Filter */}
            <div className="flex gap-2 mt-1 pt-3 mb-3 overflow-x-auto pb-2 scrollbar-hide items-center">
              <div
                onClick={() => setBrandFilter('All')}
                className={`flex-shrink-0 flex items-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer select-none
                  ${brandFilter === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                All
              </div>
              {brands.map(brand => (
                <div
                  key={brand.id}
                  onMouseEnter={() => setHoveredBrand(brand.id)}
                  onMouseLeave={() => setHoveredBrand(null)}
                  className={`relative flex-shrink-0 transition-all duration-200 ${hoveredBrand === brand.id ? 'mr-2' : ''}`}
                >
                  <div
                    onClick={() => setBrandFilter(brand.name)}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer select-none
                      ${brandFilter === brand.name ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-blue-50'}`}
                  >
                    {brand.name}
                  </div>
                  <button
                    onClick={(e) => handleDeleteBrand(brand, e)}
                    className={`absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all duration-150 cursor-pointer
                      ${hoveredBrand === brand.id ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'}`}
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => { setNewBrandName(''); setIsBrandModalOpen(true); }}
                className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all whitespace-nowrap cursor-pointer"
              >
                <Plus size={14} /> Add Brand
              </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
              <SoftCard
                title="Green Stock"
                value={summaryData.greenStock.toString()}
                subLabel="ปกติ (พร้อมขาย)"
                icon={CheckCircle}
                iconColor="text-emerald-600"
                iconBg="bg-emerald-50"
              />
              <SoftCard
                title="Red Stock"
                value={summaryData.redStock.toString()}
                subLabel="สต็อกต่ำ (ควรเติม)"
                icon={AlertCircle}
                iconColor="text-rose-600"
                iconBg="bg-rose-50"
              />
              <SoftCard
                title="VAT Only"
                value={summaryData.vatCount.toString()}
                subLabel="สินค้ามี VAT"
                icon={Tag}
                iconColor="text-purple-600"
                iconBg="bg-purple-50"
              />
              <SoftCard
                title="No VAT"
                value={summaryData.noVatCount.toString()}
                subLabel="สินค้าไม่มี VAT"
                icon={Tag}
                iconColor="text-slate-600"
                iconBg="bg-slate-50"
              />
            </div>

            {/* Search & Filters */}
            <div className="bg-white p-3 rounded-[2rem] border border-slate-100 shadow-sm mb-4 flex flex-col xl:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder={`Search in ${activeCategory}...`}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl outline-none transition-colors"
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-3 w-full xl:w-auto justify-center">
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button onClick={() => setStockFilter(stockFilter === 'normal' ? 'all' : 'normal')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${stockFilter === 'normal' ? 'bg-white text-emerald-600 shadow-sm border border-slate-100' : 'text-slate-600 hover:text-slate-800'}`}>
                    <CheckCircle size={14} /> Green Stock
                  </button>
                  <button onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${stockFilter === 'low' ? 'bg-white text-rose-500 shadow-sm border border-slate-100' : 'text-slate-600 hover:text-slate-800'}`}>
                    <AlertCircle size={14} /> Red Stock
                  </button>
                </div>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button onClick={() => setVatFilter(vatFilter === 'vat' ? 'all' : 'vat')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${vatFilter === 'vat' ? 'bg-white text-purple-600 shadow-sm border border-slate-100' : 'text-slate-600 hover:text-slate-800'}`}>
                    VAT Only
                  </button>
                  <button onClick={() => setVatFilter(vatFilter === 'novat' ? 'all' : 'novat')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${vatFilter === 'novat' ? 'bg-white text-slate-600 shadow-sm border border-slate-100' : 'text-slate-600 hover:text-slate-800'}`}>
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
                  {filteredProducts.length > 0 ? filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 font-bold text-slate-800 group-hover:text-blue-600">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-slate-500">{p.sku}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">฿{p.price.toLocaleString()}</span>
                          {p.hasVat
                            ? <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-600 text-[10px] font-bold border border-purple-200">VAT</span>
                            : <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] border border-slate-200">No VAT</span>
                          }
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={p.stock >= 5 ? 'emerald' : 'rose'} className="w-8 text-center inline-block">{p.stock}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <button onClick={() => handleEdit(p)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full cursor-pointer"><Edit3 size={18} /></button>
                        <button onClick={() => handleDelete(p.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full cursor-pointer"><Trash2 size={18} /></button>
                      </td>
                    </tr>
                  )) : (
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
                <button onClick={() => setIsModalOpen(false)} className="cursor-pointer"><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
              </div>
              <div className="p-8 space-y-6">
                <div>
                  <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Product Name (Include Brand)</Text>
                  <input type="text" placeholder="e.g. Samsung TV 55 Inch"
                    className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100"
                    value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">SKU</Text>
                    <input type="text" placeholder="SKU-001"
                      className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100"
                      value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })} />
                  </div>
                  <div>
                    <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Category</Text>
                    <select className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100"
                      value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}>
                      {categories.filter(c => c.id !== 'all_products').map(c =>
                        <option key={c.id} value={c.name}>{c.name}</option>
                      )}
                    </select>
                  </div>
                </div>
                <div>
                  <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Tax Type (VAT)</Text>
                  <div className="flex gap-4 p-1 bg-slate-50 rounded-xl border border-slate-200">
                    <button onClick={() => setNewProduct({ ...newProduct, hasVat: false })}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${!newProduct.hasVat ? 'bg-white shadow-sm text-slate-800 border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}>
                      No VAT (ราคาปกติ)
                    </button>
                    <button onClick={() => setNewProduct({ ...newProduct, hasVat: true })}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${newProduct.hasVat ? 'bg-purple-500 shadow-md text-white' : 'text-slate-400 hover:text-slate-600'}`}>
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
                <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 hover:bg-slate-200 rounded-xl font-bold cursor-pointer">Cancel</button>
                <button onClick={handleSaveProduct} className="px-8 py-3 bg-[#1e293b] hover:bg-slate-800 text-white rounded-xl shadow-lg font-bold cursor-pointer">Save Product</button>
              </div>
            </div>
          </div>
        )}

        {/* ===== MODAL: ADD / EDIT CATEGORY ===== */}
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setIsCatModalOpen(false); setEditingCatId(null); }}></div>
            <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-slate-100">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1e293b] flex items-center justify-center">
                    <Tag size={16} className="text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-slate-800">
                    {editingCatId ? 'Edit Category' : 'Add Category'}
                  </h3>
                </div>
                <button onClick={() => { setIsCatModalOpen(false); setEditingCatId(null); }} className="cursor-pointer">
                  <X size={24} className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <div className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Category Name <span className="text-slate-400">(English)</span>
                  </label>
                  <input type="text" placeholder="e.g. Air Conditioner"
                    className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                    value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">ชื่อภาษาไทย</label>
                  <input type="text" placeholder="เช่น เครื่องปรับอากาศ"
                    className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                    value={newCat.thai} onChange={e => setNewCat({ ...newCat, thai: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Image URL <span className="text-slate-400">(optional)</span>
                  </label>
                  <input type="text" placeholder="https://..."
                    className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                    value={newCat.image} onChange={e => setNewCat({ ...newCat, image: e.target.value })} />
                  <p className="text-xs text-slate-400 mt-1.5">หากไม่กรอก จะใช้รูป default</p>
                </div>
                {newCat.image && (
                  <div className="rounded-xl overflow-hidden h-24 border border-slate-100">
                    <img src={newCat.image} alt="preview" className="w-full h-full object-cover"
                      onError={e => e.target.style.display = 'none'} />
                  </div>
                )}
              </div>
              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => { setIsCatModalOpen(false); setEditingCatId(null); }}
                  className="px-6 py-2.5 text-slate-500 hover:bg-slate-200 rounded-xl font-semibold transition-all cursor-pointer">
                  Cancel
                </button>
                <button onClick={handleSaveCategory}
                  className="px-8 py-2.5 bg-[#1e293b] hover:bg-slate-700 text-white rounded-xl shadow font-semibold transition-all active:scale-95 cursor-pointer">
                  {editingCatId ? 'Save Changes' : 'Add Category'}
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
                <button onClick={() => setIsBrandModalOpen(false)} className="cursor-pointer">
                  <X size={22} className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>
              <div className="p-8">
                <label className="block text-sm font-medium text-slate-700 mb-2">Brand Name</label>
                <input type="text" placeholder="e.g. Sony"
                  className="w-full p-3 border rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 ring-blue-100 transition-all"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddBrand()}
                  autoFocus />
                <p className="text-xs text-slate-400 mt-2">กด Enter หรือปุ่ม Add Brand เพื่อเพิ่ม</p>
              </div>
              <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsBrandModalOpen(false)} className="px-5 py-2.5 text-slate-500 hover:bg-slate-200 rounded-xl font-semibold transition-all cursor-pointer">Cancel</button>
                <button onClick={handleAddBrand} className="px-7 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow font-semibold transition-all active:scale-95 cursor-pointer">Add Brand</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// Reusable Soft Card Component (Same as Reports)
const SoftCard = ({ title, value, subLabel, icon: Icon, iconColor, iconBg, subLabelColor = "text-slate-500" }) => {
  return (
    <div className="relative bg-white rounded-[2rem] p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 h-28 flex flex-col justify-between transition-all duration-500 ease-out hover:-translate-y-1 hover:shadow-lg cursor-pointer">
      <div className="absolute top-0 right-0 p-4">
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor} shadow-sm`}>
          <Icon size={18} />
        </div>
      </div>

      <div>
        <Text as="h3" className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-1">{title}</Text>
        <Text className="text-xl font-bold text-slate-800 tracking-tight truncate pr-10">{value}</Text>
      </div>

      <Text className={`text-[10px] font-bold ${subLabelColor}`}>
        {subLabel}
      </Text>
    </div>
  );
};

export default Inventory;

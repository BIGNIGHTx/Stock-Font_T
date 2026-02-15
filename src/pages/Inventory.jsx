import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Search, Plus, Edit3, Trash2, X, CheckCircle, AlertCircle,
  ArrowLeft, Tv, Wind, Thermometer, Layers
} from 'lucide-react';
import { Badge } from '../components/badge';
import { Text } from '../components/text';
import { useAlert } from '../contexts/AlertContext';

// --- Const: หมวดหมู่และแบรนด์ ---
const CATEGORIES = [
  { id: 'Tv', label: 'TV / โทรทัศน์', icon: <Tv size={32} />, color: 'bg-blue-500' },
  { id: 'Fan', label: 'Fan / พัดลม', icon: <Wind size={32} />, color: 'bg-teal-500' },
  { id: 'Refrigerator', label: 'Refrigerator / ตู้เย็น', icon: <Thermometer size={32} />, color: 'bg-orange-500' },
  { id: 'Washing Machine', label: 'Washing Machine / เครื่องซักผ้า', icon: <Layers size={32} />, color: 'bg-indigo-500' },
];

const BRANDS = ['All', 'Samsung', 'LG', 'Mitsubishi', 'Sharp', 'Hitachi', 'Panasonic'];

const Inventory = ({ initialOpenModal = false }) => {
  const { alert, confirm } = useAlert();

  // --- View State ---
  const [currentView, setCurrentView] = useState('categories');
  const [activeCategory, setActiveCategory] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Filters ---
  const [stockFilter, setStockFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('All');
  const [vatFilter, setVatFilter] = useState('all'); // 'all', 'vat', 'novat'

  // --- Form State ---
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: 'Tv', price: '', cost_price: '', stock: '', hasVat: false
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (initialOpenModal) setIsModalOpen(true);
  }, [initialOpenModal]);

  // --- 1. Fetch Data ---
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/products/');

      // *** แก้ไขจุดที่ 1: Mapping ข้อมูลขาเข้า ***
      // เช็คทั้ง has_vat (backend format) และ hasVat เผื่อไว้
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
      // *** แก้ไขจุดที่ 2: Mapping ข้อมูลขาออก (Payload) ***
      const payload = {
        name,
        sku,
        category,
        price: parseFloat(price),
        cost_price: parseFloat(cost_price),
        stock: parseInt(stock),
        // ส่งไปทั้งสองชื่อ เพื่อความชัวร์ว่า Backend จะรับได้สักชื่อ
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
      fetchProducts(); // ดึงข้อมูลใหม่ทันทีเพื่อให้ตารางอัปเดต
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
    // *** แก้ไขจุดที่ 3: โหลดข้อมูลเข้าฟอร์มแก้ไข ***
    setNewProduct({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      cost_price: product.cost_price,
      stock: product.stock,
      hasVat: product.hasVat // ใช้ค่าที่ map มาแล้วจาก fetchProducts
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

  // --- 3. Filter Logic ---
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
    <div className="min-h-screen bg-[#F3F5F9] font-sans p-6 md:p-10 text-slate-700 animate-fade-in pb-20">

      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          {currentView === 'products' && (
            <button
              onClick={() => setCurrentView('categories')}
              className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-all text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <Text as="h2" className="text-3xl font-bold text-slate-900">
              {currentView === 'categories' ? 'Innovation Stock' : `${activeCategory} Stock`}
            </Text>
            <Text className="text-slate-500 text-sm mt-1">
              {currentView === 'categories' ? 'Select a category to manage' : 'Manage your inventory'}
            </Text>
          </div>
        </div>

        {currentView === 'products' && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center px-6 py-3 bg-[#1e293b] text-white rounded-xl font-semibold shadow-lg shadow-slate-300 hover:bg-slate-800 transition-all transform active:scale-95"
          >
            <Plus size={18} className="mr-2" /> <Text as="span">Add Product</Text>
          </button>
        )}
      </div>

      {/* --- VIEW 1: CATEGORY DASHBOARD --- */}
      {currentView === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group flex flex-col items-center text-center gap-4"
            >
              <div className={`w-20 h-20 rounded-full ${cat.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <div>
                <Text as="h3" className="text-xl font-bold text-slate-800">{cat.label}</Text>
                <Text className="text-slate-400 text-sm mt-1">
                  {products.filter(p => p.category === cat.id).length} Items
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- VIEW 2: PRODUCT LIST --- */}
      {currentView === 'products' && (
        <div className="animate-slide-up">

          {/* Brand Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {BRANDS.map(brand => (
              <button
                key={brand}
                onClick={() => setBrandFilter(brand)}
                className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border
                        ${brandFilter === brand
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50'}`}
              >
                {brand}
              </button>
            ))}
          </div>

          {/* Search, Stock & VAT Filters */}
          <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm mb-6 flex flex-col xl:flex-row gap-4 items-center">
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

          {/* Table */}
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 overflow-hidden">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Price / Tax</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-bold text-slate-800 group-hover:text-blue-600">{p.name}</td>
                      <td className="px-6 py-4 font-mono text-slate-500">{p.sku}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">฿{p.price.toLocaleString()}</span>
                          {/* --- VAT BADGE (ใน Table) --- */}
                          {p.hasVat === true ? (
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-600 text-[10px] font-bold border border-purple-200">
                              VAT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[10px] border border-slate-200">
                              No VAT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={p.stock >= 5 ? 'emerald' : 'rose'} className="w-8 text-center inline-block">{p.stock}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
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

      {/* Modal Add/Edit Product */}
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
                    value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} >
                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                  </select>
                </div>
              </div>

              {/* --- VAT Selector (ใน Modal) --- */}
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
    </div>
  );
};

export default Inventory;
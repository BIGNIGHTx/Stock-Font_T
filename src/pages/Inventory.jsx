import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Filter, Edit3, Trash2, X, UploadCloud, Image as ImageIcon } from 'lucide-react';
import { Badge } from '../components/badge';
import { Text } from '../components/text';

const Inventory = ({ initialOpenModal = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับฟอร์มเพิ่มสินค้า
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: 'Electronics', price: '', cost_price: '', stock: ''
  });
  const [editingId, setEditingId] = useState(null); // Track which product is being edited

  // --- 0. Auto Open Modal (from Dashboard) ---
  useEffect(() => {
    if (initialOpenModal) {
      setIsModalOpen(true);
    }
  }, [initialOpenModal]);

  // --- 1. ดึงข้อมูลจาก Backend เมื่อเข้าหน้านี้ ---
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/products/');
      setProducts(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // --- 2. ฟังก์ชันบันทึกสินค้าลง Database (Add / Edit) ---
  const handleSaveProduct = async () => {
    // --- Validation ---
    const { name, sku, category, price, cost_price, stock } = newProduct;
    if (!name || !sku || !category || price === '' || cost_price === '' || stock === '') {
      alert('กรุณากรอกข้อมูลให้ครบทุกช่อง');
      return;
    }
    if (isNaN(price) || isNaN(cost_price) || isNaN(stock) || parseFloat(price) <= 0 || parseFloat(cost_price) <= 0 || parseInt(stock) < 0) {
      alert('ราคาขาย/ต้นทุนต้องเป็นตัวเลขบวก และ stock ต้องไม่ติดลบ');
      return;
    }
    try {
      const payload = {
        name,
        sku,
        category,
        price: parseFloat(price),
        cost_price: parseFloat(cost_price),
        stock: parseInt(stock)
      };

      if (editingId) {
        // Update existing product
        await axios.put(`http://127.0.0.1:8000/products/${editingId}`, payload);
        alert("อัปเดตสินค้าเรียบร้อย!");
      } else {
        // Create new product
        await axios.post('http://127.0.0.1:8000/products/', payload);
        alert("บันทึกสินค้าเรียบร้อย!");
      }

      setIsModalOpen(false);
      fetchProducts();
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      alert(`เกิดข้อผิดพลาด: ${error.response?.data?.detail || error.message}`);
    }
  };

  const resetForm = () => {
    setNewProduct({ name: '', sku: '', category: 'Electronics', price: '', cost_price: '', stock: '' });
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
      stock: product.stock
    });
    setIsModalOpen(true);
  };

  // --- 3. ฟังก์ชันลบสินค้า ---
  const handleDelete = async (id) => {
    if (confirm("ต้องการลบสินค้านี้ใช่หรือไม่?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/products/${id}`);
        fetchProducts(); // ดึงข้อมูลใหม่หลังลบ
      } catch (error) {
        console.error("Error deleting:", error);
      }
    }
  };

  // กรองสินค้า (Search Logic)
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F3F5F9] font-sans p-6 md:p-10 text-slate-700 animate-fade-in pb-20">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Text as="h2" className="text-3xl font-bold text-slate-900">Product Stock</Text>
          <Text className="text-slate-500 text-sm mt-1">Manage your inventory from SQLite Database.</Text>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-6 py-3 bg-[#1e293b] text-white rounded-xl font-semibold shadow-lg shadow-slate-300 hover:bg-slate-800 transition-all transform active:scale-95 cursor-pointer"
        >
          <Plus size={18} className="mr-2" /> <Text as="span">Add New Product</Text>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-200 rounded-xl outline-none text-slate-700 placeholder-slate-400 transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2.5rem] p-8 shadow-[0_2px_40px_-10px_rgba(0,0,0,0.04)] border border-slate-100 overflow-hidden flex-1">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400"><Text>Loading data from backend...</Text></div>
        ) : (
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4"><Text as="span">Product Name</Text></th>
                <th className="px-6 py-4"><Text as="span">SKU</Text></th>
                <th className="px-6 py-4"><Text as="span">Category</Text></th>
                <th className="px-6 py-4"><Text as="span">Price</Text></th>
                <th className="px-6 py-4"><Text as="span">Stock</Text></th>
                <th className="px-6 py-4 text-right"><Text as="span">Actions</Text></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer group">
                  <td className="px-6 py-4 font-bold text-slate-800 group-hover:text-blue-600 transition-colors"><Text as="span">{product.name}</Text></td>
                  <td className="px-6 py-4 text-slate-500 font-mono"><Text as="span">{product.sku}</Text></td>
                  <td className="px-6 py-4">
                    <Badge variant={product.category === 'Electronics' ? 'blue' : 'slate'}>
                      {product.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-700 font-bold"><Text as="span">฿{product.price.toLocaleString()}</Text></td>
                  <td className="px-6 py-4">
                    <Badge variant={product.stock >= 5 ? 'emerald' : 'rose'} className="w-8 text-right inline-block rounded-lg">
                      {product.stock}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(product)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all duration-200 hover:scale-110 cursor-pointer">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up border border-slate-100">
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
              <Text as="h3" className="font-bold text-xl text-slate-800">{editingId ? 'Edit Product' : 'Add New Product'}</Text>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                <X size={24} className="text-slate-400 hover:text-slate-600" />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Product Name</Text>
                <input
                  type="text" placeholder="e.g. iPhone 15 Pro"
                  className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                  value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">SKU</Text>
                  <input
                    type="text" placeholder="SKU-001"
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                    value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                  />
                </div>
                <div>
                  <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Category</Text>
                  <select
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all cursor-pointer appearance-none"
                    value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                  >
                    <option>Electronics</option>
                    <option>Home Appliance</option>
                    <option>Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Price</Text>
                  <input
                    type="number" placeholder="0.00"
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                    value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                  />
                </div>
                <div>
                  <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Cost</Text>
                  <input
                    type="number" placeholder="0.00"
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                    value={newProduct.cost_price} onChange={e => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                  />
                </div>
                <div>
                  <Text as="label" className="block text-sm font-medium text-slate-700 mb-2">Stock</Text>
                  <input
                    type="number" placeholder="0"
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:bg-white outline-none transition-all"
                    value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-slate-500 hover:bg-slate-200 rounded-xl transition-colors font-bold cursor-pointer"><Text as="span">Cancel</Text></button>
              <button onClick={handleSaveProduct} className="px-8 py-3 bg-[#1e293b] hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-300 transition-all transform hover:-translate-y-1 font-bold cursor-pointer"><Text as="span">Save Product</Text></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

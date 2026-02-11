import React, { useState, useEffect } from 'react';
import axios from 'axios'; // พระเอกของเรา
import { Search, Plus, Filter, Edit3, Trash2, X, UploadCloud, Image as ImageIcon } from 'lucide-react';

const Inventory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]); // เริ่มต้นเป็นอาเรย์ว่าง (รอรับข้อมูล)
  const [isLoading, setIsLoading] = useState(true);

  // State สำหรับฟอร์มเพิ่มสินค้า
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', category: 'Electronics', price: '', cost_price: '', stock: ''
  });
  const [editingId, setEditingId] = useState(null); // Track which product is being edited

  // --- 1. ดึงข้อมูลจาก Backend เมื่อเข้าหน้านี้ ---
  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/products/');
      setProducts(response.data); // เอาข้อมูลจริงใส่ตาราง
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
    <div className="p-8 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Product Stock (Live DB)</h2>
          <p className="text-slate-500 text-sm">Manage your inventory from SQLite Database.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Add New Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:bg-white focus:border-blue-300 rounded-lg outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading data from backend...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Product Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Stock</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{product.name}</td>
                  <td className="px-6 py-4 text-slate-500">{product.sku}</td>
                  <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{product.category}</span></td>
                  <td className="px-6 py-4">฿{product.price.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleEdit(product)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => handleDelete(product.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
                      <Trash2 size={16} />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <div className="p-6 space-y-4">
              <input
                type="text" placeholder="Product Name" className="w-full p-2 border rounded"
                value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text" placeholder="SKU" className="w-full p-2 border rounded"
                  value={newProduct.sku} onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
                />
                <select
                  className="w-full p-2 border rounded bg-white"
                  value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })}
                >
                  <option>Electronics</option>
                  <option>Home Appliance</option>
                  <option>Accessories</option>
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="number" placeholder="Price (ขาย)" className="w-full p-2 border rounded"
                  value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                />
                <input
                  type="number" placeholder="Cost Price (ต้นทุน)" className="w-full p-2 border rounded"
                  value={newProduct.cost_price} onChange={e => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                />
                <input
                  type="number" placeholder="Stock" className="w-full p-2 border rounded"
                  value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-2">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600">Cancel</button>
              <button onClick={handleSaveProduct} className="px-6 py-2 bg-blue-600 text-white rounded shadow">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;

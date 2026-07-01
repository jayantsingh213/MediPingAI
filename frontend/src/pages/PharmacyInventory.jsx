import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Check, 
  AlertCircle,
  FileText
} from 'lucide-react';

const PharmacyInventory = () => {
  const { pharmacy } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form Modal States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(0.0);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchInventory = async () => {
    if (!pharmacy) return;
    try {
      const response = await fetch(`http://localhost:5000/api/pharmacy/${pharmacy._id}/inventory`);
      const data = await response.json();
      if (data.success) {
        setInventory(data.inventory);
      }
    } catch (err) {
      console.log('API fetch failed, loading fallback local inventory data');
      setInventory([
        { _id: 'i1', name: 'Paracetamol 650mg', description: 'Pain relief and fever reducer.', quantity: 120, price: 15.0, updatedAt: new Date() },
        { _id: 'i2', name: 'Ibuprofen 400mg', description: 'NSAID pain reliever.', quantity: 50, price: 35.0, updatedAt: new Date() },
        { _id: 'i3', name: 'Amoxicillin 500mg', description: 'Penicillin-class antibiotic.', quantity: 15, price: 120.0, updatedAt: new Date() },
        { _id: 'i4', name: 'Metformin 500mg', description: 'Oral diabetes controller.', quantity: 300, price: 45.0, updatedAt: new Date() },
        { _id: 'i5', name: 'Cetirizine 10mg', description: 'Non-drowsy allergy relief.', quantity: 80, price: 10.0, updatedAt: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [pharmacy]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setQuantity(10);
    setPrice(10.0);
    setActionError('');
    setActionSuccess('');
    setShowModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description);
    setQuantity(item.quantity);
    setPrice(item.price);
    setActionError('');
    setActionSuccess('');
    setShowModal(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!name.trim() || quantity < 0 || price < 0) {
      setActionError('Please enter valid fields');
      return;
    }

    const payload = { name, quantity: Number(quantity), price: Number(price), description };

    try {
      const response = await fetch(`http://localhost:5000/api/pharmacy/${pharmacy._id}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      
      if (data.success) {
        setActionSuccess('Inventory updated successfully!');
        fetchInventory(); // Reload
        setTimeout(() => setShowModal(false), 1000);
      } else {
        setActionError(data.message || 'Update failed');
      }
    } catch (err) {
      console.log('Update API failed, updating local in-memory fallback state');
      if (editingItem) {
        // Edit fallback
        setInventory(prev => prev.map(item => item._id === editingItem._id ? { ...item, ...payload } : item));
      } else {
        // Add fallback
        const newItem = { _id: 'i_' + Math.random().toString(36).substr(2, 9), ...payload, updatedAt: new Date() };
        setInventory(prev => [...prev, newItem]);
      }
      setActionSuccess('Local state updated successfully!');
      setTimeout(() => setShowModal(false), 1000);
    }
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.name} from inventory?`)) return;

    try {
      const response = await fetch(`http://localhost:5000/api/pharmacy/inventory/${item._id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (data.success) {
        fetchInventory(); // Reload
      }
    } catch (err) {
      console.log('Delete API failed, removing from local state fallback');
      setInventory(prev => prev.filter(i => i._id !== item._id));
    }
  };

  // Search Filter
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 pl-64 min-h-screen bg-slate-50 text-left">
      <Sidebar role="pharmacy" />
      
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Header Title */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display">
              Medicine Inventory
            </h1>
            <p className="text-slate-500 text-sm">Add, remove, search, and update stock quantity details.</p>
          </div>
          
          <button 
            onClick={handleOpenAddModal}
            className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-md shadow-primary/10 flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>Add Medication</span>
          </button>
        </div>

        {/* Search Bar Card */}
        <div className="premium-card bg-white p-5 border border-slate-200/50 mb-8 flex items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search catalogued medicines (e.g. Paracetamol)..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary/50 transition-all font-sans"
            />
          </div>
          <span className="text-xs font-semibold text-slate-400">{filteredInventory.length} Items Listed</span>
        </div>

        {/* Inventory Table Container */}
        <div className="premium-card bg-white border border-slate-200/50 overflow-hidden">
          {loading ? (
            <div className="py-12 text-center text-slate-400">Loading catalog items...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="py-16 text-center">
              <Package size={28} className="text-slate-300 mx-auto mb-2" />
              <p className="text-slate-500 text-sm font-semibold">No medicines found.</p>
              <p className="text-xs text-slate-400 mt-1">Create an entry or refine your search filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/55 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="px-6 py-4">Medicine Name</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4 text-center">Stock Level</th>
                    <th className="px-6 py-4 text-right">Unit Price</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800 font-display">{item.name}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-[240px] truncate">{item.description || 'No description provided.'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${item.quantity > 50 ? 'bg-success/15 text-success' : item.quantity > 0 ? 'bg-warning/15 text-warning' : 'bg-red-50 text-red-500'}`}>
                          {item.quantity} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-slate-800">${Number(item.price).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Item"
                          >
                            <Edit size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <h3 className="font-bold text-slate-800 text-lg font-display mb-2">
              {editingItem ? 'Edit Medication Stock' : 'Add New Medication'}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Fill in description, quantities, and pricing to populate the lookup inventory system.
            </p>

            {actionError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl font-medium">
                ⚠️ {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="mb-4 p-3 bg-success/15 border border-success/30 text-success text-xs rounded-xl font-medium flex items-center space-x-1.5">
                <Check size={14} />
                <span>{actionSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveItem} className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Medication Name & Strength</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Paracetamol 650mg"
                  disabled={!!editingItem} // Cannot rename existing item for simplicity
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 disabled:bg-slate-100 disabled:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Short Description</label>
                <textarea 
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Usage instructions, caution details, storage conditions"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Available Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Unit Price ($ per strip)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PharmacyInventory;

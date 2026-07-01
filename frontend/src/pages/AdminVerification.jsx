import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Building2, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Search,
  Filter,
  Ban,
  UserCheck
} from 'lucide-react';

const AdminVerification = () => {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'suspended'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  const fetchPharmacies = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pharmacies');
      const data = await res.json();
      if (data.success) {
        setPharmacies(data.pharmacies);
      }
    } catch (err) {
      console.log('API failed, fallback to local dataset');
      setPharmacies([
        { _id: 'p1', name: 'Apollo Pharmacy', ownerName: 'Alex Miller', email: 'pharmacy@mediping.ai', phone: '+1 555-0188', address: '122 Medical Square, Sector 4', status: 'approved', rating: 4.8 },
        { _id: 'p2', name: 'LifeCare Pharmacy', ownerName: 'Robert Chen', email: 'lifecare@mediping.ai', phone: '+1 555-0211', address: '45 Health Avenue, Block C', status: 'approved', rating: 4.5 },
        { _id: 'p3', name: 'Gupta Medical Store', ownerName: 'Sanjay Gupta', email: 'guptamedical@mediping.ai', phone: '+1 555-0322', address: '89 Bazaar Street, Cross Road', status: 'approved', rating: 4.2 },
        { _id: 'p4', name: 'Wellness First Pharmacy', ownerName: 'Maria Rodriguez', email: 'wellness@mediping.ai', phone: '+1 555-0433', address: '15 High Street, Metro Plaza', status: 'approved', rating: 4.9 },
        { _id: 'p5', name: 'Care & Cure Chemist', ownerName: 'John Watson', email: 'carecure@mediping.ai', phone: '+1 555-0544', address: '67 Hospital Road, Opp. City General', status: 'approved', rating: 4.0 },
        { _id: 'p6', name: 'City Medicos', ownerName: 'James Dean', email: 'citymedicos@mediping.ai', phone: '+1 555-0655', address: '10 Metro Ring Road', status: 'pending', rating: 3.8 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacies();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/pharmacies/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`Pharmacy marked as ${status}!`);
        fetchPharmacies(); // Refresh
        setTimeout(() => setActionMessage(''), 2000);
      }
    } catch (err) {
      console.log('Status update failed, updating local state bypass');
      setPharmacies(prev => 
        prev.map(p => p._id === id ? { ...p, status } : p)
      );
      setActionMessage(`Pharmacy marked as ${status}! (Local bypass)`);
      setTimeout(() => setActionMessage(''), 2000);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'approved') return 'bg-success/10 text-success border border-success/20';
    if (status === 'suspended') return 'bg-red-50 text-red-500 border border-red-100';
    return 'bg-warning/10 text-warning border border-warning/20';
  };

  // Filter & Search logic
  const filtered = pharmacies.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 pl-64 min-h-screen bg-slate-50 text-left">
      <Sidebar role="admin" />
      
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display">
            Pharmacy Verification Directory
          </h1>
          <p className="text-slate-500 text-sm">Review credentials, grant approvals, and manage system suspensions.</p>
        </div>

        {actionMessage && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl font-bold text-sm">
            ℹ️ {actionMessage}
          </div>
        )}

        {/* Filters and Search box */}
        <div className="premium-card bg-white p-5 border border-slate-200/50 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search size={16} className="absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by store name or owner..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-primary/50 transition-all font-sans"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter size={15} className="text-slate-400 hidden sm:inline" />
            <div className="flex border border-slate-200 rounded-xl p-1 bg-slate-50 w-full sm:w-auto">
              {['all', 'pending', 'approved', 'suspended'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filterStatus === status ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Queue Grids */}
        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading directory...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200/50">
            <Building2 size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm font-semibold">No pharmacy stores matches criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Refine your search term or select another filter tab.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((pharm) => (
              <div 
                key={pharm._id} 
                className="premium-card bg-white p-6 border border-slate-200/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-slate-800 text-base font-display">{pharm.name}</h4>
                      <span className="text-[10px] text-slate-400">Owner: {pharm.ownerName}</span>
                    </div>
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full capitalize ${getStatusBadge(pharm.status)}`}>
                      {pharm.status}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600 mb-6 pt-4 border-t border-slate-100">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Email</span>
                      <span className="font-medium text-slate-700">{pharm.email}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Contact Phone</span>
                      <span className="font-medium text-slate-700">{pharm.phone}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Street Address</span>
                      <span className="font-medium text-slate-700">{pharm.address}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-slate-100/60">
                  {pharm.status !== 'approved' && (
                    <button 
                      onClick={() => handleUpdateStatus(pharm._id, 'approved')}
                      className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <UserCheck size={13} />
                      <span>Approve Partner</span>
                    </button>
                  )}
                  {pharm.status === 'approved' && (
                    <button 
                      onClick={() => handleUpdateStatus(pharm._id, 'suspended')}
                      className="flex-1 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200/50 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                    >
                      <Ban size={13} />
                      <span>Suspend Store</span>
                    </button>
                  )}
                  {pharm.status === 'suspended' && (
                    <button 
                      onClick={() => handleUpdateStatus(pharm._id, 'approved')}
                      className="flex-1 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
                    >
                      <UserCheck size={13} />
                      <span>Re-Approve</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminVerification;

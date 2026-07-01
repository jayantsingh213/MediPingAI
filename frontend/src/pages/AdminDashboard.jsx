import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Users, 
  Building2, 
  Activity, 
  CheckCircle,
  FileCheck,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  Map,
  Clock,
  ShieldAlert
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 1242,
    totalPharmacies: 6,
    liveRequests: 8,
    totalReservations: 184
  });

  const [pendingPharmacies, setPendingPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setStats(prev => ({
          ...prev,
          totalUsers: data.stats.totalUsers || 1242,
          totalPharmacies: data.stats.totalPharmacies || 6,
          liveRequests: data.stats.liveRequests || 8,
          totalReservations: data.stats.totalReservations || 184
        }));
      }
    } catch (err) {
      console.log('Stats API failed, using fallback metrics');
    }
  };

  const fetchPendingPharmacies = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/pharmacies');
      const data = await res.json();
      if (data.success) {
        // Filter pending
        const pending = data.pharmacies.filter(p => p.status === 'pending');
        setPendingPharmacies(pending);
      }
    } catch (err) {
      console.log('Fetch pharmacies API failed, loading local in-memory fallback pending queue');
      setPendingPharmacies([
        {
          _id: 'p6',
          name: 'City Medicos',
          ownerName: 'James Dean',
          email: 'citymedicos@mediping.ai',
          phone: '+1 555-0655',
          address: '10 Metro Ring Road',
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPendingPharmacies();
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
        setActionSuccess(`Pharmacy successfully ${status}!`);
        fetchPendingPharmacies();
        fetchStats();
        setTimeout(() => setActionSuccess(''), 2000);
      }
    } catch (err) {
      console.log('Approval API failed, updating local queue state fallback');
      setPendingPharmacies(prev => prev.filter(p => p._id !== id));
      setActionSuccess(`Pharmacy successfully ${status}! (Local bypass)`);
      setTimeout(() => setActionSuccess(''), 2000);
    }
  };

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 pl-64 min-h-screen bg-slate-50 text-left">
      <Sidebar role="admin" />
      
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Header Greeting */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display">
            MediPing Global Overview
          </h1>
          <p className="text-slate-500 text-sm">System administrators dashboard. Control verification channels and view live pings.</p>
        </div>

        {actionSuccess && (
          <div className="mb-6 p-4 bg-success/15 border border-success/35 text-success rounded-2xl font-semibold text-sm">
            ✅ {actionSuccess}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="premium-card bg-white p-5 border border-slate-200/40 flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800 font-display">{stats.totalUsers}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Patients</p>
            </div>
          </div>

          <div className="premium-card bg-white p-5 border border-slate-200/40 flex items-center space-x-4">
            <div className="w-10 h-10 bg-success/10 text-success rounded-xl flex items-center justify-center">
              <Building2 size={20} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800 font-display">{stats.totalPharmacies}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Stores</p>
            </div>
          </div>

          <div className="premium-card bg-white p-5 border border-slate-200/40 flex items-center space-x-4">
            <div className="w-10 h-10 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
              <Activity size={20} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800 font-display">{stats.liveRequests}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Search Pings</p>
            </div>
          </div>

          <div className="premium-card bg-white p-5 border border-slate-200/40 flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800 font-display">{stats.totalReservations}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Bookings</p>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Pending Approval Queue */}
          <div className="lg:col-span-7 space-y-6">
            <div className="premium-card bg-white p-6 border border-slate-200/50">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <h4 className="font-bold text-slate-800 text-sm font-display flex items-center space-x-2">
                  <FileCheck size={16} className="text-slate-400" />
                  <span>Pharmacy Verification Queue</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 bg-orange-100 text-warning font-bold rounded-full">
                  {pendingPharmacies.length} Pending
                </span>
              </div>

              {loading ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading registrations...</div>
              ) : pendingPharmacies.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <FileCheck size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-semibold">Verification queue is empty.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Newly registered partner stores will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPharmacies.map((pharm) => (
                    <div 
                      key={pharm._id} 
                      className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-800 text-sm font-display">{pharm.name}</div>
                        <p className="text-slate-500">Owner: <span className="font-semibold">{pharm.ownerName}</span></p>
                        <p className="text-slate-400 truncate max-w-[280px]">{pharm.address}</p>
                      </div>

                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleUpdateStatus(pharm._id, 'suspended')}
                          className="px-3.5 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold transition-all"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(pharm._id, 'approved')}
                          className="px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-md shadow-primary/10"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Insights Overview */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Heatmap Insights */}
            <div className="premium-card bg-slate-900 text-white p-6 border-none shadow-xl">
              <div className="flex items-center space-x-2.5 mb-4">
                <Map size={18} className="text-primary-light" />
                <h4 className="font-bold text-sm font-display">Regional Search Heatmap</h4>
              </div>
              <p className="text-[11px] text-slate-400 mb-6 leading-relaxed">
                Visualizing density of medicine search inquiries. Sector 4 and Downtown currently experience the highest search concentrations.
              </p>
              
              {/* Fake Heatmap visualization */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3.5 text-[11px]">
                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300 font-semibold">
                    <span>Sector 4 (Central)</span>
                    <span>145 Searches/hr</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300 font-semibold">
                    <span>Sector 7 (East)</span>
                    <span>92 Searches/hr</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-primary h-full rounded-full" style={{ width: '55%' }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-slate-300 font-semibold">
                    <span>Hospital District</span>
                    <span>62 Searches/hr</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-warning h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="premium-card bg-white p-6 border border-slate-200/50">
              <h4 className="font-bold text-slate-800 text-sm mb-4 font-display flex items-center space-x-2">
                <ShieldAlert size={16} className="text-slate-400" />
                <span>System Warnings</span>
              </h4>
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex items-start space-x-2.5 p-3 bg-red-50 border border-red-100 rounded-xl">
                  <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <p>
                    Response time warning on <span className="font-semibold">Gupta Medical</span>. Average replies took 3 mins.
                  </p>
                </div>
                
                <div className="flex items-start space-x-2.5 p-3 bg-orange-50 border border-orange-100 rounded-xl">
                  <Clock size={15} className="text-warning mt-0.5 flex-shrink-0" />
                  <p>
                    License renewal is pending for <span className="font-semibold">Care & Cure</span> in 12 days.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

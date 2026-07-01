import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Clock, 
  Calendar, 
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  Settings,
  ShieldCheck,
  Search
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    // Load recent searches
    const searches = localStorage.getItem('mediping_recent_searches');
    if (searches) {
      setRecentSearches(JSON.parse(searches));
    }

    if (!user) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reservations/user/${user._id}`);
        const data = await response.json();
        if (data.success) {
          setReservations(data.reservations);
        } else {
          throw new Error('History failed');
        }
      } catch (err) {
        console.log('API fetch failed, loading fallback local profile data.');
        setReservations([
          {
            _id: 'r_demo_1',
            medicineName: 'Paracetamol 650mg',
            quantity: 2,
            price: 18.0,
            status: 'pending',
            otp: '7892',
            pickupTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            pharmacyId: { name: 'LifeCare Pharmacy', address: '45 Health Avenue, Block C' }
          },
          {
            _id: 'r_demo_2',
            medicineName: 'Ibuprofen 400mg',
            quantity: 1,
            price: 35.0,
            status: 'picked_up',
            otp: '1243',
            pickupTime: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
            pharmacyId: { name: 'Apollo Pharmacy', address: '122 Medical Square, Sector 4' }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (isoStr) => {
    return new Date(isoStr).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusClass = (status) => {
    if (status === 'picked_up') return 'bg-success/10 text-success border border-success/20';
    if (status === 'cancelled') return 'bg-red-50 text-red-500 border border-red-100';
    return 'bg-warning/10 text-warning border border-warning/20';
  };

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left items-start">
          
          {/* Left Column: Account Details */}
          <div className="lg:col-span-4 space-y-6">
            {/* User Profile Card */}
            <div className="premium-card bg-white p-6 border border-slate-200/50">
              <div className="flex flex-col items-center text-center pb-6 border-b border-slate-100">
                <div className="w-16 h-16 bg-primary/10 text-primary border border-primary/20 rounded-full flex items-center justify-center font-black text-xl mb-4">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <h3 className="font-extrabold text-slate-800 text-lg font-display">{user?.name || 'Jane Doe'}</h3>
                <span className="text-[10px] font-bold px-2.5 py-0.5 bg-slate-100 text-slate-500 rounded-full border border-slate-200/30 uppercase tracking-widest mt-1">
                  {user?.role || 'Patient'}
                </span>
              </div>

              {/* Contact info list */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center space-x-3 text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <div className="truncate">
                    <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                    <span className="text-xs font-semibold text-slate-700">{user?.email || 'user@mediping.ai'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Phone Number</span>
                    <span className="text-xs font-semibold text-slate-700">{user?.phone || '+1 555-0199'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Registered Since</span>
                    <span className="text-xs font-semibold text-slate-700">June 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Searches summary */}
            <div className="premium-card bg-white p-6 border border-slate-200/50">
              <h4 className="font-bold text-slate-800 text-sm mb-4 font-display flex items-center space-x-2">
                <Search size={15} className="text-slate-400" />
                <span>Recent Searches</span>
              </h4>
              {recentSearches.length === 0 ? (
                <p className="text-xs text-slate-400">No searches recorded.</p>
              ) : (
                <div className="space-y-2">
                  {recentSearches.map((term, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-xs text-slate-700 font-medium">
                      <span>{term}</span>
                      <Link 
                        to="/search" 
                        state={{ medicineName: term }}
                        className="text-primary hover:text-primary-dark font-semibold flex items-center"
                      >
                        <span>Repeat</span>
                        <ChevronRight size={12} />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Bookings History */}
          <div className="lg:col-span-8 space-y-6">
            <div className="premium-card bg-white p-6 border border-slate-200/50">
              <h4 className="font-bold text-slate-800 text-base mb-6 font-display flex items-center space-x-2">
                <ShoppingBag size={18} className="text-slate-400" />
                <span>My Reservation History</span>
              </h4>

              {loading ? (
                <div className="py-8 text-center text-slate-400 text-sm">Loading bookings...</div>
              ) : reservations.length === 0 ? (
                <div className="py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <ShoppingBag size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-sm font-semibold">No reservations found.</p>
                  <p className="text-xs text-slate-400 mt-1">Medications you reserve will be catalogued here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.map((resv) => (
                    <div 
                      key={resv._id}
                      className="border border-slate-100 bg-slate-50/20 hover:bg-slate-50/50 hover:border-slate-200 p-5 rounded-2xl transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-slate-800 text-sm sm:text-base font-display">{resv.medicineName}</h5>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusClass(resv.status)}`}>
                            {resv.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">Pharmacy: <span className="font-semibold">{resv.pharmacyId?.name}</span></p>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-3">
                          <span>Qty: {resv.quantity}</span>
                          <span>•</span>
                          <span>Total: ${(resv.price * resv.quantity).toFixed(2)}</span>
                          <span>•</span>
                          <span>Booked: {formatDate(resv.createdAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 text-right">
                        {resv.status === 'pending' && (
                          <div className="hidden sm:block mr-2">
                            <span className="text-[9px] text-slate-400 block uppercase">OTP Code</span>
                            <span className="font-mono font-bold text-xs bg-slate-150 px-2 py-0.5 rounded text-slate-700">{resv.otp}</span>
                          </div>
                        )}
                        <Link
                          to={`/reservation/${resv._id}`}
                          className="px-4 py-2 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center space-x-1 transition-all"
                        >
                          <span>Invoice Details</span>
                          <ExternalLink size={12} className="text-slate-400" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Account Settings Placeholder */}
            <div className="premium-card bg-white p-6 border border-slate-200/50">
              <h4 className="font-bold text-slate-800 text-sm mb-4 font-display flex items-center space-x-2">
                <Settings size={15} className="text-slate-400" />
                <span>Security & Settings</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between border border-slate-100 p-3.5 rounded-xl">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">Push Notifications</span>
                    <span className="text-[10px] text-slate-400">Receive real-time reservation alerts</span>
                  </div>
                  <span className="w-8 h-4 bg-success/20 border border-success/30 rounded-full relative flex items-center justify-end px-0.5 pointer-events-none">
                    <span className="w-3 h-3 bg-success rounded-full"></span>
                  </span>
                </div>

                <div className="flex items-center justify-between border border-slate-100 p-3.5 rounded-xl">
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block">GPS Tracking</span>
                    <span className="text-[10px] text-slate-400">Enable location matching features</span>
                  </div>
                  <span className="w-8 h-4 bg-success/20 border border-success/30 rounded-full relative flex items-center justify-end px-0.5 pointer-events-none">
                    <span className="w-3 h-3 bg-success rounded-full"></span>
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;

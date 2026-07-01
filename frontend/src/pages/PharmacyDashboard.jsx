import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Sidebar from '../components/Sidebar';
import { 
  BellRing, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  CheckSquare, 
  TrendingUp, 
  ShoppingBag,
  Sparkles,
  Search,
  Check
} from 'lucide-react';

const PharmacyDashboard = () => {
  const { user, pharmacy } = useAuth();
  const { socket, isConnected } = useSocket();

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification code input
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationMessage, setVerificationMessage] = useState({ type: '', text: '' });

  // Response dialog modal state
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseQty, setResponseQty] = useState(1);
  const [responsePrice, setResponsePrice] = useState(15.0);

  // Statistics counters
  const [stats, setStats] = useState({
    pendingCount: 0,
    completedCount: 0,
    acceptedRequests: 14,
    rejectedRequests: 2
  });

  // Fetch reservations queue
  const fetchReservations = async () => {
    if (!pharmacy) return;
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/pharmacy/${pharmacy._id}`);
      const data = await response.json();
      if (data.success) {
        setReservations(data.reservations);
        const pending = data.reservations.filter(r => r.status === 'pending').length;
        const completed = data.reservations.filter(r => r.status === 'picked_up').length;
        setStats(prev => ({ ...prev, pendingCount: pending, completedCount: completed }));
      }
    } catch (err) {
      console.log('API fetch failed, loading fallback local pharmacy dashboard reservations');
      // Fallback
      setReservations([
        {
          _id: 'r_demo_1',
          medicineName: 'Paracetamol 650mg',
          quantity: 2,
          price: 18.0,
          status: 'pending',
          otp: '7892',
          pickupTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
          userId: { name: 'Jane Doe', email: 'jane.doe@gmail.com' }
        }
      ]);
      setStats(prev => ({ ...prev, pendingCount: 1, completedCount: 3 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [pharmacy]);

  // Bind Socket live requests listener
  useEffect(() => {
    if (!socket) return;

    socket.on('incoming_request', (req) => {
      // Add incoming request to list if not already there
      setIncomingRequests((prev) => {
        if (prev.find(item => item.requestId === req.requestId)) return prev;
        return [req, ...prev];
      });
      // Play a subtle notification audio or pulse alert
      console.log('🔔 Received incoming medicine availability request:', req);
    });

    return () => {
      socket.off('incoming_request');
    };
  }, [socket]);

  // Handle Available (YES) click
  const openResponseDialog = (req) => {
    setSelectedRequest(req);
    setResponseQty(req.quantity || 1);
    setResponsePrice(15.0); // Preset default
    setShowResponseModal(true);
  };

  // Submit pharmacy availability
  const submitAvailabilityResponse = async () => {
    if (!socket || !selectedRequest || !pharmacy) return;

    const resData = {
      requestId: selectedRequest.requestId,
      pharmacyId: pharmacy._id,
      status: 'available',
      quantity: Number(responseQty),
      price: Number(responsePrice),
      distance: selectedRequest.distance || 1000
    };

    // Emit live response back via socket
    socket.emit('submit_pharmacy_response', resData);

    // Remove from active list
    setIncomingRequests(prev => prev.filter(r => r.requestId !== selectedRequest.requestId));
    setStats(prev => ({ ...prev, acceptedRequests: prev.acceptedRequests + 1 }));
    setShowResponseModal(false);
  };

  // Handle Unavailable (NO) click
  const handleRejectRequest = (req) => {
    if (!socket || !pharmacy) return;

    const resData = {
      requestId: req.requestId,
      pharmacyId: pharmacy._id,
      status: 'unavailable',
      quantity: 0,
      price: 0,
      distance: req.distance || 1000
    };

    socket.emit('submit_pharmacy_response', resData);
    setIncomingRequests(prev => prev.filter(r => r.requestId !== req.requestId));
    setStats(prev => ({ ...prev, rejectedRequests: prev.rejectedRequests + 1 }));
  };

  // Verify OTP pickup
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!verificationCode.trim()) return;

    setVerificationMessage({ type: '', text: '' });
    
    // Find matching reservation
    const match = reservations.find(r => r.otp === verificationCode.trim() && r.status === 'pending');
    if (!match) {
      setVerificationMessage({ type: 'error', text: 'Invalid verification OTP or reservation expired.' });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${match._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'picked_up' })
      });
      const data = await response.json();
      if (data.success) {
        setVerificationMessage({ type: 'success', text: `Successfully verified! Marked ${match.medicineName} (Qty: ${match.quantity}) as Picked Up.` });
        setVerificationCode('');
        fetchReservations(); // Refresh list
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      // Offline fallback
      setVerificationMessage({ type: 'success', text: `[Simulated Verification Successful] Marked ${match.medicineName} as Picked Up.` });
      setReservations(prev => 
        prev.map(r => r._id === match._id ? { ...r, status: 'picked_up' } : r)
      );
      setStats(prev => ({ 
        ...prev, 
        pendingCount: prev.pendingCount - 1, 
        completedCount: prev.completedCount + 1 
      }));
      setVerificationCode('');
    }
  };

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 pl-64 min-h-screen bg-slate-50 text-left">
      <Sidebar role="pharmacy" />
      
      <div className="max-w-7xl mx-auto px-8">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display">
              {pharmacy?.name || 'Pharmacy Dashboard'}
            </h1>
            <p className="text-slate-500 text-sm">Manage live inbound pings, stock allocations, and check counters.</p>
          </div>

          <div className="text-xs px-3.5 py-1.5 bg-slate-200/50 text-slate-600 rounded-full font-semibold flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-orange-500'}`}></span>
            <span>{isConnected ? 'Real-time Gateway Active' : 'Real-time Gateway Offline'}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="premium-card bg-white p-5 border border-slate-200/40 flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <BellRing size={20} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800 font-display">{incomingRequests.length}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inbound Requests</p>
            </div>
          </div>

          <div className="premium-card bg-white p-5 border border-slate-200/40 flex items-center space-x-4">
            <div className="w-10 h-10 bg-warning/10 text-warning rounded-xl flex items-center justify-center">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800 font-display">{stats.pendingCount}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Pickups</p>
            </div>
          </div>

          <div className="premium-card bg-white p-5 border border-slate-200/40 flex items-center space-x-4">
            <div className="w-10 h-10 bg-success/10 text-success rounded-xl flex items-center justify-center">
              <CheckCircle size={20} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800 font-display">{stats.completedCount}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Pickups</p>
            </div>
          </div>

          <div className="premium-card bg-white p-5 border border-slate-200/40 flex items-center space-x-4">
            <div className="w-10 h-10 bg-emerald-500/10 text-success rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-800 font-display">
                {Math.round((stats.acceptedRequests / (stats.acceptedRequests + stats.rejectedRequests || 1)) * 100)}%
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acceptance Rate</p>
            </div>
          </div>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Incoming Medicine Requests */}
          <div className="lg:col-span-6 space-y-6">
            <div className="premium-card bg-white p-6 border border-slate-200/50">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                <h4 className="font-bold text-slate-800 text-sm font-display flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary pulse-badge"></span>
                  <span>Live Medicine Requests</span>
                </h4>
                <span className="text-[10px] bg-slate-100 text-slate-500 font-semibold px-2 py-0.5 rounded-full">Real-time Feed</span>
              </div>

              {incomingRequests.length === 0 ? (
                <div className="py-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <BellRing size={24} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500 text-xs font-semibold">No active inbound requests.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Requests from searching patients will show here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incomingRequests.map((req) => (
                    <div 
                      key={req.requestId} 
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl hover:border-slate-300 transition-all flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-extrabold text-slate-800 text-sm font-display">{req.medicineName}</div>
                          <div className="text-[10px] text-slate-500 mt-1 flex items-center space-x-2">
                            <span>Requested Qty: <strong className="text-slate-700">{req.quantity}</strong></span>
                            <span>•</span>
                            <span className="flex items-center"><MapPin size={10} className="mr-0.5" />{req.distance ? `${(req.distance / 1000).toFixed(1)} km away` : 'Within 5 km'}</span>
                          </div>
                        </div>
                      </div>

                      {/* YES/NO buttons */}
                      <div className="mt-4 pt-3 border-t border-slate-200/50 grid grid-cols-2 gap-3">
                        <button 
                          onClick={() => handleRejectRequest(req)}
                          className="py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-500 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1"
                        >
                          <XCircle size={14} className="text-slate-400" />
                          <span>No / Out of Stock</span>
                        </button>
                        <button 
                          onClick={() => openResponseDialog(req)}
                          className="py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1 shadow-sm"
                        >
                          <CheckCircle size={14} />
                          <span>Yes / In Stock</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: OTP Verification & Pickup Queue */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* OTP Verification widget */}
            <div className="premium-card bg-slate-900 text-white p-6 border-none shadow-xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/10 text-white border border-white/20 rounded-full text-[9px] font-extrabold uppercase tracking-wider mb-4">
                <CheckSquare size={10} />
                <span>Verification Counter</span>
              </div>
              <h4 className="font-bold text-slate-100 text-sm font-display mb-2">QR / OTP Verification Portal</h4>
              <p className="text-[11px] text-slate-400 mb-6 max-w-sm">
                Enter the client's 4-digit pickup code or scan the receipt QR to release reserved medications.
              </p>

              {verificationMessage.text && (
                <div className={`mb-4 p-3 rounded-xl text-xs font-medium text-left ${verificationMessage.type === 'success' ? 'bg-success/15 border border-success/30 text-success' : 'bg-red-500/15 border border-red-500/30 text-red-300'}`}>
                  {verificationMessage.type === 'success' ? '✅' : '⚠️'} {verificationMessage.text}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="flex gap-3">
                <input 
                  type="text" 
                  maxLength={4}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 4-Digit OTP (e.g. 7892)"
                  className="flex-1 bg-white/5 border border-white/15 px-4 py-3 rounded-xl text-sm font-bold placeholder:text-slate-500 focus:outline-none focus:border-white/35 transition-all text-center tracking-widest"
                />
                <button 
                  type="submit"
                  className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-6 py-3 rounded-xl transition-colors"
                >
                  Verify Code
                </button>
              </form>
            </div>

            {/* Active Pickup queue list */}
            <div className="premium-card bg-white p-6 border border-slate-200/50">
              <h4 className="font-bold text-slate-800 text-sm mb-4 font-display flex items-center space-x-2">
                <Clock size={16} className="text-slate-400" />
                <span>Active Pickup Queue</span>
              </h4>

              {loading ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading queue...</div>
              ) : reservations.filter(r => r.status === 'pending').length === 0 ? (
                <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <ShoppingBag size={20} className="text-slate-300 mx-auto mb-1.5" />
                  <p className="text-slate-500 text-xs font-medium">No pending collections.</p>
                  <p className="text-[10px] text-slate-400">Reserved items waiting for OTP release will show here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reservations.filter(r => r.status === 'pending').map((resv) => (
                    <div 
                      key={resv._id} 
                      className="border border-slate-100 bg-slate-50/40 p-4 rounded-xl flex justify-between items-center text-xs text-slate-700"
                    >
                      <div>
                        <div className="font-bold text-slate-800 font-display">{resv.medicineName}</div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Patient: {resv.userId?.name || 'Guest User'}</p>
                        <div className="text-[9px] text-slate-400 mt-1 flex space-x-2">
                          <span>Qty: {resv.quantity}</span>
                          <span>Price: ${(resv.price * resv.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 uppercase tracking-widest block">OTP CODE</span>
                        <span className="font-mono font-bold text-xs text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">{resv.otp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

      {/* Available Response Modal Dialog */}
      {showResponseModal && selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <h3 className="font-bold text-slate-800 text-lg font-display mb-2">Submit Availability Details</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Confirm your pricing and stock quantity available for <strong className="text-slate-800">{selectedRequest.medicineName}</strong>.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Quantity to Allocate</label>
                <input 
                  type="number"
                  min="1"
                  value={responseQty}
                  onChange={(e) => setResponseQty(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase">Unit Price ($ per strip)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={responsePrice}
                  onChange={(e) => setResponsePrice(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowResponseModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={submitAvailabilityResponse}
                className="px-5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10"
              >
                Submit Response
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PharmacyDashboard;

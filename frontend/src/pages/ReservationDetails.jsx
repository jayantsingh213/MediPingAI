import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import MapComponent from '../components/MapComponent';
import { 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  AlertTriangle,
  ArrowLeft,
  Navigation,
  FileText
} from 'lucide-react';

const ReservationDetails = () => {
  const { id } = useParams();
  const locationState = useLocation().state || {};
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // Setup coordinates
  const [userCoords, setUserCoords] = useState([77.5946, 12.9716]);

  useEffect(() => {
    // Geolocation coords
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserCoords([pos.coords.longitude, pos.coords.latitude]);
      });
    }
  }, []);

  // Fetch reservation from API or fallback to router state
  useEffect(() => {
    if (locationState.mockReservation) {
      setReservation(locationState.mockReservation);
      setLoading(false);
      return;
    }

    const fetchReservation = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reservations/${id}`);
        const data = await response.json();
        if (data.success) {
          setReservation(data.reservation);
        } else {
          // Trigger fallback if not found in db
          throw new Error('Not found');
        }
      } catch (err) {
        console.log('Fetching reservation failed, triggering mock fallback');
        setReservation({
          _id: id || 'resv_demo_1',
          medicineName: 'Paracetamol 650mg',
          quantity: 2,
          price: 18.0,
          status: 'pending',
          otp: '7892',
          pickupTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
          pharmacyId: {
            _id: 'p2',
            name: 'LifeCare Pharmacy',
            ownerName: 'Robert Chen',
            email: 'lifecare@mediping.ai',
            phone: '+1 555-0211',
            address: '45 Health Avenue, Block C',
            location: { coordinates: [77.5995, 12.9782] },
            status: 'approved',
            rating: 4.5,
            hours: '24 Hours Open',
          }
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, locationState]);

  const handleCancelReservation = async () => {
    if (!window.confirm('Are you sure you want to cancel this medicine reservation?')) return;
    
    setCancelling(true);
    try {
      const response = await fetch(`http://localhost:5000/api/reservations/${reservation._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      const data = await response.json();
      if (data.success) {
        setReservation(prev => ({ ...prev, status: 'cancelled' }));
      } else {
        alert(data.message || 'Failed to cancel reservation');
      }
    } catch (err) {
      console.log('Cancellation failed, updating local state for fallback');
      setReservation(prev => ({ ...prev, status: 'cancelled' }));
    } finally {
      setCancelling(false);
    }
  };

  const getPickupTimeDisplay = (isoStr) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' on ' + date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="pt-40 sm:pt-48 text-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Loading booking invoice details...</p>
      </div>
    );
  }

  const pharm = reservation.pharmacyId;
  const isCancelled = reservation.status === 'cancelled';
  const isPickedUp = reservation.status === 'picked_up';

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Back navigation */}
        <div className="flex items-center space-x-2 mb-8 text-left">
          <Link 
            to="/dashboard"
            className="flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Confirmation Tickets & QR */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Status Header */}
            <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isCancelled ? 'bg-red-50 text-red-500' : isPickedUp ? 'bg-success/10 text-success' : 'bg-success/15 text-success'}`}>
                <CheckCircle size={24} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 font-display">
                  {isCancelled ? 'Reservation Cancelled' : isPickedUp ? 'Medication Picked Up' : 'Reservation Confirmed'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-mono font-semibold text-slate-600">{reservation._id}</span>
                </p>
              </div>
            </div>

            {/* Ticket Card Details */}
            <div className="premium-card bg-white p-6 border border-slate-200/50 relative overflow-hidden">
              {/* Ticket Jagged Edges Background Details */}
              <div className="absolute left-0 right-0 top-1/2 h-4 flex justify-between px-0 -translate-y-1/2 pointer-events-none">
                <div className="w-2.5 h-4 bg-slate-55 rounded-r-full -ml-1"></div>
                <div className="w-2.5 h-4 bg-slate-55 rounded-l-full -mr-1"></div>
              </div>

              <h4 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wider text-slate-400 mb-4 pb-4 border-b border-dashed border-slate-100 flex items-center space-x-1.5">
                <FileText size={14} />
                <span>Pickup Invoice</span>
              </h4>

              {/* Medicine details */}
              <div className="mb-4">
                <span className="text-xs text-slate-400">Medicine & Strength</span>
                <div className="font-bold text-slate-800 text-base font-display mt-0.5">{reservation.medicineName}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-slate-200/50 mb-6">
                <div>
                  <span className="text-xs text-slate-400">Quantity</span>
                  <div className="font-bold text-slate-800 mt-0.5">{reservation.quantity} Strips</div>
                </div>
                <div>
                  <span className="text-xs text-slate-400">Total Price</span>
                  <div className="font-bold text-slate-800 mt-0.5">${(reservation.price * reservation.quantity).toFixed(2)}</div>
                </div>
              </div>

              {/* Timing */}
              <div className="flex items-start space-x-3 bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                <Clock size={18} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-xs font-bold text-slate-700">Pickup Expiry Window</span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please collect by <span className="font-semibold text-slate-800">{getPickupTimeDisplay(reservation.pickupTime)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* QR Verification card */}
            {!isCancelled && (
              <div className="bg-slate-900 text-white rounded-3xl p-6 border-none shadow-xl text-center flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-left space-y-2">
                  <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-white/10 text-white border border-white/20 rounded-full text-[9px] font-extrabold uppercase tracking-wider">
                    <span>Counter Code</span>
                  </div>
                  <h4 className="font-bold text-slate-200 text-sm font-display">Verify at Pharmacy Counter</h4>
                  <p className="text-[11px] text-slate-400 max-w-[280px]">
                    Present this QR code or provide the OTP validation code to the pharmacist to retrieve your medicine.
                  </p>
                  
                  {/* OTP */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Pick up OTP:</span>
                    <span className="font-mono text-2xl font-black tracking-widest text-primary-light bg-white/5 border border-white/10 px-4 py-1 rounded-xl">
                      {reservation.otp}
                    </span>
                  </div>
                </div>

                {/* Mock QR Code */}
                <div className="bg-white p-3 rounded-2xl w-32 h-32 flex-shrink-0 flex items-center justify-center shadow-lg relative">
                  {isPickedUp && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-2xl">
                      <span className="bg-success text-white px-2 py-0.5 text-[9px] font-bold rounded">VERIFIED</span>
                    </div>
                  )}
                  <svg width="100" height="100" viewBox="0 0 100 100" className="text-slate-900">
                    <rect x="0" y="0" width="25" height="25" fill="currentColor"/>
                    <rect x="5" y="5" width="15" height="15" fill="white"/>
                    <rect x="10" y="10" width="5" height="5" fill="currentColor"/>
                    
                    <rect x="75" y="0" width="25" height="25" fill="currentColor"/>
                    <rect x="80" y="5" width="15" height="15" fill="white"/>
                    <rect x="85" y="10" width="5" height="5" fill="currentColor"/>

                    <rect x="0" y="75" width="25" height="25" fill="currentColor"/>
                    <rect x="5" y="80" width="15" height="15" fill="white"/>
                    <rect x="10" y="85" width="5" height="5" fill="currentColor"/>

                    <rect x="35" y="10" width="5" height="15" fill="currentColor"/>
                    <rect x="45" y="5" width="15" height="5" fill="currentColor"/>
                    <rect x="55" y="20" width="10" height="15" fill="currentColor"/>
                    <rect x="30" y="35" width="20" height="5" fill="currentColor"/>
                    <rect x="10" y="45" width="15" height="10" fill="currentColor"/>
                    
                    <rect x="40" y="60" width="25" height="5" fill="currentColor"/>
                    <rect x="50" y="75" width="5" height="15" fill="currentColor"/>
                    <rect x="65" y="85" width="15" height="10" fill="currentColor"/>
                    <rect x="75" y="45" width="15" height="15" fill="currentColor"/>
                    <rect x="85" y="70" width="10" height="5" fill="currentColor"/>
                  </svg>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            {!isCancelled && !isPickedUp && (
              <button 
                onClick={handleCancelReservation}
                disabled={cancelling}
                className="w-full py-3.5 bg-white hover:bg-red-50 text-red-600 border border-red-200/50 rounded-2xl font-bold text-xs shadow-sm transition-colors flex items-center justify-center space-x-1.5"
              >
                <AlertTriangle size={14} />
                <span>{cancelling ? 'Cancelling...' : 'Cancel Medicine Booking'}</span>
              </button>
            )}
          </div>

          {/* Right Column: Routing Map */}
          <div className="lg:col-span-6 text-left">
            <div className="premium-card bg-white p-5 border border-slate-200/50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-800 text-sm font-display flex items-center space-x-2">
                  <MapPin size={16} className="text-slate-400" />
                  <span>Pharmacy Geolocation & Directions</span>
                </h4>
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pharm.location?.coordinates ? `${pharm.location.coordinates[1]},${pharm.location.coordinates[0]}` : '12.9782,77.5995'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold shadow-md shadow-primary/10 flex items-center space-x-1 transition-colors"
                >
                  <Navigation size={12} />
                  <span>Google Maps directions</span>
                </a>
              </div>

              {/* Map */}
              <MapComponent 
                userLocation={userCoords}
                selectedPharmacy={pharm}
                showRoute={true}
                height="380px"
              />

              {/* Address details */}
              <div className="mt-5 space-y-4 pt-5 border-t border-slate-100">
                <div className="flex items-start space-x-3">
                  <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs sm:text-sm font-display">{pharm.name}</h5>
                    <p className="text-xs text-slate-500 mt-0.5">{pharm.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone size={16} className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Store Contact</span>
                    <a href={`tel:${pharm.phone}`} className="font-bold text-slate-700 text-xs sm:text-sm hover:text-primary transition-colors">
                      {pharm.phone}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ReservationDetails;

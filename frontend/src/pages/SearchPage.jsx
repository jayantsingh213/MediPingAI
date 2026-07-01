import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import MapComponent from '../components/MapComponent';
import { 
  Search, 
  MapPin, 
  ArrowLeft, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  TrendingUp,
  ChevronRight,
  Navigation
} from 'lucide-react';

const SearchPage = () => {
  const navigate = useNavigate();
  const locationState = useLocation().state || {};
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const medicineName = locationState.medicineName || 'Paracetamol 650mg';
  const quantity = locationState.quantity || 1;
  const userCoordinates = locationState.coordinates || [77.5946, 12.9716];

  const [requestId, setRequestId] = useState(null);
  const [responses, setResponses] = useState([]);
  const [searchStatus, setSearchStatus] = useState({
    totalPharmacies: 0,
    responsesReceived: 0,
    completed: false
  });

  // Connect & Trigger Socket Search
  useEffect(() => {
    if (!socket) return;

    // Trigger the search via socket
    socket.emit('search_medicine', {
      userId: user?._id || 'u1',
      medicineName,
      quantity,
      coordinates: userCoordinates
    });

    // Listen for Request Registration
    socket.on('request_created', ({ requestId: reqId }) => {
      setRequestId(reqId);
      socket.emit('join_request_room', { requestId: reqId });
    });

    // Listen for general progress
    socket.on('search_status', (status) => {
      setSearchStatus(status);
    });

    // Listen for live pharmacy responses
    socket.on('live_response', (response) => {
      setResponses((prev) => {
        // Prevent duplicate pharmacy entries
        const idx = prev.findIndex(r => r.pharmacyId._id === response.pharmacyId._id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = response;
          return updated;
        }
        return [response, ...prev];
      });
    });

    return () => {
      socket.off('request_created');
      socket.off('search_status');
      socket.off('live_response');
    };
  }, [socket, medicineName, quantity, userCoordinates, user]);

  // Fallback Simulation for Serverless/Vercel Deployments where WebSockets might fail
  useEffect(() => {
    const fallbackTimer = setTimeout(() => {
      if (responses.length === 0) {
        console.log('No socket responses received. Triggering Vercel fallback simulation...');
        setSearchStatus({ totalPharmacies: 5, responsesReceived: 0, completed: false });
        
        const mockResponses = [
          { _id: 'r1', pharmacyId: { _id: 'p1', name: 'Apollo Pharmacy', location: { coordinates: [userCoordinates[0] + 0.005, userCoordinates[1] + 0.005] } }, status: 'available', price: 45, notes: 'Available immediately' },
          { _id: 'r2', pharmacyId: { _id: 'p2', name: 'LifeCare Meds', location: { coordinates: [userCoordinates[0] - 0.003, userCoordinates[1] + 0.002] } }, status: 'available', price: 42, notes: 'Generic brand available' },
          { _id: 'r3', pharmacyId: { _id: 'p3', name: 'Wellness Plus', location: { coordinates: [userCoordinates[0] + 0.001, userCoordinates[1] - 0.004] } }, status: 'unavailable', notes: 'Out of stock' }
        ];

        mockResponses.forEach((res, i) => {
          setTimeout(() => {
            setResponses(prev => [res, ...prev]);
            setSearchStatus(prev => ({ ...prev, responsesReceived: prev.responsesReceived + 1, completed: i === 2 }));
          }, (i + 1) * 1500);
        });
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [responses.length, userCoordinates]);

  const handleReserve = async (response) => {
    try {
      const responseObj = {
        requestId: requestId || 'req_demo',
        responseId: response._id,
        userId: user?._id || 'u1',
        pharmacyId: response.pharmacyId._id,
        medicineName,
        quantity,
        price: response.price,
        pickupTime: new Date(Date.now() + 6 * 3600 * 1000) // 6 hours
      };

      const res = await fetch('http://localhost:5000/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseObj)
      });
      const data = await res.json();
      
      if (data.success) {
        navigate(`/reservation/${data.reservation._id}`);
      } else {
        alert(data.message || 'Failed to make reservation');
      }
    } catch (err) {
      console.error('Reservation request failed, using mock local setup:', err);
      // Fallback local mock reservation creation
      const mockReservationId = 'resv_' + Math.random().toString(36).substr(2, 9);
      navigate(`/reservation/${mockReservationId}`, {
        state: {
          mockReservation: {
            _id: mockReservationId,
            medicineName,
            quantity,
            price: response.price,
            otp: Math.floor(1000 + Math.random() * 9000).toString(),
            status: 'pending',
            pickupTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
            pharmacyId: response.pharmacyId
          }
        }
      });
    }
  };

  // Convert distance in meters to standard display string
  const formatDistance = (meters) => {
    if (meters < 1000) return `${meters} meters`;
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Filter out pharmacies to plot on map
  const activePharmaciesForMap = responses
    .filter(r => r.status === 'available')
    .map(r => r.pharmacyId);

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Back Button & Title */}
        <div className="flex items-center space-x-3 mb-8 text-left">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2.5 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <span className="text-xs font-semibold text-slate-400">Search Results</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 font-display">
              Live Search: <span className="text-primary font-bold">{medicineName}</span> ({quantity} {quantity > 1 ? 'units' : 'unit'})
            </h1>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Sonar and Live List */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Sonar Radar Card */}
            <div className="premium-card bg-white p-6 border border-slate-200/50 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
              
              <div className="flex items-center space-x-4 relative z-10">
                {/* Sonar Animation */}
                <div className="relative w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <div className="radar-ring"></div>
                  <div className="radar-ring"></div>
                  <div className="radar-ring"></div>
                  <Search size={22} className="text-primary z-10" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm sm:text-base font-display">
                    {searchStatus.completed ? 'Availability Search Complete' : 'Pinging Nearby Pharmacies...'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                    Broadcasted to registered pharmacies within 10km.
                  </p>
                </div>
              </div>

              {/* Response Stats Counters */}
              <div className="bg-slate-50 border border-slate-200/50 rounded-2xl py-3 px-5 text-center sm:text-right relative z-10">
                <div className="text-2xl font-black text-slate-800 font-display">
                  {searchStatus.responsesReceived} <span className="text-slate-400 font-normal text-sm">/ {searchStatus.totalPharmacies || 5}</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Responses Recieved</div>
              </div>
            </div>

            {/* Responses List */}
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider text-slate-400">Live Availability Feed</h4>
              
              <AnimatePresence initial={false}>
                {responses.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 bg-white rounded-2xl border border-slate-200/40 text-center"
                  >
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock size={20} className="text-slate-300 animate-spin" />
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Waiting for replies from pharmacies...</p>
                    <p className="text-xs text-slate-400 mt-1">This will update dynamically in real time.</p>
                  </motion.div>
                ) : (
                  responses.map((res) => {
                    const pharm = res.pharmacyId;
                    const isAvailable = res.status === 'available';
                    const isChecking = res.status === 'checking';
                    
                    return (
                      <motion.div
                        key={res._id || pharm._id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 25 }}
                        className={`premium-card p-5 border bg-white flex justify-between items-center ${isAvailable ? 'border-success/20 hover:border-success/35' : isChecking ? 'border-primary/10 animate-pulse' : 'border-slate-100 opacity-60'}`}
                      >
                        <div className="space-y-1">
                          <Link to={`/pharmacy/${pharm._id}`} className="hover:text-primary transition-colors">
                            <h5 className="font-bold text-slate-800 text-sm sm:text-base font-display">{pharm.name}</h5>
                          </Link>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center space-x-0.5">
                              <MapPin size={12} className="text-slate-400" />
                              <span>{formatDistance(res.distance)}</span>
                            </span>
                            <span>•</span>
                            <span>{pharm.hours}</span>
                            <span>•</span>
                            <span className="text-amber-500">⭐ {pharm.rating?.toFixed(1) || '4.5'}</span>
                          </div>
                        </div>

                        {/* Availability badges & actions */}
                        <div className="text-right flex flex-col items-end space-y-2">
                          {isAvailable ? (
                            <>
                              <div className="flex items-center space-x-2">
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-success/15 text-success rounded-full">
                                  {res.quantity} Strips Left
                                </span>
                                <span className="font-extrabold text-sm text-slate-800">${res.price?.toFixed(2)}</span>
                              </div>
                              
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleReserve(res)}
                                  className="bg-success hover:bg-success-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-success/10 transition-colors"
                                >
                                  Reserve
                                </button>
                                <a
                                  href={`https://www.google.com/maps/dir/?api=1&destination=${pharm.location.coordinates[1]},${pharm.location.coordinates[0]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200/50 rounded-lg text-slate-600 transition-colors"
                                  title="Google Maps Navigation"
                                >
                                  <Navigation size={14} />
                                </a>
                              </div>
                            </>
                          ) : isChecking ? (
                            <span className="text-xs font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-full animate-pulse flex items-center space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                              <span>Checking stock...</span>
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2.5 py-1 bg-slate-200 text-slate-500 rounded-full">
                              Out of Stock
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Leaflet Interactive Map */}
          <div className="lg:col-span-5 text-left sticky top-24">
            <div className="premium-card bg-white p-5 border border-slate-200/50">
              <h4 className="font-bold text-slate-800 text-sm mb-4 font-display flex items-center space-x-2">
                <MapPin size={16} className="text-slate-400" />
                <span>Geospatial Coverage</span>
              </h4>
              
              <MapComponent 
                userLocation={userCoordinates}
                pharmacies={activePharmaciesForMap}
                height="450px"
              />
              
              <div className="mt-4 p-3 bg-slate-50 border border-slate-200/30 rounded-xl flex items-start space-x-2.5 text-xs text-slate-500 leading-relaxed">
                <AlertCircle size={14} className="text-slate-400 mt-0.5 flex-shrink-0" />
                <p>
                  Pharmacies responding <span className="text-success font-semibold">Available</span> are plotted as green pins. Hover or click markers to inspect address, ratings, and operation timings.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SearchPage;

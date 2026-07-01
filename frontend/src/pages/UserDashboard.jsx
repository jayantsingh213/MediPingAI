import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Search, 
  Mic, 
  MapPin, 
  Zap, 
  History, 
  Clock, 
  AlertTriangle, 
  Pill, 
  ArrowRight,
  Sparkles,
  PhoneCall,
  CheckCircle
} from 'lucide-react';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const [medicine, setMedicine] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // Setup geolocation coordinates
  const [coordinates, setCoordinates] = useState([77.5946, 12.9716]); // Default Bangalore

  useEffect(() => {
    // Attempt browser geolocation if user permits
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates([position.coords.longitude, position.coords.latitude]);
        },
        (error) => console.log('Geolocation retrieval declined, using default central coordinates.')
      );
    }
  }, []);

  // Fetch recent searches from localStorage
  useEffect(() => {
    const searches = localStorage.getItem('mediping_recent_searches');
    if (searches) {
      setRecentSearches(JSON.parse(searches));
    } else {
      const defaultSearches = ['Paracetamol 650mg', 'Ibuprofen 400mg', 'Metformin 500mg'];
      setRecentSearches(defaultSearches);
      localStorage.setItem('mediping_recent_searches', JSON.stringify(defaultSearches));
    }
  }, []);

  // Fetch reservations
  useEffect(() => {
    if (!user) return;
    setLoadingReservations(true);
    fetch(`http://localhost:5000/api/reservations/user/${user._id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReservations(data.reservations);
        }
      })
      .catch(err => {
        console.log('Unreachable backend, fallback to mock reservations');
        // Fallback to local storage or defaults
        setReservations([
          {
            _id: 'r_demo_1',
            medicineName: 'Paracetamol 650mg',
            quantity: 2,
            price: 18.0,
            status: 'pending',
            otp: '7892',
            pickupTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
            pharmacyId: { name: 'LifeCare Pharmacy', address: '45 Health Avenue, Block C' }
          }
        ]);
      })
      .finally(() => {
        setLoadingReservations(false);
      });
  }, [user]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!medicine.trim()) return;

    // Save to recent searches
    const updatedSearches = [medicine.trim(), ...recentSearches.filter(s => s !== medicine.trim())].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('mediping_recent_searches', JSON.stringify(updatedSearches));

    // Redirect to search radar with search details in state
    navigate('/search', { 
      state: { 
        medicineName: medicine.trim(), 
        quantity: Number(quantity),
        coordinates
      } 
    });
  };

  const handleRecentClick = (searchVal) => {
    setMedicine(searchVal);
  };

  const triggerVoiceSearch = () => {
    setIsListening(true);
    // Simulate speech recognition
    setTimeout(() => {
      setMedicine('Paracetamol 650mg');
      setIsListening(false);
    }, 2500);
  };

  const triggerEmergencySearch = (medName) => {
    setMedicine(medName);
    setQuantity(2);
    // Directly submit
    navigate('/search', { 
      state: { 
        medicineName: medName, 
        quantity: 2,
        coordinates
      } 
    });
  };

  const popularMedicines = [
    { name: 'Paracetamol 650mg', category: 'Pain & Fever', desc: 'Widely used for pain relief and reducing temperature.' },
    { name: 'Ibuprofen 400mg', category: 'NSAID', desc: 'Relieves pain, reduces swelling, and lowers inflammation.' },
    { name: 'Cetirizine 10mg', category: 'Antihistamine', desc: 'Non-drowsy allergy relief from sneezing and watery eyes.' },
    { name: 'Metformin 500mg', category: 'Anti-Diabetic', desc: 'Controls high blood sugar levels in type 2 diabetes.' }
  ];

  return (
    <div className="pt-40 sm:pt-48 sm:pt-40 pb-12 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight font-display">
              Welcome back, <span className="text-primary">{user?.name?.split(' ')[0] || 'Guest'}</span>
            </h1>
            <p className="text-slate-500 text-sm">Find and reserve your medicine instantly from nearby pharmacies.</p>
          </div>

          <div className="text-xs px-3.5 py-1.5 bg-slate-200/50 text-slate-600 rounded-full font-semibold flex items-center space-x-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse' : 'bg-orange-500'}`}></span>
            <span>{isConnected ? 'Real-time Server Connected' : 'Server Offline (Simulated Fallback active)'}</span>
          </div>
        </div>

        {/* Main Search Radar Card */}
        <div className="premium-card bg-white p-8 border border-slate-200/50 mb-8 text-left relative overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-bold text-primary uppercase tracking-wider mb-4">
              <Sparkles size={11} />
              <span>Smart Search Broadcasting</span>
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6 font-display">
              Search Once. Let Nearby Pharmacies Check Stock.
            </h3>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search input */}
                <div className="md:col-span-8 relative">
                  <Search size={18} className="absolute left-4 top-4 text-slate-400" />
                  <input 
                    type="text"
                    value={medicine}
                    onChange={(e) => setMedicine(e.target.value)}
                    placeholder="Enter medicine name (e.g. Paracetamol 650mg, Insulin)..."
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all font-sans"
                  />
                  <button 
                    type="button"
                    onClick={triggerVoiceSearch}
                    className={`absolute right-4 top-3.5 p-1 rounded-lg text-slate-400 hover:text-primary transition-all ${isListening ? 'bg-primary/15 text-primary scale-110' : ''}`}
                  >
                    <Mic size={16} />
                  </button>
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <input 
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Qty"
                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-all font-sans text-center"
                  />
                </div>

                {/* Submit */}
                <div className="md:col-span-2">
                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold shadow-md shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center space-x-1.5 text-sm"
                  >
                    <span>Ping</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </form>

            {/* Voice Listening Overlay simulation */}
            {isListening && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-center justify-between animate-pulse">
                <div className="flex items-center space-x-3">
                  <Mic size={18} className="text-primary animate-bounce" />
                  <span className="text-xs font-semibold text-primary">Listening for medication voice queries...</span>
                </div>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-4 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-6 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                </div>
              </div>
            )}

            {/* Recent Searches */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-400 flex items-center space-x-1 mr-1">
                <History size={12} />
                <span>Recent:</span>
              </span>
              {recentSearches.map((term, i) => (
                <button 
                  key={i}
                  type="button"
                  onClick={() => handleRecentClick(term)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-xs font-medium text-slate-600 rounded-full border border-slate-200/30 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Emergency searches & Popular Medicines */}
          <div className="lg:col-span-8 space-y-8">
            {/* Emergency Search Panel */}
            <div className="premium-card bg-orange-50/50 p-6 border border-orange-200/50 text-left">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 bg-warning/15 text-warning rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-base font-display">Emergency Search</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Critical situation? Select standard emergency medications below to instantly broadcast a request to all pharmacies within 10 km.
                  </p>
                  
                  <div className="mt-4 flex flex-wrap gap-2.5">
                    <button 
                      onClick={() => triggerEmergencySearch('Insulin Glargine 100 IU')}
                      className="px-3.5 py-2 bg-white hover:bg-orange-100/50 border border-orange-200 text-warning text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <Zap size={12} />
                      <span>Insulin Injection</span>
                    </button>
                    <button 
                      onClick={() => triggerEmergencySearch('Albuterol 90mcg Inhaler')}
                      className="px-3.5 py-2 bg-white hover:bg-orange-100/50 border border-orange-200 text-warning text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <Zap size={12} />
                      <span>Asthma Inhaler</span>
                    </button>
                    <button 
                      onClick={() => triggerEmergencySearch('Nitroglycerin 0.4mg')}
                      className="px-3.5 py-2 bg-white hover:bg-orange-100/50 border border-orange-200 text-warning text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
                    >
                      <Zap size={12} />
                      <span>Nitroglycerin</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Popular Medicines List */}
            <div className="text-left">
              <h4 className="font-bold text-slate-800 text-lg mb-4 font-display">Popular Medicines</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {popularMedicines.map((med, i) => (
                  <div key={i} className="premium-card bg-white p-5 border border-slate-200/50 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm font-display truncate max-w-[150px]">{med.name}</span>
                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">{med.category}</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4">{med.desc}</p>
                    </div>
                    <button 
                      onClick={() => { setMedicine(med.name); }}
                      className="text-xs text-primary font-bold hover:underline flex items-center space-x-1 w-fit mt-auto"
                    >
                      <span>Select Medicine</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Active Reservations Panel */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className="premium-card bg-white p-6 border border-slate-200/50 shadow-md">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-4">
                <h4 className="font-bold text-slate-800 text-sm font-display flex items-center space-x-2">
                  <Clock size={16} className="text-slate-400" />
                  <span>My Active Reservations</span>
                </h4>
                <Link to="/profile" className="text-xs text-primary font-semibold hover:underline">View All</Link>
              </div>

              {loadingReservations ? (
                <div className="py-6 text-center text-xs text-slate-500">Loading reservations...</div>
              ) : reservations.length === 0 ? (
                <div className="py-8 text-center bg-slate-55/30 rounded-2xl border border-dashed border-slate-200">
                  <Pill size={20} className="text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No active bookings.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Your reserved pickups will show here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reservations.slice(0, 3).map((resv) => (
                    <div 
                      key={resv._id} 
                      className="border border-slate-100 bg-slate-50/40 hover:bg-slate-50 hover:border-slate-200 p-4 rounded-2xl transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-800 text-xs sm:text-sm font-display truncate max-w-[150px]">{resv.medicineName}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Store: {resv.pharmacyId?.name}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-success/10 text-success rounded-full flex items-center space-x-1">
                          <CheckCircle size={10} />
                          <span className="capitalize">{resv.status}</span>
                        </span>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px]">
                        <div>
                          <span className="text-slate-400">OTP: </span>
                          <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">{resv.otp}</span>
                        </div>
                        <Link 
                          to={`/reservation/${resv._id}`}
                          className="bg-primary text-white px-3 py-1 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                        >
                          Navigate
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Helpline widget */}
            <div className="premium-card bg-slate-900 text-white p-5 border-none">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                  <PhoneCall size={14} className="text-primary-light" />
                </div>
                <h5 className="font-bold text-xs sm:text-sm font-display">Need Medical Assistance?</h5>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed mb-4">
                If you are having a medical emergency, please contact national emergency services immediately or call your closest hospital.
              </p>
              <a 
                href="tel:911" 
                className="w-full block text-center py-2 bg-white text-slate-900 rounded-xl font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Call Emergency Services
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;

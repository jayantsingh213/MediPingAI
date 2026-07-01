import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  ArrowLeft, 
  ShieldCheck, 
  PhoneCall, 
  Navigation,
  MessageSquare,
  Package
} from 'lucide-react';

const PharmacyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [pharmacy, setPharmacy] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reviews mock dataset
  const mockReviews = [
    { name: 'Sarah Connor', rating: 5, comment: 'Always has my prescription stocks in order. Very professional pharmacists.', date: '3 days ago' },
    { name: 'Jane Doe', rating: 4, comment: 'Quick response on the MediPing app. The QR pickup process at the counter took less than a minute.', date: '1 week ago' },
    { name: 'John Watson', rating: 4.5, comment: 'Clean facility, friendly pharmacist owner. Highly recommend.', date: '2 weeks ago' }
  ];

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/pharmacies/${id}`);
        const data = await response.json();
        if (data.success) {
          setPharmacy(data.pharmacy);
          setInventory(data.inventory);
        } else {
          throw new Error('Not found');
        }
      } catch (err) {
        console.log('API details fetch failed, loading fallback local pharmacy details');
        
        // Define fallback profiles matching index IDs
        const mockPharmacies = {
          p1: { name: 'Apollo Pharmacy', ownerName: 'Alex Miller', email: 'pharmacy@mediping.ai', phone: '+1 555-0188', address: '122 Medical Square, Sector 4', location: { coordinates: [77.5946, 12.9716] }, status: 'approved', rating: 4.8, banner: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=1000', hours: '08:00 AM - 11:00 PM' },
          p2: { name: 'LifeCare Pharmacy', ownerName: 'Robert Chen', email: 'lifecare@mediping.ai', phone: '+1 555-0211', address: '45 Health Avenue, Block C', location: { coordinates: [77.5995, 12.9782] }, status: 'approved', rating: 4.5, banner: 'https://images.unsplash.com/photo-1607619056574-7b8d304b3b86?q=80&w=1000', hours: '24 Hours Open' },
          p3: { name: 'Gupta Medical Store', ownerName: 'Sanjay Gupta', email: 'guptamedical@mediping.ai', phone: '+1 555-0322', address: '89 Bazaar Street, Cross Road', location: { coordinates: [77.5898, 12.9664] }, status: 'approved', rating: 4.2, banner: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1000', hours: '09:00 AM - 09:30 PM' },
          p4: { name: 'Wellness First Pharmacy', ownerName: 'Maria Rodriguez', email: 'wellness@mediping.ai', phone: '+1 555-0433', address: '15 High Street, Metro Plaza', location: { coordinates: [77.6105, 12.9810] }, status: 'approved', rating: 4.9, banner: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1000', hours: '07:00 AM - 10:00 PM' },
          p5: { name: 'Care & Cure Chemist', ownerName: 'John Watson', email: 'carecure@mediping.ai', phone: '+1 555-0544', address: '67 Hospital Road, Opp. City General', location: { coordinates: [77.5761, 12.9592] }, status: 'approved', rating: 4.0, banner: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=1000', hours: '08:00 AM - 10:00 PM' }
        };

        const mockInventories = {
          p1: [
            { name: 'Paracetamol 650mg', quantity: 120, price: 15.0, description: 'Fever and minor pain reducer.' },
            { name: 'Ibuprofen 400mg', quantity: 50, price: 35.0, description: 'Anti-inflammatory medication.' },
            { name: 'Amoxicillin 500mg', quantity: 15, price: 120.0, description: 'Antibiotic prescription.' }
          ],
          p2: [
            { name: 'Paracetamol 650mg', quantity: 80, price: 18.0, description: 'Fever reducer.' },
            { name: 'Cetirizine 10mg', quantity: 100, price: 12.0, description: 'Allergy reliever.' }
          ]
        };

        const key = id || 'p1';
        setPharmacy(mockPharmacies[key] || mockPharmacies.p1);
        setInventory(mockInventories[key] || mockInventories.p1);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const handleReserveItem = (item) => {
    // Generate mock reservation path
    const mockReservationId = 'resv_' + Math.random().toString(36).substr(2, 9);
    navigate(`/reservation/${mockReservationId}`, {
      state: {
        mockReservation: {
          _id: mockReservationId,
          medicineName: item.name,
          quantity: 1,
          price: item.price,
          otp: Math.floor(1000 + Math.random() * 9000).toString(),
          status: 'pending',
          pickupTime: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
          pharmacyId: pharmacy
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="pt-40 sm:pt-48 text-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 text-sm">Loading pharmacy profile details...</p>
      </div>
    );
  }

  return (
    <div className="pt-40 sm:pt-48 sm:pt-36 pb-12 bg-slate-50 min-h-screen text-left">
      {/* Store Banner */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10"></div>
        <img 
          src={pharmacy.banner} 
          alt={pharmacy.name} 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute bottom-6 left-6 right-6 z-20 text-white max-w-7xl mx-auto px-6">
          <button 
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-semibold backdrop-blur-sm transition-all"
          >
            <ArrowLeft size={12} />
            <span>Go Back</span>
          </button>
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display leading-tight">{pharmacy.name}</h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">{pharmacy.address}</p>
            </div>
            
            <div className="flex items-center space-x-2 bg-white/15 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm w-fit">
              <Star size={16} className="text-amber-400 fill-amber-400" />
              <span className="font-bold text-sm">{pharmacy.rating?.toFixed(1)} Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-12 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Medicine Catalog */}
        <div className="lg:col-span-8 space-y-6">
          <div className="premium-card bg-white p-6 border border-slate-200/50">
            <h3 className="font-bold text-slate-800 text-lg font-display mb-6 flex items-center space-x-2">
              <Package size={18} className="text-slate-400" />
              <span>Available Medicines</span>
            </h3>

            {inventory.length === 0 ? (
              <div className="py-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-500 text-sm font-semibold">No medicines currently listed.</p>
                <p className="text-xs text-slate-400 mt-1">This pharmacy has not populated their digital catalog yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inventory.map((item, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm font-display truncate max-w-[170px]">{item.name}</span>
                        <span className="font-extrabold text-sm text-slate-900">${item.price?.toFixed(2)}</span>
                      </div>
                      <p className="text-slate-500 text-xs leading-relaxed mb-4">{item.description || 'Verified prescription medication.'}</p>
                    </div>

                    <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-200/50">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.quantity > 10 ? 'bg-success/10 text-success' : 'bg-warning/15 text-warning'}`}>
                        {item.quantity} In Stock
                      </span>
                      
                      <button
                        onClick={() => handleReserveItem(item)}
                        className="bg-primary hover:bg-primary-dark text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-primary/10 transition-colors"
                      >
                        Reserve Item
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer Reviews Accordion */}
          <div className="premium-card bg-white p-6 border border-slate-200/50">
            <h3 className="font-bold text-slate-800 text-base font-display mb-6 flex items-center space-x-2">
              <MessageSquare size={16} className="text-slate-400" />
              <span>Customer Reviews</span>
            </h3>

            <div className="space-y-4">
              {mockReviews.map((rev, i) => (
                <div key={i} className="pb-4 border-b border-slate-100 last:border-none last:pb-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm">{rev.name}</span>
                    <span className="text-[10px] text-slate-400">{rev.date}</span>
                  </div>
                  <div className="flex items-center text-amber-400 mb-2">
                    {[...Array(5)].map((_, idx) => (
                      <Star 
                        key={idx} 
                        size={12} 
                        className={idx < Math.floor(rev.rating) ? 'fill-amber-400' : 'text-slate-200'} 
                      />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{rev.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Store Details Contact widget */}
        <div className="lg:col-span-4 space-y-6">
          <div className="premium-card bg-white p-6 border border-slate-200/50">
            <h4 className="font-bold text-slate-800 text-sm mb-4 font-display">Store Information</h4>

            <div className="space-y-4 pt-2">
              <div className="flex items-start space-x-3 text-xs">
                <Clock size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Working Hours</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{pharmacy.hours}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <Phone size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Phone Number</span>
                  <a href={`tel:${pharmacy.phone}`} className="font-semibold text-slate-700 mt-0.5 hover:text-primary transition-colors block">
                    {pharmacy.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start space-x-3 text-xs">
                <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 uppercase">Location Address</span>
                  <p className="font-semibold text-slate-700 mt-0.5 leading-relaxed">{pharmacy.address}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
              <a 
                href={`tel:${pharmacy.phone}`}
                className="py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-150 rounded-xl text-slate-700 text-xs font-bold transition-all flex items-center justify-center space-x-1.5"
              >
                <PhoneCall size={12} />
                <span>Call Store</span>
              </a>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${pharmacy.location?.coordinates ? `${pharmacy.location.coordinates[1]},${pharmacy.location.coordinates[0]}` : '12.9782,77.5995'}`}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-primary/10"
              >
                <Navigation size={12} />
                <span>Directions</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetails;

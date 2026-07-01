const { getIsConnected } = require('../config/db');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const MedicineInventory = require('../models/MedicineInventory');
const MedicineRequest = require('../models/MedicineRequest');
const Response = require('../models/Response');
const Reservation = require('../models/Reservation');

// Helper to calculate distance in meters using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // distance in meters
}

// In-Memory Database Cache for Fallback Mode
const db = {
  users: [
    { _id: 'u1', name: 'Jane Doe', email: 'user@mediping.ai', phone: '+1 555-0199', role: 'user', createdAt: new Date() },
    { _id: 'u2', name: 'Alex Miller (Pharmacist)', email: 'pharmacy@mediping.ai', phone: '+1 555-0188', role: 'pharmacy', createdAt: new Date() },
    { _id: 'u3', name: 'Sarah Connor (Admin)', email: 'admin@mediping.ai', phone: '+1 555-0177', role: 'admin', createdAt: new Date() }
  ],
  pharmacies: [
    {
      _id: 'p1',
      name: 'Apollo Pharmacy',
      ownerName: 'Alex Miller',
      email: 'pharmacy@mediping.ai', // Matches the pharmacy login email for demo
      phone: '+1 555-0188',
      address: '122 Medical Square, Sector 4',
      location: { coordinates: [77.5946, 12.9716] }, // Bangalore Center
      status: 'approved',
      rating: 4.8,
      banner: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=600',
      hours: '08:00 AM - 11:00 PM',
      createdAt: new Date()
    },
    {
      _id: 'p2',
      name: 'LifeCare Pharmacy',
      ownerName: 'Robert Chen',
      email: 'lifecare@mediping.ai',
      phone: '+1 555-0211',
      address: '45 Health Avenue, Block C',
      location: { coordinates: [77.5995, 12.9782] }, // ~1 km away
      status: 'approved',
      rating: 4.5,
      banner: 'https://images.unsplash.com/photo-1607619056574-7b8d304b3b86?q=80&w=600',
      hours: '24 Hours Open',
      createdAt: new Date()
    },
    {
      _id: 'p3',
      name: 'Gupta Medical Store',
      ownerName: 'Sanjay Gupta',
      email: 'guptamedical@mediping.ai',
      phone: '+1 555-0322',
      address: '89 Bazaar Street, Cross Road',
      location: { coordinates: [77.5898, 12.9664] }, // ~1.2 km away
      status: 'approved',
      rating: 4.2,
      banner: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=600',
      hours: '09:00 AM - 09:30 PM',
      createdAt: new Date()
    },
    {
      _id: 'p4',
      name: 'Wellness First Pharmacy',
      ownerName: 'Maria Rodriguez',
      email: 'wellness@mediping.ai',
      phone: '+1 555-0433',
      address: '15 High Street, Metro Plaza',
      location: { coordinates: [77.6105, 12.9810] }, // ~2.5 km away
      status: 'approved',
      rating: 4.9,
      banner: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=600',
      hours: '07:00 AM - 10:00 PM',
      createdAt: new Date()
    },
    {
      _id: 'p5',
      name: 'Care & Cure Chemist',
      ownerName: 'John Watson',
      email: 'carecure@mediping.ai',
      phone: '+1 555-0544',
      address: '67 Hospital Road, Opp. City General',
      location: { coordinates: [77.5761, 12.9592] }, // ~2.8 km away
      status: 'approved',
      rating: 4.0,
      banner: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?q=80&w=600',
      hours: '08:00 AM - 10:00 PM',
      createdAt: new Date()
    },
    {
      _id: 'p6',
      name: 'City Medicos',
      ownerName: 'James Dean',
      email: 'citymedicos@mediping.ai',
      phone: '+1 555-0655',
      address: '10 Metro Ring Road',
      location: { coordinates: [77.6322, 12.9901] }, // ~5.5 km away
      status: 'pending',
      rating: 3.8,
      banner: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=600',
      hours: '09:00 AM - 09:00 PM',
      createdAt: new Date()
    }
  ],
  inventory: [
    // Apollo Pharmacy (p1)
    { _id: 'i1', pharmacyId: 'p1', name: 'Paracetamol 650mg', description: 'Pain relief and fever reducer. Take after food.', quantity: 120, price: 15.0, updatedAt: new Date() },
    { _id: 'i2', pharmacyId: 'p1', name: 'Ibuprofen 400mg', description: 'Nonsteroidal anti-inflammatory drug (NSAID).', quantity: 50, price: 35.0, updatedAt: new Date() },
    { _id: 'i3', pharmacyId: 'p1', name: 'Amoxicillin 500mg', description: 'Penicillin-class antibiotic for bacterial infections.', quantity: 15, price: 120.0, updatedAt: new Date() },
    { _id: 'i4', pharmacyId: 'p1', name: 'Metformin 500mg', description: 'Oral diabetes medicine that helps control blood sugar levels.', quantity: 300, price: 45.0, updatedAt: new Date() },
    { _id: 'i5', pharmacyId: 'p1', name: 'Cetirizine 10mg', description: 'Antihistamine that treats allergy symptoms.', quantity: 80, price: 10.0, updatedAt: new Date() },

    // LifeCare Pharmacy (p2)
    { _id: 'i6', pharmacyId: 'p2', name: 'Paracetamol 650mg', description: 'Pain relief and fever reducer.', quantity: 80, price: 18.0, updatedAt: new Date() },
    { _id: 'i7', pharmacyId: 'p2', name: 'Cetirizine 10mg', description: 'Antihistamine.', quantity: 100, price: 12.0, updatedAt: new Date() },
    { _id: 'i8', pharmacyId: 'p2', name: 'Atorvastatin 20mg', description: 'Statin medication to prevent cardiovascular disease.', quantity: 90, price: 180.0, updatedAt: new Date() },
    { _id: 'i9', pharmacyId: 'p2', name: 'Omeprazole 20mg', description: 'Proton-pump inhibitor for acid reflux/heartburn.', quantity: 140, price: 55.0, updatedAt: new Date() },

    // Gupta Medical (p3)
    { _id: 'i10', pharmacyId: 'p3', name: 'Paracetamol 650mg', description: 'Pain relief.', quantity: 0, price: 12.0, updatedAt: new Date() }, // OUT OF STOCK
    { _id: 'i11', pharmacyId: 'p3', name: 'Amoxicillin 500mg', description: 'Antibiotic.', quantity: 45, price: 110.0, updatedAt: new Date() },
    { _id: 'i12', pharmacyId: 'p3', name: 'Cetirizine 10mg', description: 'Allergy medication.', quantity: 200, price: 8.0, updatedAt: new Date() },

    // Wellness First Pharmacy (p4)
    { _id: 'i13', pharmacyId: 'p4', name: 'Paracetamol 650mg', description: 'Pain relief.', quantity: 150, price: 14.0, updatedAt: new Date() },
    { _id: 'i14', pharmacyId: 'p4', name: 'Ibuprofen 400mg', description: 'NSAID pain reliever.', quantity: 200, price: 30.0, updatedAt: new Date() },
    { _id: 'i15', pharmacyId: 'p4', name: 'Metformin 500mg', description: 'Diabetes control.', quantity: 400, price: 40.0, updatedAt: new Date() },
    { _id: 'i16', pharmacyId: 'p4', name: 'Azithromycin 500mg', description: 'Antibiotic for respiratory, skin, and ear infections.', quantity: 60, price: 150.0, updatedAt: new Date() },

    // Care & Cure Chemist (p5)
    { _id: 'i17', pharmacyId: 'p5', name: 'Paracetamol 650mg', description: 'Pain relief.', quantity: 30, price: 20.0, updatedAt: new Date() }
  ],
  requests: [],
  responses: [],
  reservations: [
    {
      _id: 'r_demo_1',
      requestId: 'req_demo',
      responseId: 'res_demo',
      userId: 'u1',
      pharmacyId: 'p2',
      medicineName: 'Paracetamol 650mg',
      quantity: 2,
      price: 18.0,
      status: 'pending',
      otp: '7892',
      pickupTime: new Date(Date.now() + 4 * 3600 * 1000), // 4 hours from now
      createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 mins ago
    },
    {
      _id: 'r_demo_2',
      requestId: 'req_demo_old',
      responseId: 'res_demo_old',
      userId: 'u1',
      pharmacyId: 'p1',
      medicineName: 'Ibuprofen 400mg',
      quantity: 1,
      price: 35.0,
      status: 'picked_up',
      otp: '1243',
      pickupTime: new Date(Date.now() - 24 * 3600 * 1000),
      createdAt: new Date(Date.now() - 25 * 3600 * 1000)
    }
  ],
  notifications: [
    { _id: 'n1', userId: 'u1', title: 'Medicine Available', message: 'Paracetamol 650mg is available at Apollo Pharmacy.', type: 'medicine_found', isRead: false, createdAt: new Date(Date.now() - 2 * 60000) },
    { _id: 'n2', userId: 'u1', title: 'Reservation Confirmed', message: 'Pickup before 5:30 PM.', type: 'reservation_confirmed', isRead: false, createdAt: new Date(Date.now() - 15 * 60000) },
    { _id: 'n3', userId: 'u1', title: 'Pharmacy Responded', message: 'MedPlus accepted your request.', type: 'pharmacy_response', isRead: true, createdAt: new Date(Date.now() - 60 * 60000) },
    { _id: 'n4', userId: 'u1', title: 'Emergency Pharmacy Found', message: '24×7 pharmacy located 800m away.', type: 'emergency_alert', isRead: false, createdAt: new Date(Date.now() - 120 * 60000) },
    { _id: 'n5', userId: 'u1', title: 'Welcome to MediPing AI', message: 'Set up your profile to get started.', type: 'system', isRead: true, createdAt: new Date(Date.now() - 86400 * 60000) },
    { _id: 'n6', userId: 'u1', title: 'Reservation Reminder', message: 'Your reservation will expire in 15 minutes.', type: 'reservation_reminder', isRead: false, createdAt: new Date(Date.now() - 5 * 60000) },
    { _id: 'n7', userId: 'u1', title: 'Medicine Available', message: 'Amoxicillin 500mg is available at LifeCare Pharmacy.', type: 'medicine_found', isRead: true, createdAt: new Date(Date.now() - 200 * 60000) },
    { _id: 'n8', userId: 'u1', title: 'Reservation Confirmed', message: 'Your reservation at Gupta Medical is confirmed.', type: 'reservation_confirmed', isRead: true, createdAt: new Date(Date.now() - 300 * 60000) },
    { _id: 'n9', userId: 'u1', title: 'System Maintenance', message: 'Scheduled maintenance this Sunday at 2 AM.', type: 'system', isRead: true, createdAt: new Date(Date.now() - 400 * 60000) },
    { _id: 'n10', userId: 'u1', title: 'Medicine Available', message: 'Cetirizine 10mg is available at City Medicos.', type: 'medicine_found', isRead: false, createdAt: new Date(Date.now() - 30 * 60000) },
    { _id: 'n11', userId: 'u1', title: 'Emergency Alert', message: 'Blood bank request near your location.', type: 'emergency_alert', isRead: true, createdAt: new Date(Date.now() - 500 * 60000) },
    { _id: 'n12', userId: 'u1', title: 'Pharmacy Responded', message: 'Care & Cure Chemist responded: Unavailable.', type: 'pharmacy_response', isRead: true, createdAt: new Date(Date.now() - 600 * 60000) }
  ]
};

// Database interface wrappers
const dbService = {
  // --- USERS ---
  async getUserByEmail(email) {
    if (getIsConnected()) {
      return await User.findOne({ email });
    }
    return db.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getUserById(id) {
    if (getIsConnected()) {
      return await User.findById(id);
    }
    return db.users.find(u => u._id === id) || null;
  },

  async createUser(userData) {
    if (getIsConnected()) {
      const user = new User(userData);
      return await user.save();
    }
    const newUser = { _id: 'u_' + Math.random().toString(36).substr(2, 9), ...userData, createdAt: new Date() };
    db.users.push(newUser);
    return newUser;
  },

  // --- PHARMACIES ---
  async getPharmacyByEmail(email) {
    if (getIsConnected()) {
      return await Pharmacy.findOne({ email });
    }
    return db.pharmacies.find(p => p.email.toLowerCase() === email.toLowerCase()) || null;
  },

  async getPharmacyById(id) {
    if (getIsConnected()) {
      return await Pharmacy.findById(id);
    }
    return db.pharmacies.find(p => p._id === id) || null;
  },

  async getPharmacies(filter = {}) {
    if (getIsConnected()) {
      return await Pharmacy.find(filter);
    }
    return db.pharmacies.filter(p => {
      for (let key in filter) {
        if (p[key] !== filter[key]) return false;
      }
      return true;
    });
  },

  async findNearbyPharmacies(lng, lat, radiusInKm = 10) {
    if (getIsConnected()) {
      return await Pharmacy.find({
        status: 'approved',
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [lng, lat] },
            $maxDistance: radiusInKm * 1000 // Convert km to meters
          }
        }
      });
    }

    // In-memory geospatial calculation
    return db.pharmacies
      .filter(p => p.status === 'approved')
      .map(p => {
        const dist = getDistance(lat, lng, p.location.coordinates[1], p.location.coordinates[0]);
        return { ...p, distance: dist }; // Add distance field in meters
      })
      .filter(p => p.distance <= radiusInKm * 1000)
      .sort((a, b) => a.distance - b.distance);
  },

  async createPharmacy(pharmacyData) {
    if (getIsConnected()) {
      const pharmacy = new Pharmacy(pharmacyData);
      return await pharmacy.save();
    }
    const newPharmacy = {
      _id: 'p_' + Math.random().toString(36).substr(2, 9),
      ...pharmacyData,
      status: 'pending_verification',
      rating: 5.0,
      createdAt: new Date()
    };
    db.pharmacies.push(newPharmacy);
    return newPharmacy;
  },

  async updatePharmacyStatus(id, status) {
    if (getIsConnected()) {
      return await Pharmacy.findByIdAndUpdate(id, { status }, { new: true });
    }
    const pharm = db.pharmacies.find(p => p._id === id);
    if (pharm) {
      pharm.status = status;
    }
    return pharm;
  },

  // --- INVENTORY ---
  async getInventoryByPharmacy(pharmacyId) {
    if (getIsConnected()) {
      return await MedicineInventory.find({ pharmacyId });
    }
    return db.inventory.filter(i => i.pharmacyId === pharmacyId);
  },

  async searchInventory(query) {
    if (getIsConnected()) {
      return await MedicineInventory.find({ name: new RegExp(query, 'i') }).populate('pharmacyId');
    }
    const lowerQuery = query.toLowerCase();
    return db.inventory
      .filter(i => i.name.toLowerCase().includes(lowerQuery))
      .map(i => {
        const pharmacy = db.pharmacies.find(p => p._id === i.pharmacyId);
        return { ...i, pharmacyId: pharmacy };
      });
  },

  async updateInventoryItem(pharmacyId, name, quantity, price, description = '') {
    if (getIsConnected()) {
      return await MedicineInventory.findOneAndUpdate(
        { pharmacyId, name },
        { quantity, price, description, updatedAt: new Date() },
        { upsert: true, new: true }
      );
    }
    let item = db.inventory.find(i => i.pharmacyId === pharmacyId && i.name.toLowerCase() === name.toLowerCase());
    if (item) {
      item.quantity = Number(quantity);
      item.price = Number(price);
      if (description) item.description = description;
      item.updatedAt = new Date();
    } else {
      item = {
        _id: 'i_' + Math.random().toString(36).substr(2, 9),
        pharmacyId,
        name,
        description,
        quantity: Number(quantity),
        price: Number(price),
        updatedAt: new Date()
      };
      db.inventory.push(item);
    }
    return item;
  },

  async deleteInventoryItem(itemId) {
    if (getIsConnected()) {
      return await MedicineInventory.findByIdAndDelete(itemId);
    }
    const idx = db.inventory.findIndex(i => i._id === itemId);
    if (idx !== -1) {
      db.inventory.splice(idx, 1);
      return true;
    }
    return false;
  },

  // --- REQUESTS ---
  async createRequest(userId, medicineName, quantity, lng, lat) {
    if (getIsConnected()) {
      const request = new MedicineRequest({
        userId,
        medicineName,
        quantity,
        location: { type: 'Point', coordinates: [lng, lat] },
        status: 'pending'
      });
      return await request.save();
    }
    const newRequest = {
      _id: 'req_' + Math.random().toString(36).substr(2, 9),
      userId,
      medicineName,
      quantity,
      location: { coordinates: [lng, lat] },
      status: 'pending',
      createdAt: new Date()
    };
    db.requests.push(newRequest);
    return newRequest;
  },

  async getRequestById(id) {
    if (getIsConnected()) {
      return await MedicineRequest.findById(id).populate('userId');
    }
    const req = db.requests.find(r => r._id === id);
    if (req) {
      const user = db.users.find(u => u._id === req.userId);
      return { ...req, userId: user };
    }
    return null;
  },

  // --- RESPONSES ---
  async createResponse(requestId, pharmacyId, status, quantity = 0, price = 0, distance = 0) {
    if (getIsConnected()) {
      const response = new Response({
        requestId,
        pharmacyId,
        status,
        quantity,
        price,
        distance
      });
      return await response.save();
    }
    const newResponse = {
      _id: 'res_' + Math.random().toString(36).substr(2, 9),
      requestId,
      pharmacyId,
      status,
      quantity,
      price,
      distance,
      createdAt: new Date()
    };
    db.responses.push(newResponse);
    return newResponse;
  },

  async getResponsesForRequest(requestId) {
    if (getIsConnected()) {
      return await Response.find({ requestId }).populate('pharmacyId');
    }
    return db.responses
      .filter(r => r.requestId === requestId)
      .map(r => {
        const pharmacy = db.pharmacies.find(p => p._id === r.pharmacyId);
        return { ...r, pharmacyId: pharmacy };
      });
  },

  // --- RESERVATIONS ---
  async createReservation(requestId, responseId, userId, pharmacyId, medicineName, quantity, price, pickupTime) {
    if (getIsConnected()) {
      const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
      const reservation = new Reservation({
        requestId,
        responseId,
        userId,
        pharmacyId,
        medicineName,
        quantity,
        price,
        otp,
        pickupTime,
        status: 'pending'
      });
      return await reservation.save();
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const newReservation = {
      _id: 'resv_' + Math.random().toString(36).substr(2, 9),
      requestId,
      responseId,
      userId,
      pharmacyId,
      medicineName,
      quantity,
      price,
      status: 'pending',
      otp,
      pickupTime: new Date(pickupTime),
      createdAt: new Date()
    };
    db.reservations.push(newReservation);
    return newReservation;
  },

  async getReservationById(id) {
    if (getIsConnected()) {
      return await Reservation.findById(id).populate('pharmacyId').populate('userId');
    }
    const resv = db.reservations.find(r => r._id === id);
    if (resv) {
      const pharmacy = db.pharmacies.find(p => p._id === resv.pharmacyId);
      const user = db.users.find(u => u._id === resv.userId);
      return { ...resv, pharmacyId: pharmacy, userId: user };
    }
    return null;
  },

  async getReservationsByUser(userId) {
    if (getIsConnected()) {
      return await Reservation.find({ userId }).populate('pharmacyId').sort({ createdAt: -1 });
    }
    return db.reservations
      .filter(r => r.userId === userId)
      .map(r => {
        const pharmacy = db.pharmacies.find(p => p._id === r.pharmacyId);
        return { ...r, pharmacyId: pharmacy };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async getReservationsByPharmacy(pharmacyId) {
    if (getIsConnected()) {
      return await Reservation.find({ pharmacyId }).populate('userId').sort({ createdAt: -1 });
    }
    return db.reservations
      .filter(r => r.pharmacyId === pharmacyId)
      .map(r => {
        const user = db.users.find(u => u._id === r.userId);
        return { ...r, userId: user };
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async updateReservationStatus(id, status) {
    if (getIsConnected()) {
      return await Reservation.findByIdAndUpdate(id, { status }, { new: true }).populate('pharmacyId').populate('userId');
    }
    const resv = db.reservations.find(r => r._id === id);
    if (resv) {
      resv.status = status;
      const pharmacy = db.pharmacies.find(p => p._id === resv.pharmacyId);
      const user = db.users.find(u => u._id === resv.userId);
      return { ...resv, pharmacyId: pharmacy, userId: user };
    }
    return null;
  },

  // --- ANALYTICS ---
  async getAdminStats() {
    // Collect counts and aggregated stats
    const totalUsers = getIsConnected() ? await User.countDocuments({ role: 'user' }) : db.users.filter(u => u.role === 'user').length;
    const totalPharmacies = getIsConnected() ? await Pharmacy.countDocuments() : db.pharmacies.length;
    const liveRequests = getIsConnected() ? await MedicineRequest.countDocuments() : db.requests.length;
    const totalReservations = getIsConnected() ? await Reservation.countDocuments() : db.reservations.length;

    return {
      totalUsers,
      totalPharmacies,
      liveRequests,
      totalReservations
    };
  }
  // --- NOTIFICATIONS ---
  async getNotificationsByUser(userId) {
    if (getIsConnected()) {
      const Notification = require('../models/Notification');
      return await Notification.find({ userId }).sort({ createdAt: -1 });
    }
    return db.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  },

  async markNotificationAsRead(id) {
    if (getIsConnected()) {
      const Notification = require('../models/Notification');
      return await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    }
    const notif = db.notifications.find(n => n._id === id);
    if (notif) notif.isRead = true;
    return notif;
  },

  async markAllNotificationsAsRead(userId) {
    if (getIsConnected()) {
      const Notification = require('../models/Notification');
      await Notification.updateMany({ userId, isRead: false }, { isRead: true });
      return true;
    }
    db.notifications.forEach(n => {
      if (n.userId === userId) n.isRead = true;
    });
    return true;
  },

  async deleteNotification(id) {
    if (getIsConnected()) {
      const Notification = require('../models/Notification');
      await Notification.findByIdAndDelete(id);
      return true;
    }
    const idx = db.notifications.findIndex(n => n._id === id);
    if (idx !== -1) {
      db.notifications.splice(idx, 1);
      return true;
    }
    return false;
  },

  async clearAllNotifications(userId) {
    if (getIsConnected()) {
      const Notification = require('../models/Notification');
      await Notification.deleteMany({ userId });
      return true;
    }
    db.notifications = db.notifications.filter(n => n.userId !== userId);
    return true;
  }
};

module.exports = dbService;

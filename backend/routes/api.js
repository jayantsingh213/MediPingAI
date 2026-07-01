const express = require('express');
const router = express.Router();
const dbService = require('../services/dbService');

// --- AUTHENTICATION ---
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Check if the user exists in our DB (in-memory or Mongoose)
    let user = await dbService.getUserByEmail(email);
    
    // For demo purposes, if user doesn't exist, auto-create them
    if (!user) {
      if (email.includes('pharmacy') || role === 'pharmacy') {
        // Find or create pharmacy profile
        let pharmacy = await dbService.getPharmacyByEmail(email);
        if (!pharmacy) {
          pharmacy = await dbService.createPharmacy({
            name: 'New Pharmacy Store',
            ownerName: 'Pharmacist Owner',
            email,
            phone: '+1 555-9999',
            address: '100 Medical Plaza, Sector 9',
            location: { coordinates: [77.5946, 12.9716] }
          });
        }
        
        user = await dbService.createUser({
          name: pharmacy.name,
          email,
          phone: pharmacy.phone,
          role: 'pharmacy'
        });
      } else if (email.includes('admin') || role === 'admin') {
        user = await dbService.createUser({
          name: 'System Administrator',
          email,
          phone: '+1 555-1111',
          role: 'admin'
        });
      } else {
        user = await dbService.createUser({
          name: email.split('@')[0],
          email,
          phone: '+1 555-2222',
          role: 'user'
        });
      }
    }

    // If pharmacy user, attach their pharmacy profile
    let pharmacyProfile = null;
    if (user.role === 'pharmacy') {
      pharmacyProfile = await dbService.getPharmacyByEmail(email);
    }

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      user,
      pharmacy: pharmacyProfile
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/auth/register-pharmacy', async (req, res) => {
  try {
    const {
      name, ownerName, email, phone, password, address, coordinates,
      addressDetails, gstNumber, drugLicense, registrationNumber,
      yearsOfOperation, logoUrl, businessHours, emergencyContact,
      homeDelivery, service24x7, documents
    } = req.body;
    
    // Check duplicate
    const existing = await dbService.getPharmacyByEmail(email);
    if (existing) {
      return res.status(400).json({ success: false, message: 'Pharmacy email already registered' });
    }

    const newPharm = await dbService.createPharmacy({
      name,
      ownerName,
      email,
      phone,
      password,
      address,
      addressDetails,
      gstNumber,
      drugLicense,
      registrationNumber,
      yearsOfOperation: Number(yearsOfOperation) || 0,
      logoUrl,
      businessHours,
      emergencyContact,
      homeDelivery: Boolean(homeDelivery),
      service24x7: Boolean(service24x7),
      documents,
      location: { coordinates: coordinates || [77.5946, 12.9716] }
    });

    return res.status(201).json({
      success: true,
      message: 'Registration submitted. Awaiting Admin verification.',
      pharmacy: newPharm
    });
  } catch (err) {
    console.error('Pharmacy register error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// --- PHARMACIES & INVENTORY ---
router.get('/pharmacies', async (req, res) => {
  try {
    const list = await dbService.getPharmacies();
    return res.json({ success: true, pharmacies: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/pharmacies/:id', async (req, res) => {
  try {
    const pharmacy = await dbService.getPharmacyById(req.params.id);
    if (!pharmacy) return res.status(404).json({ success: false, message: 'Pharmacy not found' });
    
    const inventory = await dbService.getInventoryByPharmacy(req.params.id);
    return res.json({ success: true, pharmacy, inventory });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/pharmacy/:id/inventory', async (req, res) => {
  try {
    const list = await dbService.getInventoryByPharmacy(req.params.id);
    return res.json({ success: true, inventory: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/pharmacy/:id/inventory', async (req, res) => {
  try {
    const { name, quantity, price, description } = req.body;
    const item = await dbService.updateInventoryItem(req.params.id, name, quantity, price, description);
    return res.json({ success: true, message: 'Inventory updated successfully', item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/pharmacy/inventory/:itemId', async (req, res) => {
  try {
    await dbService.deleteInventoryItem(req.params.itemId);
    return res.json({ success: true, message: 'Item deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- RESERVATIONS ---
router.post('/reservations', async (req, res) => {
  try {
    const { requestId, responseId, userId, pharmacyId, medicineName, quantity, price, pickupTime } = req.body;
    
    // Check stock availability
    const inventory = await dbService.getInventoryByPharmacy(pharmacyId);
    const item = inventory.find(i => i.name.toLowerCase() === medicineName.toLowerCase());
    
    if (item && item.quantity < quantity) {
      return res.status(400).json({ success: false, message: `Insufficient stock. Only ${item.quantity} available.` });
    }

    // Deduct stock if item exists
    if (item) {
      await dbService.updateInventoryItem(pharmacyId, item.name, item.quantity - quantity, item.price, item.description);
    }

    // Create reservation
    const reservation = await dbService.createReservation(
      requestId,
      responseId,
      userId,
      pharmacyId,
      medicineName,
      quantity,
      price,
      pickupTime || new Date(Date.now() + 6 * 3600 * 1000) // Default 6 hours pickup window
    );

    return res.status(201).json({
      success: true,
      message: 'Reservation created successfully! Show QR code at pickup.',
      reservation
    });
  } catch (err) {
    console.error('Reservation error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/reservations/user/:userId', async (req, res) => {
  try {
    const list = await dbService.getReservationsByUser(req.userId || req.params.userId);
    return res.json({ success: true, reservations: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/reservations/pharmacy/:pharmacyId', async (req, res) => {
  try {
    const list = await dbService.getReservationsByPharmacy(req.params.pharmacyId);
    return res.json({ success: true, reservations: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/reservations/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'picked_up' or 'cancelled'
    
    const reservation = await dbService.getReservationById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    // If reservation is cancelled, refund stock
    if (status === 'cancelled' && reservation.status !== 'cancelled') {
      const inventory = await dbService.getInventoryByPharmacy(reservation.pharmacyId._id || reservation.pharmacyId);
      const item = inventory.find(i => i.name.toLowerCase() === reservation.medicineName.toLowerCase());
      if (item) {
        await dbService.updateInventoryItem(
          reservation.pharmacyId._id || reservation.pharmacyId,
          item.name,
          item.quantity + reservation.quantity,
          item.price,
          item.description
        );
      }
    }

    const updated = await dbService.updateReservationStatus(req.params.id, status);
    return res.json({ success: true, message: `Reservation status updated to ${status}`, reservation: updated });
  } catch (err) {
    console.error('Update reservation status error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- ADMIN CONTROLS ---
router.get('/admin/stats', async (req, res) => {
  try {
    const stats = await dbService.getAdminStats();
    
    // Add charts mock data for admin analytics
    const responseTimes = [
      { name: '0-1 Min', count: 45 },
      { name: '1-3 Min', count: 32 },
      { name: '3-5 Min', count: 18 },
      { name: '5+ Min', count: 5 }
    ];

    const searchedMedicines = [
      { name: 'Paracetamol 650mg', searches: 342 },
      { name: 'Ibuprofen 400mg', searches: 189 },
      { name: 'Cetirizine 10mg', searches: 145 },
      { name: 'Metformin 500mg', searches: 98 },
      { name: 'Azithromycin 500mg', searches: 76 }
    ];

    const userGrowth = [
      { month: 'Jan', users: 120 },
      { month: 'Feb', users: 180 },
      { month: 'Mar', users: 290 },
      { month: 'Apr', users: 430 },
      { month: 'May', users: 650 },
      { month: 'Jun', users: 890 }
    ];

    return res.json({
      success: true,
      stats: {
        ...stats,
        responseTimes,
        searchedMedicines,
        userGrowth
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/admin/pharmacies/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // 'approved' or 'suspended'
    const updated = await dbService.updatePharmacyStatus(req.params.id, status);
    return res.json({ success: true, message: `Pharmacy status updated to ${status}`, pharmacy: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- NOTIFICATIONS ---
router.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const notifications = await dbService.getNotificationsByUser(req.user.id);
    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/notifications/read/:id', authenticateToken, async (req, res) => {
  try {
    await dbService.markNotificationAsRead(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.patch('/notifications/read-all', authenticateToken, async (req, res) => {
  try {
    await dbService.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/notifications/clear', authenticateToken, async (req, res) => {
  try {
    await dbService.clearAllNotifications(req.user.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/notifications/:id', authenticateToken, async (req, res) => {
  try {
    await dbService.deleteNotification(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

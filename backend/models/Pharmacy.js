const mongoose = require('mongoose');

const PharmacySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ownerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    // Note: In a real app this should be hashed and probably in User schema.
    // For this demo, we'll keep it simple or store it here if needed, 
    // but the User model might be better. We'll add it here for the payload.
  },
  address: {
    type: String,
    required: true,
  },
  addressDetails: {
    street: String,
    city: String,
    state: String,
    pinCode: String,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  gstNumber: String,
  drugLicense: String,
  registrationNumber: String,
  yearsOfOperation: Number,
  logoUrl: String, // Store base64 or url
  businessHours: {
    openingTime: String,
    closingTime: String,
    holidays: [String],
  },
  emergencyContact: String,
  homeDelivery: {
    type: Boolean,
    default: false,
  },
  service24x7: {
    type: Boolean,
    default: false,
  },
  documents: {
    drugLicenseFile: String,
    ownerIdFile: String,
    pharmacyImages: [String],
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'suspended', 'pending_verification'],
    default: 'pending_verification',
  },
  rating: {
    type: Number,
    default: 5.0,
  },
  banner: {
    type: String,
    default: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=1000',
  },
  hours: {
    type: String,
    default: '08:00 AM - 10:00 PM',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Setup 2dsphere index for geolocation queries
PharmacySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pharmacy', PharmacySchema);

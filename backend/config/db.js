const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (process.env.MONGO_URI) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      isConnected = true;
      console.log('🟢 MongoDB Atlas Connected Successfully...');
    } catch (err) {
      console.error('🔴 MongoDB Connection Error:', err.message);
      console.log('⚠️ Falling back to high-fidelity In-Memory database.');
    }
  } else {
    console.log('ℹ️ No MONGO_URI environment variable detected. Using premium In-Memory Database Fallback with rich demo datasets.');
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');
const apiRoutes = require('./routes/api');
const socketHandler = require('./sockets/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow connections from all origins for easy local/deployment access
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Boot Database (fails gracefully to high-fidelity In-Memory engine)
connectDB();

// Setup Middleware
app.use(cors());
app.use(express.json());

// Bind API Routes
app.use('/api', apiRoutes);

// Bind Socket.io Event Handlers
socketHandler(io);

// Root Ping Route
app.get('/', (req, res) => {
  res.json({
    name: 'MediPing AI Server API',
    status: 'online',
    version: '1.0.0',
    timestamp: new Date()
  });
});

// Startup Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 MediPing AI Server running on port ${PORT}`);
  console.log(`📡 Websockets listening for connections`);
});

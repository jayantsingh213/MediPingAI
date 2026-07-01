const dbService = require('../services/dbService');
const { runSearchSimulation } = require('../services/simulations');

// Track active socket connections for pharmacy users to route live requests to them
const activePharmacies = new Map(); // pharmacyId -> socketId

function socketHandler(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // 1. Join Request Room (Users and Pharmacies join a room dedicated to the Request ID)
    socket.on('join_request_room', ({ requestId }) => {
      socket.join(requestId);
      console.log(`👤 Client ${socket.id} joined request room: ${requestId}`);
    });

    // 2. Register Pharmacy connection
    socket.on('register_pharmacy', ({ pharmacyId }) => {
      activePharmacies.set(pharmacyId, socket.id);
      socket.join('pharmacy_broadcast_room');
      console.log(`🏥 Pharmacy registered: ${pharmacyId} on socket ${socket.id}`);
    });

    // 3. User Initiates Search
    socket.on('search_medicine', async ({ userId, medicineName, quantity, coordinates }) => {
      try {
        console.log(`🔍 Search request from user ${userId}: ${medicineName} (${quantity} units)`);
        
        // Ensure coordinates are valid [longitude, latitude]
        const lng = coordinates ? coordinates[0] : 77.5946;
        const lat = coordinates ? coordinates[1] : 12.9716;

        // Save request to database
        const request = await dbService.createRequest(userId, medicineName, quantity, lng, lat);
        
        // Join the searching user's socket to the request room
        socket.join(request._id);
        
        // Confirm request creation
        socket.emit('request_created', { requestId: request._id, request });

        // Identify nearby pharmacies (within 10km)
        const nearbyPharmacies = await dbService.findNearbyPharmacies(lng, lat, 10);
        
        // Broadcast "incoming_request" to any active physical pharmacy sockets
        nearbyPharmacies.forEach(pharm => {
          const socketId = activePharmacies.get(pharm._id.toString());
          if (socketId) {
            io.to(socketId).emit('incoming_request', {
              requestId: request._id,
              medicineName,
              quantity,
              distance: pharm.distance,
              coordinates
            });
            console.log(`📲 Dispatched live request to connected pharmacy: ${pharm.name}`);
          }
        });

        // Trigger simulation engine to mock responses for pharmacies
        // The simulation will handle all pharmacies, but we skip simulated responses
        // for any pharmacy that sends a live reply.
        runSearchSimulation(request._id, medicineName, quantity, [lng, lat], io);

      } catch (err) {
        console.error('❌ Error handling search_medicine:', err);
        socket.emit('error', { message: 'Failed to initiate search' });
      }
    });

    // 4. Pharmacy Dashboard Live Response
    socket.on('submit_pharmacy_response', async ({ requestId, pharmacyId, status, quantity, price, distance }) => {
      try {
        console.log(`🏥 Live response from pharmacy ${pharmacyId}: status=${status}, qty=${quantity}, price=${price}`);
        
        // Save the pharmacy's response to database
        const responseRecord = await dbService.createResponse(
          requestId,
          pharmacyId,
          status,
          quantity,
          price,
          distance || 1000
        );

        // Fetch full pharmacy details to attach to response
        const pharmacy = await dbService.getPharmacyById(pharmacyId);

        // Broadcast to the user room
        io.to(requestId).emit('live_response', {
          ...responseRecord,
          pharmacyId: pharmacy
        });

        // Trigger an update to the search status
        const allResponses = await dbService.getResponsesForRequest(requestId);
        io.to(requestId).emit('search_status', {
          responsesReceived: allResponses.length,
          completed: false // Keep it updating
        });

      } catch (err) {
        console.error('❌ Error handling pharmacy response:', err);
      }
    });

    // 5. Cleanup on Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      // Remove pharmacy registration if applicable
      for (let [pharmId, sockId] of activePharmacies.entries()) {
        if (sockId === socket.id) {
          activePharmacies.delete(pharmId);
          console.log(`🏥 Pharmacy ${pharmId} unregistered due to disconnect`);
          break;
        }
      }
    });
  });
}

module.exports = socketHandler;

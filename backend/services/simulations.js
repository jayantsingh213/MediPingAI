const dbService = require('./dbService');

/**
 * Simulates real-time pharmacy responses for a search request
 * @param {string} requestId - The ID of the search request
 * @param {string} medicineName - Name of the medicine searched
 * @param {number} quantity - Quantity requested
 * @param {Array<number>} coordinates - User's coordinates [longitude, latitude]
 * @param {Object} io - Socket.io server instance
 */
function runSearchSimulation(requestId, medicineName, quantity, coordinates, io) {
  // 1. Find pharmacies nearby (using our dbService)
  dbService.findNearbyPharmacies(coordinates[0], coordinates[1], 10)
    .then(pharmacies => {
      // If no pharmacies found, fetch all approved
      if (pharmacies.length === 0) {
        return dbService.getPharmacies({ status: 'approved' });
      }
      return pharmacies;
    })
    .then(pharmacies => {
      console.log(`[Simulator] Starting response simulation for request ${requestId} (${medicineName}) across ${pharmacies.length} pharmacies.`);
      
      // Notify the frontend of the total pharmacies being searched
      io.to(requestId).emit('search_status', {
        totalPharmacies: pharmacies.length,
        responsesReceived: 0,
        completed: false
      });

      let responsesReceived = 0;

      pharmacies.forEach((pharmacy, index) => {
        // Calculate distance if not already set by nearby query
        const distance = pharmacy.distance || Math.floor(500 + Math.random() * 5000);
        
        // Stagger the responses to simulate real-world delays (1s to 5s)
        const delay = 800 + (index * 800) + (Math.random() * 500);

        setTimeout(async () => {
          try {
            // Check pharmacy inventory for the item
            const inventory = await dbService.getInventoryByPharmacy(pharmacy._id);
            const item = inventory.find(i => i.name.toLowerCase().includes(medicineName.toLowerCase()));

            let status = 'unavailable';
            let availableQty = 0;
            let price = 0;

            if (item && item.quantity > 0) {
              status = 'available';
              availableQty = item.quantity;
              price = item.price;
            } else if (!item) {
              // For arbitrary search terms not in our pre-loaded list,
              // let's randomize to keep the demo dynamic and engaging!
              const randomFactor = Math.random();
              if (randomFactor > 0.4) {
                status = 'available';
                availableQty = Math.floor(5 + Math.random() * 40);
                price = Math.floor(10 + Math.random() * 200);
              } else if (randomFactor > 0.15) {
                status = 'unavailable';
              } else {
                status = 'checking'; // Will stay in checking state longer or fail
              }
            }

            // If the status is "checking", we simulate a pharmacy that takes longer to respond
            if (status === 'checking') {
              // Notify client we are checking this pharmacy
              io.to(requestId).emit('live_response', {
                requestId,
                pharmacyId: pharmacy,
                status: 'checking',
                quantity: 0,
                price: 0,
                distance
              });

              // Resolve checking state after another 2 seconds
              setTimeout(async () => {
                const finalStatus = Math.random() > 0.5 ? 'available' : 'unavailable';
                const finalQty = finalStatus === 'available' ? Math.floor(10 + Math.random() * 30) : 0;
                const finalPrice = finalStatus === 'available' ? Math.floor(15 + Math.random() * 50) : 0;

                const responseRecord = await dbService.createResponse(
                  requestId,
                  pharmacy._id,
                  finalStatus,
                  finalQty,
                  finalPrice,
                  distance
                );

                responsesReceived++;
                io.to(requestId).emit('live_response', {
                  ...responseRecord,
                  pharmacyId: pharmacy
                });

                io.to(requestId).emit('search_status', {
                  totalPharmacies: pharmacies.length,
                  responsesReceived,
                  completed: responsesReceived === pharmacies.length
                });
              }, 2000);

            } else {
              // Direct available/unavailable response
              const responseRecord = await dbService.createResponse(
                requestId,
                pharmacy._id,
                status,
                availableQty,
                price,
                distance
              );

              responsesReceived++;
              
              // Broadcast this response to the specific request room
              io.to(requestId).emit('live_response', {
                ...responseRecord,
                pharmacyId: pharmacy
              });

              // Broadcast status update
              io.to(requestId).emit('search_status', {
                totalPharmacies: pharmacies.length,
                responsesReceived,
                completed: responsesReceived === pharmacies.length
              });
            }
          } catch (err) {
            console.error('[Simulator] Error in simulation step:', err);
          }
        }, delay);
      });
    })
    .catch(err => {
      console.error('[Simulator] Global error in search simulation:', err);
    });
}

module.exports = { runSearchSimulation };

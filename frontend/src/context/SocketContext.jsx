import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, pharmacy } = useAuth();

  useEffect(() => {
    // Connect to backend socket server
    const socketUrl = import.meta.env.PROD ? undefined : 'http://localhost:5000';
    const socketInstance = io(socketUrl, {
      autoConnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('🔌 Socket connected to backend:', socketInstance.id);
      setIsConnected(true);
      
      // If user is a pharmacy, register with backend so we can receive notifications
      if (user && user.role === 'pharmacy' && pharmacy) {
        socketInstance.emit('register_pharmacy', { pharmacyId: pharmacy._id });
        console.log(`🏥 Pharmacy registered with socket: ${pharmacy.name} (${pharmacy._id})`);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('🔌 Socket disconnected from backend');
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [user, pharmacy]);

  // Re-emit registration if user status updates on active socket
  useEffect(() => {
    if (socket && isConnected && user?.role === 'pharmacy' && pharmacy) {
      socket.emit('register_pharmacy', { pharmacyId: pharmacy._id });
      console.log(`🏥 Pharmacy registered with socket on change: ${pharmacy.name}`);
    }
  }, [socket, isConnected, user, pharmacy]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

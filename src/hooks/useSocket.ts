// React Hook for Socket.IO Connection Management
// Handles authentication, connection lifecycle, and room management

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import config from '../lib/config';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface UseSocketOptions {
  locationId?: string;
  autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
  const { locationId, autoConnect = true } = options;
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    // Get JWT token from localStorage (using the same key as authService)
    const token = localStorage.getItem(config.storageKeys.accessToken);

    if (!token) {
      console.warn('⚠️ No auth token found, skipping socket connection');
      console.warn('⚠️ Checked storage key:', config.storageKeys.accessToken);
      console.warn('⚠️ Available keys:', Object.keys(localStorage));
      setError('No authentication token');
      return;
    }

    console.log('✅ Token found, length:', token.length);

    console.log('🔌 Initializing Socket.IO connection to:', SOCKET_URL);

    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      forceNew: true, // Force new connection
      withCredentials: true, // Include credentials
    });

    socketRef.current = socket;
    setSocket(socket);

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      console.log('🔗 Socket transport:', socket.io.engine.transport.name);
      setIsConnected(true);
      setError(null);

      // Join location room if provided
      if (locationId) {
        console.log(`📍 Joining location: ${locationId}`);
        socket.emit('join-location', locationId);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setIsConnected(false);
      setSocket(null);
      socketRef.current = null;
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        type: err.type,
        description: err.description,
      });
      setIsConnected(false);
      setError(err.message);
    });

    socket.on('error', (err) => {
      console.error('❌ Socket error:', err);
      setError(err.message || 'Socket error occurred');
    });

    socket.on('joined-location', (data) => {
      console.log('✅ Joined location:', data.locationId);
    });

    socket.on('joined-kitchen', (data) => {
      console.log('✅ Joined kitchen:', data.locationId);
    });

    // Rejoin location if locationId changes after connection
    if (locationId && socket.connected) {
      console.log(`📍 Re-joining location: ${locationId}`);
      socket.emit('join-location', locationId);
    }

    // Cleanup on unmount
    return () => {
      console.log('🔌 Cleaning up socket connection');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('error');
      socket.off('joined-location');
      socket.off('joined-kitchen');
      if (socket.connected) {
        socket.disconnect();
      }
      setSocket(null);
      socketRef.current = null;
    };
  }, [locationId, autoConnect]);

  // Helper functions
  const joinLocation = (locId: string) => {
    if (socket?.connected) {
      console.log(`📍 Joining location room: ${locId}`);
      socket.emit('join-location', locId);
    } else {
      console.warn('⚠️ Cannot join location: socket not connected');
    }
  };

  const leaveLocation = (locId: string) => {
    if (socket?.connected) {
      console.log(`📍 Leaving location room: ${locId}`);
      socket.emit('leave-location', locId);
    }
  };

  const joinKitchen = (locId: string) => {
    if (socket?.connected) {
      console.log(`🍳 Joining kitchen room: ${locId}`);
      socket.emit('join-kitchen', locId);
    } else {
      console.warn('⚠️ Cannot join kitchen: socket not connected');
    }
  };

  const leaveKitchen = (locId: string) => {
    if (socket?.connected) {
      console.log(`🍳 Leaving kitchen room: ${locId}`);
      socket.emit('leave-kitchen', locId);
    }
  };

  return {
    socket,
    isConnected,
    error,
    joinLocation,
    leaveLocation,
    joinKitchen,
    leaveKitchen,
  };
}


import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';

export interface ProjectionUpdate {
  type: 'projection_recalculated' | 'projection_calculation_error';
  eventType: 'payment' | 'skip';
  eventData: any;
  projections: {
    paymentSchedule: any[];
    monthsToPayoff: number;
    totalInterestPaid: number;
    totalPaid: number;
    strategy: 'avalanche' | 'snowball';
    lastUpdated: Date;
  };
  timestamp: Date;
}

export interface SocketData {
  connected: boolean;
  projectionUpdate: ProjectionUpdate | null;
  error: string | null;
}

const useSocket = (userId: string | null) => {
  const socketRef = useRef<any>(null);
  const [socketData, setSocketData] = useState<SocketData>({
    connected: false,
    projectionUpdate: null,
    error: null
  });

  useEffect(() => {
    if (!userId) return;

    console.log('🔌 Connecting to Socket.io server...');

    // Initialize socket connection
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
      timeout: 5000
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setSocketData(prev => ({ ...prev, connected: true, error: null }));
      
      // Join user-specific room
      socket.emit('join_room', userId);
      console.log(`🏠 Joined room: ${userId}`);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ Socket disconnected:', reason);
      setSocketData(prev => ({ ...prev, connected: false }));
    });

    socket.on('connect_error', (error: Error) => {
      console.error('🚨 Socket connection error:', error);
      setSocketData(prev => ({ ...prev, error: error.message, connected: false }));
    });

    // Projection update events
    socket.on('projection_update', (data: ProjectionUpdate) => {
      console.log('📊 Received projection update:', data);
      setSocketData(prev => ({
        ...prev,
        projectionUpdate: data,
        error: null
      }));
    });

    socket.on('projection_error', (errorData: any) => {
      console.error('🚨 Projection calculation error:', errorData);
      setSocketData(prev => ({
        ...prev,
        error: errorData.error,
        projectionUpdate: null
      }));
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (socket) {
        socket.disconnect();
      }
    };
  }, [userId]);

  // Method to clear the projection update after it's been processed
  const clearProjectionUpdate = () => {
    setSocketData(prev => ({ ...prev, projectionUpdate: null }));
  };

  // Method to manually reconnect
  const reconnect = () => {
    if (socketRef.current) {
      socketRef.current.connect();
    }
  };

  return {
    ...socketData,
    clearProjectionUpdate,
    reconnect
  };
};

export default useSocket;
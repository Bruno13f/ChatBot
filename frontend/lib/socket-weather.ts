import { io, Socket } from 'socket.io-client';

// Socket instance cache
let socketInstance: Socket | null = null;

// Create a singleton socket instance
export const getWeatherSocket = (): Socket => {
  if (!socketInstance) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_WEATHER_URI || 'http://localhost:4001';
    
    socketInstance = io(SOCKET_URL, {
      reconnectionDelayMax: 10000,
      withCredentials: true,
    });
    
    socketInstance.on('connect', () => {
      console.log('Connected to weather socket server');
    });
    
    socketInstance.on('disconnect', () => {
      console.log('Disconnected from weather socket server');
    });
    
    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });
  }
  
  return socketInstance;
};

// Clean up function to call when component unmounts
export const disconnectWeatherSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}; 
import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export const initMiddlewareSocket = (): Socket => {
  if (!socketInstance) {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_MIDDLEWARE_URI || 'http://localhost:8000';

    socketInstance = io(SOCKET_URL, {
      reconnectionDelayMax: 10000,
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      console.log('Connected to middleware socket server');
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from middleware socket server');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });
  }

  return socketInstance;
};

export const getMiddlewareSocket = (): Socket | null => socketInstance;

export const disconnectMiddlewareSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
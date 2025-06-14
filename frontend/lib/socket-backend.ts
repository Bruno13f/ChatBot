import { io, Socket } from "socket.io-client";
import { Message } from "@/models/message";

let socketInstance: Socket | null = null;

export const initBackendSocket = (
  userId: string,
  groupId: string,
  onNewMessage: (message: any) => void
): Socket => {
  if (!socketInstance) {
    const SOCKET_URL =
      process.env.NEXT_PUBLIC_BACKEND_SOCKET_URI || "http://localhost:9000";
    socketInstance = io(SOCKET_URL, {
      reconnectionDelayMax: 10000,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to backend socket server");
      socketInstance?.emit("identify", userId);
      if (groupId) {
        socketInstance?.emit("joinGroup", groupId);
      }
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from backend socket server");
    });

    socketInstance.on("connect_error", (err) => {
      console.error("Backend socket connection error:", err);
    });
  } else {
    // If already connected, just join the new group
    socketInstance.emit("joinGroup", groupId);
  }

  socketInstance.off("newMessage");
  socketInstance.on("newMessage", (message) => {
    console.log("newMessage (backend): ", message);
    onNewMessage(message);
  });

  return socketInstance;
};

export const getBackendSocket = (): Socket | null => socketInstance;

export const leaveBackendGroup = (groupId: string) => {
  if (socketInstance) {
    socketInstance.emit("leaveGroup", groupId);
  }
};

export const disconnectBackendSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

// New function to join multiple groups at once
export const joinMultipleGroups = (groupIds: string[]) => {
  if (socketInstance) {
    groupIds.forEach(groupId => {
      socketInstance?.emit("joinGroup", groupId);
    });
  }
};

// New function to leave multiple groups at once
export const leaveMultipleGroups = (groupIds: string[]) => {
  if (socketInstance) {
    groupIds.forEach(groupId => {
      socketInstance?.emit("leaveGroup", groupId);
    });
  }
};

// New function to update socket instance with new user ID
export const updateSocketUserId = (newUserId: string) => {
  if (socketInstance) {
    socketInstance.emit("identify", newUserId);
  }
};

// New function to check socket connection status
export const isSocketConnected = (): boolean => {
  return socketInstance?.connected || false;
};

// New function to reconnect socket if disconnected
export const reconnectSocket = () => {
  if (socketInstance && !socketInstance.connected) {
    socketInstance.connect();
  }
};

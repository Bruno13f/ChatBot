import { io, Socket } from "socket.io-client";
import { Message } from "@/models/message";

let socket: Socket | null = null;

export function initBackendSocket(userId: string, groupId: string, onConnect: () => void): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000");
    
    socket.on("connect", () => {
      console.log("[SOCKET] Connected to backend");
      socket?.emit("identify", userId);
      if (groupId) {
        socket?.emit("joinGroup", groupId);
      }
      onConnect();
    });

    socket.on("disconnect", () => {
      console.log("[SOCKET] Disconnected from backend");
    });

    socket.on("error", (error) => {
      console.error("[SOCKET] Error:", error);
    });
  } else if (groupId) {
    // If socket exists but we need to join a new group
    socket.emit("joinGroup", groupId);
  }

  return socket;
}

export function getBackendSocket(): Socket | null {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function leaveBackendGroup(groupId: string) {
  if (socket) {
    socket.emit("leaveGroup", groupId);
  }
}

// New function to join multiple groups at once
export const joinMultipleGroups = (groupIds: string[]) => {
  if (socket) {
    groupIds.forEach(groupId => {
      socket?.emit("joinGroup", groupId);
    });
  }
};

// New function to leave multiple groups at once
export const leaveMultipleGroups = (groupIds: string[]) => {
  if (socket) {
    groupIds.forEach(groupId => {
      socket?.emit("leaveGroup", groupId);
    });
  }
};

// New function to update socket instance with new user ID
export const updateSocketUserId = (newUserId: string) => {
  if (socket) {
    socket.emit("identify", newUserId);
  }
};

// New function to check socket connection status
export const isSocketConnected = (): boolean => {
  return socket?.connected || false;
};

// New function to reconnect socket if disconnected
export const reconnectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

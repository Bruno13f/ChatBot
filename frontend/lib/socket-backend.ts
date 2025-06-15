import { io, Socket } from "socket.io-client";

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
      path: "/socket-backend",
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

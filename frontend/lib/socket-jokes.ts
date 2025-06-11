import { io, Socket } from "socket.io-client";

// Socket instance cache
let socketInstance: Socket | null = null;

// Create a singleton socket instance
export const getJokeSocket = (): Socket => {
  if (!socketInstance) {
    console.log(
      "NEXT_PUBLIC_SOCKET_JOKES_URI",
      process.env.NEXT_PUBLIC_SOCKET_JOKES_URI
    );

    socketInstance = io("/", {
      path: "/socket-jokes/socket.io",
      reconnectionDelayMax: 10000,
      withCredentials: true,
    });

    socketInstance.on("connect", () => {
      console.log("Connected to jokes socket server");
    });

    socketInstance.on("disconnect", () => {
      console.log("Disconnected from jokes socket server");
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      console.log("Transport URL:", (socketInstance as any).io.uri);
      console.log("Engine transport options:", (socketInstance as any).io.opts);
    });
  }

  return socketInstance;
};

// Clean up function to call when component unmounts
export const disconnectJokeSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

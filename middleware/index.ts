import { Server } from "socket.io";
import { createServer } from "http";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}. Total clients: ${io.engine.clientsCount}`);

  socket.on("disconnect", () => {
    // Subtract 1 from the count since the client is about to disconnect
    console.log(`Client disconnected: ${socket.id}. Total clients: ${io.engine.clientsCount}`);
  });

  // Handle incoming messages
  socket.on("message", (message) => {
    // Broadcast to all clients except sender
    socket.broadcast.emit("message", message);
  });
});

const port = 8000;
httpServer.listen(port, () => {
  console.log(`Socket.IO server started on http://localhost:${port}`);
});
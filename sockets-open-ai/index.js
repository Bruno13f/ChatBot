require("dotenv").config({ path: ".env" });
const http = require("http");
const { Server } = require("socket.io");
const https = require("https");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap",
};

const geocoder = NodeGeocoder(options);

// Create HTTP server
const server = http.createServer();

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URI || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Handle errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Start the server
const PORT = process.env.SOCKET_WEATHER_PORT || 4002;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server for weather is running on port ${PORT}`);
});

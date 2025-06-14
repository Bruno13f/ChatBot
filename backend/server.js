require("dotenv").config({ path: ".env" });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const http = require("http");
const { Server } = require("socket.io");

const routes = require("./routes/routes");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
});

// Map userId to socket
const userSockets = new Map();

io.on("connection", (socket) => {
  // Listen for user identification
  socket.on("identify", (userId) => {
    userSockets.set(userId, socket.id);
    socket.userId = userId;
  });

  // Join group room
  socket.on("joinGroup", (groupId) => {
    console.log(`User ${socket.userId} joined group ${groupId}`);
    socket.join(`group_${groupId}`);
  });

  // Leave group room
  socket.on("leaveGroup", (groupId) => {
    console.log(`User ${socket.userId} left group ${groupId}`);
    socket.leave(`group_${groupId}`);
  });

  socket.on("disconnect", () => {
    console.log(`User ${socket.userId} disconnected`);
    if (socket.userId) userSockets.delete(socket.userId);
  });
});

app.set("io", io); // So controllers can access io

// CONDITIONAL JSON PARSING - only for non-multipart requests
app.use((req, res, next) => {
  const contentType = req.get("Content-Type") || "";

  if (contentType.includes("multipart/form-data")) {
    console.log("📁 Multipart request detected, skipping JSON parser");
    next();
  } else {
    console.log("📄 Non-multipart request, applying JSON parser");
    express.json()(req, res, next);
  }
});

// Allow all CORS
app.use(cors());

app.use(express.static("public"));

connectDB();

app.get("/", (req, res) => {
  res.send("API is up 🚀");
});

app.use("/api", routes);

// Global error handler
app.use((error, req, res, next) => {
  console.error("❌ Global error handler:", error.message);

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }

  if (error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ message: "File too large" });
  }

  if (error.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({ message: "Unexpected file field" });
  }

  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.BACKEND_PORT || 9000;
server.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}/api`)
);

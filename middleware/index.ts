import { Server, Socket } from "socket.io";
import { createServer } from "http";

// Registry to store socket connections and their commands
interface SocketRegistry {
  [command: string]: {
    socketId: string;
    socket: Socket;
  };
}

const socketRegistry: SocketRegistry = {};

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Keep track of service sockets vs frontend clients
const serviceSockets = new Set<string>();

io.on("connection", (socket) => {
  console.log(`Client connected: ${socket.id}. Total clients: ${io.engine.clientsCount}`);

  // Handle socket registration (only for service sockets)
  socket.on("register", (commands: string[]) => {
    console.log(`Service socket ${socket.id} registering commands:`, commands);
    
    // Mark this socket as a service socket
    serviceSockets.add(socket.id);
    
    commands.forEach(command => {
      // Remove any existing registration for this command
      if (socketRegistry[command]) {
        console.log(`Command ${command} already registered by ${socketRegistry[command].socketId}, updating to ${socket.id}`);
      }
      
      // Register the new command
      socketRegistry[command] = {
        socketId: socket.id,
        socket: socket
      };
    });
    
    console.log("Current registry:", Object.keys(socketRegistry));
  });

  socket.on("disconnect", () => {
    // Remove all registrations for this socket if it was a service socket
    if (serviceSockets.has(socket.id)) {
      Object.entries(socketRegistry).forEach(([command, data]) => {
        if (data.socketId === socket.id) {
          delete socketRegistry[command];
          console.log(`Removed registration for command ${command}`);
        }
      });
      serviceSockets.delete(socket.id);
    }
    
    console.log(`Client disconnected: ${socket.id}. Total clients: ${io.engine.clientsCount}`);
  });

  // Handle incoming messages
  socket.on("message", (message) => {
    console.log("Received message:", message);

    // Only process messages that start with a command
    if (!message.text.startsWith("!")) {
      return;
    }

    const command = message.text.split(" ")[0].toLowerCase();
    const args = message.text.split(" ").slice(1);

    // Check if command is registered
    if (socketRegistry[command]) {
      console.log(`Routing command ${command} to service socket ${socketRegistry[command].socketId}`);
      
      // Forward the message to the appropriate service socket
      socketRegistry[command].socket.emit("process_command", {
        command,
        args,
        originalMessage: {
          ...message,
          clientId: socket.id // Add client ID for response routing
        }
      });
    } else {
      // Command not found
      const newMessage = `🤖 **Unknown Command:**\n\nType \`!help\` to see available commands.`;
      // Send response back to the frontend client
      socket.emit("message", { 
        text: newMessage,
        isJoke: false,
        isWeather: false,
        isOpenAI: false
      });
    }
  });

  // Handle responses from service sockets
  socket.on("service_response", (response) => {
    // Forward the response back to the original frontend client
    if (response.originalMessage?.clientId) {
      console.log(`Routing response to client ${response.originalMessage.clientId}`);
      io.to(response.originalMessage.clientId).emit("message", {
        text: response.text,
        isJoke: response.isJoke || false,
        isWeather: response.isWeather || false,
        isOpenAI: response.isOpenAI || false
      });
    }
  });
});

const port = 8000;
httpServer.listen(port, () => {
  console.log(`Socket.IO server started on http://localhost:${port}`);
});
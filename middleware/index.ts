import { Server, Socket } from "socket.io";
import { createServer } from "http";

// Type for command help information
interface CommandHelp {
  description: string;
  usage: string;
  examples: string[];
  category?: string;
}

// Registry to store socket connections and their commands
interface SocketRegistry {
  [command: string]: {
    sockets: Map<string, Socket>; // Map of socketId -> Socket
    help: CommandHelp;
    roundRobinIndex: number; // Track which socket to use next
  };
}

const socketRegistry: SocketRegistry = {};

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/sockets-middleware/socket.io",
  cors: {
    origin: ["*", "http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Keep track of service sockets vs frontend clients
const serviceSockets = new Set<string>();

io.on("connection", (socket) => {
  console.log(
    `[MIDDLEWARE] Client connected: ${socket.id}. Total clients: ${io.engine.clientsCount}`
  );

  // Handle socket registration (only for service sockets)
  socket.on(
    "register",
    (data: {
      commands: string[];
      help: { [command: string]: CommandHelp };
    }) => {
      console.log(
        `Service socket ${socket.id} registering commands:`,
        data.commands
      );

      // Mark this socket as a service socket
      serviceSockets.add(socket.id);

      data.commands.forEach((command) => {
        // Get help for this command or use a default
        const help = data.help[command] || {
          description: "No description provided",
          usage: command,
          examples: [`${command}`],
        };

        // Initialize command entry if it doesn't exist
        if (!socketRegistry[command]) {
          socketRegistry[command] = {
            sockets: new Map(),
            help,
            roundRobinIndex: 0, // Initialize round-robin counter
          };
          console.log(
            `Command ${command} registered for the first time by ${socket.id}`
          );
        } else {
          console.log(
            `Command ${command} already exists, adding socket ${socket.id} to the list`
          );
          // Update help if needed (in case of different versions)
          socketRegistry[command].help = help;
        }

        // Add this socket to the command's socket list
        socketRegistry[command].sockets.set(socket.id, socket);
      });

      console.log(
        "Current registry:",
        Object.keys(socketRegistry).map(
          (cmd) => `${cmd}: ${socketRegistry[cmd]?.sockets.size || 0} socket(s)`
        )
      );
    }
  );

  socket.on("disconnect", () => {
    // Remove this socket from all command registrations if it was a service socket
    if (serviceSockets.has(socket.id)) {
      Object.entries(socketRegistry).forEach(([command, data]) => {
        // Remove this specific socket from the command
        if (data.sockets.has(socket.id)) {
          data.sockets.delete(socket.id);
          console.log(`Removed socket ${socket.id} from command ${command}`);

          // If no sockets remain for this command, remove the command entirely
          if (data.sockets.size === 0) {
            delete socketRegistry[command];
            console.log(`Removed command ${command} - no sockets remaining`);
          } else {
            // Reset round-robin index if it's now out of bounds
            if (data.roundRobinIndex >= data.sockets.size) {
              data.roundRobinIndex = 0;
            }
            console.log(
              `Command ${command} still has ${data.sockets.size} socket(s) remaining`
            );
          }
        }
      });
      serviceSockets.delete(socket.id);
    }

    console.log(
      `Client disconnected: ${socket.id}. Total clients: ${io.engine.clientsCount}`
    );
  });

  // Handle incoming messages
  socket.on("message", async (message) => {
    console.log("Received message:", message);

    // Only process messages that start with a command
    if (!message.text.startsWith("!")) {
      return;
    }

    const command = message.text.split(" ")[0].toLowerCase();
    const args = message.text.split(" ").slice(1);

    // Check if command is registered
    if (command === "!help") {
      const helpMessage = generateHelpMessage();
      await saveMessageToAPI(helpMessage, message.groupId, message.token);
      socket.emit("message", {
        text: helpMessage,
        isJoke: false,
        isWeather: false,
        isOpenAI: false,
      });
    } else if (socketRegistry[command]) {
      // Get all available sockets for this command
      const availableSockets = Array.from(
        socketRegistry[command].sockets.values()
      );

      if (availableSockets.length === 0) {
        // This shouldn't happen, but clean up if it does
        delete socketRegistry[command];
        const errorMessage = `🤖 **Service Unavailable:**\n\nCommand \`${command}\` is temporarily unavailable. Please try again later.`;
        await saveMessageToAPI(errorMessage, message.groupId, message.token);
        socket.emit("message", {
          text: errorMessage,
          isJoke: false,
          isWeather: false,
          isOpenAI: false,
        });
        return;
      }

      // Round-robin socket selection
      const currentIndex = socketRegistry[command].roundRobinIndex;
      const targetSocket =
        availableSockets[currentIndex % availableSockets.length]!;

      // Update round-robin index for next request
      socketRegistry[command].roundRobinIndex =
        (currentIndex + 1) % availableSockets.length;

      console.log(
        `Routing command ${command} to socket ${currentIndex + 1}/${
          availableSockets.length
        } (round-robin)`
      );

      // Forward the message to the selected service socket
      targetSocket.emit("process_command", {
        command,
        args,
        originalMessage: {
          ...message,
          clientId: socket.id, // Add client ID for response routing
        },
      });
    } else {
      // Command not found
      const newMessage = `🤖 **Unknown Command:**\n\nType \`!help\` to see available commands.`;
      // Send response back to the frontend client
      await saveMessageToAPI(newMessage, message.groupId, message.token);
      socket.emit("message", {
        text: newMessage,
        isJoke: false,
        isWeather: false,
        isOpenAI: false,
      });
    }
  });

  // Handle responses from service sockets
  socket.on("service_response", (response) => {
    // Forward the response back to the original frontend client
    if (response.originalMessage?.clientId) {
      console.log(
        `Routing response to client ${response.originalMessage.clientId}`
      );
      socket.emit("message", {
        text: response.text,
        isJoke: response.isJoke || false,
        isWeather: response.isWeather || false,
        isOpenAI: response.isOpenAI || false,
      });
    }
  });
});

/**
 * Generates a formatted help message based on all registered commands
 * Organizes commands by category and adds appropriate formatting and emojis
 */
function generateHelpMessage(): string {
  // Start with a header
  let helpMessage = `🤖 **Available Commands:**\n\n`;

  // Group commands by their categories
  const categories: { [category: string]: string[] } = {};

  // Process each registered command
  Object.entries(socketRegistry).forEach(([command, data]) => {
    // Get category or default to "Other"
    const category = data.help.category || "Other";

    // Create category array if it doesn't exist
    if (!categories[category]) {
      categories[category] = [];
    }

    // Format the basic command help
    let commandHelp = `- \`${data.help.usage}\` → ${data.help.description}\n\n`;

    // Add examples if available
    if (data.help.examples && data.help.examples.length > 0) {
      const exampleWord =
        data.help.examples.length > 1 ? "Examples" : "Example";
      const formattedExamples = data.help.examples
        .map((ex) => `\`${ex}\``)
        .join(", ");
      commandHelp += `  **${exampleWord}:** ${formattedExamples}\n\n`;
    }

    // Add to the appropriate category
    categories[category].push(commandHelp);
  });

  // Always show the help command first (in General category)
  helpMessage += `**GENERAL 📋**\n`;
  helpMessage += `- \`!help\` → Show this help message\n\n`;

  // Add all categories (except "Other") with their commands
  Object.entries(categories).forEach(([category, commands]) => {
    if (category !== "Other") {
      const emoji = getCategoryEmoji(category);
      helpMessage += `**${category.toUpperCase()} ${emoji}**\n`;

      // Add all commands in this category
      commands.forEach((cmd) => (helpMessage += cmd));
    }
  });

  // Add the "Other" category at the end if it exists
  if (categories["Other"] && categories["Other"].length > 0) {
    helpMessage += `**OTHER ✨**\n`;
    categories["Other"].forEach((cmd) => (helpMessage += cmd));
  }

  return helpMessage;
}

/**
 * Returns an appropriate emoji for each command category
 * @param category - The category name to get an emoji for
 * @returns The corresponding emoji for the category
 */
function getCategoryEmoji(category: string): string {
  const emojis: { [key: string]: string } = {
    Jokes: "🤣",
    Weather: "⛅",
    AI: "🧠",
    General: "📋",
    Other: "✨",
  };

  return emojis[category] || "✨";
}

const saveMessageToAPI = async (
  message: string,
  groupId: string,
  token: string
) => {
  const backendUrl = process.env.BACKEND_URI || "http://localhost:9000";
  const backendPort = process.env.BACKEND_PORT || "9000";

  // If backendUrl is a relative path (starts with /), make it absolute
  const fullUrl = backendUrl.startsWith("/")
    ? `http://backend:${backendPort}${backendUrl}`
    : backendUrl;

  console.log(`Saving message to API at ${fullUrl}/groups/${groupId}/messages`);

  const res = await fetch(`${fullUrl}/groups/${groupId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: message,
      sender: "system",
      isJoke: false,
      isWeather: false,
      isOpenAI: false,
    }),
  });
  const data = (await res.json()) as { message?: string };
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
};

const port = process.env.SOCKET_MIDDLEWARE_PORT || 8000;
httpServer.listen(port, () => {
  console.log(`Socket.IO server started on http://localhost:${port}`);
});

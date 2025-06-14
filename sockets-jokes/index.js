require("dotenv").config();
const { io } = require("socket.io-client");

// Configuration
const CONFIG = {
  middlewareUri: process.env.SOCKET_MIDDLEWARE_URI || "http://localhost:8000",
  backendUri: process.env.BACKEND_URI || "http://localhost:8000",
  command: "!joke",
  validCategories: [
    "programming",
    "misc",
    "dark",
    "pun",
    "spooky",
    "christmas",
  ],
  jokeApiBaseUrl: "https://v2.jokeapi.dev/joke",
};

const verifyConfig = () => {
  if (!CONFIG.middlewareUri) {
    throw new Error("SOCKET_MIDDLEWARE_URI is not set");
  }
  if (!CONFIG.backendUri) {
    throw new Error("BACKEND_URI is not set");
  }
  if (!CONFIG.command) {
    throw new Error("COMMAND is not set");
  }
  if (!CONFIG.validCategories) {
    throw new Error("VALID_CATEGORIES is not set");
  }
  if (!CONFIG.jokeApiBaseUrl) {
    throw new Error("JOKE_API_BASE_URL is not set");
  }
};

verifyConfig();

console.log(
  "Joke socket starting with config: ",
  JSON.stringify(CONFIG, null, 2)
);

// Initialize socket connection
const socket = io(CONFIG.middlewareUri);

// Command help information
const commandHelp = {
  [CONFIG.command]: {
    description: "Get a random joke",
    usage: `!joke [category (${CONFIG.validCategories.join(", ")})]`,
    examples: ["!joke", "!joke programming", "!joke pun"],
    category: "Jokes",
  },
};

// Socket event handlers
const setupSocketHandlers = () => {
  socket.on("connect", () => {
    console.log(`Connected to middleware registered command ${CONFIG.command}`);

    // Register command with help information
    socket.emit("register", {
      commands: [CONFIG.command],
      help: commandHelp,
    });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from middleware");
  });

  // Listen for command processing requests from the middleware
  socket.on("process_command", async (data) => {
    console.log("Processing command:", data);

    const { command, args, originalMessage } = data;

    try {
      // Process joke command
      const jokeText = await processJokeCommand(args);

      // Send the response back to the middleware
      socket.emit("service_response", {
        text: jokeText,
        isJoke: true,
        isWeather: false,
        isOpenAI: false,
        originalMessage,
      });

      // Save joke to database
      await saveJokeToDatabase(jokeText, originalMessage);
    } catch (error) {
      console.error("Error processing joke command:", error);

      socket.emit("service_response", {
        text: `Failed to fetch joke: ${error.message}`,
        isJoke: true,
        isWeather: false,
        isOpenAI: false,
        originalMessage,
      });
    }
  });
};

// Start the service
setupSocketHandlers();

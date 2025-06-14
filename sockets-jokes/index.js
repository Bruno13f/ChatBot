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

    const token = originalMessage.token;
    const groupId = originalMessage.groupId;

    console.log("Original message:", originalMessage);

    if (command === "!joke") {
      console.log("Processing joke command ", command, args);
      try {
        
        const category = args[0]?.toLowerCase();
        const validCategories = [
          "programming",
          "misc",
          "dark",
          "pun",
          "spooky",
          "christmas",
        ];

        if (category && !validCategories.includes(category)) {
          console.log("Invalid category:", category);
          const text = `**⚠️ Invalid Category:** Available categories are programming, misc, dark, pun, spooky, christmas.`;
          await saveJokeToAPI(text, groupId, token, false);
          socket.emit("service_response", {
            text,
            isJoke: false,
            isWeather: false,
            isOpenAI: false,
            originalMessage,
          });
          return;
        }

        // Fetch joke from API using environment variable
        const baseUrl = "https://v2.jokeapi.dev/joke";
        const url = category
          ? `${baseUrl}/${category}?safe-mode`
          : `${baseUrl}/Any?safe-mode`;

        console.log("Fetching joke from:", url);
        const response = await fetch(url);
        const joke = await response.json();

        let jokeText = "";
        if (joke.type === "single") {
          jokeText = joke.joke;
        } else {
          jokeText = `${joke.setup}\n\n${joke.delivery}`;
        }

        console.log("Sending joke response:", jokeText);

        const text = `🤣 **Joke:**\n\n${jokeText}`;

        // Save joke to database
        await saveJokeToAPI(text, groupId, token, true);
        // Send the response back to the middleware
        socket.emit("service_response", {
          text,
          isJoke: true,
          isWeather: false,
          isOpenAI: false,
          originalMessage,
        });
      } catch (error) {
        console.error("Error processing joke command:", error);
        const text = `Failed to fetch joke: ${error.message}`;
        await saveJokeToAPI(text, groupId, token, false);
        socket.emit("service_response", {
          text,
          isJoke: false,
          isWeather: false,
          isOpenAI: false,
          originalMessage,
        });
      }
    }
  });
};

const saveJokeToAPI = async (joke, groupId, token, isJoke) => {
  const backendUrl = process.env.BACKEND_URI || "http://localhost:8000";
  const res = await fetch(`${backendUrl}/groups/${groupId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: joke,
      sender: "system",
      isJoke: isJoke,
      isWeather: false,
      isOpenAI: false,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
}

// Start the service
setupSocketHandlers();

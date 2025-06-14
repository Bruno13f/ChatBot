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

// Socket event handlers
const setupSocketHandlers = () => {
  socket.on("connect", () => {
    console.log(`Connected to middleware registered command ${CONFIG.command}`);
    socket.emit("register", [CONFIG.command]);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from middleware");
  });

  socket.on("process_command", handleCommand);
};

// Command handler
const handleCommand = async (data) => {
  const { command, args, originalMessage } = data;

  if (command.toLowerCase() !== CONFIG.command.toLowerCase()) return;

  console.log(`Processing ${CONFIG.command} command:`, args);

  try {
    const category = args[0]?.toLowerCase();

    if (category && !CONFIG.validCategories.includes(category)) {
      await sendResponse(
        `**⚠️ Invalid Category:** Available categories are ${CONFIG.validCategories.join(
          ", "
        )}.`,
        originalMessage,
        false
      );
      return;
    }

    const joke = await fetchJoke(category);
    await sendResponse(`🤣 **Joke:**\n\n${joke}`, originalMessage, true);
  } catch (error) {
    console.error("Error fetching joke:", error);
    await sendResponse(
      "😢 Sorry, I couldn't fetch a joke right now. Please try again later!",
      originalMessage,
      false
    );
  }
};

// Joke API interaction
const fetchJoke = async (category) => {
  const url = category
    ? `${CONFIG.jokeApiBaseUrl}/${category}`
    : `${CONFIG.jokeApiBaseUrl}/Any?safe-mode`;

  console.log("Fetching joke from:", url);
  const response = await fetch(url);
  const joke = await response.json();
  console.log("Joke:", joke);

  if (joke.error) {
    throw new Error(joke.message);
  }

  if (joke.type === "single") {
    return joke.joke;
  }
  return `${joke.setup}\n\n${joke.delivery}`;
};

// Response handling
const sendResponse = async (text, originalMessage, isJoke) => {
  // Save to API
  await saveToAPI(text, originalMessage, isJoke);

  // Emit to middleware
  socket.emit("service_response", {
    text,
    isJoke,
    isWeather: false,
    isOpenAI: false,
    originalMessage: {
      clientId: originalMessage.clientId,
    },
  });
};

// API interaction
const saveToAPI = async (message, originalMessage, isJoke) => {
  const { groupId, token } = originalMessage;

  const response = await fetch(
    `${CONFIG.backendUri}/groups/${groupId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        sender: "system",
        isJoke,
        isWeather: false,
        isOpenAI: false,
      }),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
};

// Start the service
setupSocketHandlers();

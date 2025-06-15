require("dotenv").config();
const { io } = require("socket.io-client");
const OpenAI = require("openai");

const backendPort = process.env.BACKEND_PORT || "9000";
const backendUrl = process.env.BACKEND_URI.startsWith("/")
  ? `http://backend:${backendPort}${process.env.BACKEND_URI}`
  : process.env.BACKEND_URI;

const middlewarePort = process.env.SOCKET_MIDDLEWARE_PORT || "8000";
const middlewareUri = process.env.SOCKET_MIDDLEWARE_URI.startsWith("/")
  ? `http://sockets-middleware:${middlewarePort}`
  : process.env.SOCKET_MIDDLEWARE_URI;

// Configuration
const CONFIG = {
  middlewareUri: middlewareUri,
  backendUri: backendUrl,
  command: "!openai",
  model: "gpt-3.5-turbo",
  openAiKey: process.env.OPENAI_API_KEY,
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
  if (!CONFIG.model) {
    throw new Error("MODEL is not set");
  }
  if (!CONFIG.openAiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
};

verifyConfig();

console.log(
  "OpenAI socket starting with config: ",
  JSON.stringify(
    {
      middlewareUri: CONFIG.middlewareUri,
      backendUri: CONFIG.backendUri,
      command: CONFIG.command,
      model: CONFIG.model,
      openAiKey: "...REDACTED...",
    },
    null,
    2
  )
);

// Command help information
const commandHelp = {
  [CONFIG.command]: {
    description: "Ask a question to AI assistant",
    usage: "!openai <your question>",
    examples: [
      "!openai What is the capital of France?",
      "!openai Tell me a short story",
    ],
    category: "AI",
  },
};

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: CONFIG.openAiKey,
});

// Initialize socket connection
const socket = io(CONFIG.middlewareUri, {
  path: "/sockets-middleware/socket.io",
  reconnectionDelayMax: 10000,
});

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

  socket.on("connect_error", (error) => {
    console.log("Connection failed, retrying...", error.message);
  });

  socket.on("process_command", handleCommand);
};

// Command handler
const handleCommand = async (data) => {
  const { command, args, originalMessage } = data;

  if (command.toLowerCase() !== CONFIG.command.toLowerCase()) return;

  console.log(`Processing ${CONFIG.command} command:`, args);

  if (!args.length) {
    await sendResponse(
      "**⚠️ Usage:** `!openai <your question>`",
      originalMessage,
      false
    );
    return;
  }

  try {
    const response = await getAIResponse(args.join(" "));
    await sendResponse(
      `🤖 **AI Response:**\n\n${response}`,
      originalMessage,
      true
    );
  } catch (error) {
    console.error("Error fetching OpenAI response:", error);
    await sendResponse(
      "❌ Sorry, I couldn't process your request. Please try again later!",
      originalMessage,
      false
    );
  }
};

// OpenAI API interaction
const getAIResponse = async (question) => {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: question }],
    model: CONFIG.model,
  });
  return completion.choices[0].message.content;
};

// Response handling
const sendResponse = async (text, originalMessage, isOpenAI) => {
  // Save to API
  await saveToAPI(text, originalMessage, isOpenAI);

  // Emit to middleware
  socket.emit("service_response", {
    text,
    isJoke: false,
    isWeather: false,
    isOpenAI,
    originalMessage: {
      clientId: originalMessage.clientId,
    },
  });
};

// API interaction
const saveToAPI = async (message, originalMessage, isOpenAI) => {
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
        isJoke: false,
        isWeather: false,
        isOpenAI,
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

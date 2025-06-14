require("dotenv").config();
const { io } = require("socket.io-client");
const NodeGeocoder = require("node-geocoder");

// Configuration
const CONFIG = {
  middlewareUri: process.env.SOCKET_MIDDLEWARE_URI || "http://localhost:8000",
  backendUri: process.env.BACKEND_URI || "http://localhost:8000",
  command: "!weather",
  validDays: [1, 3, 7, 14, 16],
  geocoderOptions: {
    provider: "openstreetmap",
  },
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
};

verifyConfig();

console.log(
  "Weather socket starting with config: ",
  JSON.stringify(CONFIG, null, 2)
);

// Initialize geocoder
const geocoder = NodeGeocoder(CONFIG.geocoderOptions);

// Command help information
const commandHelp = {
  [CONFIG.command]: {
    description: "Get a weather report for a city",
    usage: `!weather <city> <days (${CONFIG.validDays.join(", ")})>`,
    examples: ["!weather London 3", "!weather New York 7"],
    category: "Weather",
  },
};

// Initialize socket connection
const socket = io(CONFIG.middlewareUri);

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

  socket.on("process_command", handleCommand);
};

// Command handler
const handleCommand = async (data) => {
  const { command, args, originalMessage } = data;

  if (command.toLowerCase() !== CONFIG.command.toLowerCase()) return;

  console.log(`Processing ${CONFIG.command} command:`, args);

  if (!validateArgs(args)) {
    await sendResponse(
      "**⚠️ Usage:** `!weather <city> <days>`",
      originalMessage,
      false
    );
    return;
  }

  const [city, days] = args;
  const coordinates = await getCoordinates(city);

  if (coordinates === -1) {
    await sendResponse(
      "❌ Could not find coordinates for the given city.",
      originalMessage,
      false
    );
    return;
  }

  try {
    const temperatures = await fetchWeather(
      coordinates[0],
      coordinates[1],
      parseInt(days)
    );
    await sendResponse(temperatures.join(","), originalMessage, true);
  } catch (error) {
    console.error("Error fetching weather:", error);
    await sendResponse(
      "❌ Error fetching max temperature for the given city and days.",
      originalMessage,
      false
    );
  }
};

// Validation
const validateArgs = (args) => {
  if (args.length !== 2) return false;
  return CONFIG.validDays.includes(parseInt(args[1]));
};

// Weather API interaction
const fetchWeather = async (lat, long, days) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max&forecast_days=${days}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch weather data");
  }

  const data = await response.json();
  const temperatures = data.daily.temperature_2m_max;

  console.log("Maximum temperatures for the next days:");
  temperatures.forEach((temp, index) => {
    console.log(`Day ${index + 1}: ${temp}°C`);
  });

  return temperatures;
};

// Geocoding
const getCoordinates = async (city) => {
  try {
    const res = await geocoder.geocode(city);
    if (res.length > 0) {
      const { latitude, longitude } = res[0];
      console.log(`${city} => Latitude: ${latitude}, Longitude: ${longitude}`);
      return [latitude, longitude];
    }
    console.log("No result found.");
    return -1;
  } catch (err) {
    console.error("Geocoding error:", err);
    return -1;
  }
};

// Response handling
const sendResponse = async (text, originalMessage, isWeather) => {
  // Save to API
  await saveToAPI(text, originalMessage, isWeather);

  // Emit to middleware
  socket.emit("service_response", {
    text,
    isJoke: false,
    isWeather,
    isOpenAI: false,
    originalMessage: {
      clientId: originalMessage.clientId,
    },
  });
};

// API interaction
const saveToAPI = async (message, originalMessage, isWeather) => {
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
        isWeather,
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

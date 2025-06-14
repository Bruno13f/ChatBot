require("dotenv").config();
const { io } = require("socket.io-client");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap",
};

const geocoder = NodeGeocoder(options);

// Connect to the middleware using environment variable
const socket = io(process.env.SOCKET_MIDDLEWARE_URI || "http://localhost:8000");

// Register the commands this service handles
socket.on("connect", () => {
  console.log("Connected to middleware registered command !weather");
  socket.emit("register", ["!weather"]);
});

socket.on("process_command", async (data) => {
  const { command, args, originalMessage } = data;

  if (command === "!weather") {
    console.log("Processing weather command ", command, args);

    console.log("args length ", args.length);

    if (args.length !== 2) {
      const text = "**⚠️ Usage:** `!weather <city> <days>`";
      await saveWeatherToAPI(
        text,
        originalMessage.groupId,
        originalMessage.token,
        false
      );
      socket.emit("service_response", {
        text: text,
        isJoke: false,
        isWeather: false,
        isOpenAI: false,
        originalMessage: {
          clientId: originalMessage.clientId,
        },
      });
      return;
    }

    const validDays = [1, 3, 7, 14, 16];

    if (!validDays.includes(parseInt(args[1]))) {
      const text = "**⚠️ Invalid Days:** 1, 3, 7, 14, 16";
      await saveWeatherToAPI(
        text,
        originalMessage.groupId,
        originalMessage.token,
        false
      );
      socket.emit("service_response", {
        text: text,
        isJoke: false,
        isWeather: false,
        isOpenAI: false,
        originalMessage: {
          clientId: originalMessage.clientId,
        },
      });
      return;
    }

    const city = args[0];
    const days = parseInt(args[1]);

    const coordinates = await getCoordinates(city);

    if (coordinates === -1) {
      const text = "❌ Could not find coordinates for the given city.";
      await saveWeatherToAPI(
        text,
        originalMessage.groupId,
        originalMessage.token,
        false
      );
      socket.emit("service_response", {
        text: text,
        isJoke: false,
        isWeather: false,
        isOpenAI: false,
        originalMessage: {
          clientId: originalMessage.clientId,
        },
      });
      return;
    }

    try {
      const temperatures = await fetchWeather(
        coordinates[0],
        coordinates[1],
        days
      );
      const text = temperatures.join(",");
      await saveWeatherToAPI(
        text,
        originalMessage.groupId,
        originalMessage.token,
        true
      );
      socket.emit("service_response", {
        text: text,
        isJoke: false,
        isWeather: true,
        isOpenAI: false,
        originalMessage: {
          clientId: originalMessage.clientId,
        },
      });
    } catch (error) {
      const text =
        "❌ Error fetching max temperature for the given city and days.";
      await saveWeatherToAPI(
        text,
        originalMessage.groupId,
        originalMessage.token,
        false
      );
      socket.emit("service_response", {
        text: text,
        isJoke: false,
        isWeather: false,
        isOpenAI: false,
        originalMessage: {
          clientId: originalMessage.clientId,
        },
      });
    }
  }
});

socket.on("disconnect", () => {
  console.log("Disconnected from middleware");
});

const fetchWeather = async (lat, long, days) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${long}&daily=temperature_2m_max&forecast_days=${days}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.log("Failed to fetch weather data");
      return;
    } else {
      console.log("Fetched weather data");
    }

    // Parse the JSON response
    const data = await response.json();

    // Accessing the daily maximum temperatures
    const temperatures = data.daily.temperature_2m_max;
    console.log("Maximum temperatures for the next days:");
    temperatures.forEach((temp, index) => {
      console.log(`Day ${index + 1}: ${temp}°C`);
    });

    return temperatures;
  } catch (error) {
    console.error("Error fetching weather:", error);
  }
};

const getCoordinates = async (city) => {
  try {
    const res = await geocoder.geocode(city);
    if (res.length > 0) {
      const { latitude, longitude } = res[0];
      console.log(
        `${city} => Latitude: ${res[0].latitude}, Longitude: ${res[0].longitude}`
      );
      return [latitude, longitude];
    } else {
      console.log("No result found.");
      return -1;
    }
  } catch (err) {
    console.error(err);
  }
};

const saveWeatherToAPI = async (weather, groupId, token, isWeather) => {
  const backendUrl = process.env.BACKEND_URI || "http://localhost:8000";
  const res = await fetch(`${backendUrl}/groups/${groupId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: weather,
      sender: "system",
      isJoke: false,
      isWeather: isWeather,
      isOpenAI: false,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
};

require('dotenv').config({ path: '.env' });
const http = require('http');
const { Server } = require('socket.io');
const https = require('https');
const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'openstreetmap'
};

const geocoder = NodeGeocoder(options);

// Create HTTP server
const server = http.createServer();

// Create Socket.IO server with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URI || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {

  // Listen for message events
  socket.on('message', async (data) => {
    console.log(`Received message: ${data.text}`);
    const parts = data.text.split(" ");
    const city = parts[1];
    const days = parts[2];
    let token = data.token;
    let userId = data.userId;

    const coordinates = await getCoordinates(city);

    if (coordinates === -1) {
      const message = "❌ Could not find coordinates for the given city.";
      socket.emit('message', { text: message, sender: 'system'});
      await saveMessageToAPI(message, 'system', 'false', 'false', token, userId);
      return;
    }

    try{
      const temperatures = await fetchWeather(coordinates[0], coordinates[1], days);
      await saveMessageToAPI(temperatures.join(','),'system','false','true', token, userId);
      socket.emit('message', {
        text: temperatures,
        sender: "system"
      })
    }catch(error){
      socket.emit('message', {
        text: "❌ Error fetching max temperature for the given city and days.",
        sender: 'system'
      });
    }
    
  });
  

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
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
    console.log('Maximum temperatures for the next days:');
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
      console.log(`${city} => Latitude: ${res[0].latitude}, Longitude: ${res[0].longitude}`);
      return [latitude, longitude];
    } else {
      console.log('No result found.');
      return -1;
    }
  } catch (err) {
    console.error(err);
  }
}

// Function to save messages to API
const saveMessageToAPI = async (message, sender, isJoke, isWeather, token, userId) => {
  try {
    const response = await fetch(`${process.env.BACKEND_URI}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, message, sender, isJoke, isWeather }),
    });

    if (!response.ok) {
      console.log("Failed to save message");
    } else {
      console.log("Message saved!");
    }
  } catch (error) {
    console.error("Error saving message:", error);
  }
};

// Start the server
const PORT = process.env.SOCKET_WEATHER_PORT || 4001;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server for weather is running on port ${PORT}`);
});

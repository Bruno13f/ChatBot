require('dotenv').config({ path: '.env' });
const http = require('http');
const { Server } = require('socket.io');
const https = require('https');

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

// Track connected clients
let connectedClients = 0;

// Allowed categories for jokes
const allowedCategories = ["programming", "misc", "dark", "pun", "spooky", "christmas"];

// Socket.IO connection handler
io.on('connection', (socket) => {
  connectedClients++;
  console.log(`Client connected. Total connected clients: ${connectedClients}`);

  // Listen for message events
  socket.on('message', async (data) => {
    console.log(`Received message: ${data.text}`);
    let message = "❌ Error fetching joke. Try again later.";
    let isJoke = "false";
    let token = data.token;
    let userId = data.userId;
  
    if (data.text.trim().toLowerCase().startsWith('!joke')) {

      const parts = data.text.trim().split(' ');
      let category = "Any";
      let flag = parts.length > 1 ? true : false;

      if (flag && allowedCategories.includes(parts[1].toLowerCase())) {
        category = parts[1].toLowerCase();
      }

      if (flag && category === "Any") {
        message = "❌ Invalid category. Type !help to see available categories.";
        socket.emit('message', {
          text: message,
          sender: 'system'
        });
        await saveMessageToAPI(message, 'system', isJoke, 'false', token, userId);
        return;
      }

      try {
        const joke = await fetchJoke(category); 
  
        io.emit('message', {
          text: joke,
          sender: 'system'
        });
  
        message = joke;
        isJoke = "true";
  
      } catch (error) {
        console.error("Error fetching joke:", error);
        
        // Emit error message to the user
        socket.emit('message', {
          text: message,
          sender: 'system'
        });
      }
  
      await saveMessageToAPI(message, 'system', isJoke, 'false', token, userId);
      
    }
  });
  

  // Handle disconnection
  socket.on('disconnect', () => {
    connectedClients--;
    console.log(`Client disconnected. Total connected clients: ${connectedClients}`);

  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

const fetchJoke = (category) => {
  const blacklistFlags = '?blacklistFlags=nsfw,racist,sexist,explicit';
  
  return new Promise((resolve, reject) => {
    https.get(`https://v2.jokeapi.dev/joke/${category}${blacklistFlags}`, (apiRes) => {
      let data = '';

      apiRes.on('data', (chunk) => {
        data += chunk;
      });

      apiRes.on('end', () => {
        try {
          const jokeData = JSON.parse(data);
          let jokeText = jokeData.type === 'single' ? jokeData.joke : `${jokeData.setup} ${jokeData.delivery}`;
          resolve(jokeText);
        } catch (error) {
          reject("Failed to parse joke data");
        }
      });

    }).on('error', (err) => {
      reject("Failed to fetch joke");
    });
  });
};

// Function to save messages to API
const saveMessageToAPI = async (message, sender, isJoke, isWeather, token, userId) => {
  try {
    const response = await fetch(`${process.env.BACKEND_URI}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, message, sender, isJoke, isWeather}),
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
const PORT = process.env.SOCKET_JOKES_PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Socket.IO server for jokes is running on port ${PORT}`);
  console.log(`${process.env.FRONTEND_URI} & ${process.env.BACKEND_URI}`);
});

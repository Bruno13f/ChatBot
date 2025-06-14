require('dotenv').config();
const { io } = require("socket.io-client");

// Connect to the middleware using environment variable
const socket = io(process.env.SOCKET_MIDDLEWARE_URI || "http://localhost:8000");

// Register the commands this service handles
socket.on("connect", () => {
  console.log("Connected to middleware registered command !joke");
  socket.emit("register", ["!joke"]);
});

// Handle command processing
socket.on("process_command", async (data) => {
  const { command, args, originalMessage } = data;

  const token = originalMessage.token;
  
  if (command === "!joke") {
    console.log("Processing joke command ", command, args);
    try {
      // Get category if provided
      const category = args[0]?.toLowerCase();
      const validCategories = ["programming", "misc", "dark", "pun", "spooky", "christmas"];
      
      // Only validate category if one is provided
      if (category && !validCategories.includes(category)) {
        const text = `**⚠️ Invalid Category:** Available categories are programming, misc, dark, pun, spooky, christmas.`;
        await saveJokeToAPI(text, originalMessage.groupId, token, false);
        socket.emit("service_response", {
          text: text,
          isJoke: false,
          isWeather: false,
          isOpenAI: false,
          originalMessage: {
            clientId: originalMessage.clientId
          }
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
      
      await saveJokeToAPI(text, originalMessage.groupId, token, true);

      // Send the response back to the middleware
      socket.emit("service_response", {
        text: text,
        isJoke: true,
        isWeather: false,
        isOpenAI: false,
        originalMessage: {
          clientId: originalMessage.clientId
        }
      });
    } catch (error) {
      console.error("Error fetching joke:", error);
      const text = "😢 Sorry, I couldn't fetch a joke right now. Please try again later!";
      await saveJokeToAPI(text, originalMessage.groupId, token, false);
      socket.emit("service_response", {
        text: text,
        isJoke: false,
        isWeather: false,
        isOpenAI: false,
        originalMessage: {
          clientId: originalMessage.clientId
        }
      });
    }
  }
});

// Handle disconnection
socket.on("disconnect", () => {
  console.log("Disconnected from middleware");
}); 

const saveJokeToAPI = async (joke, groupId, token, isJoke) => {
  const backendUrl = process.env.BACKEND_URI || "http://localhost:8000";
  const res = await fetch(`${backendUrl}/groups/${groupId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      message: joke,
      sender: "system",
      isJoke: isJoke,
      isWeather: false,
      isOpenAI: false,
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
};

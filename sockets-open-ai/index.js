require("dotenv").config();
const { io } = require("socket.io-client");
const OpenAI = require("openai");

// Initialize OpenAI client
const openAiKey = process.env.OPENAI_API_KEY;
if (!openAiKey) {
  throw new Error("OPENAI_API_KEY is not set");
}

const openai = new OpenAI({
  apiKey: openAiKey,
});

// Connect to the middleware using environment variable
const socket = io(process.env.SOCKET_MIDDLEWARE_URI || "http://localhost:8000");

// Register the commands this service handles
socket.on("connect", () => {
  console.log("Connected to middleware registered command !openai");
  socket.emit("register", ["!openai"]);
});

// Handle command processing
socket.on("process_command", async (data) => {
  const { command, args, originalMessage } = data;

  if (command === "!openai") {
    console.log("Processing OpenAI command ", command, args);

    if (!args.length) {
      const text = "**⚠️ Usage:** `!openai <your question>`";
      await saveOpenAIResponseToAPI(
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
      const question = args.join(" ");
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: question }],
        model: "gpt-3.5-turbo",
      });

      const response = completion.choices[0].message.content;
      const text = `🤖 **AI Response:**\n\n${response}`;

      await saveOpenAIResponseToAPI(
        text,
        originalMessage.groupId,
        originalMessage.token,
        true
      );

      socket.emit("service_response", {
        text: text,
        isJoke: false,
        isWeather: false,
        isOpenAI: true,
        originalMessage: {
          clientId: originalMessage.clientId,
        },
      });
    } catch (error) {
      console.error("Error fetching OpenAI response:", error);
      const text =
        "❌ Sorry, I couldn't process your request. Please try again later!";
      await saveOpenAIResponseToAPI(
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

// Handle disconnection
socket.on("disconnect", () => {
  console.log("Disconnected from middleware");
});

const saveOpenAIResponseToAPI = async (response, groupId, token, isOpenAI) => {
  const backendUrl = process.env.BACKEND_URI || "http://localhost:8000";
  const res = await fetch(`${backendUrl}/groups/${groupId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      message: response,
      sender: "system",
      isJoke: false,
      isWeather: false,
      isOpenAI: isOpenAI,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
};

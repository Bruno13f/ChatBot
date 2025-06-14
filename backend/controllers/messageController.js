const Message = require("../models/Message");
const User = require("../models/User");
const Group = require("../models/Group");

/**
 * Transforms a group document into the desired output format
 * @param {Object} message - The message document from MongoDB
 * @returns {Object} Formatted message object
 */

const formatMessage = (message) => ({
  _id: message._id,
  timestamp: message.timestamp,
  message: message.message,
  sender: {
    name: message.sender,
    userId: message.userId,
    profilePicture: message.profilePicture,
  },
  isJoke: message.isJoke,
  isWeather: message.isWeather,
  isOpenAI: message.isOpenAI,
  groupId: message.groupId,
});

exports.getMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    console.log("\n🤼 Getting messages for group: ", groupId);

    if (!groupId) {
      console.log("❌ Missing group id");
      return res.status(400).json({ error: "Missing group id" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      console.log("❌ Group not found");
      return res.status(404).json({ error: "Group not found" });
    }

    const user = req.user;
    if (!group.members.includes(user._id)) {
      console.log("❌ User is not a member of the group");
      return res
        .status(403)
        .json({ error: "User is not a member of the group" });
    }

    const messages = await Message.find({ groupId }).sort({ timestamp: 1 });

    const formatted = messages.map(formatMessage);
    console.log("✅ Messages fetched successfully");
    res.json(formatted);
  } catch (err) {
    console.log("❌ Failed to fetch messages", err);
    res
      .status(500)
      .json({ error: "Failed to fetch messages", details: err.message });
  }
};

exports.postMessage = async (req, res) => {
  const groupId = req.params.groupId;

  console.log("\n🤼 Posting message for group: ", groupId);

  if (!groupId) {
    console.log("❌ Missing group id");
    return res.status(400).json({ error: "Missing group id" });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    console.log("❌ Group not found");
    return res.status(404).json({ error: "Group not found" });
  }

  const { message, sender, isJoke, isWeather, isOpenAI, userId } = req.body;

  if (
    !message ||
    !sender ||
    isJoke === undefined ||
    isWeather === undefined ||
    isOpenAI === undefined
  ) {
    console.log("❌ Missing one of the required fields");
    return res
      .status(400)
      .json({ error: "Missing one of the required fields" });
  }

  try {
    const messageData = {
      message,
      sender,
      isJoke,
      isWeather,
      isOpenAI,
      groupId,
    };

    if (userId) {
      messageData.userId = userId;
    }

    const savedMessage = await new Message(messageData).save();

    // Emit message to group room via WebSocket
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    if (io) {
      // Emit the new message to the group room
      io.to(`group_${groupId}`).emit("newMessage", formatMessage(savedMessage));

      // Get all members of the group
      const group = await Group.findById(groupId).populate("members", "_id");
      if (group) {
        // Emit group update to each member individually
        group.members.forEach(member => {
          const memberSocketId = userSockets.get(member._id.toString());
          if (memberSocketId) {
            console.log(`[SOCKET] Emitting group update to member ${member._id}`);
            io.to(memberSocketId).emit("groupUpdated", {
              groupId,
              lastMessage: {
                message: savedMessage.message,
                sender: {
                  name: savedMessage.sender,
                  userId: savedMessage.userId
                },
                timestamp: savedMessage.timestamp
              }
            });
          }
        });
      }
    }

    res.json({
      success: true,
      message: "Message saved!",
      data: formatMessage(savedMessage),
    });
  } catch (err) {
    console.log("❌ Failed to save message", err);
    res
      .status(500)
      .json({ error: "Failed to save message", details: err.message });
  }
};

exports.getJokes = async (req, res) => {
  const groupId = req.params.groupId;

  console.log("\n🤼 Getting jokes from group: ", groupId);

  if (!groupId) {
    console.log("❌ Missing group id");
    return res.status(400).json({ error: "Missing group id" });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    console.log("❌ Group not found");
    return res.status(404).json({ error: "Group not found" });
  }

  const user = req.user;
  if (!group.members.includes(user._id)) {
    console.log("❌ User is not a member of the group");
    return res
      .status(403)
      .json({ error: "User is not a member of the group" });
  }

  try{
    const jokes = await Message.find({ groupId, isJoke: true })
    .select("message timestamp -_id")
    .sort({ timestamp: -1 });

    // Remove the "🤣 **Joke:**" prefix from each joke
    const formattedJokes = jokes.map(joke => ({
      ...joke.toObject(),
      message: joke.message.replace(/^🤣\s*\*\*Joke:\*\*\s*/, '')
    }));

    console.log("✅ Jokes fetched successfully");
    res.json(formattedJokes);
  }catch(err){
    console.log("❌ Failed to get jokes", err);
    res
      .status(500)
      .json({ error: "Failed to get jokes", details: err.message });
  }
  
};

exports.getOpenAI = async (req, res) => {
  const groupId = req.params.groupId;

  console.log("\n🤼 Getting OpenAI messages from group: ", groupId);

  if (!groupId) {
    console.log("❌ Missing group id");
    return res.status(400).json({ error: "Missing group id" });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    console.log("❌ Group not found");
    return res.status(404).json({ error: "Group not found" });
  }

  const user = req.user;
  if (!group.members.includes(user._id)) {
    console.log("❌ User is not a member of the group");
    return res
      .status(403)
      .json({ error: "User is not a member of the group" });
  }

  try {
    // Get all OpenAI messages
    const openAIMessages = await Message.find({ groupId, isOpenAI: true })
      .select("message timestamp -_id")
      .sort({ timestamp: 1 });

    // Get all messages to find the prompts
    const allMessages = await Message.find({ groupId })
      .select("message timestamp -_id")
      .sort({ timestamp: -1 });

    // Format OpenAI messages with their prompts
    const formattedOpenAI = await Promise.all(openAIMessages.map(async (openAIMsg) => {
      // Find the last message before this OpenAI response that contains "!openai"
      const promptMessage = allMessages.find(msg => 
        msg.timestamp < openAIMsg.timestamp && 
        msg.message.toLowerCase().includes("!openai")
      );

      return {
        prompt: promptMessage ? {
          message: promptMessage.message,
          timestamp: promptMessage.timestamp
        } : null,
        response: {
          message: openAIMsg.message.replace(/^🤖\s*\*\*OpenAI:\*\*\s*/, ''),
          timestamp: openAIMsg.timestamp
        }
      };
    }));

    console.log("✅ OpenAI messages fetched successfully");
    res.json(formattedOpenAI);

  } catch (err) {
    console.log("❌ Failed to get OpenAI messages", err);
    res
      .status(500)
      .json({ error: "Failed to get OpenAI messages", details: err.message });
  }
};


exports.getWeather = async (req, res) => {
  const groupId = req.params.groupId;

  console.log("\n🤼 Getting Weather messages from group: ", groupId);

  if (!groupId) {
    console.log("❌ Missing group id");
    return res.status(400).json({ error: "Missing group id" });
  }

  const group = await Group.findById(groupId);
  if (!group) {
    console.log("❌ Group not found");
    return res.status(404).json({ error: "Group not found" });
  }

  const user = req.user;
  if (!group.members.includes(user._id)) {
    console.log("❌ User is not a member of the group");
    return res.status(403).json({ error: "User is not a member of the group" });
  }

  try {
    // Get all Weather messages
    const weatherMessages = await Message.find({ groupId, isWeather: true })
      .select("message timestamp -_id")
      .sort({ timestamp: 1 });

    // Get all messages to find the prompts
    const allMessages = await Message.find({ groupId })
      .select("message timestamp -_id")
      .sort({ timestamp: -1 });

    // Format Weather messages with their prompts
    const formattedWeather = await Promise.all(weatherMessages.map(async (weatherMsg) => {
      // Find the last message before this Weather response that contains "!weather"
      const promptMessage = allMessages.find(msg =>
        msg.timestamp < weatherMsg.timestamp &&
        msg.message.toLowerCase().includes("!weather")
      );

      return {
        prompt: promptMessage ? {
          message: promptMessage.message,
          timestamp: promptMessage.timestamp
        } : null,
        response: {
          message: weatherMsg.message,
          timestamp: weatherMsg.timestamp
        }
      };
    }));

    console.log("✅ Weather messages fetched successfully");
    res.json(formattedWeather);

  } catch (err) {
    console.log("❌ Failed to get Weather messages", err);
    res.status(500).json({ error: "Failed to get Weather messages", details: err.message });
  }
};


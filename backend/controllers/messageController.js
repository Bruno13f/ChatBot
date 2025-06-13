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
    userId: message.userId
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
      return res.status(403).json({ error: "User is not a member of the group" });
    }

    const messages = await Message.find({ groupId }).sort({ timestamp: 1 });
    console.log("Messages fetched from database: ", messages);

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

  const { message, sender, isJoke, isWeather, isOpenAI, userId} = req.body;

  if (
    !message ||
    !sender ||
    isJoke === undefined ||
    isWeather === undefined ||
    isOpenAI === undefined ||
    !userId
  ) {
    console.log("❌ Missing one of the required fields");
    return res
      .status(400)
      .json({ error: "Missing one of the required fields" });
  }

  try {
    const savedMessage = await new Message({
      userId,
      message,
      sender,
      isJoke,
      isWeather,
      isOpenAI,
      groupId
    }).save();

    res.json({ success: true, message: "Message saved!", data: formatMessage(savedMessage) });
  } catch (err) {
    console.log("❌ Failed to save message", err);
    res
      .status(500)
      .json({ error: "Failed to save message", details: err.message });
  }
};

exports.getJokes = async (req, res) => {
  const userId = req.params.userId;
  if (!userId) {
    return res.status(400).json({ error: "Missing user id" });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  try {
    const jokes = await Message.find({ userId, isJoke: true })
      .select("message timestamp -_id")
      .sort({ timestamp: -1 });
    res.json(jokes);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch jokes", details: err.message });
  }
};

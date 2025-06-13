const Message = require("../models/Message");
const User = require("../models/User");

exports.getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "Missing user id" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const messages = await Message.find({ userId }).sort({ timestamp: 1 });
    const formatted = messages.map(
      ({ message, sender, isJoke, isWeather }) => ({
        message,
        sender,
        isJoke,
        isWeather,
      })
    );

    res.json(formatted);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch messages", details: err.message });
  }
};

exports.postMessage = async (req, res) => {
  const { message, sender, isJoke, isWeather, userId, isOpenAI } = req.body;

  if (
    !message ||
    !sender ||
    isJoke === undefined ||
    isWeather === undefined ||
    isOpenAI === undefined ||
    !userId
  ) {
    return res
      .status(400)
      .json({ error: "Missing one of the required fields" });
  }

  try {
    await new Message({
      userId,
      message,
      sender,
      isJoke,
      isWeather,
      isOpenAI,
    }).save();
    res.json({ success: true, message: "Message saved!" });
  } catch (err) {
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

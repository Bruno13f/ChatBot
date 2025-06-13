const User = require("../models/User");
const mongoose = require("mongoose");

exports.getAllUsers = async (req, res) => {
  console.log("\n🤼 Getting all users");
  try {
    const users = await User.find({}, "_id name");
    console.log("✅ Users fetched successfully");
    res.json(users);
  } catch (err) {
    console.log("❌ Error fetching users:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch users", details: err.message });
  }
};

exports.getUserById = async (req, res) => {
  console.log(`\n🤼 Getting user with ID: ${req.params.userId}`);
  try {
    const user = await User.findById(req.params.userId).select(
      "_id name email"
    );
    console.log("✅ User fetched successfully");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  // Validação do ObjectId para prevenir NoSQL Injection
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { name, email },
      { new: true, runValidators: true, select: "_id name email" }
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

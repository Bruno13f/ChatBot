const User = require("../models/User");

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

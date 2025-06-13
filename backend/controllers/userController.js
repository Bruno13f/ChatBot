const User = require("../models/User");
const mongoose = require("mongoose");
const { uploadProfilePic, deleteProfilePic } = require("../config/azure");

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
      "_id name email profilePicture"
    );
    console.log("✅ User fetched successfully");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUser = async (req, res) => {
  console.log("🔍 Debug - Request received");
  console.log("📄 req.body:", req.body);
  console.log("📁 req.file:", req.file ? "File present" : "No file");

  // Validação do ObjectId para prevenir NoSQL Injection
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const { name, email } = req.body;
    const updateData = { name, email };

    // First check if user exists and get current profile picture
    const currentUser = await User.findById(req.params.userId);
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // If a new file was uploaded, process it
    if (req.file) {
      console.log(
        `📸 Processing profile picture upload for user: ${req.params.userId}`
      );

      try {
        // If user had a previous profile picture, delete it first
        if (currentUser.profilePicture) {
          console.log(
            `🗑️ Deleting old profile picture for user: ${req.params.userId}`
          );
          try {
            await deleteProfilePic(currentUser.profilePicture);
            console.log("✅ Old profile picture deleted from Azure");
          } catch (deleteError) {
            console.log(
              "⚠️ Failed to delete old picture (continuing anyway):",
              deleteError.message
            );
            // Continue with upload even if delete fails
          }
        }

        // Upload new profile picture
        const imageUrl = await uploadProfilePic(
          req.params.userId,
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );

        updateData.profilePicture = imageUrl;
        console.log(`✅ Profile picture uploaded to Azure: ${imageUrl}`);
      } catch (uploadError) {
        console.error("❌ Error uploading to Azure:", uploadError);
        return res
          .status(500)
          .json({ message: "Failed to upload profile picture" });
      }
    }

    // Update user in database
    const user = await User.findByIdAndUpdate(req.params.userId, updateData, {
      new: true,
      runValidators: true,
      select: "_id name email profilePicture",
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    console.log("✅ User updated successfully");
    res.json(user);
  } catch (err) {
    console.log("❌ Error updating user:", err);
    res.status(500).json({ message: "Server error" });
  }
};

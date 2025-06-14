const Group = require("../models/Group");
const User = require("../models/User");
const Message = require("../models/Message");
const { uploadGroupPic, deleteGroupPic } = require("../config/azure");

/**
 * Transforms a group document into the desired output format
 * @param {Object} group - The group document from MongoDB
 * @returns {Object} Formatted group object
 */

const formatGroup = (group) => ({
  _id: group._id,
  name: group.name,
  members: group.members.map((member) => ({
    _id: member._id,
    name: member.name,
    profilePicture: member.profilePicture,
  })),
  owner: group.owner,
  groupPicture: group.groupPicture,
});

exports.getGroupsFromUser = async (req, res) => {
  const userId = req.params.userId;

  if (!userId) {
    console.log("\n❌ Missing user id");
    return res.status(400).json({ message: "Missing user id" });
  }

  console.log("\n🤼 Getting groups for user: ", userId);

  const user = await User.findById(userId);
  if (!user) {
    console.log("❌ User not found");
    return res.status(404).json({ message: "User not found" });
  }

  const userToken = req.user;

  if (userToken.id !== userId) {
    console.log("❌ Unauthorized");
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Populate members with _id and name
  const groups = await Group.find({ members: userId }).populate(
    "members",
    "_id name profilePicture"
  );

  // Buscar contagem de mensagens para cada grupo
  const groupsWithMessageCount = await Promise.all(
    groups.map(async (group) => {
      const messageCount = await Message.countDocuments({ groupId: group._id });
      return { ...formatGroup(group), messageCount };
    })
  );

  console.log("✅ Groups fetched successfully");
  res.json(groupsWithMessageCount);
};

exports.createGroup = async (req, res) => {
  console.log(req.body);
  console.log("🔍 Creating group - Request received");
  console.log("📄 req.body:", req.body);
  console.log("📁 req.file:", req.file ? "File present" : "No file");

  try {
    const { name } = req.body;
    const userId = req.user._id;

    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Group name is required" });
    }

    // Create the group data object
    const groupData = {
      name: name.trim(),
      owner: userId,
      members: [userId],
    };

    // If a group picture was uploaded, upload it to Azure
    if (req.file) {
      console.log(`📸 Processing group picture upload for new group`);

      try {
        // We need to create the group first to get the ID for the picture upload
        const tempGroup = new Group(groupData);
        const savedGroup = await tempGroup.save();

        // Now upload the picture with the group ID
        const imageUrl = await uploadGroupPic(
          savedGroup._id.toString(),
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype
        );

        // Update the group with the picture URL
        savedGroup.groupPicture = imageUrl;
        await savedGroup.save();

        console.log(`✅ Group picture uploaded to Azure: ${imageUrl}`);

        // Populate the group with member details
        const populatedGroup = await Group.findById(savedGroup._id).populate(
          "members",
          "_id name email profilePicture"
        );

        return res.status(201).json(populatedGroup);
      } catch (uploadError) {
        console.error(
          "❌ Error uploading group picture to Azure:",
          uploadError
        );
        return res
          .status(500)
          .json({ message: "Failed to upload group picture" });
      }
    } else {
      // No picture, just create the group normally
      const group = new Group(groupData);
      const savedGroup = await group.save();

      // Populate the group with member details
      const populatedGroup = await Group.findById(savedGroup._id).populate(
        "members",
        "_id name email profilePicture"
      );

      console.log("✅ Group created successfully without picture");
      return res.status(201).json(populatedGroup);
    }
  } catch (error) {
    console.error("❌ Error creating group:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Edit group (name and picture)
 */
exports.editGroup = async (req, res) => {
  console.log(req.body);
  const groupId = req.params.groupId;
  const { name } = req.body;
  const user = req.user;
  const file = req.file;

  console.log("\n🤼 Editing group with id: ", groupId);

  if (!groupId) {
    console.log("❌ Missing group id");
    return res.status(400).json({ message: "Missing group id" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      console.log("❌ Group not found");
      return res.status(404).json({ message: "Group not found" });
    }

    // Only owner can edit
    if (group.owner.toString() !== user._id.toString()) {
      console.log("❌ Only the group owner can edit the group.");
      return res
        .status(403)
        .json({ message: "Only the group owner can edit the group." });
    }

    // Update name if provided
    if (name) group.name = name;

    // Handle group picture upload
    if (file) {
      try {
        console.log("📸 Uploading new group picture...");

        // Upload new picture to Azure
        const newPictureUrl = await uploadGroupPic(
          groupId,
          file.buffer,
          file.originalname,
          file.mimetype
        );

        // Store old picture URL for deletion
        const oldPictureUrl = group.groupPicture;

        // Update group with new picture URL
        group.groupPicture = newPictureUrl;

        // Delete old picture if it exists
        if (oldPictureUrl) {
          try {
            console.log("🗑️ Deleting old group picture...");
            await deleteGroupPic(oldPictureUrl);
            console.log("✅ Old group picture deleted successfully");
          } catch (deleteError) {
            console.log(
              "⚠️ Warning: Failed to delete old group picture:",
              deleteError.message
            );
            // Continue even if delete fails
          }
        }

        console.log("✅ Group picture uploaded successfully");
      } catch (uploadError) {
        console.log("❌ Error uploading group picture:", uploadError);
        return res.status(500).json({
          message: "Failed to upload group picture",
          error: uploadError.message,
        });
      }
    }

    await group.save();
    const populatedGroup = await Group.findById(groupId).populate(
      "members",
      "_id name profilePicture"
    );

    console.log("✅ Group updated successfully");
    res.json({
      success: true,
      message: "Group updated successfully",
      group: formatGroup(populatedGroup),
    });
  } catch (err) {
    console.log("❌ Error editing group:", err);
    res
      .status(500)
      .json({ error: "Failed to edit group", details: err.message });
  }
};

/**
 * Delete group picture only
 */
exports.deleteGroupPicture = async (req, res) => {
  const groupId = req.params.groupId;
  const user = req.user;

  console.log("\n🤼 Deleting group picture for group: ", groupId);

  if (!groupId) {
    console.log("❌ Missing group id");
    return res.status(400).json({ message: "Missing group id" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      console.log("❌ Group not found");
      return res.status(404).json({ message: "Group not found" });
    }

    // Only owner can delete group picture
    if (group.owner.toString() !== user._id.toString()) {
      console.log("❌ Only the group owner can delete the group picture.");
      return res.status(403).json({
        message: "Only the group owner can delete the group picture.",
      });
    }

    if (!group.groupPicture) {
      console.log("❌ Group has no picture to delete");
      return res
        .status(400)
        .json({ message: "Group has no picture to delete" });
    }

    try {
      // Delete picture from Azure
      console.log("🗑️ Deleting group picture from Azure...");
      await deleteGroupPic(group.groupPicture);

      // Remove picture URL from database
      group.groupPicture = null;
      await group.save();

      const populatedGroup = await Group.findById(groupId).populate(
        "members",
        "_id name profilePicture"
      );

      console.log("✅ Group picture deleted successfully");
      res.json({
        success: true,
        message: "Group picture deleted successfully",
        group: formatGroup(populatedGroup),
      });
    } catch (deleteError) {
      console.log("❌ Error deleting group picture from Azure:", deleteError);
      return res.status(500).json({
        message: "Failed to delete group picture",
        error: deleteError.message,
      });
    }
  } catch (err) {
    console.log("❌ Error deleting group picture:", err);
    res
      .status(500)
      .json({ error: "Failed to delete group picture", details: err.message });
  }
};

/**
 * Delete group
 */
exports.deleteGroup = async (req, res) => {
  const groupId = req.params.groupId;
  const user = req.user;

  console.log("\n🤼 Deleting group with id: ", groupId);

  if (!groupId) {
    console.log("❌ Missing group id");
    return res.status(400).json({ message: "Missing group id" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      console.log("❌ Group not found");
      return res.status(404).json({ message: "Group not found" });
    }
    // Only owner can delete
    if (group.owner.toString() !== user._id.toString()) {
      console.log("❌ Only the group owner can delete the group.");
      return res
        .status(403)
        .json({ message: "Only the group owner can delete the group." });
    }

    // Delete all messages associated with this group
    try {
      console.log("🗑️ Deleting all messages for the group...");
      await Message.deleteMany({ groupId });
      console.log("✅ All messages deleted successfully");
    } catch (messageError) {
      console.log("❌ Error deleting group messages:", messageError);
      res.status(500).json({
        error: "Failed to delete group",
        details: messageError.message,
      });
    }

    // Delete group picture from Azure if it exists
    if (group.groupPicture) {
      try {
        console.log("🗑️ Deleting group picture from Azure...");
        await deleteGroupPic(group.groupPicture);
        console.log("✅ Group picture deleted from Azure");
      } catch (deleteError) {
        console.log(
          "⚠️ Warning: Failed to delete group picture from Azure:",
          deleteError.message
        );
        // Continue with group deletion even if picture deletion fails
      }
    }

    await Group.deleteOne({ _id: groupId });
    user.groups = user.groups.filter((g) => g.toString() !== groupId);
    await user.save();
    console.log("✅ Group deleted successfully");
    res.json({ success: true, message: "Group deleted successfully" });
  } catch (err) {
    console.log("❌ Error deleting group:", err);
    res
      .status(500)
      .json({ error: "Failed to delete group", details: err.message });
  }
};

/**
 * Add members to group
 */
exports.addMemberToGroup = async (req, res) => {
  const groupId = req.params.groupId;
  const { userIds } = req.body;
  const user = req.user;

  console.log("\n🤼 Adding members to group with id: ", groupId);

  if (!groupId || !userIds) {
    console.log("❌ Missing groupId or userIds array");
    return res
      .status(400)
      .json({ message: "Missing groupId or userIds array" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      console.log("❌ Group not found");
      return res.status(404).json({ message: "Group not found" });
    }
    // Only owner can add members
    if (group.owner.toString() !== user._id.toString()) {
      console.log("❌ Only the group owner can add members.");
      return res
        .status(403)
        .json({ message: "Only the group owner can add members." });
    }

    // Filter out users that are already members
    const newMembers = userIds.filter(
      (userId) => !group.members.includes(userId)
    );

    if (newMembers.length === 0) {
      console.log("❌ All users are already members of the group.");
      return res
        .status(400)
        .json({ message: "All users are already members of the group." });
    }

    // Add new members to the group
    group.members.push(...newMembers);
    await group.save();

    // Populate members for socket event
    const populatedGroupForSocket = await Group.findById(groupId).populate(
      "members",
      "_id name profilePicture"
    );
    const messageCount = await Message.countDocuments({ groupId });
    const groupForSocket = {
      ...formatGroup(populatedGroupForSocket),
      messageCount,
    };

    // Emit socket event to new members
    const io = req.app.get("io");
    const userSockets = req.app.get("userSockets");
    if (io && userSockets && Array.isArray(newMembers)) {
      newMembers.forEach((memberId) => {
        const socketId = userSockets.get(memberId.toString());
        console.log(
          `[SOCKET] Emitindo 'addedToGroup' para userId:`,
          memberId,
          "socketId:",
          socketId
        );
        if (socketId) {
          io.to(socketId).emit("addedToGroup", {
            group: groupForSocket,
          });
        }
      });
    }

    // Populate members for response
    const populatedGroup = await Group.findById(groupId).populate(
      "members",
      "_id name profilePicture"
    );
    const messageCountForOwner = await Message.countDocuments({ groupId });
    console.log("✅ Users added to group successfully");
    res.json({
      success: true,
      message: "Users added to group successfully",
      group: {
        ...formatGroup(populatedGroup),
        messageCount: messageCountForOwner,
      },
    });
  } catch (err) {
    console.log("❌ Error adding users to group:", err);
    res
      .status(500)
      .json({ error: "Failed to add users to group", details: err.message });
  }
};

/**
 * Leave group
 */
exports.leaveGroup = async (req, res) => {
  const groupId = req.params.groupId;
  const user = req.user;

  console.log("\n🤼 Leaving group with id: ", groupId);

  if (!groupId) {
    console.log("❌ Missing group id");
    return res.status(400).json({ message: "Missing group id" });
  }

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      console.log("❌ Group not found");
      return res.status(404).json({ message: "Group not found" });
    }
    // Owner não pode sair do próprio grupo
    if (group.owner.toString() === user._id.toString()) {
      console.log(
        "❌ Owner cannot leave their own group. Delete the group instead."
      );
      return res.status(400).json({
        message:
          "Owner cannot leave their own group. Delete the group instead.",
      });
    }
    // Remove user do grupo
    group.members = group.members.filter(
      (m) => m.toString() !== user._id.toString()
    );
    await group.save();
    // Remove grupo da lista do usuário
    user.groups = user.groups.filter((g) => g.toString() !== groupId);
    await user.save();
    console.log("✅ Left group successfully");
    res.json({ success: true, message: "Left group successfully" });
  } catch (err) {
    console.log("❌ Error leaving group:", err);
    res
      .status(500)
      .json({ error: "Failed to leave group", details: err.message });
  }
};

exports.removeMemberFromGroup = async (req, res) => {
  const groupId = req.params.groupId;
  const memberId = req.params.memberId;
  const user = req.user;

  console.log("\n🤼 Removing member from group with id: ", groupId);

  try {
    const group = await Group.findById(groupId);
    if (!group) {
      console.log("❌ Group not found");
      return res.status(404).json({ message: "Group not found" });
    }
    // Only owner can remove members
    if (group.owner.toString() !== user._id.toString()) {
      console.log("❌ Only the group owner can remove members.");
      return res
        .status(403)
        .json({ message: "Only the group owner can remove members." });
    }
    // Remove member from group
    group.members = group.members.filter((m) => m.toString() !== memberId);
    await group.save();
    const member = await User.findById(memberId);
    member.groups = member.groups.filter((g) => g.toString() !== groupId);
    await member.save();
    console.log("✅ Member removed from group successfully");
    res.json({
      success: true,
      message: "Member removed from group successfully",
    });
  } catch (err) {
    console.log("❌ Error removing member from group:", err);
    res.status(500).json({
      error: "Failed to remove member from group",
      details: err.message,
    });
  }
};

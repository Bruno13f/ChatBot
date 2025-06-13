const Group = require("../models/Group");
const User = require("../models/User");

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
  })),
  owner: group.owner,
  picture: group.picture,
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
    "_id name"
  );
  const formattedGroups = groups.map(formatGroup);

  console.log("✅ Groups fetched successfully");
  res.json(formattedGroups);
};

exports.createGroup = async (req, res) => {
  const { name } = req.body;

  console.log("\n🤼 Creating group with name: ", name);

  if (!name) {
    console.log("❌ Name of group is required");
    return res.status(400).json({ message: "Name of group is required" });
  }

  const existingGroup = await Group.findOne({
    name: { $regex: `^${name}$`, $options: "i" },
  });
  if (existingGroup) {
    console.log("❌ A group with this name already exists.");
    return res
      .status(400)
      .json({ message: "A group with this name already exists." });
  }

  const user = req.user;
  try {
    const group = await new Group({
      name,
      owner: user._id,
      members: [user._id],
    }).save();
    user.groups.push(group._id);
    await user.save();

    // Populate members with _id and name
    const populatedGroup = await Group.findById(group._id).populate(
      "members",
      "_id name"
    );

    console.log("✅ Group created successfully");
    res.json({
      success: true,
      message: "Group created successfully",
      group: formatGroup(populatedGroup),
    });
  } catch (err) {
    console.log("❌ Error creating group: ", err);
    res
      .status(500)
      .json({ error: "Failed to create group", details: err.message });
  }
};

/**
 * Edit group (name and picture)
 */
exports.editGroup = async (req, res) => {
  const groupId = req.params.groupId;
  const { name, picture } = req.body;
  const user = req.user;

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
    if (name) group.name = name;
    if (picture) group.picture = picture;
    await group.save();
    const populatedGroup = await Group.findById(groupId).populate(
      "members",
      "_id name"
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
    return res.status(400).json({ message: "Missing groupId or userIds array" });
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
    const newMembers = userIds.filter(userId => !group.members.includes(userId));
    
    if (newMembers.length === 0) {
      console.log("❌ All users are already members of the group.");
      return res
        .status(400)
        .json({ message: "All users are already members of the group." });
    }

    // Add new members to the group
    group.members.push(...newMembers);
    await group.save();

    // Populate members for response
    const populatedGroup = await Group.findById(groupId).populate(
      "members",
      "_id name"
    );
    console.log("✅ Users added to group successfully");
    res.json({
      success: true,
      message: "Users added to group successfully",
      group: formatGroup(populatedGroup),
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
      console.log("❌ Owner cannot leave their own group. Delete the group instead.");
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
    group.members = group.members.filter(
      (m) => m.toString() !== memberId
    );
    await group.save();
    const member = await User.findById(memberId);
    member.groups = member.groups.filter((g) => g.toString() !== groupId);
    await member.save();
    console.log("✅ Member removed from group successfully");
    res.json({ success: true, message: "Member removed from group successfully"});
  } catch (err) {
    console.log("❌ Error removing member from group:", err);
    res
      .status(500)
      .json({ error: "Failed to remove member from group", details: err.message });
  }
}
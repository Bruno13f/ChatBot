const Group = require('../models/Group');
const User = require('../models/User');

/**
 * Transforms a group document into the desired output format
 * @param {Object} group - The group document from MongoDB
 * @returns {Object} Formatted group object
 */

const formatGroup = (group) => ({
    _id: group._id,
    name: group.name,
    members: group.members,
    owner: group.owner,
    picture: group.picture,
});

exports.getGroupsFromUser = async (req, res) => {

    const userId = req.params.userId;

    if (!userId) {
        console.log("\n❌ Missing user id");
        return res.status(400).json({ message: 'Missing user id' });
    }

    console.log("\n🤼 Getting groups for user: ", userId);

    const user = await User.findById(userId);
    if (!user) {
        console.log("❌ User not found");
        return res.status(404).json({ message: 'User not found' });
    }

    const userToken = req.user;

    if (userToken.id !== userId) {
        console.log("❌ Unauthorized");
        return res.status(401).json({ message: 'Unauthorized' });
    }

    const groups = await Group.find({ members: userId });
    const formattedGroups = groups.map(formatGroup);

    console.log("✅ Groups fetched successfully");
    res.json(formattedGroups);
}

exports.createGroup = async (req, res) => {

    const { name } = req.body;

    console.log("\n🤼 Creating group with name: ", name);

    if (!name) {
        console.log("❌ Name of group is required");
        return res.status(400).json({ message: 'Name of group is required' });
    }

    const existingGroup = await Group.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existingGroup) {
        console.log("❌ A group with this name already exists.");
        return res.status(400).json({ message: 'A group with this name already exists.' });
    }

    const user = req.user;
    try {
        const group = await new Group({ name, owner: user._id, members: [user._id] }).save();
        user.groups.push(group._id);
        await user.save();
        console.log("✅ Group created successfully");
        res.json({ success: true, message: 'Group created successfully', group: formatGroup(group) });
    } catch (err) {
        console.log("❌ Error creating group: ", err);
        res.status(500).json({ error: 'Failed to create group', details: err.message });
    }

}


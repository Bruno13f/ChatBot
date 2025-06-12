const Group = require('../models/Group');
const User = require('../models/User');

exports.createGroup = async (req, res) => {

    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Name of group is required' });
    }

    const existingGroup = await Group.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existingGroup) {
        console.log("\n❌ A group with this name already exists.");
        return res.status(400).json({ message: 'A group with this name already exists.' });
    }

    console.log("\n🤼 Creating group with name: ", name);

    const user = req.user;
    try {
        const group = await new Group({ name, owner: user._id, members: [user._id] }).save();
        user.groups.push(group._id);
        await user.save();
        console.log("✅ Group created successfully");
        res.json({ success: true, message: 'Group created successfully' });
    } catch (err) {
        console.log("❌ Error creating group: ", err);
        res.status(500).json({ error: 'Failed to create group', details: err.message });
    }

}


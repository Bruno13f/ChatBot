const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, required: false }, //Azure Blob Storage URL
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
});

module.exports = mongoose.model("User", userSchema);

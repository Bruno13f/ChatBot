const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  timestamp: { type: Date, default: Date.now },
  name: { type: String, required: true, maxlength: 30 },
  groupPicture: { type: String, required: false }, //Azure Blob Storage URL
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Group", groupSchema);

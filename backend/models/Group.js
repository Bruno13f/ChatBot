const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  name: { type: String, required: true },
  picture: { type: String, required: true }, // storage bucket url
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // array
});

module.exports = mongoose.model('Group', groupSchema);
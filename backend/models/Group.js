const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now },
  name: { type: String, required: true, maxlength: 30},
  picture: { type: String, required: false }, //storage bucket url
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});

module.exports = mongoose.model('Group', groupSchema);
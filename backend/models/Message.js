const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false},
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
  sender: { type:String, required:true },
  isJoke: {type:Boolean, required:true },
  isWeather: {type:Boolean, required:true },
  isOpenAI: {type:Boolean, required:true },
  groupId: {type: mongoose.Schema.Types.ObjectId, ref: 'Group'},
});

module.exports = mongoose.model('Message', messageSchema);
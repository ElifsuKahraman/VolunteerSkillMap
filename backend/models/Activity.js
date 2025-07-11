const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  description: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }, 
  skills: [String], 
});

module.exports = mongoose.model("Activity", ActivitySchema);

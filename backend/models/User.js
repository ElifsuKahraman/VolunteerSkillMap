const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },       
  email: { type: String, required: true, unique:true},      
  password: { type: String, required: true },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],
});

module.exports = mongoose.model("User", UserSchema);

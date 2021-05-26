const mongoose = require("mongoose")

const userSchema = mongoose.Schema({ username: String, password: String, role: String, name: String, languageLevelProgress: Array, testHistory: Array, notifications: Array });

module.exports = mongoose.model("User", userSchema);

const mongoose = require("mongoose")

const userSchema = mongoose.Schema({ username: String, password: String, role: String, name: String, latestActivity: Array, languageLevelProgress: Array, testHistory: Array, notifications: Array, options: Object});

module.exports = mongoose.model("User", userSchema);

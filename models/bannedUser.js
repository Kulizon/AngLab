const mongoose = require("mongoose")

const bannedUserSchema = mongoose.Schema({ username: String });

module.exports = mongoose.model("BannedUser", bannedUserSchema);
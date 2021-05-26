const mongoose = require("mongoose")

const subjectSchema = mongoose.Schema({ languageLevel: String, subject: String });
module.exports = mongoose.model("Subject", subjectSchema);

const mongoose = require("mongoose");

const lessonSchema = mongoose.Schema({ languageLevel: String, subject: String, title: String, content: String, sanitizedHTML: String});

module.exports = mongoose.model("Lesson", lessonSchema);

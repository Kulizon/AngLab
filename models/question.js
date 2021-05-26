const mongoose = require("mongoose")
const random = require("mongoose-simple-random");

const questionSchema = mongoose.Schema({ languageLevel: String, subject: String, question: String, answerA: String, answerB: String, answerC: String, answerD: String, correctAnswer: String, hint: String }).plugin(random);

module.exports = mongoose.model("Question", questionSchema);
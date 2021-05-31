const mongoose = require("mongoose")
const random = require("mongoose-simple-random");

const flashcardSchema = mongoose.Schema({ languageLevel: String, word: String, translation: String }).plugin(random);

module.exports = mongoose.model("Flashcard", flashcardSchema);
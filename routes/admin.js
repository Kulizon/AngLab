const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// mongoose.connect("mongodb://localhost:27017/myAngLab", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

mongoose.connect("mongodb+srv://admin-kacper:" + process.env.DB_PASSWORD + "@cluster0.netpw.mongodb.net/AngLab?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const User = require("./../models/user");
const BannedUser = require("./../models/bannedUser");
const Question = require("./../models/question");
const Subject = require("./../models/subject");
const Lesson = require("./../models/lesson");
const Flashcard = require("./../models/flashcard");

const { redirectIfNotAdmin } = require("./../utilities/utilities");

router.get("/admin", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  res.render("admin/dashboard");
});

router.get("/admin/users", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const users = await User.find({}, (e, users) => {
    if (e) console.log(e);
  });

  res.render("admin/users", { users: users });
});

router.post("/admin/users/search", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const users = await User.find({ username: { $regex: req.body.searchQuery, $options: "i" } }, (e, users) => {
    if (e) console.log(e);
    return users;
  });

  res.render("admin/users", { users: users });
});

router.post("/admin/users/action", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  if (req.body.action === "delete") {
    User.deleteMany({ _id: { $in: req.body.chosenUserID } }, (e) => {
      if (e) console.log(e);
    });
  }
  if (req.body.action === "ban") {
    req.body.chosenUserID.forEach((userID) => {
      User.findOneAndRemove({ _id: userID }, (e, user) => {
        if (e) console.log(e);

        const bannedUser = new BannedUser({ username: user.username });
        bannedUser.save();
      });
    });
  }

  if (req.body.action === "message") {
    User.updateMany({ _id: { $in: req.body.chosenUserID } }, { $push: { notifications: { title: req.body.title, content: req.body.content } } }, (e) => {
      if (e) console.log(e);
    });
  }
  res.redirect("/admin/users/");
});

router.post("/admin/users/ban-user/:userID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const bannedUser = new BannedUser({ username: req.body.username });
  bannedUser.save();
  User.deleteOne({ _id: req.params.userID }, (e) => {
    if (e) console.log(e);
  });
  res.redirect("/admin/users/");
});

router.post("/admin/users/delete-user/:userID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  User.deleteOne({ _id: req.params.userID }, (e) => {
    if (e) console.log(e);
  });
  res.redirect("/admin/users/");
});

router.get("/admin/questions", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const questions = await Question.find({}, (e, questions) => {
    if (e) console.log(e);
    return questions;
  });

  res.render("admin/actions/questions", { questions: questions });
});

router.post("/admin/questions/search", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  let questions;
  if (req.body.searchQueryLevel !== "Nothing" && req.body.searchQuery !== "") {
    questions = await Question.find({ $and: [{ subject: { $regex: req.body.searchQuery, $options: "i" } }, { languageLevel: req.body.searchQueryLevel }] }, (e, questions) => {
      if (e) console.log(e);
      return questions;
    });
  } else if (req.body.searchQueryLevel !== "Nothing" && req.body.searchQuery === "") {
    questions = await Question.find({ languageLevel: req.body.searchQueryLevel }, (e, questions) => {
      if (e) console.log(e);
      return questions;
    });
  } else {
    questions = await Question.find({ subject: { $regex: req.body.searchQuery, $options: "i" } }, (e, questions) => {
      if (e) console.log(e);
      return questions;
    });
  }

  res.render("admin/actions/questions", { questions: questions });
});

router.post("/admin/questions/action", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  if (req.body.action === "delete") {
    Question.deleteMany({ _id: { $in: req.body.chosenQuestionsID } }, (e) => {
      if (e) console.log(e);
    });
  }

  res.redirect("/admin/questions/");
});

router.get("/admin/questions/add-question", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  res.render("admin/actions/create/add-question");

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    console.log(123);
    socket.on("chosenLevel", (chosenLevel) => {
      Subject.find({ languageLevel: chosenLevel.chosenLevel }, (e, subjects) => {
        if (e) console.log(e);
        if (chosenLevel.defaultSubject) {
          socket.emit("subjects", { subjects: subjects, defaultSubject: chosenLevel.defaultSubject });
          return;
        }
        socket.emit("subjects", { subjects: subjects });
      });
    });
  });
});

router.post("/admin/questions/add-question", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const newQuestion = new Question({ languageLevel: req.body.level, question: req.body.question, subject: req.body.subject.trim(), answerA: req.body.answerA, answerB: req.body.answerB, answerC: req.body.answerC, answerD: req.body.answerD, correctAnswer: req.body.correctAnswer, hint: req.body.hint });
  newQuestion.save();

  res.redirect("/admin/questions");
});

router.get("/admin/questions/edit-question/:questionID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const question = await Question.findOne({ _id: req.params.questionID }, (e, question) => {
    if (e) console.log(e);
    return question;
  });

  res.render("admin/actions/create/edit-question", { editedQuestion: question });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("chosenLevel", (chosenLevel) => {
      Subject.find({ languageLevel: chosenLevel.chosenLevel }, (e, subjects) => {
        if (e) console.log(e);
        if (chosenLevel.defaultSubject) {
          socket.emit("subjects", { subjects: subjects, defaultSubject: chosenLevel.defaultSubject });
          return;
        }
        socket.emit("subjects", { subjects: subjects });
      });
    });
  });
});

router.post("/admin/questions/edit-question/:questionID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  await Question.updateOne({ _id: req.params.questionID }, { languageLevel: req.body.level, question: req.body.question, subject: req.body.subject, answerA: req.body.answerA, answerB: req.body.answerB, answerC: req.body.answerC, answerD: req.body.answerD, correctAnswer: req.body.correctAnswer, hint: req.body.hint }, (e) => {
    if (e) console.log(e);
  });

  res.redirect("/admin/questions");
});

router.post("/admin/questions/delete-question/:questionID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  await Question.deleteOne({ _id: req.params.questionID }, (e) => {
    if (e) console.log(e);
  });

  res.redirect("/admin/questions");
});

router.get("/admin/lessons", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const lessons = await Lesson.find({}, (e, lessons) => {
    if (e) console.log(e);
    return lessons;
  });

  res.render("admin/actions/lessons", { lessons: lessons });
});

router.post("/admin/lessons/search", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  let lessons;
  if (req.body.searchQueryLevel !== "Nothing" && req.body.searchQuery !== "") {
    lessons = await Lesson.find({ $and: [{ subject: { $regex: req.body.searchQuery, $options: "i" } }, { languageLevel: req.body.searchQueryLevel }] }, (e, lessons) => {
      if (e) console.log(e);
      return lessons;
    });
  } else if (req.body.searchQueryLevel !== "Nothing" && req.body.searchQuery === "") {
    lessons = await Lesson.find({ languageLevel: req.body.searchQueryLevel }, (e, lessons) => {
      if (e) console.log(e);
      return lessons;
    });
  } else {
    lessons = await Lesson.find({ subject: { $regex: req.body.searchQuery, $options: "i" } }, (e, lessons) => {
      if (e) console.log(e);
      return lessons;
    });
  }

  res.render("admin/actions/lessons", { lessons: lessons });
});

router.post("/admin/lessons/action", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  if (req.body.action === "delete") {
    Lesson.deleteMany({ _id: { $in: req.body.chosenLessonsID } }, (e) => {
      if (e) console.log(e);
    });
  }

  res.redirect("/admin/lessons/");
});

router.get("/admin/lessons/add-lesson", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  res.render("admin/actions/create/add-lesson");

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("chosenLevel", (chosenLevel) => {
      Subject.find({ languageLevel: chosenLevel.chosenLevel }, (e, subjects) => {
        if (e) console.log(e);
        if (chosenLevel.defaultSubject) {
          socket.emit("subjects", { subjects: subjects, defaultSubject: chosenLevel.defaultSubject });
          return;
        }
        socket.emit("subjects", { subjects: subjects });
      });
    });
  });
});

router.post("/admin/lessons/delete-lesson", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  Lesson.deleteOne({ _id: req.body.lessonID }, (e) => {
    if (e) console.log(e);
  });

  res.redirect("/admin/lessons");
});

router.post("/admin/lessons/add-lesson", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const newLesson = new Lesson({ languageLevel: req.body.level, subject: req.body.subject.trim(), title: req.body.title.trim(), content: req.body.content });
  newLesson.save();

  res.redirect("/admin/lessons");
});

router.get("/admin/lessons/edit-lesson/:lessonID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const lesson = await Lesson.findOne({ _id: req.params.lessonID }, (e, lesson) => {
    if (e) console.log(e);
    return lesson;
  });
  res.render("admin/actions/create/edit-lesson", { editedLesson: lesson });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("chosenLevel", (chosenLevel) => {
      Subject.find({ languageLevel: chosenLevel.chosenLevel }, (e, subjects) => {
        if (e) console.log(e);
        if (chosenLevel.defaultSubject) {
          socket.emit("subjects", { subjects: subjects, defaultSubject: chosenLevel.defaultSubject });
          return;
        }
        socket.emit("subjects", { subjects: subjects });
      });
    });
  });
});

router.post("/admin/lessons/edit-lesson/:lessonID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  Lesson.updateOne({ _id: req.params.lessonID }, { languageLevel: req.body.level, subject: req.body.subject, title: req.body.title, content: req.body.content }, (e) => {
    if (e) console.log(e);
  });
  res.redirect("/admin/lessons");
});

router.get("/admin/subjects", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const subjects = await Subject.find({}, (e, subjects) => {
    if (e) console.log(e);
    return subjects;
  });

  res.render("admin/actions/subjects", { subjects: subjects });
});

router.post("/admin/subjects/search", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  let subjects;
  if (req.body.searchQueryLevel !== "Nothing" && req.body.searchQuery !== "") {
    subjects = await Subject.find({ $and: [{ subject: { $regex: req.body.searchQuery, $options: "i" } }, { languageLevel: req.body.searchQueryLevel }] }, (e, subjects) => {
      if (e) console.log(e);
      return subjects;
    });
  } else if (req.body.searchQueryLevel !== "Nothing" && req.body.searchQuery === "") {
    subjects = await Subject.find({ languageLevel: req.body.searchQueryLevel }, (e, subjects) => {
      if (e) console.log(e);
      return subjects;
    });
  } else {
    subjects = await Subject.find({ subject: { $regex: req.body.searchQuery, $options: "i" } }, (e, subjects) => {
      if (e) console.log(e);
      return subjects;
    });
  }

  res.render("admin/actions/subjects", { subjects: subjects });
});

router.post("/admin/subjects/action", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  if (req.body.action === "delete") {
    Subject.deleteMany({ _id: { $in: req.body.chosenSubjectsID } }, (e) => {
      if (e) console.log(e);
    });
  }

  res.redirect("/admin/subjects/");
});

router.post("/admin/subjects/add-subject", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const newSubject = new Subject({ languageLevel: req.body.level, subject: req.body.subject.trim() });
  newSubject.save();

  res.redirect("/admin/subjects");
});

router.post("/admin/subjects/delete-subject/:subjectID", (req, res) => {
  Subject.deleteOne({ _id: req.body.subjectID }, (e) => {
    if (e) console.log(e);
  });

  res.redirect("/admin/subjects/");
});

router.get("/admin/flashcards", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const flashcards = await Flashcard.find({}, (e, flashcards) => {
    if (e) console.log(e);
    return flashcards;
  });

  res.render("admin/actions/flashcards", { flashcards });
});

router.get("/admin/flashcards/add-flashcard", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  res.render("admin/actions/create/add-flashcard");
});

router.post("/admin/flashcards/add-flashcard", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  await new Flashcard({ languageLevel: req.body.level, word: req.body.word.trim(), translation: req.body.translation.trim() }).save();

  res.redirect("/admin/flashcards/add-flashcard");
});

router.post("/admin/flashcards/delete-flashcard/:flashcardID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  await Flashcard.deleteOne({ _id: req.params.flashcardID }, (e) => {
    if (e) console.log(e);
  });

  res.redirect("/admin/flashcards");
});

router.get("/admin/flashcards/edit-flashcard/:flashcardID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  const flashcard = await Flashcard.findOne({ _id: req.params.flashcardID }, (e, flashcard) => {
    if (e) console.log(e);
    return flashcard;
  });

  res.render("admin/actions/create/edit-flashcard", { flashcard });
});

router.post("/admin/flashcards/edit-flashcard/:flashcardID", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  await Flashcard.updateOne({ _id: req.params.flashcardID }, { languageLevel: req.body.level, word: req.body.word, translation: req.body.translation }, (e) => {
    if (e) console.log(e);
  });

  res.redirect("/admin/flashcards");
});

router.post("/admin/flashcards/action", async (req, res) => {
  if (await redirectIfNotAdmin(req, res)) return;

  if (req.body.action === "delete") {
    await Flashcard.deleteMany({ _id: { $in: req.body.chosenFlashcardsID } }, (e) => {
      if (e) console.log(e);
    });
  }

  res.redirect("/admin/flashcards/");
});

module.exports = router;

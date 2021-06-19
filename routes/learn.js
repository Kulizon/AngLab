const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

// mongoose.connect("mongodb://localhost:27017/myAngLab", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

mongoose.connect("mongodb+srv://admin-kacper:" + process.env.DB_PASSWORD + "@cluster0.netpw.mongodb.net/AngLab?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const User = require("./../models/user");
const Question = require("./../models/question");
const Subject = require("./../models/subject");
const Lesson = require("./../models/lesson");
const Flashcard = require("./../models/flashcard");

const { redirectIfNotAuthenticated, getCurrentDate, containsLesson, getCurrentUser } = require("./../utilities/utilities");

const languageLevels = ["A1", "A2", "B1", "B2", "C1", "C2"];

router.get("/learn", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const lessons = await Lesson.find();

  const randomLangLevel = languageLevels[Math.floor(Math.random() * 6)];

  const randomTest = languageLevels[Math.floor(Math.random() * 6)];

  const loggedUser = req.user;

  const recommendations = [];

  await lessons.forEach((lesson) => {
    if (!containsLesson( lesson , loggedUser.languageLevelProgress)) {
      recommendations.push(lesson);
    }
  });

  res.render("learn/panel", { loggedUser, recommendations, randomLangLevel, randomTest });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();

    socket.on("getProgress", async () => {
      const loggedUser = await getCurrentUser(req);

      const lessons = await Lesson.find();

      socket.emit("progress", loggedUser.languageLevelProgress, lessons);
    });

    socket.on("checkForProgressError", async () => {
      const lessons = await Lesson.find();

      await loggedUser.languageLevelProgress.forEach((record) => {
        if (!containsLesson( record , lessons)) {
          User.updateOne({ _id: loggedUser._id }, { $pull: { languageLevelProgress: { lessonID: record.lessonID } } }, (e) => {
            if (e) console.log(e);
          });
        }
      });
    });
  });
});

router.get("/learn/:languageLevel", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (!languageLevels.includes(req.params.languageLevel)) {
    res.redirect("/learn");
    return;
  }

  const loggedUser = req.user;

  const lessons = await Lesson.find({ languageLevel: req.params.languageLevel }, (e, lessons) => {
    if (e) console.log(e);
    return lessons;
  });

  let recommendations = [];

  await lessons.forEach((lesson) => {
    if (!containsLesson( lesson , loggedUser.languageLevelProgress)) {
      recommendations.push(lesson);
    }
  });

  const checkLanguage = (entry) => {
    if (entry.languageLevel === req.params.languageLevel) return entry;
  };

  const latestActivity = loggedUser.languageLevelProgress.filter(checkLanguage);

  res.render("learn/language-level", { languageLevel: req.params.languageLevel, loggedUser, latestActivity, recommendations });
});

router.get("/learn/:languageLevel/study", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (!languageLevels.includes(req.params.languageLevel)) {
    res.redirect("/learn");
    return;
  }

  const subjects = await Subject.find({ languageLevel: req.params.languageLevel }, (e, subjects) => {
    if (e) console.log(e);
    return subjects;
  });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("getSubjectProgress", async () => {
      const loggedUser = await getCurrentUser(req);

      const lessons = await Lesson.find({ languageLevel: req.params.languageLevel }, (e, lessons) => {
        if (e) console.log(e);
        return lessons;
      });

      socket.emit("subjectProgress", loggedUser.languageLevelProgress, lessons);
    });
  });

  res.render("learn/actions/study", { learningSubjects: subjects, languageLevel: req.params.languageLevel, loggedUser: req.user, loggedUser: req.user });
});

router.get("/learn/:languageLevel/study/:learningSubject", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (!languageLevels.includes(req.params.languageLevel)) {
    res.redirect("/learn");
    return;
  }

  const lessons = await Lesson.find({ $and: [{ languageLevel: req.params.languageLevel, subject: req.params.learningSubject }] }, (e, lessons) => {
    if (e) console.log(e);
    return lessons;
  });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("getLessonProgress", async () => {
      const loggedUser = await getCurrentUser(req);

      socket.emit("lessonProgress", loggedUser.languageLevelProgress, lessons);
    });
  });

  res.render("learn/subjects/subject-study", { learningSubject: req.params.learningSubject, subjectLessons: lessons, languageLevel: req.params.languageLevel, loggedUser: req.user });
});

router.get("/learn/:languageLevel/study/:learningSubject/:lessonID", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const lesson = await Lesson.findOne({ _id: req.params.lessonID }, (e, lesson) => {
    if (e) console.log(e);
    return lesson;
  });

  if (!languageLevels.includes(req.params.languageLevel) || !lesson) {
    res.redirect("/learn");
    return;
  }

  const loggedUser = await getCurrentUser(req);

  let isDone = false;

  if (containsLesson( lesson , loggedUser.languageLevelProgress)) {
    isDone = true;
  }

  res.render("learn/lessons/lesson", { lesson, isDone, languageLevel: req.params.languageLevel, loggedUser: req.user });
});

router.post("/learn/:languageLevel/study/:learningSubject/:lessonID/done", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const loggedUser = await getCurrentUser(req);

  if (containsLesson({ lessonID: req.body.lessonID }, loggedUser.languageLevelProgress)) {
    res.redirect("back");
    return;
  }

  User.updateOne({ _id: loggedUser._id }, { $push: { languageLevelProgress: { languageLevel: req.params.languageLevel, languageLevelSubject: req.body.subject, title: req.body.title, lessonID: req.body.lessonID } } }, (e) => {
    if (e) console.log(e);
    res.redirect("back");
  });
});

router.post("/learn/:languageLevel/study/:learningSubject/:lessonID/undone", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const loggedUser = await getCurrentUser(req);

  if (containsLesson({ lessonID: req.body.lessonID }, loggedUser.languageLevelProgress)) {
    User.updateOne({ _id: loggedUser._id }, { $pull: { languageLevelProgress: { lessonID: req.body.lessonID } } }, (e) => {
      if (e) console.log(e);
    });
  }

  res.redirect("back");
});

router.get("/learn/:languageLevel/practice", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (!languageLevels.includes(req.params.languageLevel)) {
    res.redirect("/learn");
    return;
  }

  const subjects = await Subject.find({ languageLevel: req.params.languageLevel }, (e, subjects) => {
    if (e) console.log(e);
    return subjects;
  });

  res.render("learn/actions/practice", { practiceSubjects: subjects, languageLevel: req.params.languageLevel, loggedUser: req.user });
});

router.get("/learn/:languageLevel/practice/:practiceSubject", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (!languageLevels.includes(req.params.languageLevel)) {
    res.redirect("/learn");
    return;
  }

  await Question.findRandom({ $and: [{ languageLevel: req.params.languageLevel, subject: req.params.practiceSubject }] }, {}, { limit: 10 }, (e, questions) => {
    if (e) console.log(e);
    res.render("learn/subjects/subject-practice", { practiceSubject: req.params.practiceSubject, practiceQuestions: questions, languageLevel: req.params.languageLevel, loggedUser: req.user });
  });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("answer", (answer) => {
      Question.findOne({ _id: answer.questionID }, (e, question) => {
        if (e) console.log(e);

        if (answer.chosenAnswer === question.correctAnswer) {
          socket.emit("answerCorrect", { feedback: "Correct!", iteration: answer.iteration });
          return;
        }

        socket.emit("answerCorrect", { feedback: `Wrong!  ${question.hint}`, iteration: answer.iteration });
      });
    });
  });
});

router.get("/learn/:languageLevel/test", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (!languageLevels.includes(req.params.languageLevel)) {
    res.redirect("/learn");
    return;
  }

  res.render("learn/actions/test-start", { languageLevel: req.params.languageLevel, loggedUser: req.user });
});

router.get("/learn/:languageLevel/test/start", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (!languageLevels.includes(req.params.languageLevel)) {
    res.redirect("/learn");
    return;
  }

  await Question.findRandom({ languageLevel: req.params.languageLevel }, {}, { limit: 10 }, (e, questions) => {
    if (e) console.log(e);
    res.render("learn/actions/test", { testQuestions: questions, languageLevel: req.params.languageLevel, loggedUser: req.user });
  });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();

    socket.on("testAnswers", async (testAnswers, amountOfQuestions) => {
      const correctAnswers = [];
      await testAnswers.forEach(async (answer, index) => {
        await Question.findOne({ _id: answer.questionID }, (e, question) => {
          if (e) console.log(e);

          if (question.correctAnswer === answer.answer) {
            correctAnswers.push(answer);
          } else {
            correctAnswers.push({ questionID: null, answer: null });
          }

          if (index === amountOfQuestions - 1) socket.emit("testFeedback", correctAnswers, amountOfQuestions);
        });
      });
    });
  });
});

router.post("/learn/:languageLevel/test/end", (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  User.updateOne({ username: req.user.username }, { $push: { testHistory: { languageLevel: req.params.languageLevel, correctAnswers: req.body.correctAnswers, amountOfQuestions: req.body.amountOfQuestions, percent: (req.body.correctAnswers / req.body.amountOfQuestions) * 100, date: getCurrentDate() } } }, (e) => {
    if (e) console.log(e);
  });

  res.render("learn/actions/test-end", { languageLevel: req.params.languageLevel, correctAnswers: req.body.correctAnswers, amountOfQuestions: req.body.amountOfQuestions, percent: (req.body.correctAnswers / req.body.amountOfQuestions) * 100, loggedUser: req.user });
});

router.get("/learn/:languageLevel/flashcards", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (!languageLevels.includes(req.params.languageLevel)) {
    res.redirect("/learn");
    return;
  }

  await Flashcard.findRandom({ languageLevel: req.params.languageLevel }, {}, { limit: 15 }, (e, flashcards) => {
    if (e) console.log(e);
    if (flashcards === undefined) flashcards = [];
    res.render("learn/actions/flashcards", { flashcards, languageLevel: req.params.languageLevel, loggedUser: req.user });
  });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("getFlashcards", async () => {
      await Flashcard.findRandom({ languageLevel: req.params.languageLevel }, {}, { limit: 15 }, (e, flashcards) => {
        if (e) console.log(e);
        socket.emit("flashcards", flashcards);
      });
    });
  });
});

module.exports = router;

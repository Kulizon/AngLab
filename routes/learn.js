const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

mongoose.connect("mongodb://localhost:27017/myAngLab", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const User = require("./../models/user");
const Question = require("./../models/question");
const Subject = require("./../models/subject");
const Lesson = require("./../models/lesson");

const { redirectIfNotAuthenticated, getCurrentDate, containsLesson, getCurrentUser } = require("./../utilities/utilities");

router.get("/learn", (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("getProgress", async () => {

      const loggedUser = await getCurrentUser(req)

      const lessons = await Lesson.find();

      await loggedUser.languageLevelProgress.forEach((record) => {
        if (!containsLesson(record, lessons)) {
          User.updateOne({ _id: loggedUser._id }, { $pull: { languageLevelProgress: { languageLevel: record.languageLevel, languageLevelSubject: record.languageLevelSubject, title: record.title } } }, (e) => {
            if (e) console.log(e);
          });
        }
      });

      socket.emit("progress", loggedUser.languageLevelProgress, lessons);
    });
  });

  res.render("learn/panel");
});

router.get("/learn/:languageLevel", (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  res.render("learn/language-level", { languageLevel: req.params.languageLevel });
});

router.get("/learn/:languageLevel/study", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const subjects = await Subject.find({ languageLevel: req.params.languageLevel }, (e, subjects) => {
    if (e) console.log(e);
    return subjects;
  });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("getSubjectProgress", async () => {
      const loggedUser = await User.findOne({ username: req.user.username }, (e, user) => {
        if (e) console.log(e);
        return user;
      });

      const lessons = await Lesson.find({ languageLevel: req.params.languageLevel }, (e, lessons) => {
        if (e) console.log(e);
        return lessons;
      });

      socket.emit("subjectProgress", loggedUser.languageLevelProgress, lessons);
    });
  });

  res.render("learn/actions/study", { learningSubjects: subjects, languageLevel: req.params.languageLevel });
});

router.get("/learn/:languageLevel/study/:learningSubject", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const lessons = await Lesson.find({ $and: [{ languageLevel: req.params.languageLevel, subject: req.params.learningSubject }] }, (e, lessons) => {
    if (e) console.log(e);
    return lessons;
  });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("getLessonProgress", async () => {
      const loggedUser = await User.findOne({ username: req.user.username }, (e, user) => {
        if (e) console.log(e);
        return user;
      });

      socket.emit("lessonProgress", loggedUser.languageLevelProgress, lessons);
    });
  });

  res.render("learn/subjects/subject-study", { learningSubject: req.params.learningSubject, subjectLessons: lessons, languageLevel: req.params.languageLevel });
});

router.get("/learn/:languageLevel/study/:learningSubject/:lessonTitle", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const lesson = await Lesson.findOne({ $and: [{ languageLevel: req.params.languageLevel, subject: req.params.learningSubject, title: req.params.lessonTitle }] }, (e, lesson) => {
    if (e) console.log(e);
    return lesson;
  });

  const loggedUser = await User.findOne({ username: req.user.username }, (e, user) => {
    if (e) console.log(e);
    return user;
  });

  let isDone = false;

  if (containsLesson({ languageLevel: req.params.languageLevel, languageLevelSubject: req.params.learningSubject, title: req.params.lessonTitle }, loggedUser.languageLevelProgress)) {
    isDone = true;
  }

  res.render("learn/lessons/lesson", { lesson: lesson, isDone: isDone });
});

router.post("/learn/:languageLevel/study/:learningSubject/:lessonTitle/done", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const loggedUser = await User.findOne({ username: req.user.username }, (e, user) => {
    if (e) console.log(e);
    return user;
  });

  if (containsLesson({ languageLevel: req.params.languageLevel, languageLevelSubject: req.params.learningSubject, title: req.params.lessonTitle }, loggedUser.languageLevelProgress)) {
    res.redirect("back");
    return;
  }

  User.updateOne({ _id: loggedUser._id }, { $push: { languageLevelProgress: { languageLevel: req.params.languageLevel, languageLevelSubject: req.params.learningSubject, title: req.params.lessonTitle } } }, (e) => {
    if (e) console.log(e);
    res.redirect("back");
  });
});

router.post("/learn/:languageLevel/study/:learningSubject/:lessonTitle/undone", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const loggedUser = await User.findOne({ username: req.user.username }, (e, user) => {
    if (e) console.log(e);
    return user;
  });

  if (containsLesson({ languageLevel: req.params.languageLevel, languageLevelSubject: req.params.learningSubject, title: req.params.lessonTitle }, loggedUser.languageLevelProgress)) {
    User.findOne({ languageLevelProgress: { languageLevel: req.params.languageLevel, languageLevelSubject: req.params.learningSubject, title: req.params.lessonTitle } }, (e, user) => {
      if (e) console.log(e);
    });

    User.updateOne({ _id: loggedUser._id }, { $pull: { languageLevelProgress: { languageLevel: req.params.languageLevel, languageLevelSubject: req.params.learningSubject, title: req.params.lessonTitle } } }, (e) => {
      if (e) console.log(e);
    });
  }

  res.redirect("back");
});

router.get("/learn/:languageLevel/practice", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const subjects = await Subject.find({ languageLevel: req.params.languageLevel }, (e, subjects) => {
    if (e) console.log(e);
    return subjects;
  });

  res.render("learn/actions/practice", { practiceSubjects: subjects, languageLevel: req.params.languageLevel });
});

router.get("/learn/:languageLevel/practice/:practiceSubject", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  // SET LIMIT FOR QUESTIONS
  await Question.findRandom({ $and: [{ languageLevel: req.params.languageLevel, subject: req.params.practiceSubject }] }, {}, { limit: 10 }, function (e, questions) {
    if (e) console.log(e);
    res.render("learn/subjects/subject-practice", { practiceSubject: req.params.practiceSubject, practiceQuestions: questions, languageLevel: req.params.languageLevel });
  });

  req.io.on("connection", (socket) => {
    req.io.removeAllListeners();
    socket.on("answer", (answer) => {
      Question.findOne({ _id: answer.questionID }, (e, question) => {
        if (e) console.log(e);

        if (answer.chosenAnswer === question.correctAnswer) {
          socket.emit("answerCorrect", { feedback: "Good", iteration: answer.iteration });
          return;
        }

        socket.emit("answerCorrect", { feedback: `Wrong!  ${question.hint}`, iteration: answer.iteration });
      });
    });
  });
});

router.get("/learn/:languageLevel/test", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  res.render("learn/actions/test", { languageLevel: req.params.languageLevel });
});

router.get("/learn/:languageLevel/test/start", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  await Question.findRandom({ languageLevel: req.params.languageLevel }, {}, { limit: 10 }, (e, questions) => {
    if (e) console.log(e);
    res.render("learn/actions/test-start", { testQuestions: questions, languageLevel: req.params.languageLevel });
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

  res.render("learn/actions/test-end", { languageLevel: req.params.languageLevel, correctAnswers: req.body.correctAnswers, amountOfQuestions: req.body.amountOfQuestions, percent: (req.body.correctAnswers / req.body.amountOfQuestions) * 100 });
});

module.exports = router;

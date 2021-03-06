const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");

// mongoose.connect("mongodb://localhost:27017/myAngLab", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

mongoose.connect("mongodb+srv://admin-kacper:" + process.env.DB_PASSWORD + "@cluster0.netpw.mongodb.net/AngLab?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const User = require("./../models/user");

const { redirectIfNotAuthenticated, getCurrentUser } = require("./../utilities/utilities");

const languageLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

router.get("/user", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const loggedUser = await getCurrentUser(req);

  if (loggedUser.role === "admin") {
    res.redirect("/admin");
    return;
  }

  let percentA1 = 0,
    percentA2 = 0,
    percentB1 = 0,
    percentB2 = 0,
    percentC1 = 0,
    percentC2 = 0;
  let testNumberA1 = 0,
    testNumberA2 = 0,
    testNumberB1 = 0,
    testNumberB2 = 0,
    testNumberC1 = 0,
    testNumberC2 = 0;

  loggedUser.testHistory.forEach((testRecord) => {
    if (testRecord.languageLevel === "A1") (percentA1 += testRecord.percent), testNumberA1++;
    if (testRecord.languageLevel === "A2") (percentA2 += testRecord.percent), testNumberA2++;
    if (testRecord.languageLevel === "B1") (percentB1 += testRecord.percent), testNumberB1++;
    if (testRecord.languageLevel === "B2") (percentB2 += testRecord.percent), testNumberB2++;
    if (testRecord.languageLevel === "C1") (percentC1 += testRecord.percent), testNumberC1++;
    if (testRecord.languageLevel === "C2") (percentC2 += testRecord.percent), testNumberC2++;
  });

  if (testNumberA1 !== 0) percentA1 = Math.floor(percentA1 / testNumberA1);
  if (testNumberA2 !== 0) percentA2 = Math.floor(percentA2 / testNumberA2);
  if (testNumberB1 !== 0) percentB1 = Math.floor(percentB1 / testNumberB1);
  if (testNumberB2 !== 0) percentB2 = Math.floor(percentB2 / testNumberB2);
  if (testNumberC1 !== 0) percentC1 = Math.floor(percentC1 / testNumberC1);
  if (testNumberC2 !== 0) percentC2 = Math.floor(percentC2 / testNumberC2);

  const overallUserScore = { A1: percentA1, A2: percentA2, B1: percentB1, B2: percentB2, C1: percentC1, C2: percentC2 };
  const numberOfTests = { A1: testNumberA1, A2: testNumberA2, B1: testNumberB1, B2: testNumberB2, C1: testNumberC1, C2: testNumberC2 };

  res.render("user/user", { loggedUser: loggedUser, overallUserScore: overallUserScore, numberOfTests: numberOfTests, notifications: loggedUser.notifications });
});

router.get("/user/test-history/:languageLevel", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (!languageLevels.includes(req.params.languageLevel)) {
    res.redirect("/learn")
    return
  }

  const loggedUser = await getCurrentUser(req);

  if (loggedUser.role === "admin") {
    res.redirect("/admin");
    return;
  }

  let percent = 0;
  let testNumber = 0;
  let perfectScoreBadge = false;
  let worstScoreBadge = false;
  const lastWeekTests = [];

  loggedUser.testHistory.forEach((testRecord) => {
    if (testRecord.languageLevel === req.params.languageLevel) {
      percent += testRecord.percent;
      testNumber++;
      if (testRecord.percent === 100) {
        perfectScoreBadge = true;
      }
      if (testRecord.percent === 0) {
        worstScoreBadge = true;
      }
      const testDate = testRecord.date.split("/");
      if (new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) < new Date(testDate[2], testDate[1] - 1, testDate[0])) {
        lastWeekTests.push(testRecord);
      }
    }
  });

  let lastWeekPercent = 0;
  lastWeekTests.forEach((testRecord) => {
    lastWeekPercent += testRecord.percent;
  });

  if (lastWeekTests.length !== 0) lastWeekPercent = Math.floor(lastWeekPercent / lastWeekTests.length);

  if (testNumber !== 0) percent = Math.floor(percent / testNumber);

  res.render("user/user-level-progress", { loggedUser: loggedUser, testHistory: loggedUser.testHistory.reverse(), overallLanguageLevelScore: percent, languageLevel: req.params.languageLevel, testNumber: testNumber, worstScoreBadge: worstScoreBadge, perfectScoreBadge: perfectScoreBadge, lastWeekTests: lastWeekTests.reverse(), lastWeekScore: lastWeekPercent });
});

router.get("/user/test-history/:loggedUserUsername/test-records/", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const loggedUser = await getCurrentUser(req);

  if (loggedUser.role === "admin") {
    res.redirect("/admin");
    return;
  }

  res.render("user/user-test-history", { loggedUser: loggedUser, searchQuery: "All", testHistory: loggedUser.testHistory.reverse(), languageLevel: req.params.languageLevel });
});

router.post("/user/test-history/:loggedUserUsername/test-records/search", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;
  
  const loggedUser = await getCurrentUser(req);
  res.render("user/user-test-history", { loggedUser: loggedUser, searchQuery: req.body.searchQueryLevel, testHistory: loggedUser.testHistory.reverse(), languageLevel: req.params.languageLevel });

});

router.get("/user/settings", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;
  const loggedUser = await getCurrentUser(req);

  if (loggedUser.role === "admin") {
    res.redirect("/admin");
    return;
  }

  let flashMessage = req.flash("oldPasswordError");
  if (flashMessage.length == 0) flashMessage = null;

  res.render("user/user-settings", { loggedUser, errorMessage: flashMessage });
});

router.post("/user/change-email", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  await User.updateOne({ _id: req.user._id }, { username: req.body.newEmail }, (e) => {
    if (e) console.log(e);
  });

  res.redirect("back");
});

router.post("/user/change-password", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);

  await bcrypt.compare(req.body.oldPassword, req.user.password, async (e, isMatch) => {
    if (e) console.log(e);

    if (!isMatch) {
      req.flash("oldPasswordError", "There was a problem with your old password.")
      res.redirect("back");
      return
    }

    await User.updateOne({ _id: req.user._id }, { password: hashedNewPassword }, (e) => {
      if (e) console.log(e);
    });
  
    req.logout();
  
    res.redirect("/login")
  });
});

router.post("/user/reset-progress", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  await User.updateOne({_id: req.user._id}, {languageLevelProgress: []}, (e) => {
    if (e) console.log(e);
  })

  res.redirect("back")
})

router.post("/user/delete-account", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  await User.deleteOne({_id: req.user._id}, (e) => {
    if (e) console.log(e);
  })

  res.redirect("/login")
})

router.post("/user/delete-notification/:notificationTitle", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  await User.updateOne({ _id: req.user._id }, { $pull: { notifications: { title: req.params.notificationTitle, content: req.body.notificationContent } } }, (e) => {
    if (e) console.log(e);
  });

  req.logout();

  res.redirect("back");
});

module.exports = router;

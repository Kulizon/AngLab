const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const bcrypt = require("bcryptjs");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;

// mongoose.connect("mongodb://localhost:27017/myAngLab", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

mongoose.connect("mongodb+srv://admin-kacper:" + process.env.DB_PASSWORD + "@cluster0.netpw.mongodb.net/AngLab?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const User = require("./../models/user");
const BannedUser = require("./../models/bannedUser");

passport.use(
  new LocalStrategy({ usernameField: "username" }, (username, password, done) => {
    User.findOne({ username: username }, async (e, user) => {
      if (e) console.log(e);

      if (!user) return done(null, false, { message: "That username is not registered" });

      await bcrypt.compare(password, user.password, (e, isMatch) => {
        if (e) console.log(e);

        if (isMatch) return done(null, user);

        return done(null, false, { message: "Password incorect" });
      });
    });
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (e, user) => {
    done(e, user);
  });
});

router.get("/login", (req, res) => {
  let flashMessage = req.flash().error || null;
  res.render("authentication/login", { message: flashMessage });
});

router.post("/login", passport.authenticate("local", { successRedirect: "/learn", failureRedirect: "/login", failureFlash: true }));

router.get("/register", (req, res) => {
  let flashMessage = req.flash("signupMessage");

  if (flashMessage.length == 0) flashMessage = null;

  res.render("authentication/register", { message: flashMessage });
});

router.post("/register", async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  if (req.body.username === "" || req.body.password === "" || req.body.name === "") {
    req.flash("signupMessage", "Wypełnij wszystkie pola.");
    res.redirect("/register");
    return;
  }

  const bannedUser = await BannedUser.findOne({ username: req.body.username }, (e, bannedUser) => {
    if (e) console.log(e);
    return bannedUser;
  });

  if (bannedUser) {
    req.flash("signupMessage", "Email ten został zbanowany.");
    res.redirect("/register");
    return;
  }

  const user = await User.findOne({ username: req.body.username }, (e, user) => {
    if (e) console.log(e);
    return user;
  });

  if (user !== null) {
    req.flash("signupMessage", "Email has already been taken.");
    res.redirect("/register");
    return;
  }

  const newUser = new User({ username: req.body.username, password: hashedPassword, role: "user", name: req.body.name, languageLevelProgress: [], testHistory: [], notifications: [{ title: "Witaj w AngLab...", content: "Poznawaj, ucz się, trenuj i poprawiaj swoje wyniki!" }] });
  newUser.save();

  res.redirect("/login");
});

router.get("/log-out", (req, res) => {
  req.logout();
  res.redirect("/login");
});

module.exports = router;

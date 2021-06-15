const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const socket = require("socket.io");
const session = require("express-session");
const flash = require("connect-flash");
const dotenv = require("dotenv").config();
const passport = require("passport");
const favicon = require('serve-favicon');

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
express.urlencoded({ extended: true });
app.set("view engine", "ejs");
app.use(session({ secret: "process.env.SECRET", resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(favicon(__dirname + '/public/images/favicon.ico'));

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log("Server started on port 3000");
});

const io = socket(server);
app.use((req, res, next) => {
  req.io = io;
  return next();
});

// mongoose.connect("mongodb://localhost:27017/myAngLab", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

mongoose.connect("mongodb+srv://admin-kacper:"+process.env.DB_PASSWORD+"@cluster0.netpw.mongodb.net/AngLab?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

const authenticationRouter = require("./routes/authentication")
app.use(authenticationRouter)

const learnRouter = require("./routes/learn")
app.use(learnRouter);

const landingRouter = require("./routes/landing")
app.use(landingRouter);

const userRouter = require("./routes/user")
app.use(userRouter);

const adminRouter = require("./routes/admin")
app.use(adminRouter);

const { redirectIfNotAuthenticated} = require("./utilities/utilities");
const User = require("./models/user");

app.get("/donate", (req, res) => {
  const {redirectIfNotAuthenticated} = require("./utilities/utilities");
  
  if (redirectIfNotAuthenticated(req, res)) return;

  res.render("donate", {loggedUser: req.user})
})

app.get("/darkmode", async (req, res) => {
  if (redirectIfNotAuthenticated(req, res)) return;

  if (req.user.options.darkmode) {
    await User.updateOne({ _id: req.user._id }, { options: { darkmode: false } }, (e) => {
      if (e) console.log(e);
    });
  }

  if (!req.user.options.darkmode) {
    await User.updateOne({ _id: req.user._id }, { options: { darkmode: true } }, (e) => {
      if (e) console.log(e);
    });
  }

  res.redirect("back");
});




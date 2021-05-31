const express = require("express");
const ejs = require("ejs");
const mongoose = require("mongoose");
const socket = require("socket.io");
const session = require("express-session");
const flash = require("connect-flash");
const dotenv = require("dotenv").config();
const passport = require("passport");

const app = express();

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
express.urlencoded({ extended: true });
app.set("view engine", "ejs");
app.use(session({ secret: "process.env.SECRET", resave: true, saveUninitialized: true, searchQuery: 'All' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

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



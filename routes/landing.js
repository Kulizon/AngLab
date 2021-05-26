const express = require("express");
const router = express.Router();
const nodemailer = require('nodemailer');

router.get("/", (req, res) => {
    let flashMessageSuccess = req.flash('sendMessageSuccess') || null;
    let flashMessageError = req.flash('sendMessageError') || null;
  
    res.render("landing/landing", { messageSuccess: flashMessageSuccess, messageError: flashMessageError });
  });
  
  router.post("/send-message", async (req, res) => {
  
  const testAccount = await nodemailer.createTestAccount();
  
  const transporter = nodemailer.createTransport({
    // service: 'gmail',
    // auth: {
    //   user: process.env.MAIL_USER,
    //   pass: process.env.MAIL_PASSWORD
    // }
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user, 
      pass: testAccount.pass, 
    },
  });
  
    
  const mailOptions = {
    from: 'kontakt.dohouse@gmail.com',
    to: 'kulixon261@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!'
  };
  
  let ifError;
  
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      ifError = true;
      return
    } 
  
    ifError = false;
    console.log('Email sent: ' + info.response);
    
  
  });
    ifError ? req.flash("sendMessageError", "Something went wrong.") : req.flash("sendMessageSuccess", "Message sent successfully.");
    res.redirect("/#contact")
  })

  module.exports = router
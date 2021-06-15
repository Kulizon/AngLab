const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

router.get("/", (req, res) => {
  let flashMessageSuccess = req.flash("sendMessageSuccess") || null;
  let flashMessageError = req.flash("sendMessageError") || null;

  res.render("landing/landing", { messageSuccess: flashMessageSuccess, messageError: flashMessageError });
});

router.post("/send-message", async (req, res) => {
  const output = `
    <h3>Name: ${req.body.name}</h3>
    <h3>Email: ${req.body.email}</h3>
    <h3>Subject: ${req.body.subject}</h3>
    <p>${req.body.message}</p>
  `;

  const transporter = nodemailer.createTransport({
    host: "mail.dohouse.pl",
    port: 465,
    secure: true,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "AngLab Contact test@dohouse.pl",
    to: process.env.USER_MAIL,
    subject: "AngLab New Message!",
    text: "New Message!",
    html: output,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      req.flash("sendMessageError", "Something went wrong.");
      res.redirect("/#contact");
      return;
    }

    console.log("Email sent: " + info.response);
    req.flash("sendMessageSuccess", "Message sent successfully.");
    res.redirect("/#contact");
  });
});

module.exports = router;

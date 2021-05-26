const socket = io();
const form = document.querySelector("form");
const submitButton = document.querySelector("button[type='submit']")
const questionIds = document.querySelectorAll(".question-group input[type='hidden']")
const feedbackTexts = document.querySelectorAll(".question-group h6")
const summarizeForm = document.getElementById("summarize-form")

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const testAnswers = [];

  let i = 0
  let amountOfQuestions = 0;

  for (let n = 0; n < questionIds.length; n++) {
    let answer;
    
    let questionID;

    for (i; i < e.target.length; i++) {
      if (e.target[i].type === "hidden") {
        questionID = e.target[i].value
        amountOfQuestions++
        break
      }
    }
  
    for (i; i < e.target.length; i++) {
      if (e.target[i].type === "radio" && e.target[i].checked) {
        answer = e.target[i].value
        break
      }
    }
   
    testAnswers.push({questionID: questionID, answer: answer})

    i++
  }

  submitButton.disabled = true;
  socket.emit("testAnswers", testAnswers, amountOfQuestions);
});

socket.on("testFeedback", (feedback, amountOfQuestions) => {
  if (feedback === undefined) return

  console.log(feedback, amountOfQuestions);

  let correctAnswers = 0;

  for (let i = 0; i < amountOfQuestions; i++) {
    feedbackTexts[i].innerText = "Wrong"
    feedbackTexts[i].style.color = '#D71C38'
    if (feedback[i] === null) {
      continue
    }


    if (questionIds[i].value === feedback[i].questionID) {
      feedbackTexts[i].innerText = "Correct"
      feedbackTexts[i].style.color = '#88C03D'
      correctAnswers++
  }}

  summarizeForm.style.display = "block"
  summarizeForm[0].value = correctAnswers
  summarizeForm[1].value = amountOfQuestions
})

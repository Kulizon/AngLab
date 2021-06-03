const socket = io();
const forms = document.querySelectorAll(".question-form")
const questionIDs = document.querySelectorAll(".questionID")
const hints = document.querySelectorAll("p")

const loadMoreForm = document.querySelectorAll(".loadMoreForm")

for (let i = 0; i < forms.length; i++) {
    forms[i].addEventListener("submit", (e) => {
        e.preventDefault()
        for (let n = 0; n < e.target.length; n++) {
            if (e.target[n].checked) {
                socket.emit("answer", {chosenAnswer: e.target[n].value, questionID: questionIDs[i].value, iteration: i})
            }
        }
    })
}

socket.on("answerCorrect", (feedback) => {
    hints[feedback.iteration].style.display = "none"
    setTimeout(() => {
        hints[feedback.iteration].style.display = "block"
        hints[feedback.iteration].innerText = feedback.feedback
    }, 150);
   
})

const socket = io();
const levelForm = document.getElementById("levelForm");
const subjectsDropdown = document.getElementById("subjects");
const questionForm = document.getElementById("questionForm");
const levelHiddenInput = document.getElementById("levelHiddenInput");
const subjectHiddenInput = document.getElementById("subjectHiddenInput");

levelForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const chosenLevel = e.target.elements.level.value;

  levelHiddenInput.value = chosenLevel

  if (subjectHiddenInput && subjectHiddenInput.value) {
    const defaultSubject = subjectHiddenInput.value
    socket.emit("chosenLevel", {chosenLevel: chosenLevel, defaultSubject: defaultSubject});
    return
  }
  socket.emit("chosenLevel", {chosenLevel: chosenLevel});
  
});

questionForm.style.display = "none";

socket.on("subjects", (subjects) => {
  for (let i = 0; i < subjectsDropdown.options.length; i++) {
    subjectsDropdown.innerHTML = "";
  }

  for (let i = 0; i < subjects.subjects.length; i++) {
    let option = document.createElement("option");
    if (subjects.defaultSubject) {
      if (subjects.defaultSubject === subjects.subjects[i].subject) {
        option.selected = "selected"
      }
    }
    option.value = subjects.subjects[i].subject
    option.text = subjects.subjects[i].subject
    subjectsDropdown.add(option);
  }

  questionForm.style.display = "grid";
});

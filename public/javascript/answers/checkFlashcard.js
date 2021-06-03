const socket = io();

let flashcards = document.querySelectorAll(".flashcards");
let buttons = document.querySelectorAll(".flashcard-button");
let nextButtons = document.querySelectorAll(".flashcard-next");
let userInputs = document.querySelectorAll(".flashcard-translation");
let correctTranslations = document.querySelectorAll(".flashcard-correct-translation-input");
let feedback = document.querySelectorAll(".flashcard-correct-translation");
let flashcardsSets = document.querySelector(".flashcard-sets");

let indexOfCurrentFlashcard = 0;

const addEventListeners = () => {
  for (let i = 0; i < buttons.length; i++) {
    flashcards = document.querySelectorAll(".flashcards");
    buttons = document.querySelectorAll(".flashcard-button");
    nextButtons = document.querySelectorAll(".flashcard-next");
    userInputs = document.querySelectorAll(".flashcard-translation");
    correctTranslations = document.querySelectorAll(".flashcard-correct-translation-input");
    flashcardsSets = document.querySelector(".flashcard-sets");
    feedback = document.querySelectorAll(".flashcard-correct-translation");
  
    buttons[i].addEventListener("click", () => {
      feedback[i].innerHTML = "<span>Wrong!</span> The correct translation is: " + correctTranslations[i].value;
      feedback[i].classList.add("wrong");
      if (userInputs[i].value === correctTranslations[i].value) {
        feedback[i].innerHTML = "<span>Good!</span>";
        feedback[i].classList.remove("wrong");
        feedback[i].classList.add("correct");
      }
  
      nextButtons[i].style.display = "block";
    });
  
    nextButtons[i].addEventListener("click", () => {
      if (flashcards.length - 1 === indexOfCurrentFlashcard) {
        indexOfCurrentFlashcard = 0;
        i = indexOfCurrentFlashcard;
        socket.emit("getFlashcards");
        return
      }

  
      flashcards[i].style.display = "none";
      buttons[i].style.display = "none";
      nextButtons[i].style.display = "none";
      feedback[i].style.display = "none";
      flashcards[i + 1].style.display = "flex";
      buttons[i + 1].style.display = "block";
  
      indexOfCurrentFlashcard++;
    });
  }
}

const createFlashcard = (card) => {
  const newFlashcards = document.createElement("div");
  newFlashcards.classList.add("flashcards");

  const firstFlashcard = document.createElement("div");
  firstFlashcard.classList.add("flashcard");
  const word = document.createElement("h3");
  word.innerText = card.word;
  firstFlashcard.appendChild(word);

  const secondFlashcard = document.createElement("div");
  secondFlashcard.classList.add("flashcard");
  const translationInput = document.createElement("input");
  translationInput.classList.add("flashcard-translation")
  translationInput.setAttribute("type", "text");
  secondFlashcard.appendChild(translationInput);

  newFlashcards.appendChild(firstFlashcard);
  newFlashcards.appendChild(secondFlashcard);

  const correctTranslation = document.createElement("h4");
  correctTranslation.innerText = ""
  correctTranslation.classList.add("flashcard-correct-translation")
  const correctTranslationInput = document.createElement("input");
  correctTranslationInput.setAttribute("type", "hidden");
  correctTranslationInput.setAttribute("value", card.translation);
  correctTranslationInput.classList.add("flashcard-correct-translation-input");
  const button = document.createElement("button");
  button.classList.add("flashcard-button");
  button.innerText = "Check";
  const nextButton = document.createElement("button");
  nextButton.classList.add("flashcard-next");
  nextButton.classList.add("invert-colors");
  nextButton.innerText = "Next";

  flashcardsSets.appendChild(newFlashcards);
  flashcardsSets.appendChild(correctTranslation);
  flashcardsSets.appendChild(correctTranslationInput);
  flashcardsSets.appendChild(button);
  flashcardsSets.appendChild(nextButton);
}

addEventListeners()


socket.on("flashcards", (flashcards) => {
  while (flashcardsSets.firstChild) {
    flashcardsSets.removeChild(flashcardsSets.firstChild)
  }

  flashcardsSets.innerHTML = '';

  flashcards.forEach((card) => {
    createFlashcard(card)
  })

  indexOfCurrentFlashcard = 0
  addEventListeners()
});


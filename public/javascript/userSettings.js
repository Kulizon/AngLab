const buttons = document.querySelectorAll("button[type='button']");
const confirmationModals = document.querySelectorAll(".confirmation");

const oldPasswordInput = document.getElementById("old-password-input");
const passwordInput = document.getElementById("new-password-input");
const passwordInputConfirmation = document.getElementById("new-password-confirmation-input");

const emailInput = document.getElementById("new-email-input");
const emailInputConfirmation = document.getElementById("new-email-confirmation-input");

const inputErrors = document.querySelectorAll("form h5");

buttons.forEach((button, i) => {
  button.addEventListener("click", () => {
    if (i === 0) {
      if (emailInput.value.trim() === '' || emailInputConfirmation.value.trim() === '') {
        inputErrors[0].style.display = "block";
        setTimeout(() => {
          inputErrors[0].innerText = "At least one of the inputs is missing.";
        }, 10);
        return
      }

      if (emailInput.value !== emailInputConfirmation.value) {
        inputErrors[0].style.display = "block";
        setTimeout(() => {
          inputErrors[0].innerText = "Your emails doesn't match.";
        }, 10);
        return
      }
    }

    if (i === 1) {
        if (passwordInput.value.trim() === '' || passwordInput.value.trim() === '' || oldPasswordInput.value.trim() === '') {
            inputErrors[1].style.display = "block";
            setTimeout(() => {
              inputErrors[1].innerText = "At least one of the inputs is missing.";
            }, 10);
            return
          }

      if (passwordInput.value !== passwordInputConfirmation.value) {
        inputErrors[1].style.display = "block";
        setTimeout(() => {
          inputErrors[1].innerText = "Your passwords doesn't match.";
        }, 10);
      }
    }

    confirmationModals[i].style.display = "block";
    backdrop.style.display = "block";
    setTimeout(() => {
      backdrop.style.opacity = "1";
      confirmationModals[i].style.opacity = "1";
    }, 10);
  });
});

backdrop.addEventListener("click", () => {
  confirmationModals.forEach((modal) => {
    modal.style.opacity = "0";
    backdrop.style.opacity = "0";
    setTimeout(() => {
      backdrop.style.display = "none";
      modal.style.display = "none";
    }, 100);
  });
});

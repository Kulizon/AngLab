const select = document.getElementById("adminSelect");
const inputs = document.querySelectorAll(".notification-input");
const allUsersCheckbox = document.getElementById("allCheckboxesCheckedInput");
const allCheckboxes = document.querySelectorAll("input[type='checkbox']:not(#allCheckboxesCheckedInput)");

const showMessageInput = () => {
  if (select.value === "message") {
    inputs.forEach((input) => {
      input.style.display = "flex";
    });
    return;
  }
  inputs.forEach((input) => {
    input.style.display = "none";
  });
};

allUsersCheckbox.addEventListener("change", () => {
  if (!allUsersCheckbox.checked) {
    allCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
  } else {
    allCheckboxes.forEach((checkbox) => {
      checkbox.checked = true;
    });
  }
});
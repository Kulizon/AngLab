const socket = io();
const langChoice = document.querySelectorAll(".lang-choice");
const subjectLessons = document.querySelectorAll(".lang-choice h2");
const percentProgress = document.querySelectorAll(".lang-choice h4");
const numberProgress = document.querySelectorAll(".lang-choice h5");

window.addEventListener( "pageshow", ( event ) => {
  const historyTraversal = event.persisted || 
                         ( typeof window.performance != "undefined" && 
                              window.performance.navigation.type === 2 );
  if ( historyTraversal ) {
    window.location.reload();
  }
});

socket.emit("getSubjectProgress");

socket.on("subjectProgress", (progress, lessons) => {
  console.log(progress);
  console.log(lessons);
  for (let i = 0; i < subjectLessons.length - 1; i++) {
    let levelLessons = 0;
    let doneLessons = 0;

    console.log(subjectLessons[i]);

    lessons.forEach((lesson) => {
      if (lesson.subject === subjectLessons[i].innerText) {
        levelLessons++;
      }
    });


    progress.forEach((progress) => {
      if (progress.languageLevelSubject === subjectLessons[i].innerText) {
        doneLessons++;
      }
    });

    numberProgress[i].innerText = `${doneLessons}/${levelLessons}`;
    percentProgress[i].innerText = Math.floor((doneLessons / levelLessons) * 100) + "%";

    if (levelLessons === 0) percentProgress[i].innerText = "0%";

    if (levelLessons < 1) {
      numberProgress[i].style.display = "none"
      percentProgress[i].style.display = "none"
    }
  }
});

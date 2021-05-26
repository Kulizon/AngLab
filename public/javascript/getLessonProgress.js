const socket = io();
const progressDisplay = document.querySelectorAll(".lang-choice h5");

window.addEventListener( "pageshow", ( event ) => {
  const historyTraversal = event.persisted || 
                         ( typeof window.performance != "undefined" && 
                              window.performance.navigation.type === 2 );
  if ( historyTraversal ) {
    window.location.reload();
  }
});

socket.emit("getLessonProgress");

socket.on("lessonProgress", (progress, lessons) => {
  let ifContinue;

  for (let i = 0; i < lessons.length; i++) {
    ifContinue = false;

    for (let n = 0; n < progress.length; n++) {
      if (lessons[i].title === progress[n].title && lessons[i].languageLevel === progress[n].languageLevel && lessons[i].subject === progress[n].languageLevelSubject) {
        progressDisplay[i].innerText = "Done";
        ifContinue = true;
      }
    }
    if (ifContinue) continue;

    progressDisplay[i].innerText = "Not Done";
  }
});

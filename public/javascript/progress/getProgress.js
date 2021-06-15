const socket = io();
const languageLevels = document.querySelectorAll(".lang-choices h2");
const percentProgress = document.querySelectorAll("h4:not(.logo__brand)");
const numberProgress = document.querySelectorAll("h5");

window.addEventListener( "pageshow", ( event ) => {
  const historyTraversal = event.persisted || 
                         ( typeof window.performance != "undefined" && 
                              window.performance.navigation.type === 2 );
  if ( historyTraversal ) {
    window.location.reload();
  }
});

socket.emit("getProgress");

socket.on("progress", (progress, lessons) => {
  for (let i = 0; i < languageLevels.length; i++) {
    let levelLessons = 0;
    let doneLessons = 0;

    lessons.forEach((lesson) => {
      if (lesson.languageLevel === languageLevels[i].innerText) {
        levelLessons ++;
      }
    });

    progress.forEach((progress) => {
        if (progress.languageLevel === languageLevels[i].innerText) {
            doneLessons ++;
        }
      });

    numberProgress[i].innerText = `${doneLessons}/${levelLessons}`;
    percentProgress[i].innerText = Math.floor(doneLessons/levelLessons * 100) + '%'


    if (levelLessons === 0) percentProgress[i].innerText = '0%'
  }
});

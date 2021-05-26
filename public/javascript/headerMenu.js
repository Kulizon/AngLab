const menuIcons = document.querySelectorAll(".lang-menu__option__dropdown-icon")
const dropdownLists = document.querySelectorAll(".lang-menu__option__dropdown")
const mainMenuIcon = document.getElementById("hamburger-icon")
const langMenu = document.querySelector(".lang-menu")


mainMenuIcon.addEventListener("click", () => {
    if (langMenu.style.display === "block") {   
        langMenu.style.opacity = "0" 
        setTimeout(() => {
            langMenu.style.display = "none"
        }, 100);
    } else {
        langMenu.style.display = "block"
        setTimeout(() => {
            
            langMenu.style.opacity = "1"
        }, 10);
    }
})

for (let i = 0; i < menuIcons.length; i++) {
    dropdownLists[i].style.display = "none"
}


for (let i = 0; i < menuIcons.length; i++) {
    menuIcons[i].addEventListener("click", () => {
        if (dropdownLists[i].style.display === "flex") {
            for (let j = 0; j < dropdownLists.length; j++) {
                dropdownLists[j].style.opacity = "0" 
                dropdownLists[j].style.height = "0px"
                menuIcons[j].style.transform = "rotate(0deg)"
                setTimeout(() => {
                    dropdownLists[i].style.display = "none"
                }, 100);
            }
            
            setTimeout(() => {
                dropdownLists[i].style.display = "none"
            }, 201);
        } 
        if (dropdownLists[i].style.display === "none") {
            for (let j = 0; j < dropdownLists.length; j++) {
                dropdownLists[j].style.opacity = "0" 
                dropdownLists[j].style.height = "0px"
                menuIcons[j].style.transform = "rotate(0deg)"
                setTimeout(() => {
                    dropdownLists[j].style.display = "none"
                }, 100);
            }
            setTimeout(() => {
                dropdownLists[i].style.display = "flex"
            }, 120);

            setTimeout(() => {
                dropdownLists[i].style.opacity = "1" 
                dropdownLists[i].style.height = "75px"
                menuIcons[i].style.transform = "rotate(180deg)"
            }, 141);
        } 
    })
}
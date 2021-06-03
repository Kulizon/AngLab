// const menuIcons = document.querySelectorAll(".lang-menu__option__dropdown-icon")
// const dropdownLists = document.querySelectorAll(".lang-menu__option__dropdown")
// const mainMenuIcon = document.getElementById("hamburger-icon")
// const langMenu = document.querySelector(".lang-menu")


// mainMenuIcon.addEventListener("click", () => {
//     if (langMenu.style.display === "block") {   
//         langMenu.style.opacity = "0" 
//         setTimeout(() => {
//             langMenu.style.display = "none"
//         }, 100);
//     } else {
//         langMenu.style.display = "block"
//         setTimeout(() => {
            
//             langMenu.style.opacity = "1"
//         }, 10);
//     }
// })

// for (let i = 0; i < menuIcons.length; i++) {
//     dropdownLists[i].style.display = "none"
// }


// for (let i = 0; i < menuIcons.length; i++) {
//     menuIcons[i].addEventListener("click", () => {
//         if (dropdownLists[i].style.display === "flex") {
//             for (let j = 0; j < dropdownLists.length; j++) {
//                 dropdownLists[j].style.opacity = "0" 
//                 dropdownLists[j].style.height = "0px"
//                 menuIcons[j].style.transform = "rotate(0deg)"
//                 setTimeout(() => {
//                     dropdownLists[i].style.display = "none"
//                 }, 100);
//             }
            
//             setTimeout(() => {
//                 dropdownLists[i].style.display = "none"
//             }, 201);
//         } 
//         if (dropdownLists[i].style.display === "none") {
//             for (let j = 0; j < dropdownLists.length; j++) {
//                 dropdownLists[j].style.opacity = "0" 
//                 dropdownLists[j].style.height = "0px"
//                 menuIcons[j].style.transform = "rotate(0deg)"
//                 setTimeout(() => {
//                     dropdownLists[j].style.display = "none"
//                 }, 100);
//             }
//             setTimeout(() => {
//                 dropdownLists[i].style.display = "flex"
//             }, 120);

//             setTimeout(() => {
//                 dropdownLists[i].style.opacity = "1" 
//                 dropdownLists[i].style.height = "75px"
//                 menuIcons[i].style.transform = "rotate(180deg)"
//             }, 141);
//         } 
//     })
// }

const userMenuIcon = document.getElementById("user-menu-icon");
const userMenu = document.querySelector(".user-menu");

const backdrop = document.querySelector(".backdrop");
const bellIcon = document.getElementById("bell-icon")
const notifications = document.querySelector(".notifications")

userMenuIcon.addEventListener("click", () => {
        if (userMenu.style.display === "flex") {   
            userMenu.style.opacity = "0" 
            setTimeout(() => {
                userMenu.style.display = "none"
            }, 100);
    } else {
        userMenu.style.display = "flex"
        setTimeout(() => {  
            userMenu.style.opacity = "1"
        }, 10);
    }
})

bellIcon.addEventListener("click", () => {
    userMenu.style.opacity = "0" 
    setTimeout(() => {
        userMenu.style.display = "none"
    }, 100);

    notifications.style.display = "flex"
    backdrop.style.display = "block"
    setTimeout(() => {
        notifications.style.opacity = "1"
        backdrop.style.opacity = "1"
    }, 10);
})

backdrop.addEventListener("click", () => {
    notifications.style.opacity = "0"
    backdrop.style.opacity = "0"
    setTimeout(() => {
        backdrop.style.display = "none"
        notifications.style.display = "none"
    }, 100);
})


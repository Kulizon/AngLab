

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

const contactIcon = document.querySelector(".contact-icon")
const contactInfo = document.querySelector(".contact-info")


contactIcon.addEventListener("click", () => {
    if (contactInfo.style.display === "block") {
        contactInfo.style.width = '0';

        setTimeout(() => {
            contactInfo.style.height = '0'
        }, 160);
        
        setTimeout(() => {
            contactInfo.style.display = "none"
        }, 310);
    } else {
        contactInfo.style.display = "block"

        setTimeout(() => {
            contactInfo.style.width = '17rem';
        }, 15);

        setTimeout(() => {
            contactInfo.style.height = '11.5rem'; 
        }, 200);
    }

    
})


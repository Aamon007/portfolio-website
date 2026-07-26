// System Log Auto-Update
const logBox = document.getElementById('logBox');
const logs = [
    "[SYS] ANALYZING SKILL TREE...",
    "[SYS] NEW JOB CLASS: NOC ENGINEER.",
    "[SYS] EQUIPMENT DETECTED: VIVOBOOK 16.",
    "[SYS] PLAYER STATUS: HEALTHY.",
    "[SYS] LOADING QUEST DATA..."
];

function updateLogs() {
    const p = document.createElement('p');
    p.innerText = logs[Math.floor(Math.random() * logs.length)];
    p.style.opacity = "0";
    logBox.appendChild(p);
    
    setTimeout(() => { p.style.opacity = "1"; p.style.transition = "0.5s"; }, 10);
    
    if (logBox.children.length > 5) {
        logBox.removeChild(logBox.children[0]);
    }
}

setInterval(updateLogs, 3000);

// Simple Glitch Effect on Header
const glitch = document.querySelector('.glitch');
setInterval(() => {
    glitch.style.transform = `translate(${Math.random()*2}px, ${Math.random()*2}px)`;
    setTimeout(() => glitch.style.transform = 'none', 50);
}, 2000);

const notifications = [
    "KNOWLEDGE IS THE ULTIMATE WEAPON IN THIS SYSTEM.",
    "EVERY CHALLENGE IS A HIDDEN QUEST FOR GROWTH.",
    "STRENGTH IS NOT GIVEN; IT IS BUILT THROUGH PERSISTENCE.",
    "THE SYSTEM REWARDS THOSE WHO NEVER STOP LEARNING."
];

const notiContainer = document.getElementById('notiTextContainer');

function showNotifications() {
    notiContainer.innerHTML = '';
    
    notifications.forEach((text, index) => {
        setTimeout(() => {
            const p = document.createElement('p');
            p.innerText = text;
            notiContainer.appendChild(p);
            
            // Animation စတင်ဖို့ နည်းနည်းစောင့်မယ်
            setTimeout(() => p.classList.add('show'), 50);
            
        }, index * 2000); // တစ်ကြောင်းနဲ့ တစ်ကြောင်း ၂ စက္ကန့်စီ ခြားပြီး ပေါ်လာမယ်
    });
}

showNotifications();

setInterval(showNotifications, 40000);

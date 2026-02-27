const target = document.getElementById('target-zone');
const projectile = document.getElementById('projectile');
const promptText = document.getElementById('prompt-text');
const modal = document.getElementById('reaction-modal');

let startTime, isWaiting = false, isLaunched = false, inputLocked = false;
let currentBallDuration = 500; // Thời gian bóng bay hiện tại
let lastTimes = [];
let bestTimeMs = localStorage.getItem('bestReaction') || Infinity;

if(bestTimeMs !== Infinity) {
    document.getElementById('best-time').textContent = (bestTimeMs / 1000).toFixed(3) + "s";
}

const ALLOWED_KEYS = ['KeyF', 'KeyG', 'Space'];

function handleTrigger(e) {
    if (e.code === 'Space' && !modal.classList.contains('hidden')) {
        e.preventDefault();
        resetGame();
        return;
    }
    if (inputLocked) return; 
    if (e.type === 'keydown' && !ALLOWED_KEYS.includes(e.code)) return;
    if (e.code === 'Space') e.preventDefault();

    if (isWaiting) {
        isWaiting = false;
        inputLocked = true; 
        promptText.textContent = "QUÁ SỚM!";
        promptText.style.color = "#ff0055";
        target.style.borderColor = "#ff0055";
        setTimeout(() => {
            inputLocked = false;
            startGame();
        }, 1000);
    } else if (isLaunched) {
        const reactionTimeMs = performance.now() - startTime;
        endGame(true, reactionTimeMs);
    }
}

window.addEventListener('keydown', handleTrigger);
target.addEventListener('mousedown', handleTrigger);

function startGame() {
    isWaiting = true;
    isLaunched = false;
    inputLocked = false;
    promptText.textContent = "ĐỢI...";
    promptText.style.color = "#444";
    target.style.borderColor = "#222";
    target.classList.remove('active');
    projectile.classList.add('hidden');
    
    const delay = Math.random() * 1500 + 500;
    setTimeout(() => {
        if (!isWaiting) return;
        launchProjectile();
    }, delay);
}

function launchProjectile() {
    isWaiting = false;
    isLaunched = true;
    target.classList.add('active');
    promptText.textContent = "NHẤN!";
    promptText.style.color = "#00f2ff";
    startTime = performance.now(); 

    // Tốc độ ngẫu nhiên từ 0.18s đến 0.5s
    currentBallDuration = Math.random() * (500 - 180) + 180;

    projectile.classList.remove('hidden');
    const startSide = Math.random() > 0.5 ? -100 : window.innerWidth + 100;
    projectile.style.left = startSide + "px";
    
    projectile.animate([
        { left: startSide + "px" },
        { left: "50%" }
    ], { duration: currentBallDuration, easing: 'linear' }).onfinish = () => {
        if (isLaunched) endGame(false); 
    };
}

function endGame(success, timeMs) {
    isLaunched = false;
    inputLocked = true; 
    projectile.classList.add('hidden');
    modal.classList.remove('hidden');

    const resultDisplay = document.getElementById('result-time');
    const evalDisplay = document.getElementById('evaluation');
    
    if (!success) {
        resultDisplay.textContent = "THẤT BẠI";
        evalDisplay.textContent = "QUÁ CHẬM!";
        evalDisplay.className = "evaluation eval-fail";
    } else {
        const seconds = (timeMs / 1000).toFixed(3);
        resultDisplay.textContent = seconds + "s";
        updateStats(timeMs);
        
        const timeSec = parseFloat(seconds);
        // THANG ĐO ADAPTIVE (Dựa trên phản xạ thực tế)
        if (timeSec <= 0.12) {
            evalDisplay.textContent = "⚡ PHẢN XẠ THẦN THÁNH";
            evalDisplay.className = "evaluation eval-god";
        } else if (timeSec <= 0.22) {
            evalDisplay.textContent = "🔥 RẤT TỐT";
            evalDisplay.className = "evaluation eval-great";
        } else if (timeSec <= 0.32) {
            evalDisplay.textContent = "✅ ỔN, ĐỦ CHƠI";
            evalDisplay.className = "evaluation eval-ok";
        } else {
            evalDisplay.textContent = "🧠 CẦN TẬP LUYỆN THÊM";
            evalDisplay.className = "evaluation eval-bad";
        }
    }
}

function updateStats(timeMs) {
    if (timeMs < bestTimeMs) {
        bestTimeMs = timeMs;
        localStorage.setItem('bestReaction', bestTimeMs);
        document.getElementById('best-time').textContent = (bestTimeMs / 1000).toFixed(3) + "s";
    }
    lastTimes.push(timeMs);
    if (lastTimes.length > 5) lastTimes.shift();
    const avgMs = lastTimes.reduce((a, b) => a + b) / lastTimes.length;
    document.getElementById('avg-time').textContent = (avgMs / 1000).toFixed(3) + "s";
}

function resetGame() {
    modal.classList.add('hidden');
    setTimeout(startGame, 50);
}

startGame();
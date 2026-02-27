let inputs = 0;
let isRunning = false;
let startTime = null;
const duration = 10;
let stabilityData = []; // Lưu số click mỗi giây

const clashZone = document.getElementById('clash-zone');
const timerDisplay = document.getElementById('timer');
const totalDisplay = document.getElementById('total-input');
const stabilityDisplay = document.getElementById('stability');

// Xử lý Input
const handleInput = (type) => {
    if (!isRunning) startClash();
    inputs++;
    totalDisplay.textContent = inputs;
    
    // Highlight UI
    const el = document.getElementById(`key-${type}`);
    const activeClass = `active-${type.toLowerCase()}`;
    el.classList.add(activeClass);
    setTimeout(() => el.classList.remove(activeClass), 50);
};

// Lắng nghe phím
window.addEventListener('keydown', (e) => {
    if (e.repeat) return; // Chặn spam do giữ phím
    if (e.code === 'KeyF') handleInput('F');
    if (e.code === 'KeyG') handleInput('G');
});

// Lắng nghe chuột
clashZone.onpointerdown = (e) => {
    if (e.button === 0) handleInput('LMB');
};

function startClash() {
    isRunning = true;
    inputs = 0;
    startTime = performance.now();
    clashZone.classList.add('fighting');
    clashZone.textContent = "CLASHING!!!";

    let lastSnapshot = 0;
    
    const interval = setInterval(() => {
        let elapsed = (performance.now() - startTime) / 1000;
        let remaining = duration - elapsed;

        // Tính độ ổn định mỗi giây
        if (Math.floor(elapsed) > lastSnapshot) {
            stabilityData.push(inputs - (stabilityData.reduce((a, b) => a + b, 0) || 0));
            lastSnapshot = Math.floor(elapsed);
            updateStability();
        }

        if (remaining <= 0) {
            clearInterval(interval);
            endClash();
        } else {
            timerDisplay.textContent = remaining.toFixed(1) + 's';
        }
    }, 100);
}

function updateStability() {
    if (stabilityData.length < 2) return;
    const avg = inputs / stabilityData.length;
    // Tính độ lệch chuẩn đơn giản
    const variance = stabilityData.reduce((a, b) => a + Math.abs(b - avg), 0) / stabilityData.length;
    const score = Math.max(0, 100 - (variance * 5));
    stabilityDisplay.textContent = Math.round(score) + "%";
}

function endClash() {
    isRunning = false;
    clashZone.classList.remove('fighting');
    const finalCPS = (inputs / duration).toFixed(1);
    document.getElementById('final-cps').textContent = finalCPS;
    showResult(parseFloat(finalCPS));
}

function showResult(cps) {
    const modal = document.getElementById('result-modal');
    const badge = document.getElementById('rank-badge');
    // Logic Rank tương tự như trang CPS nhưng CPS yêu cầu sẽ cao hơn 
    // vì đây là kết hợp cả phím lẫn chuột
    let rank = cps > 25 ? "⭐⭐⭐⭐⭐ GOD SPEED" : (cps > 18 ? "⭐⭐⭐⭐ ELITE" : "⭐⭐ AMATEUR");
    badge.textContent = rank;
    modal.classList.remove('hidden');
}
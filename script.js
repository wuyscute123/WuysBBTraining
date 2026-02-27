let clicks = 0;
let startTime = null;
let timerDuration = 5;
let isRunning = false;
let timerId = null;

const clickArea = document.getElementById('click-area');
const clickDisplay = document.getElementById('click-count');
const timerDisplay = document.getElementById('timer');
const cpsDisplay = document.getElementById('cps-value');
const resultModal = document.getElementById('result-modal');

// Chặn menu chuột phải
window.addEventListener('contextmenu', e => e.preventDefault());

// Chọn thời gian
document.querySelectorAll('.time-btn').forEach(btn => {
    btn.onclick = () => {
        if (isRunning) return;
        document.querySelector('.time-btn.active').classList.remove('active');
        btn.classList.add('active');
        timerDuration = parseInt(btn.dataset.time);
        resetTest();
    };
});

clickArea.onpointerdown = (e) => {
    if (e.button !== 0) return; // Chỉ nhận chuột trái
    
    if (!isRunning) startTest();
    
    clicks++;
    clickDisplay.textContent = clicks;
    
    // Animation đơn giản khi click
    clickArea.style.borderColor = 'var(--primary-neon)';
    setTimeout(() => clickArea.style.borderColor = '#333', 50);
};

function startTest() {
    isRunning = true;
    clicks = 0;
    startTime = performance.now();
    
    timerId = setInterval(() => {
        let elapsed = (performance.now() - startTime) / 1000;
        let remaining = timerDuration - elapsed;
        
        if (remaining <= 0) {
            endTest();
        } else {
            timerDisplay.textContent = remaining.toFixed(1) + 's';
            cpsDisplay.textContent = (clicks / elapsed).toFixed(1);
        }
    }, 100);
}

function endTest() {
    isRunning = false;
    clearInterval(timerId);
    timerDisplay.textContent = '0.0s';
    const finalCps = (clicks / timerDuration).toFixed(1);
    showResult(finalCps);
}

function showResult(cps) {
    const badge = document.getElementById('rank-badge');
    const desc = document.getElementById('rank-desc');
    let rank = "";
    
    if (cps < 7) { rank = "⭐ Gà Mờ"; badge.style.color = "#888"; desc.textContent = "Tay bạn hơi chậm rồi!"; }
    else if (cps < 10) { rank = "⭐⭐ Tạm Được"; badge.style.color = "#4CAF50"; desc.textContent = "Cố gắng tí nữa là ổn."; }
    else if (cps < 15) { rank = "⭐⭐⭐ Khá"; badge.style.color = "#2196F3"; desc.textContent = "Bạn có tố chất đấy!"; }
    else if (cps < 21) { rank = "⭐⭐⭐⭐ Pro"; badge.style.color = "#9C27B0"; desc.textContent = "Tốc độ đáng kinh ngạc!"; }
    else { rank = "⭐⭐⭐⭐⭐ GOD"; badge.style.color = "#FF1744"; desc.textContent = "Hacker hay là Quái vật?"; }

    badge.textContent = rank;
    resultModal.classList.remove('hidden');
}

function resetTest() {
    clicks = 0;
    isRunning = false;
    clickDisplay.textContent = '0';
    timerDisplay.textContent = timerDuration + '.0s';
    cpsDisplay.textContent = '0.0';
    resultModal.classList.add('hidden');
}
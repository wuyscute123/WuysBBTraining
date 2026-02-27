const ball = document.getElementById('ball');
const playerArea = document.getElementById('user-player');
const aiArea = document.getElementById('ai-player');
const playerCircle = document.getElementById('player-circle');
const aiCircle = document.querySelector('.ai-circle');
const speedDisplay = document.getElementById('current-speed');

// --- Cấu hình Vị trí & Tốc độ ---
let playerX = 50, playerY = 85;
let aiX = 50, aiY = 15;
let ballX = 50, ballY = 50;
let directionX = 0, directionY = 0;
let speed = 15;
let isGameOver = false;
let currentTarget = 'PLAYER'; 
const keys = {};

// Hệ thống Parry
let parryState = 'IDLE'; 

// Input
window.addEventListener('keydown', e => keys[e.code] = true);
window.addEventListener('keyup', e => keys[e.code] = false);
window.addEventListener('keydown', e => { if(e.code === 'KeyF') triggerParry(); });
window.addEventListener('pointerdown', e => { if(e.button === 0) triggerParry(); });

function triggerParry() {
    if (parryState !== 'IDLE' || isGameOver) return;
    parryState = 'ACTIVE';
    playerCircle.classList.add('active');
    setTimeout(() => {
        if (parryState === 'ACTIVE') {
            parryState = 'COOLDOWN';
            playerCircle.classList.remove('active');
            setTimeout(() => parryState = 'IDLE', 400);
        }
    }, 500);
}

function adjustSpeed(amount) {
    speed = Math.max(5, speed + amount);
    speedDisplay.textContent = Math.floor(speed);
}

function gameLoop() {
    if (isGameOver) return;

    // 1. NGƯỜI CHƠI DI CHUYỂN (Tốc độ 0.45)
    const moveStep = 0.45; 
    if (keys['KeyW']) playerY = Math.max(5, playerY - moveStep);
    if (keys['KeyS']) playerY = Math.min(95, playerY + moveStep);
    if (keys['KeyA']) playerX = Math.max(5, playerX - moveStep);
    if (keys['KeyD']) playerX = Math.min(95, playerX + moveStep);
    
    playerArea.style.left = playerX + "%";
    playerArea.style.top = playerY + "%";

    // 2. AI DI CHUYỂN (Bám bóng chậm lại để tương ứng tốc độ người chơi)
    aiX += (ballX - aiX) * 0.07; 
    aiArea.style.left = aiX + "%";

    // 3. LOGIC BÓNG ĐUỔI THEO (HOMING)
    let targetObj = (currentTarget === 'PLAYER') ? {x: playerX, y: playerY} : {x: aiX, y: aiY};
    let dx = targetObj.x - ballX;
    let dy = targetObj.y - ballY;
    let angle = Math.atan2(dy, dx);

    directionX += (Math.cos(angle) - directionX) * 0.15;
    directionY += (Math.sin(angle) - directionY) * 0.15;

    ballX += directionX * (speed * 0.05);
    ballY += directionY * (speed * 0.05);

    ball.style.left = ballX + "%";
    ball.style.top = ballY + "%";

    // 4. KIỂM TRA VA CHẠM (HITBOX ĐÃ CÂN BẰNG)
    let distToPlayer = Math.sqrt((ballX - playerX)**2 + (ballY - playerY)**2);
    let distToAI = Math.sqrt((ballX - aiX)**2 + (ballY - aiY)**2);

    // Cân bằng Hitbox: Cả hai đều dùng chung bán kính 9% (Parry) và 4% (Death)
    const PARRY_RADIUS = 9;
    const DEATH_RADIUS = 4;

    // Player Logic
    if (distToPlayer < PARRY_RADIUS && currentTarget === 'PLAYER') {
        if (parryState === 'ACTIVE') {
            currentTarget = 'AI';
            speed += 0.8;
            parryState = 'IDLE'; 
            playerCircle.classList.remove('active');
            speedDisplay.textContent = Math.floor(speed);
        } else if (distToPlayer < DEATH_RADIUS) { 
            endGame("BẠN ĐÃ THUA!");
        }
    }

    // AI Logic (Bây giờ Hitbox đã nhỏ lại bằng người chơi)
    if (distToAI < PARRY_RADIUS && currentTarget === 'AI') {
        // AI chỉ đỡ được nếu bóng lọt vào tầm 9% của nó
        currentTarget = 'PLAYER';
        speed += 0.8;
        aiCircle.classList.add('active');
        setTimeout(() => aiCircle.classList.remove('active'), 150);
        speedDisplay.textContent = Math.floor(speed);
    }

    requestAnimationFrame(gameLoop);
}

function endGame(msg) {
    isGameOver = true;
    document.getElementById('result-modal').classList.remove('hidden');
    document.getElementById('result-status').textContent = msg;
    document.getElementById('max-speed').textContent = Math.floor(speed);
}

gameLoop();
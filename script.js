const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;
let snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];  // 뱀의 초기 길이
let food = { x: Math.floor(Math.random() * 20) * boxSize, y: Math.floor(Math.random() * 20) * boxSize };
let direction = { x: boxSize, y: 0 };  // 오른쪽으로 이동 시작
let score = 0;
let gameRunning = true;
let snakeHeadImg = new Image();
snakeHeadImg.src = 'head.png';  // 뱀의 머리 이미지
let currentAngle = 0;  // 뱀 머리 회전 각도

// 방향 전환
document.addEventListener("keydown", changeDirection);

// 터치 이벤트 처리 (모바일 지원)
canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchMove(event) {
    if (!gameRunning) return;
    
    const touch = event.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction.x === 0) {
            direction = { x: boxSize, y: 0 };  // 오른쪽
            currentAngle = 90;
        } else if (dx < 0 && direction.x === 0) {
            direction = { x: -boxSize, y: 0 };  // 왼쪽
            currentAngle = -90;
        }
    } else {
        if (dy > 0 && direction.y === 0) {
            direction = { x: 0, y: boxSize };  // 아래
            currentAngle = 180;
        } else if (dy < 0 && direction.y === 0) {
            direction = { x: 0, y: -boxSize };  // 위
            currentAngle = 0;
        }
    }
}

// 방향 전환 처리 (키보드 입력)
function changeDirection(event) {
    if (event.key === "ArrowUp" && direction.y === 0) {
        direction = { x: 0, y: -boxSize };  // 위로
        currentAngle = 0;
    } else if (event.key === "ArrowDown" && direction.y === 0) {
        direction = { x: 0, y: boxSize };  // 아래로
        currentAngle = 180;
    } else if (event.key === "ArrowLeft" && direction.x === 0) {
        direction = { x: -boxSize, y: 0 };  // 왼쪽으로
        currentAngle = -90;
    } else if (event.key === "ArrowRight" && direction.x === 0) {
        direction = { x: boxSize, y: 0 };  // 오른쪽으로
        currentAngle = 90;
    }
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;

    // 뱀 이동
    const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // 벽에 부딪히거나 자기 자신과 충돌하면 게임 오버
    if (newHead.x < 0 || newHead.y < 0 || newHead.x >= canvas.width || newHead.y >= canvas.height || snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameRunning = false;  // 게임 오버
        alert("Game Over! Your Score: " + score);
        document.location.reload();  // 페이지 새로고침으로 게임 리셋
        return;
    }
    
    // 먹이 먹기
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        document.getElementById("score").innerText = "Score: " + score;
        food = { x: Math.floor(Math.random() * 20) * boxSize, y: Math.floor(Math.random() * 20) * boxSize };
    } else {
        snake.pop();  // 먹이를 먹지 않으면 꼬리 제거
    }
    
    snake.unshift(newHead);  // 새로운 머리 추가
    
    // 화면 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 뱀 그리기 (긴 캡슐 모양)
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 뱀의 머리 이미지 회전 처리
            ctx.save();
            ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);  // 중심으로 이동
            ctx.rotate((currentAngle * Math.PI) / 180);  // 각도에 따라 회전
            ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);  // 이미지 그리기
            ctx.restore();
        } else {
            // 뱀의 몸통 (#D52A1E)
            ctx.fillStyle = "#D52A1E";
            ctx.beginPath();
            ctx.arc(segment.x + boxSize / 2, segment.y + boxSize / 2, boxSize / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
    
    // 먹이 그리기 (초록색)
    ctx.fillStyle = "#00FF00";
    ctx.beginPath();
    ctx.arc(food.x + boxSize / 2, food.y + boxSize / 2, boxSize / 2, 0, 2 * Math.PI);
    ctx.fill();
}

// 게임 시작
setInterval(gameLoop, 100);

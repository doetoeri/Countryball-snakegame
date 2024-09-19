const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;
let snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];  // 뱀의 초기 길이
let food = { x: Math.floor(Math.random() * 20) * boxSize, y: Math.floor(Math.random() * 20) * boxSize };
let direction = { x: boxSize, y: 0 };  // 오른쪽으로 이동 시작
let score = 0;
let gameRunning = true;

// 이미지 로드
let snakeHeadImg = new Image();
snakeHeadImg.src = 'head.png';  // 뱀의 머리 이미지
let snakeTailImg = new Image();
snakeTailImg.src = 'tail.png';  // 뱀의 꼬리 이미지
let snakeMiddleImg = new Image();
snakeMiddleImg.src = 'middle.png';  // 뱀의 중간 세그먼트 이미지

let currentAngle = 0;  // 뱀 머리 회전 각도
let tailAngle = 0;  // 뱀 꼬리 회전 각도

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
    
    // 뱀 그리기
    snake.forEach((segment, index) => {
        if (index === 0) {
            // 뱀의 머리 이미지 회전 처리
            ctx.save();
            ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);  // 중심으로 이동
            ctx.rotate((currentAngle * Math.PI) / 180);  // 각도에 따라 회전
            ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);  // 머리 이미지 그리기
            ctx.restore();
        } else if (index === snake.length - 1) {
            // 뱀의 꼬리 이미지 회전 처리
            let tail = snake[snake.length - 2];
            let tailDirection = { x: segment.x - tail.x, y: segment.y - tail.y };
            if (tailDirection.x > 0) tailAngle = 90;
            else if (tailDirection.x < 0) tailAngle = -90;
            else if (tailDirection.y > 0) tailAngle = 180;
            else if (tailDirection.y < 0) tailAngle = 0;

            ctx.save();
            ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);  // 꼬리의 중심으로 이동
            ctx.rotate((tailAngle * Math.PI) / 180);  // 각도에 따라 회전
            ctx.drawImage(snakeTailImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);  // 꼬리 이미지 그리기
            ctx.restore();
        } else {
            // 중간 세그먼트 그리기
            ctx.save();
            ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);
            ctx.drawImage(snakeMiddleImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);  // 중간 세그먼트 이미지
            ctx.restore();
            
            // 검정 테두리 추가
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.strokeRect(segment.x, segment.y, boxSize, boxSize);
        }
    });
    
    // 먹이 그리기 (초록색, 네모)
    ctx.fillStyle = "#00FF00";
    ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

// 게임 시작
setInterval(gameLoop, 100);

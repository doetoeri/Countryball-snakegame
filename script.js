const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;
let snake = [{ x: 160, y: 160 }];  // 초기 뱀의 위치
let food = { x: Math.floor(Math.random() * 20) * boxSize, y: Math.floor(Math.random() * 20) * boxSize };
let direction = { x: boxSize, y: 0 };  // 오른쪽으로 이동 시작
let score = 0;
let gameRunning = true;

// 방향 전환
document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    if (event.key === "ArrowUp" && direction.y === 0) {
        direction = { x: 0, y: -boxSize };
    } else if (event.key === "ArrowDown" && direction.y === 0) {
        direction = { x: 0, y: boxSize };
    } else if (event.key === "ArrowLeft" && direction.x === 0) {
        direction = { x: -boxSize, y: 0 };
    } else if (event.key === "ArrowRight" && direction.x === 0) {
        direction = { x: boxSize, y: 0 };
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
    
    // 뱀 그리기 (둥근 형태)
    ctx.fillStyle = "lime";
    snake.forEach(segment => {
        ctx.beginPath();
        ctx.arc(segment.x + boxSize / 2, segment.y + boxSize / 2, boxSize / 2, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // 먹이 그리기 (원형)
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(food.x + boxSize / 2, food.y + boxSize / 2, boxSize / 2, 0, 2 * Math.PI);
    ctx.fill();
}

// 게임 시작
setInterval(gameLoop, 100);

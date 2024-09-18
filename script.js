const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;
let snake = [{ x: 160, y: 160 }];
let food = { x: Math.floor(Math.random() * 20) * boxSize, y: Math.floor(Math.random() * 20) * boxSize };
let direction = { x: 0, y: 0 };
let score = 0;

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
    // 뱀 이동
    const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    
    // 벽에 부딪히거나 자기 자신과 충돌하면 게임 오버
    if (newHead.x < 0 || newHead.y < 0 || newHead.x >= canvas.width || newHead.y >= canvas.height || snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        alert("Game Over! Your Score: " + score);
        document.location.reload();
        return;
    }
    
    // 먹이 먹기
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        document.getElementById("score").innerText = "Score: " + score;
        food = { x: Math.floor(Math.random() * 20) * boxSize, y: Math.floor(Math.random() * 20) * boxSize };
    } else {
        snake.pop(); // 먹이를 먹지 않으면 꼬리 제거
    }
    
    snake.unshift(newHead); // 새로운 머리 추가
    
    // 화면 그리기
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "lime";
    snake.forEach(segment => ctx.fillRect(segment.x, segment.y, boxSize, boxSize));
    
    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

// 게임 시작
setInterval(gameLoop, 100);

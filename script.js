const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;
let snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];
let food = generateFood();
let direction = { x: boxSize, y: 0 };
let score = 0;
let gameRunning = true;

document.addEventListener("keydown", changeDirection);
document.getElementById("restartBtn").addEventListener("click", restartGame);

function generateFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
        y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
    };
}

function changeDirection(event) {
    const keyPressed = event.key;
    const goingUp = direction.y === -boxSize;
    const goingDown = direction.y === boxSize;
    const goingRight = direction.x === boxSize;
    const goingLeft = direction.x === -boxSize;

    if (keyPressed === 'ArrowUp' && !goingDown) {
        direction = { x: 0, y: -boxSize };
    } else if (keyPressed === 'ArrowDown' && !goingUp) {
        direction = { x: 0, y: boxSize };
    } else if (keyPressed === 'ArrowLeft' && !goingRight) {
        direction = { x: -boxSize, y: 0 };
    } else if (keyPressed === 'ArrowRight' && !goingLeft) {
        direction = { x: boxSize, y: 0 };
    }
}

function gameLoop() {
    if (!gameRunning) return;

    const newHead = { x: (snake[0].x + direction.x + canvas.width) % canvas.width, y: (snake[0].y + direction.y + canvas.height) % canvas.height };

    // 충돌 체크
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        gameRunning = false;
        document.getElementById("restartBtn").style.display = "block";
        return;
    }

    snake.unshift(newHead);

    // 먹이를 먹었는지 체크
    if (newHead.x === food.x && newHead.y === food.y) {
        score++;
        food = generateFood();
        document.getElementById("score").innerText = "Score: " + score;
    } else {
        snake.pop();
    }

    draw();
    setTimeout(gameLoop, 100);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? "#D52A1E" : "#D52A1E";
        ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
    });

    ctx.fillStyle = "#00FF00";
    ctx.fillRect(food.x, food.y, boxSize, boxSize);
}

function restartGame() {
    snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];
    direction = { x: boxSize, y: 0 };
    score = 0;
    gameRunning = true;
    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("restartBtn").style.display = "none";
    food = generateFood();
    gameLoop();
}

// 게임 시작
gameLoop();

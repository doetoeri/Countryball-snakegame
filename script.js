const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;
let snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];
let food = {
    x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
    y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
};
let direction = { x: boxSize, y: 0 };
let score = 0;
let gameRunning = true;
let snakeHeadImg = new Image();
snakeHeadImg.src = 'head.png';
let tailAngle = 0;  // D 세그먼트의 각도

const gameSpeed = 100;

document.addEventListener("keydown", changeDirection);
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
            direction = { x: boxSize, y: 0 };
        } else if (dx < 0 && direction.x === 0) {
            direction = { x: -boxSize, y: 0 };
        }
    } else {
        if (dy > 0 && direction.y === 0) {
            direction = { x: 0, y: boxSize };
        } else if (dy < 0 && direction.y === 0) {
            direction = { x: 0, y: -boxSize };
        }
    }

    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
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

function drawGrid() {
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
    for (let x = 0; x < canvas.width; x += boxSize) {
        for (let y = 0; y < canvas.height; y += boxSize) {
            ctx.strokeRect(x, y, boxSize, boxSize);
        }
    }
}

function gameLoop() {
    if (!gameRunning) return;

    setTimeout(function onTick() {
        const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        if (newHead.x < 0) newHead.x = canvas.width - boxSize;
        else if (newHead.x >= canvas.width) newHead.x = 0;
        if (newHead.y < 0) newHead.y = canvas.height - boxSize;
        else if (newHead.y >= canvas.height) newHead.y = 0;

        if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            gameRunning = false;
            alert("Game Over! Your Score: " + score);
            document.location.reload();
            return;
        }

        if (newHead.x === food.x && newHead.y === food.y) {
            score++;
            document.getElementById("score").innerText = "Score: " + score;
            food = {
                x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
                y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
            };
        } else {
            snake.pop();
        }

        snake.unshift(newHead);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();

        // 뱀의 머리 그리기
        snake.forEach((segment, index) => {
            if (index === 0) {
                ctx.save();
                ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);
                const headAngle = Math.atan2(direction.y, direction.x);
                ctx.rotate(headAngle);
                ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);
                ctx.restore();
            } else {
                ctx.fillStyle = "#D52A1E";
                ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
            }
        });

        // D 세그먼트 그리기
        const tailSegment = snake[snake.length - 1];
        const prevSegment = snake[snake.length - 2];
        const tailDirection = { x: prevSegment.x - tailSegment.x, y: prevSegment.y - tailSegment.y };

        // D 세그먼트 각도 설정
        if (tailDirection.x > 0) {  // 오른쪽으로 연결될 때
            tailAngle = Math.PI;  // 180도
        } else if (tailDirection.x < 0) {  // 왼쪽으로 연결될 때
            tailAngle = 0;  // 0도
        } else if (tailDirection.y > 0) {  // 위로 연결될 때
            tailAngle = Math.PI / 2;  // 90도 (시계방향)
        } else if (tailDirection.y < 0) {  // 아래로 연결될 때
            tailAngle = -Math.PI / 2;  // -90도 (반시계방향)
        }

        // D 세그먼트 그리기 (둥근 캡슐 모양)
        ctx.save();
        ctx.translate(tailSegment.x + boxSize / 2, tailSegment.y + boxSize / 2);
        ctx.rotate(tailAngle);
        ctx.beginPath();
        ctx.moveTo(-boxSize / 2, -boxSize / 2);
        ctx.arc(boxSize / 2, 0, boxSize / 2, Math.PI / 2, -Math.PI / 2, true);
        ctx.lineTo(-boxSize / 2, boxSize / 2);
        ctx.arc(-boxSize / 2, 0, boxSize / 2, -Math.PI / 2, Math.PI / 2, true);
        ctx.fillStyle = "#D52A1E";
        ctx.fill();
        ctx.restore();

        // 먹이 그리기
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(food.x, food.y, boxSize, boxSize);

        gameLoop();

    }, gameSpeed);
}

gameLoop();

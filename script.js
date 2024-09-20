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
const snakeColor = "#D52A1E";  // 뱀 색상

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
                ctx.fillStyle = snakeColor;
                ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
            }
        });

        // 뱀의 꼬리 그리기 (대문자 'D' 모양)
        const tailSegment = snake[snake.length - 1];
        const prevSegment = snake[snake.length - 2];
        const tailDirection = { x: prevSegment.x - tailSegment.x, y: prevSegment.y - tailSegment.y };

        ctx.fillStyle = snakeColor;
        ctx.beginPath();

        if (tailDirection.x === boxSize && tailDirection.y === 0) { // 오른쪽
            ctx.moveTo(tailSegment.x + boxSize, tailSegment.y);
            ctx.arc(tailSegment.x + boxSize, tailSegment.y + boxSize / 2, boxSize / 2, -Math.PI / 2, Math.PI / 2, false);
        } else if (tailDirection.x === -boxSize && tailDirection.y === 0) { // 왼쪽
            ctx.moveTo(tailSegment.x, tailSegment.y);
            ctx.arc(tailSegment.x, tailSegment.y + boxSize / 2, boxSize / 2, Math.PI / 2, -Math.PI / 2, true);
        } else if (tailDirection.x === 0 && tailDirection.y === boxSize) { // 아래쪽
            ctx.moveTo(tailSegment.x, tailSegment.y + boxSize);
            ctx.arc(tailSegment.x + boxSize / 2, tailSegment.y + boxSize, boxSize / 2, Math.PI, 0, false);
        } else if (tailDirection.x === 0 && tailDirection.y === -boxSize) { // 위쪽
            ctx.moveTo(tailSegment.x, tailSegment.y);
            ctx.arc(tailSegment.x + boxSize / 2, tailSegment.y, boxSize / 2, 0, Math.PI, false);
        }

        ctx.lineTo(tailSegment.x + boxSize, tailSegment.y + boxSize);
        ctx.lineTo(tailSegment.x, tailSegment.y + boxSize);
        ctx.fill();

        ctx.fillStyle = "#00FF00";
        ctx.fillRect(food.x, food.y, boxSize, boxSize);

        gameLoop();

    }, gameSpeed);
}

gameLoop();

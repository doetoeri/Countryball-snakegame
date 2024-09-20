const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;
let snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];  // 뱀의 초기 길이
let food = { x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize, y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize };
let direction = { x: boxSize, y: 0 };  // 오른쪽으로 이동 시작
let score = 0;
let gameRunning = true;
let snakeHeadImg = new Image();
let snakeTailImg = new Image();
snakeHeadImg.src = 'head.png';  // 뱀의 머리 이미지
snakeTailImg.src = '/mnt/data/file-bcwfDMyBo1xi0ZsgTGg4QlFG';  // 업로드된 tail.png 이미지
let currentAngle = 90;  // 뱀 머리 회전 각도 (오른쪽 방향)
let tailAngle = 90;  // 꼬리 회전 각도 (오른쪽 방향)

const gameSpeed = 100;  // 게임 속도 (밀리초)

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
        currentAngle = 0;
    } else if (keyPressed === 'ArrowDown' && !goingUp) {
        direction = { x: 0, y: boxSize };
        currentAngle = 180;
    } else if (keyPressed === 'ArrowLeft' && !goingRight) {
        direction = { x: -boxSize, y: 0 };
        currentAngle = -90;
    } else if (keyPressed === 'ArrowRight' && !goingLeft) {
        direction = { x: boxSize, y: 0 };
        currentAngle = 90;
    }
}

function gameLoop() {
    if (!gameRunning) return;

    setTimeout(function onTick() {
        const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        if (
            newHead.x < 0 ||
            newHead.y < 0 ||
            newHead.x >= canvas.width ||
            newHead.y >= canvas.height ||
            snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
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

        snake.forEach((segment, index) => {
            if (index === 0) {
                ctx.save();
                ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);
                ctx.rotate((currentAngle * Math.PI) / 180);
                ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);
                ctx.restore();
            } else if (index === snake.length - 1) {
                ctx.save();
                ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);
                ctx.rotate((tailAngle * Math.PI) / 180);
                ctx.drawImage(snakeTailImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);
                ctx.restore();
            } else {
                ctx.fillStyle = "#D52A1E";
                ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
            }
        });

        ctx.fillStyle = "#00FF00";
        ctx.fillRect(food.x, food.y, boxSize, boxSize);

        gameLoop();

    }, gameSpeed);
}

gameLoop();

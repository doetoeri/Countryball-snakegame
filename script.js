const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;
let snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];  // 뱀의 초기 길이
let food = { x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize, y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize };
let direction = { x: boxSize, y: 0 };  // 오른쪽으로 이동 시작
let score = 0;
let gameRunning = true;
let snakeHeadImg = new Image();
snakeHeadImg.src = 'head.png';  // 뱀의 머리 이미지
let currentAngle = 90;  // 뱀 머리 회전 각도 (오른쪽 방향)

const gameSpeed = 100;  // 게임 속도 (밀리초)

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

// 그리드 라인 그리기
function drawGrid() {
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";  // 회색 그리드 라인
    for (let x = 0; x < canvas.width; x += boxSize) {
        for (let y = 0; y < canvas.height; y += boxSize) {
            ctx.strokeRect(x, y, boxSize, boxSize);
        }
    }
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;

    setTimeout(function onTick() {
        // 뱀 이동
        const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        // 벽에 부딪히거나 자기 자신과 충돌하면 게임 오버
        if (
            newHead.x < 0 ||
            newHead.y < 0 ||
            newHead.x >= canvas.width ||
            newHead.y >= canvas.height ||
            snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
        ) {
            gameRunning = false;  // 게임 오버
            alert("Game Over! Your Score: " + score);
            document.location.reload();  // 페이지 새로고침으로 게임 리셋
            return;
        }

        // 먹이 먹기
        if (newHead.x === food.x && newHead.y === food.y) {
            score++;
            document.getElementById("score").innerText = "Score: " + score;
            // 새로운 먹이 생성
            food = {
                x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
                y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
            };
        } else {
            snake.pop();  // 먹이를 먹지 않으면 꼬리 제거
        }

        snake.unshift(newHead);  // 새로운 머리 추가

        // 화면 그리기
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 그리드 그리기
        drawGrid();

        // 뱀 그리기 (네모 모양, 검정색 아웃라인)
        snake.forEach((segment, index) => {
            if (index === 0) {
                // 뱀의 머리 이미지 회전 처리
                ctx.save();
                ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);  // 중심으로 이동
                ctx.rotate((currentAngle * Math.PI) / 180);  // 각도에 따라 회전
                ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);  // 이미지 그리기
                ctx.restore();
            } else {
                // 뱀의 몸통 (#D52A1E, 네모, 검정색 테두리)
                ctx.fillStyle = "#D52A1E";
                ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
                ctx.strokeStyle = "#000000";  // 검정색 아웃라인
                ctx.lineWidth = 3;  // 굵은 아웃라인
                ctx.strokeRect(segment.x, segment.y, boxSize, boxSize);
            }

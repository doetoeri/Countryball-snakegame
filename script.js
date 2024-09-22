const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const boxSize = 20;
let snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];
let food = { x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize, y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize };
let direction = { x: boxSize, y: 0 };
let score = 0;
let gameRunning = true;
let snakeHeadImg = new Image();
snakeHeadImg.src = 'head.png';
const gameSpeed = 100;

// GitHub API 설정
const apiUrl = 'https://api.github.com/repos/doetoeri/Countryball-snakegame/contents/data.json';
const token = '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';

// 방향 전환
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

function saveScore(nickname, score) {
    const date = new Date().toISOString();
    const data = { nickname, score, date };

    fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: 'Add score',
            content: btoa(JSON.stringify(data)),
            sha: '' // 기존 sha를 넣어야 함
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Score saved:', data);
    })
    .catch(error => {
        console.error('Error saving score:', error);
    });
}

function gameOver() {
    gameRunning = false;
    document.getElementById("gameOver").style.display = "block"; // 게임 오버 메시지 표시
    document.getElementById("nicknameInput").style.display = "block"; // 닉네임 입력란 표시
}

function restartGame() {
    // 초기화
    snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];
    direction = { x: boxSize, y: 0 };
    score = 0;
    gameRunning = true;
    food = { x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize, y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize };

    document.getElementById("score").innerText = "Score: " + score;
    document.getElementById("gameOver").style.display = "none"; // 게임 오버 메시지 숨기기
    document.getElementById("nicknameInput").style.display = "none"; // 닉네임 입력란 숨기기

    gameLoop(); // 게임 루프 시작
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) return;

    setTimeout(function onTick() {
        const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        // 벽에 부딪히면 반대편으로 이동
        if (newHead.x < 0) newHead.x = canvas.width - boxSize;
        if (newHead.y < 0) newHead.y = canvas.height - boxSize;
        if (newHead.x >= canvas.width) newHead.x = 0;
        if (newHead.y >= canvas.height) newHead.y = 0;

        // 자기 자신과 충돌하면 게임 오버
        if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            gameOver(); // 게임 오버 처리
            return;
        }

        // 먹이 먹기
        if (newHead.x === food.x && newHead.y === food.y) {
            score++;
            document.getElementById("score").innerText = "Score: " + score;
            food = {
                x: Math.floor(Math.random() * (canvas.width / boxSize)) * boxSize,
                y: Math.floor(Math.random() * (canvas.height / boxSize)) * boxSize
            };
        } else {
            snake.pop(); // 먹이를 먹지 않으면 꼬리 제거
        }

        snake.unshift(newHead); // 새로운 머리 추가

        // 화면 그리기
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();

        // 뱀 그리기
        snake.forEach((segment, index) => {
            if (index === 0) {
                ctx.save();
                ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);
                ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);
                ctx.restore();
            } else {
                ctx.fillStyle = "#D52A1E";
                ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
            }
        });

        // 먹이 그리기
        ctx.fillStyle = "#00FF00";
        ctx.fillRect(food.x, food.y, boxSize, boxSize);

        // 다음 프레임 실행
        gameLoop();

    }, gameSpeed);
}

// 게임 시작
gameLoop();

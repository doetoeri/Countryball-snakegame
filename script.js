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
let gameSpeed = 100;

document.addEventListener("keydown", changeDirection);

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

        // 캔버스의 경계를 넘어가면 반대편에서 나오도록 처리
        if (newHead.x < 0) newHead.x = canvas.width - boxSize;
        else if (newHead.x >= canvas.width) newHead.x = 0;
        if (newHead.y < 0) newHead.y = canvas.height - boxSize;
        else if (newHead.y >= canvas.height) newHead.y = 0;

        // 자기 자신과 충돌하면 게임 오버
        if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            gameOver();
            return;
        }

        // 먹이를 먹으면 점수 증가
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

        // 뱀의 몸체 그리기 (검정색 테두리는 그리지 않음)
        snake.forEach((segment, index) => {
            ctx.fillStyle = "#D52A1E";
            ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
            if (index === 0) {
                ctx.save();
                ctx.translate(segment.x + boxSize / 2, segment.y + boxSize / 2);
                const headAngle = Math.atan2(direction.y, direction.x);
                ctx.rotate(headAngle);
                ctx.drawImage(snakeHeadImg, -boxSize / 2, -boxSize / 2, boxSize, boxSize);
                ctx.restore();
            }
        });

        // 마지막 세그먼트 (캡슐 모양)
        const tailSegment = snake[snake.length - 1];
        const prevSegment = snake[snake.length - 2];
        const tailDirection = { x: prevSegment.x - tailSegment.x, y: prevSegment.y - tailSegment.y };
        let tailAngle = 0;
        if (tailDirection.x > 0) tailAngle = Math.PI;
        else if (tailDirection.x < 0) tailAngle = 0;
        else if (tailDirection.y > 0) tailAngle = Math.PI / 2;
        else if (tailDirection.y < 0) tailAngle = -Math.PI / 2;

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

function gameOver() {
    gameRunning = false;
    document.getElementById("retryBtn").style.display = "block";
    const nickname = document.getElementById("nicknameInput").value || "Anonymous";
    const scoreData = {
        nickname: nickname,
        score: score,
        date: new Date().toLocaleString()
    };
    // 서버로 스코어 전송
    fetch("/save-score", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(scoreData)
    }).then(response => response.json())
    .then(data => {
        console.log("Score saved:", data);
    });
}

function restartGame() {
    document.getElementById("retryBtn").style.display = "none";
    score = 0;
    direction = { x: boxSize, y: 0 };
    snake = [{ x: 160, y: 160 }, { x: 140, y: 160 }, { x: 120, y: 160 }];
    gameRunning = true;
    gameLoop();
}

gameLoop();

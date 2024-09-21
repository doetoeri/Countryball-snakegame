// 게임 관련 변수 설정
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
let gameRunning = false;  // 게임은 닉네임 입력 후에만 시작
let gameSpeed = 100;

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyChpxqaPXsbMDhXOKsLk0l9BVtq4_g1XW8",
    authDomain: "chilesnakegame.firebaseapp.com",
    projectId: "chilesnakegame",
    storageBucket: "chilesnakegame.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// 점수 저장 함수
function saveScore(nickname, score) {
    db.collection("scores").add({
        nickname: nickname,
        score: score,
        date: new Date().toLocaleString()
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

// 닉네임 입력 시 게임 시작
const nicknameInput = document.getElementById("nicknameInput");
nicknameInput.addEventListener("keydown", function(event) {
    if (event.key === 'Enter') {
        const nickname = nicknameInput.value.trim();
        if (nickname !== "") {
            gameRunning = true;
            nicknameInput.disabled = true;  // 입력 후 닉네임 입력 비활성화
            gameLoop();
        } else {
            alert("Please enter a nickname.");
        }
    }
});

// 방향 전환 이벤트
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

// 그리드 라인 그리기
function drawGrid() {
    ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
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
        const newHead = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        // 벽 충돌 시 반대편으로 이동
        if (newHead.x >= canvas.width) newHead.x = 0;
        else if (newHead.x < 0) newHead.x = canvas.width - boxSize;
        else if (newHead.y >= canvas.height) newHead.y = 0;
        else if (newHead.y < 0) newHead.y = canvas.height - boxSize;

        if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
            gameOver();
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

        snake.forEach((segment) => {
            ctx.fillStyle = "#D52A1E";
            ctx.fillRect(segment.x, segment.y, boxSize, boxSize);
            ctx.strokeStyle = "black";
            ctx.strokeRect(segment.x, segment.y, boxSize, boxSize);
        });

        ctx.fillStyle = "#00FF00";
        ctx.fillRect(food.x, food.y, boxSize, boxSize);

        gameLoop();
    }, gameSpeed);
}

// 게임 오버 함수
function gameOver() {
    gameRunning = false;
    document.getElementById("retryBtn").style.display = "block";

    const nickname = document.getElementById("nicknameInput").value || "Anonymous";
    saveScore(nickname, score);  // Firebase에 점수 저장

    alert("Game Over! Your Score: " + score);
}

// 게임 재시작 함수
function restartGame() {
    document.location.reload();
}

// Firebase 점수 저장 로직
function saveScore(nickname, score) {
    db.collection("scores").add({
        nickname: nickname,
        score: score,
        date: new Date().toLocaleString()
    });
}

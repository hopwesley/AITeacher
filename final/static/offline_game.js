let gamePaused = true;
let highScore = localStorage.getItem('highScore') || 0;
let totalGames = localStorage.getItem('totalGames') || 0;
let totalScore = parseInt(localStorage.getItem('totalScore3')) || 0;
let lastTime = 0;
let score = 0;
let _gameRenderer;
let level = 1;            // 初始难度级别
const LEVEL_THRESHOLD = 500;  // 每500分提升一个难度级别
let animationId;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    const nextCanvas = document.getElementById('nextTetromino');
    _gameRenderer = new GameRenderer(canvas, nextCanvas);

    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', toggleGame);

    document.addEventListener('keydown', handleKeyPress); // 添加键盘事件

    const savedBgColor = localStorage.getItem('bgColor');
    if (savedBgColor) {
        document.body.style.backgroundColor = savedBgColor;
    }

    particleColor = localStorage.getItem('blockColor') || '#ff0000';
    document.getElementById('blockColorPicker').value = particleColor;
});


function update(time = 0) {
    if (gamePaused) {
        console.log("Game is paused, stopping animation.");
        stopAnimation();
        return;
    }

    const deltaTime = time - lastTime;
    lastTime = time;

    const cleanedLines = _gameRenderer.update(deltaTime);
    if (cleanedLines < 0) {
        gameEnding().then();
        return;
    }
    updateScore(cleanedLines);
    animationId = requestAnimationFrame(update);
}


function changeGameStatus(button, reset = false) {
    if (reset || gamePaused) {
        button.innerText = '开始游戏';
        button.classList.remove('pauseButton');
        button.classList.add('startButton');
    } else {
        button.innerText = '暂停游戏';
        button.classList.remove('startButton');
        button.classList.add('pauseButton');
    }
}

async function gameEnding() {
    gamePaused = true;
    _gameRenderer.endRendering();

    stopAnimation()

    const gameOverDialog = document.getElementById('gameOverDialog');
    gameOverDialog.style.display = 'flex';

    playSound('gameOver');
    displayGameEnding();

    changeGameStatus(document.getElementById('startButton')); // 统一按钮状态
    stopBackgroundMusic().then();

    const restartButton = document.getElementById('restartButton');
    const cancelButton = document.getElementById('cancelButton');

    restartButton.onclick = () => {
        gameOverDialog.style.display = 'none'; // 隐藏对话框
        startGame();                            // 调用统一的开始游戏逻辑
    };

    cancelButton.onclick = () => {
        gameOverDialog.style.display = 'none'; // 隐藏对话框
        resetScore();
        const mainElement = document.querySelector('.tetrisCanvas');
        mainElement.classList.remove('fade-in');
    };
}


function startGame() {
    console.log("Starting game...");
    stopAnimation(); // 确保没有残留的动画帧

    const mainElement = document.querySelector('.tetrisCanvas');
    if (!mainElement.classList.contains('fade-in')) {
        mainElement.classList.add('fade-in');
    }

    _gameRenderer.startRendering();

    resetScore();
    gamePaused = false;
    changeGameStatus(document.getElementById('startButton'));

    animationId = requestAnimationFrame(update); // 直接启动动画帧
    backgroundMusicSource = playSound('background', true);
}

function resetScore() {
    score = 0;
    level = 1;
    document.getElementById('score').textContent = score;
    document.getElementById('currentLevel').textContent = level;
    totalLineCleared = 0;
}

async function toggleGame() {
    const startButton = document.getElementById('startButton');
    if (_gameRenderer.gameStop()) {
        startGame(); // 如果游戏未启动，直接开始游戏
        return;
    }

    gamePaused = !gamePaused;
    changeGameStatus(startButton);

    if (gamePaused) {
        stopAnimation(); // 暂停时停止动画帧
    } else {
        animationId = requestAnimationFrame(update); // 恢复时启动动画帧
    }
}

window.addEventListener('beforeunload', (event) => {
    if (!gamePaused) {
        event.preventDefault();
    }
});

function updateScore(linesCleared) {
    if (linesCleared <= 0) {
        return;
    }
    score += linesCleared * 100;

    totalLineCleared += linesCleared;

    document.getElementById('score').textContent = score;

    if (level >= 20) {
        return;
    }

    // 每当分数达到LEVEL_THRESHOLD的倍数时，提升难度
    if (score >= level * LEVEL_THRESHOLD) {
        level++;
        document.getElementById('currentLevel').textContent = level;
        _gameRenderer.speedUp(0.9);
        showLevelUpMessage();
    }
}

function displayGameEnding() {
    totalGames++;
    totalScore += parseInt(score);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }

    localStorage.setItem('totalGames', totalGames);
    localStorage.setItem('totalScore3', totalScore.toString());

    document.getElementById('currentScore').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    document.getElementById('averageScore').textContent = (totalScore / totalGames).toFixed(2);
    document.getElementById('totalGames').textContent = totalGames;
}

function saveCustomization() {
    particleColor = document.getElementById('blockColorPicker').value;
    localStorage.setItem('particleColor', particleColor);
    alert('个性化设置已保存！');
}

function handleKeyPress(event) {
    if (event.key === 'p') {
        toggleGame().then(r => {
        });
    }

    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
    }

    if (gamePaused) return;

    const action = keyToAction(event.key)
    const linesCleared = _gameRenderer.keyAction(action);
    if (linesCleared < 0) {
        gameEnding().then();
        return;
    }
    updateScore(linesCleared);
}

function keyToAction(key) {
    switch (key) {
        case 'ArrowLeft':
            return TransAct.Left;
        case 'ArrowRight':
            return TransAct.Wright;
        case 'ArrowDown':
            return TransAct.Down;
        case 'ArrowUp':
            return TransAct.Rotate;
    }
}

function showLevelUpMessage() {
    const message = document.createElement('div');
    message.textContent = `Level Up! Now Level ${level}`;
    message.style.position = 'absolute';
    message.style.top = '20px';
    message.style.left = '50%';
    message.style.transform = 'translateX(-50%)';
    message.style.padding = '10px 20px';
    message.style.backgroundColor = '#ffcc00';
    message.style.color = '#000';
    message.style.fontSize = '20px';
    message.style.borderRadius = '5px';
    message.style.zIndex = '1000';
    document.body.appendChild(message);

    setTimeout(() => {
        document.body.removeChild(message);
    }, 2000);
}

function stopAnimation() {
    if (animationId) {
        console.log(`Stopping animation frame: ${animationId}`);
        cancelAnimationFrame(animationId);
        animationId = null;
    } else {
        console.log("No valid animation frame to stop.");
    }
}


function startAnimation() {
    if (animationId) {
        console.log(`Animation frame already running: ${animationId}`);
        return; // 防止重复调用
    }
    animationId = requestAnimationFrame(update);
    console.log(`Starting animation frame: ${animationId}`);
}

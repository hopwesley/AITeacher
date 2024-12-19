let gamePaused = true;
let highScore = localStorage.getItem('highScore') || 0;
let totalGames = localStorage.getItem('totalGames') || 0;
let totalScore = parseInt(localStorage.getItem('totalScore3')) || 0;
let lastTime = 0;
let score = 0;
let dropCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tetrisCanvas');
    context = canvas.getContext('2d');
    context.scale(BLOCK_SIZE, BLOCK_SIZE);

    const nextCanvas = document.getElementById('nextTetromino');
    nextContext = nextCanvas.getContext('2d');
    nextContext.scale(BLOCK_SIZE / 2, BLOCK_SIZE / 2);

    const startButton = document.getElementById('startButton');
    startButton.addEventListener('click', toggleGame);

    board = createBoard(ROWS, COLS);
    document.addEventListener('keydown', handleKeyPress); // 添加键盘事件
    drawBoard(board); // 初始时绘制空的棋盘

    const savedBgColor = localStorage.getItem('bgColor');
    if (savedBgColor) {
        document.body.style.backgroundColor = savedBgColor;
    }
    particleColor = localStorage.getItem('blockColor') || '#ff0000';
    document.getElementById('blockColorPicker').value = particleColor;
});


function update(time = 0) {
    if (gamePaused) return; // 如果游戏暂停，停止更新

    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        currentTetromino.moveDown();
        dropCounter = 0;
    }

    drawBoard(board);
    if (currentTetromino) {
        currentTetromino.draw(context);
    }

    updateParticles(); // 更新粒子效果
    requestAnimationFrame(update);
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

function resetGame() {
    console.log("------------------>>>>>>")
    // 显示自定义对话框
    const gameOverDialog = document.getElementById('gameOverDialog');
    gameOverDialog.style.display = 'flex';
    playSound('gameOver');
    endGame();
    // 暂停游戏
    gamePaused = true;
    changeGameStatus(document.getElementById('startButton')); // 统一按钮状态

    // 清空主画布和下一个方块画布
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    nextContext.clearRect(0, 0, nextContext.canvas.width, nextContext.canvas.height);

    // 添加重新开始和取消按钮的事件监听
    const restartButton = document.getElementById('restartButton');
    const cancelButton = document.getElementById('cancelButton');

    restartButton.onclick = () => {
        gameOverDialog.style.display = 'none'; // 隐藏对话框
        startGame();                            // 调用统一的开始游戏逻辑
    };

    cancelButton.onclick = () => {
        gameOverDialog.style.display = 'none'; // 隐藏对话框
        currentTetromino = null;               // 清除当前方块
        nextTetromino = null;                  // 清除下一个方块
        board = createBoard(ROWS, COLS);       // 重置棋盘
        drawBoard(board);                      // 绘制空的棋盘
        resetScore();

        // 移除淡入效果
        const mainElement = document.querySelector('.tetrisCanvas');
        mainElement.classList.remove('fade-in');
    };
}


function startGame() {
    const mainElement = document.querySelector('.tetrisCanvas');
    // 如果没有添加淡入效果，先添加
    if (!mainElement.classList.contains('fade-in')) {
        mainElement.classList.add('fade-in');
    }

    board = createBoard(ROWS, COLS);
    currentTetromino = randomTetromino();
    nextTetromino = randomTetromino();
    drawNextTetromino();
    resetScore();
    gamePaused = false;
    changeGameStatus(document.getElementById('startButton'));
    setTimeout(() => {
        update();
    }, 1200);
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
    await initSounds();
    // 如果游戏尚未开始，直接开始游戏
    if (!currentTetromino) {
        startGame();
        return;
    }

    // 切换游戏暂停/继续状态
    gamePaused = !gamePaused;
    changeGameStatus(startButton);

    if (!gamePaused) {
        update(); // 继续游戏循环
    }
}

window.addEventListener('beforeunload', (event) => {
    if (!gamePaused) {
        event.preventDefault();
    }
});

function updateScore(linesCleared) {

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
        dropInterval *= 0.9; // 提高难度，减少下落间隔，速度加快
        showLevelUpMessage();
    }
}

function endGame() {
    totalGames++;
    totalScore += parseInt(score);

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }

    localStorage.setItem('totalGames', totalGames);
    localStorage.setItem('totalScore3', totalScore.toString());

    displayAdvancedStats();
}

function displayAdvancedStats() {
    document.getElementById('currentScore').textContent = score;
    document.getElementById('highScore').textContent = highScore;
    console.log("------>>>", totalScore, "games:", totalGames);
    document.getElementById('averageScore').textContent = (totalScore / totalGames).toFixed(2);
    document.getElementById('totalGames').textContent = totalGames;
}

function saveCustomization() {
    particleColor = document.getElementById('blockColorPicker').value;
    localStorage.setItem('particleColor', particleColor);
    alert('个性化设置已保存！');
}

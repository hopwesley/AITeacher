const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 32;

let context;
let nextContext;
let board;
let currentTetromino;
let nextTetromino;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;
let gamePaused = true;

// 定义 Tetromino 类
class Tetromino {
    constructor(shape, color) {
        this.shape = shape;
        this.color = color;
        this.position = {row: 0, col: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2)};
    }

    draw(context) {
        context.fillStyle = this.color;
        this.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    drawCell(context, this.position.col + colIndex, this.position.row + rowIndex, this.color);
                }
            });
        });
    }


    moveDown() {
        this.position.row++;
        if (!isValidMove(board, this.shape, this.position)) {
            this.position.row--;
            mergeBoard(board, this.shape, this.position);
            clearLines(); // 添加行消除逻辑

            // 生成新的方块
            currentTetromino = nextTetromino;
            currentTetromino.position = {
                row: 0,
                col: Math.floor(COLS / 2) - Math.floor(currentTetromino.shape[0].length / 2)
            };
            nextTetromino = randomTetromino();
            drawNextTetromino();

            // 检查游戏是否结束
            if (!isValidMove(board, currentTetromino.shape, currentTetromino.position)) {
                resetGame(); // 调用游戏结束逻辑
            }

            return true; // 表示不能再下落
        }
        return false;
    }

    moveLeft() {
        this.position.col--;
        if (!isValidMove(board, this.shape, this.position)) {
            this.position.col++;
        }else{
            playSound('move');
        }
    }

    moveRight() {
        this.position.col++;
        if (!isValidMove(board, this.shape, this.position)) {
            this.position.col--;
        }else{
            playSound('move');
        }
    }

    rotate() {
        const rotated = rotateMatrix(this.shape);
        if (isValidMove(board, rotated, this.position)) {
            this.shape = rotated;
            playSound('rotate');
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;                      // 粒子初始x坐标
        this.y = y;                      // 粒子初始y坐标
        this.vx = (Math.random() - 0.5) * 2;  // 水平速度，随机方向
        this.vy = Math.random() * -2;    // 垂直速度，向上飞散
        this.color = color;              // 粒子颜色
        this.life = 50;                  // 粒子生命周期（帧数）
    }

    update() {
        this.x += this.vx;               // 更新x坐标
        this.y += this.vy;               // 更新y坐标
        this.vy += 0.05;                 // 模拟重力，让粒子下落
        this.life--;                     // 生命值减少
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, 0.1, 0.1); // 绘制粒子，粒子大小为0.1个方块单位
    }
}



// 定义所有的方块类型和颜色
const TETROMINOS = [
    {shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#FF5733'}, // I 形 - 鲜亮的橙红色
    {shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#33C1FF'},                         // J 形 - 明亮的蓝色
    {shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#FFC300'},                         // L 形 - 鲜亮的黄色
    {shape: [[1, 1], [1, 1]], color: '#FF33A8'},                                           // O 形 - 鲜艳的粉色
    {shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#33FF57'},                         // S 形 - 鲜亮的绿色
    {shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#9B33FF'},                         // T 形 - 鲜艳的紫色
    {shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#FF5733'}                          // Z 形 - 鲜亮的红色
];


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

    initSounds();
});

function handleKeyPress(event) {
    if (event.key === 'p') {
        toggleGame();
    }
    if (gamePaused) return;

    if (event.key === 'ArrowLeft') {
        currentTetromino.moveLeft();
    } else if (event.key === 'ArrowRight') {
        currentTetromino.moveRight();
    } else if (event.key === 'ArrowDown') {
        currentTetromino.moveDown();
        playSound('drop');
    } else if (event.key === 'ArrowUp') {
        currentTetromino.rotate();
    }
}

function randomTetromino() {
    const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
    return new Tetromino(TETROMINOS[randomIndex].shape, TETROMINOS[randomIndex].color);
}

function createBoard(rows, cols) {
    return Array.from({length: rows}, () => Array(cols).fill(0));
}

function drawBoard(board) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, COLS, ROWS);

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col]) {
                drawCell(context, col, row, board[row][col]);
            }
        }
    }
}

function drawNextTetromino() {
    nextContext.clearRect(0, 0, nextContext.canvas.width, nextContext.canvas.height);
    if (!nextTetromino) return; // 如果 nextTetromino 为 null，直接返回

    nextContext.fillStyle = nextTetromino.color;
    const shape = nextTetromino.shape;
    const rows = shape.length;
    const cols = shape[0].length;

    // 计算居中位置
    const offsetX = Math.floor((nextContext.canvas.width / (BLOCK_SIZE / 2) - cols) / 2);
    const offsetY = Math.floor((nextContext.canvas.height / (BLOCK_SIZE / 2) - rows) / 2);

    shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                drawCell(nextContext, offsetX + colIndex, offsetY + rowIndex, nextTetromino.color);
            }
        });
    });
}


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


function isValidMove(board, shape, position) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col] &&
                (position.row + row >= board.length ||
                    position.col + col < 0 ||
                    position.col + col >= board[0].length ||
                    board[position.row + row][position.col + col])) {
                return false;
            }
        }
    }
    return true;
}

function mergeBoard(board, shape, position) {
    shape.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell) {
                board[position.row + rowIndex][position.col + cellIndex] = '#A9A9A9'; // 亮灰色
            }
        });
    });
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


function rotateMatrix(matrix) {
    const N = matrix.length;
    const result = [];
    for (let i = 0; i < N; i++) {
        result[i] = [];
        for (let j = 0; j < N; j++) {
            result[i][j] = matrix[N - j - 1][i];
        }
    }
    return result;
}

let particles = []; // 存放粒子的数组

function updateParticles() {
    particles = particles.filter(particle => particle.life > 0); // 移除生命周期结束的粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw(context);
    });
}

function clearLines() {
    let linesCleared = 0;
    // 遍历每一行，检查是否完全填满
    for (let row = board.length - 1; row >= 0;) {
        if (board[row].every(cell => cell)) {
            // 异步生成粒子效果
            generateParticlesAsync(row);
            // 移除当前行
            board.splice(row, 1);
            // 在顶部添加一行空白行
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
            playSound('clear');
        } else {
            row--;
        }
    }

    // 更新分数并显示
    if (linesCleared > 0) {
        score += linesCleared * 100;
        document.getElementById('score').textContent = score;

        // 添加闪烁效果
        triggerBorderFlash().then();
    }
}

// 异步生成粒子效果
function generateParticlesAsync(row) {
    let col = 0;

    function generateNextColumn() {
        if (col < COLS) {
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(col, row, 'red'));
            }
            col++;
            requestAnimationFrame(generateNextColumn); // 下一帧继续生成
        }
    }

    generateNextColumn(); // 开始生成
}

function triggerBorderFlash() {
    const canvas = context.canvas; // 获取主画布元素
    return new Promise((resolve) => {
        // 添加闪烁类
        canvas.classList.add('canvas-flash');

        // 在动画结束后移除类名并继续执行
        canvas.addEventListener('animationend', () => {
            canvas.classList.remove('canvas-flash');
            resolve(); // 通过 Promise 通知动画完成
        }, {once: true}); // 确保只触发一次
    });
}

function resetGame() {
    // 显示自定义对话框
    const gameOverDialog = document.getElementById('gameOverDialog');
    gameOverDialog.style.display = 'flex';
    playSound('gameOver');
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

function drawCell(context, x, y, color) {
    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);

    // 绘制边框
    context.strokeStyle = '#333333'; // 深灰色边框
    context.lineWidth = 0.05;        // 边框宽度
    context.strokeRect(x, y, 1, 1);
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
    document.getElementById('score').textContent = score;
}

async function toggleGame() {
    const startButton = document.getElementById('startButton');
    await initAudioContext(); // 加载音效
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

let audioContext;
const audioBufferPool = {};
async function loadSound(name, url) {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    audioBufferPool[name] = await audioContext.decodeAudioData(arrayBuffer);
}
async function initSounds() {
    initAudioContext();
    await loadSound('move', '../../final/sounds/move.wav');
    await loadSound('rotate', '../../final/sounds/rotate_sound.wav');
    await loadSound('drop', '../../final/sounds/drop_sound.wav');
    await loadSound('clear', '../../final/sounds/clear_sound.wav');
    await loadSound('gameOver', '../../final/sounds/game_over.wav');
}
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(name) {
    initAudioContext();
    if (!audioBufferPool[name]) return;

    const source = audioContext.createBufferSource();
    source.buffer = audioBufferPool[name];
    source.connect(audioContext.destination);
    source.start(0);
}

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
                    context.fillRect(this.position.col + colIndex, this.position.row + rowIndex, 1, 1);
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
        }
    }

    moveRight() {
        this.position.col++;
        if (!isValidMove(board, this.shape, this.position)) {
            this.position.col--;
        }
    }

    rotate() {
        const rotated = rotateMatrix(this.shape);
        if (isValidMove(board, rotated, this.position)) {
            this.shape = rotated;
        }
    }
}

// 定义所有的方块类型和颜色
const TETROMINOS = [
    {shape: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], color: '#ff9a8b'}, // I 形 - 柔和的珊瑚色
    {shape: [[1, 0, 0], [1, 1, 1], [0, 0, 0]], color: '#ffb482'},                         // J 形 - 柔和的橙黄色
    {shape: [[0, 0, 1], [1, 1, 1], [0, 0, 0]], color: '#ffda77'},                         // L 形 - 柔和的黄色
    {shape: [[1, 1], [1, 1]], color: '#ffc0cb'},                                           // O 形 - 粉色
    {shape: [[0, 1, 1], [1, 1, 0], [0, 0, 0]], color: '#ffacb7'},                         // S 形 - 浅玫瑰红
    {shape: [[0, 1, 0], [1, 1, 1], [0, 0, 0]], color: '#ffa07a'},                         // T 形 - 柔和的橙红色
    {shape: [[1, 1, 0], [0, 1, 1], [0, 0, 0]], color: '#ffd1dc'}                          // Z 形 - 浅粉红色
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
                context.fillStyle = board[row][col];
                context.fillRect(col, row, 1, 1);
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
                nextContext.fillRect(offsetX + colIndex, offsetY + rowIndex, 1, 1);
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
                board[position.row + rowIndex][position.col + cellIndex] = '#d3d3d3'; // 统一灰色
            }
        });
    });
}

function toggleGame() {
    const startButton = document.getElementById('startButton');
    gamePaused = !gamePaused;
    changeGameStatus(startButton);
    if (!gamePaused) {
        if (!currentTetromino) {
            currentTetromino = randomTetromino();
            nextTetromino = randomTetromino();
            drawNextTetromino();
        }
        update();
    }
}

function changeGameStatus(button) {
    if (gamePaused) {
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

function clearLines() {
    let linesCleared = 0;

    // 遍历每一行，检查是否完全填满
    for (let row = board.length - 1; row >= 0;) {
        if (board[row].every(cell => cell)) {
            // 移除当前行
            board.splice(row, 1);
            // 在顶部添加一行空白行
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
        } else {
            row--;
        }
    }

    // 更新分数并显示
    if (linesCleared > 0) {
        score += linesCleared * 100;
        document.getElementById('score').textContent = score;
    }
}
function resetGame() {
    alert('Game Over!');
    gamePaused = true; // 暂停游戏

    // 清空主画布和下一个方块画布
    context.clearRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
    nextContext.clearRect(0, 0, nextTetromino.width, nextTetromino.height);

    // 重置棋盘
    board = createBoard(ROWS, COLS);

    // 重置按钮状态
    const startButton = document.getElementById('startButton');
    startButton.textContent = '开始游戏';
    startButton.classList.remove('pauseButton');
    startButton.classList.add('startButton');

    // 清空当前和下一个方块
    currentTetromino = null;
    nextTetromino = null;
    drawNextTetromino(); // 确保清空下一个方块的画布
}

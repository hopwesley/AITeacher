const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 32;
const LEVEL_THRESHOLD = 500;  // 每500分提升一个难度级别

let context;
let nextContext;
let board;
let currentTetromino;
let nextTetromino;
let level = 1;            // 初始难度级别
let dropInterval = 1000;  // 初始下落间隔（以毫秒为单位）

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
            clearLines();

            currentTetromino = nextTetromino;
            currentTetromino.position = {
                row: 0,
                col: Math.floor(COLS / 2) - Math.floor(currentTetromino.shape[0].length / 2)
            };
            nextTetromino = randomTetromino();
            drawNextTetromino();

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
        } else {
            playSound('move');
        }
    }

    moveRight() {
        this.position.col++;
        if (!isValidMove(board, this.shape, this.position)) {
            this.position.col--;
        } else {
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

function drawCell(context, x, y, color) {
    context.save(); // 保存当前绘图状态

    // 设置发光效果
    context.shadowColor = color;
    context.shadowBlur = 10; // 光晕模糊程度

    context.fillStyle = color;
    context.fillRect(x, y, 1, 1);

    // 绘制边框
    context.strokeStyle = '#333333'; // 深灰色边框
    context.lineWidth = 0.05;        // 边框宽度
    context.strokeRect(x, y, 1, 1);

    context.restore(); // 恢复之前的绘图状态，避免影响其他绘制操作
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

function clearLines() {
    let linesCleared = 0;

    for (let row = board.length - 1; row >= 0;) {
        if (board[row].every(cell => cell)) {
            generateParticlesAsync(row);
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
        } else {
            row--;
        }
    }

    if (linesCleared > 0) {
        playSound('clear');
        triggerBorderFlash().then();
        updateScore(linesCleared)
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


function mergeBoard(board, shape, position) {
    shape.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell) {
                board[position.row + rowIndex][position.col + cellIndex] = '#A9A9A9'; // 亮灰色
            }
        });
    });
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

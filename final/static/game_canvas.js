const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 32;

const TransAct = {
    Left: 0,
    Wright: 1,
    Rotate: 2,
    Down: 3
}

// 定义 Tetromino 类
class Tetromino {
    constructor(shape, color, board) {
        this.shape = shape;
        this.color = color;
        this.board = board;
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
        if (!isValidMove(this.board, this.shape, this.position)) {
            this.position.row--;
            mergeBoard(this.board, this.shape, this.position);
            return true; // 表示不能再下落
        }
        return false;
    }

    moveLeft() {
        this.position.col--;
        if (!isValidMove(this.board, this.shape, this.position)) {
            this.position.col++;
        } else {
            playSound('move');
        }
    }

    moveRight() {
        this.position.col++;
        if (!isValidMove(this.board, this.shape, this.position)) {
            this.position.col--;
        } else {
            playSound('move');
        }
    }

    rotate() {
        const rotated = rotateMatrix(this.shape);
        if (isValidMove(this.board, rotated, this.position)) {
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

class GameRenderer {

    constructor(canvas, nextCanvas) {
        this.mainContext = canvas.getContext('2d');
        this.mainContext.scale(BLOCK_SIZE, BLOCK_SIZE);

        this.subContext = nextCanvas.getContext('2d');
        this.subContext.scale(BLOCK_SIZE / 2, BLOCK_SIZE / 2);

        this.dropCounter = 0;
        this.currentTetromino = null;
        this.nextTetromino = null;
    }

    startRendering(defaultDropInterval = 1000) {
        this.dropInterval = defaultDropInterval;
        this.board = createBoard(ROWS, COLS);
        this.currentTetromino = randomTetromino(this.board);
        this.nextTetromino = randomTetromino(this.board);
        drawNextTetromino(this.subContext, this.nextTetromino);
    }

    keyAction(typ) {
        switch (typ) {
            case TransAct.Left:
                this.currentTetromino.moveLeft();
                return 0;
            case TransAct.Wright:
                this.currentTetromino.moveRight();
                return 0;
            case TransAct.Rotate:
                this.currentTetromino.rotate();
                return 0;
            case TransAct.Down:
                let cleanLines = 0;

                playSound('drop');
                const endDrop = this.currentTetromino.moveDown();
                if (endDrop) {
                    cleanLines = _gameRenderer.endDrop();
                }
                return cleanLines;
        }
    }

    endDrop() {
        const linesCleared = clearLines(this.board);

        if (linesCleared > 0) {
            playSound('clear');
            triggerBorderFlash(this.mainContext).then();
        }

        this.currentTetromino = this.nextTetromino;
        this.currentTetromino.position = {
            row: 0,
            col: Math.floor(COLS / 2) - Math.floor(this.currentTetromino.shape[0].length / 2)
        };

        this.nextTetromino = randomTetromino(this.board);
        drawNextTetromino(this.subContext, this.nextTetromino);

        if (!isValidMove(this.board, this.currentTetromino.shape, this.currentTetromino.position)) {
            return -1;
        }

        return linesCleared;
    }

    update(deltaTime) {
        let lineCleaned = 0;
        this.dropCounter += deltaTime;

        if (this.dropCounter > this.dropInterval) {
            this.dropCounter = 0;
            const endDrop = this.currentTetromino.moveDown();
            if (endDrop) {
                lineCleaned = this.endDrop();
            }
        }

        drawMainBoard(this.board, this.mainContext);
        if (this.currentTetromino) {
            this.currentTetromino.draw(this.mainContext);
        }

        updateParticles(this.mainContext);
        return lineCleaned;
    }

    speedUp(acceleration) {
        this.dropInterval *= acceleration;
    }

    endRendering() {
        this.nextTetromino = null;
        this.currentTetromino = null;
        this.mainContext.clearRect(0, 0, this.mainContext.canvas.width, this.mainContext.canvas.height);
        this.subContext.clearRect(0, 0, this.subContext.canvas.width, this.subContext.canvas.height);
        this.board = createBoard(ROWS, COLS);
    }

    gameStop(){
        return  !this.currentTetromino;
    }
}

function randomTetromino(board) {
    const randomIndex = Math.floor(Math.random() * TETROMINOS.length);
    return new Tetromino(TETROMINOS[randomIndex].shape, TETROMINOS[randomIndex].color, board);
}

function createBoard(rows, cols) {
    return Array.from({length: rows}, () => Array(cols).fill(0));
}

function drawMainBoard(board, context) {
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

function clearLines(board) {
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

    return linesCleared;
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

function drawNextTetromino(context, tetromino) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    if (!tetromino) return;

    context.fillStyle = tetromino.color;
    const shape = tetromino.shape;
    const rows = shape.length;
    const cols = shape[0].length;

    // 计算居中位置
    const offsetX = Math.floor((context.canvas.width / (BLOCK_SIZE / 2) - cols) / 2);
    const offsetY = Math.floor((context.canvas.height / (BLOCK_SIZE / 2) - rows) / 2);

    shape.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell) {
                drawCell(context, offsetX + colIndex, offsetY + rowIndex, tetromino.color);
            }
        });
    });
}

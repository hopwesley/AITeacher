const canvas = document.getElementById('tetrisCanvas');
const context = canvas.getContext('2d');

const ROWS = 20;
const COLS = 10;
const BLOCK_SIZE = 32;

context.scale(BLOCK_SIZE, BLOCK_SIZE);

const I_TETROMINO = [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]];

const J_TETROMINO = [[1, 0, 0], [1, 1, 1], [0, 0, 0]];

const L_TETROMINO = [[0, 0, 1], [1, 1, 1], [0, 0, 0]];

const O_TETROMINO = [[1, 1], [1, 1]];

const S_TETROMINO = [[0, 1, 1], [1, 1, 0], [0, 0, 0]];

const T_TETROMINO = [[0, 1, 0], [1, 1, 1], [0, 0, 0]];

const Z_TETROMINO = [[1, 1, 0], [0, 1, 1], [0, 0, 0]];

const TETROMINOS = [I_TETROMINO, J_TETROMINO, L_TETROMINO, O_TETROMINO, S_TETROMINO, T_TETROMINO, Z_TETROMINO];

let board = createBoard(ROWS, COLS);
let tetromino = randomTetromino();
let position = {row: 0, col: Math.floor(COLS / 2) - Math.floor(tetromino.length / 2)};
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function createBoard(rows, cols) {
    return Array.from({length: rows}, () => Array(cols).fill(0));
}

function drawBoard(board) {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, COLS, ROWS);

    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length; col++) {
            if (board[row][col]) {
                context.fillStyle = 'blue';
                context.fillRect(col, row, 1, 1);
            }
        }
    }
}

function drawTetromino(tetromino, position) {
    context.fillStyle = 'red';
    tetromino.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell) {
                context.fillRect(position.col + cellIndex, position.row + rowIndex, 1, 1);
            }
        });
    });
}

function mergeBoard(board, tetromino, position) {
    tetromino.forEach((row, rowIndex) => {
        row.forEach((cell, cellIndex) => {
            if (cell) {
                board[position.row + rowIndex][position.col + cellIndex] = 1;
            }
        });
    });
}

function clearLines(board) {
    let linesCleared = 0;
    for (let row = board.length - 1; row >= 0;) {
        if (board[row].every(cell => cell === 1)) {
            board.splice(row, 1);
            board.unshift(Array(COLS).fill(0));
            linesCleared++;
        } else {
            row--;
        }
    }
    return linesCleared;
}

function isValidMove(board, tetromino, position) {
    for (let row = 0; row < tetromino.length; row++) {
        for (let col = 0; col < tetromino[row].length; col++) {
            if (tetromino[row][col] && (position.row + row >= board.length || position.col + col < 0 || position.col + col >= board[0].length || board[position.row + row][position.col + col])) {
                return false;
            }
        }
    }
    return true;
}

function rotateMatrix(matrix) {
    const N = matrix.length;
    const result = [];
    for (let i = 0; i < N; i++) {
        const newRow = new Array(N).fill(0);
        for (let j = 0; j < N; j++) {
            newRow[j] = matrix[N - 1 - j][i];
        }
        result.push(newRow);
    }
    return result;
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        moveDown();
        dropCounter = 0;
    }

    drawBoard(board);
    drawTetromino(tetromino, position);

    requestAnimationFrame(update);
}

function moveDown() {
    position.row++;
    if (!isValidMove(board, tetromino, position)) {
        position.row--;
        mergeBoard(board, tetromino, position);
        clearLines(board);
        tetromino = randomTetromino();
        position = {row: 0, col: Math.floor(COLS / 2) - Math.floor(tetromino.length / 2)};

        if (!isValidMove(board, tetromino, position)) {
            alert('Game Over!');
            board = createBoard(ROWS, COLS);
        }
    }
}

function moveLeft() {
    position.col--;
    if (!isValidMove(board, tetromino, position)) {
        position.col++;
    }
}

function moveRight() {
    position.col++;
    if (!isValidMove(board, tetromino, position)) {
        position.col--;
    }
}

function rotateTetromino() {
    const rotated = rotateMatrix(tetromino);
    if (isValidMove(board, rotated, position)) {
        tetromino = rotated;
    }
}

document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        moveLeft();
    } else if (event.key === 'ArrowRight') {
        moveRight();
    } else if (event.key === 'ArrowDown') {
        moveDown();
    } else if (event.key === 'ArrowUp') {
        rotateTetromino();
    }
});

function randomTetromino() {
    return TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
}

update();
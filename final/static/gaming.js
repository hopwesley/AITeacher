let playerGameRender;
let peerGameRender;
const LEVEL_THRESHOLD = 500;
let playerLevel = 1;
let playerScore = 0;
let animationId;
let lastTime = 0;
let Sequence = 0;

class SelfGameCallback extends GameActionListener {
    action(typ, data) {
        try {
            super.action(typ, data);
            sendGameMsg(typ, data);
        } catch (e) {
            console.error("Failed to send message:", e)
        }
    }
}

function sendGameMsg(typ, data) {
    Sequence++;
    const msg = new GameMsg(typ, data, player.uuid, Sequence);
    gameSocket.send(JSON.stringify(msg));
}

function GameStarting(msg) {
    console.log("------>>> game starting");
    const canvas = document.getElementById('playerCanvas');
    const nextCanvas = document.getElementById('player-nextTetromino');
    playerGameRender = new GameRenderer(canvas, nextCanvas, new SelfGameCallback());
    playerGameRender.startRendering();

    document.addEventListener('keydown', handleKeyPress); // 添加键盘事件

    const peerCanvas = document.getElementById('opponentCanvas');
    const peerNextCanvas = document.getElementById('opponent-nextTetromino');
    peerGameRender = new GameShowRenderer(peerCanvas, peerNextCanvas);
    peerGameRender.startRendering();

    initLevelAndScore();

    backgroundMusicSource = playSound('background', true);
    stopAnimation();
    animationId = requestAnimationFrame(frameUpdate);
}

function Gaming(message) {

    switch (message.typ) {
        case GameTyp.SubTetromino:
            const subObj = JSON.parse(message.data);
            peerGameRender.setNextTetromino(subObj);
            break;

        case GameTyp.MainTetromino:
            peerGameRender.updateCurrentTetromino(JSON.parse(message.data));
            break;

        case GameTyp.MergeBoard:
            peerGameRender.mergeBoard(JSON.parse(message.data));
            break;

        case GameTyp.NewScore:
            document.getElementById("opponentScore").textContent = message.data;
            break;
        case GameTyp.NewLevel:
            document.getElementById("opponentLevel").textContent = message.data;
            break;
    }
}

function GameOvering(data) {
    displayGameResult(data);
}

function frameUpdate(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    const cleanedLines = playerGameRender.update(deltaTime);
    if (!processScore(cleanedLines)) {
        return;
    }
    animationId = requestAnimationFrame(frameUpdate);
}

function initLevelAndScore() {
    playerLevel = 1;
    playerScore = 0;

    document.getElementById("playerLevel").textContent = playerLevel;
    document.getElementById("playerScore").textContent = playerScore;
    document.getElementById("opponentLevel").textContent = '1';
    document.getElementById("opponentScore").textContent = '0';
}

function stopAnimation() {
    if (!animationId) {
        return
    }
    cancelAnimationFrame(animationId);
    animationId = null;
}

function processScore(lines) {
    if (!lines) {
        return true
    }
    switch (lines) {
        case 0:
            return true;
        case -1:
            gameOver();
            return false;
        default:
            playerScore += lines * 100;
            console.log("------>>>>>>player score:", playerScore, lines);
            document.getElementById("playerScore").textContent = playerScore;
            sendGameMsg(GameTyp.NewScore, '' + playerScore);
            if (playerLevel >= 20) {
                return;
            }

            if (playerScore >= playerLevel * LEVEL_THRESHOLD) {
                playerLevel++;
                document.getElementById('playerLevel').textContent = playerLevel;
                playerGameRender.speedUp(0.9);

                sendGameMsg(GameTyp.NewLevel, '' + playerLevel);
            }

            return true;
    }
}

function gameOver() {
    playerGameRender.endRendering();
    stopAnimation();
    sendPlayerGameScore();
    stopBackgroundMusic().then();
    showGameOver();
}

function displayGameResult(data) {
    const overlay = document.getElementById('resultOverlay');
    document.getElementById('yourNickname').textContent = player.name;
    document.getElementById('opponentNickname').textContent = data.peerName;
    document.getElementById('yourScore').textContent = playerScore;
    document.getElementById('resultOpponentScore').textContent = data.peerScore;
    document.getElementById('matchResult').textContent = data.Result;
    overlay.style.display = 'flex';
}

function sendPlayerGameScore() {
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

function handleKeyPress(event) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
    }

    const action = keyToAction(event.key)
    const linesCleared = playerGameRender.keyAction(action);
    processScore(linesCleared);
}

function closeResult(){
    const overlay = document.getElementById('resultOverlay');
    overlay.style.display = 'none';
}


function showGameOver() {
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    gameOverOverlay.style.display = 'flex';
}

function hideGameOver() {
    const gameOverOverlay = document.getElementById('gameOverOverlay');
    gameOverOverlay.style.display = 'none';
}

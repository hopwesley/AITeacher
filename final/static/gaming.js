let playerGameRender;
let peerGameRender;

let playerLevel = 1;
let peerLevel = 1;
let playerScore = 0;
let peerScore = 0;
let animationId;
let lastTime = 0;

class SelfGameCallback extends GameActionListener {
    action() {
        super.action();
    }
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
    animationId = requestAnimationFrame(frameUpdate); // 直接启动动画帧
}

function Gaming(data, seq) {

}

function GameOvering(data) {
    playerGameRender.endRendering();
}

function frameUpdate(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    const cleanedLines = playerGameRender.update(deltaTime);
    if(!processScore(cleanedLines)){
        return;
    }
    animationId = requestAnimationFrame(frameUpdate);
}

function initLevelAndScore() {
    playerLevel = 1;
    peerLevel = 1;
    playerScore = 0;
    peerScore = 0;

    document.getElementById("playerLevel").textContent = playerLevel;
    document.getElementById("opponentLevel").textContent = peerLevel;
    document.getElementById("playerScore").textContent = playerScore;
    document.getElementById("opponentScore").textContent = peerScore;
}

function stopAnimation() {
    if (!animationId) {
        return
    }
    cancelAnimationFrame(animationId);
    animationId = null;
}

function processScore(lines) {
    switch (lines) {
        case 0:
            return true;
        case -1:
            gameOver();
            return  false;
        default:
            playerScore += lines * 100;
            document.getElementById("playerScore").textContent = playerScore;
            if (playerLevel >= 20) {
                return;
            }

            if (playerScore >= peerLevel * LEVEL_THRESHOLD) {
                peerLevel++;
                document.getElementById('playerLevel').textContent = peerLevel;
                playerGameRender.speedUp(0.9);
            }

            return true;
    }
}

function gameOver() {
    playerGameRender.endRendering();
    stopAnimation();
    displayGameResult();
    sendGameResult();
}

function displayGameResult() {
}

function sendGameResult() {

}

function handleKeyPress(event) {
    if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
        event.preventDefault();
    }

    const action = keyToAction(event.key)
    const linesCleared = playerGameRender.keyAction(action);
    processScore(linesCleared);
}
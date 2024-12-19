let audioContext;
const audioBufferPool = {};
const audioRawBuffer = {};
let backgroundMusicSource; // 用于存储背景音乐的音频源节点

initSounds().then(() => {
    console.log("------>>> load sound successfully!");
})

async function initSounds() {
    await loadSound('move', '/sounds/move.wav');
    await loadSound('rotate', '/sounds/rotate_sound.wav');
    await loadSound('drop', '/sounds/drop_sound.wav');
    await loadSound('clear', '/sounds/clear_sound.wav');
    await loadSound('gameOver', '/sounds/game_over.wav');
    await loadSound('background', '/sounds/back_ground.mp3');
}


async function loadSound(name, url) {
    const response = await fetch(url);
    audioRawBuffer[name] = await response.arrayBuffer();
}

async function playSound(name, loop = false) {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (!audioBufferPool[name]) {
        if (!audioRawBuffer.hasOwnProperty(name)) {
            return;
        }
        const value = audioRawBuffer[name];
        audioBufferPool[name] = await audioContext.decodeAudioData(value);
    }

    const source = audioContext.createBufferSource();
    source.loop = loop;
    source.buffer = audioBufferPool[name];
    source.connect(audioContext.destination);
    source.start(0);
    return source;
}

async function stopBackgroundMusic() {
    const source = await backgroundMusicSource
    if (source) {
        source.stop();
        source.disconnect();
        backgroundMusicSource = null;
    }
}
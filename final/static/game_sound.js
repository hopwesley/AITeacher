let audioContext;
const audioBufferPool = {};

async function initSounds() {
    initAudioContext();
    await loadSound('move', '/sounds/move.wav');
    await loadSound('rotate', '/sounds/rotate_sound.wav');
    await loadSound('drop', '/sounds/drop_sound.wav');
    await loadSound('clear', '/sounds/clear_sound.wav');
    await loadSound('gameOver', '/sounds/game_over.wav');
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

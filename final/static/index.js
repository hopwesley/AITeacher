document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveNicknameButton');
    const nicknameInput = document.getElementById('nicknameInput');
    const player = loadPlayerInfo();
    if (player) {
        nicknameInput.value = player.name;
        saveBtn.textContent = '登录';
    }
});

async function saveNickname() {
    const nicknameInput = document.getElementById('nicknameInput');
    const gameModeRadios = document.getElementsByName('gameMode');

    const nickname = nicknameInput.value.trim();
    if (!nickname) {
        alert('请输入有效的昵称！');
        return;
    }
    let player = loadPlayerInfo();
    if (!player) {
        player = new PlayerInfo(nickname, generateUUID());
    }

    const selectedMode = Array.from(gameModeRadios).find(radio => radio.checked).value;
    if (selectedMode === 'single') {
        window.location.href = 'offline_game.html';
    } else if (selectedMode === 'online') {
        try {
            const response = await httpService(singInUp, player);
            savePlayerInfo(response);
            console.log("------>>> player sign in success:", response);
            window.location.href = 'online_game.html';
        } catch (error) {
            console.error('登录请求失败:', error);
            alert('登录失败，请检查网络连接！' + error);
        }
    }
}

// 生成 UUID 的函数
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

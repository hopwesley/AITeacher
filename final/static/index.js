document.addEventListener('DOMContentLoaded', () => {
    const saveBtn = document.getElementById('saveNicknameButton');
    const nicknameInput = document.getElementById('nicknameInput');
    const player = loadPlayerInfo();
    if (player) {
        nicknameInput.value = player.name;
        saveBtn.textContent = '登录';
    }
    saveBtn.addEventListener('click',saveNickname);
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


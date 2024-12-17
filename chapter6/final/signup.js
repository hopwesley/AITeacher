
document.addEventListener('DOMContentLoaded', () => {
    const saveNicknameButton = document.getElementById('saveNicknameButton');
    const nicknameInput = document.getElementById('nicknameInput');
    const gameModeRadios = document.getElementsByName('gameMode');

    // 检查本地缓存中的昵称和 UUID
    const storedNickname = localStorage.getItem('playerName');
    let uuid = localStorage.getItem('uuid');

    if (!uuid) {
        // 如果 UUID 不存在，生成并保存新的 UUID
        uuid = generateUUID();
        localStorage.setItem('uuid', uuid);
    }

    if (storedNickname) {
        nicknameInput.value = storedNickname;
        saveNicknameButton.textContent = '登录';
    }

    // 保存昵称并处理跳转逻辑
    window.saveNickname = async () => {
        const nickname = nicknameInput.value.trim();
        if (!nickname) {
            alert('请输入有效的昵称！');
            return;
        }

        localStorage.setItem('playerName', nickname);

        const selectedMode = Array.from(gameModeRadios).find(radio => radio.checked).value;

        if (selectedMode === 'single') {
            // 单机模式，跳转到 index.html
            window.location.href = 'index.html';
        } else if (selectedMode === 'online') {
            // 联机模式，调用 httpService 验证用户信息并上传 UUID
            try {
                const response = await httpService('/api/login', { nickname, uuid });
                if (response.success) {
                    alert('登录成功！');
                    window.location.href = 'index_online.html';
                } else {
                    alert(`登录失败：${response.message}`);
                }
            } catch (error) {
                console.error('登录请求失败:', error);
                alert('登录失败，请检查网络连接！');
            }
        }
    };
});

// 生成 UUID 的函数
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

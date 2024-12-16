function saveNickname() {
    const nicknameInput = document.getElementById('nicknameInput').value.trim();
    if (nicknameInput) {
        localStorage.setItem('playerName', nicknameInput);
        alert(`昵称已保存：${nicknameInput}`);
    } else {
        alert('请输入有效的昵称！');
    }
}

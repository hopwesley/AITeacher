function selectFriend(element, name, id, highScore) {
    // 移除所有已选中的样式
    document.querySelectorAll('.friend').forEach(friend => friend.classList.remove('selected'));
    // 添加选中样式
    element.classList.add('selected');
    // 更新详情面板内容
    document.getElementById('friendName').textContent = name;
    document.getElementById('friendId').textContent = id;
    document.getElementById('friendHighScore').textContent = highScore;
}

function inviteFriend() {
    const friendName = document.getElementById('friendName').textContent;
    if (friendName !== '-') {
        alert(`已向 ${friendName} 发送对战邀请！`);
        startBattle();
    } else {
        alert('请先选择一个好友！');
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (message) {
        const chatMessages = document.getElementById('chatMessages');
        const newMessage = document.createElement('div');
        newMessage.textContent = `你: ${message}`;
        chatMessages.appendChild(newMessage);
        input.value = '';
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

function startBattle() {
    document.querySelector('.container').style.display = 'none'; // 隐藏好友列表界面
    document.getElementById('battlePanel').style.display = 'flex'; // 显示对战界面

    // 初始化或加载对战逻辑
    initBattleGame();
}

function initBattleGame() {
    // 初始化双方的游戏画布、分数和等级等
    console.log("对战开始！");
}

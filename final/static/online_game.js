let gameSocket;
let chatSocket;
let player;

document.addEventListener('DOMContentLoaded', () => {
    player = loadPlayerInfo();
    if (!player) {
        alert("failed to load player infos");
        return;
    }
    console.log("------>>> player info:", player);
    // gameSocket = OpenGameConn(new GameCallback());
    chatSocket = OpenChatConn(player, new ChatCallback());
});


function selectFriend(element, name, id, highScore) {
    document.querySelectorAll('.friend').forEach(friend => friend.classList.remove('selected'));
    element.classList.add('selected');
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
    document.getElementById('battleContainer').style.display = 'flex'; // 显示对战界面
    initBattleGame();
}

function initBattleGame() {
    console.log("对战开始！");
}

function quitOnlineGame() {
    document.querySelector('.container').style.display = 'flex'; // 隐藏好友列表界面
    document.getElementById('battleContainer').style.display = 'none'; // 显示对战界面
}

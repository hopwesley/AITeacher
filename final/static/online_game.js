let gameSocket;
let chatSocket;
let player;

document.addEventListener('DOMContentLoaded', () => {
    player = loadPlayerInfo();
    if (!player) {
        alert("failed to load player infos");
        window.location.href = 'index.html';
        return;
    }
    console.log("------>>> player info:", player);
    // gameSocket = OpenGameConn(new GameCallback());
    chatSocket = OpenChatConn(player, new ChatCallback());
    loadOnlinePlayers().then(r => {
        console.log("------>>> check online player success");
    })
});

async function loadOnlinePlayers() {
    const friendListUl = document.getElementById("friend-list-ul")
    friendListUl.innerHTML = '';

    const playerMap = await httpService(playerList, '');
    if (!playerMap) {
        console.log("----->>> no online players")
        return
    }

    const template = document.getElementById("friendItemTemplate")
    for (const key in playerMap) {
        const obj = playerMap[key];
        const clone = template.cloneNode(true);
        clone.style.display = 'block';
        clone.removeAttribute('id');
        clone.querySelector(".friend_name").textContent = obj.name;
        clone.querySelector(".friend_status").textContent = obj.status === 0 ? "状态: 空闲" : "状态: 游戏中";
        clone.addEventListener('click',()=>{
            selectFriend(clone, obj);
        })
        friendListUl.append(clone);
    }
}

function selectFriend(element, obj) {
    document.querySelectorAll('.friend').forEach(friend => friend.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('friendName').textContent = obj.name;
    document.getElementById('friendId').textContent = obj.uuid;
    document.getElementById('friendHighScore').textContent = obj.score;
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

function signOut() {
    if (chatSocket) {
        chatSocket.close(3001, "quit manual");
    }
    if (gameSocket) {
        gameSocket.close(3001, "quit manual");
    }

    window.location.href = "index.html"
}

function userOnOffLine(isOnline, player) {

}

function newMsg(msg) {

}

function updateUserGameStatus(player, status) {

}

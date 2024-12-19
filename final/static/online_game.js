let gameSocket;
let chatSocket;
let player;

const chatCache = new Map();
document.addEventListener('DOMContentLoaded', () => {
    player = loadPlayerInfo();
    if (!player) {
        alert("failed to load player infos");
        window.location.href = 'index.html';
        return;
    }
    chatSocket = OpenChatConn(player, new ChatCallback());
    loadOnlinePlayers().then(() => {
        console.log("------>>> check online player success");
    });

    document.getElementById('chatInput').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });
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

        if (obj.uuid === player.uuid) {
            console.log("------>>> skip yourself")
            continue;
        }

        const clone = newFriendItem(template, obj);
        friendListUl.append(clone);
    }
}

function newFriendItem(template, obj) {
    const clone = template.cloneNode(true);
    clone.style.display = 'block';
    clone.removeAttribute('id');
    clone.querySelector(".friend_name").textContent = obj.name;
    clone.querySelector(".friend_status").textContent = obj.status === 0 ? "状态: 空闲" : "状态: 游戏中";
    clone.addEventListener('click', () => {
        selectFriend(clone, obj);
    })
    clone.dataset.uuid = obj.uuid
    return clone;
}

function cacheData(uuid, msg) {
    let cache = chatCache[uuid];
    if (!cache) {
        chatCache[uuid] = [];
        cache = chatCache[uuid];
    }
    cache.push(msg);
}

function selectFriend(element, obj) {
    document.querySelectorAll('.friend').forEach(friend => friend.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('friendName').textContent = obj.name;
    document.getElementById('friendId').textContent = obj.uuid;
    document.getElementById('friendHighScore').textContent = obj.score;
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = "";

    const historyChat = chatCache[obj.uuid];
    if (!historyChat) {
        return;
    }

    for (let i = 0; i < historyChat.length; i++) {
        const chatMsg = historyChat[i];
        newChatItemDiv(chatMessages, `你: ${chatMsg.msg}`, chatMsg.from === player.uuid);
    }
}

function inviteFriend() {
    const peerID = document.getElementById('friendId').textContent.trim();
    if (peerID === '-') {
        alert('请先选择一个好友！');
        return;
    }
    showWaitingStatus();
    try {
        const msg = new ChatMsg(Date.now(), player.uuid, peerID, player.name, MsgTyp.InviteGame);
        chatSocket.send(JSON.stringify(msg));
    } catch (e) {
        alert(e)
        hideWaitingStatus();
    }
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const peerUUID = document.getElementById('friendId').textContent.trim();
    if (peerUUID.length < 4) {
        return;
    }

    const message = input.value.trim();
    if (!message) {
        return;
    }

    const chatMsg = new ChatMsg(Date.now(), player.uuid, peerUUID, message, MsgTyp.Chat);
    cacheData(chatMsg.to, chatMsg);

    const chatMessages = document.getElementById('chatMessages');
    newChatItemDiv(chatMessages, `你: ${message}`, true);
    input.value = '';

    chatSocket.send(JSON.stringify(chatMsg));
}

function newChatItemDiv(chatMessages, msg, isMine = false) {
    const newMessage = document.createElement('div');

    newMessage.classList.add("chat-message");
    if (isMine) {
        newMessage.classList.add('my-message');
    } else {
        newMessage.classList.add('other-message');
    }

    newMessage.textContent = msg;
    chatMessages.appendChild(newMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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
    const friendList = document.getElementById("friend-list-ul");
    const element = friendList.querySelector(`[data-uuid="${player.uuid}"]`);
    if (element) {
        if (isOnline === false) {
            element.remove();
        }
        return;
    }

    if (isOnline === false) {
        return;
    }

    const template = document.getElementById("friendItemTemplate");
    const clone = newFriendItem(template, player);
    friendList.append(clone);
}

function newMsg(chatMsg) {
    cacheData(chatMsg.from, chatMsg);
    const currentPeer = document.getElementById('friendId').textContent.trim();
    if (currentPeer !== chatMsg.from) {
        return;
    }

    const peerName = document.getElementById('friendName').textContent.trim();
    const chatMessages = document.getElementById('chatMessages');
    newChatItemDiv(chatMessages, `${peerName}: ${chatMsg.msg}`);
}

function gotGameInvite(chatMsg) {
    if (chatMsg.to !== player.uuid) {
        console.warn("------>>>wrong game invite message:", chatMsg);
        return;
    }
    showInviteOverlay(chatMsg.from, chatMsg.msg);
}

function notifyOffline() {
    window.location.href = 'index.html';
}

function showWaitingStatus() {
    document.getElementById('waitingOverlay').style.display = 'block';
}

function hideWaitingStatus() {
    document.getElementById('waitingOverlay').style.display = 'none';
}

// 显示邀请弹窗
function showInviteOverlay(opponentUuid, opponentName) {
    const inviteMessage = document.getElementById('inviteMessage');
    inviteMessage.querySelector(".opponentName").textContent = opponentName;
    document.getElementById('inviteOverlay').style.display = 'flex';
    inviteMessage.dataset.uuid = opponentUuid;
}

// 隐藏邀请弹窗
function hideInviteOverlay() {
    document.getElementById('inviteOverlay').style.display = 'none';
}

// 同意邀请的逻辑
function acceptInvite() {
    hideInviteOverlay();
    const inviteMessage = document.getElementById('inviteMessage');
    const peerID = inviteMessage.dataset.uuid;
    if (!peerID) {
        alert("invalid peer id for accepts");
        return
    }
    showWaitingStatus();
    const gameRoomID = generateUUID();
    const msg = new ChatMsg(Date.now(), player.uuid, peerID, gameRoomID, MsgTyp.AcceptGame);
    chatSocket.send(JSON.stringify(msg));

    const gameJoin = new GameJoin(player.uuid, gameRoomID);
    gameSocket = OpenGameConn(gameJoin, new GameCallback());
}

// 拒绝邀请的逻辑
function declineInvite() {
    hideInviteOverlay();
    const inviteMessage = document.getElementById('inviteMessage');
    const peerID = inviteMessage.dataset.uuid;
    if (!peerID) {
        alert("invalid peer id for accepts");
        return
    }

    const msg = new ChatMsg(Date.now(), player.uuid, peerID, player.name, MsgTyp.RejectGame);
    chatSocket.send(JSON.stringify(msg));
}

function GameResult(chatMsg) {

    hideWaitingStatus();
    if (chatMsg.typ === MsgTyp.RejectGame) {
        alert("对方拒绝邀请");
        return
    }
    
    const gameJoin = new GameJoin(player.uuid, chatMsg.msg);
    gameSocket = OpenGameConn(gameJoin, new GameCallback());

    startBattle();
}

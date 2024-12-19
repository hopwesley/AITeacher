const server_host = '192.168.18.51:8080';///api/uploadScore
const chatEndpoint = '/chat'
const gameEndpoint = '/game'
const singInUp = '/signInUp'
const playerList = '/playerList'

async function httpService(apiPath, data) {
    console.log('------>>>httpService:', apiPath, JSON.stringify(data));
    try {
        const response = await fetch(apiPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('------>>> Response received:', result);
        return result;
    } catch (error) {
        console.error('------>>> Error during HTTP request:', error);
        throw error;
    }
}

const keepAliveInterval = 30000; // 每 30 秒发送一次
function __initSocket(endPoint, player, callback) {
    const params = new URLSearchParams({...player});
    const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss://' : 'ws://'}${window.location.host}${endPoint}?${params}`);

    let keepAliveTimer;

    socket.onopen = () => {
        callback.OnOpen();
        keepAliveTimer = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
                const msg = new ChatMsg(Date.now(), player.uuid, '0', 'ping', MsgTyp.MsgTypePing)
                socket.send(JSON.stringify(msg)); // 主动发送心跳
                console.log("发送心跳: ping");
            }
        }, keepAliveInterval);
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.typ === MsgTyp.MsgTypePong) {
            console.log("------>>>收到心跳响应: pong");
            return
        }
        callback.OnMessage(data);
    };

    socket.onclose = () => {
        clearInterval(keepAliveTimer); // 停止心跳
        callback.OnClose();
    };

    return socket;
}

function OpenChatConn(player, callbackInstance) {
    if (!(callbackInstance instanceof WebSocketCallback)) {
        throw new Error('callbackInstance 必须是 WebSocketCallback 的实例');
    }
    return __initSocket(chatEndpoint, player, callbackInstance);
}

function OpenGameConn(player, callbackInstance) {
    if (!(callbackInstance instanceof WebSocketCallback)) {
        throw new Error('callbackInstance 必须是 WebSocketCallback 的实例');
    }
    return __initSocket(gameEndpoint, player, callbackInstance);
}

class WebSocketCallback {
    OnOpen() {
        // WebSocket 连接打开时的逻辑
        console.log('WebSocket 连接已打开');
    }

    OnMessage(data) {
        // 接收到消息时的逻辑
        console.log('收到的数据:', data);
    }

    OnClose() {
        // WebSocket 连接关闭时的逻辑
        console.log('WebSocket 连接已关闭');
    }
}

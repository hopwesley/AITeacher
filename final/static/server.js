const server_host = '192.168.18.51';///api/uploadScore
const chatEndpoint = '/chat'
const gameEndpoint = '/game'

async function httpService(apiPath, data) {
    console.log('------>>>httpService:', apiPath, JSON.stringify(data));
    try {
        const response = await fetch('http://'+server_host + apiPath, {
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

function __initSocket(endPoint, callback) {
    const socket = new WebSocket('ws://' + server_host + endPoint);

    socket.onopen = () => {
        console.log('WebSocket 连接已打开');
        callback.OnOpen();
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('接收到的数据:', data);
        callback.OnMessage(data);
    };

    socket.onclose = () => {
        console.log('WebSocket 连接已关闭');
        callback.OnClose();
    };

    return socket;
}

function OpenChatConn(callbackInstance) {
    if (!(callbackInstance instanceof WebSocketCallback)) {
        throw new Error('callbackInstance 必须是 WebSocketCallback 的实例');
    }
    return __initSocket(chatEndpoint, callbackInstance);
}

function OpenGameConn(callbackInstance) {
    if (!(callbackInstance instanceof WebSocketCallback)) {
        throw new Error('callbackInstance 必须是 WebSocketCallback 的实例');
    }
    return __initSocket(gameEndpoint, callbackInstance);
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

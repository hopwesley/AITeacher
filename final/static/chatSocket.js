class ChatCallback extends WebSocketCallback {
    OnOpen() {
        super.OnOpen();
        console.log('聊天连接已准备好');
    }

    OnMessage(data) {
        super.OnMessage(data);
        console.log('聊天消息:', data.message);
    }

    OnClose() {
        super.OnClose();
        console.log('聊天连接已断开');
    }
}

const chatCallback = new ChatCallback();
const chatSocket = OpenChatConn(chatCallback);

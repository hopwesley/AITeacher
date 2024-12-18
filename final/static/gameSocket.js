class GameCallback extends WebSocketCallback {
    OnOpen() {
        super.OnOpen();
        console.log('游戏连接已准备好');
    }

    OnMessage(data) {
        super.OnMessage(data);
        console.log('游戏数据:', data);
    }

    OnClose() {
        super.OnClose();
        console.log('游戏连接已断开');
    }
}
const gameCallback = new GameCallback();
const gameSocket = OpenGameConn(gameCallback);

class GameCallback extends WebSocketCallback {
    OnOpen() {
        super.OnOpen();
        console.log('游戏连接已准备好');
        // document.getElementById('waitingStatus').textContent="建立连接.....";
    }

    OnMessage(data) {
        super.OnMessage(data);
        procGameMessage(new GameMsg(data.typ, data.data, data.from, data.seq))
    }

    OnClose() {
        super.OnClose();
        console.log('游戏连接已断开');
    }
}


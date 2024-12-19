class GameCallback extends WebSocketCallback {
    OnOpen() {
        super.OnOpen();
        console.log('游戏连接已准备好');
        // document.getElementById('waitingStatus').textContent="建立连接.....";
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


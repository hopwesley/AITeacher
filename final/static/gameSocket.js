class GameCallback extends WebSocketCallback {
    OnOpen() {
        super.OnOpen();
        console.log('游戏连接已准备好');
        // document.getElementById('waitingStatus').textContent="建立连接.....";
    }

    OnMessage(data) {
        super.OnMessage(data);
        const msg = new GameMsg(data.typ, data.data, data.from, data.seq);

        switch (data.typ) {
            case GameTyp.StartGame:
                GameStarting(msg);
                break;
            case GameTyp.GameOver:
                GameOvering(msg.data);
                break;
            default:
                Gaming(msg);
                break;
        }
    }

    OnClose() {
        super.OnClose();
        console.log('游戏连接已断开');
    }
}


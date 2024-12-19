class ChatCallback extends WebSocketCallback {

    OnOpen() {
        super.OnOpen();
        console.log('------>>>聊天连接已准备好');
    }

    OnMessage(data) {
        super.OnMessage(data);

        const msg = new ChatMsg(data.mid, data.from, data.to, data.msg, data.typ);
        if (msg.typ === MsgTyp.MsgTypUserOnline || msg.typ === MsgTyp.MsgTypUserOffline) {
            const playerInfo = JSON.parse(data.msg);
            const player = new PlayerInfo(playerInfo.name, playerInfo.uuid, playerInfo.score, playerInfo.cTime);
            userOnOffLine(msg.typ === 1, player);
        } else if (msg.typ === MsgTyp.MsgTypChat) {
            newMsg(msg);
        } else if (msg.typ === MsgTyp.MsgTypeUserGameStatus) {
            const playerInfo = JSON.parse(data.msg);
            updateUserGameStatus(playerInfo.to, playerInfo.status);
        }
    }

    OnClose() {
        super.OnClose();
        console.log('------>>>聊天连接已断开');
        notifyOffline();
    }
}


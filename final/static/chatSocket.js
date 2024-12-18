class ChatCallback extends WebSocketCallback {

    OnOpen() {
        super.OnOpen();
        console.log('------>>>聊天连接已准备好');
    }

    OnMessage(data) {
        super.OnMessage(data);
        console.log('------>>>聊天消息:', data);

        const msg = new ChatMsg(data.mid, data.from, data.to, data.msg, data.typ);
        if (msg.typ === 1 || msg.typ === 2) {
            const playerInfo = JSON.parse(data.msg);
            console.log("------>>> player on offline:", playerInfo);
            const player = new PlayerInfo(playerInfo.name, playerInfo.uuid,playerInfo.score,playerInfo.cTime);
            userOnOffLine(msg.typ === 1,player);
        }else if(msg.typ === 0){
            newMsg(msg);
        }else if(msg.typ === 3){
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


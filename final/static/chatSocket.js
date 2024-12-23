class ChatCallback extends WebSocketCallback {

    OnOpen() {
        super.OnOpen();
        console.log('------>>>聊天连接已准备好');
    }

    OnMessage(data) {
        super.OnMessage(data);
        console.log("----->>> chat message", data);
        const msg = new ChatMsg(data.mid, data.from, data.to, data.msg, data.typ);
        if (msg.typ === MsgTyp.UserOnline || msg.typ === MsgTyp.UserOffline) {
            const playerInfo = JSON.parse(data.msg);
            const player = new PlayerInfo(playerInfo.name, playerInfo.uuid, playerInfo.score, playerInfo.cTime);
            userOnOffLine(msg.typ === 1, player);
        } else if (msg.typ === MsgTyp.Chat) {
            newMsg(msg);
        } else if (msg.typ === MsgTyp.InviteGame) {
            gotGameInvite(msg);
        }else if (msg.typ === MsgTyp.AcceptGame ||msg.typ === MsgTyp.RejectGame){
            GameInviteResult(msg);
        }else if (msg.typ === MsgTyp.UserIdle || msg.typ === MsgTyp.UserInGame){
            userStatusChanged(data.msg, msg.typ);
        }
    }

    OnClose() {
        super.OnClose();
        console.log('------>>>聊天连接已断开');
        notifyOffline();
    }
}


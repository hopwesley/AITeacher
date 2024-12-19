const __db_player_key = "__db_player_key__"

class PlayerInfo {
    constructor(name, uuid, score = 0, cTime = Math.floor(Date.now() / 1000), status = 0) {
        this.name = name;          // 玩家名称
        this.uuid = uuid;          // 玩家唯一标识符
        this.score = score;        // 当前分数，默认为0
        this.cTime = cTime;        // 创建时间或加入时间
        this.status = status;
    }

    // 更新玩家的分数
    updateScore(newScore) {
        if (newScore > this.score) {
            this.score = newScore;
        }
    }

    // 格式化玩家信息为字符串
    getInfo() {
        return `玩家名称: ${this.name}\nUUID: ${this.uuid}\n当前分数: ${this.score}\n加入时间: ${this.formatTime(this.cTime)}`;
    }

    formatTime(unixTime) {
        const date = new Date(unixTime * 1000); // 转换为毫秒时间戳
        return date.toLocaleString(); // 返回本地时间字符串
    }

    // 重置分数
    resetScore() {
        this.score = 0;
    }

    // 比较分数，用于对战结果判断
    compareScore(otherPlayer) {
        if (this.score > otherPlayer.score) {
            return `${this.name} 胜出！`;
        } else if (this.score < otherPlayer.score) {
            return `${otherPlayer.name} 胜出！`;
        } else {
            return "平局！";
        }
    }
}

function loadPlayerInfo() {
    const str = localStorage.getItem(__db_player_key);
    if (!str) {
        return null;
    }
    const jsonObj = JSON.parse(str);
    return new PlayerInfo(jsonObj.name, jsonObj.uuid, jsonObj.score, jsonObj.cTime);
}

function savePlayerInfo(player) {
    if (!player) {
        throw Error("invalid player data");
    }
    localStorage.setItem(__db_player_key, JSON.stringify(player))
}


class ChatMsg {
    constructor(mid, from, to, msg, typ) {
        this.mid = mid;
        this.from = from;
        this.to = to;
        this.msg = msg;
        this.typ = typ;
    }
}

const MsgTyp = {
    Chat: 0,
    UserOnline: 1,
    UserOffline: 2,
    UserInGame: 3,
    UserIdle: 4,
    Ping: 5,
    Pong: 6,
    InviteGame: 7,
    AcceptGame: 8,
    RejectGame: 9
};

class GameJoin {
    constructor(playerID, gameID) {
        this.playerID = playerID;
        this.gameID = gameID;
    }
}

// 生成 UUID 的函数
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

class GameMsg {
    constructor(typ, data, from, seq) {
        this.typ = typ;
        this.data = data;
        this.from = from;
        this.seq = seq;
    }
}
const GameTyp = {
    StartGame: 0,
    GameData: 1,
    GameOver: 2,
};

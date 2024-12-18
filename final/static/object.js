const __db_player_key = "__db_player_key__"

class PlayerInfo {
    constructor(name, uuid, score = 0, cTime = Math.floor(Date.now() / 1000)) {
        this.name = name;          // 玩家名称
        this.uuid = uuid;          // 玩家唯一标识符
        this.score = score;        // 当前分数，默认为0
        this.cTime = cTime;        // 创建时间或加入时间
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
    if (!player){
        throw Error("invalid player data");
    }
    localStorage.setItem(__db_player_key, JSON.stringify(player))
}

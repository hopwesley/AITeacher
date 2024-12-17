package main

import (
	"encoding/json"
	"fmt"
	"github.com/syndtr/goleveldb/leveldb"
	"log"
	"net/http"
	"sort"
)
var db *leveldb.DB

func init() {
	var err error
	db, err = leveldb.OpenFile("userdb", nil)
	if err != nil {
		log.Fatal("无法打开 LevelDB 数据库:", err)
	}
}

type PlayerInfo struct {
    Username   string `json:"username"`
    Nickname   string `json:"nickname"`
    HighScore  int    `json:"high_score"`
    Registered string `json:"registered"` // 注册日期字符串，如 "2024-05-01"
}

func updateHighScore(username string, newScore int) error {
    data, err := db.Get([]byte("player:"+username), nil)
    if err != nil {
        return err
    }

    var player PlayerInfo
    if err := json.Unmarshal(data, &player); err != nil {
        return err
    }

    if newScore > player.HighScore {
        player.HighScore = newScore
        updatedData, err := json.Marshal(player)
        if err != nil {
            return err
        }

        return db.Put([]byte("player:"+username), updatedData, nil)
    }

    return nil
}

func syncScoreHandler(w http.ResponseWriter, r *http.Request) {
    var data struct {
        Username string `json:"username"`
        Score    int    `json:"score"`
    }

    // 解析客户端提交的 JSON 数据
    if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    // 调用已有的函数，更新最高分
    err := updateHighScore(data.Username, data.Score)
    if err != nil {
        http.Error(w, "Failed to sync score", http.StatusInternalServerError)
        return
    }

    fmt.Fprintf(w, "Score updated successfully for %s!", data.Username)
}

func leaderboardHandler(w http.ResponseWriter, r *http.Request) {
    var players []PlayerInfo

    // 遍历数据库，提取玩家数据
    iter := db.NewIterator(nil, nil)
    for iter.Next() {
        key := string(iter.Key())
        if len(key) > 7 && key[:7] == "player:" { // 确保是玩家数据
            var player PlayerInfo
            if err := json.Unmarshal(iter.Value(), &player); err == nil {
                players = append(players, player)
            }
        }
    }
    iter.Release()

    // 排序玩家分数
    sort.Slice(players, func(i, j int) bool {
        return players[i].HighScore > players[j].HighScore
    })

    // 返回前 10 名玩家
    topPlayers := players
    if len(players) > 10 {
        topPlayers = players[:10]
    }

    json.NewEncoder(w).Encode(topPlayers)
}


func main() {
	defer db.Close() // 关闭数据库

  // 提供静态文件服务
    fs := http.FileServer(http.Dir("."))
    http.Handle("/", fs)

    http.HandleFunc("/syncScore", syncScoreHandler)
    http.HandleFunc("/getLeaderboard", leaderboardHandler)

	fmt.Println("服务器启动，访问地址：http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("服务器启动失败:", err)
	}
}

package main

import (
	"encoding/json"
	"fmt"
	"github.com/syndtr/goleveldb/leveldb"
	"log"
	"net/http"
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
func createPlayerInfo(username, nickname string) error {
    player := PlayerInfo{
        Username:   username,
        Nickname:   nickname,
        HighScore:  0, // 初始分数为 0
        Registered: time.Now().Format("2006-01-02"), // 当前日期
    }

    data, err := json.Marshal(player)
    if err != nil {
        return err
    }

    return db.Put([]byte("player:"+username), data, nil)
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
func getPlayerInfo(username string) (*PlayerInfo, error) {
    data, err := db.Get([]byte("player:"+username), nil)
    if err != nil {
        return nil, err
    }

    var player PlayerInfo
    if err := json.Unmarshal(data, &player); err != nil {
        return nil, err
    }

    return &player, nil
}


func createPlayerHandler(w http.ResponseWriter, r *http.Request) {
    var data struct {
        Username string `json:"username"`
        Nickname string `json:"nickname"`
    }

    if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    err := createPlayerInfo(data.Username, data.Nickname)
    if err != nil {
        http.Error(w, "Failed to create player info", http.StatusInternalServerError)
        return
    }

    fmt.Fprintf(w, "Player info for %s created successfully!", data.Username)
}

func updateScoreHandler(w http.ResponseWriter, r *http.Request) {
    var data struct {
        Username string `json:"username"`
        Score    int    `json:"score"`
    }

    if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    err := updateHighScore(data.Username, data.Score)
    if err != nil {
        http.Error(w, "Failed to update score", http.StatusInternalServerError)
        return
    }

    fmt.Fprintf(w, "High score updated for player %s!", data.Username)
}

func getPlayerInfoHandler(w http.ResponseWriter, r *http.Request) {
    username := r.URL.Query().Get("username")
    player, err := getPlayerInfo(username)
    if err != nil {
        http.Error(w, "Player not found", http.StatusNotFound)
        return
    }

    json.NewEncoder(w).Encode(player)
}

func main() {
	defer db.Close() // 关闭数据库

  // 提供静态文件服务
    fs := http.FileServer(http.Dir("."))
    http.Handle("/", fs)

	http.HandleFunc("/createPlayer", createPlayerHandler)
    http.HandleFunc("/updateScore", updateScoreHandler)
    http.HandleFunc("/getPlayerInfo", getPlayerInfoHandler)

	fmt.Println("服务器启动，访问地址：http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("服务器启动失败:", err)
	}
}

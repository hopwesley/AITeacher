package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type PlayerInfo struct {
	Username   string `json:"username"`
	Nickname   string `json:"nickname"`
	HighScore  int    `json:"high_score"`
	Registered string `json:"registered"` // 注册日期字符串，如 "2024-05-01"
}

type PlayerConnection struct {
	conn   *websocket.Conn
	player *PlayerInfo
}

var playerConnections = make(map[string]*PlayerConnection)


func gameHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket 升级失败", http.StatusInternalServerError)
		return
	}
	defer conn.Close()

	var playerName string
	playerName = r.URL.Query().Get("player")

	// 为每个玩家创建一个连接
	playerConnections[playerName] = &PlayerConnection{conn: conn, player: &PlayerInfo{Username: playerName}}
	fmt.Println("------>>> new connection", playerName)
	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			delete(playerConnections, playerName)
			return
		}

		var data map[string]interface{}
		json.Unmarshal(msg, &data)

		if data["type"] == "updateState" {
			gameState := data["gameState"].(map[string]interface{})
			// 将更新的状态发送给对方
			sendToOpponent(playerName, gameState)
			fmt.Println("------>>> send game state")
		}
	}
}

func sendToOpponent(playerName string, gameState interface{}) {
	fmt.Println("------>>> current connection size:", len(playerConnections))
	for name, playerConn := range playerConnections {
		if name != playerName {
			gameStateMessage := map[string]interface{}{
				"type":      "updateState",
				"gameState": gameState,
			}
			playerConn.conn.WriteJSON(gameStateMessage)
		}
	}
}

func main() {

// 提供静态文件服务
    fs := http.FileServer(http.Dir("."))
    http.Handle("/", fs)

	http.HandleFunc("/game", gameHandler)

	fmt.Println("WebSocket 服务器启动，访问地址：http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("服务器启动失败:", err)
	}
}

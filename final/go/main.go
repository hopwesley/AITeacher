package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
)

var matchQueue []string
var queueMutex sync.Mutex

// 升级 HTTP 连接为 WebSocket 连接
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func gameHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket 升级失败", http.StatusInternalServerError)
		return
	}

	defer conn.Close()

	var player string

	for {
		_, msg, err := conn.ReadMessage()
		if err != nil {
			return
		}

		// 解析消息，假设格式为 {"type": "matchRequest", "player": "Player1"}
		var data struct {
			Type   string `json:"type"`
			Player string `json:"player"`
		}
		json.Unmarshal(msg, &data)

		if data.Type == "matchRequest" {
			player = data.Player
			queueMutex.Lock()
			matchQueue = append(matchQueue, player)
			queueMutex.Unlock()

			// 检查队列中是否有两个玩家
			queueMutex.Lock()
			if len(matchQueue) >= 2 {
				opponent := matchQueue[0]
				if opponent == player {
					opponent = matchQueue[1]
				}
				matchQueue = matchQueue[2:]
				queueMutex.Unlock()

				conn.WriteJSON(map[string]string{
					"type":     "matchSuccess",
					"opponent": opponent,
				})
				return
			}
			queueMutex.Unlock()
		}
	}
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
}

func main() {

	 http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("./static"))))

         // 设置根路由，提供index.html
         http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
             http.ServeFile(w, r, "./static/signUp.html")
         })

 http.HandleFunc("/index", func(w http.ResponseWriter, r *http.Request) {
             http.ServeFile(w, r, "./static/index.html")
         })

      http.HandleFunc("/online", func(w http.ResponseWriter, r *http.Request) {
                  http.ServeFile(w, r, "./static/index_online.html")
              })

	http.HandleFunc("/game", gameHandler)
	http.HandleFunc("/chat", chatHandler)


	fmt.Println("服务器启动，访问地址：http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("服务器启动失败:", err)
	}

}

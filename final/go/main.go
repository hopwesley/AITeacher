package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
)

var matchQueue []string
var queueMutex sync.Mutex

// 升级 HTTP 连接为 WebSocket 连接
var upGrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func gameHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upGrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket 升级失败", http.StatusInternalServerError)
		return
	}

	defer conn.Close()
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
}

func main() {

	http.Handle("/", http.FileServer(http.Dir("./static")))

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

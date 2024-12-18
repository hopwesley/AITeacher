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

	fmt.Println("------>>> game socket created:")
	defer conn.Close()
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upGrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket 升级失败", http.StatusInternalServerError)
		return
	}
	fmt.Println("------>>> chat socket created:")
	defer conn.Close()
}

func signInUpHandler(w http.ResponseWriter, r *http.Request) {

	var player PlayerInfo
	err := json.NewDecoder(r.Body).Decode(&player)
	if err != nil {
		http.Error(w, "Invalid player info", http.StatusBadRequest)
		return
	}

	newPlayerInfo, err := SignInOrUp(player.UUID, player.PlayerName)
	if err != nil {
		http.Error(w, "database error", http.StatusBadRequest)
		return
	}

	bts, _ := json.Marshal(newPlayerInfo)
	w.WriteHeader(http.StatusCreated)
	_, _ = w.Write(bts)
}

func main() {
	initDB()
	defer closeDB()

	http.Handle("/", http.FileServer(http.Dir("./static")))
	http.Handle("/sounds/", http.StripPrefix("/sounds/", http.FileServer(http.Dir("./sounds"))))
	http.HandleFunc("/index", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/index.html")
	})

	http.HandleFunc("/online", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./static/index_online.html")
	})

	http.HandleFunc("/game", gameHandler)
	http.HandleFunc("/chat", chatHandler)
	http.HandleFunc("/signInUp", signInUpHandler)

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("服务器启动失败:", err)
	}
}

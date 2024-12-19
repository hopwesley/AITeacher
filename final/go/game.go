package main

import (
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
)

type GameRoom struct {
	players map[string]*websocket.Conn
	ownerID string
}

var gLock sync.RWMutex
var gameRoom = make(map[string]*GameRoom)

func gameHandler(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	gj := &GameJoin{
		PlayerID: queryParams.Get("playerID"),
		GameID:   queryParams.Get("gameID"),
	}
	if len(gj.PlayerID) == 0 || len(gj.GameID) == 0 {
		http.Error(w, "Invalid Game Parameter", http.StatusBadRequest)
		return
	}

}

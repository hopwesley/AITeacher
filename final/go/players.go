package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

var pLock sync.RWMutex
var playerCache = make(map[string]*PlayerInfo)

func currentPlayer(w http.ResponseWriter, r *http.Request) {
	pLock.RLock()
	pLock.RUnlock()
	fmt.Println("current player no:", len(playerCache))
	bts, _ := json.Marshal(playerCache)
	_, _ = w.Write(bts)
}

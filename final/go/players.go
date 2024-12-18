package main

import (
	"encoding/json"
	"net/http"
	"sync"
)

var pLock sync.RWMutex
var playerCache = make(map[string]*PlayerInfo)

func currentPlayer(w http.ResponseWriter, r *http.Request) {
	pLock.RLock()
	pLock.RUnlock()

	bts, _ := json.Marshal(playerCache)
	_, _ = w.Write(bts)
}

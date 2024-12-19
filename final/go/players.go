package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
)

var pLock sync.RWMutex
var playerCache = make(map[string]*PlayerInfo)

func newPlayer(w http.ResponseWriter, r *http.Request) *PlayerInfo {
	queryParams := r.URL.Query()

	cTimeStr := queryParams.Get("cTime")
	cTime, err := strconv.ParseInt(cTimeStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid player create time", http.StatusInternalServerError)
		return nil
	}

	scoreStr := queryParams.Get("score")
	score, err := strconv.Atoi(scoreStr)
	if err != nil {
		http.Error(w, "Invalid player score", http.StatusInternalServerError)
		return nil
	}

	player := &PlayerInfo{
		UUID:       queryParams.Get("uuid"),
		PlayerName: queryParams.Get("name"),
		CTime:      cTime,
		HighScore:  score,
		Status:     PlayerStatusIdle,
	}

	fmt.Printf("------>>>Player connected: %+v\n", player)

	cachePlayerInfo(player)

	return player
}

func cachePlayerInfo(player *PlayerInfo) {
	pLock.Lock()
	playerCache[player.UUID] = player
	pLock.Unlock()
}

func removePlayerInfo(cid string) {
	pLock.Lock()
	defer pLock.Unlock()

	player := playerCache[cid]
	if player == nil {
		return
	}
	go notifyOnOffLine(player, MsgTypUserOffline)
	delete(playerCache, cid)
}

func currentPlayer(w http.ResponseWriter, r *http.Request) {
	pLock.RLock()
	pLock.RUnlock()
	fmt.Println("current player no:", len(playerCache))
	bts, _ := json.Marshal(playerCache)
	_, _ = w.Write(bts)
}

func getPlayer(uuid string) *PlayerInfo {
	pLock.RLock()
	defer pLock.RUnlock()
	return playerCache[uuid]
}

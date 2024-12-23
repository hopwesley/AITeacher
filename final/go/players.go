package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"
)

var playerLock sync.RWMutex
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
	playerLock.Lock()
	playerCache[player.UUID] = player
	playerLock.Unlock()
}

func changePlayerStatus(uuid string, status int) {
	log.Println("------>>> broad cast user status:", uuid, status)

	s := MsgTypeUserIdle
	if status == PlayerStatusIdle {
		s = MsgTypeUserIdle
	} else {
		s = MsgTypeInviteGame
	}

	statusMsg := &ChatMsg{
		MID:  time.Now().Unix(),
		From: "-1",
		To:   uuid,
		Msg:  "",
		Typ:  s,
	}

	writeToId(uuid, statusMsg)

	playerLock.Lock()
	defer playerLock.Unlock()
	player, ok := playerCache[uuid]
	if !ok {
		return
	}

	player.Status = status
}

func removePlayerInfo(cid string) {
	playerLock.Lock()
	defer playerLock.Unlock()

	player := playerCache[cid]
	if player == nil {
		return
	}
	go notifyOnOffLine(player, MsgTypUserOffline)
	delete(playerCache, cid)
}

func currentPlayer(w http.ResponseWriter, r *http.Request) {
	playerLock.RLock()
	playerLock.RUnlock()
	fmt.Println("----->>>current player no:", len(playerCache))
	bts, _ := json.Marshal(playerCache)
	_, _ = w.Write(bts)
}

func updateHighestScore(uuid string, score int) error {
	playerLock.Lock()
	defer playerLock.Unlock()
	player, ok := playerCache[uuid]
	if ok && player.HighScore > score {
		return nil
	}
	return updateHighestScoreDb(uuid, score)
}

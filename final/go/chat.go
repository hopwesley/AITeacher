package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"strconv"
	"sync"
	"time"
)

type ChatConn struct {
	*websocket.Conn
	cid string
}

var cLock sync.RWMutex
var connCache = make(map[string]*ChatConn)

var mLock sync.RWMutex
var msgCache = make(map[int64]*ChatMsg)

func newPlayer(w http.ResponseWriter, r *http.Request) (*PlayerInfo, *ChatConn) {
	queryParams := r.URL.Query()

	cTimeStr := queryParams.Get("cTime")
	cTime, err := strconv.ParseInt(cTimeStr, 10, 64)
	if err != nil {
		http.Error(w, "Invalid player create time", http.StatusInternalServerError)
		return nil, nil
	}

	scoreStr := queryParams.Get("score")
	score, err := strconv.Atoi(scoreStr)
	if err != nil {
		http.Error(w, "Invalid player score", http.StatusInternalServerError)
		return nil, nil
	}

	player := &PlayerInfo{
		UUID:       queryParams.Get("uuid"),
		PlayerName: queryParams.Get("name"),
		CTime:      cTime,
		HighScore:  score,
		Status:     PlayerStatusIdle,
	}
	fmt.Printf("------>>>Player connected: %+v\n", player)

	conn, err := upGrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket 升级失败", http.StatusInternalServerError)
		return nil, nil
	}

	chatConn := &ChatConn{
		Conn: conn,
		cid:  player.UUID,
	}
	cLock.Lock()
	connCache[player.UUID] = chatConn
	cLock.Unlock()

	pLock.Lock()
	playerCache[player.UUID] = player
	pLock.Unlock()

	return player, chatConn
}

func closeChatConn(conn *ChatConn) {
	pLock.Lock()
	player := playerCache[conn.cid]
	go notifyOnOffLine(player, MsgTypUserOffline)
	delete(playerCache, conn.cid)
	pLock.Unlock()

	fmt.Println("------>>> close connection:", conn.cid)
	cLock.Lock()
	conn.Close()
	delete(connCache, conn.cid)
	cLock.Unlock()
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	player, conn := newPlayer(w, r)
	if conn == nil {
		return
	}

	defer closeChatConn(conn)

	go notifyOnOffLine(player, MsgTypUserOnline)

	reading(conn)
}

func reading(conn *ChatConn) {
	for {
		var msg ChatMsg
		err := conn.ReadJSON(&msg)
		if err != nil {
			return
		}

		fmt.Println("------>>> read message:", msg.From)
		receiverID := msg.To

		pLock.RLock()
		peerConn, ok := connCache[receiverID]
		if !ok {
			mLock.Lock()
			msgCache[msg.MID] = &msg
			mLock.Unlock()

			pLock.RUnlock()
			continue
		}
		pLock.RUnlock()

		write(peerConn, &msg)
	}
}

func write(conn *ChatConn, msg *ChatMsg) {
	err := conn.WriteJSON(msg)
	if err != nil {
		closeChatConn(conn)
		return
	}
	fmt.Println("------>>> write message:", msg.To)
}

func notifyOnOffLine(player *PlayerInfo, typ int) {
	if player == nil {
		return
	}

	cLock.Lock()
	defer cLock.Unlock()

	bts, _ := json.Marshal(player)
	msg := &ChatMsg{
		MID:  time.Now().Unix(),
		From: "-1",
		To:   "0",
		Msg:  string(bts),
		Typ:  typ,
	}

	for _, conn := range connCache {
		if conn.cid == player.UUID {
			continue
		}
		write(conn, msg)
	}
}

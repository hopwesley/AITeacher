package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"strconv"
	"sync"
)

type ChatConn struct {
	*websocket.Conn
	cid string
}

var cLock sync.RWMutex
var pLock sync.RWMutex
var connCache = make(map[string]*ChatConn)
var playerCache = make(map[string]*PlayerInfo)

var mLock sync.RWMutex
var msgCache = make(map[int64]*ChatMsg)

func newPlayer(w http.ResponseWriter, r *http.Request) *ChatConn {
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
	}
	fmt.Printf("------>>>Player connected: %+v\n", player)

	conn, err := upGrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket 升级失败", http.StatusInternalServerError)
		return nil
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

	return chatConn
}

func closeChatConn(conn *ChatConn) {
	fmt.Println("------>>> close connection:", conn.cid)
	cLock.Lock()
	delete(connCache, conn.cid)
	cLock.Unlock()

	pLock.Lock()
	conn.Close()
	delete(playerCache, conn.cid)
	pLock.Unlock()
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	conn := newPlayer(w, r)
	if conn == nil {
		return
	}

	defer closeChatConn(conn)

	reading(conn)
}

func reading(conn *ChatConn) {
	for {
		var msg ChatMsg
		err := conn.ReadJSON(&msg)
		if err != nil {
			closeChatConn(conn)
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

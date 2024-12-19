package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
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

func chatConn(w http.ResponseWriter, r *http.Request, uuid string) *ChatConn {

	cLock.RLock()
	oldConn := connCache[uuid]
	if oldConn != nil {
		oldConn.Close()
		fmt.Printf("------>>>Old Player disconnected: %+v\n", oldConn.cid)
	}
	cLock.RUnlock()

	conn, err := upGrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket 升级失败", http.StatusInternalServerError)
		return nil
	}

	chatConn := &ChatConn{
		Conn: conn,
		cid:  uuid,
	}
	cLock.Lock()
	connCache[uuid] = chatConn
	cLock.Unlock()

	return chatConn
}

func closeChatConn(conn *ChatConn) {
	removePlayerInfo(conn.cid)
	cLock.Lock()
	defer cLock.Unlock()
	conn.Close()
	delete(connCache, conn.cid)
	fmt.Println("------>>> close connection:", conn.cid)
}

func chatHandler(w http.ResponseWriter, r *http.Request) {
	player := newPlayer(w, r)
	if player == nil {
		return
	}

	conn := chatConn(w, r, player.UUID)
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
			fmt.Println("------>>>reading error:", err)
			return
		}
		fmt.Println("------>>> read message:", msg)

		if msg.Typ == MsgTypePing {
			msg.Typ = MsgTypePong
			write(conn, &msg)
			continue
		}

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
	fmt.Println("------>>> write message:", msg)
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

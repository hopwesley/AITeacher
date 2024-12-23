package main

import (
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"sync"
	"time"
)

type ChatConn struct {
	*websocket.Conn
	cid string
}

var connLock sync.RWMutex
var chatConnCache = make(map[string]*ChatConn)

var msgLock sync.RWMutex
var msgCache = make(map[int64]*ChatMsg)

func chatConn(w http.ResponseWriter, r *http.Request, uuid string) *ChatConn {

	connLock.RLock()
	oldConn := chatConnCache[uuid]
	if oldConn != nil {
		oldConn.Close()
		fmt.Printf("------>>>Old Player disconnected: %+v\n", oldConn.cid)
	}
	connLock.RUnlock()

	conn, err := upGrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket 升级失败", http.StatusInternalServerError)
		return nil
	}

	chatConn := &ChatConn{
		Conn: conn,
		cid:  uuid,
	}
	connLock.Lock()
	chatConnCache[uuid] = chatConn
	connLock.Unlock()

	return chatConn
}

func closeChatConn(conn *ChatConn) {
	removePlayerInfo(conn.cid)
	connLock.Lock()
	defer connLock.Unlock()
	conn.Close()
	delete(chatConnCache, conn.cid)
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
		//fmt.Println("------>>> read message:", msg)
		if msg.Typ == MsgTypePing {
			msg.Typ = MsgTypePong
			connLock.Lock()
			write(conn, &msg)
			connLock.Unlock()
			continue
		}
		receiverID := msg.To

		if msg.Typ == MsgTypeInviteGame {
			player := getPlayerInfo(receiverID)
			log.Println("------>>> this is a invite message:", player)
			if player.Status == PlayerStatusInGame {
				declineMsg := &ChatMsg{
					MID:  time.Now().Unix(),
					From: "-1",
					To:   msg.From,
					Msg:  "对方在游戏中",
					Typ:  MsgTypeRejectGame,
				}
				connLock.Lock()
				write(conn, declineMsg)
				connLock.Unlock()
				continue
			}
		}

		connLock.RLock()
		peerConn, ok := chatConnCache[receiverID]
		if !ok {
			msgLock.Lock()
			msgCache[msg.MID] = &msg
			msgLock.Unlock()

			connLock.RUnlock()
			continue
		}
		connLock.RUnlock()

		connLock.Lock()
		write(peerConn, &msg)
		connLock.Unlock()

	}
}

func broadcastUserStatus(msg *ChatMsg) {
	connLock.Lock()
	defer connLock.Unlock()
	for _, conn := range chatConnCache {
		_ = conn.WriteJSON(msg)
	}
}

func write(conn *ChatConn, msg *ChatMsg) {
	err := conn.WriteJSON(msg)
	if err != nil {
		fmt.Println("------>>> write chat message error:", err)
		closeChatConn(conn)
		return
	}
	//fmt.Println("------>>> write message:", msg)
}

func notifyOnOffLine(player *PlayerInfo, typ int) {
	if player == nil {
		return
	}

	connLock.Lock()
	defer connLock.Unlock()

	bts, _ := json.Marshal(player)
	msg := &ChatMsg{
		MID:  time.Now().Unix(),
		From: "-1",
		To:   "0",
		Msg:  string(bts),
		Typ:  typ,
	}

	for _, conn := range chatConnCache {
		if conn.cid == player.UUID {
			continue
		}
		write(conn, msg)
	}
}

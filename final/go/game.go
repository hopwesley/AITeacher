package main

import (
	"fmt"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
)

type GameRoom struct {
	players map[string]*websocket.Conn
	roomID  string
	msgChan chan *GameMsg
}

var gLock sync.RWMutex
var gameRoom = make(map[string]*GameRoom)

var uLock sync.RWMutex
var userToRoom = make(map[string]string)

func checkDuplicateGameJoin(gj *GameJoin) {
	uLock.Lock()
	defer uLock.Unlock()
	gameID := userToRoom[gj.PlayerID]
	if len(gameID) == 0 {
		return
	}

	gLock.Lock()
	defer gLock.Unlock()
	room := gameRoom[gameID]
	conn := room.players[gj.PlayerID]
	if conn == nil {
		return
	}
	conn.Close()
	delete(room.players, gj.PlayerID)
	delete(userToRoom, gj.PlayerID)
}

func enterGame(conn *websocket.Conn, gj *GameJoin) *GameRoom {
	gLock.Lock()
	defer gLock.Unlock()

	room := gameRoom[gj.GameID]
	if room == nil {
		room = &GameRoom{
			players: make(map[string]*websocket.Conn),
			roomID:  gj.GameID,
			msgChan: make(chan *GameMsg, 1000),
		}
		gameRoom[gj.GameID] = room
	}

	room.players[gj.PlayerID] = conn

	uLock.Lock()
	userToRoom[gj.PlayerID] = gj.GameID
	uLock.Unlock()

	return room
}

func readGameParam(w http.ResponseWriter, r *http.Request) *GameJoin {
	queryParams := r.URL.Query()
	gj := &GameJoin{
		PlayerID: queryParams.Get("playerID"),
		GameID:   queryParams.Get("gameID"),
	}
	if len(gj.PlayerID) == 0 || len(gj.GameID) == 0 {
		http.Error(w, "Invalid Game Parameter", http.StatusBadRequest)
		return nil
	}
	return gj
}

func gameHandler(w http.ResponseWriter, r *http.Request) {
	gj := readGameParam(w, r)
	if gj == nil {
		return
	}
	checkDuplicateGameJoin(gj)

	conn, err := upGrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, "WebSocket 升级失败", http.StatusInternalServerError)
		return
	}

	room := enterGame(conn, gj)
	if room == nil {
		return
	}

	checkStartGame(room)

	readGameData(conn, room)
}

func checkStartGame(room *GameRoom) {
	if len(room.players) <= 1 {
		return
	}

	go asyncBroadCaster(room)
	room.msgChan <- &GameMsg{
		Typ:  GameStart,
		Data: "",
		From: "-1",
		Seq:  -1,
	}
}

func readGameData(conn *websocket.Conn, room *GameRoom) {
	defer dismissGame(room.roomID)
	for {
		var msg GameMsg
		err := conn.ReadJSON(&msg)
		//fmt.Println("----->>> game message :", msg)
		if msg.Typ == MsgTypePing {
			msg.Typ = MsgTypePong
			err := conn.WriteJSON(msg)
			if err != nil {
				fmt.Println("------>>> game message error:", err)
				return
			}
			continue
		}

		if err != nil {
			fmt.Println("------>>>reading game error:", err)
			return
		}
		room.msgChan <- &msg
	}
}

func sendMsg(room *GameRoom, msg *GameMsg) {
	if len(room.players) <= 1 {
		go dismissGame(room.roomID)
		return
	}

	for pid, conn := range room.players {
		if pid == msg.From {
			continue
		}
		err := conn.WriteJSON(msg)
		if err != nil {
			fmt.Println("------>>> game message error:", err)
			go dismissGame(room.roomID)
			return
		}
	}
}

func asyncBroadCaster(room *GameRoom) {
	for {
		select {
		case msg, ok := <-room.msgChan:
			if !ok {
				fmt.Println("Message channel closed, exiting game.")
				return
			}
			sendMsg(room, msg)
		}
	}
}

func dismissGame(gameID string) {
	gLock.Lock()
	defer gLock.Unlock()

	room := gameRoom[gameID]
	if room == nil {
		return
	}

	for pid, conn := range room.players {
		uLock.Lock()
		delete(userToRoom, pid)
		uLock.Unlock()
		conn.Close()
	}
	delete(gameRoom, gameID)
	close(room.msgChan)
}

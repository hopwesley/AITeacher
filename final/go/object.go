package main

const (
	PlayerStatusIdle = iota
	PlayerStatusInGame
)
const (
	MsgTypChat = iota
	MsgTypUserOnline
	MsgTypUserOffline
	MsgTypeUserGameStatus
)

type PlayerInfo struct {
	PlayerName string `json:"name"`
	UUID       string `json:"uuid"`
	CTime      int64  `json:"cTime"`
	HighScore  int    `json:"score"`
	Status     int    `json:"status"`
}

type ChatMsg struct {
	MID  int64  `json:"mid"`
	From string `json:"from"`
	To   string `json:"to"`
	Msg  string `json:"msg"`
	Typ  int    `json:"typ"`
}

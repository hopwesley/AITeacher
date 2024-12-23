package main

const (
	MsgTypChat = iota
	MsgTypUserOnline
	MsgTypUserOffline
	MsgTypeUserInGame
	MsgTypeUserIdle
	MsgTypeInviteGame
	MsgTypeAcceptGame
	MsgTypeRejectGame
	MsgTypePing = 100
	MsgTypePong = 101
)

const (
	PlayerStatusIdle = iota
	PlayerStatusInGame
)

const (
	GameStart = iota
	MainTetromino
	SubTetromino
	NewScore
	NewLevel
	MergeBoard
	GameOver
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

type GameJoin struct {
	PlayerID string `json:"playerID"`
	GameID   string `json:"gameID"`
}
type GameMsg struct {
	Typ  int    `json:"typ"`
	Seq  int64  `json:"seq"`
	Data string `json:"data"`
	From string `json:"from"`
}

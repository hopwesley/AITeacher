package main

type PlayerInfo struct {
	PlayerName string `json:"name"`
	UUID       string `json:"uuid"`
	CTime      int64  `json:"cTime"`
	HighScore  int    `json:"score"`
}

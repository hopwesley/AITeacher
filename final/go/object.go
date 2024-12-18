package main

type PlayerInfo struct {
	PlayerName string `json:"name"`
	UUID       string `json:"uuid"`
	CTime      int64  `json:"cTime"`
	HighScore  int    `json:"score"`
}

type ChatMsg struct {
	MID   int64  `json:"mid"`
	From  string `json:"from"`
	To    string `json:"to"`
	Msg   string `json:"msg"`
	CTime int64  `json:"c_time"`
}

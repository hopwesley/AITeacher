package main

import (
	"encoding/json"
	"errors"
	"github.com/syndtr/goleveldb/leveldb"
	"time"
)

var _dbInst *leveldb.DB

func initDB() {
	var err error
	_dbInst, err = leveldb.OpenFile("userdb", nil)
	if err != nil {
		panic(err)
	}
}
func closeDB() {
	_ = _dbInst.Close()
}
func playerDBKey(uuid string) []byte {
	return []byte("player:" + uuid)
}

func SignInOrUp(uuid, pName string) (*PlayerInfo, error) {
	key := playerDBKey(uuid)
	data, err := _dbInst.Get(key, nil)

	if err != nil {
		if !errors.Is(err, leveldb.ErrNotFound) {
			return nil, err
		}
		var player = &PlayerInfo{
			PlayerName: pName,
			UUID:       uuid,
			CTime:      time.Now().Unix(),
			HighScore:  0,
		}

		bts, err := json.Marshal(player)
		if err != nil {
			return nil, err
		}

		err = _dbInst.Put(key, bts, nil)
		if err != nil {
			return nil, err
		}
		return player, nil
	}

	var player PlayerInfo
	err = json.Unmarshal(data, &player)
	if err != nil {
		return nil, err
	}

	return &player, nil
}

func updateHighestScoreDb(uuid string, score int) error {

	key := playerDBKey(uuid)
	data, err := _dbInst.Get(key, nil)
	if err != nil {
		return err
	}
	var player PlayerInfo
	err = json.Unmarshal(data, &player)
	if err != nil {
		return err
	}

	if player.HighScore > score {
		return nil
	}

	player.HighScore = score
	bts, err := json.Marshal(player)
	if err != nil {
		return err
	}
	err = _dbInst.Put(key, bts, nil)

	return err
}

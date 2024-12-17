package main

import (
	"encoding/json"
	"fmt"
	"github.com/syndtr/goleveldb/leveldb"
	"log"
	"net/http"
)

type User struct {
	Username string `json:"username"`
	Password string `json:"password"` // 在实际应用中应加密存储
}

var db *leveldb.DB

func init() {
	var err error
	db, err = leveldb.OpenFile("userdb", nil)
	if err != nil {
		log.Fatal("无法打开 LevelDB 数据库:", err)
	}
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	var loginUser User
	err := json.NewDecoder(r.Body).Decode(&loginUser)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	storedPassword, err := db.Get([]byte(loginUser.Username), nil)
	if err != nil {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	if string(storedPassword) != loginUser.Password {
		http.Error(w, "Invalid username or password", http.StatusUnauthorized)
		return
	}

	fmt.Fprintf(w, "Welcome back, %s!", loginUser.Username)
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	var newUser User
	err := json.NewDecoder(r.Body).Decode(&newUser)
	if err != nil {
		http.Error(w, "Invalid input", http.StatusBadRequest)
		return
	}

	// 检查用户名是否已存在
	exists, err := db.Has([]byte(newUser.Username), nil)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	if exists {
		http.Error(w, "Username already exists", http.StatusConflict)
		return
	}

	// 存储用户数据
	err = db.Put([]byte(newUser.Username), []byte(newUser.Password), nil)
	if err != nil {
		http.Error(w, "Failed to save user", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
	fmt.Fprintf(w, "User %s registered successfully!", newUser.Username)
}

func main() {
	defer db.Close() // 关闭数据库

  // 提供静态文件服务
    fs := http.FileServer(http.Dir("."))
    http.Handle("/", fs)

	http.HandleFunc("/register", registerHandler)
	http.HandleFunc("/login", loginHandler)

	fmt.Println("服务器启动，访问地址：http://localhost:8080")
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println("服务器启动失败:", err)
	}
}

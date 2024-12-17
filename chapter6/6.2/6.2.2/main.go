package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

// 分数结构体
type Score struct {
    Player string `json:"player"`
    Points int    `json:"points"`
}

// 存储分数的切片
var scores []Score

// 获取分数的处理函数 (GET 请求)
func getScoresHandler(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(scores)
}

// 提交分数的处理函数 (POST 请求)
func postScoreHandler(w http.ResponseWriter, r *http.Request) {
    var newScore Score
    err := json.NewDecoder(r.Body).Decode(&newScore)
    if err != nil {
        http.Error(w, "Invalid input", http.StatusBadRequest)
        return
    }

    scores = append(scores, newScore)
    w.WriteHeader(http.StatusCreated)
    fmt.Fprintf(w, "Score added successfully!")
}

func main() {
    http.HandleFunc("/score", func(w http.ResponseWriter, r *http.Request) {
        switch r.Method {
        case http.MethodGet:
            getScoresHandler(w, r)
        case http.MethodPost:
            postScoreHandler(w, r)
        default:
            http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        }
    })

    fmt.Println("服务器启动，访问地址：http://localhost:8080")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("服务器启动失败:", err)
    }
}

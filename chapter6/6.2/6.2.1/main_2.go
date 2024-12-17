package main

import (
    "fmt"
    "net/http"
)

// 主页处理函数
func homeHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "欢迎来到俄罗斯方块后端服务！")
}

// 分数处理函数
func scoreHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "这里是分数接口！")
}

func main() {
    http.HandleFunc("/", homeHandler)
    http.HandleFunc("/score", scoreHandler)

    fmt.Println("服务器启动，访问地址：http://localhost:8080")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("服务器启动失败:", err)
    }
}

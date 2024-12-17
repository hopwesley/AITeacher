package main

import (
    "fmt"
    "net/http"
)

// 处理根路径的请求
func homeHandler(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintln(w, "欢迎来到俄罗斯方块后端服务！")
}

func main() {
    // 注册处理函数
    http.HandleFunc("/", homeHandler)

    // 启动 HTTP 服务器，监听 8080 端口
    fmt.Println("服务器启动，访问地址：http://localhost:8080")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("服务器启动失败:", err)
    }
}

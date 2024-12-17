package main

import (
    "fmt"
    "net/http"
    "github.com/gorilla/websocket"
)

// 升级 HTTP 连接为 WebSocket 连接
var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

// 存储所有连接的客户端
var clients = make(map[*websocket.Conn]bool)

// 处理 WebSocket 连接
func handleConnections(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        fmt.Println("WebSocket 连接错误:", err)
        return
    }
    defer conn.Close()

    clients[conn] = true
    fmt.Println("新客户端已连接")

    for {
        var msg string
        err := conn.ReadJSON(&msg)
        if err != nil {
            fmt.Println("读取消息错误:", err)
            delete(clients, conn)
            break
        }

        fmt.Println("收到消息:", msg)

        // 广播消息给所有客户端
        for client := range clients {
            err := client.WriteJSON(msg)
            if err != nil {
                fmt.Println("发送消息错误:", err)
                client.Close()
                delete(clients, client)
            }
        }
    }
}

func main() {
    http.HandleFunc("/ws", handleConnections)

    fmt.Println("WebSocket 服务器启动，访问地址：http://localhost:8080")
    err := http.ListenAndServe(":8080", nil)
    if err != nil {
        fmt.Println("服务器启动失败:", err)
    }
}

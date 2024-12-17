package main

import "fmt"

func main() {
    ch := make(chan int)

    // 启动一个 goroutine 发送数据
    go func() {
        ch <- 10  // 发送数据到 channel
    }()

    // 在主 goroutine 中接收数据
    value := <-ch
    fmt.Println("Received:", value)
}

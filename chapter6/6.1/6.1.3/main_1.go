package main

import (
    "fmt"
    "time"
)

func printNumbers() {
    for i := 1; i <= 5; i++ {
        fmt.Println(i)
        time.Sleep(time.Millisecond * 500) // 模拟耗时操作
    }
}

func main() {
    go printNumbers()  // 启动一个 goroutine
    fmt.Println("Main function is running")

    time.Sleep(time.Second * 3) // 等待 goroutine 执行完成
    fmt.Println("Main function finished")
}

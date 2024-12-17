package main

import (
    "fmt"
    "sync"
    "time"
)

func worker(id int, wg *sync.WaitGroup) {
    defer wg.Done() // 完成时通知 WaitGroup
    fmt.Printf("Worker %d starting\n", id)
    time.Sleep(time.Second) // 模拟耗时操作
    fmt.Printf("Worker %d done\n", id)
}

func main() {
    var wg sync.WaitGroup

    for i := 1; i <= 3; i++ {
        wg.Add(1) // 增加等待的 goroutine 计数
        go worker(i, &wg)
    }

    wg.Wait() // 等待所有 goroutine 完成
    fmt.Println("All workers finished")
}

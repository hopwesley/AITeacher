// const server_host = 'http://192.168.18.51';///api/uploadScore
const server_host = 'http://192.168.18.51';///api/uploadScore

/*
    const playerName = localStorage.getItem('playerName') || 'Guest';
*  const data = {
        name: playerName,
        score: score,
        level: level,
        linesCleared: linesCleared,
        date: new Date().toISOString()
    };
* */

// 异步 httpService 函数
async function httpService(apiPath, data) {
    console.log('------>>>httpService:', apiPath, JSON.stringify(data));
    try {
        const response = await fetch(server_host + apiPath, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        const result = await response.json();
        console.log('------>>> Response received:', result);
        return result;
    } catch (error) {
        console.error('------>>> Error during HTTP request:', error);
        throw error;
    }
}

const socket = new WebSocket('wss://192.168.18.51/game');

socket.onopen = () => {
    console.log('WebSocket 连接已打开');
};

socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('接收到的数据:', data);
};

socket.onclose = () => {
    console.log('WebSocket 连接已关闭');
};

// 发送数据到服务器
function sendPlayerData(playerData) {
    socket.send(JSON.stringify(playerData));
}

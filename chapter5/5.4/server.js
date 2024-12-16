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

function httpService(apiPath, data) {
    fetch(server_host + apiPath, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(result => {
            console.log('------>>> Score uploaded successfully:', result);
            alert('分数上传成功！');
        })
        .catch(error => {
            console.error('------>>> Error uploading score:', error);
        });
}

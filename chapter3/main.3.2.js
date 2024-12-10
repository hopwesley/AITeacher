// 定义变量
let score = 0;
let playerName = "小明";

// 获取页面元素
const infoElement = document.getElementById('info');

// 显示初始信息
infoElement.innerText = "分数：" + score + "，玩家：" + playerName;

// 修改变量内容
score = 10;
playerName = "小红";

// 再次更新页面显示
infoElement.innerText = "分数：" + score + "，玩家：" + playerName;

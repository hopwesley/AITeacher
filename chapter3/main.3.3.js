// 假设玩家目前有的物品数量
let itemCount = 12;

// 根据数量决定显示什么信息
const messageElement = document.getElementById('message');

if (itemCount > 10) {
    messageElement.innerText = "恭喜！你的物品超过10个，真是个大收藏家！";
} else {
    messageElement.innerText = "目前物品不算多，继续加油收集吧！";
}

// 使用循环生成对应数量的li元素
const itemListElement = document.getElementById('itemList');

for (let i = 1; i <= itemCount; i++) {
    const li = document.createElement('li');
    li.innerText = "物品 " + i;
    itemListElement.appendChild(li);
}

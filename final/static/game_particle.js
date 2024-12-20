let particleColor = 'red';
let particles = []; // 存放粒子的数组

class Particle {
    constructor(x, y, color) {
        this.x = x;                      // 粒子初始x坐标
        this.y = y;                      // 粒子初始y坐标
        this.vx = (Math.random() - 0.5) * 2;  // 水平速度，随机方向
        this.vy = Math.random() * -2;    // 垂直速度，向上飞散
        this.color = color;              // 粒子颜色
        this.life = 50;                  // 粒子生命周期（帧数）
    }

    update() {
        this.x += this.vx;               // 更新x坐标
        this.y += this.vy;               // 更新y坐标
        this.vy += 0.05;                 // 模拟重力，让粒子下落
        this.life--;                     // 生命值减少
    }

    draw(context) {
        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, 0.1, 0.1); // 绘制粒子，粒子大小为0.1个方块单位
    }
}

// 异步生成粒子效果
function generateParticlesAsync(row) {
    let col = 0;

    function generateNextColumn() {
        if (col < COLS) {
            for (let i = 0; i < 20; i++) {
                particles.push(new Particle(col, row, particleColor));
            }
            col++;
            requestAnimationFrame(generateNextColumn); // 下一帧继续生成
        }
    }

    generateNextColumn(); // 开始生成
}

function updateParticles(context) {
    particles = particles.filter(particle => particle.life > 0); // 移除生命周期结束的粒子
    particles.forEach(particle => {
        particle.update();
        particle.draw(context);
    });
}

function triggerBorderFlash(context) {
    const canvas = context.canvas; // 获取主画布元素
    return new Promise((resolve) => {
        canvas.classList.add('canvas-flash');
        canvas.addEventListener('animationend', () => {
            canvas.classList.remove('canvas-flash');
            resolve(); // 通过 Promise 通知动画完成
        }, {once: true}); // 确保只触发一次
    });
}


class Sakura {
    constructor() {
        this.element = document.createElement('span');
        this.element.className = 'sakura';
        this.element.innerHTML = '🌸';
        this.reset();
        document.body.appendChild(this.element);
    }

    reset() {
        // 随机初始位置（在屏幕上方随机位置生成）
        this.x = Math.random() * window.innerWidth;
        this.y = -10;
        
        // 随机大小（10-24像素之间）
        this.size = Math.random() * 14 + 10;
        
        // 随机水平速度（左右飘动）
        this.speedX = Math.random() * 2 - 1;
        
        // 随机下落速度（0.5-2之间）
        this.speedY = Math.random() * 1.5 + 0.5;
        
        // 随机旋转角度和速度
        this.rotation = Math.random() * 360;
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        
        // 随机摆动参数
        this.swingSpeed = Math.random() * 0.2 + 0.1;
        this.swingRange = Math.random() * 15 + 5;
        
        // 随机透明度（0.4-0.8之间）
        this.opacity = Math.random() * 0.4 + 0.4;
        
        // 应用初始样式
        this.element.style.fontSize = `${this.size}px`;
        this.element.style.opacity = this.opacity;
    }

    animate() {
        // 更新位置
        this.y += this.speedY;
        // 添加左右摆动效果
        this.x += Math.sin(this.y * this.swingSpeed) * this.swingRange * 0.1 + this.speedX;
        this.rotation += this.rotationSpeed;

        // 应用新位置和旋转
        this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;

        // 如果樱花飘出屏幕，重置位置
        if (this.y > window.innerHeight || 
            this.x < -50 || 
            this.x > window.innerWidth + 50) {
            this.reset();
        }
    }
}

class SakuraManager {
    constructor(count = 10) {
        this.sakuras = Array.from({ length: count }, () => new Sakura());
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    animate() {
        this.sakuras.forEach(sakura => sakura.animate());
        requestAnimationFrame(this.animate);
    }
}

// 当页面加载完成后初始化樱花效果
document.addEventListener('DOMContentLoaded', () => {
    new SakuraManager(100); // 创建10朵樱花
});

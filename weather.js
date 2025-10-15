// 天气页面JavaScript
class WeatherApp {
    constructor() {
        this.apiUrl = 'http://localhost:5678/webhook/weather';
        this.loadingState = document.getElementById('loading-state');
        this.errorMessage = document.getElementById('error-message');
        this.refreshBtn = document.getElementById('refresh-btn');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWeatherData();
        this.setupThemeToggle();
    }

    setupEventListeners() {
        // 刷新按钮事件
        this.refreshBtn.addEventListener('click', () => {
            this.loadWeatherData();
        });

        // 键盘快捷键支持
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.loadWeatherData();
            }
        });
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // 更新按钮图标
        const lightIcon = document.querySelector('.light-icon');
        const darkIcon = document.querySelector('.dark-icon');
        const themeText = document.querySelector('.theme-text');
        
        if (newTheme === 'dark') {
            lightIcon.style.display = 'none';
            darkIcon.style.display = 'inline';
            themeText.textContent = '切换主题';
        } else {
            lightIcon.style.display = 'inline';
            darkIcon.style.display = 'none';
            themeText.textContent = '切换主题';
        }
    }

    async loadWeatherData() {
        try {
            this.showLoading();
            this.hideError();

            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // 处理n8n返回的数组格式
            const weatherData = Array.isArray(data) ? data[0] : data;
            
            if (weatherData) {
                this.updateWeatherDisplay(weatherData);
                this.updateLastUpdateTime();
            } else {
                throw new Error('无效的天气数据');
            }

        } catch (error) {
            console.error('获取天气数据失败:', error);
            this.showError('获取天气数据失败，请检查网络连接或稍后重试');
        } finally {
            this.hideLoading();
        }
    }

    updateWeatherDisplay(data) {
        // 更新主要信息
        document.getElementById('city-name').textContent = data.city || '--';
        document.getElementById('temperature').textContent = data.temperature || '--';
        document.getElementById('weather-text').textContent = data.weather || '--';

        // 更新详细信息
        document.getElementById('humidity').textContent = data.humidity ? `${data.humidity}%` : '--';
        document.getElementById('wind-dir').textContent = data.windDir || '--';
        
        // 更新天气图标
        this.updateWeatherIcon(data.weather);

        // 显示主要天气信息区域
        document.getElementById('weather-main').style.display = 'block';
        document.getElementById('weather-details').style.display = 'grid';
        document.getElementById('weather-update').style.display = 'flex';
    }

    updateWeatherIcon(weatherText) {
        const iconElement = document.getElementById('weather-icon');
        const weatherClass = this.getWeatherIconClass(weatherText);
        
        // 移除所有天气相关的类
        iconElement.className = 'fas';
        
        // 添加新的天气图标类
        iconElement.classList.add(weatherClass);
    }

    getWeatherIconClass(weatherText) {
        const weather = weatherText.toLowerCase();
        
        if (weather.includes('晴')) {
            return 'fa-sun';
        } else if (weather.includes('多云') || weather.includes('阴')) {
            return 'fa-cloud';
        } else if (weather.includes('雨')) {
            return 'fa-cloud-rain';
        } else if (weather.includes('雪')) {
            return 'fa-snowflake';
        } else if (weather.includes('雾') || weather.includes('霾')) {
            return 'fa-smog';
        } else if (weather.includes('风')) {
            return 'fa-wind';
        } else {
            return 'fa-cloud-sun';
        }
    }

    updateLastUpdateTime() {
        const now = new Date();
        const timeString = now.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        document.getElementById('update-time').textContent = timeString;
    }

    showLoading() {
        this.loadingState.style.display = 'block';
        this.refreshBtn.disabled = true;
        this.refreshBtn.querySelector('i').classList.add('fa-spin');
    }

    hideLoading() {
        this.loadingState.style.display = 'none';
        this.refreshBtn.disabled = false;
        this.refreshBtn.querySelector('i').classList.remove('fa-spin');
    }

    showError(message) {
        this.errorMessage.querySelector('#error-text').textContent = message;
        this.errorMessage.style.display = 'flex';
        
        // 3秒后自动隐藏错误消息
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    // 自动刷新功能（可选）
    startAutoRefresh(intervalMinutes = 10) {
        setInterval(() => {
            this.loadWeatherData();
        }, intervalMinutes * 60 * 1000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const weatherApp = new WeatherApp();
    
    // 可选：每10分钟自动刷新一次
    // weatherApp.startAutoRefresh(10);
    
    // 将实例暴露到全局，方便调试
    window.weatherApp = weatherApp;
});

// 处理页面可见性变化，当页面重新可见时刷新数据
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.weatherApp) {
        window.weatherApp.loadWeatherData();
    }
});

// 处理网络状态变化
window.addEventListener('online', () => {
    if (window.weatherApp) {
        window.weatherApp.loadWeatherData();
    }
});

// 错误处理
window.addEventListener('error', (event) => {
    console.error('页面错误:', event.error);
});

// 未处理的Promise拒绝
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
});

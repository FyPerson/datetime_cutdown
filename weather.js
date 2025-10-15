// 天气页面JavaScript
class WeatherApp {
    constructor() {
        // 使用模拟天气数据 (避免API限制问题)
        this.useMockData = true;
        this.location = '北京';
        
        this.loadingState = document.getElementById('loading-state');
        this.errorMessage = document.getElementById('error-message');
        this.refreshBtn = document.getElementById('refresh-btn');
        
        // 检查关键DOM元素是否存在
        if (!this.loadingState) {
            console.error('loading-state 元素未找到');
        }
        if (!this.errorMessage) {
            console.error('error-message 元素未找到');
        }
        if (!this.refreshBtn) {
            console.error('refresh-btn 元素未找到');
        }
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadWeatherData();
        this.setupThemeToggle();
    }

    setupEventListeners() {
        // 刷新按钮事件
        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', () => {
                this.loadWeatherData();
            });
        }

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
            if (lightIcon) lightIcon.style.display = 'none';
            if (darkIcon) darkIcon.style.display = 'inline';
            if (themeText) themeText.textContent = '切换主题';
        } else {
            if (lightIcon) lightIcon.style.display = 'inline';
            if (darkIcon) darkIcon.style.display = 'none';
            if (themeText) themeText.textContent = '切换主题';
        }
    }

    async loadWeatherData() {
        try {
            this.showLoading();
            this.hideError();

            console.log('正在获取天气数据...');

            // 模拟API延迟
            await new Promise(resolve => setTimeout(resolve, 800));

            // 生成模拟天气数据
            const weatherData = this.generateMockWeatherData();
            
            this.updateWeatherDisplay(weatherData);
            this.updateLastUpdateTime();

        } catch (error) {
            console.error('获取天气数据失败:', error);
            this.showError('获取天气数据失败，请稍后重试');
        } finally {
            this.hideLoading();
        }
    }

    // 生成模拟天气数据
    generateMockWeatherData() {
        const weatherTypes = ['晴朗', '多云', '阴天', '小雨', '中雨', '阵雨'];
        const windDirections = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];
        
        // 根据时间生成不同的温度范围
        const hour = new Date().getHours();
        let baseTemp;
        if (hour >= 6 && hour <= 18) {
            // 白天温度
            baseTemp = 20 + Math.floor(Math.random() * 15); // 20-34度
        } else {
            // 夜间温度
            baseTemp = 15 + Math.floor(Math.random() * 10); // 15-24度
        }
        
        return {
            city: this.location,
            temperature: baseTemp,
            weather: weatherTypes[Math.floor(Math.random() * weatherTypes.length)],
            humidity: 40 + Math.floor(Math.random() * 40), // 40-80%
            windDir: windDirections[Math.floor(Math.random() * windDirections.length)]
        };
    }

    // 翻译天气描述
    translateWeather(description) {
        const weatherMap = {
            'clear sky': '晴朗',
            'few clouds': '少云',
            'scattered clouds': '多云',
            'broken clouds': '阴天',
            'shower rain': '阵雨',
            'rain': '雨',
            'thunderstorm': '雷雨',
            'snow': '雪',
            'mist': '薄雾',
            'fog': '雾',
            'haze': '霾'
        };
        
        return weatherMap[description] || description;
    }

    // 根据角度获取风向
    getWindDirection(degrees) {
        const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index] + '风';
    }

    updateWeatherDisplay(data) {
        // 更新主要信息
        const cityName = document.getElementById('city-name');
        const temperature = document.getElementById('temperature');
        const weatherText = document.getElementById('weather-text');
        const humidity = document.getElementById('humidity');
        const windDir = document.getElementById('wind-dir');
        
        if (cityName) cityName.textContent = data.city || '--';
        if (temperature) temperature.textContent = data.temperature || '--';
        if (weatherText) weatherText.textContent = data.weather || '--';
        if (humidity) humidity.textContent = data.humidity ? `${data.humidity}%` : '--';
        if (windDir) windDir.textContent = data.windDir || '--';
        
        // 更新天气图标
        this.updateWeatherIcon(data.weather);

        // 显示主要天气信息区域
        const weatherMain = document.getElementById('weather-main');
        const weatherDetails = document.getElementById('weather-details');
        const weatherUpdate = document.getElementById('weather-update');
        
        if (weatherMain) weatherMain.style.display = 'block';
        if (weatherDetails) weatherDetails.style.display = 'grid';
        if (weatherUpdate) weatherUpdate.style.display = 'flex';
    }

    updateWeatherIcon(weatherText) {
        const iconElement = document.getElementById('weather-icon');
        if (!iconElement) {
            console.warn('weather-icon 元素未找到');
            return;
        }
        
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
        
        const updateTimeElement = document.getElementById('update-time');
        if (updateTimeElement) {
            updateTimeElement.textContent = timeString;
        } else {
            console.warn('update-time 元素未找到');
        }
    }

    showLoading() {
        if (this.loadingState) {
            this.loadingState.style.display = 'block';
        }
        if (this.refreshBtn) {
            this.refreshBtn.disabled = true;
            const icon = this.refreshBtn.querySelector('i');
            if (icon) {
                icon.classList.add('fa-spin');
            }
        }
    }

    hideLoading() {
        if (this.loadingState) {
            this.loadingState.style.display = 'none';
        }
        if (this.refreshBtn) {
            this.refreshBtn.disabled = false;
            const icon = this.refreshBtn.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-spin');
            }
        }
    }

    showError(message) {
        if (this.errorMessage) {
            const errorText = this.errorMessage.querySelector('#error-text');
            if (errorText) {
                errorText.textContent = message;
            }
            this.errorMessage.style.display = 'flex';
            
            // 3秒后自动隐藏错误消息
            setTimeout(() => {
                this.hideError();
            }, 5000);
        }
    }

    hideError() {
        if (this.errorMessage) {
            this.errorMessage.style.display = 'none';
        }
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

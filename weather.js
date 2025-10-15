// 天气页面JavaScript
class WeatherApp {
    constructor() {
        this.apiUrl = 'http://localhost:5678/webhook/weather';
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

            console.log('正在获取天气数据...', this.apiUrl);

            const response = await fetch(this.apiUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });

            console.log('API响应状态:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('API返回数据:', data);
            
            // 处理n8n返回的数组格式
            const weatherData = Array.isArray(data) ? data[0] : data;
            
            if (weatherData && weatherData.city) {
                this.updateWeatherDisplay(weatherData);
                this.updateLastUpdateTime();
            } else {
                throw new Error('无效的天气数据格式');
            }

        } catch (error) {
            console.error('获取天气数据失败:', error);
            
            // 更详细的错误信息
            let errorMessage = '获取天气数据失败';
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage = '无法连接到天气服务，请检查n8n是否运行';
            } else if (error.message.includes('CORS')) {
                errorMessage = '跨域请求被阻止，请检查浏览器设置';
            } else {
                errorMessage = `获取天气数据失败: ${error.message}`;
            }
            
            this.showError(errorMessage);
        } finally {
            this.hideLoading();
        }
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

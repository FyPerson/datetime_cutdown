// 天气页面JavaScript
class WeatherApp {
    constructor() {
        // 和风API配置
        this.apiKey = '24f3a52685d341f7a66d8616f1c4bbc7'; // 和风API密钥
        this.apiHost = 'nt5u9vqehg.re.qweatherapi.com';
        this.baseUrl = `https://${this.apiHost}/v7`;
        this.useMockData = false; // 设置为false使用真实API
        this.location = '北京';
        this.cityId = '101010100'; // 北京城市ID
        
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

            let weatherData;
            
            if (this.useMockData) {
                // 使用模拟数据
                await new Promise(resolve => setTimeout(resolve, 800));
                weatherData = this.generateMockWeatherData();
            } else {
                // 使用真实API
                weatherData = await this.fetchRealWeatherData();
            }
            
            this.updateWeatherDisplay(weatherData);
            this.updateLastUpdateTime();

        } catch (error) {
            console.error('获取天气数据失败:', error);
            this.showError('获取天气数据失败，请稍后重试');
            
            // 如果API失败，回退到模拟数据
            if (!this.useMockData) {
                console.log('API失败，使用模拟数据作为备选');
                const mockData = this.generateMockWeatherData();
                this.updateWeatherDisplay(mockData);
                this.updateLastUpdateTime();
            }
        } finally {
            this.hideLoading();
        }
    }

    // 获取真实天气数据
    async fetchRealWeatherData() {
        // 检查API密钥
        if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
            throw new Error('API密钥未配置，请在代码中设置您的和风API密钥');
        }

        console.log('🔍 开始获取真实天气数据...');
        console.log('API密钥:', this.apiKey);
        console.log('基础URL:', this.baseUrl);

        // 使用预设的城市ID
        console.log('📍 使用城市ID:', this.cityId);

        // 获取实时天气数据
        const headers = {
            'X-QW-Api-Key': this.apiKey,
            'Content-Type': 'application/json'
        };
        
        const weatherUrl = `${this.baseUrl}/weather/now?location=${this.cityId}`;
        console.log('天气请求URL:', weatherUrl);
        console.log('使用API KEY请求标头方式');
        
        let response;
        try {
            response = await fetch(weatherUrl, { headers });
            console.log('响应状态:', response.status);
            console.log('响应头:', Object.fromEntries(response.headers.entries()));
        } catch (error) {
            console.log('API KEY标头方式失败，尝试key参数方式...');
            // 回退到key参数方式
            const fallbackUrl = `${this.baseUrl}/weather/now?location=${this.cityId}&key=${this.apiKey}`;
            console.log('回退URL:', fallbackUrl);
            response = await fetch(fallbackUrl);
            console.log('回退响应状态:', response.status);
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('HTTP错误响应:', errorText);
            throw new Error(`HTTP错误: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API响应数据:', data);
        
        if (data.code !== '200') {
            console.error('API错误:', data);
            throw new Error(`API错误: ${data.code} - ${data.refer?.status || '未知错误'}`);
        }

        console.log('✅ 天气数据获取成功');
        // 转换API数据格式
        return this.convertApiDataToDisplayFormat(data);
    }

    // 获取城市ID
    async getCityId(cityName) {
        // 使用正确的GeoAPI路径
        const geoApiUrl = `https://${this.apiHost}/geo/v2/city/lookup`;
        
        // 尝试API KEY请求标头方式
        const headers = {
            'X-QW-Api-Key': this.apiKey,
            'Content-Type': 'application/json'
        };
        
        const cityUrl = `${geoApiUrl}?location=${encodeURIComponent(cityName)}`;
        console.log('城市查询URL:', cityUrl);
        console.log('使用GeoAPI v2和API KEY请求标头方式');
        
        let response;
        try {
            response = await fetch(cityUrl, { headers });
            console.log('城市查询响应状态:', response.status);
        } catch (error) {
            console.log('API KEY标头方式失败，尝试key参数方式...');
            // 回退到key参数方式
            const fallbackUrl = `${geoApiUrl}?location=${encodeURIComponent(cityName)}&key=${this.apiKey}`;
            console.log('回退URL:', fallbackUrl);
            response = await fetch(fallbackUrl);
            console.log('回退响应状态:', response.status);
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('城市查询HTTP错误响应:', errorText);
            throw new Error(`城市查询HTTP错误: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('城市查询响应数据:', data);
        
        if (data.code !== '200' || !data.location || data.location.length === 0) {
            console.error('城市查询API错误:', data);
            throw new Error(`城市查询失败: ${data.code} - ${data.refer?.status || '城市不存在'}`);
        }

        console.log('✅ 城市查询成功:', data.location[0]);
        return data.location[0].id;
    }

    // 转换API数据为显示格式
    convertApiDataToDisplayFormat(apiData) {
        const now = apiData.now;
        
        return {
            city: this.location,
            temperature: now.temp,
            weather: this.translateWeather(now.text),
            humidity: now.humidity,
            windDir: now.windDir,
            windSpeed: now.windSpeed,
            windScale: now.windScale,
            pressure: now.pressure,
            visibility: now.vis,
            feelsLike: now.feelsLike,
            icon: now.icon
        };
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
        
        // 更新额外信息（如果存在）
        this.updateAdditionalInfo(data);
        
        // 更新天气图标
        this.updateWeatherIcon(data.weather, data.icon);

        // 显示主要天气信息区域
        const weatherMain = document.getElementById('weather-main');
        const weatherDetails = document.getElementById('weather-details');
        const weatherUpdate = document.getElementById('weather-update');
        
        if (weatherMain) weatherMain.style.display = 'block';
        if (weatherDetails) weatherDetails.style.display = 'grid';
        if (weatherUpdate) weatherUpdate.style.display = 'flex';
    }

    // 更新额外天气信息
    updateAdditionalInfo(data) {
        // 体感温度
        const feelsLikeElement = document.getElementById('feels-like');
        if (feelsLikeElement && data.feelsLike) {
            feelsLikeElement.textContent = `${data.feelsLike}°C`;
        }

        // 风速
        const windSpeedElement = document.getElementById('wind-speed');
        if (windSpeedElement && data.windSpeed) {
            windSpeedElement.textContent = `${data.windSpeed} km/h`;
        }

        // 气压
        const pressureElement = document.getElementById('pressure');
        if (pressureElement && data.pressure) {
            pressureElement.textContent = `${data.pressure} hPa`;
        }

        // 能见度
        const visibilityElement = document.getElementById('visibility');
        if (visibilityElement && data.visibility) {
            visibilityElement.textContent = `${data.visibility} km`;
        }
    }

    updateWeatherIcon(weatherText, iconCode = null) {
        const iconElement = document.getElementById('weather-icon');
        if (!iconElement) {
            console.warn('weather-icon 元素未找到');
            return;
        }
        
        // 如果有和风API的图标代码，优先使用
        if (iconCode) {
            const weatherClass = this.getWeatherIconClassFromCode(iconCode);
            iconElement.className = 'fas';
            iconElement.classList.add(weatherClass);
            return;
        }
        
        // 否则使用文本描述
        const weatherClass = this.getWeatherIconClass(weatherText);
        
        // 移除所有天气相关的类
        iconElement.className = 'fas';
        
        // 添加新的天气图标类
        iconElement.classList.add(weatherClass);
    }

    // 根据和风API图标代码获取图标类
    getWeatherIconClassFromCode(iconCode) {
        const iconMap = {
            '100': 'fa-sun',           // 晴
            '101': 'fa-cloud-sun',     // 多云
            '102': 'fa-cloud-sun',     // 少云
            '103': 'fa-cloud',         // 晴间多云
            '104': 'fa-cloud',         // 阴
            '150': 'fa-cloud-sun',     // 晴间多云
            '151': 'fa-cloud-sun',     // 晴间多云
            '152': 'fa-cloud-sun',     // 晴间多云
            '153': 'fa-cloud-sun',     // 晴间多云
            '300': 'fa-cloud-rain',    // 阵雨
            '301': 'fa-cloud-rain',    // 强阵雨
            '302': 'fa-cloud-rain',    // 雷阵雨
            '303': 'fa-cloud-rain',    // 强雷阵雨
            '304': 'fa-cloud-rain',    // 雷阵雨伴有冰雹
            '305': 'fa-cloud-rain',    // 小雨
            '306': 'fa-cloud-rain',    // 中雨
            '307': 'fa-cloud-rain',    // 大雨
            '308': 'fa-cloud-rain',    // 极大雨
            '309': 'fa-cloud-rain',    // 毛毛雨/细雨
            '310': 'fa-cloud-rain',    // 暴雨
            '311': 'fa-cloud-rain',    // 大暴雨
            '312': 'fa-cloud-rain',    // 特大暴雨
            '313': 'fa-cloud-rain',    // 冻雨
            '314': 'fa-cloud-rain',    // 小到中雨
            '315': 'fa-cloud-rain',    // 中到大雨
            '316': 'fa-cloud-rain',    // 大到暴雨
            '317': 'fa-cloud-rain',    // 暴雨到大暴雨
            '318': 'fa-cloud-rain',    // 大暴雨到特大暴雨
            '350': 'fa-cloud-rain',    // 阵雨
            '351': 'fa-cloud-rain',    // 强阵雨
            '399': 'fa-cloud-rain',    // 雨
            '400': 'fa-snowflake',     // 小雪
            '401': 'fa-snowflake',     // 中雪
            '402': 'fa-snowflake',     // 大雪
            '403': 'fa-snowflake',     // 暴雪
            '404': 'fa-cloud-rain',    // 雨夹雪
            '405': 'fa-cloud-rain',    // 雨夹雪
            '406': 'fa-cloud-rain',    // 阵雨夹雪
            '407': 'fa-cloud-rain',    // 阵雨夹雪
            '408': 'fa-snowflake',     // 小到中雪
            '409': 'fa-snowflake',     // 中到大雪
            '410': 'fa-snowflake',     // 大到暴雪
            '456': 'fa-cloud-rain',    // 阵雨夹雪
            '457': 'fa-cloud-rain',    // 阵雨夹雪
            '499': 'fa-snowflake',     // 雪
            '500': 'fa-smog',          // 薄雾
            '501': 'fa-smog',          // 雾
            '502': 'fa-smog',          // 浓雾
            '503': 'fa-smog',          // 强浓雾
            '504': 'fa-smog',          // 轻雾
            '507': 'fa-smog',          // 沙尘暴
            '508': 'fa-smog',          // 强沙尘暴
            '509': 'fa-smog',          // 浓雾
            '510': 'fa-smog',          // 强浓雾
            '511': 'fa-smog',          // 中度霾
            '512': 'fa-smog',          // 重度霾
            '513': 'fa-smog',          // 严重霾
            '514': 'fa-smog',          // 热
            '515': 'fa-smog',          // 冷
            '900': 'fa-sun',           // 热
            '901': 'fa-snowflake',     // 冷
            '999': 'fa-question'       // 未知
        };
        
        return iconMap[iconCode] || 'fa-cloud-sun';
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

    // 切换API模式
    toggleApiMode() {
        this.useMockData = !this.useMockData;
        console.log(`已切换到${this.useMockData ? '模拟数据' : '真实API'}模式`);
        
        // 清除城市ID缓存
        this.cityId = null;
        
        // 重新加载数据
        this.loadWeatherData();
    }

    // 设置API密钥
    setApiKey(key) {
        this.apiKey = key;
        console.log('API密钥已更新');
        
        // 清除城市ID缓存
        this.cityId = null;
    }

    // 检查API状态
    async checkApiStatus() {
        if (this.useMockData) {
            console.log('当前使用模拟数据模式');
            return { status: 'mock', message: '使用模拟数据' };
        }

        if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
            return { status: 'error', message: 'API密钥未配置' };
        }

        try {
            console.log('🔍 检查API状态...');
            
            // 尝试API KEY请求标头方式
            const headers = {
                'X-QW-Api-Key': this.apiKey,
                'Content-Type': 'application/json'
            };
            
            // 测试GeoAPI城市搜索
            const geoApiUrl = `https://${this.apiHost}/geo/v2/city/lookup`;
            const testUrl = `${geoApiUrl}?location=北京`;
            console.log('测试URL (GeoAPI v2):', testUrl);
            
            let response;
            try {
                response = await fetch(testUrl, { headers });
                console.log('API KEY标头测试响应状态:', response.status);
            } catch (error) {
                console.log('API KEY标头方式失败，尝试key参数方式...');
                const fallbackUrl = `${geoApiUrl}?location=北京&key=${this.apiKey}`;
                console.log('回退测试URL:', fallbackUrl);
                response = await fetch(fallbackUrl);
                console.log('回退测试响应状态:', response.status);
            }
            
            if (response.ok) {
                const data = await response.json();
                console.log('测试响应数据:', data);
                
                if (data.code === '200') {
                    console.log('✅ API连接正常');
                    return { status: 'success', message: 'API连接正常' };
                } else {
                    console.error('❌ API返回错误:', data);
                    return { status: 'error', message: `API错误: ${data.code} - ${data.refer?.status || '未知错误'}` };
                }
            } else {
                const errorText = await response.text();
                console.error('❌ HTTP错误:', errorText);
                return { status: 'error', message: `HTTP错误: ${response.status} - ${errorText}` };
            }
        } catch (error) {
            console.error('❌ 连接失败:', error);
            return { status: 'error', message: `连接失败: ${error.message}` };
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
    
    // 添加调试信息
    console.log('🌤️ 天气应用已初始化');
    console.log('📋 可用调试命令:');
    console.log('   weatherApp.checkApiStatus() - 检查API状态');
    console.log('   weatherApp.toggleApiMode() - 切换API模式');
    console.log('   weatherApp.setApiKey("your_key") - 设置API密钥');
    console.log('   weatherApp.loadWeatherData() - 手动刷新天气');
    
    // 自动检查API状态
    setTimeout(async () => {
        const status = await weatherApp.checkApiStatus();
        console.log(`🔍 API状态: ${status.status} - ${status.message}`);
    }, 1000);
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

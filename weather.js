// 天气页面JavaScript
class WeatherApp {
    constructor() {
        // 和风API配置
        this.apiKey = '24f3a52685d341f7a66d8616f1c4bbc7'; // 和风API密钥
        this.apiHost = 'nt5u9vqehg.re.qweatherapi.com';
        this.baseUrl = `https://${this.apiHost}/v7`;
        this.useMockData = false; // 使用真实API，失败时显示"-"
        this.requestDelay = 2000; // 请求间隔2秒
        this.maxRetries = 3; // 最大重试次数
        
        // 多城市配置 - 使用城市ID用于每日预报
        this.cities = [
            { name: '杭州', id: '101210101' },
            { name: '婺源', id: '101240303' },
            { name: '景德镇', id: '101240801' },
            { name: '天津', id: '101030100' },
            { name: '玉田', id: '101090502' }
        ];
        
        this.citiesData = {}; // 存储各城市天气数据
        this.citiesGrid = document.getElementById('cities-grid');
        
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
        if (!this.citiesGrid) {
            console.error('cities-grid 元素未找到');
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

            console.log('正在获取多城市天气数据...');

            if (this.useMockData) {
                // 使用模拟数据
                await new Promise(resolve => setTimeout(resolve, 800));
                this.citiesData = this.generateMockMultiCityData();
            } else {
                // 使用真实API - 并发获取所有城市数据
                await this.fetchAllCitiesWeatherData();
            }
            
            this.updateCitiesDisplay();
            this.updateLastUpdateTime();
            
        } catch (error) {
            console.error('获取天气数据失败:', error);
            
            // 检查是否是SECURITY RESTRICTION错误
            if (error.message.includes('SECURITY RESTRICTION')) {
                this.showError('API请求被安全限制，请等待10-15分钟后重试。当前使用模拟数据展示功能。');
                console.log('🔒 检测到SECURITY RESTRICTION，切换到模拟数据模式');
            } else {
                this.showError('获取天气数据失败，请稍后重试');
            }
            
            // API失败时，确保有默认数据显示"-"
            if (!this.citiesData || Object.keys(this.citiesData).length === 0) {
                console.log('API失败，生成默认数据显示"-"');
                this.citiesData = this.generateDefaultCityData();
                this.updateCitiesDisplay();
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
    convertApiDataToDisplayFormat(apiData, cityName) {
        const now = apiData.now;
        
        return {
            cityName: cityName,
            temperature: parseInt(now.temp),
            weatherText: now.text,
            humidity: parseInt(now.humidity),
            windDir: now.windDir,
            windSpeed: parseInt(now.windSpeed),
            windScale: now.windScale,
            pressure: parseInt(now.pressure),
            visibility: parseInt(now.vis),
            feelsLike: parseInt(now.feelsLike),
            icon: now.icon,
            updateTime: new Date().toLocaleString('zh-CN')
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
    // 并发获取所有城市天气数据（实时+每日预报）
    async fetchAllCitiesWeatherData() {
        console.log('🚀 开始并发获取所有城市天气数据（实时+每日预报）...');
        
        // 创建所有城市的API请求（实时天气+每日预报）
        const promises = this.cities.map(city => this.fetchCityWeatherAndForecast(city));
        
        // 并发执行所有请求
        const results = await Promise.allSettled(promises);
        
        // 处理结果
        results.forEach((result, index) => {
            const city = this.cities[index];
            if (result.status === 'fulfilled') {
                this.citiesData[city.name] = result.value;
                console.log(`✅ ${city.name} 天气数据获取成功`);
            } else {
                console.error(`❌ ${city.name} 天气数据获取失败:`, result.reason);
                // 使用模拟数据作为备选
                this.citiesData[city.name] = this.generateMockCityData(city.name);
            }
        });
        
        console.log('📊 所有城市天气数据获取完成:', this.citiesData);
    }
    
    // 获取单个城市的实时天气和每日预报数据
    async fetchCityWeatherAndForecast(city) {
        const headers = {
            'X-QW-Api-Key': this.apiKey,
            'Content-Type': 'application/json'
        };
        
        // 并发获取实时天气和每日预报
        const [weatherResult, forecastResult] = await Promise.allSettled([
            this.fetchRealTimeWeather(city),
            this.fetchDailyForecast(city)
        ]);
        
        // 处理实时天气数据
        let weatherData = null;
        if (weatherResult.status === 'fulfilled') {
            weatherData = weatherResult.value;
        } else {
            console.warn(`${city.name} 实时天气获取失败:`, weatherResult.reason);
        }
        
        // 处理每日预报数据
        let forecastData = null;
        if (forecastResult.status === 'fulfilled') {
            forecastData = forecastResult.value;
        } else {
            console.warn(`${city.name} 每日预报获取失败:`, forecastResult.reason);
        }
        
        // 合并数据
        return this.mergeWeatherAndForecastData(city.name, weatherData, forecastData);
    }
    
    // 安全的API请求方法（带重试和延迟）
    async safeApiRequest(url, description, retryCount = 0) {
        try {
            // 添加请求延迟
            if (retryCount > 0) {
                const delay = this.requestDelay * Math.pow(2, retryCount - 1); // 指数退避
                console.log(`⏳ ${description} 重试 ${retryCount}/${this.maxRetries}，等待 ${delay}ms`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            
            const headers = {
                'X-QW-Api-Key': this.apiKey,
                'Content-Type': 'application/json'
            };
            
            console.log(`🌐 ${description} 请求:`, url);
            const response = await fetch(url, { headers });
            
            if (!response.ok) {
                // 检查是否是SECURITY RESTRICTION错误
                if (response.status === 403) {
                    const errorData = await response.json().catch(() => ({}));
                    if (errorData.error?.type?.includes('SECURITY RESTRICTION')) {
                        throw new Error(`SECURITY RESTRICTION: ${errorData.error.detail || '请求被安全限制拒绝'}`);
                    }
                }
                
                // 回退到key参数方式
                const fallbackUrl = url.includes('?') ? `${url}&key=${this.apiKey}` : `${url}?key=${this.apiKey}`;
                console.log(`🔄 ${description} 回退到参数方式:`, fallbackUrl);
                const fallbackResponse = await fetch(fallbackUrl);
                
                if (!fallbackResponse.ok) {
                    throw new Error(`HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
                }
                
                const data = await fallbackResponse.json();
                if (data.code !== '200') {
                    throw new Error(`API错误: ${data.code} - ${data.refer?.license || '未知错误'}`);
                }
                
                return data;
            }
            
            const data = await response.json();
            if (data.code !== '200') {
                throw new Error(`API错误: ${data.code} - ${data.refer?.license || '未知错误'}`);
            }
            
            return data;
            
        } catch (error) {
            // 如果是SECURITY RESTRICTION错误，不进行重试
            if (error.message.includes('SECURITY RESTRICTION')) {
                console.error(`🔒 ${description} SECURITY RESTRICTION错误:`, error.message);
                throw error;
            }
            
            // 其他错误进行重试
            if (retryCount < this.maxRetries) {
                console.warn(`⚠️ ${description} 请求失败，准备重试:`, error.message);
                return this.safeApiRequest(url, description, retryCount + 1);
            } else {
                console.error(`❌ ${description} 重试次数用尽:`, error.message);
                throw error;
            }
        }
    }
    
    // 获取实时天气数据
    async fetchRealTimeWeather(city) {
        const weatherUrl = `${this.baseUrl}/weather/now?location=${city.id}`;
        return this.safeApiRequest(weatherUrl, `${city.name} 实时天气`);
    }
    
    // 获取每日预报数据
    async fetchDailyForecast(city) {
        const forecastUrl = `${this.baseUrl}/weather/15d?location=${city.id}`;
        return this.safeApiRequest(forecastUrl, `${city.name} 15天预报`);
    }
    
    // 合并实时天气和每日预报数据
    mergeWeatherAndForecastData(cityName, weatherData, forecastData) {
        const result = {
            cityName: cityName,
            updateTime: new Date().toLocaleString('zh-CN'),
            // 默认值，API失败时显示"-"
            temperature: '-',
            tempMin: '-',
            tempMax: '-',
            tempRange: '-',
            weatherText: '-',
            humidity: '-',
            windDir: '-',
            windSpeed: '-',
            windScale: '-',
            pressure: '-',
            visibility: '-',
            feelsLike: '-',
            icon: 'fa-cloud'
        };
        
        // 如果有实时天气数据，使用实时数据
        if (weatherData && weatherData.now) {
            const now = weatherData.now;
            result.temperature = parseInt(now.temp);
            result.weatherText = now.text;
            result.humidity = parseInt(now.humidity);
            result.windDir = now.windDir;
            result.windSpeed = parseInt(now.windSpeed);
            result.windScale = now.windScale;
            result.pressure = parseInt(now.pressure);
            result.visibility = parseInt(now.vis);
            result.feelsLike = parseInt(now.feelsLike);
            result.icon = now.icon;
        }
        
        // 如果有每日预报数据，使用今日的温度区间
        if (forecastData && forecastData.daily && forecastData.daily.length > 0) {
            const daily = forecastData.daily;
            const today = daily[0];
            
            result.tempMin = parseInt(today.tempMin);
            result.tempMax = parseInt(today.tempMax);
            result.tempRange = `${today.tempMin}°C - ${today.tempMax}°C`;
            
            // 前3天预览数据
            result.preview3d = daily.slice(0, 3).map(day => ({
                date: day.fxDate,
                tempMin: parseInt(day.tempMin),
                tempMax: parseInt(day.tempMax),
                weather: day.textDay,
                icon: day.iconDay
            }));
            
            // 完整15天数据
            result.forecast15d = daily.map(day => ({
                date: day.fxDate,
                tempMin: parseInt(day.tempMin),
                tempMax: parseInt(day.tempMax),
                weather: day.textDay,
                icon: day.iconDay,
                humidity: parseInt(day.humidity),
                windDir: day.windDirDay,
                windSpeed: parseInt(day.windSpeedDay),
                pressure: parseInt(day.pressure),
                precip: parseFloat(day.precip),
                uvIndex: parseInt(day.uvIndex)
            }));
            
            // 如果没有实时天气数据，使用预报数据
            if (!weatherData) {
                result.weatherText = today.textDay;
                result.humidity = parseInt(today.humidity);
                result.windDir = today.windDirDay;
                result.windSpeed = parseInt(today.windSpeedDay);
                result.windScale = today.windScaleDay;
                result.pressure = parseInt(today.pressure);
                result.icon = today.iconDay;
            }
        } else {
            result.preview3d = [];
            result.forecast15d = [];
        }
        
        return result;
    }
    
    // 生成默认城市数据（API失败时显示"-"）
    generateDefaultCityData() {
        const defaultData = {};
        this.cities.forEach(city => {
            defaultData[city.name] = {
                cityName: city.name,
                temperature: '-',
                tempMin: '-',
                tempMax: '-',
                tempRange: '-',
                weatherText: '-',
                humidity: '-',
                windDir: '-',
                windSpeed: '-',
                windScale: '-',
                pressure: '-',
                visibility: '-',
                feelsLike: '-',
                icon: 'fa-cloud',
                updateTime: new Date().toLocaleString('zh-CN')
            };
        });
        return defaultData;
    }
    
    // 生成单个城市模拟数据
    generateMockCityData(cityName) {
        const weatherConditions = ['晴', '多云', '阴', '小雨', '中雨', '大雨', '雪', '雾'];
        const windDirections = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
        
        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const randomWind = windDirections[Math.floor(Math.random() * windDirections.length)];
        
        // 生成温度区间
        const tempMin = Math.floor(Math.random() * 15) + 5; // 5-20度
        const tempMax = tempMin + Math.floor(Math.random() * 15) + 5; // 比最低温度高5-20度
        const currentTemp = Math.floor(Math.random() * (tempMax - tempMin + 1)) + tempMin; // 当前温度在区间内
        
        return {
            cityName: cityName,
            temperature: currentTemp,
            tempMin: tempMin,
            tempMax: tempMax,
            tempRange: `${tempMin}°C - ${tempMax}°C`,
            weatherText: randomCondition,
            humidity: Math.floor(Math.random() * 40) + 40, // 40-80%
            windDir: randomWind,
            windSpeed: Math.floor(Math.random() * 20) + 5, // 5-25 km/h
            visibility: Math.floor(Math.random() * 20) + 5, // 5-25 km
            feelsLike: currentTemp + Math.floor(Math.random() * 6) - 3, // 体感温度在±3度范围内
            pressure: Math.floor(Math.random() * 50) + 1000, // 1000-1050 hPa
            updateTime: new Date().toLocaleString('zh-CN')
        };
    }
    
    // 更新多城市显示
    updateCitiesDisplay() {
        if (!this.citiesGrid) {
            console.error('cities-grid 元素未找到');
            return;
        }
        
        // 清空现有内容
        this.citiesGrid.innerHTML = '';
        
        // 为每个城市创建卡片
        this.cities.forEach(city => {
            const cityData = this.citiesData[city.name];
            if (cityData) {
                const cityCard = this.createCityCard(cityData);
                this.citiesGrid.appendChild(cityCard);
            }
        });
    }
    
    // 创建城市天气卡片
    createCityCard(cityData) {
        const card = document.createElement('div');
        card.className = 'city-weather-card';
        card.setAttribute('data-city', cityData.cityName);
        
        // 生成15天数据HTML，从次日开始，全部展开
        const forecast15dHtml = cityData.forecast15d && cityData.forecast15d.length > 1
            ? cityData.forecast15d.slice(1).map(day => `
                <div class="forecast-day">
                    <div class="forecast-date">${this.formatDate(day.date)}</div>
                    <div class="forecast-temp">${day.tempMin}°-${day.tempMax}°</div>
                    <div class="forecast-weather">${day.weather}</div>
                </div>
            `).join('')
            : '<div class="forecast-day">暂无数据</div>';
        
        card.innerHTML = `
            <div class="city-name">
                <i class="fas fa-map-marker-alt" aria-hidden="true"></i>
                <span>${cityData.cityName}</span>
            </div>
            
            <div class="city-temp-display">
                <div class="temp-current">
                    <span class="temp-value">${cityData.temperature}</span>
                    <span class="temp-unit">°C</span>
                </div>
                <div class="temp-range">
                    <span class="temp-min">${cityData.tempMin}</span>
                    <span class="temp-separator">-</span>
                    <span class="temp-max">${cityData.tempMax}</span>
                    <span class="temp-unit-range">°C</span>
                </div>
            </div>
            
            <div class="city-weather-desc">
                <i class="fas ${this.getWeatherIcon(cityData.weatherText)} city-weather-icon" aria-hidden="true"></i>
                <span class="city-weather-text">${cityData.weatherText}</span>
            </div>
            
            <div class="city-details">
                <div class="city-detail-item">
                    <span class="city-detail-label">湿度</span>
                    <span class="city-detail-value">${cityData.humidity}${cityData.humidity !== '-' ? '%' : ''}</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">风向</span>
                    <span class="city-detail-value">${cityData.windDir}</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">风速</span>
                    <span class="city-detail-value">${cityData.windSpeed}${cityData.windSpeed !== '-' ? 'km/h' : ''}</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">气压</span>
                    <span class="city-detail-value">${cityData.pressure}${cityData.pressure !== '-' ? 'hPa' : ''}</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">能见度</span>
                    <span class="city-detail-value">${cityData.visibility}${cityData.visibility !== '-' ? 'km' : ''}</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">体感</span>
                    <span class="city-detail-value">${cityData.feelsLike}${cityData.feelsLike !== '-' ? '°C' : ''}</span>
                </div>
                ${cityData.forecast15d && cityData.forecast15d.length > 0 ? `
                <div class="city-detail-item">
                    <span class="city-detail-label">降水量</span>
                    <span class="city-detail-value">${cityData.forecast15d[0].precip}${cityData.forecast15d[0].precip !== '-' ? 'mm' : ''}</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">紫外线</span>
                    <span class="city-detail-value">${cityData.forecast15d[0].uvIndex}${cityData.forecast15d[0].uvIndex !== '-' ? '' : ''}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="forecast-15d">
                <div class="forecast-title">未来14天</div>
                <div class="forecast-days">
                    ${forecast15dHtml}
                </div>
            </div>
        `;
        
        return card;
    }
    
    // 根据天气状况获取图标
    getWeatherIcon(weatherText) {
        const iconMap = {
            '晴': 'fa-sun',
            '多云': 'fa-cloud-sun',
            '阴': 'fa-cloud',
            '小雨': 'fa-cloud-rain',
            '中雨': 'fa-cloud-rain',
            '大雨': 'fa-cloud-showers-heavy',
            '雪': 'fa-snowflake',
            '雾': 'fa-smog'
        };
        
        return iconMap[weatherText] || 'fa-cloud';
    }
    
    // 格式化日期显示
    formatDate(dateString) {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekday = weekdays[date.getDay()];
        
        return `${month}/${day} 周${weekday}`;
    }

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
// document.addEventListener('visibilitychange', () => {
//     if (!document.hidden && window.weatherApp) {
//         window.weatherApp.loadWeatherData();
//     }
// });

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

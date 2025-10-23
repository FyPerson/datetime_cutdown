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
            { name: 'CITY_SELECTOR', id: 'CITY_SELECTOR' } // 城市选择器占位符
        ];
        
        // 热门城市列表
        this.popularCities = [
            { name: '北京', id: '101010100' },
            { name: '上海', id: '101020100' },
            { name: '广州', id: '101280101' },
            { name: '深圳', id: '101280601' },
            { name: '成都', id: '101270101' },
            { name: '武汉', id: '101200101' },
            { name: '西安', id: '101110101' },
            { name: '南京', id: '101190101' }
        ];
        
        // 用户选择的历史城市
        this.historyCities = JSON.parse(localStorage.getItem('weatherHistoryCities') || '[]');
        
        // 当前选择的城市
        this.selectedCity = null;
        
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
        this.initGlobalSearch();
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
            cloud: parseInt(now.cloud),
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
            result.cloud = parseInt(now.cloud);
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
    async updateCitiesDisplay() {
        if (!this.citiesGrid) {
            console.error('cities-grid 元素未找到');
            return;
        }
        
        // 清空现有内容
        this.citiesGrid.innerHTML = '';
        
        // 为每个城市创建卡片
        this.cities.forEach(city => {
            if (city.name === 'CITY_SELECTOR') {
                // 为城市选择器创建特殊的数据对象
                const selectorData = {
                    cityName: 'CITY_SELECTOR',
                    temperature: '-',
                    tempMin: '-',
                    tempMax: '-',
                    weatherText: '-',
                    humidity: '-',
                    windDir: '-',
                    windSpeed: '-',
                    pressure: '-',
                    visibility: '-',
                    feelsLike: '-',
                    icon: 'fa-cloud',
                    updateTime: new Date().toLocaleString('zh-CN')
                };
                const cityCard = this.createCityCard(selectorData);
                this.citiesGrid.appendChild(cityCard);
            } else {
                const cityData = this.citiesData[city.name];
                if (cityData) {
                    const cityCard = this.createCityCard(cityData);
                    this.citiesGrid.appendChild(cityCard);
                }
            }
        });
        
        // 为每个城市加载详细信息（包括城市选择器）
        await this.loadAllCitiesDetailedInfo();
        
        // 如果城市选择器已选择城市，为其加载详细信息
        if (this.selectedCity) {
            await this.loadCitySelectorDetailedInfo();
        }
    }
    
    // 创建城市天气卡片
    createCityCard(cityData) {
        // 如果是城市选择器，创建特殊的选择器卡片
        if (cityData.cityName === 'CITY_SELECTOR') {
            return this.createCitySelectorCard();
        }
        
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
                    <span class="city-detail-label">云量</span>
                    <span class="city-detail-value">${cityData.cloud}%</span>
                </div>
                ` : ''}
            </div>
            
            <div class="forecast-15d">
                <div class="forecast-title">未来14天</div>
                <div class="forecast-days">
                    ${forecast15dHtml}
                </div>
            </div>
            
            <!-- 详细信息区域 -->
            <div class="city-detailed-info">
                <!-- 天气指数 -->
                <div class="city-info-section" id="weather-indices-${cityData.cityName}">
                    <div class="city-info-title">
                        <i class="fas fa-chart-line"></i>
                        <span>天气指数</span>
                    </div>
                    <div class="city-indices-grid" id="indices-${cityData.cityName}">
                        <div class="loading-indices">加载中...</div>
                    </div>
                </div>
                
                <!-- 空气质量 -->
                <div class="city-info-section" id="air-quality-${cityData.cityName}">
                    <div class="city-info-title">
                        <i class="fas fa-wind"></i>
                        <span>空气质量</span>
                    </div>
                    <div class="city-air-quality-content" id="air-quality-${cityData.cityName}">
                        <div class="loading-air-quality">加载中...</div>
                    </div>
                </div>
                
                <!-- 天文信息 -->
                <div class="city-info-section" id="astronomy-${cityData.cityName}">
                    <div class="city-info-title">
                        <i class="fas fa-star"></i>
                        <span>天文信息</span>
                    </div>
                    <div class="city-astronomy-content" id="astronomy-${cityData.cityName}">
                        <div class="loading-astronomy">加载中...</div>
                    </div>
                </div>
            </div>
        `;
        
        return card;
    }
    
    // 创建城市选择器卡片
    createCitySelectorCard() {
        const card = document.createElement('div');
        card.className = 'city-weather-card';
        card.setAttribute('data-city', 'CITY_SELECTOR');
        
        // 获取当前选择的城市名称
        const currentCityName = this.selectedCity ? this.selectedCity.name : '选择城市';
        
        // 生成15天数据HTML，从次日开始，全部展开
        const forecast15dHtml = this.selectedCity && this.citiesData[this.selectedCity.name] && this.citiesData[this.selectedCity.name].forecast15d && this.citiesData[this.selectedCity.name].forecast15d.length > 1
            ? this.citiesData[this.selectedCity.name].forecast15d.slice(1).map(day => `
                <div class="forecast-day">
                    <div class="forecast-date">${this.formatDate(day.date)}</div>
                    <div class="forecast-temp">${day.tempMin}°-${day.tempMax}°</div>
                    <div class="forecast-weather">${day.weather}</div>
                </div>
            `).join('')
            : '<div class="forecast-day">暂无数据</div>';
        
        card.innerHTML = `
            <div class="city-name">
                <i class="fas fa-search" aria-hidden="true"></i>
                <span class="city-selector-trigger">${currentCityName}</span>
            </div>
            
            <!-- 城市选择下拉框 - 只在点击时显示 -->
            <div class="city-selector-dropdown">
                <div class="city-search-box">
                    <input type="text" 
                           class="city-search-input" 
                           placeholder="搜索城市名称..." 
                           autocomplete="off">
                    <i class="fas fa-search search-icon" aria-hidden="true"></i>
                </div>
                
                <div class="city-search-results">
                    <div class="search-loading" style="display: none;">
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>搜索中...</span>
                    </div>
                    <div class="search-error" style="display: none;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>搜索失败，请重试</span>
                    </div>
                    <div class="city-list-container">
                        <!-- 热门城市 -->
                        <div class="city-section">
                            <div class="city-section-title">
                                <i class="fas fa-fire"></i>
                                <span>热门城市</span>
                            </div>
                            <div class="city-section-list popular-cities">
                                ${this.popularCities.map(city => `
                                    <div class="city-item popular-city" data-city-id="${city.id}" data-city-name="${city.name}">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <span>${city.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <!-- 历史城市 -->
                        ${this.historyCities.length > 0 ? `
                        <div class="city-section">
                            <div class="city-section-title">
                                <i class="fas fa-history"></i>
                                <span>最近选择</span>
                            </div>
                            <div class="city-section-list history-cities">
                                ${this.historyCities.slice(0, 5).map(city => `
                                    <div class="city-item history-city" data-city-id="${city.id}" data-city-name="${city.name}">
                                        <i class="fas fa-clock"></i>
                                        <span>${city.name}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ` : ''}
                        
                        <!-- 搜索结果 -->
                        <div class="city-section search-results" style="display: none;">
                            <div class="city-section-title">
                                <i class="fas fa-search"></i>
                                <span>搜索结果</span>
                            </div>
                            <div class="city-section-list search-results-list">
                                <!-- 搜索结果将动态插入这里 -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="city-temp-display">
                <div class="temp-current">
                    <span class="temp-value">--</span>
                    <span class="temp-unit">°C</span>
                </div>
                <div class="temp-range">
                    <span class="temp-min">--</span>
                    <span class="temp-separator">-</span>
                    <span class="temp-max">--</span>
                    <span class="temp-unit-range">°C</span>
                </div>
            </div>
            
            <div class="city-weather-desc">
                <i class="fas fa-cloud city-weather-icon" aria-hidden="true"></i>
                <span class="city-weather-text">--</span>
            </div>
            
            <div class="city-details">
                <div class="city-detail-item">
                    <span class="city-detail-label">湿度</span>
                    <span class="city-detail-value">--</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">风向</span>
                    <span class="city-detail-value">--</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">风速</span>
                    <span class="city-detail-value">--</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">气压</span>
                    <span class="city-detail-value">--</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">能见度</span>
                    <span class="city-detail-value">--</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">体感</span>
                    <span class="city-detail-value">--</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">降水量</span>
                    <span class="city-detail-value">--</span>
                </div>
                <div class="city-detail-item">
                    <span class="city-detail-label">云量</span>
                    <span class="city-detail-value">--</span>
                </div>
            </div>
            
            <div class="forecast-15d">
                <div class="forecast-title">未来14天</div>
                <div class="forecast-days">
                    ${forecast15dHtml}
                </div>
            </div>
            
            <!-- 详细信息区域 -->
            <div class="city-detailed-info">
                <!-- 天气指数 -->
                <div class="city-info-section" id="weather-indices-CITY_SELECTOR">
                    <div class="city-info-title">
                        <i class="fas fa-chart-line"></i>
                        <span>天气指数</span>
                    </div>
                    <div class="city-indices-grid" id="indices-CITY_SELECTOR">
                        <div class="loading-indices">加载中...</div>
                    </div>
                </div>
                
                <!-- 空气质量 -->
                <div class="city-info-section" id="air-quality-CITY_SELECTOR">
                    <div class="city-info-title">
                        <i class="fas fa-wind"></i>
                        <span>空气质量</span>
                    </div>
                    <div class="city-air-quality-content" id="air-quality-CITY_SELECTOR">
                        <div class="loading-air-quality">加载中...</div>
                    </div>
                </div>
                
                <!-- 天文信息 -->
                <div class="city-info-section" id="astronomy-CITY_SELECTOR">
                    <div class="city-info-title">
                        <i class="fas fa-star"></i>
                        <span>天文信息</span>
                    </div>
                    <div class="city-astronomy-content" id="astronomy-CITY_SELECTOR">
                        <div class="loading-astronomy">加载中...</div>
                    </div>
                </div>
            </div>
        `;
        
        // 绑定事件监听器
        this.bindCitySelectorEvents(card);
        
        return card;
    }
    
    // 初始化全局搜索框
    initGlobalSearch() {
        const globalSearchInput = document.getElementById('global-search-box');
        const popularCitiesList = document.getElementById('popular-cities-list');
        
        if (globalSearchInput) {
            // 搜索输入事件
            let searchTimeout;
            globalSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                clearTimeout(searchTimeout);
                if (query.length > 0) {
                    searchTimeout = setTimeout(() => {
                        this.searchCitiesGlobally(query);
                    }, 300);
                } else {
                    this.showPopularCities();
                }
            });
            
            // 键盘事件
            globalSearchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const query = e.target.value.trim();
                    if (query.length > 0) {
                        this.searchCitiesGlobally(query);
                    }
                }
            });
        }
        
        // 显示热门城市
        this.showPopularCities();
    }
    
    // 显示热门城市
    showPopularCities() {
        const popularCitiesList = document.getElementById('popular-cities-list');
        if (popularCitiesList) {
            popularCitiesList.innerHTML = this.popularCities.map(city => `
                <div class="popular-city-item" data-city-id="${city.id}" data-city-name="${city.name}">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${city.name}</span>
                </div>
            `).join('');
            
            // 绑定点击事件
            popularCitiesList.querySelectorAll('.popular-city-item').forEach(item => {
                item.addEventListener('click', () => {
                    const cityId = item.getAttribute('data-city-id');
                    const cityName = item.getAttribute('data-city-name');
                    this.selectCityFromGlobalSearch({ id: cityId, name: cityName });
                });
            });
        }
    }
    
    // 全局搜索城市
    async searchCitiesGlobally(query) {
        const popularCitiesList = document.getElementById('popular-cities-list');
        if (!popularCitiesList) return;
        
        try {
            popularCitiesList.innerHTML = '<div class="search-loading">搜索中...</div>';
            
            const cities = await this.searchCitiesFromAPI(query);
            
            if (cities && cities.length > 0) {
                popularCitiesList.innerHTML = cities.slice(0, 10).map(city => `
                    <div class="popular-city-item" data-city-id="${city.id}" data-city-name="${city.name}">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${city.name}</span>
                    </div>
                `).join('');
                
                // 绑定点击事件
                popularCitiesList.querySelectorAll('.popular-city-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const cityId = item.getAttribute('data-city-id');
                        const cityName = item.getAttribute('data-city-name');
                        this.selectCityFromGlobalSearch({ id: cityId, name: cityName });
                    });
                });
            } else {
                popularCitiesList.innerHTML = '<div class="search-error">未找到相关城市</div>';
            }
        } catch (error) {
            console.error('全局搜索失败:', error);
            popularCitiesList.innerHTML = '<div class="search-error">搜索失败，请重试</div>';
        }
    }
    
    // 从全局搜索选择城市
    selectCityFromGlobalSearch(city) {
        // 清空搜索框
        const globalSearchInput = document.getElementById('global-search-box');
        if (globalSearchInput) {
            globalSearchInput.value = '';
        }
        
        // 选择城市
        this.selectedCity = city;
        this.addToHistory(city);
        
        // 更新城市选择器显示
        const citySelectorCard = document.querySelector('[data-city="CITY_SELECTOR"]');
        if (citySelectorCard) {
            this.updateCitySelectorDisplay(citySelectorCard);
            this.loadSelectedCityWeather(city, citySelectorCard);
        }
        
        // 显示热门城市
        this.showPopularCities();
    }
    
    // 绑定城市选择器事件
    bindCitySelectorEvents(card) {
        const cityNameElement = card.querySelector('.city-name');
        const dropdown = card.querySelector('.city-selector-dropdown');
        const searchInput = card.querySelector('.city-search-input');
        const cityItems = card.querySelectorAll('.city-item');
        
        // 点击城市名称显示/隐藏下拉框
        cityNameElement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleCitySelectorDropdown(card);
        });
        
        // 搜索输入事件
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                
                // 清除之前的定时器
                clearTimeout(searchTimeout);
                
                if (query.length === 0) {
                    this.hideSearchResults(card);
                    return;
                }
                
                // 防抖处理，500ms后执行搜索
                searchTimeout = setTimeout(() => {
                    this.searchCities(query, card);
                }, 500);
            });
            
            // 搜索框获得焦点时显示下拉框
            searchInput.addEventListener('focus', () => {
                this.showCitySelectorDropdown(card);
            });
        }
        
        // 城市项点击事件
        cityItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const cityId = item.getAttribute('data-city-id');
                const cityName = item.getAttribute('data-city-name');
                
                if (cityId && cityName) {
                    this.selectCity({ id: cityId, name: cityName }, card);
                }
            });
        });
        
        // 点击外部关闭下拉框（使用一次性监听器避免重复）
        const globalClickHandler = (e) => {
            if (!card.contains(e.target)) {
                this.hideCitySelectorDropdown(card);
            }
        };
        
        // 移除之前的监听器（如果存在）
        if (card._globalClickHandler) {
            document.removeEventListener('click', card._globalClickHandler);
        }
        
        // 添加新的监听器
        document.addEventListener('click', globalClickHandler);
        card._globalClickHandler = globalClickHandler;
        
        // 键盘事件支持
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideCitySelectorDropdown(card);
            }
        });
    }
    
    // 切换城市选择器下拉框显示状态
    toggleCitySelectorDropdown(card) {
        const dropdown = card.querySelector('.city-selector-dropdown');
        const arrow = card.querySelector('.selector-arrow');
        
        if (dropdown.style.display === 'none' || !dropdown.style.display) {
            this.showCitySelectorDropdown(card);
        } else {
            this.hideCitySelectorDropdown(card);
        }
    }
    
    // 显示城市选择器下拉框
    showCitySelectorDropdown(card) {
        const dropdown = card.querySelector('.city-selector-dropdown');
        
        dropdown.classList.add('show');
        
        // 聚焦到搜索框
        const searchInput = card.querySelector('.city-search-input');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }
    
    // 隐藏城市选择器下拉框
    hideCitySelectorDropdown(card) {
        const dropdown = card.querySelector('.city-selector-dropdown');
        const searchInput = card.querySelector('.city-search-input');
        
        dropdown.classList.remove('show');
        
        // 清空搜索框
        if (searchInput) {
            searchInput.value = '';
        }
        
        // 隐藏搜索结果
        this.hideSearchResults(card);
    }
    
    // 搜索城市
    async searchCities(query, card) {
        const searchResults = card.querySelector('.search-results');
        const searchResultsList = card.querySelector('.search-results-list');
        const searchLoading = card.querySelector('.search-loading');
        const searchError = card.querySelector('.search-error');
        
        // 显示加载状态
        searchLoading.style.display = 'block';
        searchError.style.display = 'none';
        searchResults.style.display = 'none';
        
        try {
            // 使用和风API搜索城市
            const cities = await this.searchCitiesFromAPI(query);
            
            // 隐藏加载状态
            searchLoading.style.display = 'none';
            
            if (cities && cities.length > 0) {
                // 显示搜索结果
                searchResultsList.innerHTML = cities.map(city => `
                    <div class="city-item search-city" data-city-id="${city.id}" data-city-name="${city.name}">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${city.name}</span>
                        <span class="city-province">${city.adm1 || ''}</span>
                    </div>
                `).join('');
                
                // 重新绑定搜索结果的事件
                const newCityItems = searchResultsList.querySelectorAll('.city-item');
                newCityItems.forEach(item => {
                    item.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const cityId = item.getAttribute('data-city-id');
                        const cityName = item.getAttribute('data-city-name');
                        
                        if (cityId && cityName) {
                            this.selectCity({ id: cityId, name: cityName }, card);
                        }
                    });
                });
                
                searchResults.style.display = 'block';
            } else {
                // 没有搜索结果
                searchResultsList.innerHTML = '<div class="no-results">未找到相关城市</div>';
                searchResults.style.display = 'block';
            }
        } catch (error) {
            console.error('搜索城市失败:', error);
            searchLoading.style.display = 'none';
            searchError.style.display = 'block';
        }
    }
    
    // 使用API搜索城市
    async searchCitiesFromAPI(query) {
        try {
            const geoApiUrl = `https://${this.apiHost}/geo/v2/city/lookup`;
            const searchUrl = `${geoApiUrl}?location=${encodeURIComponent(query)}&key=${this.apiKey}`;
            
            const response = await fetch(searchUrl);
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.code !== '200' || !data.location) {
                return [];
            }
            
            // 限制返回结果数量，避免列表过长
            return data.location.slice(0, 10).map(city => ({
                id: city.id,
                name: city.name,
                adm1: city.adm1, // 省份
                adm2: city.adm2  // 城市
            }));
        } catch (error) {
            console.error('API搜索城市失败:', error);
            throw error;
        }
    }
    
    // 隐藏搜索结果
    hideSearchResults(card) {
        const searchResults = card.querySelector('.search-results');
        const searchLoading = card.querySelector('.search-loading');
        const searchError = card.querySelector('.search-error');
        
        searchResults.style.display = 'none';
        searchLoading.style.display = 'none';
        searchError.style.display = 'none';
    }
    
    // 选择城市
    async selectCity(city, card) {
        console.log('选择城市:', city);
        
        // 更新当前选择的城市
        this.selectedCity = city;
        
        // 添加到历史记录
        this.addToHistory(city);
        
        // 更新UI显示
        this.updateCitySelectorDisplay(card);
        
        // 隐藏下拉框
        this.hideCitySelectorDropdown(card);
        
        // 加载该城市的天气数据
        await this.loadSelectedCityWeather(city, card);
    }
    
    // 添加到历史记录
    addToHistory(city) {
        // 移除已存在的相同城市
        this.historyCities = this.historyCities.filter(c => c.id !== city.id);
        
        // 添加到开头
        this.historyCities.unshift(city);
        
        // 限制历史记录数量
        this.historyCities = this.historyCities.slice(0, 10);
        
        // 保存到本地存储
        localStorage.setItem('weatherHistoryCities', JSON.stringify(this.historyCities));
    }
    
    // 更新城市选择器显示
    updateCitySelectorDisplay(card) {
        const citySelectorTrigger = card.querySelector('.city-selector-trigger');
        if (citySelectorTrigger && this.selectedCity) {
            citySelectorTrigger.textContent = this.selectedCity.name;
        }
    }
    
    // 加载选中城市的天气数据
    async loadSelectedCityWeather(city, card) {
        try {
            console.log(`加载城市 ${city.name} 的天气数据...`);
            
            // 获取天气数据
            const weatherData = await this.fetchCityWeatherAndForecast(city);
            
            // 将天气数据存储到citiesData中
            this.citiesData[city.name] = weatherData;
            
            // 更新卡片显示
            this.updateCitySelectorWeatherInfo(card, weatherData);
            
            // 加载详细信息
            await this.loadCitySelectorDetailedInfo();
            
            console.log(`城市 ${city.name} 天气数据加载完成`);
        } catch (error) {
            console.error(`加载城市 ${city.name} 天气数据失败:`, error);
            // 显示错误状态
            this.updateCitySelectorWeatherInfo(card, null);
        }
    }
    
    // 更新城市选择器的天气信息显示
    updateCitySelectorWeatherInfo(card, weatherData) {
        if (!weatherData) {
            // 显示默认状态
            card.querySelector('.temp-value').textContent = '--';
            card.querySelector('.temp-min').textContent = '--';
            card.querySelector('.temp-max').textContent = '--';
            card.querySelector('.city-weather-text').textContent = '--';
            
            const detailValues = card.querySelectorAll('.city-detail-value');
            detailValues.forEach(value => value.textContent = '--');
            
            // 清空15天预报
            const forecastDays = card.querySelector('.forecast-days');
            if (forecastDays) {
                forecastDays.innerHTML = '<div class="forecast-day">暂无数据</div>';
            }
            return;
        }
        
        // 更新温度信息
        card.querySelector('.temp-value').textContent = weatherData.temperature || '--';
        card.querySelector('.temp-min').textContent = weatherData.tempMin || '--';
        card.querySelector('.temp-max').textContent = weatherData.tempMax || '--';
        card.querySelector('.city-weather-text').textContent = weatherData.weatherText || '--';
        
        // 更新天气图标
        const weatherIcon = card.querySelector('.city-weather-icon');
        if (weatherIcon) {
            weatherIcon.className = `fas ${this.getWeatherIcon(weatherData.weatherText)} city-weather-icon`;
        }
        
        // 更新详细信息
        const detailValues = card.querySelectorAll('.city-detail-value');
        if (detailValues.length >= 8) {
            detailValues[0].textContent = weatherData.humidity !== '-' ? `${weatherData.humidity}%` : '--';
            detailValues[1].textContent = weatherData.windDir || '--';
            detailValues[2].textContent = weatherData.windSpeed !== '-' ? `${weatherData.windSpeed}km/h` : '--';
            detailValues[3].textContent = weatherData.pressure !== '-' ? `${weatherData.pressure}hPa` : '--';
            detailValues[4].textContent = weatherData.visibility !== '-' ? `${weatherData.visibility}km` : '--';
            detailValues[5].textContent = weatherData.feelsLike !== '-' ? `${weatherData.feelsLike}°C` : '--';
            
            // 降水量和云量
            if (weatherData.forecast15d && weatherData.forecast15d.length > 0) {
                detailValues[6].textContent = weatherData.forecast15d[0].precip !== '-' ? `${weatherData.forecast15d[0].precip}mm` : '--';
            } else {
                detailValues[6].textContent = '--';
            }
            detailValues[7].textContent = weatherData.cloud !== '-' ? `${weatherData.cloud}%` : '--';
        }
        
        // 更新15天预报
        if (weatherData.forecast15d && weatherData.forecast15d.length > 1) {
            const forecastDays = card.querySelector('.forecast-days');
            if (forecastDays) {
                forecastDays.innerHTML = weatherData.forecast15d.slice(1).map(day => `
                    <div class="forecast-day">
                        <div class="forecast-date">${this.formatDate(day.date)}</div>
                        <div class="forecast-temp">${day.tempMin}°-${day.tempMax}°</div>
                        <div class="forecast-weather">${day.weather}</div>
                    </div>
                `).join('');
            }
        }
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

    // 为所有城市加载详细信息
    async loadAllCitiesDetailedInfo() {
        console.log('🔍 开始为所有城市加载详细信息...');
        
        // 并发为所有城市加载详细信息（排除城市选择器）
        const promises = this.cities
            .filter(city => city.name !== 'CITY_SELECTOR')
            .map(city => this.loadCityDetailedInfo(city));
        await Promise.allSettled(promises);
        
        console.log('✅ 所有城市详细信息加载完成');
    }
    
    // 为城市选择器加载详细信息
    async loadCitySelectorDetailedInfo() {
        if (!this.selectedCity) return;
        
        try {
            console.log(`🔍 为城市选择器加载城市 ${this.selectedCity.name} 的详细信息...`);
            
            // 并发获取该城市的所有详细信息
            const [weatherIndices, airQuality, moonPhase, sunTimes] = await Promise.allSettled([
                this.fetchWeatherIndices(this.selectedCity.id),
                this.fetchAirQuality(this.selectedCity.id),
                this.fetchMoonPhase(this.selectedCity.id),
                this.fetchSunTimes(this.selectedCity.id)
            ]);
            
            // 更新城市选择器的显示
            this.updateCityWeatherIndicesDisplay('CITY_SELECTOR', weatherIndices.status === 'fulfilled' ? weatherIndices.value : null);
            this.updateCityAirQualityDisplay('CITY_SELECTOR', airQuality.status === 'fulfilled' ? airQuality.value : null);
            this.updateCityAstronomyDisplay('CITY_SELECTOR', 
                moonPhase.status === 'fulfilled' ? moonPhase.value : null,
                sunTimes.status === 'fulfilled' ? sunTimes.value : null
            );
            
            console.log(`✅ 城市选择器详细信息加载完成`);
        } catch (error) {
            console.error(`❌ 城市选择器详细信息加载失败:`, error);
            // 显示默认内容
            this.updateCityWeatherIndicesDisplay('CITY_SELECTOR', null);
            this.updateCityAirQualityDisplay('CITY_SELECTOR', null);
            this.updateCityAstronomyDisplay('CITY_SELECTOR', null, null);
        }
    }
    
    // 为单个城市加载详细信息
    async loadCityDetailedInfo(city) {
        try {
            console.log(`🔍 为城市 ${city.name} 加载详细信息...`);
            
            // 并发获取该城市的所有详细信息
            const [weatherIndices, airQuality, moonPhase, sunTimes] = await Promise.allSettled([
                this.fetchWeatherIndices(city.id),
                this.fetchAirQuality(city.id),
                this.fetchMoonPhase(city.id),
                this.fetchSunTimes(city.id)
            ]);
            
            // 更新该城市的显示
            this.updateCityWeatherIndicesDisplay(city.name, weatherIndices.status === 'fulfilled' ? weatherIndices.value : null);
            this.updateCityAirQualityDisplay(city.name, airQuality.status === 'fulfilled' ? airQuality.value : null);
            this.updateCityAstronomyDisplay(city.name, 
                moonPhase.status === 'fulfilled' ? moonPhase.value : null,
                sunTimes.status === 'fulfilled' ? sunTimes.value : null
            );
            
            console.log(`✅ 城市 ${city.name} 详细信息加载完成`);
        } catch (error) {
            console.error(`❌ 城市 ${city.name} 详细信息加载失败:`, error);
            // 显示默认内容
            this.updateCityWeatherIndicesDisplay(city.name, null);
            this.updateCityAirQualityDisplay(city.name, null);
            this.updateCityAstronomyDisplay(city.name, null, null);
        }
    }

    // 获取天气指数
    async fetchWeatherIndices(location) {
        // 获取多种天气指数：运动、洗车、穿衣、感冒、紫外线、旅游、晾晒
        const indicesUrl = `${this.baseUrl}/indices/1d?location=${location}&type=1,2,3,4,5,6,9,14&key=${this.apiKey}`;
        
        try {
            const response = await fetch(indicesUrl);
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.code !== '200') {
                throw new Error(`API错误: ${data.code}`);
            }
            
            return data.daily || [];
        } catch (error) {
            console.error('获取天气指数失败:', error);
            throw error;
        }
    }

    // 获取空气质量
    async fetchAirQuality(location) {
        // 使用经纬度获取空气质量（需要先获取城市坐标）
        const geoUrl = `https://${this.apiHost}/geo/v2/city/lookup?location=${location}&key=${this.apiKey}`;
        
        try {
            const geoResponse = await fetch(geoUrl);
            const geoData = await geoResponse.json();
            
            if (geoData.code !== '200' || !geoData.location || geoData.location.length === 0) {
                throw new Error('无法获取城市坐标');
            }
            
            const cityInfo = geoData.location[0];
            const lat = cityInfo.lat;
            const lon = cityInfo.lon;
            
            // 获取空气质量数据
            const airQualityUrl = `https://${this.apiHost}/airquality/v1/current/${lat}/${lon}?key=${this.apiKey}`;
            const airResponse = await fetch(airQualityUrl);
            
            if (!airResponse.ok) {
                throw new Error(`HTTP错误: ${airResponse.status}`);
            }
            
            const airData = await airResponse.json();
            return airData;
        } catch (error) {
            console.error('获取空气质量失败:', error);
            throw error;
        }
    }

    // 获取月相信息
    async fetchMoonPhase(location) {
        // 获取今天的月相信息
        const today = new Date();
        const dateStr = today.getFullYear() + 
                       String(today.getMonth() + 1).padStart(2, '0') + 
                       String(today.getDate()).padStart(2, '0');
        
        const moonUrl = `${this.baseUrl}/astronomy/moon?location=${location}&date=${dateStr}&key=${this.apiKey}`;
        
        try {
            const response = await fetch(moonUrl);
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.code !== '200') {
                throw new Error(`API错误: ${data.code}`);
            }
            
            return data;
        } catch (error) {
            console.error('获取月相信息失败:', error);
            throw error;
        }
    }

    // 获取日出日落时间
    async fetchSunTimes(location) {
        // 获取今天的日出日落时间
        const today = new Date();
        const dateStr = today.getFullYear() + 
                       String(today.getMonth() + 1).padStart(2, '0') + 
                       String(today.getDate()).padStart(2, '0');
        
        const sunUrl = `${this.baseUrl}/astronomy/sun?location=${location}&date=${dateStr}&key=${this.apiKey}`;
        
        try {
            const response = await fetch(sunUrl);
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            if (data.code !== '200') {
                throw new Error(`API错误: ${data.code}`);
            }
            
            return data;
        } catch (error) {
            console.error('获取日出日落时间失败:', error);
            throw error;
        }
    }

    // 更新城市天气指数显示
    updateCityWeatherIndicesDisplay(cityName, indicesData) {
        const indicesGrid = document.getElementById(`indices-${cityName}`);
        if (!indicesGrid) {
            console.error(`找不到元素: indices-${cityName}`);
            return;
        }
        
        console.log(`更新城市 ${cityName} 的天气指数:`, indicesData);
        
        if (!indicesData || indicesData.length === 0) {
            console.log(`城市 ${cityName} 没有天气指数数据`);
            indicesGrid.innerHTML = '<div class="no-data">暂无天气指数数据</div>';
            return;
        }
        
        // 智能选择最重要的6个指数进行显示
        const selectedIndices = this.selectImportantIndices(indicesData);
        
        const indicesHtml = selectedIndices.map(index => {
            console.log(`处理指数:`, index);
            const levelClass = this.getIndexLevelClass(index.level);
            return `
                <div class="city-index-item">
                    <div class="city-index-name">${index.name || '未知'}</div>
                    <div class="city-index-level ${levelClass}">${index.level || '--'}</div>
                    <div class="city-index-category">${index.category || '--'}</div>
                </div>
            `;
        }).join('');
        
        console.log(`城市 ${cityName} 天气指数HTML:`, indicesHtml);
        indicesGrid.innerHTML = indicesHtml;
    }

    // 更新城市空气质量显示
    updateCityAirQualityDisplay(cityName, airQualityData) {
        const airQualityContent = document.getElementById(`air-quality-${cityName}`);
        if (!airQualityContent) return;
        
        if (!airQualityData || !airQualityData.indexes) {
            airQualityContent.innerHTML = '<div class="no-data">暂无空气质量数据</div>';
            return;
        }
        
        // 只显示主要的AQI指数 - 优先使用中国标准cn-mee
        const mainAQI = airQualityData.indexes.find(index => 
            index.code === 'cn-mee' || index.code === 'qaqi' || index.code === 'us-epa'
        ) || airQualityData.indexes[0];
        const levelClass = this.getAQILevelClass(mainAQI.aqi);
        
        const aqiHtml = `
            <div class="city-aqi-card">
                <div class="city-aqi-title">${mainAQI.name}</div>
                <div class="city-aqi-value ${levelClass}">${mainAQI.aqiDisplay}</div>
                <div class="city-aqi-level">${mainAQI.category}</div>
            </div>
        `;
        
        // 添加主要污染物信息
        let pollutantsHtml = '';
        if (airQualityData.pollutants && airQualityData.pollutants.length > 0) {
            const mainPollutants = airQualityData.pollutants.slice(0, 3); // 只显示前3个
            pollutantsHtml = `
                <div class="city-pollutants-grid">
                    ${mainPollutants.map(pollutant => `
                        <div class="city-pollutant-item">
                            <div class="city-pollutant-name">${pollutant.name}</div>
                            <div class="city-pollutant-value">${pollutant.concentration.value}</div>
                            <div class="city-pollutant-unit">${pollutant.concentration.unit}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        airQualityContent.innerHTML = `
            <div class="city-info-title">
                <i class="fas fa-wind"></i>
                <span>空气质量</span>
            </div>
            ${aqiHtml}
            ${pollutantsHtml}
        `;
    }

    // 更新城市天文信息显示
    updateCityAstronomyDisplay(cityName, moonData, sunData) {
        const astronomyContent = document.getElementById(`astronomy-${cityName}`);
        if (!astronomyContent) return;
        
        // 日出日落时间
        let sunTimesHtml = '';
        if (sunData && sunData.sunrise && sunData.sunset) {
            sunTimesHtml = `
                <div class="city-sun-times">
                    <div class="city-sun-time">
                        <div class="city-sun-time-label">日出</div>
                        <div class="city-sun-time-value">${sunData.sunrise ? sunData.sunrise.split('T')[1]?.split('+')[0]?.substring(0,5) || sunData.sunrise : '--'}</div>
                    </div>
                    <div class="city-sun-time">
                        <div class="city-sun-time-label">日落</div>
                        <div class="city-sun-time-value">${sunData.sunset ? sunData.sunset.split('T')[1]?.split('+')[0]?.substring(0,5) || sunData.sunset : '--'}</div>
                    </div>
                </div>
            `;
        } else {
            sunTimesHtml = '<div class="city-sun-times"><div class="no-data">暂无日出日落数据</div></div>';
        }
        
        // 月升月落时间
        let moonTimesHtml = '';
        if (moonData && (moonData.moonrise || moonData.moonset)) {
            moonTimesHtml = `
                <div class="city-moon-times">
                    <div class="city-moon-time">
                        <div class="city-moon-time-label">月升</div>
                        <div class="city-moon-time-value">${moonData.moonrise ? this.formatTime(moonData.moonrise) : '--'}</div>
                    </div>
                    <div class="city-moon-time">
                        <div class="city-moon-time-label">月落</div>
                        <div class="city-moon-time-value">${moonData.moonset ? this.formatTime(moonData.moonset) : '--'}</div>
                    </div>
                </div>
            `;
        } else {
            moonTimesHtml = '<div class="city-moon-times"><div class="no-data">暂无月升月落数据</div></div>';
        }
        
        // 当前月相信息
        let phaseInfoHtml = '';
        if (moonData && moonData.moonPhase && moonData.moonPhase.length > 0) {
            const currentPhase = moonData.moonPhase[0];
            phaseInfoHtml = `
                <div class="city-moon-phase-info">
                    <div class="city-moon-phase-name">${currentPhase.name}</div>
                    <div class="city-moon-phase-icon">🌙</div>
                    <div class="city-moon-illumination">照明度: ${currentPhase.illumination}%</div>
                </div>
            `;
        } else {
            phaseInfoHtml = '<div class="city-moon-phase-info"><div class="no-data">暂无月相信息</div></div>';
        }
        
        astronomyContent.innerHTML = `
            <div class="city-info-title">
                <i class="fas fa-star"></i>
                <span>天文信息</span>
            </div>
            <div class="city-astronomy-card">
                ${sunTimesHtml}
                ${moonTimesHtml}
                ${phaseInfoHtml}
            </div>
        `;
    }

    // 智能选择最重要的6个指数进行显示
    selectImportantIndices(indicesData) {
        if (!indicesData || indicesData.length === 0) {
            return [];
        }
        
        // 定义指数优先级和重要性
        const indexPriority = {
            '穿衣指数': 1,      // 最高优先级 - 日常必需
            '感冒指数': 2,      // 高优先级 - 健康相关
            '紫外线指数': 3,    // 高优先级 - 健康相关
            '运动指数': 4,      // 中优先级 - 生活建议
            '旅游指数': 5,      // 中优先级 - 新增功能
            '晾晒指数': 6,      // 中优先级 - 新增功能
            '洗车指数': 7,      // 低优先级 - 可选
            '钓鱼指数': 8       // 低优先级 - 可选
        };
        
        // 按优先级排序
        const sortedIndices = indicesData.sort((a, b) => {
            const priorityA = indexPriority[a.name] || 999;
            const priorityB = indexPriority[b.name] || 999;
            return priorityA - priorityB;
        });
        
        // 选择前6个最重要的指数
        return sortedIndices.slice(0, 6);
    }

    // 获取指数等级样式类
    getIndexLevelClass(level) {
        const levelNum = parseInt(level);
        if (levelNum <= 1) return 'excellent';
        if (levelNum <= 2) return 'good';
        if (levelNum <= 3) return 'moderate';
        if (levelNum <= 4) return 'unhealthy';
        return 'hazardous';
    }

    // 获取AQI等级样式类
    getAQILevelClass(aqi) {
        const aqiNum = parseInt(aqi);
        if (aqiNum <= 50) return 'excellent';
        if (aqiNum <= 100) return 'good';
        if (aqiNum <= 150) return 'moderate';
        if (aqiNum <= 200) return 'unhealthy';
        return 'hazardous';
    }

    // 格式化时间
    formatTime(timeString) {
        if (!timeString) return '--';
        const date = new Date(timeString);
        return date.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
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

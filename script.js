// 常量配置
const TIME = {
    MINUTES_PER_DAY: 24 * 60,
    SECONDS_PER_DAY: 24 * 3600,
    UPDATE_INTERVAL: 1000
};


const DATES = {
    SALARY_DAY: 15,
    get COMPANY_HOLIDAY() {
        return getNextHoliday();
    }
};

// 计算最近的1月23日17:30
function getNextHoliday() {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), 0, 23, 17, 30);
    if (now > targetDate) {
        targetDate.setFullYear(targetDate.getFullYear() + 1);
    }
    return targetDate;
}

// 时间工具类
const TimeUtil = {
    // 获取当天0点的Date对象
    getTodayStart() {
        const now = new Date();
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);
        return todayStart;
    },

    // 获取本周一0点的Date对象
    getWeekStart() {
        const now = new Date();
        const weekStart = new Date(now);
        const daysFromMonday = (weekStart.getDay() + 6) % 7; // 转换为周一为第一天
        weekStart.setDate(now.getDate() - daysFromMonday);
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
    },

    // 计算经过的分钟数
    getElapsedMinutes(startTime, endTime) {
        return Math.floor((endTime - startTime) / (1000 * 60));
    },

    // 将总秒数转换为[天,时,分,秒]数组
    secondsToDHMS(totalSeconds) {
        const days = Math.floor(totalSeconds / TIME.SECONDS_PER_DAY);
        const hours = Math.floor((totalSeconds % TIME.SECONDS_PER_DAY) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return [days, hours, minutes, seconds];
    },

    // 将分钟数转换为[天,时,分]数组
    minutesToDHM(minutes) {
        const days = Math.floor(minutes / TIME.MINUTES_PER_DAY);
        const hours = Math.floor((minutes % TIME.MINUTES_PER_DAY) / 60);
        const mins = minutes % 60;
        return [days, hours, mins];
    },

    // 计算到目标日期的剩余秒数
    getSecondsTo(targetDate) {
        return Math.max(0, Math.floor((targetDate - new Date()) / 1000));
    }
};

// 进度计算工具类
const ProgressUtil = {
    // 计算基础进度
    calculate(elapsed, total) {
        return Math.min(100, Math.max(0, (elapsed / total) * 100));
    },

    // 计算节日进度
    calculateFestival(festivalDate) {
        const now = new Date();
        const timeDiff = festivalDate - now;
        
        // 如果节日已经过去，返回100%
        if (timeDiff <= 0) {
            return 100;
        }
        
        // 获取最近的上一个节日（默认为年初）
        const prevFestival = new Date(now.getFullYear(), 0, 1);
        
        // 计算从上一个节日到目标节日的总时间
        const totalDuration = festivalDate - prevFestival;
        // 计算从现在到目标节日的剩余时间
        const remainingDuration = festivalDate - now;
        
        // 计算已经过去的时间占比
        const progress = ((totalDuration - remainingDuration) / totalDuration) * 100;
        
        // 确保进度在0-100之间
        return Math.max(0, Math.min(100, progress));
    }
};

// 进度效果工具
const ProgressEffects = {
    milestones: [25, 50, 75, 90],
    
    // 初始化里程碑
    initializeMilestones(container) {
        if (!container.querySelector('.progress-milestone')) {
            this.milestones.forEach(point => {
                const milestone = document.createElement('div');
                milestone.className = 'progress-milestone';
                milestone.style.left = `${point}%`;
                container.appendChild(milestone);
            });
        }
    },

    // 更新里程碑状态
    updateMilestones(container, progress) {
        container.querySelectorAll('.progress-milestone').forEach(milestone => {
            const position = parseFloat(milestone.style.left);
            if (progress >= position) {
                if (!milestone.classList.contains('reached')) {
                    milestone.classList.add('reached');
                    milestone.style.animation = 'celebrate 0.5s ease';
                    setTimeout(() => {
                        milestone.style.animation = '';
                    }, 500);
                }
            } else {
                milestone.classList.remove('reached');
            }
        });
    },

    // 更新进度文字效果
    updateProgressText(textElement, progress) {
        if (progress > 95) {
            textElement.classList.add('near-complete');
        } else {
            textElement.classList.remove('near-complete');
        }
    }
};

// 获取相邻的两个春节日期
function getSpringFestivalDates() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // 使用 lunar.js 计算春节日期
    function getSpringDate(year) {
        // 农历正月初一就是春节
        const lunar = Lunar.fromYmd(year, 1, 1);
        const solar = lunar.getSolar();
        return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
    }
    
    // 获取今年和明年的春节日期
    const thisYearSpring = getSpringDate(currentYear);
    const nextYearSpring = getSpringDate(currentYear + 1);
    
    // 如果当前日期已过今年春节，返回今明两年的春节
    // 如果当前日期未到今年春节，返回去年和今年的春节
    if (now > thisYearSpring) {
        return {
            currentSpring: { year: currentYear, date: thisYearSpring },
            nextSpring: { year: currentYear + 1, date: nextYearSpring }
        };
    } else {
        const lastYearSpring = getSpringDate(currentYear - 1);
        return {
            currentSpring: { year: currentYear - 1, date: lastYearSpring },
            nextSpring: { year: currentYear, date: thisYearSpring }
        };
    }
}

// 获取下一个特定日期
function getNextFestival(month, day) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const festivalThisYear = new Date(currentYear, month - 1, day);
    
    // 如果今年的节日已过，返回明年的日期
    if (now > festivalThisYear) {
        return new Date(currentYear + 1, month - 1, day);
    }
    return festivalThisYear;
}

// 获取下一个儿童节日期（6月1日）
function getNextChildrenDay() {
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // 创建今年的儿童节日期
    const childrenDayThisYear = new Date(currentYear, 5, 1); // 6月1日，月份从0开始
    
    // 如果今年的儿童节还没到，返回今年的日期
    if (now < childrenDayThisYear) {
        return childrenDayThisYear;
    }
    
    // 如果今年的儿童节已过，返回明年的日期
    return new Date(currentYear + 1, 5, 1);
}

// 获取下一个二月最后一天
function getNextFebruaryLastDay() {
    const now = new Date();
    let year = now.getFullYear();
    
    // 如果当前月份已经过了2月，那么取下一年的2月
    if (now.getMonth() > 1) { // 0是一月，1是二月
        year += 1;
    }
    
    // 判断是否为闰年
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    const lastDay = isLeapYear ? 29 : 28;
    
    return {
        date: new Date(year, 1, lastDay),
        year
    };
}

// 获取下一个农历二月二十九（如果没有则是二十八）
function getNextLunarFebruarySpecialDay() {
    const now = new Date();
    const lunar = Lunar.fromDate(now);
    const currentYear = lunar.getYear();
    const currentMonth = lunar.getMonth();
    const currentDay = lunar.getDay();
    
    let targetYear = currentYear;
    // 如果当前已经过了农历二月，需要取下一年
    if (currentMonth > 2) {
        targetYear++;
    }
    // 如果当前是农历二月，但已经过了二十九日（或二十八日），需要取下一年
    else if (currentMonth === 2 && currentDay >= 29) {
        targetYear++;
    }
    
    // 获取目标年份的农历二月二十九日
    let targetLunar = new Lunar(targetYear, 2, 29);
    let solar = targetLunar.getSolar();
    
    // 如果农历二月二十九不存在，则取二十八日
    if (!solar) {
        targetLunar = new Lunar(targetYear, 2, 28);
        solar = targetLunar.getSolar();
    }
    
    return {
        date: new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay()),
        year: targetYear,
        lunar: targetLunar
    };
}

// DOM缓存工具类
const DOMCache = {
    cache: new Map(),
    
    // 获取缓存的DOM元素
    get(selector) {
        if (!this.cache.has(selector)) {
            this.cache.set(selector, document.querySelector(selector));
        }
        return this.cache.get(selector);
    },
    
    // 获取所有匹配的元素
    getAll(selector) {
        const cacheKey = `all:${selector}`;
        if (!this.cache.has(cacheKey)) {
            this.cache.set(cacheKey, document.querySelectorAll(selector));
        }
        return this.cache.get(cacheKey);
    },
    
    // 清除缓存
    clear() {
        this.cache.clear();
    },
    
    // 清除特定缓存
    clearSelector(selector) {
        this.cache.delete(selector);
        this.cache.delete(`all:${selector}`);
    }
};

// 卡片更新工具类
const CardUpdateUtil = {
    // 更新卡片内容
    updateCardContent(card, detailText, progress) {
        const detail = card.querySelector('.stat-detail');
        const progressBar = card.querySelector('.progress-bar');
        const progressText = card.querySelector('.progress-text');
        
        if (detail) detail.textContent = detailText;
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressText) progressText.textContent = `(${progress.toFixed(1)}%)`;
    },
    
    // 更新进度特效
    updateProgressEffects(card, progress) {
        const progressContainer = card.querySelector('.progress-container');
        const progressText = card.querySelector('.progress-text');
        
        if (progressContainer) {
            ProgressEffects.updateMilestones(progressContainer, progress);
        }
        if (progressText) {
            ProgressEffects.updateProgressText(progressText, progress);
        }
    },
    
    // 完整更新卡片（内容+特效）
    updateCard(card, detailText, progress, enableEffects = true) {
        this.updateCardContent(card, detailText, progress);
        if (enableEffects) {
            this.updateProgressEffects(card, progress);
        }
    },
    
    // 格式化倒计时文本
    formatCountdownText(days, hours, minutes, seconds, format = 'standard') {
        switch (format) {
            case 'compact':
                return `还剩 ${days}天${hours}小时${minutes}分钟${seconds}秒`;
            case 'detailed':
                return `还剩 ${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
            default:
                return `还剩 ${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
        }
    }
};

// 计算距离下班的时间（返回秒数）
function calculateTimeToOffWork() {
    const now = new Date();
    const today = now.getDay();
    
    // 如果是周末，返回0
    if (today === 0 || today === 6) {
        return 0;
    }
    
    // 设置今天的上下班时间
    const workStart = new Date(now);
    workStart.setHours(8, 30, 0, 0); // 上班时间8:30
    const workEnd = new Date(now);
    workEnd.setHours(17, 0, 0, 0); // 下班时间17:00
    
    // 如果未到上班时间，返回-1表示未上班
    if (now < workStart) {
        return -1;
    }
    
    // 如果已过下班时间，返回0表示已下班
    if (now >= workEnd) {
        return 0;
    }
    
    // 计算距离下班还有多少秒
    const remainingSeconds = Math.floor((workEnd - now) / 1000);
    return remainingSeconds;
}

// 计算下班倒计时进度
function calculateOffWorkProgress() {
    const now = new Date();
    const today = now.getDay();
    
    // 如果是周末，进度为100%
    if (today === 0 || today === 6) {
        return 100;
    }
    
    // 工作日的起止时间
    const workStart = new Date(now);
    workStart.setHours(8, 30, 0, 0);  // 上班时间8:30
    const workEnd = new Date(now);
    workEnd.setHours(17, 0, 0, 0);  // 下班时间17:00
    
    // 如果未到上班时间，进度为0
    if (now < workStart) {
        return 0;
    }
    
    // 如果已过下班时间，进度为100
    if (now >= workEnd) {
        return 100;
    }
    
    // 计算工作日进度
    const totalMinutes = TimeUtil.getElapsedMinutes(workStart, workEnd);
    const elapsedMinutes = TimeUtil.getElapsedMinutes(workStart, now);
    return (elapsedMinutes / totalMinutes) * 100;
}

// 格式化时间的辅助函数
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const weekDays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekDay = weekDays[date.getDay()];
    
    // 获取农历信息
    const lunar = Lunar.fromDate(date);
    const lunarYear = lunar.getYearInChinese();
    const lunarMonth = lunar.getMonthInChinese();
    const lunarDay = lunar.getDayInChinese();
    
    return {
        solar: `${year}年${month}月${day}日 ${weekDay} ${hours}:${minutes}:${seconds}`,
        lunar: `农历${lunarYear}年${lunarMonth}月${lunarDay}`
    };
}

function updateDateTime() {
    try {
        const now = new Date();
        let solarDateText = document.getElementById('solar-date-text');
        let lunarDateText = document.getElementById('lunar-date-text');
        
        // 如果元素不存在，创建它们
        if (!solarDateText) {
            const solarDate = document.getElementById('solar-date');
            if (solarDate) {
                solarDateText = document.createElement('span');
                solarDateText.id = 'solar-date-text';
                solarDate.appendChild(solarDateText);
            }
        }
        
        if (!lunarDateText) {
            const lunarDate = document.getElementById('lunar-date');
            if (lunarDate) {
                lunarDateText = document.createElement('span');
                lunarDateText.id = 'lunar-date-text';
                lunarDate.appendChild(lunarDateText);
            }
        }
        
        if (!solarDateText || !lunarDateText) {
            console.error('找不到日期显示元素:', {
                solarDateText: !!solarDateText,
                lunarDateText: !!lunarDateText
            });
            return;
        }

        // 格式化时分秒
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds}`;
        
        // 计算当前是第几周
        const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
        const pastDaysOfYear = (now - firstDayOfYear) / 86400000;
        const currentWeek = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);

        // 获取星座
        const zodiacSigns = [
            {name: "魔羯", start: [1, 1], end: [1, 19]},
            {name: "水瓶", start: [1, 20], end: [2, 18]},
            {name: "双鱼", start: [2, 19], end: [3, 20]},
            {name: "白羊", start: [3, 21], end: [4, 19]},
            {name: "金牛", start: [4, 20], end: [5, 20]},
            {name: "双子", start: [5, 21], end: [6, 21]},
            {name: "巨蟹", start: [6, 22], end: [7, 22]},
            {name: "狮子", start: [7, 23], end: [8, 22]},
            {name: "处女", start: [8, 23], end: [9, 22]},
            {name: "天秤", start: [9, 23], end: [10, 23]},
            {name: "天蝎", start: [10, 24], end: [11, 22]},
            {name: "射手", start: [11, 23], end: [12, 21]},
            {name: "魔羯", start: [12, 22], end: [12, 31]}
        ];
        
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const date = month * 100 + day;
        let zodiacSign = "魔羯";
        for (let sign of zodiacSigns) {
            const start = sign.start[0] * 100 + sign.start[1];
            const end = sign.end[0] * 100 + sign.end[1];
            if (date >= start && date <= end) {
                zodiacSign = sign.name;
                break;
            }
        }

        // 修改公历日期显示格式
        const dateStr = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日星期${['日', '一', '二', '三', '四', '五', '六'][now.getDay()]} ${hours}:${minutes}:${seconds} | 第${currentWeek}周 | ${zodiacSign}座`;
        solarDateText.textContent = dateStr;

        // 农历日期显示 - 简化格式
        const lunar = Lunar.fromDate(now);
        const lunarYear = lunar.getYearInChinese();
        const monthName = lunar.getMonthInChinese();
        const dayName = lunar.getDayInChinese();
        const term = lunar.getJieQi(); // 获取节气
        const animal = lunar.getYearShengXiao(); // 获取生肖
        const ganZhiYear = lunar.getYearInGanZhi(); // 获取年份天干地支
        const ganZhiMonth = lunar.getMonthInGanZhi(); // 获取月份天干地支
        const ganZhiDay = lunar.getDayInGanZhi(); // 获取日期天干地支
        
        // 组合农历日期字符串，使用更简洁的格式
        const lunarText = `农历${lunarYear}年 正月${dayName} ${ganZhiYear}年 ${ganZhiMonth}月 ${ganZhiDay}日 [属${animal}]`;
        lunarDateText.textContent = lunarText;

        console.log('更新日期成功:', {
            solar: solarDateText.textContent,
            lunar: lunarDateText.textContent
        });
    } catch (error) {
        console.error('更新日期时出错:', error);
    }
}

function createStatElement(title, detail, percent, className, targetTime = null) {
    const statDiv = document.createElement('div');
    statDiv.className = `stat-item ${className}`;
    
    let targetTimeHtml = '';
    if (targetTime) {
        targetTimeHtml = `<div class="target-time">${targetTime}</div>`;
    }
    
    statDiv.innerHTML = `
        <div class="stat-header">${title}</div>
        <div class="stat-detail">${detail}</div>
        <div class="progress-container">
            <div class="progress-bar" style="width: ${percent}%"></div>
        </div>
        <div class="progress-text">(${percent.toFixed(1)}%)</div>
        ${targetTimeHtml}
    `;

    return statDiv;
}

function updateStats() {
    const now = new Date();
    const statsContainer = document.getElementById('stats-container');
    
    // 如果容器为空，创建所有卡片
    if (!statsContainer.children.length) {
        // 今日进度计算
        const todayStart = TimeUtil.getTodayStart();
        const secondsToday = Math.floor((now - todayStart) / 1000);
        const [, hoursToday, minutesToday, secondsToday2] = TimeUtil.secondsToDHMS(secondsToday);
        const todayPercent = ProgressUtil.calculate(secondsToday, TIME.SECONDS_PER_DAY);

        // 本周进度计算
        const weekStart = TimeUtil.getWeekStart();
        const secondsThisWeek = Math.floor((now - weekStart) / 1000);
        const [weekDays, weekHours, weekMinutes, weekSeconds] = TimeUtil.secondsToDHMS(secondsThisWeek);
        const weekPercent = ProgressUtil.calculate(secondsThisWeek, 7 * TIME.SECONDS_PER_DAY);

        // 本月进度计算
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const secondsThisMonth = Math.floor((now - monthStart) / 1000);
        const [monthDays, monthHours, monthMinutes, monthSeconds] = TimeUtil.secondsToDHMS(secondsThisMonth);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const monthPercent = ProgressUtil.calculate(secondsThisMonth, daysInMonth * TIME.SECONDS_PER_DAY);

        // 今年进度计算
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const secondsThisYear = Math.floor((now - yearStart) / 1000);
        const [yearDays, yearHours, yearMinutes, yearSeconds] = TimeUtil.secondsToDHMS(secondsThisYear);
        const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() === 1;
        const daysInYear = isLeapYear ? 366 : 365;
        const yearPercent = ProgressUtil.calculate(secondsThisYear, daysInYear * TIME.SECONDS_PER_DAY);

        // 动态计算本月进度和今年进度的detail
        const monthDetail = `已过 ${monthDays} 天 ${monthHours} 小时 ${monthMinutes} 分钟`;
        const yearDetail = `已过 ${yearDays} 天 ${yearHours} 小时 ${yearMinutes} 分钟`;

        // 春节倒计时计算
        const { currentSpring, nextSpring } = getSpringFestivalDates();
        const secondsToSpring = TimeUtil.getSecondsTo(nextSpring.date);
        const [springDays, springHours, springMinutes, springSeconds] = TimeUtil.secondsToDHMS(secondsToSpring);
        const springProgress = ProgressUtil.calculateFestival(nextSpring.date);

        // 公司放假倒计时计算
        const companyHoliday = DATES.COMPANY_HOLIDAY;
        const secondsToCompanyHoliday = TimeUtil.getSecondsTo(companyHoliday);
        const [companyDays, companyHours, companyMinutes, companySeconds] = TimeUtil.secondsToDHMS(secondsToCompanyHoliday);
        const companyProgress = ProgressUtil.calculateFestival(companyHoliday);

        // 获取各个节日的下一个日期
        const nextValentine = getNextFestival(2, 14);  // 情人节
        const nextQingming = getNextFestival(4, 4);    // 清明节
        const nextLabor = getNextFestival(5, 1);       // 劳动节
        const nextNationalDay = getNextFestival(10, 1); // 国庆节

        // 计算各个节日的倒计时
        const secondsToValentine = TimeUtil.getSecondsTo(nextValentine);
        const secondsToQingming = TimeUtil.getSecondsTo(nextQingming);
        const secondsToLabor = TimeUtil.getSecondsTo(nextLabor);
        const secondsToNationalDay = TimeUtil.getSecondsTo(nextNationalDay);

        // 转换为天时分秒
        const [valentineDays, valentineHours, valentineMinutes, valentineSeconds] = TimeUtil.secondsToDHMS(secondsToValentine);
        const [qingmingDays, qingmingHours, qingmingMinutes, qingmingSeconds] = TimeUtil.secondsToDHMS(secondsToQingming);
        const [laborDays, laborHours, laborMinutes, laborSeconds] = TimeUtil.secondsToDHMS(secondsToLabor);
        const [nationalDays, nationalHours, nationalMinutes, nationalSeconds] = TimeUtil.secondsToDHMS(secondsToNationalDay);

        // 计算进度
        const valentineProgress = ProgressUtil.calculateFestival(nextValentine);
        const qingmingProgress = ProgressUtil.calculateFestival(nextQingming);
        const laborProgress = ProgressUtil.calculateFestival(nextLabor);
        const nationalDayProgress = ProgressUtil.calculateFestival(nextNationalDay);

        // 计算下班倒计时
        const secondsToOffWork = calculateTimeToOffWork();
        const [days, hours, minutes, seconds] = TimeUtil.secondsToDHMS(secondsToOffWork);
        const totalHours = days * 24 + hours;  // 将天数转换为小时并加到小时数中
        const offWorkProgress = calculateOffWorkProgress();

        // 计算发薪日倒计时
        const today = now.getDate();
        const salaryDay = DATES.SALARY_DAY;
        let salaryDetail, salaryProgress;
        
        // 计算到下个发薪日的时间
        const nextSalaryDate = new Date(now);
        if (today < salaryDay) {
            // 如果还没到这个月的15号，就用这个月的15号
            nextSalaryDate.setDate(salaryDay);
            nextSalaryDate.setHours(0, 0, 0, 0);
        } else {
            // 如果已经过了这个月的15号，就用下个月的15号
            nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
            nextSalaryDate.setDate(salaryDay);
            nextSalaryDate.setHours(0, 0, 0, 0);
        }
        
        if (today === salaryDay) {
            salaryDetail = "今日为发薪日";
            salaryProgress = 100;
        } else {
            const timeDiff = nextSalaryDate - now;
            const days = TimeFormatter.formatTimeNumber(timeDiff / (1000 * 60 * 60 * 24));
            const hours = TimeFormatter.formatTimeNumber((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = TimeFormatter.formatTimeNumber((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = TimeFormatter.formatTimeNumber((timeDiff % (1000 * 60)) / 1000);
            
            salaryDetail = `还剩 ${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
            
            // 计算进度：用过去的天数除以总天数
            const monthStart = new Date(nextSalaryDate);
            monthStart.setDate(salaryDay);
            monthStart.setMonth(monthStart.getMonth() - 1);
            const totalDays = (nextSalaryDate - monthStart) / (1000 * 60 * 60 * 24);
            const passedDays = totalDays - days - (hours + minutes/60 + seconds/3600)/24;
            salaryProgress = (passedDays / totalDays) * 100;
        }

        // 计算儿童节倒计时
        const childrenDay = getNextChildrenDay();
        const secondsToChildrenDay = TimeUtil.getSecondsTo(childrenDay);
        const [childrenDays, childrenHours, childrenMinutes, childrenSeconds] = TimeUtil.secondsToDHMS(secondsToChildrenDay);
        const childrenProgress = ProgressUtil.calculateFestival(childrenDay);

        // 获取下一个二月最后一天
        const februaryLastDayInfo = getNextFebruaryLastDay();
        const secondsToFebruaryLastDay = TimeUtil.getSecondsTo(februaryLastDayInfo.date);
        const [febDays, febHours, febMinutes, febSeconds] = TimeUtil.secondsToDHMS(secondsToFebruaryLastDay);
        const februaryLastDayProgress = ProgressUtil.calculateFestival(februaryLastDayInfo.date);

        // 获取下一个农历二月二十九（如果没有则是二十八）
        function getNextLunarFebruarySpecialDay() {
            const now = new Date();
            const lunar = Lunar.fromDate(now);
            const currentYear = lunar.getYear();
            const currentMonth = lunar.getMonth();
            const currentDay = lunar.getDay();
            
            let targetYear = currentYear;
            // 如果当前已经过了农历二月，需要取下一年
            if (currentMonth > 2) {
                targetYear++;
            }
            // 如果当前是农历二月，但已经过了二十九日（或二十八日），需要取下一年
            else if (currentMonth === 2 && currentDay >= 29) {
                targetYear++;
            }
            else if (currentMonth === 2 && currentDay >= 28) {
                // 检查今年农历二月是否有二十九日
                try {
                    const testDate = Lunar.fromYmd(currentYear, 2, 29);
                    const solarDate = testDate.getSolar();
                    const testSolarDate = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
                    
                    // 如果已经过了二十八日，且今年没有二十九日，取下一年
                    if (Lunar.fromDate(testSolarDate).getMonth() !== 2) {
                        targetYear++;
                    }
                } catch {
                    targetYear++;
                }
            }
            
            try {
                // 尝试获取农历二月二十九
                let targetLunar;
                let targetDay = 29;
                try {
                    targetLunar = Lunar.fromYmd(targetYear, 2, 29);
                    const solarDate = targetLunar.getSolar();
                    const solarDateTime = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
                    
                    // 检查是否是有效的农历日期
                    const checkLunar = Lunar.fromDate(solarDateTime);
                    if (checkLunar.getMonth() !== 2) {
                        targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                        targetDay = 28;
                    }
                } catch {
                    targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                    targetDay = 28;
                }
                
                // 获取对应的公历日期
                const solarDate = targetLunar.getSolar();
                const solarDateTime = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
                
                // 如果计算出的日期在当前日期之前，取下一年
                if (solarDateTime < now) {
                    targetYear++;
                    try {
                        targetLunar = Lunar.fromYmd(targetYear, 2, 29);
                        const nextSolar = targetLunar.getSolar();
                        const nextDateTime = new Date(nextSolar.getYear(), nextSolar.getMonth() - 1, nextSolar.getDay());
                        const checkNextLunar = Lunar.fromDate(nextDateTime);
                        
                        if (checkNextLunar.getMonth() === 2) {
                            solarDateTime.setTime(nextDateTime.getTime());
                            targetDay = 29;
                        } else {
                            targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                            const finalSolar = targetLunar.getSolar();
                            solarDateTime.setFullYear(finalSolar.getYear());
                            solarDateTime.setMonth(finalSolar.getMonth() - 1);
                            solarDateTime.setDate(finalSolar.getDay());
                            targetDay = 28;
                        }
                    } catch {
                        targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                        const finalSolar = targetLunar.getSolar();
                        solarDateTime.setFullYear(finalSolar.getYear());
                        solarDateTime.setMonth(finalSolar.getMonth() - 1);
                        solarDateTime.setDate(finalSolar.getDay());
                        targetDay = 28;
                    }
                }
                
                return {
                    date: solarDateTime,
                    year: targetLunar.getYearInChinese(),
                    month: targetLunar.getMonthInChinese(),
                    day: targetLunar.getDayInChinese(),
                    solarYear: solarDateTime.getFullYear(),
                    targetDay: targetDay
                };
            } catch (error) {
                console.error('Error calculating lunar February special day:', error);
                // 返回一个默认值，使用公历2月28日作为后备
                const fallbackDate = new Date(targetYear, 1, 28);
                return {
                    date: fallbackDate,
                    year: targetYear.toString(),
                    month: '二',
                    day: '二十八',
                    solarYear: targetYear,
                    targetDay: 28
                };
            }
        }

        // 获取农历二月特殊日期信息
        const lunarFebruaryInfo = getNextLunarFebruarySpecialDay();
        const secondsToLunarFebruary = TimeUtil.getSecondsTo(lunarFebruaryInfo.date);
        const [lunarFebDays, lunarFebHours, lunarFebMinutes, lunarFebSeconds] = TimeUtil.secondsToDHMS(secondsToLunarFebruary);
        const lunarFebruaryProgress = ProgressUtil.calculateFestival(lunarFebruaryInfo.date);

        // 获取中秋节日期（农历八月十五）
        const midAutumnDay = getNextLunarFestival(8, 15);
        const secondsToMidAutumn = TimeUtil.getSecondsTo(midAutumnDay);
        const [midAutumnDays, midAutumnHours, midAutumnMinutes, midAutumnSeconds] = TimeUtil.secondsToDHMS(secondsToMidAutumn);
        const midAutumnProgress = ProgressUtil.calculateFestival(midAutumnDay);

        // 在 updateStats 函数中的 stats 数组里添加端午节卡片配置
        // 找到创建统计项的位置，在 stats 数组中添加：

        const dragonBoatDay = getNextLunarFestival(5, 5); // 农历五月初五是端午节
        const secondsToDragonBoat = TimeUtil.getSecondsTo(dragonBoatDay);
        const [dragonBoatDays, dragonBoatHours, dragonBoatMinutes, dragonBoatSeconds] = TimeUtil.secondsToDHMS(secondsToDragonBoat);
        const dragonBoatProgress = ProgressUtil.calculateFestival(dragonBoatDay);

        // 创建统计项
        const stats = [
            {
                title: "今日进度",
                detail: `已过 ${hoursToday} 小时 ${minutesToday} 分钟 ${secondsToday2} 秒`,
                percent: todayPercent,
                className: "today"
            },
            {
                title: "本周进度",
                detail: `已过 ${weekDays} 天 ${weekHours} 小时 ${weekMinutes} 分钟`,
                percent: weekPercent,
                className: "week"
            },
            {
                title: "本月进度",
                detail: monthDetail,
                percent: monthPercent,
                className: "month",
                isDynamic: true
            },
            {
                title: "今年进度",
                detail: yearDetail,
                percent: yearPercent,
                className: "year",
                isDynamic: true
            },
            {
                title: `${nextSpring.year}年春节倒计时`,
                detail: `还剩 ${springDays} 天 ${springHours} 小时 ${springMinutes} 分钟`,
                percent: springProgress,
                className: "spring-festival",
                targetTime: `春节: ${nextSpring.date.getMonth() + 1}月${nextSpring.date.getDate()}日`
            },
            {
                title: `${nextValentine.getFullYear()}年情人节倒计时`,
                detail: `还剩 ${valentineDays} 天 ${valentineHours} 小时 ${valentineMinutes} 分钟`,
                percent: valentineProgress,
                className: "valentines-day",
                targetTime: `情人节: ${nextValentine.getMonth() + 1}月${nextValentine.getDate()}日`
            },
            {
                title: `${nextQingming.getFullYear()}年清明倒计时`,
                detail: `还剩 ${qingmingDays} 天 ${qingmingHours} 小时 ${qingmingMinutes} 分钟`,
                percent: qingmingProgress,
                className: "qingming-festival",
                targetTime: `清明: ${nextQingming.getMonth() + 1}月${nextQingming.getDate()}日`
            },
            {
                title: `${nextLabor.getFullYear()}年劳动节倒计时`,
                detail: `还剩 ${laborDays} 天 ${laborHours} 小时 ${laborMinutes} 分钟`,
                percent: laborProgress,
                className: "labor-day",
                targetTime: `劳动节: ${nextLabor.getMonth() + 1}月${nextLabor.getDate()}日`
            },
            {
                title: `${nextNationalDay.getFullYear()}年国庆节倒计时`,
                detail: `还剩 ${nationalDays}天 ${nationalHours}小时 ${nationalMinutes}分钟`,
                percent: nationalDayProgress,
                className: "national-day",
                targetTime: `国庆节: ${nextNationalDay.getMonth() + 1}月${nextNationalDay.getDate()}日`
            },
            {
                title: `${childrenDay.getFullYear()}年儿童节倒计时`,
                detail: `还剩 ${childrenDays}天 ${childrenHours}小时 ${childrenMinutes}分钟`,
                percent: childrenProgress,
                className: "children-day",
                targetTime: `儿童节: ${childrenDay.getMonth() + 1}月${childrenDay.getDate()}日`
            },
            {
                title: "距离下班",
                detail: secondsToOffWork === -1 
                    ? "今天还未到上班时间" 
                    : secondsToOffWork === 0 
                    ? "今日已下班，请好好休息" 
                    : `还剩 ${totalHours} 小时 ${minutes} 分钟 ${seconds} 秒`,
                percent: offWorkProgress,
                className: "off-work",
                targetTime: "下班时间: 17:00"
            },
            {
                title: "距离下一个发薪日",
                detail: salaryDetail,
                percent: salaryProgress,
                className: "salary",
                targetTime: `发薪日: ${salaryDay}日`
            },
            {
                title: `${februaryLastDayInfo.year}年2月${februaryLastDayInfo.isLeapYear ? '29' : '28'}日倒计时`,
                detail: `还剩 ${febDays}天${febHours}小时${febMinutes}分钟`,
                percent: februaryLastDayProgress,
                className: "february-last-day",
                targetTime: `2月${februaryLastDayInfo.isLeapYear ? '29' : '28'}日`
            },
            {
                title: `${lunarFebruaryInfo.solarYear}年农历2月${lunarFebruaryInfo.targetDay}日倒计时`,
                detail: `还剩 ${lunarFebDays}天${lunarFebHours}小时${lunarFebMinutes}分钟`,
                percent: lunarFebruaryProgress,
                className: "lunar-february-last-day",
                targetTime: `农历2月${lunarFebruaryInfo.targetDay}日`
            },
            {
                title: `${midAutumnDay.getFullYear()}年中秋节倒计时`,
                detail: `还剩 ${midAutumnDays}天 ${midAutumnHours}小时 ${midAutumnMinutes}分钟`,
                percent: midAutumnProgress,
                className: "mid-autumn",
                targetTime: `中秋节: ${midAutumnDay.getMonth() + 1}月${midAutumnDay.getDate()}日`
            },
            {
                title: `${dragonBoatDay.getFullYear()}年端午节倒计时`,
                detail: `还剩 ${dragonBoatDays}天 ${dragonBoatHours}小时 ${dragonBoatMinutes}分钟`,
                percent: dragonBoatProgress,
                className: "dragon-boat-festival",
                targetTime: `端午节: ${dragonBoatDay.getMonth() + 1}月${dragonBoatDay.getDate()}日`
            }
        ];

        // 定义进度类型的卡片
        const progressTypes = ['today', 'week', 'month', 'year'];

        // 按照剩余时间排序卡片
        stats.sort((a, b) => {
            // 首先保证进度类型的卡片在最前
            if (progressTypes.some(type => a.className.includes(type))) return -1;
            if (progressTypes.some(type => b.className.includes(type))) return 1;

            // 提取剩余时间并转换为秒
            const extractRemainingSeconds = (detail) => {
                const dayMatch = detail.match(/还剩\s*(\d+)\s*天/);
                const hourMatch = detail.match(/(\d+)\s*小时/);
                const minuteMatch = detail.match(/(\d+)\s*分钟/);
                const secondMatch = detail.match(/(\d+)\s*秒/);

                let totalSeconds = 0;
                if (dayMatch) totalSeconds += parseInt(dayMatch[1]) * 24 * 3600;
                if (hourMatch) totalSeconds += parseInt(hourMatch[1]) * 3600;
                if (minuteMatch) totalSeconds += parseInt(minuteMatch[1]) * 60;
                if (secondMatch) totalSeconds += parseInt(secondMatch[1]);

                return totalSeconds;
            };

            const remainingSecondsA = extractRemainingSeconds(a.detail);
            const remainingSecondsB = extractRemainingSeconds(b.detail);

            return remainingSecondsA - remainingSecondsB;
        });

        // 清空容器
        statsContainer.innerHTML = '';

        // 创建并添加所有统计项
        stats.forEach(stat => {
            const element = createStatElement(
                stat.title,
                stat.detail,
                stat.percent,
                stat.className,
                stat.targetTime
            );
            statsContainer.appendChild(element);
        });
    } else {
        // 只更新现有卡片的内容
        const cards = statsContainer.querySelectorAll('.stat-item');
        cards.forEach(card => {
            const header = card.querySelector('.stat-header');
            const detail = card.querySelector('.stat-detail');
            const progressContainer = card.querySelector('.progress-container');
            const progressBar = card.querySelector('.progress-bar');
            const progressText = card.querySelector('.progress-text');

            if (card.classList.contains('today')) {
                const todayStart = TimeUtil.getTodayStart();
                const secondsToday = Math.floor((now - todayStart) / 1000);
                const [, hoursToday, minutesToday, secondsToday2] = TimeUtil.secondsToDHMS(secondsToday);
                const todayPercent = ProgressUtil.calculate(secondsToday, TIME.SECONDS_PER_DAY);

                detail.textContent = `已过 ${hoursToday} 小时 ${minutesToday} 分钟 ${secondsToday2} 秒`;
                progressBar.style.width = `${todayPercent}%`;
                progressText.textContent = `(${todayPercent.toFixed(1)}%)`;
            } else if (card.classList.contains('week')) {
                const weekStart = TimeUtil.getWeekStart();
                const secondsThisWeek = Math.floor((now - weekStart) / 1000);
                const [weekDays, weekHours, weekMinutes, weekSeconds] = TimeUtil.secondsToDHMS(secondsThisWeek);
                const weekPercent = ProgressUtil.calculate(secondsThisWeek, 7 * TIME.SECONDS_PER_DAY);

                detail.textContent = `已过 ${weekDays} 天 ${weekHours} 小时 ${weekMinutes} 分钟`;
                progressBar.style.width = `${weekPercent}%`;
                progressText.textContent = `(${weekPercent.toFixed(1)}%)`;
            } else if (card.classList.contains('month')) {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                const secondsThisMonth = Math.floor((now - monthStart) / 1000);
                const [monthDays, monthHours, monthMinutes, monthSeconds] = TimeUtil.secondsToDHMS(secondsThisMonth);
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const monthPercent = ProgressUtil.calculate(secondsThisMonth, daysInMonth * TIME.SECONDS_PER_DAY);

                detail.textContent = `已过 ${monthDays} 天 ${monthHours} 小时 ${monthMinutes} 分钟`;
                progressBar.style.width = `${monthPercent}%`;
                progressText.textContent = `(${monthPercent.toFixed(1)}%)`;
            } else if (card.classList.contains('year')) {
                const yearStart = new Date(now.getFullYear(), 0, 1);
                const secondsThisYear = Math.floor((now - yearStart) / 1000);
                const [yearDays, yearHours, yearMinutes, yearSeconds] = TimeUtil.secondsToDHMS(secondsThisYear);
                const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() === 1;
                const daysInYear = isLeapYear ? 366 : 365;
                const yearPercent = ProgressUtil.calculate(secondsThisYear, daysInYear * TIME.SECONDS_PER_DAY);

                detail.textContent = `已过 ${yearDays} 天 ${yearHours} 小时 ${yearMinutes} 分钟`;
                progressBar.style.width = `${yearPercent}%`;
                progressText.textContent = `(${yearPercent.toFixed(1)}%)`;
            } else if (card.classList.contains('spring-festival')) {
                const { currentSpring, nextSpring } = getSpringFestivalDates();
                const secondsToSpring = TimeUtil.getSecondsTo(nextSpring.date);
                const [springDays, springHours, springMinutes, springSeconds] = TimeUtil.secondsToDHMS(secondsToSpring);
                const springProgress = ProgressUtil.calculateFestival(nextSpring.date);

                detail.textContent = `还剩 ${springDays} 天 ${springHours} 小时 ${springMinutes} 分钟`;
                progressBar.style.width = `${springProgress}%`;
                progressText.textContent = `(${springProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('valentines-day')) {
                const nextValentine = getNextFestival(2, 14);
                const secondsToValentine = TimeUtil.getSecondsTo(nextValentine);
                const [valentineDays, valentineHours, valentineMinutes, valentineSeconds] = TimeUtil.secondsToDHMS(secondsToValentine);
                const valentineProgress = ProgressUtil.calculateFestival(nextValentine);

                detail.textContent = `还剩 ${valentineDays} 天 ${valentineHours} 小时 ${valentineMinutes} 分钟`;
                progressBar.style.width = `${valentineProgress}%`;
                progressText.textContent = `(${valentineProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('qingming-festival')) {
                const nextQingming = Lunar.fromDate(now).getNextJieQi(true);
                const qingmingSolar = nextQingming.getSolar();
                const qingmingDate = new Date(
                    qingmingSolar.getYear(), 
                    qingmingSolar.getMonth() - 1, 
                    qingmingSolar.getDay()
                );
                const secondsToQingming = TimeUtil.getSecondsTo(qingmingDate);
                const [qingmingDays, qingmingHours, qingmingMinutes, qingmingSeconds] = TimeUtil.secondsToDHMS(secondsToQingming);
                const qingmingProgress = ProgressUtil.calculateFestival(qingmingDate);

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, qingmingProgress);
                ProgressEffects.updateProgressText(progressText, qingmingProgress);

                detail.textContent = `还剩 ${qingmingDays} 天 ${qingmingHours} 小时 ${qingmingMinutes} 分钟`;
                progressBar.style.width = `${qingmingProgress}%`;
                progressText.textContent = `(${qingmingProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('labor-day')) {
                const nextLabor = getNextFestival(5, 1);
                const secondsToLabor = TimeUtil.getSecondsTo(nextLabor);
                const [laborDays, laborHours, laborMinutes, laborSeconds] = TimeUtil.secondsToDHMS(secondsToLabor);
                const laborProgress = ProgressUtil.calculateFestival(nextLabor);

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, laborProgress);
                ProgressEffects.updateProgressText(progressText, laborProgress);

                detail.textContent = `还剩 ${laborDays} 天 ${laborHours} 小时 ${laborMinutes} 分钟`;
                progressBar.style.width = `${laborProgress}%`;
                progressText.textContent = `(${laborProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('national-day')) {
                const nextNationalDay = getNextFestival(10, 1);
                const secondsToNationalDay = TimeUtil.getSecondsTo(nextNationalDay);
                const [nationalDays, nationalHours, nationalMinutes, nationalSeconds] = TimeUtil.secondsToDHMS(secondsToNationalDay);
                const nationalDayProgress = ProgressUtil.calculateFestival(nextNationalDay);

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, nationalDayProgress);
                ProgressEffects.updateProgressText(progressText, nationalDayProgress);

                detail.textContent = `还剩 ${nationalDays}天 ${nationalHours}小时 ${nationalMinutes}分钟`;
                progressBar.style.width = `${nationalDayProgress}%`;
                progressText.textContent = `(${nationalDayProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('children-day')) {
                const childrenDay = getNextChildrenDay();
                const secondsToChildrenDay = TimeUtil.getSecondsTo(childrenDay);
                const [childrenDays, childrenHours, childrenMinutes, childrenSeconds] = TimeUtil.secondsToDHMS(secondsToChildrenDay);
                const childrenProgress = ProgressUtil.calculateFestival(childrenDay);

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, childrenProgress);
                ProgressEffects.updateProgressText(progressText, childrenProgress);

                detail.textContent = `还剩 ${childrenDays}天 ${childrenHours}小时 ${childrenMinutes}分钟`;
                progressBar.style.width = `${childrenProgress}%`;
                progressText.textContent = `(${childrenProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('off-work')) {
                const secondsToOffWork = calculateTimeToOffWork();
                const [days, hours, minutes, seconds] = TimeUtil.secondsToDHMS(secondsToOffWork);
                const totalHours = days * 24 + hours;  // 将天数转换为小时并加到小时数中
                const offWorkProgress = calculateOffWorkProgress();

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, offWorkProgress);
                ProgressEffects.updateProgressText(progressText, offWorkProgress);

                detail.textContent = secondsToOffWork === -1 
                    ? "今天还未到上班时间" 
                    : secondsToOffWork === 0 
                    ? "今日已下班，请好好休息" 
                    : `还剩 ${totalHours} 小时 ${minutes} 分钟 ${seconds} 秒`;
                progressBar.style.width = `${offWorkProgress}%`;
                progressText.textContent = `(${offWorkProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('salary')) {
                const today = now.getDate();
                const salaryDay = DATES.SALARY_DAY;
                let salaryDetail, salaryProgress;
                
                const nextSalaryDate = new Date(now);
                if (today < salaryDay) {
                    nextSalaryDate.setDate(salaryDay);
                    nextSalaryDate.setHours(0, 0, 0, 0);
                } else {
                    nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
                    nextSalaryDate.setDate(salaryDay);
                    nextSalaryDate.setHours(0, 0, 0, 0);
                }
                
                if (today === salaryDay) {
                    salaryDetail = "今日为发薪日";
                    salaryProgress = 100;
                } else {
                    const timeDiff = nextSalaryDate - now;
                    const days = TimeFormatter.formatTimeNumber(timeDiff / (1000 * 60 * 60 * 24));
                    const hours = TimeFormatter.formatTimeNumber((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                    const minutes = TimeFormatter.formatTimeNumber((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = TimeFormatter.formatTimeNumber((timeDiff % (1000 * 60)) / 1000);
                    
                    salaryDetail = `还剩 ${days}天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
                    
                    const monthStart = new Date(nextSalaryDate);
                    monthStart.setDate(salaryDay);
                    monthStart.setMonth(monthStart.getMonth() - 1);
                    const totalDays = (nextSalaryDate - monthStart) / (1000 * 60 * 60 * 24);
                    const passedDays = totalDays - days - (hours + minutes/60 + seconds/3600)/24;
                    salaryProgress = (passedDays / totalDays) * 100;
                }

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, salaryProgress);
                ProgressEffects.updateProgressText(progressText, salaryProgress);

                detail.textContent = salaryDetail;
                progressBar.style.width = `${salaryProgress}%`;
                progressText.textContent = `(${salaryProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('february-last-day')) {
                function getNextFebruaryLastDay() {
                    const now = new Date();
                    let year = now.getFullYear();
                    
                    // 如果当前月份已经过了2月，那么取下一年的2月
                    if (now.getMonth() > 1) { // 0是一月，1是二月
                        year += 1;
                    }
                    
                    // 判断是否为闰年
                    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                    const lastDay = isLeapYear ? 29 : 28;
                    
                    return {
                        date: new Date(year, 1, lastDay),
                        isLeapYear,
                        year
                    };
                }

                const februaryLastDayInfo = getNextFebruaryLastDay();
                const secondsToFebruaryLastDay = TimeUtil.getSecondsTo(februaryLastDayInfo.date);
                const [febDays, febHours, febMinutes, febSeconds] = TimeUtil.secondsToDHMS(secondsToFebruaryLastDay);
                const februaryLastDayProgress = ProgressUtil.calculateFestival(februaryLastDayInfo.date);

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, februaryLastDayProgress);
                detail.textContent = `还剩 ${febDays} 天 ${febHours} 小时 ${febMinutes} 分钟`;
                progressBar.style.width = `${februaryLastDayProgress}%`;
                progressText.textContent = `(${februaryLastDayProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('lunar-february-last-day')) {
                function getNextLunarFebruarySpecialDay() {
                    const lunar = Lunar.fromDate(now);
                    const currentYear = lunar.getYear();
                    const currentMonth = lunar.getMonth();
                    const currentDay = lunar.getDay();
                    
                    let targetYear = currentYear;
                    if (currentMonth > 2) {
                        targetYear++;
                    }
                    else if (currentMonth === 2 && currentDay >= 29) {
                        targetYear++;
                    }
                    else if (currentMonth === 2 && currentDay >= 28) {
                        try {
                            const testDate = Lunar.fromYmd(currentYear, 2, 29);
                            const solarDate = testDate.getSolar();
                            const testSolarDate = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
                            
                            if (Lunar.fromDate(testSolarDate).getMonth() !== 2) {
                                targetYear++;
                            }
                        } catch {
                            targetYear++;
                        }
                    }
                    
                    try {
                        let targetLunar;
                        let targetDay = 29;
                        try {
                            targetLunar = Lunar.fromYmd(targetYear, 2, 29);
                            const solarDate = targetLunar.getSolar();
                            const solarDateTime = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
                            
                            const checkLunar = Lunar.fromDate(solarDateTime);
                            if (checkLunar.getMonth() !== 2) {
                                targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                                targetDay = 28;
                            }
                        } catch {
                            targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                            targetDay = 28;
                        }
                        
                        const solarDate = targetLunar.getSolar();
                        const solarDateTime = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
                        
                        if (solarDateTime < now) {
                            targetYear++;
                            try {
                                targetLunar = Lunar.fromYmd(targetYear, 2, 29);
                                const nextSolar = targetLunar.getSolar();
                                const nextDateTime = new Date(nextSolar.getYear(), nextSolar.getMonth() - 1, nextSolar.getDay());
                                const checkNextLunar = Lunar.fromDate(nextDateTime);
                                
                                if (checkNextLunar.getMonth() === 2) {
                                    solarDateTime.setTime(nextDateTime.getTime());
                                    targetDay = 29;
                                } else {
                                    targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                                    const finalSolar = targetLunar.getSolar();
                                    solarDateTime.setFullYear(finalSolar.getYear());
                                    solarDateTime.setMonth(finalSolar.getMonth() - 1);
                                    solarDateTime.setDate(finalSolar.getDay());
                                    targetDay = 28;
                                }
                            } catch {
                                targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                                const finalSolar = targetLunar.getSolar();
                                solarDateTime.setFullYear(finalSolar.getYear());
                                solarDateTime.setMonth(finalSolar.getMonth() - 1);
                                solarDateTime.setDate(finalSolar.getDay());
                                targetDay = 28;
                            }
                        }
                        
                        return {
                            date: solarDateTime,
                            year: targetLunar.getYearInChinese(),
                            month: targetLunar.getMonthInChinese(),
                            day: targetLunar.getDayInChinese(),
                            solarYear: solarDateTime.getFullYear(),
                            targetDay: targetDay
                        };
                    } catch (error) {
                        console.error('Error calculating lunar February special day:', error);
                        const fallbackDate = new Date(targetYear, 1, 28);
                        return {
                            date: fallbackDate,
                            year: targetYear.toString(),
                            month: '二',
                            day: '二十八',
                            solarYear: targetYear,
                            targetDay: 28
                        };
                    }
                }

                const lunarFebruaryInfo = getNextLunarFebruarySpecialDay();
                const secondsToLunarFebruary = TimeUtil.getSecondsTo(lunarFebruaryInfo.date);
                const [lunarFebDays, lunarFebHours, lunarFebMinutes, lunarFebSeconds] = TimeUtil.secondsToDHMS(secondsToLunarFebruary);
                const lunarFebruaryProgress = ProgressUtil.calculateFestival(lunarFebruaryInfo.date);

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, lunarFebruaryProgress);
                detail.textContent = `还剩 ${lunarFebDays} 天 ${lunarFebHours} 小时 ${lunarFebMinutes} 分钟`;
                progressBar.style.width = `${lunarFebruaryProgress}%`;
                progressText.textContent = `(${lunarFebruaryProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('mid-autumn')) {
                const midAutumnDay = getNextLunarFestival(8, 15);
                const secondsToMidAutumn = TimeUtil.getSecondsTo(midAutumnDay);
                const [midAutumnDays, midAutumnHours, midAutumnMinutes, midAutumnSeconds] = TimeUtil.secondsToDHMS(secondsToMidAutumn);
                const midAutumnProgress = ProgressUtil.calculateFestival(midAutumnDay);

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, midAutumnProgress);
                detail.textContent = `还剩 ${midAutumnDays} 天 ${midAutumnHours}小时 ${midAutumnMinutes} 分钟`;
                progressBar.style.width = `${midAutumnProgress}%`;
                progressText.textContent = `(${midAutumnProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('dragon-boat-festival')) {
                const dragonBoatDay = getNextLunarFestival(5, 5);
                const secondsToDragonBoat = TimeUtil.getSecondsTo(dragonBoatDay);
                const [dragonBoatDays, dragonBoatHours, dragonBoatMinutes, dragonBoatSeconds] = TimeUtil.secondsToDHMS(secondsToDragonBoat);
                const dragonBoatProgress = ProgressUtil.calculateFestival(dragonBoatDay);

                // 更新里程碑和特效
                ProgressEffects.updateMilestones(progressContainer, dragonBoatProgress);
                detail.textContent = `还剩 ${dragonBoatDays} 天 ${dragonBoatHours} 小时 ${dragonBoatMinutes} 分钟`;
                progressBar.style.width = `${dragonBoatProgress}%`;
                progressText.textContent = `(${dragonBoatProgress.toFixed(1)}%)`;
            }
        });
    }

    // 更新所有卡片的进度条特效
    document.querySelectorAll('.stat-item').forEach(card => {
        const progressContainer = card.querySelector('.progress-container');
        const progressBar = card.querySelector('.progress-bar');
        const progressText = card.querySelector('.progress-text');
        
        // 初始化里程碑
        ProgressEffects.initializeMilestones(progressContainer);

        if (card.classList.contains('today')) {
            const todayStart = new Date(now);
            todayStart.setHours(0, 0, 0, 0);
            const secondsToday = Math.floor((now - todayStart) / 1000);
            const [, hoursToday, minutesToday, secondsToday2] = TimeUtil.secondsToDHMS(secondsToday);
            const todayPercent = ProgressUtil.calculate(secondsToday, TIME.SECONDS_PER_DAY);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `已过 ${hoursToday} 小时 ${minutesToday} 分钟 ${secondsToday2} 秒`;
            progressBar.style.width = `${todayPercent}%`;
            progressText.textContent = `(${todayPercent.toFixed(1)}%)`;
        } else if (card.classList.contains('week')) {
            const weekStart = TimeUtil.getWeekStart();
            const secondsThisWeek = Math.floor((now - weekStart) / 1000);
            const [weekDays, weekHours, weekMinutes, weekSeconds] = TimeUtil.secondsToDHMS(secondsThisWeek);
            const weekPercent = ProgressUtil.calculate(secondsThisWeek, 7 * TIME.SECONDS_PER_DAY);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, weekPercent);
            ProgressEffects.updateProgressText(progressText, weekPercent);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `已过 ${weekDays} 天 ${weekHours} 小时 ${weekMinutes} 分钟`;
            progressBar.style.width = `${weekPercent}%`;
            progressText.textContent = `(${weekPercent.toFixed(1)}%)`;
        } else if (card.classList.contains('month')) {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const secondsThisMonth = Math.floor((now - monthStart) / 1000);
            const [monthDays, monthHours, monthMinutes, monthSeconds] = TimeUtil.secondsToDHMS(secondsThisMonth);
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const monthPercent = ProgressUtil.calculate(secondsThisMonth, daysInMonth * TIME.SECONDS_PER_DAY);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, monthPercent);
            ProgressEffects.updateProgressText(progressText, monthPercent);

            detail.textContent = `已过 ${monthDays} 天 ${monthHours} 小时 ${monthMinutes} 分钟`;
            progressBar.style.width = `${monthPercent}%`;
            progressText.textContent = `(${monthPercent.toFixed(1)}%)`;
        } else if (card.classList.contains('year')) {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const secondsThisYear = Math.floor((now - yearStart) / 1000);
            const [yearDays, yearHours, yearMinutes, yearSeconds] = TimeUtil.secondsToDHMS(secondsThisYear);
            const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() === 1;
            const daysInYear = isLeapYear ? 366 : 365;
            const yearPercent = ProgressUtil.calculate(secondsThisYear, daysInYear * TIME.SECONDS_PER_DAY);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, yearPercent);
            ProgressEffects.updateProgressText(progressText, yearPercent);

            detail.textContent = `已过 ${yearDays} 天 ${yearHours} 小时 ${yearMinutes} 分钟`;
            progressBar.style.width = `${yearPercent}%`;
            progressText.textContent = `(${yearPercent.toFixed(1)}%)`;
        } else if (card.classList.contains('spring-festival')) {
            const { currentSpring, nextSpring } = getSpringFestivalDates();
            const secondsToSpring = TimeUtil.getSecondsTo(nextSpring.date);
            const [springDays, springHours, springMinutes, springSeconds] = TimeUtil.secondsToDHMS(secondsToSpring);
            const springProgress = ProgressUtil.calculateFestival(nextSpring.date);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${springDays} 天 ${springHours} 小时 ${springMinutes} 分钟`;
            progressBar.style.width = `${springProgress}%`;
            progressText.textContent = `(${springProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('valentines-day')) {
            const nextValentine = getNextFestival(2, 14);
            const secondsToValentine = TimeUtil.getSecondsTo(nextValentine);
            const [valentineDays, valentineHours, valentineMinutes, valentineSeconds] = TimeUtil.secondsToDHMS(secondsToValentine);
            const valentineProgress = ProgressUtil.calculateFestival(nextValentine);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${valentineDays} 天 ${valentineHours} 小时 ${valentineMinutes} 分钟`;
            progressBar.style.width = `${valentineProgress}%`;
            progressText.textContent = `(${valentineProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('qingming-festival')) {
            const nextQingming = Lunar.fromDate(now).getNextJieQi(true);
            const qingmingSolar = nextQingming.getSolar();
            const qingmingDate = new Date(
                qingmingSolar.getYear(), 
                qingmingSolar.getMonth() - 1, 
                qingmingSolar.getDay()
            );
            const secondsToQingming = TimeUtil.getSecondsTo(qingmingDate);
            const [qingmingDays, qingmingHours, qingmingMinutes, qingmingSeconds] = TimeUtil.secondsToDHMS(secondsToQingming);
            const qingmingProgress = ProgressUtil.calculateFestival(qingmingDate);

            detail.textContent = `还剩 ${qingmingDays} 天 ${qingmingHours} 小时 ${qingmingMinutes} 分钟`;
            progressBar.style.width = `${qingmingProgress}%`;
            progressText.textContent = `(${qingmingProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('labor-day')) {
            const nextLabor = getNextFestival(5, 1);
            const secondsToLabor = TimeUtil.getSecondsTo(nextLabor);
            const [laborDays, laborHours, laborMinutes, laborSeconds] = TimeUtil.secondsToDHMS(secondsToLabor);
            const laborProgress = ProgressUtil.calculateFestival(nextLabor);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${laborDays} 天 ${laborHours} 小时 ${laborMinutes} 分钟`;
            progressBar.style.width = `${laborProgress}%`;
            progressText.textContent = `(${laborProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('national-day')) {
            const nextNationalDay = getNextFestival(10, 1);
            const secondsToNationalDay = TimeUtil.getSecondsTo(nextNationalDay);
            const [nationalDays, nationalHours, nationalMinutes, nationalSeconds] = TimeUtil.secondsToDHMS(secondsToNationalDay);
            const nationalDayProgress = ProgressUtil.calculateFestival(nextNationalDay);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${nationalDays}天 ${nationalHours} 小时 ${nationalMinutes} 分钟`;
            progressBar.style.width = `${nationalDayProgress}%`;
            progressText.textContent = `(${nationalDayProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('children-day')) {
            const childrenDay = getNextChildrenDay();
            const secondsToChildrenDay = TimeUtil.getSecondsTo(childrenDay);
            const [childrenDays, childrenHours, childrenMinutes, childrenSeconds] = TimeUtil.secondsToDHMS(secondsToChildrenDay);
            const childrenProgress = ProgressUtil.calculateFestival(childrenDay);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${childrenDays} 天 ${childrenHours} 小时 ${childrenMinutes} 分钟`;
            progressBar.style.width = `${childrenProgress}%`;
            progressText.textContent = `(${childrenProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('off-work')) {
            const secondsToOffWork = calculateTimeToOffWork();
            const [days, hours, minutes, seconds] = TimeUtil.secondsToDHMS(secondsToOffWork);
            const totalHours = days * 24 + hours;  // 将天数转换为小时并加到小时数中
            const offWorkProgress = calculateOffWorkProgress();

            const detail = card.querySelector('.stat-detail');
            detail.textContent = secondsToOffWork === -1 
                ? "今天还未到上班时间" 
                : secondsToOffWork === 0 
                ? "今日已下班，请好好休息" 
                : `还剩 ${totalHours} 小时 ${minutes} 分钟 ${seconds} 秒`;
            progressBar.style.width = `${offWorkProgress}%`;
            progressText.textContent = `(${offWorkProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('salary')) {
            const today = now.getDate();
            const salaryDay = DATES.SALARY_DAY;
            let salaryDetail, salaryProgress;
            
            const nextSalaryDate = new Date(now);
            if (today < salaryDay) {
                nextSalaryDate.setDate(salaryDay);
                nextSalaryDate.setHours(0, 0, 0, 0);
            } else {
                nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
                nextSalaryDate.setDate(salaryDay);
                nextSalaryDate.setHours(0, 0, 0, 0);
            }
            
            if (today === salaryDay) {
                salaryDetail = "今日为发薪日";
                salaryProgress = 100;
            } else {
                const timeDiff = nextSalaryDate - now;
                const days = TimeFormatter.formatTimeNumber(timeDiff / (1000 * 60 * 60 * 24));
                const hours = TimeFormatter.formatTimeNumber((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = TimeFormatter.formatTimeNumber((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = TimeFormatter.formatTimeNumber((timeDiff % (1000 * 60)) / 1000);
                
                salaryDetail = `还剩 ${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
                
                const monthStart = new Date(nextSalaryDate);
                monthStart.setDate(salaryDay);
                monthStart.setMonth(monthStart.getMonth() - 1);
                const totalDays = (nextSalaryDate - monthStart) / (1000 * 60 * 60 * 24);
                const passedDays = totalDays - days - (hours + minutes/60 + seconds/3600)/24;
                salaryProgress = (passedDays / totalDays) * 100;
            }

            detail.textContent = salaryDetail;
            progressBar.style.width = `${salaryProgress}%`;
            progressText.textContent = `(${salaryProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('february-last-day')) {
            function getNextFebruaryLastDay() {
                const now = new Date();
                let year = now.getFullYear();
                
                // 如果当前月份已经过了2月，那么取下一年的2月
                if (now.getMonth() > 1) { // 0是一月，1是二月
                    year += 1;
                }
                
                // 判断是否为闰年
                const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
                const lastDay = isLeapYear ? 29 : 28;
                
                return {
                    date: new Date(year, 1, lastDay),
                    isLeapYear,
                    year
                };
            }

            const februaryLastDayInfo = getNextFebruaryLastDay();
            const secondsToFebruaryLastDay = TimeUtil.getSecondsTo(februaryLastDayInfo.date);
            const [febDays, febHours, febMinutes, febSeconds] = TimeUtil.secondsToDHMS(secondsToFebruaryLastDay);
            const februaryLastDayProgress = ProgressUtil.calculateFestival(februaryLastDayInfo.date);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, februaryLastDayProgress);
            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${febDays} 天 ${febHours} 小时 ${febMinutes} 分钟`;
            progressBar.style.width = `${februaryLastDayProgress}%`;
            progressText.textContent = `(${februaryLastDayProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('lunar-february-last-day')) {
            function getNextLunarFebruarySpecialDay() {
                const lunar = Lunar.fromDate(now);
                const currentYear = lunar.getYear();
                const currentMonth = lunar.getMonth();
                const currentDay = lunar.getDay();
                
                let targetYear = currentYear;
                if (currentMonth > 2) {
                    targetYear++;
                }
                else if (currentMonth === 2 && currentDay >= 29) {
                    targetYear++;
                }
                else if (currentMonth === 2 && currentDay >= 28) {
                    try {
                        const testDate = Lunar.fromYmd(currentYear, 2, 29);
                        const solarDate = testDate.getSolar();
                        const testSolarDate = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
                        
                        if (Lunar.fromDate(testSolarDate).getMonth() !== 2) {
                            targetYear++;
                        }
                    } catch {
                        targetYear++;
                    }
                }
                
                try {
                    let targetLunar;
                    let targetDay = 29;
                    try {
                        targetLunar = Lunar.fromYmd(targetYear, 2, 29);
                        const solarDate = targetLunar.getSolar();
                        const solarDateTime = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
                        
                        const checkLunar = Lunar.fromDate(solarDateTime);
                        if (checkLunar.getMonth() !== 2) {
                            targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                            targetDay = 28;
                        }
                    } catch {
                        targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                        targetDay = 28;
                    }
                    
                    const solarDate = targetLunar.getSolar();
                    const solarDateTime = new Date(solarDate.getYear(), solarDate.getMonth() - 1, solarDate.getDay());
                    
                    if (solarDateTime < now) {
                        targetYear++;
                        try {
                            targetLunar = Lunar.fromYmd(targetYear, 2, 29);
                            const nextSolar = targetLunar.getSolar();
                            const nextDateTime = new Date(nextSolar.getYear(), nextSolar.getMonth() - 1, nextSolar.getDay());
                            const checkNextLunar = Lunar.fromDate(nextDateTime);
                            
                            if (checkNextLunar.getMonth() === 2) {
                                solarDateTime.setTime(nextDateTime.getTime());
                                targetDay = 29;
                            } else {
                                targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                                const finalSolar = targetLunar.getSolar();
                                solarDateTime.setFullYear(finalSolar.getYear());
                                solarDateTime.setMonth(finalSolar.getMonth() - 1);
                                solarDateTime.setDate(finalSolar.getDay());
                                targetDay = 28;
                            }
                        } catch {
                            targetLunar = Lunar.fromYmd(targetYear, 2, 28);
                            const finalSolar = targetLunar.getSolar();
                            solarDateTime.setFullYear(finalSolar.getYear());
                            solarDateTime.setMonth(finalSolar.getMonth() - 1);
                            solarDateTime.setDate(finalSolar.getDay());
                            targetDay = 28;
                        }
                    }
                    
                    return {
                        date: solarDateTime,
                        year: targetLunar.getYearInChinese(),
                        month: targetLunar.getMonthInChinese(),
                        day: targetLunar.getDayInChinese(),
                        solarYear: solarDateTime.getFullYear(),
                        targetDay: targetDay
                    };
                } catch (error) {
                    console.error('Error calculating lunar February special day:', error);
                    const fallbackDate = new Date(targetYear, 1, 28);
                    return {
                        date: fallbackDate,
                        year: targetYear.toString(),
                        month: '二',
                        day: '二十八',
                        solarYear: targetYear,
                        targetDay: 28
                    };
                }
            }

            const lunarFebruaryInfo = getNextLunarFebruarySpecialDay();
            const secondsToLunarFebruary = TimeUtil.getSecondsTo(lunarFebruaryInfo.date);
            const [lunarFebDays, lunarFebHours, lunarFebMinutes, lunarFebSeconds] = TimeUtil.secondsToDHMS(secondsToLunarFebruary);
            const lunarFebruaryProgress = ProgressUtil.calculateFestival(lunarFebruaryInfo.date);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, lunarFebruaryProgress);
            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${lunarFebDays} 天 ${lunarFebHours} 小时 ${lunarFebMinutes} 分钟`;
            progressBar.style.width = `${lunarFebruaryProgress}%`;
            progressText.textContent = `(${lunarFebruaryProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('mid-autumn')) {
            const midAutumnDay = getNextLunarFestival(8, 15);
            const secondsToMidAutumn = TimeUtil.getSecondsTo(midAutumnDay);
            const [midAutumnDays, midAutumnHours, midAutumnMinutes, midAutumnSeconds] = TimeUtil.secondsToDHMS(secondsToMidAutumn);
            const midAutumnProgress = ProgressUtil.calculateFestival(midAutumnDay);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, midAutumnProgress);
            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${midAutumnDays} 天 ${midAutumnHours} 小时 ${midAutumnMinutes} 分钟`;
            progressBar.style.width = `${midAutumnProgress}%`;
            progressText.textContent = `(${midAutumnProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('dragon-boat-festival')) {
            const dragonBoatDay = getNextLunarFestival(5, 5);
            const secondsToDragonBoat = TimeUtil.getSecondsTo(dragonBoatDay);
            const [dragonBoatDays, dragonBoatHours, dragonBoatMinutes, dragonBoatSeconds] = TimeUtil.secondsToDHMS(secondsToDragonBoat);
            const dragonBoatProgress = ProgressUtil.calculateFestival(dragonBoatDay);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, dragonBoatProgress);
            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${dragonBoatDays} 天 ${dragonBoatHours} 小时 ${dragonBoatMinutes} 分钟`;
            progressBar.style.width = `${dragonBoatProgress}%`;
            progressText.textContent = `(${dragonBoatProgress.toFixed(1)}%)`;
        }
    });

    // 更新时间显示
    updateDateTime();
}


// 修改更新函数
function updateAll() {
    updateStats();
}

// 更新间隔
setInterval(updateStats, TIME.UPDATE_INTERVAL);

// 主题切换
document.getElementById('theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
}); 

function getNextLunarFestival(month, day) {
    const now = new Date();
    const lunar = Lunar.fromDate(now);
    const currentYear = lunar.getYear();
    
    // 获取今年的节日日期
    let festivalLunar = Lunar.fromYmd(currentYear, month, day);
    let festivalSolar = festivalLunar.getSolar();
    let festivalDate = new Date(festivalSolar.getYear(), festivalSolar.getMonth() - 1, festivalSolar.getDay());
    
    // 如果今年的节日已过，取明年的日期
    if (now > festivalDate) {
        festivalLunar = Lunar.fromYmd(currentYear + 1, month, day);
        festivalSolar = festivalLunar.getSolar();
        festivalDate = new Date(festivalSolar.getYear(), festivalSolar.getMonth() - 1, festivalSolar.getDay());
    }
    
    return festivalDate;
}

// 在文档加载完成后执行所有初始化
document.addEventListener('DOMContentLoaded', function() {
    // 1. 隐藏加载动画
    const loadingSpinner = document.getElementById('loading-state');
    const mainContent = document.querySelector('main');
    
    mainContent.classList.add('hidden');
    
    setTimeout(() => {
        loadingSpinner.remove();
        mainContent.classList.remove('hidden');

        // 使用更可靠的事件绑定方式
        document.querySelectorAll('.countdown-card').forEach(card => {
            card.addEventListener('click', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const ripple = document.createElement('div');
                ripple.className = 'ripple-effect';
                ripple.style.left = `${x}px`;
                ripple.style.top = `${y}px`;
                
                // 确保移除旧的涟漪效果
                const existingRipples = this.querySelectorAll('.ripple-effect');
                existingRipples.forEach(r => r.remove());
                
                this.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });
    }, 500);

    // 2. 更新黄历
    updateHuangLi();
    
    // 3. 开始更新时间
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

function updateHuangLi() {
    const lunar = Lunar.fromDate(new Date());
    
    // 更新农历信息
    const lunarDateEl = document.getElementById('lunar-date');
    if (lunarDateEl) {
        lunarDateEl.textContent = `农历 ${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    }
    
    // 更新干支
    const ganZhiEl = document.getElementById('gan-zhi');
    if (ganZhiEl) {
        ganZhiEl.textContent = `${lunar.getDayInGanZhi()}日`;
    }
    
    // 更新节气
    const jieQiEl = document.getElementById('jie-qi');
    if (jieQiEl) {
        const jieQi = lunar.getJieQi();
        jieQiEl.textContent = jieQi ? `节气：${jieQi}` : '';
    }
    
    // 更新宜忌列表
    const renderList = (selector, items) => {
        const ul = document.getElementById(selector);
        if (ul) {
            ul.innerHTML = items.length > 0 ? 
                items.map(item => `<li>${item}</li>`).join('') :
                '<li>诸事不宜</li>';
        }
    };
    
    // 获取宜忌数据
    const yi = lunar.getDayYi();
    const ji = lunar.getDayJi();
    
    // 渲染宜忌列表
    renderList('yi-items', yi);
    renderList('ji-items', ji);
}

// 统一的时间格式化工具类
const TimeFormatter = {
    // 补零函数
    padZero(num) {
        return num < 10 ? `0${num}` : num;
    },
    
    // 格式化时间数字（确保是整数）
    formatTimeNumber(num) {
        return Math.floor(num);
    },
    
    // 格式化时间（毫秒）
    formatTime(time) {
        const days = Math.floor(time / (24 * 3600 * 1000));
        const hours = Math.floor((time % (24 * 3600 * 1000)) / (3600 * 1000));
        const minutes = Math.floor((time % (3600 * 1000)) / (60 * 1000));
        const seconds = Math.floor((time % (60 * 1000)) / 1000);

        return {
            days,
            hours: this.padZero(hours),
            minutes: this.padZero(minutes),
            seconds: this.padZero(seconds)
        };
    },
    
    // 格式化倒计时文本（多种格式）
    formatCountdown(days, hours, minutes, seconds, format = 'standard') {
        const d = this.formatTimeNumber(days);
        const h = this.formatTimeNumber(hours);
        const m = this.formatTimeNumber(minutes);
        const s = this.formatTimeNumber(seconds);
        
        switch (format) {
            case 'compact':
                return `还剩 ${d}天${h}时${m}分${s}秒`;
            case 'detailed':
                return `还剩 ${d} 天 ${h} 小时 ${m} 分钟 ${s} 秒`;
            case 'short':
                return `${d}天${h}时${m}分${s}秒`;
            default:
                return `还剩 ${d}天 ${h}小时 ${m}分钟 ${s}秒`;
        }
    }
};

// 修改显示函数
function updateCountdown(targetDate, elementId) {
    const now = new Date();
    const timeLeft = targetDate - now;
    
    if (timeLeft > 0) {
        const { days, hours, minutes, seconds } = formatTime(timeLeft);
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = `还剩 ${days} 天 ${hours} 小时 ${minutes} 分钟 ${seconds} 秒`;
        }
    }
}

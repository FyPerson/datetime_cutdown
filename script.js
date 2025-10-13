// 常量配置
const TIME = {
    MINUTES_PER_DAY: 24 * 60,
    SECONDS_PER_DAY: 24 * 3600,
    UPDATE_INTERVAL: 1000
};

// 节日配置
const HOLIDAY_CONFIG = {
    // 公历节日
    solar: {
        newYear: { month: 1, day: 1, name: '元旦' },
        valentine: { month: 2, day: 14, name: '情人节' },
        laborDay: { month: 5, day: 1, name: '劳动节' },
        nationalDay: { month: 10, day: 1, name: '国庆节' },
        childrenDay: { month: 6, day: 1, name: '儿童节' }
    },
    
    // 农历节日
    lunar: {
        lanternFestival: { month: 1, day: 15, name: '元宵节' },
        dragonBoat: { month: 5, day: 5, name: '端午节' },
        midAutumn: { month: 8, day: 15, name: '中秋节' }
    },
    
    // 业务相关日期
    business: {
        salaryDay: 15,
        workHours: { 
            start: { hour: 8, minute: 30 }, 
            lunchStart: { hour: 12, minute: 0 },
            lunchEnd: { hour: 13, minute: 30 },
            end: { hour: 17, minute: 0 } 
        }
    },
    
    // 备用日期
    fallback: {
        qingming: { month: 4, day: 5 },
        februaryLast: { month: 2, day: 28 }
    },
    
    // 调班配置
    workdays: {
        '2025': {
            // 调班工作日（原休息日调为工作日）
            adjustedWorkdays: [
                '2025-01-26', // 1月26日（周日）调为工作日
                '2025-02-08', // 2月8日（周六）调为工作日
                '2025-04-27', // 4月27日（周日）调为工作日
                '2025-09-28', // 9月28日（周日）调为工作日
                '2025-10-11'  // 10月11日（周六）调为工作日
            ],
            // 调班休息日（原工作日调为休息日）
            adjustedRestdays: [
                '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31',
                '2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04', // 春节
                '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05', // 劳动节
                '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05',
                '2025-10-06', '2025-10-07', '2025-10-08' // 国庆节
            ]
        }
    }
};

const DATES = {
    SALARY_DAY: HOLIDAY_CONFIG.business.salaryDay
};

// 配置访问工具类
const ConfigUtil = {
    // 获取公历节日配置
    getSolarHoliday(name) {
        return HOLIDAY_CONFIG.solar[name];
    },
    
    // 获取农历节日配置
    getLunarHoliday(name) {
        return HOLIDAY_CONFIG.lunar[name];
    },
    
    // 获取业务配置
    getBusinessConfig(key) {
        return HOLIDAY_CONFIG.business[key];
    },
    
    // 获取备用配置
    getFallbackConfig(key) {
        return HOLIDAY_CONFIG.fallback[key];
    },
    
    // 获取工作时间配置
    getWorkHours() {
        return this.getBusinessConfig('workHours');
    },
    
    // 获取调班配置
    getWorkdaysConfig(year) {
        return HOLIDAY_CONFIG.workdays[year] || { adjustedWorkdays: [], adjustedRestdays: [] };
    },
    
    // 判断是否为调班工作日
    isAdjustedWorkday(date) {
        const year = date.getFullYear().toString();
        const dateStr = this.formatDate(date);
        const config = this.getWorkdaysConfig(year);
        return config.adjustedWorkdays.includes(dateStr);
    },
    
    // 判断是否为调班休息日
    isAdjustedRestday(date) {
        const year = date.getFullYear().toString();
        const dateStr = this.formatDate(date);
        const config = this.getWorkdaysConfig(year);
        return config.adjustedRestdays.includes(dateStr);
    },
    
    // 格式化日期为YYYY-MM-DD
    formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
};


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

// 获取下一个儿童节日期
function getNextChildrenDay() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const childrenDayConfig = ConfigUtil.getSolarHoliday('childrenDay');
    
    // 创建今年的儿童节日期
    const childrenDayThisYear = new Date(currentYear, childrenDayConfig.month - 1, childrenDayConfig.day);
    
    // 如果今年的儿童节还没到，返回今年的日期
    if (now < childrenDayThisYear) {
        return childrenDayThisYear;
    }
    
    // 如果今年的儿童节已过，返回明年的日期
    return new Date(currentYear + 1, childrenDayConfig.month - 1, childrenDayConfig.day);
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
        const februaryFallback = ConfigUtil.getFallbackConfig('februaryLast');
        const fallbackDate = new Date(targetYear, februaryFallback.month - 1, februaryFallback.day);
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



// 计算工作状态和时间（返回状态对象）
function calculateWorkStatus() {
    const now = new Date();
    const today = now.getDay();
    const dateStr = ConfigUtil.formatDate(now);
    
    // 检查是否为调班工作日
    const isAdjustedWorkday = ConfigUtil.isAdjustedWorkday(now);
    const isAdjustedRestday = ConfigUtil.isAdjustedRestday(now);
    
    let isWorkday;
    
    if (isAdjustedWorkday) {
        // 调班工作日（原休息日调为工作日）
        isWorkday = true;
    } else if (isAdjustedRestday) {
        // 调班休息日（原工作日调为休息日）
        isWorkday = false;
    } else {
        // 默认逻辑：周一到周五为工作日，周六周日为休息日
        isWorkday = today >= 1 && today <= 5;
    }
    
    // 如果不是工作日，返回休息状态
    if (!isWorkday) {
        return {
            status: 'rest',
            seconds: 0,
            nextEvent: null,
            progress: 100,
            isWorkday: false
        };
    }
    
    // 设置工作时间
    const workHours = ConfigUtil.getWorkHours();
    const workStart = new Date(now);
    workStart.setHours(workHours.start.hour, workHours.start.minute, 0, 0);
    const lunchStart = new Date(now);
    lunchStart.setHours(workHours.lunchStart.hour, workHours.lunchStart.minute, 0, 0);
    const lunchEnd = new Date(now);
    lunchEnd.setHours(workHours.lunchEnd.hour, workHours.lunchEnd.minute, 0, 0);
    const workEnd = new Date(now);
    workEnd.setHours(workHours.end.hour, workHours.end.minute, 0, 0);
    
    // 状态1：未到上班时间 (0:00 - 8:30)
    if (now < workStart) {
        const secondsToWork = Math.floor((workStart - now) / 1000);
        return {
            status: 'not_started',
            seconds: secondsToWork,
            nextEvent: 'work',
            progress: 0,
            isWorkday: true
        };
    }
    
    // 状态2：上午工作时间 (8:30 - 12:00)
    if (now >= workStart && now < lunchStart) {
        const secondsToLunch = Math.floor((lunchStart - now) / 1000);
        return {
            status: 'morning',
            seconds: secondsToLunch,
            nextEvent: 'lunch',
            progress: 0, // 将在进度计算中更新
            isWorkday: true
        };
    }
    
    // 状态3：午休时间 (12:00 - 13:30)
    if (now >= lunchStart && now < lunchEnd) {
        const secondsToWork = Math.floor((lunchEnd - now) / 1000);
        return {
            status: 'lunch',
            seconds: secondsToWork,
            nextEvent: 'work',
            progress: 50, // 午休期间进度保持50%
            isWorkday: true
        };
    }
    
    // 状态4：下午工作时间 (13:30 - 17:00)
    if (now >= lunchEnd && now < workEnd) {
        const secondsToOffWork = Math.floor((workEnd - now) / 1000);
        return {
            status: 'afternoon',
            seconds: secondsToOffWork,
            nextEvent: 'off',
            progress: 50, // 将在进度计算中更新
            isWorkday: true
        };
    }
    
    // 状态5：已下班 (17:00 - 24:00)
    return {
        status: 'off',
        seconds: 0,
        nextEvent: null,
        progress: 100,
        isWorkday: true
    };
}

// 计算工作进度（分段进度）
function calculateWorkProgress(workStatus) {
    const now = new Date();
    const workHours = ConfigUtil.getWorkHours();
    
    // 设置时间点
    const workStart = new Date(now);
    workStart.setHours(workHours.start.hour, workHours.start.minute, 0, 0);
    const lunchStart = new Date(now);
    lunchStart.setHours(workHours.lunchStart.hour, workHours.lunchStart.minute, 0, 0);
    const lunchEnd = new Date(now);
    lunchEnd.setHours(workHours.lunchEnd.hour, workHours.lunchEnd.minute, 0, 0);
    const workEnd = new Date(now);
    workEnd.setHours(workHours.end.hour, workHours.end.minute, 0, 0);
    
    switch (workStatus.status) {
        case 'not_started':
            return 0;
            
        case 'morning':
            // 上午进度：0% - 50%
            const morningTotalMinutes = TimeUtil.getElapsedMinutes(workStart, lunchStart);
            const morningElapsedMinutes = TimeUtil.getElapsedMinutes(workStart, now);
            return (morningElapsedMinutes / morningTotalMinutes) * 50;
            
        case 'lunch':
            // 午休期间保持50%
            return 50;
            
        case 'afternoon':
            // 下午进度：50% - 100%
            const afternoonTotalMinutes = TimeUtil.getElapsedMinutes(lunchEnd, workEnd);
            const afternoonElapsedMinutes = TimeUtil.getElapsedMinutes(lunchEnd, now);
            return 50 + (afternoonElapsedMinutes / afternoonTotalMinutes) * 50;
            
        case 'off':
        case 'rest':
            return 100;
            
        default:
            return 0;
    }
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

// ===========================================
// 数据计算层 - 负责所有数据计算逻辑
// ===========================================

// 计算所有统计数据
function calculateAllStats(now) {
    return {
        progress: calculateProgressStats(now),
        festivals: calculateFestivalStats(now),
        work: calculateWorkStats(now),
        special: calculateSpecialStats(now)
    };
}

// 计算进度统计数据
function calculateProgressStats(now) {
    return {
        today: calculateTodayProgress(now),
        week: calculateWeekProgress(now),
        month: calculateMonthProgress(now),
        year: calculateYearProgress(now)
    };
}

// 计算今日进度
function calculateTodayProgress(now) {
        const todayStart = TimeUtil.getTodayStart();
        const secondsToday = Math.floor((now - todayStart) / 1000);
        const [, hoursToday, minutesToday, secondsToday2] = TimeUtil.secondsToDHMS(secondsToday);
        const todayPercent = ProgressUtil.calculate(secondsToday, TIME.SECONDS_PER_DAY);

    return {
        seconds: secondsToday,
        hours: hoursToday,
        minutes: minutesToday,
        seconds2: secondsToday2,
        percent: todayPercent,
        detail: `已过 ${hoursToday} 小时 ${minutesToday} 分钟 ${secondsToday2} 秒`
    };
}

// 计算本周进度
function calculateWeekProgress(now) {
        const weekStart = TimeUtil.getWeekStart();
        const secondsThisWeek = Math.floor((now - weekStart) / 1000);
        const [weekDays, weekHours, weekMinutes, weekSeconds] = TimeUtil.secondsToDHMS(secondsThisWeek);
        const weekPercent = ProgressUtil.calculate(secondsThisWeek, 7 * TIME.SECONDS_PER_DAY);

    return {
        seconds: secondsThisWeek,
        days: weekDays,
        hours: weekHours,
        minutes: weekMinutes,
        seconds2: weekSeconds,
        percent: weekPercent,
        detail: `已过 ${weekDays} 天 ${weekHours} 小时 ${weekMinutes} 分钟`
    };
}

// 计算本月进度
function calculateMonthProgress(now) {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const secondsThisMonth = Math.floor((now - monthStart) / 1000);
        const [monthDays, monthHours, monthMinutes, monthSeconds] = TimeUtil.secondsToDHMS(secondsThisMonth);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const monthPercent = ProgressUtil.calculate(secondsThisMonth, daysInMonth * TIME.SECONDS_PER_DAY);

    return {
        seconds: secondsThisMonth,
        days: monthDays,
        hours: monthHours,
        minutes: monthMinutes,
        seconds2: monthSeconds,
        percent: monthPercent,
        detail: `已过 ${monthDays} 天 ${monthHours} 小时 ${monthMinutes} 分钟`
    };
}

// 计算今年进度
function calculateYearProgress(now) {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const secondsThisYear = Math.floor((now - yearStart) / 1000);
        const [yearDays, yearHours, yearMinutes, yearSeconds] = TimeUtil.secondsToDHMS(secondsThisYear);
        const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() === 1;
        const daysInYear = isLeapYear ? 366 : 365;
        const yearPercent = ProgressUtil.calculate(secondsThisYear, daysInYear * TIME.SECONDS_PER_DAY);

    return {
        seconds: secondsThisYear,
        days: yearDays,
        hours: yearHours,
        minutes: yearMinutes,
        seconds2: yearSeconds,
        percent: yearPercent,
        detail: `已过 ${yearDays} 天 ${yearHours} 小时 ${yearMinutes} 分钟`
    };
}

// 计算节日统计数据
function calculateFestivalStats(now) {
    return {
        spring: calculateSpringFestival(now),
        newYear: calculateNewYear(now),
        valentine: calculateValentine(now),
        qingming: calculateQingming(now),
        labor: calculateLaborDay(now),
        national: calculateNationalDay(now),
        lantern: calculateLanternFestival(now),
        midAutumn: calculateMidAutumn(now),
        dragonBoat: calculateDragonBoat(now)
    };
}

// 计算春节数据
function calculateSpringFestival(now) {
        const { currentSpring, nextSpring } = getSpringFestivalDates();
        const secondsToSpring = TimeUtil.getSecondsTo(nextSpring.date);
        const [springDays, springHours, springMinutes, springSeconds] = TimeUtil.secondsToDHMS(secondsToSpring);
        const springProgress = ProgressUtil.calculateFestival(nextSpring.date);

    return {
        date: nextSpring.date,
        seconds: secondsToSpring,
        days: springDays,
        hours: springHours,
        minutes: springMinutes,
        seconds2: springSeconds,
        progress: springProgress,
        detail: `还剩 ${springDays} 天 ${springHours} 小时 ${springMinutes} 分钟`
    };
}

// 计算元旦数据
function calculateNewYear(now) {
    const newYearConfig = ConfigUtil.getSolarHoliday('newYear');
    const nextNewYear = getNextFestival(newYearConfig.month, newYearConfig.day);
    const secondsToNewYear = TimeUtil.getSecondsTo(nextNewYear);
    const [newYearDays, newYearHours, newYearMinutes, newYearSeconds] = TimeUtil.secondsToDHMS(secondsToNewYear);
    const newYearProgress = ProgressUtil.calculateFestival(nextNewYear);
    
    return {
        date: nextNewYear,
        seconds: secondsToNewYear,
        days: newYearDays,
        hours: newYearHours,
        minutes: newYearMinutes,
        seconds2: newYearSeconds,
        progress: newYearProgress,
        detail: `还剩 ${newYearDays} 天 ${newYearHours} 小时 ${newYearMinutes} 分钟`
    };
}

// 计算情人节数据
function calculateValentine(now) {
    const valentineConfig = ConfigUtil.getSolarHoliday('valentine');
    const nextValentine = getNextFestival(valentineConfig.month, valentineConfig.day);
    const secondsToValentine = TimeUtil.getSecondsTo(nextValentine);
    const [valentineDays, valentineHours, valentineMinutes, valentineSeconds] = TimeUtil.secondsToDHMS(secondsToValentine);
    const valentineProgress = ProgressUtil.calculateFestival(nextValentine);
    
    return {
        date: nextValentine,
        seconds: secondsToValentine,
        days: valentineDays,
        hours: valentineHours,
        minutes: valentineMinutes,
        seconds2: valentineSeconds,
        progress: valentineProgress,
        detail: `还剩 ${valentineDays} 天 ${valentineHours} 小时 ${valentineMinutes} 分钟`
    };
}

// 计算清明节数据
function calculateQingming(now) {
        const lunarNow = Lunar.fromDate(now);
        let nextQingming;
        
        try {
            const qingmingKey = I18n.getMessage('jq.qingMing');
            const qingmingSolar = lunarNow._getJieQiSolar(qingmingKey);
            nextQingming = new Date(
                qingmingSolar.getYear(), 
                qingmingSolar.getMonth() - 1, 
                qingmingSolar.getDay()
            );
            
            if (nextQingming < now) {
                const nextYearLunar = Lunar.fromDate(new Date(now.getFullYear() + 1, 0, 1));
                const nextYearQingmingSolar = nextYearLunar._getJieQiSolar(qingmingKey);
                nextQingming = new Date(
                    nextYearQingmingSolar.getYear(), 
                    nextYearQingmingSolar.getMonth() - 1, 
                    nextYearQingmingSolar.getDay()
                );
            }
        } catch (error) {
            console.warn('清明节节气计算失败，使用固定日期:', error);
        const qingmingFallback = ConfigUtil.getFallbackConfig('qingming');
            const currentYear = now.getFullYear();
        nextQingming = new Date(currentYear, qingmingFallback.month - 1, qingmingFallback.day);
            if (nextQingming < now) {
            nextQingming = new Date(currentYear + 1, qingmingFallback.month - 1, qingmingFallback.day);
            }
        }

        const secondsToQingming = TimeUtil.getSecondsTo(nextQingming);
        const [qingmingDays, qingmingHours, qingmingMinutes, qingmingSeconds] = TimeUtil.secondsToDHMS(secondsToQingming);
        const qingmingProgress = ProgressUtil.calculateFestival(nextQingming);
    
    return {
        date: nextQingming,
        seconds: secondsToQingming,
        days: qingmingDays,
        hours: qingmingHours,
        minutes: qingmingMinutes,
        seconds2: qingmingSeconds,
        progress: qingmingProgress,
        detail: `还剩 ${qingmingDays} 天 ${qingmingHours} 小时 ${qingmingMinutes} 分钟`
    };
}

// 计算劳动节数据
function calculateLaborDay(now) {
    const laborConfig = ConfigUtil.getSolarHoliday('laborDay');
    const nextLabor = getNextFestival(laborConfig.month, laborConfig.day);
    const secondsToLabor = TimeUtil.getSecondsTo(nextLabor);
    const [laborDays, laborHours, laborMinutes, laborSeconds] = TimeUtil.secondsToDHMS(secondsToLabor);
        const laborProgress = ProgressUtil.calculateFestival(nextLabor);
    
    return {
        date: nextLabor,
        seconds: secondsToLabor,
        days: laborDays,
        hours: laborHours,
        minutes: laborMinutes,
        seconds2: laborSeconds,
        progress: laborProgress,
        detail: `还剩 ${laborDays} 天 ${laborHours} 小时 ${laborMinutes} 分钟`
    };
}

// 计算国庆节数据
function calculateNationalDay(now) {
    const nationalConfig = ConfigUtil.getSolarHoliday('nationalDay');
    const nextNationalDay = getNextFestival(nationalConfig.month, nationalConfig.day);
    const secondsToNationalDay = TimeUtil.getSecondsTo(nextNationalDay);
    const [nationalDays, nationalHours, nationalMinutes, nationalSeconds] = TimeUtil.secondsToDHMS(secondsToNationalDay);
        const nationalDayProgress = ProgressUtil.calculateFestival(nextNationalDay);
    
    return {
        date: nextNationalDay,
        seconds: secondsToNationalDay,
        days: nationalDays,
        hours: nationalHours,
        minutes: nationalMinutes,
        seconds2: nationalSeconds,
        progress: nationalDayProgress,
        detail: `还剩 ${nationalDays}天 ${nationalHours} 小时 ${nationalMinutes} 分钟`
    };
}

// 计算元宵节数据
function calculateLanternFestival(now) {
    const lanternConfig = ConfigUtil.getLunarHoliday('lanternFestival');
    const nextLanternFestival = getNextLunarFestival(lanternConfig.month, lanternConfig.day);
    const secondsToLanternFestival = TimeUtil.getSecondsTo(nextLanternFestival);
    const [lanternDays, lanternHours, lanternMinutes, lanternSeconds] = TimeUtil.secondsToDHMS(secondsToLanternFestival);
        const lanternProgress = ProgressUtil.calculateFestival(nextLanternFestival);

    return {
        date: nextLanternFestival,
        seconds: secondsToLanternFestival,
        days: lanternDays,
        hours: lanternHours,
        minutes: lanternMinutes,
        seconds2: lanternSeconds,
        progress: lanternProgress,
        detail: `还剩 ${lanternDays} 天 ${lanternHours} 小时 ${lanternMinutes} 分钟`
    };
}

// 计算中秋节数据
function calculateMidAutumn(now) {
    const midAutumnConfig = ConfigUtil.getLunarHoliday('midAutumn');
    const midAutumnDay = getNextLunarFestival(midAutumnConfig.month, midAutumnConfig.day);
    const secondsToMidAutumn = TimeUtil.getSecondsTo(midAutumnDay);
    const [midAutumnDays, midAutumnHours, midAutumnMinutes, midAutumnSeconds] = TimeUtil.secondsToDHMS(secondsToMidAutumn);
    const midAutumnProgress = ProgressUtil.calculateFestival(midAutumnDay);
    
    return {
        date: midAutumnDay,
        seconds: secondsToMidAutumn,
        days: midAutumnDays,
        hours: midAutumnHours,
        minutes: midAutumnMinutes,
        seconds2: midAutumnSeconds,
        progress: midAutumnProgress,
        detail: `还剩 ${midAutumnDays} 天 ${midAutumnHours} 小时 ${midAutumnMinutes} 分钟`
    };
}

// 计算端午节数据
function calculateDragonBoat(now) {
    const dragonBoatConfig = ConfigUtil.getLunarHoliday('dragonBoat');
    const dragonBoatDay = getNextLunarFestival(dragonBoatConfig.month, dragonBoatConfig.day);
    const secondsToDragonBoat = TimeUtil.getSecondsTo(dragonBoatDay);
    const [dragonBoatDays, dragonBoatHours, dragonBoatMinutes, dragonBoatSeconds] = TimeUtil.secondsToDHMS(secondsToDragonBoat);
    const dragonBoatProgress = ProgressUtil.calculateFestival(dragonBoatDay);
    
    return {
        date: dragonBoatDay,
        seconds: secondsToDragonBoat,
        days: dragonBoatDays,
        hours: dragonBoatHours,
        minutes: dragonBoatMinutes,
        seconds2: dragonBoatSeconds,
        progress: dragonBoatProgress,
        detail: `还剩 ${dragonBoatDays} 天 ${dragonBoatHours} 小时 ${dragonBoatMinutes} 分钟`
    };
}

// 计算工作相关数据
function calculateWorkStats(now) {
    return {
        offWork: calculateOffWorkData(now),
        salary: calculateSalaryData(now)
    };
}

// 计算下班数据
function calculateOffWorkData(now) {
    const workStatus = calculateWorkStatus();
    const progress = calculateWorkProgress(workStatus);
    
    let detail, title, targetTime;
    
    switch (workStatus.status) {
        case 'not_started':
            title = '距离上班';
            const [workDays, workHours, workMinutes, workSeconds] = TimeUtil.secondsToDHMS(workStatus.seconds);
            const workTotalHours = workDays * 24 + workHours;
            detail = `距离上班还有 ${workTotalHours} 小时 ${workMinutes} 分钟 ${workSeconds} 秒`;
            targetTime = '上班时间: 8:30';
            break;
            
        case 'morning':
            title = '距离午休';
            const [lunchDays, lunchHours, lunchMinutes, lunchSeconds] = TimeUtil.secondsToDHMS(workStatus.seconds);
            const lunchTotalHours = lunchDays * 24 + lunchHours;
            detail = `距离午休还有 ${lunchTotalHours} 小时 ${lunchMinutes} 分钟 ${lunchSeconds} 秒`;
            targetTime = '午休时间: 12:00';
            break;
            
        case 'lunch':
            title = '午休中';
            const [workDays2, workHours2, workMinutes2, workSeconds2] = TimeUtil.secondsToDHMS(workStatus.seconds);
            const workTotalHours2 = workDays2 * 24 + workHours2;
            detail = `距离上班还有 ${workTotalHours2} 小时 ${workMinutes2} 分钟 ${workSeconds2} 秒`;
            targetTime = '上班时间: 13:30';
            break;
            
        case 'afternoon':
            title = '距离下班';
            const [offDays, offHours, offMinutes, offSeconds] = TimeUtil.secondsToDHMS(workStatus.seconds);
            const offTotalHours = offDays * 24 + offHours;
            detail = `距离下班还有 ${offTotalHours} 小时 ${offMinutes} 分钟 ${offSeconds} 秒`;
            targetTime = '下班时间: 17:00';
            break;
            
        case 'off':
            title = '距离下班';
            if (workStatus.isWorkday) {
                detail = '今日已下班，请好好休息';
            } else {
                detail = '今天是周末，请好好休息';
            }
            targetTime = '下班时间: 17:00';
            break;
            
        case 'rest':
            title = '距离下班';
            const isAdjustedRestday = ConfigUtil.isAdjustedRestday(now);
            if (isAdjustedRestday) {
                detail = '今天是调班休息日，请好好休息';
            } else {
                detail = '今天是周末，请好好休息';
            }
            targetTime = '下班时间: 17:00';
            break;
            
        default:
            title = '距离下班';
            detail = '状态未知';
            targetTime = '下班时间: 17:00';
    }
    
    // 计算返回数据
    let returnData = {
        title,
        seconds: workStatus.seconds,
        progress,
        detail,
        targetTime,
        status: workStatus.status,
        nextEvent: workStatus.nextEvent
    };
    
    // 添加时间分解数据
    if (workStatus.seconds > 0) {
        const [days, hours, minutes, seconds] = TimeUtil.secondsToDHMS(workStatus.seconds);
        const totalHours = days * 24 + hours;
        
        returnData.days = days;
        returnData.hours = totalHours;
        returnData.minutes = minutes;
        returnData.seconds2 = seconds;
    } else {
        returnData.days = 0;
        returnData.hours = 0;
        returnData.minutes = 0;
        returnData.seconds2 = 0;
    }
    
    return returnData;
}

// 计算工资数据
function calculateSalaryData(now) {
    const today = now.getDate();
    const salaryDay = ConfigUtil.getBusinessConfig('salaryDay');
    
    const nextSalaryDate = new Date(now);
    if (today < salaryDay) {
        // 本月还没到发薪日
        nextSalaryDate.setDate(salaryDay);
    } else {
        // 本月发薪日已过，计算下个月
        nextSalaryDate.setMonth(nextSalaryDate.getMonth() + 1);
        nextSalaryDate.setDate(salaryDay);
    }
    
    // 设置发薪时间为17:00（下班时间）
    nextSalaryDate.setHours(17, 0, 0, 0);
    
    const secondsToSalary = TimeUtil.getSecondsTo(nextSalaryDate);
    const [salaryDays, salaryHours, salaryMinutes, salarySeconds] = TimeUtil.secondsToDHMS(secondsToSalary);
    const salaryProgress = ProgressUtil.calculateFestival(nextSalaryDate);
    
    return {
        date: nextSalaryDate,
        seconds: secondsToSalary,
        days: salaryDays,
        hours: salaryHours,
        minutes: salaryMinutes,
        seconds2: salarySeconds,
        progress: salaryProgress,
        detail: `还剩 ${salaryDays} 天 ${salaryHours} 小时 ${salaryMinutes} 分钟 ${salarySeconds} 秒`
    };
}


// 计算特殊日期数据
function calculateSpecialStats(now) {
    return {
        childrenDay: calculateChildrenDayData(now),
        februaryLastDay: calculateFebruaryLastDayData(now),
        lunarFebruaryLastDay: calculateLunarFebruaryLastDayData(now)
    };
}

// 计算儿童节数据
function calculateChildrenDayData(now) {
    const childrenDay = getNextChildrenDay();
    const secondsToChildrenDay = TimeUtil.getSecondsTo(childrenDay);
    const [childrenDays, childrenHours, childrenMinutes, childrenSeconds] = TimeUtil.secondsToDHMS(secondsToChildrenDay);
    const childrenProgress = ProgressUtil.calculateFestival(childrenDay);
                
                return {
        date: childrenDay,
        seconds: secondsToChildrenDay,
        days: childrenDays,
        hours: childrenHours,
        minutes: childrenMinutes,
        seconds2: childrenSeconds,
        progress: childrenProgress,
        detail: `还剩 ${childrenDays} 天 ${childrenHours} 小时 ${childrenMinutes} 分钟`
    };
}

// 计算二月最后一天数据
function calculateFebruaryLastDayData(now) {
    const februaryLastDayInfo = getNextFebruaryLastDay();
    const secondsToFebruaryLastDay = TimeUtil.getSecondsTo(februaryLastDayInfo.date);
    const [febDays, febHours, febMinutes, febSeconds] = TimeUtil.secondsToDHMS(secondsToFebruaryLastDay);
    const februaryLastDayProgress = ProgressUtil.calculateFestival(februaryLastDayInfo.date);
    
                return {
        date: februaryLastDayInfo.date,
        seconds: secondsToFebruaryLastDay,
        days: febDays,
        hours: febHours,
        minutes: febMinutes,
        seconds2: febSeconds,
        progress: februaryLastDayProgress,
        detail: `还剩 ${febDays} 天 ${febHours} 小时 ${febMinutes} 分钟`
    };
}

// 计算农历二月最后一天数据
function calculateLunarFebruaryLastDayData(now) {
        const lunarFebruaryInfo = getNextLunarFebruarySpecialDay();
        const secondsToLunarFebruary = TimeUtil.getSecondsTo(lunarFebruaryInfo.date);
        const [lunarFebDays, lunarFebHours, lunarFebMinutes, lunarFebSeconds] = TimeUtil.secondsToDHMS(secondsToLunarFebruary);
        const lunarFebruaryProgress = ProgressUtil.calculateFestival(lunarFebruaryInfo.date);

    return {
        date: lunarFebruaryInfo.date,
        seconds: secondsToLunarFebruary,
        days: lunarFebDays,
        hours: lunarFebHours,
        minutes: lunarFebMinutes,
        seconds2: lunarFebSeconds,
        progress: lunarFebruaryProgress,
        detail: `还剩 ${lunarFebDays} 天 ${lunarFebHours} 小时 ${lunarFebMinutes} 分钟`
    };
}

// ===========================================
// 数据处理层 - 负责数据转换和卡片创建
// ===========================================

// 处理统计数据，转换为卡片数据
function processStatsData(statsData) {
    return {
        progressCards: createProgressCards(statsData.progress),
        festivalCards: createFestivalCards(statsData.festivals),
        workCards: createWorkCards(statsData.work),
        specialCards: createSpecialCards(statsData.special)
    };
}

// 创建进度卡片数据
function createProgressCards(progressData) {
    return [
        {
            title: '今日进度',
            detail: progressData.today.detail,
            percent: progressData.today.percent,
            className: 'today',
            type: 'progress',
            secondsToTarget: Infinity
        },
        {
            title: '本周进度',
            detail: progressData.week.detail,
            percent: progressData.week.percent,
            className: 'week',
            type: 'progress',
            secondsToTarget: Infinity
        },
        {
            title: '本月进度',
            detail: progressData.month.detail,
            percent: progressData.month.percent,
            className: 'month',
            type: 'progress',
            secondsToTarget: Infinity
        },
        {
            title: '今年进度',
            detail: progressData.year.detail,
            percent: progressData.year.percent,
            className: 'year',
            type: 'progress',
            secondsToTarget: Infinity
        }
    ];
}

// 创建节日卡片数据
function createFestivalCards(festivalData) {
    return [
        {
            title: '春节倒计时',
            detail: festivalData.spring.detail,
            percent: festivalData.spring.progress,
            className: 'spring-festival',
            type: 'countdown',
            secondsToTarget: festivalData.spring.seconds,
            targetDate: festivalData.spring.date
        },
        {
            title: '元旦倒计时',
            detail: festivalData.newYear.detail,
            percent: festivalData.newYear.progress,
            className: 'new-year',
            type: 'countdown',
            secondsToTarget: festivalData.newYear.seconds,
            targetDate: festivalData.newYear.date
        },
        {
            title: '元宵节倒计时',
            detail: festivalData.lantern.detail,
            percent: festivalData.lantern.progress,
            className: 'lantern-festival',
            type: 'countdown',
            secondsToTarget: festivalData.lantern.seconds,
            targetDate: festivalData.lantern.date
        },
        {
            title: '情人节倒计时',
            detail: festivalData.valentine.detail,
            percent: festivalData.valentine.progress,
            className: 'valentine',
            type: 'countdown',
            secondsToTarget: festivalData.valentine.seconds,
            targetDate: festivalData.valentine.date
        },
        {
            title: '清明节倒计时',
            detail: festivalData.qingming.detail,
            percent: festivalData.qingming.progress,
            className: 'qingming-festival',
            type: 'countdown',
            secondsToTarget: festivalData.qingming.seconds,
            targetDate: festivalData.qingming.date
        },
        {
            title: '劳动节倒计时',
            detail: festivalData.labor.detail,
            percent: festivalData.labor.progress,
            className: 'labor-day',
            type: 'countdown',
            secondsToTarget: festivalData.labor.seconds,
            targetDate: festivalData.labor.date
        },
        {
            title: '国庆节倒计时',
            detail: festivalData.national.detail,
            percent: festivalData.national.progress,
            className: 'national-day',
            type: 'countdown',
            secondsToTarget: festivalData.national.seconds,
            targetDate: festivalData.national.date
        },
        {
            title: '中秋节倒计时',
            detail: festivalData.midAutumn.detail,
            percent: festivalData.midAutumn.progress,
            className: 'mid-autumn',
            type: 'countdown',
            secondsToTarget: festivalData.midAutumn.seconds,
            targetDate: festivalData.midAutumn.date
        },
        {
            title: '端午节倒计时',
            detail: festivalData.dragonBoat.detail,
            percent: festivalData.dragonBoat.progress,
            className: 'dragon-boat-festival',
            type: 'countdown',
            secondsToTarget: festivalData.dragonBoat.seconds,
            targetDate: festivalData.dragonBoat.date
        }
    ];
}

// 创建工作相关卡片数据
function createWorkCards(workData) {
    return [
        {
            title: workData.offWork.title,
            detail: workData.offWork.detail,
            percent: workData.offWork.progress,
            className: `off-work ${workData.offWork.status}`, // 添加状态类名
            type: 'countdown',
            secondsToTarget: workData.offWork.seconds <= 0 ? Infinity : workData.offWork.seconds,
            targetTime: workData.offWork.targetTime, // 使用新的targetTime字段
            status: workData.offWork.status,
            nextEvent: workData.offWork.nextEvent
        },
        {
            title: '距离下一个发薪日',
            detail: workData.salary.detail,
            percent: workData.salary.progress,
            className: 'salary',
            type: 'countdown',
            secondsToTarget: workData.salary.seconds,
            targetDate: workData.salary.date
        }
    ];
}

// 创建特殊日期卡片数据
function createSpecialCards(specialData) {
    return [
        {
            title: '儿童节倒计时',
            detail: specialData.childrenDay.detail,
            percent: specialData.childrenDay.progress,
            className: 'children-day',
            type: 'countdown',
            secondsToTarget: specialData.childrenDay.seconds,
            targetDate: specialData.childrenDay.date
        },
        {
            title: '二月最后一天倒计时',
            detail: specialData.februaryLastDay.detail,
            percent: specialData.februaryLastDay.progress,
            className: 'february-last-day',
            type: 'countdown',
            secondsToTarget: specialData.februaryLastDay.seconds,
            targetDate: specialData.februaryLastDay.date
        },
        {
            title: '农历二月最后一天倒计时',
            detail: specialData.lunarFebruaryLastDay.detail,
            percent: specialData.lunarFebruaryLastDay.progress,
            className: 'lunar-february-last-day',
            type: 'countdown',
            secondsToTarget: specialData.lunarFebruaryLastDay.seconds,
            targetDate: specialData.lunarFebruaryLastDay.date
        }
    ];
}

// 按时间排序卡片
function sortCardsByTime(allCards) {
    const progressCards = allCards.progressCards;
    const countdownCards = [
        ...allCards.festivalCards,
        ...allCards.workCards,
        ...allCards.specialCards
    ];
    
    // 对倒计时卡片按剩余时间排序
    const sortedCountdownCards = countdownCards.sort((a, b) => 
        a.secondsToTarget - b.secondsToTarget
    );
    
    return [...progressCards, ...sortedCountdownCards];
}

// ===========================================
// 渲染层 - 负责DOM操作和界面更新
// ===========================================

// 渲染所有卡片
function renderAllCards(sortedCards, container) {
    container.innerHTML = '';
    
    sortedCards.forEach(card => {
        // 格式化目标日期 - 根据卡片类型显示不同格式
        let targetTime = null;
        
        if (card.type === 'countdown') {
            // 优先使用targetTime字段
            if (card.targetTime) {
                targetTime = card.targetTime;
            } else if (card.targetDate) {
                const date = card.targetDate;
                const month = date.getMonth() + 1;
                const day = date.getDate();
                
                // 根据卡片类型显示不同的格式
                switch (card.className) {
                case 'off-work':
                case 'off-work not_started':
                case 'off-work morning':
                case 'off-work lunch':
                case 'off-work afternoon':
                case 'off-work off':
                case 'off-work rest':
                    // 这些情况已经在calculateOffWorkData中设置了targetTime
                    targetTime = card.targetTime || '下班时间: 17:00';
                    break;
                case 'salary':
                    targetTime = `发薪日: ${day}日`;
                    break;
                case 'spring-festival':
                    targetTime = `春节: ${month}月${day}日`;
                    break;
                    case 'new-year':
                    targetTime = `元旦: ${month}月${day}日`;
                    break;
                case 'valentine':
                    targetTime = `情人节: ${month}月${day}日`;
                    break;
                case 'qingming-festival':
                    targetTime = `清明: ${month}月${day}日`;
                    break;
                case 'labor-day':
                    targetTime = `劳动节: ${month}月${day}日`;
                    break;
                case 'national-day':
                    targetTime = `国庆节: ${month}月${day}日`;
                    break;
                case 'lantern-festival':
                    targetTime = `元宵节: ${month}月${day}日`;
                    break;
                case 'mid-autumn':
                    targetTime = `中秋节: ${month}月${day}日`;
                    break;
                case 'dragon-boat-festival':
                    targetTime = `端午节: ${month}月${day}日`;
                    break;
                case 'children-day':
                    targetTime = `儿童节: ${month}月${day}日`;
                    break;
                case 'february-last-day':
                    targetTime = `${month}月${day}日`;
                    break;
                case 'lunar-february-last-day':
                    targetTime = `农历${month}月${day}日`;
                    break;
                default:
                    targetTime = `${month}月${day}日`;
                }
            }
        }
        
        const element = createStatElement(
            card.title,
            card.detail,
            card.percent,
            card.className,
            targetTime
        );
        container.appendChild(element);
    });
}

// 更新现有卡片
function updateExistingCards(now, container) {
    const cards = container.querySelectorAll('.stat-item');
    cards.forEach(card => {
        updateSingleCard(card, now);
    });
}

// 更新单个卡片
function updateSingleCard(card, now) {
    const className = card.className.split(' ')[1]; // 获取第二个类名
    
    switch (className) {
        case 'today':
            updateTodayCard(card, now);
            break;
        case 'week':
            updateWeekCard(card, now);
            break;
        case 'month':
            updateMonthCard(card, now);
            break;
        case 'year':
            updateYearCard(card, now);
                        break;
                    case 'spring-festival':
            updateSpringCard(card, now);
            break;
        case 'new-year':
            updateNewYearCard(card, now);
                        break;
                    case 'lantern-festival':
            updateLanternCard(card, now);
                        break;
        case 'valentine':
            updateValentineCard(card, now);
                        break;
                    case 'qingming-festival':
            updateQingmingCard(card, now);
                        break;
                    case 'labor-day':
            updateLaborCard(card, now);
                        break;
                    case 'national-day':
            updateNationalCard(card, now);
                        break;
                    case 'children-day':
            updateChildrenCard(card, now);
                        break;
        case 'off-work':
            updateOffWorkCard(card, now);
            break;
                    case 'salary':
            updateSalaryCard(card, now);
                        break;
                    case 'february-last-day':
            updateFebruaryLastDayCard(card, now);
                        break;
                    case 'lunar-february-last-day':
            updateLunarFebruaryCard(card, now);
                        break;
                    case 'mid-autumn':
            updateMidAutumnCard(card, now);
                        break;
                    case 'dragon-boat-festival':
            updateDragonBoatCard(card, now);
                        break;
                }
}

// 更新今日卡片
function updateTodayCard(card, now) {
    const data = calculateTodayProgress(now);
    updateCardElements(card, data.detail, data.percent);
}

// 更新本周卡片
function updateWeekCard(card, now) {
    const data = calculateWeekProgress(now);
    updateCardElements(card, data.detail, data.percent);
}

// 更新本月卡片
function updateMonthCard(card, now) {
    const data = calculateMonthProgress(now);
    updateCardElements(card, data.detail, data.percent);
}

// 更新今年卡片
function updateYearCard(card, now) {
    const data = calculateYearProgress(now);
    updateCardElements(card, data.detail, data.percent);
}

// 更新春节卡片
function updateSpringCard(card, now) {
    const data = calculateSpringFestival(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新元旦卡片
function updateNewYearCard(card, now) {
    const data = calculateNewYear(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新元宵节卡片
function updateLanternCard(card, now) {
    const data = calculateLanternFestival(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新情人节卡片
function updateValentineCard(card, now) {
    const data = calculateValentine(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新清明节卡片
function updateQingmingCard(card, now) {
    const data = calculateQingming(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新劳动节卡片
function updateLaborCard(card, now) {
    const data = calculateLaborDay(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新国庆节卡片
function updateNationalCard(card, now) {
    const data = calculateNationalDay(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新儿童节卡片
function updateChildrenCard(card, now) {
    const data = calculateChildrenDayData(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新下班卡片
function updateOffWorkCard(card, now) {
    const data = calculateOffWorkData(now);
    
    // 更新卡片标题
    const titleElement = card.querySelector('.stat-header');
    if (titleElement) {
        titleElement.textContent = data.title;
    }
    
    // 更新卡片类名以反映当前状态
    card.className = `stat-item off-work ${data.status}`;
    
    // 更新目标时间
    const targetTimeElement = card.querySelector('.target-time');
    if (targetTimeElement) {
        targetTimeElement.textContent = data.targetTime;
    }
    
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新工资卡片
function updateSalaryCard(card, now) {
    const data = calculateSalaryData(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新二月最后一天卡片
function updateFebruaryLastDayCard(card, now) {
    const data = calculateFebruaryLastDayData(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新农历二月最后一天卡片
function updateLunarFebruaryCard(card, now) {
    const data = calculateLunarFebruaryLastDayData(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新中秋节卡片
function updateMidAutumnCard(card, now) {
    const data = calculateMidAutumn(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}

// 更新端午节卡片
function updateDragonBoatCard(card, now) {
    const data = calculateDragonBoat(now);
    updateCardElements(card, data.detail, data.progress);
    updateProgressEffects(card, data.progress);
}


// 更新卡片元素
function updateCardElements(card, detailText, progress) {
            const detail = card.querySelector('.stat-detail');
    const progressBar = card.querySelector('.progress-bar');
    const progressText = card.querySelector('.progress-text');
    
    if (detail) detail.textContent = detailText;
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressText) progressText.textContent = `(${progress.toFixed(1)}%)`;
}

// 更新进度特效
function updateProgressEffects(card, progress) {
    const progressContainer = card.querySelector('.progress-container');
    const progressText = card.querySelector('.progress-text');
    
    if (progressContainer) {
        ProgressEffects.updateMilestones(progressContainer, progress);
    }
    if (progressText) {
        ProgressEffects.updateProgressText(progressText, progress);
    }
}

// ===========================================
// 主函数 - 协调所有层级
// ===========================================

function updateStats() {
    const now = new Date();
    const statsContainer = document.getElementById('stats-container');
    
    // 如果容器为空，创建所有卡片
    if (!statsContainer.children.length) {
        // 1. 计算所有统计数据
        const statsData = calculateAllStats(now);
        
        // 2. 处理数据，转换为卡片格式
        const allCards = processStatsData(statsData);
        
        // 3. 按时间排序卡片
        const sortedCards = sortCardsByTime(allCards);
        
        // 4. 渲染所有卡片
        renderAllCards(sortedCards, statsContainer);
    } else {
        // 更新现有卡片
        updateExistingCards(now, statsContainer);
    }
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
                return `还剩 ${d} 天 ${h} 小时 ${m} 分钟 ${s} 秒`;
            case 'detailed':
                return `还剩 ${d} 天 ${h} 小时 ${m} 分钟 ${s} 秒`;
            case 'short':
                return `${d} 天 ${h} 小时 ${m} 分钟 ${s} 秒`;
            default:
                return `还剩 ${d} 天 ${h} 小时 ${m} 分钟 ${s} 秒`;
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



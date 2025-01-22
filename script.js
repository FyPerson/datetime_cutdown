// 常量配置
const TIME = {
    MINUTES_PER_DAY: 24 * 60,
    SECONDS_PER_DAY: 24 * 3600,
    UPDATE_INTERVAL: 1000
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

const DATES = {
    SALARY_DAY: 15,
    get COMPANY_HOLIDAY() {
        return getNextHoliday();
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

// 计算节日倒计时进度
function calculateFestivalProgress(festivalDate) {
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
    workStart.setHours(9, 0, 0, 0); // 上班时间9:00
    const workEnd = new Date(now);
    workEnd.setHours(17, 30, 0, 0); // 下班时间17:30
    
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
    workStart.setHours(9, 0, 0, 0);  // 上班时间9:00
    const workEnd = new Date(now);
    workEnd.setHours(17, 30, 0, 0);  // 下班时间17:30
    
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
    const now = new Date();
    const solarDate = document.getElementById('solar-date');
    const lunarDate = document.getElementById('lunar-date');
    
    // 格式化时分秒
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}:${seconds}`;
    
    // 公历日期显示
    const dateStr = now.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
    });
    solarDate.textContent = `${dateStr} ${timeStr}`;

    // 获取农历信息
    const lunar = Lunar.fromDate(now);
    const lunarYear = lunar.getYearInChinese();
    const monthName = lunar.getMonthInChinese() + '月';
    const dayName = lunar.getDayInChinese();
    const term = lunar.getJieQi(); // 获取节气
    const animal = lunar.getYearShengXiao(); // 获取生肖
    const ganZhiYear = lunar.getYearInGanZhi(); // 获取年份天干地支
    const ganZhiMonth = lunar.getMonthInGanZhi(); // 获取月份天干地支
    const ganZhiDay = lunar.getDayInGanZhi(); // 获取日期天干地支
    
    // 组合农历日期字符串
    const lunarText = `农历${lunarYear}年 ${monthName}${dayName} [${term}] ${ganZhiYear}年 ${ganZhiMonth}月 ${ganZhiDay}日 [属${animal}]`;
    lunarDate.textContent = lunarText;
}

function createStatElement(title, detail, percent, className) {
    const statDiv = document.createElement('div');
    statDiv.className = `stat-item ${className}`;
    
    statDiv.innerHTML = `
        <div class="stat-header">${title}</div>
        <div class="stat-detail">${detail}</div>
        <div class="progress-container">
            <div class="progress-bar" style="width: ${percent}%"></div>
        </div>
        <div class="progress-text">(${percent.toFixed(1)}%)</div>
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
        const minutesThisMonth = TimeUtil.getElapsedMinutes(monthStart, now);
        const [monthDays, monthHours, monthMinutes] = TimeUtil.minutesToDHM(minutesThisMonth);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const monthPercent = ProgressUtil.calculate(minutesThisMonth, daysInMonth * TIME.MINUTES_PER_DAY);

        // 今年进度计算
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const minutesThisYear = TimeUtil.getElapsedMinutes(yearStart, now);
        const [yearDays, yearHours, yearMinutes] = TimeUtil.minutesToDHM(minutesThisYear);
        const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() === 1;
        const daysInYear = isLeapYear ? 366 : 365;
        const yearPercent = ProgressUtil.calculate(minutesThisYear, daysInYear * TIME.MINUTES_PER_DAY);

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

        // 计算各个节日的倒计时
        const secondsToValentine = TimeUtil.getSecondsTo(nextValentine);
        const secondsToQingming = TimeUtil.getSecondsTo(nextQingming);
        const secondsToLabor = TimeUtil.getSecondsTo(nextLabor);

        // 转换为天时分秒
        const [valentineDays, valentineHours, valentineMinutes, valentineSeconds] = TimeUtil.secondsToDHMS(secondsToValentine);
        const [qingmingDays, qingmingHours, qingmingMinutes, qingmingSeconds] = TimeUtil.secondsToDHMS(secondsToQingming);
        const [laborDays, laborHours, laborMinutes, laborSeconds] = TimeUtil.secondsToDHMS(secondsToLabor);

        // 计算进度
        const valentineProgress = ProgressUtil.calculateFestival(nextValentine);
        const qingmingProgress = ProgressUtil.calculateFestival(nextQingming);
        const laborProgress = ProgressUtil.calculateFestival(nextLabor);

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
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = String(Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
            const minutes = String(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
            const seconds = String(Math.floor((timeDiff % (1000 * 60)) / 1000)).padStart(2, '0');
            
            salaryDetail = `还剩 ${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
            
            // 计算进度：用过去的天数除以总天数
            const monthStart = new Date(nextSalaryDate);
            monthStart.setDate(salaryDay);
            monthStart.setMonth(monthStart.getMonth() - 1);
            const totalDays = (nextSalaryDate - monthStart) / (1000 * 60 * 60 * 24);
            const passedDays = totalDays - days - (Number(hours) + Number(minutes)/60 + Number(seconds)/3600)/24;
            salaryProgress = (passedDays / totalDays) * 100;
        }

        // 计算儿童节倒计时
        const childrenDay = new Date(2025, 5, 1); // 6月1日，月份从0开始，所以6月是5
        const secondsToChildrenDay = TimeUtil.getSecondsTo(childrenDay);
        const [childrenDays, childrenHours, childrenMinutes, childrenSeconds] = TimeUtil.secondsToDHMS(secondsToChildrenDay);
        const childrenProgress = ProgressUtil.calculateFestival(childrenDay);

        // 获取下一个二月最后一天
        function getNextFebruaryLastDay() {
            const now = new Date();
            let year = now.getFullYear();
            let month = now.getMonth();
            
            // 如果当前月份已经过了2月，那么取下一年的2月
            if (month >= 1) { // 0是一月，1是二月
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
                detail: `已过 ${weekDays} 天 ${weekHours} 小时 ${weekMinutes} 分钟 ${weekSeconds} 秒`,
                percent: weekPercent,
                className: "week"
            },
            {
                title: "本月进度",
                detail: `已过 ${monthDays} 天 ${monthHours} 小时 ${monthMinutes} 分钟`,
                percent: monthPercent,
                className: "month"
            },
            {
                title: "今年进度",
                detail: `已过 ${yearDays} 天 ${yearHours} 小时 ${yearMinutes} 分钟`,
                percent: yearPercent,
                className: "year"
            },
            {
                title: `${nextSpring.year}年春节倒计时`,
                detail: `还剩 ${springDays} 天 ${springHours} 小时 ${springMinutes} 分钟 ${springSeconds} 秒`,
                percent: springProgress,
                className: "spring-festival"
            },
            {
                title: "距离1月23日17:30放假倒计时",
                detail: `还剩 ${companyDays} 天 ${companyHours} 小时 ${companyMinutes} 分钟 ${companySeconds} 秒`,
                percent: companyProgress,
                className: "winter-holiday"
            },
            {
                title: `${nextValentine.getFullYear()}年情人节倒计时`,
                detail: `还剩 ${valentineDays} 天 ${valentineHours} 小时 ${valentineMinutes} 分钟 ${valentineSeconds} 秒`,
                percent: valentineProgress,
                className: "valentines-day"
            },
            {
                title: `${nextQingming.getFullYear()}年清明节倒计时`,
                detail: `还剩 ${qingmingDays} 天 ${qingmingHours} 小时 ${qingmingMinutes} 分钟 ${qingmingSeconds} 秒`,
                percent: qingmingProgress,
                className: "qingming-festival"
            },
            {
                title: `${nextLabor.getFullYear()}年劳动节倒计时`,
                detail: `还剩 ${laborDays} 天 ${laborHours} 小时 ${laborMinutes} 分钟 ${laborSeconds} 秒`,
                percent: laborProgress,
                className: "labor-day"
            },
            {
                title: "2025年儿童节倒计时",
                detail: `还剩 ${childrenDays}天 ${childrenHours}小时 ${childrenMinutes}分钟 ${childrenSeconds}秒`,
                percent: childrenProgress,
                className: "children-day"
            },
            {
                title: "距离下班",
                detail: secondsToOffWork === -1 
                    ? "未上班" 
                    : secondsToOffWork === 0 
                    ? "已下班" 
                    : `还剩 ${totalHours} 小时 ${minutes} 分钟 ${seconds} 秒`,
                percent: offWorkProgress,
                className: "off-work"
            },
            {
                title: "距离下一个发薪日",
                detail: salaryDetail,
                percent: salaryProgress,
                className: "salary"
            },
            {
                title: `${februaryLastDayInfo.year}年2月${februaryLastDayInfo.isLeapYear ? '29' : '28'}日倒计时`,
                detail: `还剩 ${febDays}天${febHours}时${febMinutes}分${febSeconds}秒`,
                percent: februaryLastDayProgress,
                className: "february-last-day"
            },
            {
                title: `${lunarFebruaryInfo.solarYear}年农历2月${lunarFebruaryInfo.targetDay}日倒计时`,
                detail: `还剩 ${lunarFebDays}天${lunarFebHours}时${lunarFebMinutes}分${lunarFebSeconds}秒`,
                percent: lunarFebruaryProgress,
                className: "lunar-february-last-day"
            }
        ];

        // 清空容器
        statsContainer.innerHTML = '';

        // 创建并添加所有统计项
        stats.forEach(stat => {
            const element = createStatElement(stat.title, stat.detail, stat.percent, stat.className);
            statsContainer.appendChild(element);
        });
    } else {
        // 只更新现有卡片的内容
        const cards = statsContainer.querySelectorAll('.stat-item');
        cards.forEach(card => {
            const header = card.querySelector('.stat-header');
            const detail = card.querySelector('.stat-detail');
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

                detail.textContent = `已过 ${weekDays} 天 ${weekHours} 小时 ${weekMinutes} 分钟 ${weekSeconds} 秒`;
                progressBar.style.width = `${weekPercent}%`;
                progressText.textContent = `(${weekPercent.toFixed(1)}%)`;
            } else if (card.classList.contains('spring-festival')) {
                const { currentSpring, nextSpring } = getSpringFestivalDates();
                const secondsToSpring = TimeUtil.getSecondsTo(nextSpring.date);
                const [springDays, springHours, springMinutes, springSeconds] = TimeUtil.secondsToDHMS(secondsToSpring);
                const springProgress = ProgressUtil.calculateFestival(nextSpring.date);

                detail.textContent = `还剩 ${springDays} 天 ${springHours} 小时 ${springMinutes} 分钟 ${springSeconds} 秒`;
                progressBar.style.width = `${springProgress}%`;
                progressText.textContent = `(${springProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('winter-holiday')) {
                const companyHoliday = DATES.COMPANY_HOLIDAY;
                const secondsToCompanyHoliday = TimeUtil.getSecondsTo(companyHoliday);
                const [companyDays, companyHours, companyMinutes, companySeconds] = TimeUtil.secondsToDHMS(secondsToCompanyHoliday);
                const companyProgress = ProgressUtil.calculateFestival(companyHoliday);

                detail.textContent = `还剩 ${companyDays} 天 ${companyHours} 小时 ${companyMinutes} 分钟 ${companySeconds} 秒`;
                progressBar.style.width = `${companyProgress}%`;
                progressText.textContent = `(${companyProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('valentines-day')) {
                const nextValentine = getNextFestival(2, 14);
                const secondsToValentine = TimeUtil.getSecondsTo(nextValentine);
                const [valentineDays, valentineHours, valentineMinutes, valentineSeconds] = TimeUtil.secondsToDHMS(secondsToValentine);
                const valentineProgress = ProgressUtil.calculateFestival(nextValentine);

                detail.textContent = `还剩 ${valentineDays} 天 ${valentineHours} 小时 ${valentineMinutes} 分钟 ${valentineSeconds} 秒`;
                progressBar.style.width = `${valentineProgress}%`;
                progressText.textContent = `(${valentineProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('qingming-festival')) {
                const nextQingming = getNextFestival(4, 4);
                const secondsToQingming = TimeUtil.getSecondsTo(nextQingming);
                const [qingmingDays, qingmingHours, qingmingMinutes, qingmingSeconds] = TimeUtil.secondsToDHMS(secondsToQingming);
                const qingmingProgress = ProgressUtil.calculateFestival(nextQingming);

                detail.textContent = `还剩 ${qingmingDays} 天 ${qingmingHours} 小时 ${qingmingMinutes} 分钟 ${qingmingSeconds} 秒`;
                progressBar.style.width = `${qingmingProgress}%`;
                progressText.textContent = `(${qingmingProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('labor-day')) {
                const nextLabor = getNextFestival(5, 1);
                const secondsToLabor = TimeUtil.getSecondsTo(nextLabor);
                const [laborDays, laborHours, laborMinutes, laborSeconds] = TimeUtil.secondsToDHMS(secondsToLabor);
                const laborProgress = ProgressUtil.calculateFestival(nextLabor);

                detail.textContent = `还剩 ${laborDays} 天 ${laborHours} 小时 ${laborMinutes} 分钟 ${laborSeconds} 秒`;
                progressBar.style.width = `${laborProgress}%`;
                progressText.textContent = `(${laborProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('children-day')) {
                const childrenDay = new Date(2025, 5, 1);
                const secondsToChildrenDay = TimeUtil.getSecondsTo(childrenDay);
                const [childrenDays, childrenHours, childrenMinutes, childrenSeconds] = TimeUtil.secondsToDHMS(secondsToChildrenDay);
                const childrenProgress = ProgressUtil.calculateFestival(childrenDay);

                detail.textContent = `还剩 ${childrenDays}天 ${childrenHours}小时 ${childrenMinutes}分钟 ${childrenSeconds}秒`;
                progressBar.style.width = `${childrenProgress}%`;
                progressText.textContent = `(${childrenProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('off-work')) {
                const secondsToOffWork = calculateTimeToOffWork();
                const [days, hours, minutes, seconds] = TimeUtil.secondsToDHMS(secondsToOffWork);
                const totalHours = days * 24 + hours;  // 将天数转换为小时并加到小时数中
                const offWorkProgress = calculateOffWorkProgress();

                detail.textContent = secondsToOffWork === -1 
                    ? "未上班" 
                    : secondsToOffWork === 0 
                    ? "已下班" 
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
                    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                    const hours = String(Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                    const minutes = String(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                    const seconds = String(Math.floor((timeDiff % (1000 * 60)) / 1000)).padStart(2, '0');
                    
                    salaryDetail = `还剩 ${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
                    
                    const monthStart = new Date(nextSalaryDate);
                    monthStart.setDate(salaryDay);
                    monthStart.setMonth(monthStart.getMonth() - 1);
                    const totalDays = (nextSalaryDate - monthStart) / (1000 * 60 * 60 * 24);
                    const passedDays = totalDays - days - (Number(hours) + Number(minutes)/60 + Number(seconds)/3600)/24;
                    salaryProgress = (passedDays / totalDays) * 100;
                }

                detail.textContent = salaryDetail;
                progressBar.style.width = `${salaryProgress}%`;
                progressText.textContent = `(${salaryProgress.toFixed(1)}%)`;
            } else if (card.classList.contains('february-last-day')) {
                function getNextFebruaryLastDay() {
                    let year = now.getFullYear();
                    let month = now.getMonth();
                    
                    if (month >= 1) {
                        year += 1;
                    }
                    
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

                detail.textContent = `还剩 ${febDays}天${febHours}时${febMinutes}分${febSeconds}秒`;
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

                detail.textContent = `还剩 ${lunarFebDays}天${lunarFebHours}时${lunarFebMinutes}分${lunarFebSeconds}秒`;
                progressBar.style.width = `${lunarFebruaryProgress}%`;
                progressText.textContent = `(${lunarFebruaryProgress.toFixed(1)}%)`;
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

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, todayPercent);
            ProgressEffects.updateProgressText(progressText, todayPercent);

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
            detail.textContent = `已过 ${weekDays} 天 ${weekHours} 小时 ${weekMinutes} 分钟 ${weekSeconds} 秒`;
            progressBar.style.width = `${weekPercent}%`;
            progressText.textContent = `(${weekPercent.toFixed(1)}%)`;
        } else if (card.classList.contains('month')) {
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            const minutesThisMonth = TimeUtil.getElapsedMinutes(monthStart, now);
            const [monthDays, monthHours, monthMinutes] = TimeUtil.minutesToDHM(minutesThisMonth);
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
            const monthPercent = ProgressUtil.calculate(minutesThisMonth, daysInMonth * TIME.MINUTES_PER_DAY);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, monthPercent);
            ProgressEffects.updateProgressText(progressText, monthPercent);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `已过 ${monthDays} 天 ${monthHours} 小时 ${monthMinutes} 分钟`;
            progressBar.style.width = `${monthPercent}%`;
            progressText.textContent = `(${monthPercent.toFixed(1)}%)`;
        } else if (card.classList.contains('year')) {
            const yearStart = new Date(now.getFullYear(), 0, 1);
            const minutesThisYear = TimeUtil.getElapsedMinutes(yearStart, now);
            const [yearDays, yearHours, yearMinutes] = TimeUtil.minutesToDHM(minutesThisYear);
            const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() === 1;
            const daysInYear = isLeapYear ? 366 : 365;
            const yearPercent = ProgressUtil.calculate(minutesThisYear, daysInYear * TIME.MINUTES_PER_DAY);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, yearPercent);
            ProgressEffects.updateProgressText(progressText, yearPercent);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `已过 ${yearDays} 天 ${yearHours} 小时 ${yearMinutes} 分钟`;
            progressBar.style.width = `${yearPercent}%`;
            progressText.textContent = `(${yearPercent.toFixed(1)}%)`;
        } else if (card.classList.contains('spring-festival')) {
            const { currentSpring, nextSpring } = getSpringFestivalDates();
            const secondsToSpring = TimeUtil.getSecondsTo(nextSpring.date);
            const [springDays, springHours, springMinutes, springSeconds] = TimeUtil.secondsToDHMS(secondsToSpring);
            const springProgress = ProgressUtil.calculateFestival(nextSpring.date);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, springProgress);
            ProgressEffects.updateProgressText(progressText, springProgress);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${springDays} 天 ${springHours} 小时 ${springMinutes} 分钟 ${springSeconds} 秒`;
            progressBar.style.width = `${springProgress}%`;
            progressText.textContent = `(${springProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('winter-holiday')) {
            const companyHoliday = DATES.COMPANY_HOLIDAY;
            const secondsToCompanyHoliday = TimeUtil.getSecondsTo(companyHoliday);
            const [companyDays, companyHours, companyMinutes, companySeconds] = TimeUtil.secondsToDHMS(secondsToCompanyHoliday);
            const companyProgress = ProgressUtil.calculateFestival(companyHoliday);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, companyProgress);
            ProgressEffects.updateProgressText(progressText, companyProgress);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${companyDays} 天 ${companyHours} 小时 ${companyMinutes} 分钟 ${companySeconds} 秒`;
            progressBar.style.width = `${companyProgress}%`;
            progressText.textContent = `(${companyProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('valentines-day')) {
            const nextValentine = getNextFestival(2, 14);
            const secondsToValentine = TimeUtil.getSecondsTo(nextValentine);
            const [valentineDays, valentineHours, valentineMinutes, valentineSeconds] = TimeUtil.secondsToDHMS(secondsToValentine);
            const valentineProgress = ProgressUtil.calculateFestival(nextValentine);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, valentineProgress);
            ProgressEffects.updateProgressText(progressText, valentineProgress);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${valentineDays} 天 ${valentineHours} 小时 ${valentineMinutes} 分钟 ${valentineSeconds} 秒`;
            progressBar.style.width = `${valentineProgress}%`;
            progressText.textContent = `(${valentineProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('qingming-festival')) {
            const nextQingming = getNextFestival(4, 4);
            const secondsToQingming = TimeUtil.getSecondsTo(nextQingming);
            const [qingmingDays, qingmingHours, qingmingMinutes, qingmingSeconds] = TimeUtil.secondsToDHMS(secondsToQingming);
            const qingmingProgress = ProgressUtil.calculateFestival(nextQingming);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, qingmingProgress);
            ProgressEffects.updateProgressText(progressText, qingmingProgress);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${qingmingDays} 天 ${qingmingHours} 小时 ${qingmingMinutes} 分钟 ${qingmingSeconds} 秒`;
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

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${laborDays} 天 ${laborHours} 小时 ${laborMinutes} 分钟 ${laborSeconds} 秒`;
            progressBar.style.width = `${laborProgress}%`;
            progressText.textContent = `(${laborProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('children-day')) {
            const childrenDay = new Date(2025, 5, 1);
            const secondsToChildrenDay = TimeUtil.getSecondsTo(childrenDay);
            const [childrenDays, childrenHours, childrenMinutes, childrenSeconds] = TimeUtil.secondsToDHMS(secondsToChildrenDay);
            const childrenProgress = ProgressUtil.calculateFestival(childrenDay);

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, childrenProgress);
            ProgressEffects.updateProgressText(progressText, childrenProgress);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${childrenDays}天 ${childrenHours}小时 ${childrenMinutes}分钟 ${childrenSeconds}秒`;
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

            const detail = card.querySelector('.stat-detail');
            detail.textContent = secondsToOffWork === -1 
                ? "未上班" 
                : secondsToOffWork === 0 
                ? "已下班" 
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
                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = String(Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
                const minutes = String(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
                const seconds = String(Math.floor((timeDiff % (1000 * 60)) / 1000)).padStart(2, '0');
                
                salaryDetail = `还剩 ${days}天 ${hours}小时 ${minutes}分钟 ${seconds}秒`;
                
                const monthStart = new Date(nextSalaryDate);
                monthStart.setDate(salaryDay);
                monthStart.setMonth(monthStart.getMonth() - 1);
                const totalDays = (nextSalaryDate - monthStart) / (1000 * 60 * 60 * 24);
                const passedDays = totalDays - days - (Number(hours) + Number(minutes)/60 + Number(seconds)/3600)/24;
                salaryProgress = (passedDays / totalDays) * 100;
            }

            // 更新里程碑和特效
            ProgressEffects.updateMilestones(progressContainer, salaryProgress);
            ProgressEffects.updateProgressText(progressText, salaryProgress);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = salaryDetail;
            progressBar.style.width = `${salaryProgress}%`;
            progressText.textContent = `(${salaryProgress.toFixed(1)}%)`;
        } else if (card.classList.contains('february-last-day')) {
            function getNextFebruaryLastDay() {
                let year = now.getFullYear();
                let month = now.getMonth();
                
                if (month >= 1) {
                    year += 1;
                }
                
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
            ProgressEffects.updateProgressText(progressText, februaryLastDayProgress);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${febDays}天${febHours}时${febMinutes}分${febSeconds}秒`;
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
            ProgressEffects.updateProgressText(progressText, lunarFebruaryProgress);

            const detail = card.querySelector('.stat-detail');
            detail.textContent = `还剩 ${lunarFebDays}天${lunarFebHours}时${lunarFebMinutes}分${lunarFebSeconds}秒`;
            progressBar.style.width = `${lunarFebruaryProgress}%`;
            progressText.textContent = `(${lunarFebruaryProgress.toFixed(1)}%)`;
        }
    });

    // 更新时间显示
    updateDateTime();
}

function updatePreciseCountdown() {
    const now = new Date();
    // 计算最近的1月23日17:30
    const targetDate = new Date(now.getFullYear(), 0, 23, 17, 30);
    
    // 如果当前时间已经过了今年的1月23日17:30，就计算到明年的
    if (now > targetDate) {
        targetDate.setFullYear(targetDate.getFullYear() + 1);
    }
    
    const timeDiff = targetDate - now;
    
    if (timeDiff <= 0) {
        document.getElementById('precise-countdown').textContent = '00:00:00:000';
        return;
    }
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    const milliseconds = timeDiff % 1000;
    
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;
    
    document.getElementById('precise-countdown').textContent = formattedTime;
}

// 修改更新函数
function updateAll() {
    updateStats();
    updatePreciseCountdown();
}

// 更新间隔
setInterval(updateStats, TIME.UPDATE_INTERVAL);
setInterval(updatePreciseCountdown, 10);

// 主题切换
document.getElementById('theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
}); 
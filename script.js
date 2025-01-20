const MINUTES_PER_DAY = 24 * 60;

// 工具函数
function getElapsedMinutes(startTime, endTime) {
    return Math.floor((endTime - startTime) / (1000 * 60));
}

// 工具函数：将分钟和秒转换为时分秒格式
function minutesToDHMS(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds];
}

// 工具函数
function minutesToDHM(minutes) {
    const days = Math.floor(minutes / (24 * 60));
    const hours = Math.floor((minutes % (24 * 60)) / 60);
    const mins = Math.floor(minutes % 60);
    return [days, hours, mins];
}

// 工具函数：将总秒数转换为天时分秒格式
function secondsToDHMS(totalSeconds) {
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [days, hours, minutes, seconds];
}

// 计算到指定日期的剩余秒数
function getSecondsTo(targetDate) {
    const now = new Date();
    return Math.floor((targetDate - now) / 1000);
}

// 计算进度
function calculateProgress(elapsed, total) {
    return (elapsed / total) * 100;
}

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
    const currentYear = festivalDate.getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    
    // 计算从年初到节日的总分钟数（分母）
    const totalMinutes = getElapsedMinutes(yearStart, festivalDate);
    
    // 如果现在的年份小于节日的年份，进度为0
    if (now.getFullYear() < currentYear) {
        return 0;
    }
    
    // 如果现在的年份大于节日的年份，进度为100
    if (now.getFullYear() > currentYear) {
        return 100;
    }
    
    // 计算从年初到现在的分钟数（分子）
    const elapsedMinutes = getElapsedMinutes(yearStart, now);
    
    // 计算进度 (已过时间/总时间 * 100)
    return (elapsedMinutes / totalMinutes) * 100;
}

// 计算距离下班的时间（返回秒数）
function calculateTimeToOffWork() {
    const now = new Date();
    const today = now.getDay();
    
    // 如果是周末，返回0
    if (today === 0 || today === 6) {
        return 0;
    }
    
    // 设置今天的下班时间
    const offWorkTime = new Date(now);
    offWorkTime.setHours(17, 30, 0, 0); // 设置下班时间为17:30:00.000
    
    // 如果已经过了下班时间，返回0
    if (now >= offWorkTime) {
        return 0;
    }
    
    // 计算距离下班还有多少秒
    const remainingSeconds = Math.floor((offWorkTime - now) / 1000);
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
    const totalMinutes = getElapsedMinutes(workStart, workEnd);
    const elapsedMinutes = getElapsedMinutes(workStart, now);
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
    const solarDateDiv = document.getElementById('solar-date');
    const lunarDateDiv = document.getElementById('lunar-date');
    const dateTime = formatDateTime(new Date());
    
    if (solarDateDiv) {
        solarDateDiv.textContent = dateTime.solar;
    }
    if (lunarDateDiv) {
        lunarDateDiv.textContent = dateTime.lunar;
    }
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
    statsContainer.innerHTML = '';

    // 今日进度计算
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const minutesToday = getElapsedMinutes(todayStart, now);
    const [hoursToday, minutesTodayRemaining] = minutesToDHM(minutesToday);
    const hoursPercent = calculateProgress(minutesToday, MINUTES_PER_DAY);

    // 本周进度计算
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const minutesThisWeek = getElapsedMinutes(weekStart, now);
    const weekPercent = calculateProgress(minutesThisWeek, 7 * MINUTES_PER_DAY);

    // 本月进度计算
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const minutesThisMonth = getElapsedMinutes(monthStart, now);
    const [monthDays, monthHours, monthMinutes] = minutesToDHM(minutesThisMonth);
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthPercent = calculateProgress(minutesThisMonth, daysInMonth * MINUTES_PER_DAY);

    // 今年进度计算
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const minutesThisYear = getElapsedMinutes(yearStart, now);
    const [yearDays, yearHours, yearMinutes] = minutesToDHM(minutesThisYear);
    const isLeapYear = new Date(now.getFullYear(), 1, 29).getMonth() === 1;
    const daysInYear = isLeapYear ? 366 : 365;
    const yearPercent = calculateProgress(minutesThisYear, daysInYear * MINUTES_PER_DAY);

    // 春节倒计时计算
    const { currentSpring, nextSpring } = getSpringFestivalDates();
    const secondsToSpring = getSecondsTo(nextSpring.date);
    const [springDays, springHours, springMinutes, springSeconds] = secondsToDHMS(secondsToSpring);
    const springProgress = calculateFestivalProgress(nextSpring.date);

    // 公司放假倒计时计算
    const companyHoliday = new Date(2025, 0, 24);
    const secondsToCompanyHoliday = getSecondsTo(companyHoliday);
    const [companyDays, companyHours, companyMinutes, companySeconds] = secondsToDHMS(secondsToCompanyHoliday);
    const companyProgress = calculateFestivalProgress(companyHoliday);

    // 获取各个节日的下一个日期
    const nextValentine = getNextFestival(2, 14);  // 情人节
    const nextQingming = getNextFestival(4, 4);    // 清明节
    const nextLabor = getNextFestival(5, 1);       // 劳动节

    // 计算各个节日的倒计时
    const secondsToValentine = getSecondsTo(nextValentine);
    const secondsToQingming = getSecondsTo(nextQingming);
    const secondsToLabor = getSecondsTo(nextLabor);

    // 转换为天时分秒
    const [valentineDays, valentineHours, valentineMinutes, valentineSeconds] = secondsToDHMS(secondsToValentine);
    const [qingmingDays, qingmingHours, qingmingMinutes, qingmingSeconds] = secondsToDHMS(secondsToQingming);
    const [laborDays, laborHours, laborMinutes, laborSeconds] = secondsToDHMS(secondsToLabor);

    // 计算进度
    const valentineProgress = calculateFestivalProgress(nextValentine);
    const qingmingProgress = calculateFestivalProgress(nextQingming);
    const laborProgress = calculateFestivalProgress(nextLabor);

    // 计算下班倒计时
    const secondsToOffWork = calculateTimeToOffWork();
    const [offWorkHours, offWorkMinutes, offWorkSeconds] = minutesToDHMS(secondsToOffWork);
    const offWorkProgress = calculateOffWorkProgress();

    // 计算发薪日倒计时
    const today = now.getDate();
    const salaryDay = 15;
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
        salaryDetail = "🎉 今日为发薪日 🎉";
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
    const childrenDay = new Date(2025, 5, 1); // 注意月份是从0开始的，所以6月是5
    const secondsToChildrenDay = getSecondsTo(childrenDay);
    const [childrenDays, childrenHours, childrenMinutes, childrenSeconds] = secondsToDHMS(secondsToChildrenDay);
    const childrenProgress = calculateFestivalProgress(childrenDay);

    // 创建统计项
    const stats = [
        {
            title: "今日进度",
            detail: `已过 ${hoursToday} 小时 ${minutesTodayRemaining} 分钟`,
            percent: hoursPercent,
            className: "today"
        },
        {
            title: "本周进度",
            detail: `已过 ${Math.floor(minutesThisWeek / 60)} 小时 ${Math.floor(minutesThisWeek % 60)} 分钟`,
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
            title: "距离25年1月24日放假倒计时",
            detail: `还剩 ${companyDays} 天 ${companyHours} 小时 ${companyMinutes} 分钟 ${companySeconds} 秒`,
            percent: companyProgress,
            className: "company-holiday"
        },
        {
            title: `${nextValentine.getFullYear()}年情人节倒计时`,
            detail: `还剩 ${valentineDays} 天 ${valentineHours} 小时 ${valentineMinutes} 分钟 ${valentineSeconds} 秒`,
            percent: valentineProgress,
            className: "valentine"
        },
        {
            title: `${nextQingming.getFullYear()}年清明节倒计时`,
            detail: `还剩 ${qingmingDays} 天 ${qingmingHours} 小时 ${qingmingMinutes} 分钟 ${qingmingSeconds} 秒`,
            percent: qingmingProgress,
            className: "qingming"
        },
        {
            title: `${nextLabor.getFullYear()}年劳动节倒计时`,
            detail: `还剩 ${laborDays} 天 ${laborHours} 小时 ${laborMinutes} 分钟 ${laborSeconds} 秒`,
            percent: laborProgress,
            className: "labor"
        },
        {
            title: "2025年儿童节倒计时",
            detail: `还剩 ${childrenDays}天 ${childrenHours}小时 ${childrenMinutes}分钟 ${childrenSeconds}秒`,
            percent: childrenProgress,
            className: "children-day"
        },
        {
            title: "距离下班",
            detail: secondsToOffWork === 0 
                ? "已下班" 
                : `还剩 ${offWorkHours} 小时 ${offWorkMinutes} 分钟 ${offWorkSeconds} 秒`,
            percent: offWorkProgress,
            className: "off-work"
        },
        {
            title: "距离发薪日",
            detail: salaryDetail,
            percent: salaryProgress,
            className: "salary"
        }
    ];

    // 添加所有统计项到容器
    stats.forEach(stat => {
        statsContainer.appendChild(
            createStatElement(stat.title, stat.detail, stat.percent, stat.className)
        );
    });

    // 更新时间显示
    updateDateTime();
}

function updatePreciseCountdown() {
    const targetDate = new Date(2025, 0, 24); // 2025年1月25日
    const now = new Date();
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

// 初始更新
updateAll();

// 更新间隔
setInterval(updateStats, 1000);
setInterval(updatePreciseCountdown, 10);

// 主题切换
document.getElementById('theme-toggle').addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
}); 
from datetime import datetime, timedelta
from zhdate import ZhDate
from rich.console import Console
from rich.progress_bar import ProgressBar
from rich.panel import Panel
from rich import box
import calendar

# 常量定义
MINUTES_PER_DAY = 24 * 60
MINUTES_PER_WEEK = 7 * MINUTES_PER_DAY
COMPANY_HOLIDAY_DATE = datetime(2025, 1, 24)
YEAR_START_DATE = datetime(2024, 1, 1)

def minutes_to_dhm(minutes):
    """将分钟转换为天、小时、分钟"""
    days = int(minutes // MINUTES_PER_DAY)
    hours = int((minutes % MINUTES_PER_DAY) // 60)
    mins = int(minutes % 60)
    return days, hours, mins

def get_elapsed_minutes(start_time, end_time):
    """计算两个时间点之间的分钟数"""
    return (end_time - start_time).total_seconds() / 60

def calculate_progress(elapsed, total):
    """计算进度百分比"""
    return (elapsed / total) * 100

def calculate_time_stats():
    console = Console()
    now = datetime.now()
    
    # 今日进度计算
    hours_today = now.hour
    minutes_today = now.minute
    hours_percent = calculate_progress(hours_today * 60 + minutes_today, MINUTES_PER_DAY)
    
    # 本周进度计算
    week_start = now - timedelta(days=now.weekday(), hours=now.hour, minutes=now.minute)
    minutes_this_week = get_elapsed_minutes(week_start, now)
    week_percent = calculate_progress(minutes_this_week, MINUTES_PER_WEEK)
    
    # 本月进度计算
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    minutes_this_month = get_elapsed_minutes(month_start, now)
    month_days, month_hours, month_minutes = minutes_to_dhm(minutes_this_month)
    days_in_month = calendar.monthrange(now.year, now.month)[1]
    month_percent = calculate_progress(minutes_this_month, days_in_month * MINUTES_PER_DAY)
    
    # 今年进度计算
    year_start = datetime(now.year, 1, 1)
    minutes_this_year = get_elapsed_minutes(year_start, now)
    year_days, year_hours, year_minutes = minutes_to_dhm(minutes_this_year)
    days_in_year = 366 if calendar.isleap(now.year) else 365
    year_percent = calculate_progress(minutes_this_year, days_in_year * MINUTES_PER_DAY)
    
    # 春节倒计时计算
    spring_festival_2025 = ZhDate(2025, 1, 1).to_datetime()
    minutes_to_spring = get_elapsed_minutes(now, spring_festival_2025)
    spring_days, spring_hours, spring_minutes = minutes_to_dhm(minutes_to_spring)
    
    # 公司放假倒计时计算
    company_minutes = get_elapsed_minutes(now, COMPANY_HOLIDAY_DATE)
    company_days, company_hours, company_minutes_remaining = minutes_to_dhm(company_minutes)
    
    # 进度百分比计算
    company_progress = calculate_progress(
        get_elapsed_minutes(YEAR_START_DATE, now),
        get_elapsed_minutes(YEAR_START_DATE, COMPANY_HOLIDAY_DATE)
    )
    
    # 春节进度计算
    current_year_spring = ZhDate(now.year, 1, 1).to_datetime()
    if current_year_spring < now:
        total_minutes = get_elapsed_minutes(ZhDate(now.year, 1, 1).to_datetime(), spring_festival_2025)
        elapsed_minutes = get_elapsed_minutes(ZhDate(now.year, 1, 1).to_datetime(), now)
    else:
        total_minutes = get_elapsed_minutes(ZhDate(now.year-1, 1, 1).to_datetime(), current_year_spring)
        elapsed_minutes = get_elapsed_minutes(ZhDate(now.year-1, 1, 1).to_datetime(), now)
    
    countdown_percent = calculate_progress(elapsed_minutes, total_minutes)

    # 使用Rich创建漂亮的进度条显示
    console.print(Panel.fit("[bold cyan]各种倒计时[/bold cyan]", box=box.ROUNDED))
    console.print()

    stats = [
        ("今日进度", f"已过 {hours_today} 小时 {minutes_today} 分钟", hours_percent, "#00FF00"),  # 亮绿色
        ("本周进度", f"已过 {int(minutes_this_week // 60)} 小时 {int(minutes_this_week % 60)} 分钟", week_percent, "rgb(0,128,255)"),  # 天蓝色
        ("本月进度", f"已过 {month_days} 天 {month_hours} 小时 {month_minutes} 分钟", month_percent, "#FFD700"),  # 金色
        ("今年进度", f"已过 {year_days} 天 {year_hours} 小时 {year_minutes} 分钟", year_percent, "rgb(255,69,0)"),  # 红橙色
        ("春节倒计时", f"还剩 {spring_days} 天 {spring_hours} 小时 {spring_minutes} 分钟", countdown_percent, "#FF1493"),  # 深粉色
        ("距离25年1月24日放假倒计时", f"还剩 {company_days} 天 {company_hours} 小时 {company_minutes_remaining} 分钟", company_progress, "rgb(0,255,255)")  # 青色
    ]

    for title, detail, percent, color in stats:
        # 创建标题和详细信息的组合
        title_detail = f"[bold {color}]{title}[/bold {color}]\n[{color}]{detail}[/{color}]"
        console.print(title_detail)
        
        # 创建自定义进度条
        progress_bar = ProgressBar(
            total=100,
            completed=int(percent),
            complete_style=color,    
            finished_style=color,    
            pulse_style=color,
            width=console.width // 4
        )
        console.print(progress_bar)
        # 百分比信息
        console.print(f"[{color}]({percent:.1f}%)[/{color}]")
        console.print()

if __name__ == "__main__":
    calculate_time_stats()

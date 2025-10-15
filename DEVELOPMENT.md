# 倒计时清单 - 开发指南

## 项目概览
这是一个基于HTML、CSS和JavaScript的倒计时清单应用，包含天气功能。

## 环境要求
- Git (版本控制)
- Python (用于本地HTTP服务器)
- 现代浏览器 (Chrome, Firefox, Edge)

## 本地开发服务器
由于项目是纯前端项目，您可以使用以下方式启动本地服务器：

### 方法1: 使用Python (推荐)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### 方法2: 使用Node.js
```bash
# 安装http-server
npm install -g http-server

# 启动服务器
http-server -p 8000
```

### 方法3: 使用Live Server (VS Code扩展)
安装Live Server扩展，右键index.html选择"Open with Live Server"

## 访问地址
启动后访问: http://localhost:8000

## 天气功能
- 在 `index.html` 中点击 "天气" 链接跳转到 `weather.html`
- `weather.html` 显示模拟天气数据（避免API限制问题）
- 天气数据会根据时间动态变化，模拟真实天气

## 部署说明
- **本地开发**: 直接使用Python HTTP服务器
- **公网部署**: 支持GitHub Pages、Vercel、Netlify等平台
- **天气数据**: 使用模拟数据，无需外部API依赖

## Git常用命令
- `git st`: `git status`
- `git co`: `git checkout`
- `git br`: `git branch`
- `git ci`: `git commit`

## 开发建议
1. 使用现代浏览器进行开发
2. 开启开发者工具查看控制台
3. 测试不同屏幕尺寸的响应式效果
4. 验证主题切换功能
5. 测试天气页面的刷新功能

## 常见问题
- **Git连接问题**: 检查网络或使用HTTPS
- **Python服务器问题**: 确保在 `datetime_cutdown` 目录启动
- **天气数据**: 当前使用模拟数据，如需真实数据可配置天气API

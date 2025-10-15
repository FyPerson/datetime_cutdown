# 倒计时清单 - 开发环境配置

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

## 开发建议
1. 使用现代浏览器进行开发
2. 开启开发者工具查看控制台
3. 测试不同屏幕尺寸的响应式效果
4. 验证主题切换功能

# Bitget 交易指令生成器

一个纯前端工具，通过表单填写生成结构化的**自然语言交易指令**，直接复制给部署了 [bitget-client (`bgc`)](https://github.com/BitgetLimited/agent_hub/blob/main/docs/packages/bitget-client.md) 的 AI 代理（如 Openclaw）执行。

**核心安全设计：网站不接触任何 API Key，私钥永远只存在 AI 代理服务端。**

---

## 功能截图

```
┌─────────────────────────────┬──────────────────────────────────────────┐
│  [A] 基础交易设置            │  实时指令预览                             │
│  · 交易标的（可增删）        │                                          │
│  · 方向：做多 / 做空         │  标的：BZUSDT                            │
│  · 有效期限                 │  条件：在北京时间2026年4月17日22:16之前，  │
│  · 时间框架                 │  如果在15分钟时间框架，出现标准的经典锤头  │
│  · 投入资金 (USDT)          │  线15m（具体规则请见下方）...             │
│  · 杠杆倍数（滑块）          │                                          │
│  · 入场方式：市价 / 限价     │              [一键复制]                   │
├─────────────────────────────┤                                          │
│  [B] 风控与巡检规则          │                                          │
│  · 止损偏移量 (USDT)        │                                          │
│  · 止盈百分比 (%)           │                                          │
│  · 巡检频率                 │                                          │
│  · 移动止损（触发+步长）     │                                          │
├─────────────────────────────┤                                          │
│  [C] 量化策略                │                                          │
│  · 策略选择器               │                                          │
│  · 策略新建 / 编辑 / 删除   │                                          │
│  · 内容预览                 │                                          │
└─────────────────────────────┴──────────────────────────────────────────┘
```

---

## 主要特性

| 特性 | 说明 |
|---|---|
| **零后端** | 纯静态 SPA，无服务器，无数据库 |
| **私钥安全** | 网站不涉及任何 Bitget API 凭证 |
| **标的管理** | 下拉选择 + 实时增删，当前使用中的标的受保护 |
| **策略库** | 量化策略（含完整量化规则文本）的增删改查与复用 |
| **全局预设** | 将整套参数（A+B+C）命名保存，一键读取恢复 |
| **实时生成** | 表单任意改动即时刷新右侧自然语言指令 |
| **一键复制** | 复制全文后直接粘贴给 AI 代理执行 |
| **数据持久化** | 所有数据存储于浏览器 LocalStorage，刷新不丢失 |
| **双端部署** | 支持 Vercel / GitHub Pages 或 VPS + Nginx |

---

## 快速开始

### 环境要求

- Node.js ≥ 18
- npm ≥ 9

### 本地开发

```bash
git clone https://github.com/majunwuxi/bitget-prompt.git
cd bitget-prompt
npm install
npm run dev
# 访问 http://localhost:5173
```

### 生产构建

```bash
npm run build
# 产物输出到 dist/ 目录
npm run preview   # 本地预览生产包
```

---

## 部署

### 方案 A：Vercel（推荐，约 1 分钟）

1. 前往 [vercel.com](https://vercel.com) 并登录
2. 点击 **Add New Project**，导入 `majunwuxi/bitget-prompt`
3. 框架自动识别为 **Vite**，无需任何额外配置
4. 点击 **Deploy**，自动获得 HTTPS 域名

之后每次 `git push` 触发自动重新部署。

### 方案 B：VPS Ubuntu + Nginx

```bash
# 1. 本地打包
npm run build

# 2. 上传 dist/ 到服务器
scp -r dist/ user@your-vps:/var/www/bitget-prompt/

# 3. 配置 Nginx
sudo nano /etc/nginx/sites-available/bitget-prompt
```

Nginx 配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/bitget-prompt;
    index index.html;

    # SPA 路由回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 带 hash 的静态资源强缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/bitget-prompt /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 可选：免费 HTTPS 证书
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 项目结构

```
src/
├── components/
│   ├── BlockAPanel.tsx     # 区块 A：基础交易设置（含标的 CRUD）
│   ├── BlockBPanel.tsx     # 区块 B：风控与巡检规则
│   ├── BlockCPanel.tsx     # 区块 C：量化策略管理（策略 CRUD）
│   ├── PromptPreview.tsx   # 右侧实时预览 + 一键复制
│   └── TemplateBar.tsx     # 顶部全局预设保存与读取
├── data/
│   └── defaults.ts         # 内置锤头线策略 + 默认交易标的
├── hooks/
│   └── useLocalStorage.ts  # LocalStorage 持久化 Hook
├── lib/
│   └── promptGenerator.ts  # 自然语言指令生成引擎
├── types.ts                # 全局 TypeScript 类型定义
├── App.tsx                 # 主布局 + 全局状态管理
└── index.css               # Tailwind + 自定义组件样式
```

---

## 技术栈

| 技术 | 版本 | 用途 |
|---|---|---|
| React | 18+ | UI 框架 |
| TypeScript | 5+ | 类型安全 |
| Vite | 8 | 构建工具 |
| Tailwind CSS | 3 | 样式框架 |
| Lucide React | latest | 图标库 |
| LocalStorage | 浏览器原生 | 数据持久化 |

---

## 使用流程

```
填写左侧表单  →  右侧实时生成自然语言指令  →  点击"一键复制"
→  粘贴给 Openclaw（部署了 bgc 的 AI 代理）  →  代理理解并执行交易
```

AI 代理负责解析指令、调用 `bgc` 工具、管理定时巡检和移动止损逻辑。网站本身只负责生成清晰、无歧义的中文指令文本。

---

## 数据存储说明

所有数据存储在**浏览器本地 LocalStorage**，不上传任何服务器：

| 键名 | 内容 |
|---|---|
| `symbols_pool` | 交易标的列表 |
| `strategies_pool` | 量化策略库（含完整规则内容） |
| `templates_pool` | 全局预设模板 |
| `form_state` | 当前表单状态（自动保存） |

---

## License

MIT

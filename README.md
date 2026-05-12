# ✨ AiWaifu — 二次元角色 AI 聊天应用

一个纯前端 Web 应用，与二次元角色进行 AI 驱动的实时聊天。支持自定义 API、流式输出、多模态图片输入、角色管理和 AI 辅助角色生成。

**无需后端，所有数据存储在浏览器 localStorage 中，可一键部署到 Netlify。**

> 🚀 **在线演示**：[kasyouaiwaifu.netlify.app](https://kasyouaiwaifu.netlify.app/)

## 功能

### 角色管理
- **预置角色**：雷姆 & 碧翠丝（来自《Re:从零开始的异世界生活》），配备详细角色设定
- **手动创建**：自定义名称、System Prompt、头像上传
- **AI 生成角色**：描述你想要的任何角色，AI 自动生成名称、设定和头像
- **编辑角色**：随时修改角色名称、设定、头像
- **角色置顶**：将常用角色固定在列表顶部，按置顶顺序排列
- **重置默认角色**：一键恢复预置的雷姆和贝蒂

### 聊天对话
- **流式输出**：AI 回复逐字显示，打字机效果
- **多模态输入**：支持上传图片（JPG/PNG/GIF/WebP），自动检测模型是否支持视觉
- **上下文记忆**：自动携带 System Prompt + 历史对话，保持角色一致性
- **对话管理**：清空对话（带确认弹窗），所有记录自动保存到 localStorage

### API 配置
- **OpenAI 兼容**：兼容 DeepSeek、OpenAI、Claude 等所有 OpenAI 格式 API
- **快速切换**：预设 DeepSeek V3、GPT-4o、GPT-4o-mini 等模板，支持自定义
- **模型检测**：自动判断当前模型是否支持多模态输入

### 头像系统
- **SVG 生成**：根据角色名确定性生成彩色首字母头像
- **Emoji 头像**：AI 生成角色时自动匹配最合适的 emoji 头像
- **自定义上传**：支持本地上传图片，自动压缩为 128×128 base64 缩略图
- **恢复默认**：删除自定义头像后自动恢复为生成头像

### UI/UX
- **响应式布局**：桌面端固定分栏，移动端侧边栏 overlay 模式
- **连续对话**：发送消息后输入框自动保持焦点，流式输出期间可提前输入
- **Claude 风格设计**：暖色调奶油色主题，珊瑚色点缀

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 状态管理 | Zustand（带 localStorage 持久化） |
| 样式 | TailwindCSS 3 |
| API | OpenAI 兼容格式（流式 SSE） |
| 部署 | Netlify / 任意静态托管 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build

# 预览构建结果
npm run preview
```

## 部署到 Netlify

### 方法 1：拖拽部署
1. 运行 `npm run build`
2. 将 `dist/` 文件夹拖到 [app.netlify.com](https://app.netlify.com)

### 方法 2：Git 连接
1. 将项目推送到 GitHub
2. 在 Netlify 中导入该仓库
3. 构建设置已通过 `netlify.toml` 自动配置

## 使用说明

1. **配置 API**：点击左侧边栏底部的「API 设置」，填入 API URL、Key 和模型名称
2. **选择角色**：点击左侧角色列表中的角色开始聊天
3. **创建角色**：点击「新建角色」手动创建，或「AI 生成」自动创建
4. **发送消息**：输入文本后按 Enter 发送（Shift+Enter 换行），支持上传图片
5. **编辑角色**：聊天窗口右上角铅笔图标，可修改角色名称、设定、头像

## 项目结构

```
src/
├── main.tsx                    # 入口
├── App.tsx                     # 根布局
├── index.css                   # Tailwind + 自定义样式
├── types/index.ts              # TypeScript 类型定义
├── store/useStore.ts           # Zustand 全局状态
├── utils/
│   ├── api.ts                  # 流式聊天 API + AI 角色生成
│   ├── avatar.ts               # SVG/Emoji 头像生成器
│   ├── image.ts                # 图片压缩与验证
│   └── presets.ts              # 预置角色定义
└── components/
    ├── ui/
    │   ├── Modal.tsx            # 通用弹窗
    │   └── Avatar.tsx           # 通用头像组件
    ├── layout/
    │   ├── Sidebar.tsx          # 角色列表侧边栏
    │   └── SettingsModal.tsx    # API 设置弹窗
    ├── character/
    │   ├── CharacterEditor.tsx  # 角色编辑器
    │   └── AICharacterGenerator.tsx  # AI 角色生成
    └── chat/
        ├── ChatWindow.tsx       # 聊天窗口
        ├── MessageBubble.tsx    # 消息气泡
        └── ChatInput.tsx        # 消息输入框
```

## 支持的模型

| 预设 | 模型 ID | 多模态 |
|---|---|---|
| DeepSeek V3 | `deepseek-chat` | ❌ |
| OpenAI GPT-4o | `gpt-4o` | ✅ |
| OpenAI GPT-4o-mini | `gpt-4o-mini` | ✅ |
| OpenAI GPT-4 Turbo | `gpt-4-turbo` | ✅ |
| 自定义 | 任意 | 自动检测 |

## License

MIT

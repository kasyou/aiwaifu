# ✨ AiWaifu — 二次元角色 AI 聊天应用

纯前端 AI 聊天应用，与二次元角色进行实时对话。支持 Web 浏览器和 Android APK 双端运行。

**无需后端，所有数据存储在浏览器 localStorage 中。**

> 🚀 **在线演示**：[kasyouaiwaifu.netlify.app](https://kasyouaiwaifu.netlify.app/)

---

## 功能

### 角色管理
- **预置角色**：雷姆 & 碧翠丝（《Re:从零开始的异世界生活》），配备详细角色设定
- **手动创建**：自定义名称、System Prompt、头像上传
- **AI 生成角色**：描述你想要的角色，AI 自动生成名称、设定和 emoji 头像
- **编辑角色**：点击聊天页铅笔图标修改角色名称、设定、头像
- **角色置顶**：将常用角色固定在列表顶部，按置顶顺序排列
- **重置默认角色**：一键恢复预置的雷姆和碧翠丝（不影响自定义角色）

### 聊天对话
- **流式输出**：AI 回复逐字显示，打字机效果
- **多模态输入**：支持上传图片（JPG/PNG/GIF/WebP），自动检测模型是否支持视觉
- **上下文记忆**：自动携带 System Prompt + 历史对话，保持角色一致性
- **自然语言学习**：对话中提出角色风格建议，AI 自动优化 System Prompt（5 分钟冷却）
- **时间/位置感知**：询问时间和天气时自动注入当前日期、星期和 GPS 坐标
- **对话管理**：清空对话（带确认弹窗）、导出/导入聊天记录（JSON 格式）

### 聊天记录导出/导入
- **导出**：将角色聊天记录导出为 JSON 文件
  - 桌面端：浏览器下载到系统下载文件夹
  - Android：通过系统下载管理器保存到 `/Download/` 目录
  - 文件名格式：`{角色名}_聊天记录_YYYYMMDD_HHmmss.json`
- **导入**：从 JSON 文件导入聊天记录
  - 支持追加模式（不覆盖已有记录）和覆盖模式（替换全部记录）
  - 自动验证消息格式、补充缺失时间戳

### API 配置
- **OpenAI 兼容**：兼容 DeepSeek、OpenAI、Claude 等所有 OpenAI 格式 API
- **快速切换**：预设 DeepSeek V3、GPT-4o、GPT-4o-mini 等模板，支持自定义
- **模型检测**：自动判断当前模型是否支持多模态输入

### 头像系统
- **SVG 生成**：根据角色名确定性生成彩色首字母头像
- **Emoji 头像**：AI 生成角色时自动匹配最合适的 emoji 头像
- **自定义上传**：支持本地上传图片，自动压缩为 128×128 base64 缩略图

### UI/UX
- **桌面端**：左右分栏布局，固定侧边栏 + 聊天窗口
- **移动端 / Android**：双独立页面模式，角色列表页 ↔ 聊天页切换
- **Android 返回键**：聊天页按返回键回到角色列表；列表页按返回键退出应用
- **Claude 风格设计**：暖色调奶油色主题，珊瑚色点缀

---

## 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 6 |
| 状态管理 | Zustand（带 localStorage 持久化） |
| 样式 | TailwindCSS 3 |
| API | OpenAI 兼容格式（流式 SSE） |
| 移动端打包 | Capacitor 8 (Android) |
| 原生功能 | `@capacitor/app`（返回键监听） |

---

## Web 端快速开始

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

### 部署到 Netlify

1. 运行 `npm run build`
2. 将 `dist/` 文件夹拖到 [app.netlify.com](https://app.netlify.com)
3. 或通过 Git 连接导入仓库（`netlify.toml` 已自动配置）

---

## Android APK 构建

### 环境要求

| 工具 | 版本要求 |
|---|---|
| JDK | 17 或更高（推荐 JDK 21） |
| Android SDK | API 35 |
| Node.js | 18+ |
| Gradle | 8.14+（自动下载） |

### 构建步骤

```bash
# 1. 安装 Web 依赖
npm install

# 2. 构建 Web 产物
npm run build

# 3. 同步 Capacitor Android 项目（首次需执行）
npx cap sync android

# 4. 构建 APK
# Windows PowerShell:
.\build-apk.ps1

# Windows CMD:
.\build-apk.bat

# Linux/macOS:
bash build-apk.sh
```

构建产物位于 `android/app/build/outputs/apk/debug/app-debug.apk`。

### 构建脚本说明

构建脚本会自动完成以下操作：
- 将 `JAVA_HOME` 指向 JDK 21（如果当前不是）
- 设置 `ANDROID_HOME` 环境变量
- 运行 Gradle 构建 debug APK

> **中国大陆用户**：项目已配置阿里云 Maven 镜像，解决 `dl.google.com` 无法访问的问题。如果遇到网络问题，请检查 `android/build.gradle` 和 `android/settings.gradle` 中的镜像配置。

### 环境检查

```bash
# 检查 Java、Android SDK、Node.js 环境是否正确配置
.\check-env.ps1    # Windows PowerShell
.\check-env.bat    # Windows CMD
bash check-env.sh  # Linux/macOS
```

### 开发调试

```bash
# 在 Android Studio 中打开项目
.\open-android.ps1
```

---

## 项目结构

```
AiWaifu/
├── src/
│   ├── main.tsx                         # 入口
│   ├── App.tsx                          # 根布局（桌面/移动端自适应）
│   ├── index.css                        # Tailwind + 自定义样式
│   ├── types/index.ts                   # TypeScript 类型定义
│   ├── store/useStore.ts                # Zustand 全局状态（含持久化）
│   ├── utils/
│   │   ├── api.ts                       # 流式聊天 API + AI 角色生成
│   │   ├── avatar.ts                    # SVG/Emoji 头像生成器
│   │   ├── image.ts                     # 图片压缩与验证
│   │   ├── presets.ts                   # 预置角色定义
│   │   ├── learn.ts                     # 自然语言学习（System Prompt 优化）
│   │   └── context.ts                   # 时间/位置感知上下文注入
│   └── components/
│       ├── ui/
│       │   ├── Modal.tsx                # 通用弹窗
│       │   └── Avatar.tsx               # 通用头像组件
│       ├── layout/
│       │   ├── Sidebar.tsx              # 桌面端侧边栏（角色列表+操作）
│       │   └── SettingsModal.tsx        # API 设置弹窗
│       ├── character/
│       │   ├── CharacterEditor.tsx      # 角色编辑器（手动创建/编辑）
│       │   └── AICharacterGenerator.tsx # AI 角色生成器
│       ├── chat/
│       │   ├── ChatWindow.tsx           # 聊天窗口（消息列表+输入+标题栏）
│       │   ├── MessageBubble.tsx        # 消息气泡
│       │   ├── ChatInput.tsx            # 消息输入框（文本+图片）
│       │   └── LearnConfirm.tsx         # 角色学习确认弹窗
│       └── mobile/
│           ├── CharacterListPage.tsx    # 移动端角色列表页（全屏独立页面）
│           └── ChatPage.tsx             # 移动端聊天页（全屏独立页面）
├── android/                             # Capacitor Android 项目
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml          # Android 清单（含定位权限）
│   │   └── assets/                      # Web 资源（构建时自动同步）
│   ├── variables.gradle                 # SDK 版本 + 依赖版本
│   ├── build.gradle                     # Gradle 构建配置（含阿里云镜像）
│   └── settings.gradle                  # Gradle 设置
├── capacitor.config.ts                  # Capacitor 配置
├── build-apk.ps1 / .bat / .sh           # APK 构建脚本
├── check-env.ps1 / .bat / .sh           # 环境检查脚本
├── open-android.ps1 / .bat / .sh        # Android Studio 启动脚本
├── netlify.toml                         # Netlify 部署配置
└── package.json
```

---

## 支持的模型

| 预设 | 模型 ID | 多模态 |
|---|---|---|
| DeepSeek V3 | `deepseek-chat` | ❌ |
| OpenAI GPT-4o | `gpt-4o` | ✅ |
| OpenAI GPT-4o-mini | `gpt-4o-mini` | ✅ |
| OpenAI GPT-4 Turbo | `gpt-4-turbo` | ✅ |
| 自定义 | 任意 | 自动检测 |

---

## License

MIT

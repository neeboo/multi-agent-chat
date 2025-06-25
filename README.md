# 🤖 Multi-Agent Chat System

一个基于AI的多智能体协作开发系统，支持项目经理、工程师、QA工程师等角色的自动化协作。

## ✨ 特性

- 🎯 **真实多Agent协作**：PM、Engineer、QA自动协作完成开发任务
- 💬 **群聊式交互**：类似微信群聊的AI协作体验
- 🔄 **实时响应**：AI角色根据上下文自主决定何时参与
- 🛡️ **安全可靠**：完善的输入验证和错误处理
- 💰 **成本可控**：内置API调用成本追踪
- 🚀 **一键部署**：支持Vercel一键部署

## 🏗️ 系统架构

\`\`\`
Human (产品负责人)
    ↓
ChatGPT (项目经理) → 需求分析、任务分解、进度协调
    ↓
OpenAI (工程师) → 代码实现、技术方案
    ↓  
DeepSeek (QA工程师) → 代码审查、测试建议
    ↓
最终交付结果
\`\`\`

## 🚀 快速开始

### 1. 克隆项目
\`\`\`bash
git clone https://github.com/your-username/multi-agent-chat-system.git
cd multi-agent-chat-system
\`\`\`

### 2. 安装依赖
\`\`\`bash
npm install
\`\`\`

### 3. 配置环境变量
\`\`\`bash
cp .env.example .env.local
\`\`\`

编辑 `.env.local` 文件：
\`\`\`env
OPENAI_API_KEY=sk-your-openai-key-here
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
\`\`\`

### 4. 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 开始使用！

## 📖 使用方法

1. **输入需求**：在聊天框中描述你的开发需求
2. **AI协作**：系统自动调度PM、工程师、QA进行协作
3. **实时查看**：观看AI团队的实时讨论和协作过程
4. **获取结果**：得到完整的分析、代码实现和测试建议

### 示例需求
- "创建一个用户登录功能"
- "开发一个待办事项应用"
- "实现一个简单的博客系统"

## 🛠️ 技术栈

- **前端**: Next.js 14, React, TypeScript, Tailwind CSS
- **AI集成**: AI SDK, OpenAI GPT-4, DeepSeek
- **部署**: Vercel
- **验证**: Zod
- **UI组件**: shadcn/ui

## 📁 项目结构

\`\`\`
├── app/
│   ├── api/multi-agent/          # 多Agent API路由
│   ├── globals.css               # 全局样式
│   ├── layout.tsx               # 根布局
│   └── page.tsx                 # 主页面
├── components/
│   ├── ui/                      # UI组件库
│   ├── multi-agent-chat.tsx     # 多Agent聊天组件
│   └── realtime-chat.tsx        # 实时聊天组件
├── lib/
│   ├── agents.ts                # Agent系统核心
│   ├── realtime-agents.ts       # 实时Agent系统
│   ├── cost-tracker.ts          # 成本追踪
│   └── utils.ts                 # 工具函数
└── README.md
\`\`\`

## 🔧 配置选项

### 环境变量
- `OPENAI_API_KEY`: OpenAI API密钥
- `DEEPSEEK_API_KEY`: DeepSeek API密钥
- `ENABLE_COST_TRACKING`: 启用成本追踪 (可选)
- `MAX_COST_PER_REQUEST`: 单次请求最大成本限制 (可选)

### Agent配置
可以在 `lib/agents.ts` 中自定义每个Agent的行为：
- 系统提示词
- 响应条件
- 输出格式

## 🚀 部署

### Vercel部署 (推荐)
1. Fork此项目到你的GitHub
2. 在Vercel中导入项目
3. 配置环境变量
4. 点击部署

### 手动部署
\`\`\`bash
npm run build
npm start
\`\`\`

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [AI SDK](https://sdk.vercel.ai/) - 强大的AI集成工具
- [Next.js](https://nextjs.org/) - 优秀的React框架
- [shadcn/ui](https://ui.shadcn.com/) - 美观的UI组件库

## 📞 联系

如有问题或建议，请通过以下方式联系：
- 提交 [GitHub Issue](https://github.com/your-username/multi-agent-chat-system/issues)
- 发送邮件到 your-email@example.com

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！

**最后更新**: 2025-01-27
**部署状态**: 🚀 Ready for Production

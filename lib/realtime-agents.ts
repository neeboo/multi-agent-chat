import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { deepseek } from "@ai-sdk/deepseek"
import { EventEmitter } from "events"

interface AgentMessage {
  id: string
  from: string
  to?: string // 可以@特定agent
  content: string
  timestamp: Date
  type: "message" | "code" | "review" | "question"
}

interface AgentContext {
  taskId: string
  messages: AgentMessage[]
  participants: string[]
  status: "active" | "completed" | "waiting"
}

class RealTimeMultiAgentSystem extends EventEmitter {
  private agents = new Map<string, AIAgent>()
  private contexts = new Map<string, AgentContext>()

  constructor() {
    super()
    this.initializeAgents()
  }

  private initializeAgents() {
    // 注册各个AI agent
    this.agents.set("pm", new PMAgent())
    this.agents.set("engineer", new EngineerAgent())
    this.agents.set("qa", new QAAgent())

    // 监听agent消息
    this.agents.forEach((agent, name) => {
      agent.on("message", (message) => {
        this.handleAgentMessage(name, message)
      })
    })
  }

  async startTask(taskId: string, userRequest: string): Promise<void> {
    const context: AgentContext = {
      taskId,
      messages: [],
      participants: ["human", "pm", "engineer", "qa"],
      status: "active",
    }

    this.contexts.set(taskId, context)

    // 广播用户需求给所有agent
    await this.broadcastMessage(taskId, {
      id: this.generateId(),
      from: "human",
      content: userRequest,
      timestamp: new Date(),
      type: "message",
    })
  }

  private async broadcastMessage(taskId: string, message: AgentMessage) {
    const context = this.contexts.get(taskId)
    if (!context) return

    // 添加到消息历史
    context.messages.push(message)

    // 通知所有agent（除了发送者）
    for (const [agentName, agent] of this.agents) {
      if (agentName !== message.from) {
        // 每个agent根据消息内容决定是否响应
        agent.processMessage(message, context)
      }
    }

    // 发送给前端
    this.emit("message", { taskId, message })
  }

  private async handleAgentMessage(agentName: string, message: AgentMessage) {
    const context = this.contexts.get(message.taskId)
    if (!context) return

    await this.broadcastMessage(message.taskId, {
      ...message,
      from: agentName,
    })
  }

  getTaskContext(taskId: string): AgentContext | undefined {
    return this.contexts.get(taskId)
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }
}

abstract class AIAgent extends EventEmitter {
  abstract name: string
  abstract systemPrompt: string

  async processMessage(message: AgentMessage, context: AgentContext) {
    // 每个agent自主决定是否需要响应
    if (await this.shouldRespond(message, context)) {
      const response = await this.generateResponse(message, context)
      this.emit("message", {
        id: Math.random().toString(36).substr(2, 9),
        taskId: context.taskId,
        content: response,
        timestamp: new Date(),
        type: this.getResponseType(message),
      })
    }
  }

  protected abstract shouldRespond(message: AgentMessage, context: AgentContext): Promise<boolean>
  protected abstract generateResponse(message: AgentMessage, context: AgentContext): Promise<string>
  protected abstract getResponseType(message: AgentMessage): AgentMessage["type"]
}

class PMAgent extends AIAgent {
  name = "pm"
  systemPrompt = `你是项目经理。监听群聊，当有新需求或需要协调时主动发言。`

  protected async shouldRespond(message: AgentMessage, context: AgentContext): Promise<boolean> {
    // PM在以下情况响应：
    // 1. 收到新的用户需求
    // 2. 被@提及
    // 3. 需要协调冲突
    return message.from === "human" || message.content.includes("@pm") || context.messages.length === 1 // 第一条消息
  }

  protected async generateResponse(message: AgentMessage, context: AgentContext): Promise<string> {
    const result = await generateText({
      model: openai("gpt-4o"),
      system: this.systemPrompt,
      messages: context.messages.map((m) => ({
        role: m.from === "human" ? "user" : "assistant",
        content: `[${m.from}]: ${m.content}`,
      })),
    })
    return result.text
  }

  protected getResponseType(): AgentMessage["type"] {
    return "message"
  }
}

class EngineerAgent extends AIAgent {
  name = "engineer"
  systemPrompt = `你是工程师。当PM分配任务或需要技术实现时响应。`

  protected async shouldRespond(message: AgentMessage, context: AgentContext): Promise<boolean> {
    return (
      message.from === "pm" ||
      message.content.includes("@engineer") ||
      message.content.includes("实现") ||
      message.content.includes("代码")
    )
  }

  protected async generateResponse(message: AgentMessage, context: AgentContext): Promise<string> {
    const result = await generateText({
      model: openai("gpt-4o"),
      system: this.systemPrompt,
      messages: context.messages.map((m) => ({
        role: m.from === "human" ? "user" : "assistant",
        content: `[${m.from}]: ${m.content}`,
      })),
    })
    return result.text
  }

  protected getResponseType(): AgentMessage["type"] {
    return "code"
  }
}

class QAAgent extends AIAgent {
  name = "qa"
  systemPrompt = `你是QA工程师。当有代码需要审查时主动响应。`

  protected async shouldRespond(message: AgentMessage, context: AgentContext): Promise<boolean> {
    return message.type === "code" || message.content.includes("@qa") || message.content.includes("测试")
  }

  protected async generateResponse(message: AgentMessage, context: AgentContext): Promise<string> {
    const result = await generateText({
      model: deepseek("deepseek-reasoner"),
      system: this.systemPrompt,
      messages: context.messages.map((m) => ({
        role: m.from === "human" ? "user" : "assistant",
        content: `[${m.from}]: ${m.content}`,
      })),
    })
    return result.text
  }

  protected getResponseType(): AgentMessage["type"] {
    return "review"
  }
}

export const realtimeMultiAgent = new RealTimeMultiAgentSystem()

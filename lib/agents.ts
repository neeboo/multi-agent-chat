import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { deepseek } from "@ai-sdk/deepseek"

export interface AgentMessage {
  id: string
  role: "human" | "pm" | "engineer" | "qa"
  content: string
  timestamp: Date
}

export interface TaskContext {
  id: string
  originalRequest: string
  messages: AgentMessage[]
  status: "processing" | "completed" | "failed"
}

class MultiAgentSystem {
  private generateId() {
    return Math.random().toString(36).substr(2, 9)
  }

  async processTask(userRequest: string): Promise<TaskContext> {
    const taskId = this.generateId()
    const context: TaskContext = {
      id: taskId,
      originalRequest: userRequest,
      messages: [],
      status: "processing",
    }

    try {
      // 添加用户消息
      context.messages.push({
        id: this.generateId(),
        role: "human",
        content: userRequest,
        timestamp: new Date(),
      })

      // 1. PM 分析需求
      const pmResponse = await this.callPM(userRequest)
      context.messages.push({
        id: this.generateId(),
        role: "pm",
        content: pmResponse,
        timestamp: new Date(),
      })

      // 2. Engineer 实现代码
      const engineerResponse = await this.callEngineer(pmResponse, userRequest)
      context.messages.push({
        id: this.generateId(),
        role: "engineer",
        content: engineerResponse,
        timestamp: new Date(),
      })

      // 3. QA 审查代码
      const qaResponse = await this.callQA(engineerResponse, userRequest)
      context.messages.push({
        id: this.generateId(),
        role: "qa",
        content: qaResponse,
        timestamp: new Date(),
      })

      context.status = "completed"
    } catch (error) {
      context.status = "failed"
      context.messages.push({
        id: this.generateId(),
        role: "pm",
        content: `系统错误: ${error instanceof Error ? error.message : "未知错误"}`,
        timestamp: new Date(),
      })
    }

    return context
  }

  private async callPM(request: string): Promise<string> {
    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system: `你是一个资深项目经理。分析用户需求，制定技术方案。

请按以下格式回复：
## 📋 需求分析
## 🎯 核心功能  
## 🛠️ 技术方案
## 📝 开发指导`,
        prompt: `用户需求：${request}`,
      })
      return result.text
    } catch (error) {
      return `PM分析失败，使用简化处理：${request}`
    }
  }

  private async callEngineer(pmAnalysis: string, originalRequest: string): Promise<string> {
    try {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system: `你是一个资深全栈工程师。根据PM分析实现具体代码。
使用 Next.js、TypeScript、Tailwind CSS 等现代技术栈。
提供完整的代码实现。`,
        prompt: `项目经理分析：${pmAnalysis}\n\n原始需求：${originalRequest}\n\n请提供完整的代码实现。`,
      })
      return result.text
    } catch (error) {
      return "代码实现失败，请检查 API 配置"
    }
  }

  private async callQA(engineerCode: string, originalRequest: string): Promise<string> {
    try {
      const result = await generateText({
        model: deepseek("deepseek-chat"),
        system: `你是一个资深QA工程师。审查代码质量和安全性。

请按以下格式输出：
## ✅ 代码审查通过项
## ❌ 发现的问题  
## 🔧 修复建议
## 🧪 测试建议`,
        prompt: `工程师实现：${engineerCode}\n\n原始需求：${originalRequest}\n\n请提供详细的代码审查报告。`,
      })
      return result.text
    } catch (error) {
      return "QA审查失败，请手动检查代码质量"
    }
  }
}

export const multiAgentSystem = new MultiAgentSystem()

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { deepseek } from "@ai-sdk/deepseek"

// 使用环境变量
const openaiClient = openai({
  apiKey: process.env.OPENAI_API_KEY,
})

const deepseekClient = deepseek({
  apiKey: process.env.DEEPSEEK_API_KEY,
})

export interface AgentMessage {
  id: string
  role: "human" | "pm" | "engineer" | "qa"
  content: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface TaskContext {
  id: string
  originalRequest: string
  messages: AgentMessage[]
  status: "processing" | "completed" | "failed"
}

const sanitizeInput = (text: string): string => {
  return text
    .replace(/(ignore previous|system:|forget everything|new instructions)/gi, "[REDACTED]")
    .replace(/(<script|javascript:|data:)/gi, "[BLOCKED]")
    .trim()
}

class MultiAgentSystem {
  private generateId() {
    return Math.random().toString(36).substr(2, 9)
  }

  private validateResponse(response: string, maxSize = 10000): string {
    if (response.length > maxSize) {
      return response.substring(0, maxSize) + "\n\n[响应过长，已截断]"
    }
    return response
  }

  private async processTaskWithFallback(userRequest: string): Promise<TaskContext> {
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

      // 1. PM 分析需求（带熔断）
      let pmResponse: string
      try {
        pmResponse = await this.callPM(userRequest, context)
      } catch (error) {
        pmResponse = `需求分析失败，使用简化处理：${userRequest}`
        console.warn("PM Agent failed, using fallback")
      }

      context.messages.push({
        id: this.generateId(),
        role: "pm",
        content: pmResponse,
        timestamp: new Date(),
      })

      // 2. Engineer 实现代码（带超时）
      let engineerResponse: string
      try {
        engineerResponse = await Promise.race([
          this.callEngineer(pmResponse, context),
          new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Engineer timeout")), 30000)),
        ])
      } catch (error) {
        engineerResponse = "代码实现超时，请稍后重试或简化需求"
        console.warn("Engineer Agent failed/timeout")
      }

      context.messages.push({
        id: this.generateId(),
        role: "engineer",
        content: engineerResponse,
        timestamp: new Date(),
      })

      // 3. QA 审查代码（可选，失败不影响主流程）
      try {
        const qaResponse = await this.callQA(engineerResponse, context)
        context.messages.push({
          id: this.generateId(),
          role: "qa",
          content: qaResponse,
          timestamp: new Date(),
        })
      } catch (error) {
        console.warn("QA Agent failed, skipping review")
        context.messages.push({
          id: this.generateId(),
          role: "qa",
          content: "QA审查暂时不可用，请手动检查代码质量",
          timestamp: new Date(),
        })
      }

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

  // 更新公共方法
  async processTask(userRequest: string): Promise<TaskContext> {
    return this.processTaskWithFallback(userRequest)
  }

  private async callPM(request: string, context: TaskContext): Promise<string> {
    const sanitizedRequest = sanitizeInput(request)
    const result = await generateText({
      model: openaiClient,
      system: `你是一个资深项目经理。你的职责是：
1. 分析用户需求，识别关键功能点
2. 制定技术实现方案
3. 为工程师提供清晰的开发指导
4. 协调团队协作

请用专业、简洁的语言回复。格式如下：
## 📋 需求分析
## 🎯 核心功能
## 🛠️ 技术方案
## 📝 开发指导`,
      prompt: `用户需求：${sanitizedRequest}

请分析这个需求并制定实现方案。`,
    })

    return this.validateResponse(result.text)
  }

  private async callEngineer(pmAnalysis: string, context: TaskContext): Promise<string> {
    const sanitizedPmAnalysis = sanitizeInput(pmAnalysis)
    const result = await generateText({
      model: openaiClient,
      system: `你是一个资深全栈工程师。你的职责是：
1. 根据PM的分析实现具体代码
2. 选择合适的技术栈
3. 编写清晰、可维护的代码
4. 提供完整的实现方案

请提供完整的代码实现，包括前端和后端。使用现代技术栈如Next.js、TypeScript等。`,
      prompt: `项目经理分析：
${sanitizedPmAnalysis}

原始需求：${context.originalRequest}

请提供完整的代码实现。`,
    })

    return this.validateResponse(result.text)
  }

  private async callQA(engineerCode: string, context: TaskContext): Promise<string> {
    const sanitizedEngineerCode = sanitizeInput(engineerCode)
    const result = await generateText({
      model: deepseekClient,
      system: `你是一个资深QA工程师。你的职责是：
1. 审查代码质量和安全性
2. 识别潜在的bug和问题
3. 提出测试建议
4. 评估代码的可维护性

请按以下格式输出：
## ✅ 代码审查通过项
## ❌ 发现的问题
## 🔧 修复建议
## 🧪 测试建议`,
      prompt: `请审查以下代码实现：

工程师实现：
${sanitizedEngineerCode}

原始需求：${context.originalRequest}

请提供详细的代码审查报告。`,
    })

    return this.validateResponse(result.text)
  }
}

export const multiAgentSystem = new MultiAgentSystem()

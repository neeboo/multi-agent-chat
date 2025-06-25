import { generateText } from "@/lib/llm"
import { openai } from "@/lib/llm"
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
    console.log(`🚀 [${taskId}] Starting multi-agent task processing`)
    console.log(`📝 [${taskId}] User request: "${userRequest}"`)

    const context: TaskContext = {
      id: taskId,
      originalRequest: userRequest,
      messages: [],
      status: "processing",
    }

    try {
      // 用户请求
      console.log(`👤 [${taskId}] Adding user message to context`)
      context.messages.push({
        id: this.generateId(),
        role: "human",
        content: userRequest,
        timestamp: new Date(),
      })

      // PM 分析
      console.log(`📋 [${taskId}] Calling PM agent...`)
      const pmResponse = await this.callPM(userRequest)
      console.log(`📋 [${taskId}] PM response length: ${pmResponse.length} chars`)
      context.messages.push({
        id: this.generateId(),
        role: "pm",
        content: pmResponse,
        timestamp: new Date(),
      })

      // 工程师实现
      console.log(`💻 [${taskId}] Calling Engineer agent...`)
      const engineerResponse = await this.callEngineer(pmResponse, userRequest)
      console.log(`💻 [${taskId}] Engineer response length: ${engineerResponse.length} chars`)
      context.messages.push({
        id: this.generateId(),
        role: "engineer",
        content: engineerResponse,
        timestamp: new Date(),
      })

      // QA 审查
      console.log(`🔍 [${taskId}] Calling QA agent...`)
      const qaResponse = await this.callQA(engineerResponse, userRequest)
      console.log(`🔍 [${taskId}] QA response length: ${qaResponse.length} chars`)
      context.messages.push({
        id: this.generateId(),
        role: "qa",
        content: qaResponse,
        timestamp: new Date(),
      })

      context.status = "completed"
      console.log(`✅ [${taskId}] Task completed successfully with ${context.messages.length} messages`)
    } catch (error) {
      console.error(`❌ [${taskId}] Task failed:`, error)
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

  /* ---------- private helpers ---------- */

  private async callPM(request: string): Promise<string> {
    console.log(`📋 PM: Starting analysis for request: "${request.substring(0, 50)}..."`)

    try {
      console.log(`📋 PM: Calling OpenAI GPT-4o-mini...`)
      const startTime = Date.now()

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

      const duration = Date.now() - startTime
      console.log(`📋 PM: OpenAI call completed in ${duration}ms`)
      console.log(`📋 PM: Response preview: "${result.text.substring(0, 100)}..."`)

      return result.text
    } catch (error) {
      console.error(`📋 PM: API call failed:`, error)
      const fallback = `PM分析失败，简要输出：${request}`
      console.log(`📋 PM: Using fallback response: "${fallback}"`)
      return fallback
    }
  }

  private async callEngineer(pmAnalysis: string, originalRequest: string): Promise<string> {
    console.log(`💻 Engineer: Starting implementation based on PM analysis`)
    console.log(`💻 Engineer: PM analysis length: ${pmAnalysis.length} chars`)

    try {
      console.log(`💻 Engineer: Calling OpenAI GPT-4o-mini...`)
      const startTime = Date.now()

      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system: `你是一个资深全栈工程师。根据PM分析实现具体代码。`,
        prompt: `项目经理分析：${pmAnalysis}

原始需求：${originalRequest}

请提供完整的代码实现。`,
      })

      const duration = Date.now() - startTime
      console.log(`💻 Engineer: OpenAI call completed in ${duration}ms`)
      console.log(`💻 Engineer: Response preview: "${result.text.substring(0, 100)}..."`)

      return result.text
    } catch (error) {
      console.error(`💻 Engineer: API call failed:`, error)
      const fallback = "代码实现失败，请检查 API 配置"
      console.log(`💻 Engineer: Using fallback response: "${fallback}"`)
      return fallback
    }
  }

  private async callQA(engineerCode: string, originalRequest: string): Promise<string> {
    console.log(`🔍 QA: Starting code review`)
    console.log(`🔍 QA: Engineer code length: ${engineerCode.length} chars`)

    try {
      console.log(`🔍 QA: Calling DeepSeek chat model...`)
      const startTime = Date.now()

      const result = await generateText({
        model: deepseek("deepseek-chat"),
        system: `你是QA工程师。审查代码质量并提出测试建议。`,
        prompt: `工程师实现：${engineerCode}

原始需求：${originalRequest}

请输出详细的审查报告。`,
      })

      const duration = Date.now() - startTime
      console.log(`🔍 QA: DeepSeek call completed in ${duration}ms`)
      console.log(`🔍 QA: Response preview: "${result.text.substring(0, 100)}..."`)

      return result.text
    } catch (error) {
      console.error(`🔍 QA: API call failed:`, error)
      const fallback = "QA审查失败，请手动检查代码质量"
      console.log(`🔍 QA: Using fallback response: "${fallback}"`)
      return fallback
    }
  }
}

/* ---------- named export expected by build ---------- */
export const multiAgentSystem = new MultiAgentSystem()

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { deepseek } from "@ai-sdk/deepseek"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
  agent?: "pm" | "engineer" | "tester" | "human"
  timestamp: Date
}

interface AgentContext {
  messages: Message[]
  currentTask?: string
  projectState?: any
}

class MultiAgentOrchestrator {
  private context: AgentContext = { messages: [] }

  private agents = {
    pm: {
      model: openai("gpt-4o"),
      systemPrompt: `You are a Project Manager. Analyze requirements, create detailed specs, and coordinate between engineer and tester. Always format your response with clear action items for other agents.`,
    },
    engineer: {
      model: openai("gpt-4o"),
      systemPrompt: `You are a Senior Software Engineer. Write clean, production-ready code based on PM specifications. Include proper error handling, types, and documentation.`,
    },
    tester: {
      model: deepseek("deepseek-reasoner"),
      systemPrompt: `You are a QA Engineer. Review code for bugs, edge cases, and write comprehensive test cases. Provide detailed feedback and suggestions.`,
    },
  }

  async processUserRequest(userInput: string): Promise<string> {
    // 添加用户消息到上下文
    this.addMessage("user", userInput, "human")

    // 1. PM分析需求
    const pmResponse = await this.callAgent("pm", userInput)
    this.addMessage("assistant", pmResponse, "pm")

    // 2. Engineer实现代码
    const engineerResponse = await this.callAgent(
      "engineer",
      `Based on PM analysis: ${pmResponse}\nImplement the solution.`,
    )
    this.addMessage("assistant", engineerResponse, "engineer")

    // 3. Tester审查代码
    const testerResponse = await this.callAgent("tester", `Review this code implementation: ${engineerResponse}`)
    this.addMessage("assistant", testerResponse, "tester")

    // 4. PM汇总结果
    const finalSummary = await this.callAgent(
      "pm",
      `Summarize the complete solution:\nCode: ${engineerResponse}\nTest Feedback: ${testerResponse}`,
    )

    return this.formatFinalResponse(pmResponse, engineerResponse, testerResponse, finalSummary)
  }

  private async callAgent(agentType: keyof typeof this.agents, prompt: string): Promise<string> {
    const agent = this.agents[agentType]

    const result = await generateText({
      model: agent.model,
      system: agent.systemPrompt,
      messages: [
        ...this.context.messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        { role: "user", content: prompt },
      ],
    })

    return result.text
  }

  private addMessage(role: Message["role"], content: string, agent?: Message["agent"]) {
    this.context.messages.push({
      role,
      content,
      agent,
      timestamp: new Date(),
    })
  }

  private formatFinalResponse(pm: string, engineer: string, tester: string, summary: string): string {
    return `
## 🎯 Project Manager Analysis
${pm}

## 💻 Engineer Implementation  
${engineer}

## 🔍 QA Testing Report
${tester}

## 📋 Final Summary
${summary}
    `
  }

  // 获取完整对话历史
  getConversationHistory(): Message[] {
    return this.context.messages
  }

  // 重置上下文
  resetContext() {
    this.context = { messages: [] }
  }
}

export { MultiAgentOrchestrator }

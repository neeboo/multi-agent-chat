import { multiAgentSystem } from "@/lib/agents"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9)
  console.log(`🌐 [${requestId}] Incoming POST request to /api/multi-agent`)

  try {
    console.log(`🌐 [${requestId}] Parsing request body...`)
    const { message } = await req.json()
    console.log(`🌐 [${requestId}] Request body parsed successfully`)

    // 输入验证
    if (!message || typeof message !== "string") {
      console.log(`🌐 [${requestId}] Validation failed: empty or invalid message`)
      return Response.json({ error: "消息内容不能为空" }, { status: 400 })
    }

    if (message.length > 2000) {
      console.log(`🌐 [${requestId}] Validation failed: message too long (${message.length} chars)`)
      return Response.json({ error: "消息长度不能超过2000字符" }, { status: 400 })
    }

    console.log(`🌐 [${requestId}] Input validation passed`)
    console.log(`🌐 [${requestId}] Message: "${message.substring(0, 100)}${message.length > 100 ? "..." : ""}"`)

    // 调用多智能体系统
    console.log(`🌐 [${requestId}] Calling multiAgentSystem.processTask()...`)
    const result = await multiAgentSystem.processTask(message)
    console.log(`🌐 [${requestId}] multiAgentSystem.processTask() completed`)
    console.log(`🌐 [${requestId}] Result status: ${result.status}`)
    console.log(`🌐 [${requestId}] Result messages count: ${result.messages.length}`)

    console.log(`🌐 [${requestId}] Sending successful response`)
    return Response.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error(`🌐 [${requestId}] Error in multi-agent processing:`, error)
    console.error(`🌐 [${requestId}] Error stack:`, error instanceof Error ? error.stack : "No stack trace")

    // 返回更详细的错误信息
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "处理请求时发生未知错误",
        requestId,
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}

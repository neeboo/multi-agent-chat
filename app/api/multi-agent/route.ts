import { multiAgentSystem } from "@/lib/agents"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    // 输入验证
    if (!message || typeof message !== "string") {
      return Response.json({ error: "消息内容不能为空" }, { status: 400 })
    }

    if (message.length > 2000) {
      return Response.json({ error: "消息长度不能超过2000字符" }, { status: 400 })
    }

    console.log("Processing request:", message.substring(0, 50) + "...")

    // 调用多智能体系统
    const result = await multiAgentSystem.processTask(message)

    console.log("Task completed:", result.status)

    return Response.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Multi-agent processing error:", error)

    // 返回更详细的错误信息
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "处理请求时发生未知错误",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 },
    )
  }
}

import { multiAgentSystem } from "@/lib/agents"
import type { NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json()

    if (!message || typeof message !== "string") {
      return Response.json({ error: "消息内容不能为空" }, { status: 400 })
    }

    if (message.length > 2000) {
      return Response.json({ error: "消息长度不能超过2000字符" }, { status: 400 })
    }

    const result = await multiAgentSystem.processTask(message)

    return Response.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Multi-agent processing error:", error)
    return Response.json({ error: "处理请求时发生错误" }, { status: 500 })
  }
}

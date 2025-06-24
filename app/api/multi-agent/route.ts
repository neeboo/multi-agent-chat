import { multiAgentSystem } from "@/lib/agents"
import { AgentRequestSchema } from "./schema"
import { z } from "zod"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // 验证输入
    const validatedData = AgentRequestSchema.parse(body)

    const result = await multiAgentSystem.processTask(validatedData.message)

    return Response.json({
      success: true,
      data: result,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: "输入验证失败", details: error.errors }, { status: 400 })
    }

    console.error("Multi-agent processing error:", error)
    return Response.json({ error: "处理请求时发生错误" }, { status: 500 })
  }
}

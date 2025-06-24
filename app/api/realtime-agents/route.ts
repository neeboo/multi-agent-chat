import { realtimeMultiAgent } from "@/lib/realtime-agents"

export async function POST(req: Request) {
  try {
    const { action, taskId, message } = await req.json()

    switch (action) {
      case "start_task":
        await realtimeMultiAgent.startTask(taskId, message)
        return Response.json({ success: true })

      case "get_context":
        const context = realtimeMultiAgent.getTaskContext(taskId)
        return Response.json({ context })

      default:
        return Response.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    return Response.json({ error: "Server error" }, { status: 500 })
  }
}

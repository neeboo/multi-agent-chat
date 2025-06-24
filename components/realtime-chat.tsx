"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AgentMessage {
  id: string
  from: string
  content: string
  timestamp: Date
  type: "message" | "code" | "review" | "question"
}

export default function RealtimeChat() {
  const [messages, setMessages] = useState<AgentMessage[]>([])
  const [input, setInput] = useState("")
  const [taskId] = useState(() => Math.random().toString(36).substr(2, 9))

  const startTask = async () => {
    if (!input.trim()) return

    await fetch("/api/realtime-agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "start_task",
        taskId,
        message: input,
      }),
    })

    setInput("")

    // 开始轮询获取消息（实际项目中应该用WebSocket）
    pollMessages()
  }

  const pollMessages = async () => {
    const response = await fetch("/api/realtime-agents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_context",
        taskId,
      }),
    })

    const { context } = await response.json()
    if (context) {
      setMessages(context.messages)
    }

    // 继续轮询
    setTimeout(pollMessages, 2000)
  }

  const roleColors = {
    human: "bg-blue-100 text-blue-800",
    pm: "bg-green-100 text-green-800",
    engineer: "bg-purple-100 text-purple-800",
    qa: "bg-orange-100 text-orange-800",
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>🤖 实时多Agent群聊</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="描述你的需求，AI团队将自动协作..."
            />
            <Button onClick={startTask}>发起任务</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="border rounded p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={roleColors[msg.from as keyof typeof roleColors]}>{msg.from}</Badge>
                  <span className="text-sm text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

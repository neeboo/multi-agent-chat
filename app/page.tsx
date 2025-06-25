"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Send, User, Briefcase, Code, Bug } from "lucide-react"

interface AgentMessage {
  id: string
  role: "human" | "pm" | "engineer" | "qa"
  content: string
  timestamp: Date
}

interface TaskContext {
  id: string
  originalRequest: string
  messages: AgentMessage[]
  status: "processing" | "completed" | "failed"
}

const roleConfig = {
  human: { name: "👤 Human", icon: User, color: "bg-blue-100 text-blue-800" },
  pm: { name: "📋 Project Manager", icon: Briefcase, color: "bg-green-100 text-green-800" },
  engineer: { name: "💻 Engineer", icon: Code, color: "bg-purple-100 text-purple-800" },
  qa: { name: "🔍 QA Engineer", icon: Bug, color: "bg-orange-100 text-orange-800" },
}

export default function Home() {
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentTask, setCurrentTask] = useState<TaskContext | null>(null)
  const [taskHistory, setTaskHistory] = useState<TaskContext[]>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setCurrentTask(null)

    try {
      const response = await fetch("/api/multi-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })

      const result = await response.json()

      if (result.success) {
        setCurrentTask(result.data)
        setTaskHistory((prev) => [result.data, ...prev])
      } else {
        console.error("API Error:", result.error)
        // 显示错误信息
        alert(`错误: ${result.error}`)
      }
    } catch (error) {
      console.error("Request failed:", error)
      alert("请求失败，请检查网络连接")
    } finally {
      setIsLoading(false)
      setInput("")
    }
  }

  const formatContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("##")) {
        return (
          <h3 key={index} className="font-bold text-lg mt-4 mb-2">
            {line.replace("##", "").trim()}
          </h3>
        )
      }
      if (line.startsWith("```")) {
        return (
          <div key={index} className="bg-gray-100 p-2 rounded text-sm font-mono my-2">
            {line}
          </div>
        )
      }
      return (
        <p key={index} className="mb-2">
          {line}
        </p>
      )
    })
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 Multi-Agent Development System
            {isLoading && <Loader2 className="h-5 w-5 animate-spin" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="描述你的开发需求..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {!process.env.NEXT_PUBLIC_API_CONFIGURED && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                💡 <strong>提示：</strong>需要配置 OpenAI 和 DeepSeek API 密钥才能使用完整功能
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {currentTask && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>当前任务</CardTitle>
              <Badge variant={currentTask.status === "completed" ? "default" : "secondary"}>
                {currentTask.status === "processing"
                  ? "处理中"
                  : currentTask.status === "completed"
                    ? "已完成"
                    : "失败"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentTask.messages.map((message) => {
                const config = roleConfig[message.role]
                const Icon = config.icon

                return (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="h-5 w-5" />
                      <Badge className={config.color}>{config.name}</Badge>
                      <span className="text-sm text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="prose max-w-none">{formatContent(message.content)}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {taskHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>历史任务</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {taskHistory.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-gray-50"
                  onClick={() => setCurrentTask(task)}
                >
                  <span className="truncate flex-1">{task.originalRequest}</span>
                  <Badge variant={task.status === "completed" ? "default" : "secondary"}>
                    {task.status === "completed" ? "已完成" : task.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

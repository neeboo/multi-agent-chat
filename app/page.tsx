"use client"

import React from "react"
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
  const [apiStatus, setApiStatus] = useState<"checking" | "configured" | "missing">("checking")
  const [lastError, setLastError] = useState<string | null>(null)

  // 检查 API 配置状态
  const checkApiStatus = async () => {
    try {
      const response = await fetch("/api/health")
      if (response.ok) {
        setApiStatus("configured")
      } else {
        setApiStatus("missing")
      }
    } catch {
      setApiStatus("missing")
    }
  }

  React.useEffect(() => {
    checkApiStatus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    setIsLoading(true)
    setCurrentTask(null)
    setLastError(null)

    try {
      console.log("Sending request to /api/multi-agent...")

      const response = await fetch("/api/multi-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      })

      console.log("Response status:", response.status)

      const result = await response.json()
      console.log("Response data:", result)

      if (result.success) {
        setCurrentTask(result.data)
        setTaskHistory((prev) => [result.data, ...prev])
        setApiStatus("configured")
      } else {
        const errorMsg = result.error || "未知错误"
        setLastError(errorMsg)
        console.error("API Error:", result)
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "网络请求失败"
      setLastError(errorMsg)
      console.error("Request failed:", error)
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
            {apiStatus === "configured" && <Badge className="bg-green-100 text-green-800">✅ API 已配置</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="描述你的开发需求，例如：创建一个用户登录页面"
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>

          {/* 错误提示 */}
          {lastError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                ❌ <strong>错误：</strong>
                {lastError}
              </p>
            </div>
          )}

          {apiStatus === "missing" && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                💡 <strong>提示：</strong>需要配置 OpenAI 和 DeepSeek API 密钥才能使用完整功能
              </p>
            </div>
          )}

          {apiStatus === "configured" && !lastError && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">
                🎉 <strong>就绪：</strong>AI 团队已准备好为你服务！
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

      {taskHistory.length === 0 && !currentTask && apiStatus === "configured" && !lastError && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
              <h3 className="text-lg font-medium mb-2">🚀 AI 团队准备就绪</h3>
              <p>输入你的开发需求，AI 团队将自动协作完成任务</p>
              <div className="mt-4 text-sm space-y-1">
                <p>📋 项目经理：需求分析和方案制定</p>
                <p>💻 工程师：代码实现和技术方案</p>
                <p>🔍 QA工程师：代码审查和测试建议</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

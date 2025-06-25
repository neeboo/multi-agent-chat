"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<
    Array<{
      id: string
      role: string
      content: string
      timestamp: Date
    }>
  >([])
  const [loading, setLoading] = useState(false)

  const simulateAgentResponse = (userInput: string) => {
    const responses = [
      {
        role: "PM",
        content: `## 📋 需求分析\n收到需求：${userInput}\n\n## 🎯 核心功能\n- 用户界面设计\n- 后端API开发\n- 数据库设计\n\n## 🛠️ 技术方案\n使用 Next.js + TypeScript + Tailwind CSS`,
      },
      {
        role: "Engineer",
        content: `## 💻 代码实现\n\n\`\`\`typescript\n// 示例代码\nfunction handleUserRequest(input: string) {\n  return {\n    success: true,\n    data: input\n  }\n}\n\`\`\`\n\n已完成基础架构搭建。`,
      },
      {
        role: "QA",
        content: `## 🔍 质量审查\n\n✅ **通过项**\n- 代码结构清晰\n- 类型定义完整\n\n⚠️ **建议**\n- 添加错误处理\n- 增加单元测试\n\n## 🧪 测试建议\n- 功能测试\n- 性能测试`,
      },
    ]

    return responses
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    setLoading(true)

    // 添加用户消息
    const userMessage = {
      id: Date.now().toString(),
      role: "Human",
      content: input,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // 模拟AI响应
    const responses = simulateAgentResponse(input)

    for (let i = 0; i < responses.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const agentMessage = {
        id: (Date.now() + i).toString(),
        role: responses[i].role,
        content: responses[i].content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, agentMessage])
    }

    setInput("")
    setLoading(false)
  }

  const roleColors = {
    Human: "bg-blue-100 text-blue-800",
    PM: "bg-green-100 text-green-800",
    Engineer: "bg-purple-100 text-purple-800",
    QA: "bg-orange-100 text-orange-800",
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-6xl p-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🤖 Multi-Agent Development System</h1>
          <p className="text-gray-600">AI团队协作开发平台 - 演示版本</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>💬 发起开发任务</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="描述你的开发需求，例如：创建一个用户登录页面"
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? "AI团队协作中..." : "发起任务"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {messages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>🗣️ 团队协作过程</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {messages.map((message) => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={roleColors[message.role as keyof typeof roleColors]}>{message.role}</Badge>
                      <span className="text-sm text-gray-500">{message.timestamp.toLocaleTimeString()}</span>
                    </div>
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {messages.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-gray-500">
                <h3 className="text-lg font-medium mb-2">准备就绪</h3>
                <p>输入你的开发需求，AI团队将自动协作完成任务</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

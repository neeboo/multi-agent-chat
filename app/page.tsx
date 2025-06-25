"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [input, setInput] = useState("")
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    try {
      // 模拟 AI 响应
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setResponse(`模拟 AI 响应：${input}`)
    } catch (error) {
      setResponse("发生错误，请稍后重试")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Multi-Agent Chat System</h1>
          <p className="text-gray-600">AI团队协作开发平台 - 简化版本</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🤖 发送消息</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="描述你的开发需求..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? "处理中..." : "发送"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {response && (
          <Card>
            <CardHeader>
              <CardTitle>📋 响应结果</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{response}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

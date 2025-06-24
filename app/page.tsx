import MultiAgentChat from "@/components/multi-agent-chat"

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Multi-Agent Development System</h1>
          <p className="text-gray-600">AI团队协作开发平台 - PM、工程师、QA自动协作完成开发任务</p>
        </div>
        <MultiAgentChat />
      </div>
    </main>
  )
}

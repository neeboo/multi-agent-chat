export async function GET() {
  const openaiKey = process.env.OPENAI_API_KEY
  const deepseekKey = process.env.DEEPSEEK_API_KEY

  return Response.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    keys: {
      openai: openaiKey ? `${openaiKey.substring(0, 10)}...` : "MISSING",
      deepseek: deepseekKey ? `${deepseekKey.substring(0, 10)}...` : "MISSING",
    },
    // 测试简单的 API 调用
    test: "debug endpoint working",
  })
}

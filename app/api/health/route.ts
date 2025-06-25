export async function GET() {
  // 检查环境变量是否配置
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY

  const isConfigured = hasOpenAI && hasDeepSeek

  return Response.json(
    {
      status: isConfigured ? "healthy" : "missing_config",
      timestamp: new Date().toISOString(),
      message: isConfigured ? "Multi-Agent System is ready" : "Missing API keys",
      apis: {
        openai: hasOpenAI,
        deepseek: hasDeepSeek,
      },
    },
    {
      status: isConfigured ? 200 : 503,
    },
  )
}

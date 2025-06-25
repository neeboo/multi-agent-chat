import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function GET() {
  try {
    // 测试 OpenAI API
    const result = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: "Say hello in one word",
      maxTokens: 10,
    })

    return Response.json({
      success: true,
      message: "AI API working",
      response: result.text,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

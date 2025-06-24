import { multiAgentSystem } from "@/lib/agents"

// Mock the AI SDK
jest.mock("ai", () => ({
  generateText: jest.fn(),
}))

jest.mock("@ai-sdk/openai", () => ({
  openai: jest.fn(),
}))

jest.mock("@ai-sdk/deepseek", () => ({
  deepseek: jest.fn(),
}))

describe("Multi-Agent System", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()
  })

  test("should process task and return context", async () => {
    // Mock generateText to return predictable responses
    const { generateText } = require("ai")
    generateText.mockResolvedValue({ text: "Mock response" })

    const result = await multiAgentSystem.processTask("Create a login page")

    expect(result).toHaveProperty("id")
    expect(result).toHaveProperty("originalRequest", "Create a login page")
    expect(result).toHaveProperty("messages")
    expect(result).toHaveProperty("status")
    expect(result.messages.length).toBeGreaterThan(0)
  })

  test("should handle errors gracefully", async () => {
    const { generateText } = require("ai")
    generateText.mockRejectedValue(new Error("API Error"))

    const result = await multiAgentSystem.processTask("Invalid request")

    expect(result.status).toBe("failed")
    expect(result.messages.some((msg) => msg.content.includes("系统错误"))).toBe(true)
  })
})

describe("Basic functionality", () => {
  test("should pass basic test", () => {
    expect(1 + 1).toBe(2)
  })

  test("should have required environment variables in production", () => {
    // 这个测试在 CI 中会检查环境变量
    if (process.env.NODE_ENV === "production") {
      expect(process.env.OPENAI_API_KEY).toBeDefined()
      expect(process.env.DEEPSEEK_API_KEY).toBeDefined()
    }
  })
})

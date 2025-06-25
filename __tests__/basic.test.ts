describe("Basic functionality", () => {
  test("should pass basic test", () => {
    expect(1 + 1).toBe(2)
  })

  test("environment should be properly configured", () => {
    // 基本的环境检查
    expect(process.env.NODE_ENV).toBeDefined()
  })
})

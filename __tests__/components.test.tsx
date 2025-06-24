import { render, screen } from "@testing-library/react"
import MultiAgentChat from "@/components/multi-agent-chat"
import { jest } from "@jest/globals"

// Mock fetch
global.fetch = jest.fn()

describe("MultiAgentChat Component", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("renders chat interface", () => {
    render(<MultiAgentChat />)

    expect(screen.getByText("Multi-Agent Development System")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("描述你的开发需求...")).toBeInTheDocument()
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  test("displays input field and submit button", () => {
    render(<MultiAgentChat />)

    const input = screen.getByPlaceholderText("描述你的开发需求...")
    const button = screen.getByRole("button")

    expect(input).toBeInTheDocument()
    expect(button).toBeInTheDocument()
  })
})

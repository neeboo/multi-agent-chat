/**
 * Centralised AI-SDK helpers
 *
 * Any file can now simply
 *   import { generateText, openai } from "@/lib/llm"
 * instead of pulling them from different packages.
 */
export { generateText } from "ai"
export { openai } from "@ai-sdk/openai"

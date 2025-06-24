import { z } from "zod"

export const AgentRequestSchema = z.object({
  message: z
    .string()
    .min(1, "消息不能为空")
    .max(2000, "消息长度不能超过2000字符")
    .refine((text) => !text.match(/(ignore previous|system:|forget everything)/gi), "消息包含不安全内容"),
})

export type AgentRequest = z.infer<typeof AgentRequestSchema>

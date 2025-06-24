interface CostConfig {
  [model: string]: number // 每1K tokens的成本
}

const COST_RATES: CostConfig = {
  "gpt-4o": 0.005,
  "deepseek-reasoner": 0.001,
  "gpt-3.5-turbo": 0.0015,
}

export class CostTracker {
  private static totalCost = 0

  static trackUsage(model: string, tokens: number): number {
    const rate = COST_RATES[model] || 0.002 // 默认费率
    const cost = (tokens / 1000) * rate
    this.totalCost += cost

    console.log(`💰 API调用成本: ${model} - ${tokens} tokens - $${cost.toFixed(4)}`)
    console.log(`💰 累计成本: $${this.totalCost.toFixed(4)}`)

    return cost
  }

  static getTotalCost(): number {
    return this.totalCost
  }

  static reset(): void {
    this.totalCost = 0
  }
}

// ─── 全局类型定义 ────────────────────────────────────────────────────────────

export type Direction = 'long' | 'short'
export type EntryType = 'market' | 'limit'
export type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D'
export type PollingUnit = 'seconds' | 'minutes' | 'hours'

// ─── 区块 A：基础交易设置 ───────────────────────────────────────────────────

export interface BlockA {
  symbol: string          // 交易标的
  direction: Direction    // 做多 / 做空
  deadline: string        // ISO 8601 datetime string (北京时间)
  timeframe: Timeframe    // 时间框架
  amount: number          // 投入资金 (USDT)
  leverage: number        // 杠杆倍数 1-125
  entryType: EntryType    // 市价 / 限价
  limitPrice?: number     // 仅限价时有效
}

// ─── 区块 B：风控与巡检规则 ─────────────────────────────────────────────────

export interface BlockB {
  stopLossOffset: number        // 止损偏移量 USDT（负数方向由方向决定）
  takeProfitPct: number         // 止盈百分比 %
  pollingValue: string          // 巡检时间值 e.g. "5~10"
  pollingUnit: PollingUnit      // 巡检时间单位
  trailingTriggerPct: number    // 移动止损触发条件 %
  trailingStepPct: number       // 移动止损步长 %
}

// ─── 区块 C：量化策略 ────────────────────────────────────────────────────────

export interface Strategy {
  id: string
  name: string
  content: string   // 完整的量化规则自然语言文本
  createdAt: string // ISO datetime
  updatedAt: string
}

// ─── 全局预设 ────────────────────────────────────────────────────────────────

export interface Template {
  id: string
  name: string
  blockA: BlockA
  blockB: BlockB
  strategyId: string    // 关联 Strategy.id
  createdAt: string
  updatedAt: string
}

// ─── 完整表单状态 ────────────────────────────────────────────────────────────

export interface FormState {
  blockA: BlockA
  blockB: BlockB
  selectedStrategyId: string
}

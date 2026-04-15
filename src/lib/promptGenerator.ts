import { BlockA, BlockB, Direction, Timeframe } from '../types'

// ─── 北京时间格式化 ───────────────────────────────────────────────────────────

/**
 * 将 ISO datetime string 格式化为北京时间自然语言
 * e.g. "2024-04-17T22:16:00" -> "2024年4月17日22:16"
 */
export function formatBeijingTime(isoString: string): string {
  if (!isoString) return '（未设置期限）'
  try {
    const d = new Date(isoString)
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    return `${year}年${month}月${day}日${hours}:${minutes}`
  } catch {
    return isoString
  }
}

// ─── 方向文本 ────────────────────────────────────────────────────────────────

const DIRECTION_TEXT: Record<Direction, string> = {
  long:  '做多',
  short: '做空',
}

const DIRECTION_STOP_REF: Record<Direction, string> = {
  long:  '最低价',
  short: '最高价',
}

const DIRECTION_STOP_OP: Record<Direction, string> = {
  long:  '下方再减',
  short: '上方再加',
}

const DIRECTION_TP_OP: Record<Direction, string> = {
  long:  '再加',
  short: '再减',
}

const TIMEFRAME_TEXT: Record<Timeframe, string> = {
  '1m':  '1分钟',
  '5m':  '5分钟',
  '15m': '15分钟',
  '1H':  '1小时',
  '4H':  '4小时',
  '1D':  '日线',
}

const POLLING_UNIT_TEXT: Record<string, string> = {
  seconds: '秒',
  minutes: '分钟',
  hours:   '小时',
}

// ─── 主生成函数 ───────────────────────────────────────────────────────────────

export function generatePrompt(
  blockA: BlockA,
  blockB: BlockB,
  strategyName: string,
  strategyContent: string,
): string {
  const {
    symbol, direction, deadline, timeframe,
    amount, leverage, entryType, limitPrice,
  } = blockA

  const {
    stopLossOffset, takeProfitPct,
    pollingValue, pollingUnit,
    trailingTriggerPct, trailingStepPct,
  } = blockB

  const tfText   = TIMEFRAME_TEXT[timeframe] ?? timeframe
  const dirText  = DIRECTION_TEXT[direction]
  const stopRef  = DIRECTION_STOP_REF[direction]
  const stopOp   = DIRECTION_STOP_OP[direction]
  const tpOp     = DIRECTION_TP_OP[direction]
  const puText   = POLLING_UNIT_TEXT[pollingUnit] ?? pollingUnit
  const deadlineText = formatBeijingTime(deadline)

  const entryLine = entryType === 'market'
    ? '市价入场。'
    : `限价入场，入场价格为 ${limitPrice ?? '（请填写限价）'} USDT。`

  const trailingLine = (trailingTriggerPct > 0 && trailingStepPct > 0)
    ? `订单成交入场后，如每${tfText}标整点时刻结束之后${pollingValue}${puText}，检查上一根收盘价，如果比入场价${direction === 'long' ? '上升' : '下跌'}${trailingTriggerPct}%的，则止损价也${direction === 'long' ? '上升' : '下移'}${trailingStepPct}%，之后按那根新的收盘价做一次的参考。`
    : ''

  return `标的：${symbol}
条件：在北京时间${deadlineText}之前，如果在${tfText}时间框架，出现标准的${strategyName}（具体规则请见下方），直接执行交易下单。
交易金额为${amount} USDT。
交易杠杆为${leverage}X。
方向${dirText}。
${entryLine}
止损：${stopRef}${stopOp}${stopLossOffset} USDT。
止盈：入场价${tpOp}${takeProfitPct}个百分比。
每${tfText}标整点时刻结束之后${pollingValue}${puText}，检查有没有符合上述条件，并发送检查结果。
${trailingLine}

关于${strategyName}的量化规则：
${strategyContent}`
}

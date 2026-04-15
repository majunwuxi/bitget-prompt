import { BlockB, PollingUnit } from '../types'

interface Props {
  value: BlockB
  onChange: (v: BlockB) => void
}

const POLLING_UNITS: { value: PollingUnit; label: string }[] = [
  { value: 'seconds', label: '秒' },
  { value: 'minutes', label: '分钟' },
  { value: 'hours',   label: '小时' },
]

export default function BlockBPanel({ value, onChange }: Props) {
  const set = <K extends keyof BlockB>(k: K, v: BlockB[K]) =>
    onChange({ ...value, [k]: v })

  return (
    <div className="card space-y-4">
      <div className="section-title">
        <span className="w-5 h-5 rounded bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">B</span>
        风控与巡检规则
      </div>

      {/* Stop Loss */}
      <div>
        <label className="field-label">止损偏移量</label>
        <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>
          相对于关键价位（做多取最低价 / 做空取最高价）的偏移量
        </p>
        <div className="relative">
          <input
            type="number"
            min={0}
            step={0.1}
            className="input-base pr-16"
            value={value.stopLossOffset}
            onChange={e => set('stopLossOffset', Number(e.target.value))}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
            style={{ color: 'var(--text-muted)' }}>USDT</span>
        </div>
      </div>

      {/* Take Profit */}
      <div>
        <label className="field-label">止盈百分比</label>
        <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>基于入场价的盈利百分比</p>
        <div className="relative">
          <input
            type="number"
            min={0}
            step={0.1}
            className="input-base pr-8"
            value={value.takeProfitPct}
            onChange={e => set('takeProfitPct', Number(e.target.value))}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
            style={{ color: 'var(--text-muted)' }}>%</span>
        </div>
      </div>

      {/* Polling */}
      <div>
        <label className="field-label">巡检频率</label>
        <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>每根K线收盘后多久检查一次</p>
        <div className="flex gap-2">
          <input
            type="text"
            className="input-base flex-1"
            placeholder="e.g. 5~10"
            value={value.pollingValue}
            onChange={e => set('pollingValue', e.target.value)}
          />
          <select
            className="select-base w-28"
            value={value.pollingUnit}
            onChange={e => set('pollingUnit', e.target.value as PollingUnit)}
          >
            {POLLING_UNITS.map(u => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Trailing Stop */}
      <div>
        <label className="field-label">移动止损</label>
        <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>价格达到触发条件时，止损价同步移动</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>触发条件（价格变动 %）</label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={0.1}
                className="input-base pr-8"
                value={value.trailingTriggerPct}
                onChange={e => set('trailingTriggerPct', Number(e.target.value))}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                style={{ color: 'var(--text-muted)' }}>%</span>
            </div>
          </div>
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>移动步长（止损移动 %）</label>
            <div className="relative">
              <input
                type="number"
                min={0}
                step={0.1}
                className="input-base pr-8"
                value={value.trailingStepPct}
                onChange={e => set('trailingStepPct', Number(e.target.value))}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                style={{ color: 'var(--text-muted)' }}>%</span>
            </div>
          </div>
        </div>
        {(value.trailingTriggerPct === 0 || value.trailingStepPct === 0) && (
          <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
            触发 / 步长为 0 则不生成移动止损描述
          </p>
        )}
      </div>
    </div>
  )
}

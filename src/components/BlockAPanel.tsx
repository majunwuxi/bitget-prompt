import { useState } from 'react'
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { BlockA, Direction, EntryType, Timeframe } from '../types'
import clsx from 'clsx'

interface Props {
  value: BlockA
  symbols: string[]
  onChange: (v: BlockA) => void
  onAddSymbol: (s: string) => void
  onRemoveSymbol: (s: string) => void
}

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1H', '4H', '1D']

export default function BlockAPanel({ value, symbols, onChange, onAddSymbol, onRemoveSymbol }: Props) {
  const [newSymbol, setNewSymbol] = useState('')
  const [showSymbolMgr, setShowSymbolMgr] = useState(false)

  const set = <K extends keyof BlockA>(k: K, v: BlockA[K]) =>
    onChange({ ...value, [k]: v })

  const handleAddSymbol = () => {
    const s = newSymbol.trim().toUpperCase()
    if (s && !symbols.includes(s)) {
      onAddSymbol(s)
      setNewSymbol('')
    }
  }

  return (
    <div className="card space-y-4">
      <div className="section-title">
        <span className="w-5 h-5 rounded bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">A</span>
        基础交易设置
      </div>

      {/* Symbol */}
      <div>
        <label className="field-label">交易标的 (Symbol)</label>
        <div className="flex gap-2">
          <select
            className="select-base flex-1"
            value={value.symbol}
            onChange={e => set('symbol', e.target.value)}
          >
            {symbols.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setShowSymbolMgr(v => !v)}
            title="管理标的列表"
          >
            {showSymbolMgr ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            管理
          </button>
        </div>

        {/* Symbol Manager */}
        {showSymbolMgr && (
          <div className="symbol-mgr-panel space-y-2">
            <div className="flex gap-2">
              <input
                className="input-base flex-1 text-xs py-1.5"
                placeholder="输入新标的，如 BNBUSDT"
                value={newSymbol}
                onChange={e => setNewSymbol(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSymbol()}
              />
              <button type="button" className="btn-ghost py-1.5" onClick={handleAddSymbol}>
                <Plus size={14} /> 添加
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
              {symbols.map(s => (
                <span key={s} className={clsx('tag', s === value.symbol && 'border-brand-500 text-brand-400')}>
                  {s}
                  <button
                    type="button"
                    className="hover:text-red-400 ml-0.5"
                    onClick={() => { if (s !== value.symbol) onRemoveSymbol(s) }}
                    title={s === value.symbol ? '当前使用中，无法删除' : '删除'}
                    disabled={s === value.symbol}
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Direction */}
      <div>
        <label className="field-label">交易方向</label>
        <div className="flex gap-2">
          {(['long', 'short'] as Direction[]).map(d => (
            <button
              key={d}
              type="button"
              className={clsx('radio-btn', value.direction === d ? 'radio-btn-active' : 'radio-btn-inactive')}
              onClick={() => set('direction', d)}
            >
              {d === 'long' ? '📈 做多' : '📉 做空'}
            </button>
          ))}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label className="field-label">有效期限（北京时间）</label>
        <input
          type="datetime-local"
          className="input-base"
          value={value.deadline}
          onChange={e => set('deadline', e.target.value)}
        />
      </div>

      {/* Timeframe */}
      <div>
        <label className="field-label">时间框架</label>
        <div className="flex gap-1.5 flex-wrap">
          {TIMEFRAMES.map(tf => (
            <button
              key={tf}
              type="button"
              className={clsx(
                'px-3 py-1.5 rounded-md text-xs border cursor-pointer transition-colors',
                value.timeframe === tf
                  ? 'bg-brand-500 border-brand-500 text-white'
                  : 'radio-btn-inactive',
              )}
              onClick={() => set('timeframe', tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Amount */}
      <div>
        <label className="field-label">投入资金</label>
        <div className="relative">
          <input
            type="number"
            min={1}
            step={1}
            className="input-base pr-16"
            value={value.amount}
            onChange={e => set('amount', Number(e.target.value))}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
            style={{ color: 'var(--text-muted)' }}>USDT</span>
        </div>
      </div>

      {/* Leverage */}
      <div>
        <label className="field-label">
          杠杆倍数
          <span className="ml-2 text-brand-400 font-bold text-sm normal-case">{value.leverage}x</span>
        </label>
        <input
          type="range"
          min={1}
          max={125}
          step={1}
          className="w-full accent-brand-500 cursor-pointer"
          value={value.leverage}
          onChange={e => set('leverage', Number(e.target.value))}
        />
        <div className="flex justify-between text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
          <span>1x</span><span>25x</span><span>50x</span><span>75x</span><span>100x</span><span>125x</span>
        </div>
      </div>

      {/* Entry Type */}
      <div>
        <label className="field-label">入场方式</label>
        <div className="flex gap-2">
          {(['market', 'limit'] as EntryType[]).map(t => (
            <button
              key={t}
              type="button"
              className={clsx('radio-btn', value.entryType === t ? 'radio-btn-active' : 'radio-btn-inactive')}
              onClick={() => set('entryType', t)}
            >
              {t === 'market' ? '市价' : '限价'}
            </button>
          ))}
        </div>
        {value.entryType === 'limit' && (
          <div className="mt-2 relative">
            <input
              type="number"
              min={0}
              step={0.01}
              className="input-base pr-16"
              placeholder="限价价格"
              value={value.limitPrice ?? ''}
              onChange={e => set('limitPrice', Number(e.target.value))}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
              style={{ color: 'var(--text-muted)' }}>USDT</span>
          </div>
        )}
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { Zap, Sun, Moon } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { BlockA, BlockB, Strategy, Template, FormState } from './types'
import { DEFAULT_HAMMER_STRATEGY, DEFAULT_SYMBOLS } from './data/defaults'
import { generatePrompt } from './lib/promptGenerator'
import BlockAPanel from './components/BlockAPanel'
import BlockBPanel from './components/BlockBPanel'
import BlockCPanel from './components/BlockCPanel'
import PromptPreview from './components/PromptPreview'
import TemplateBar from './components/TemplateBar'

// ─── Default form state ──────────────────────────────────────────────────────

const DEFAULT_FORM: FormState = {
  blockA: {
    symbol:    'BZUSDT',
    direction: 'long',
    deadline:  (() => {
      const d = new Date()
      d.setDate(d.getDate() + 2)
      d.setHours(22, 16, 0, 0)
      return d.toISOString().slice(0, 16)
    })(),
    timeframe: '15m',
    amount:    60,
    leverage:  30,
    entryType: 'market',
  },
  blockB: {
    stopLossOffset:     2,
    takeProfitPct:      2.5,
    pollingValue:       '5~10',
    pollingUnit:        'seconds',
    trailingTriggerPct: 0.5,
    trailingStepPct:    0.5,
  },
  selectedStrategyId: DEFAULT_HAMMER_STRATEGY.id,
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme()

  const [form, setForm]             = useLocalStorage<FormState>('form_state', DEFAULT_FORM)
  const [symbols, setSymbols]       = useLocalStorage<string[]>('symbols_pool', DEFAULT_SYMBOLS)
  const [strategies, setStrategies] = useLocalStorage<Strategy[]>('strategies_pool', [DEFAULT_HAMMER_STRATEGY])
  const [templates, setTemplates]   = useLocalStorage<Template[]>('templates_pool', [])

  const selectedStrategy = useMemo(
    () => strategies.find(s => s.id === form.selectedStrategyId) ?? strategies[0],
    [strategies, form.selectedStrategyId],
  )

  const prompt = useMemo(() => {
    if (!selectedStrategy) return '（请至少创建一个量化策略）'
    return generatePrompt(form.blockA, form.blockB, selectedStrategy.name, selectedStrategy.content)
  }, [form, selectedStrategy])

  // ─── Handlers ────────────────────────────────────────────────────────────

  const setBlockA = (blockA: BlockA) => setForm(f => ({ ...f, blockA }))
  const setBlockB = (blockB: BlockB) => setForm(f => ({ ...f, blockB }))

  const addSymbol    = (s: string) => setSymbols(prev => [...prev, s])
  const removeSymbol = (s: string) => setSymbols(prev => prev.filter(x => x !== s))

  const saveStrategy = (s: Strategy) =>
    setStrategies(prev => {
      const idx = prev.findIndex(x => x.id === s.id)
      return idx >= 0 ? prev.map(x => x.id === s.id ? s : x) : [...prev, s]
    })

  const deleteStrategy = (id: string) => {
    setStrategies(prev => prev.filter(s => s.id !== id))
    if (form.selectedStrategyId === id) {
      const remaining = strategies.filter(s => s.id !== id)
      if (remaining.length > 0) setForm(f => ({ ...f, selectedStrategyId: remaining[0].id }))
    }
  }

  const saveTemplate = (name: string) => {
    const now = new Date().toISOString()
    setTemplates(prev => [...prev, {
      id: 'tpl_' + Date.now(), name,
      blockA: form.blockA, blockB: form.blockB,
      strategyId: form.selectedStrategyId,
      createdAt: now, updatedAt: now,
    }])
  }

  const loadTemplate  = (t: Template) =>
    setForm({ blockA: t.blockA, blockB: t.blockB, selectedStrategyId: t.strategyId })

  const deleteTemplate = (id: string) => setTemplates(prev => prev.filter(t => t.id !== id))

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <header className="header-bar px-4 py-3 flex items-center gap-4 flex-wrap">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide" style={{ color: 'var(--text-primary)' }}>
            Bitget 交易指令生成器
          </span>
        </div>

        <div className="divider-v hidden sm:block" />

        <TemplateBar
          templates={templates}
          onLoad={loadTemplate}
          onSave={saveTemplate}
          onDelete={deleteTemplate}
          currentBlockA={form.blockA}
          currentBlockB={form.blockB}
          currentStrategyId={form.selectedStrategyId}
        />

        {/* Theme Toggle — pushed to far right */}
        <div className="ml-auto">
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-ghost flex items-center gap-1.5"
            title={theme === 'dark' ? '切换到淡色模式' : '切换到深色模式'}
          >
            {theme === 'dark' ? (
              <><Sun size={14} className="text-amber-400" /> 淡色</>
            ) : (
              <><Moon size={14} className="text-indigo-400" /> 深色</>
            )}
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Left: Form Panels */}
        <aside className="w-96 shrink-0 overflow-y-auto p-4 space-y-3 sidebar-border">
          <BlockAPanel
            value={form.blockA}
            symbols={symbols}
            onChange={setBlockA}
            onAddSymbol={addSymbol}
            onRemoveSymbol={removeSymbol}
          />
          <BlockBPanel value={form.blockB} onChange={setBlockB} />
          <BlockCPanel
            strategies={strategies}
            selectedId={form.selectedStrategyId}
            onSelect={id => setForm(f => ({ ...f, selectedStrategyId: id }))}
            onSave={saveStrategy}
            onDelete={deleteStrategy}
          />
        </aside>

        {/* Right: Preview */}
        <main className="flex-1 overflow-hidden p-4">
          <PromptPreview text={prompt} />
        </main>
      </div>
    </div>
  )
}

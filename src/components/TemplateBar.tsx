import { useState } from 'react'
import { BookMarked, Save, Trash2, ChevronDown, Check, X } from 'lucide-react'
import { Template, BlockA, BlockB } from '../types'
import clsx from 'clsx'

interface Props {
  templates: Template[]
  onLoad: (t: Template) => void
  onSave: (name: string) => void
  onDelete: (id: string) => void
  currentBlockA: BlockA
  currentBlockB: BlockB
  currentStrategyId: string
}

export default function TemplateBar({
  templates, onLoad, onSave, onDelete,
}: Props) {
  const [open, setOpen] = useState(false)
  const [saveName, setSaveName] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleSave = () => {
    const name = saveName.trim()
    if (!name) return
    onSave(name)
    setSaveName('')
    setSaving(false)
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {/* Load Template Dropdown */}
        <button
          type="button"
          className="btn-ghost flex items-center gap-1.5"
          onClick={() => setOpen(v => !v)}
        >
          <BookMarked size={13} />
          预设模板
          <span className="bg-surface-500 rounded px-1 text-xs text-slate-400">{templates.length}</span>
          <ChevronDown size={12} className={clsx('transition-transform', open && 'rotate-180')} />
        </button>

        {/* Save Button */}
        {saving ? (
          <div className="flex items-center gap-1.5">
            <input
              className="input-base text-xs py-1.5 w-44"
              placeholder="输入模板名称..."
              value={saveName}
              onChange={e => setSaveName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <button type="button" className="btn-ghost py-1.5" onClick={handleSave} disabled={!saveName.trim()}>
              <Check size={12} />
            </button>
            <button type="button" className="btn-ghost py-1.5" onClick={() => setSaving(false)}>
              <X size={12} />
            </button>
          </div>
        ) : (
          <button type="button" className="btn-ghost" onClick={() => setSaving(true)}>
            <Save size={13} /> 保存当前为预设
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-72 bg-surface-700 border border-surface-500 rounded-xl shadow-2xl z-50 overflow-hidden">
          {templates.length === 0 ? (
            <p className="p-4 text-xs text-slate-500 text-center">暂无保存的预设</p>
          ) : (
            <ul className="max-h-64 overflow-y-auto">
              {templates.map(t => (
                <li
                  key={t.id}
                  className="flex items-center gap-2 px-3 py-2.5 hover:bg-surface-600 transition-colors border-b border-surface-600 last:border-0"
                >
                  <button
                    type="button"
                    className="flex-1 text-left text-sm text-slate-200 hover:text-brand-400 transition-colors truncate"
                    onClick={() => { onLoad(t); setOpen(false) }}
                  >
                    {t.name}
                  </button>
                  <span className="text-xs text-slate-600 shrink-0">
                    {new Date(t.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                  {confirmDeleteId === t.id ? (
                    <div className="flex gap-1">
                      <button type="button" className="btn-danger py-0.5 px-1" onClick={() => { onDelete(t.id); setConfirmDeleteId(null) }}>
                        <Check size={10} />
                      </button>
                      <button type="button" className="btn-ghost py-0.5 px-1" onClick={() => setConfirmDeleteId(null)}>
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <button type="button" className="btn-danger py-0.5 px-1" onClick={() => setConfirmDeleteId(t.id)}>
                      <Trash2 size={11} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { Plus, Save, Trash2, Edit3, Check, X } from 'lucide-react'
import { Strategy } from '../types'
import clsx from 'clsx'

interface Props {
  strategies: Strategy[]
  selectedId: string
  onSelect: (id: string) => void
  onSave: (s: Strategy) => void
  onDelete: (id: string) => void
}

function newId() {
  return 'strategy_' + Date.now()
}

export default function BlockCPanel({ strategies, selectedId, onSelect, onSave, onDelete }: Props) {
  const selected = strategies.find(s => s.id === selectedId)

  // editing state: null = viewing, Strategy = editing/creating
  const [editing, setEditing] = useState<Strategy | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const startNew = () => {
    setEditing({
      id: newId(),
      name: '',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }

  const startEdit = (s: Strategy) => {
    setEditing({ ...s })
  }

  const cancelEdit = () => setEditing(null)

  const commitSave = () => {
    if (!editing) return
    if (!editing.name.trim()) return
    onSave({ ...editing, updatedAt: new Date().toISOString() })
    onSelect(editing.id)
    setEditing(null)
  }

  const handleDelete = (id: string) => {
    onDelete(id)
    setConfirmDeleteId(null)
    if (selectedId === id && strategies.length > 1) {
      const remaining = strategies.filter(s => s.id !== id)
      if (remaining.length > 0) onSelect(remaining[0].id)
    }
  }

  return (
    <div className="card space-y-4">
      <div className="section-title">
        <span className="w-5 h-5 rounded bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">C</span>
        量化策略
        <button type="button" className="btn-ghost ml-auto py-1" onClick={startNew}>
          <Plus size={12} /> 新策略
        </button>
      </div>

      {/* Strategy Selector */}
      {!editing && (
        <>
          <div>
            <label className="field-label">选择策略</label>
            <select
              className="select-base"
              value={selectedId}
              onChange={e => onSelect(e.target.value)}
            >
              {strategies.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Strategy Preview / Actions */}
          {selected && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="field-label mb-0">策略内容预览</label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="btn-ghost py-1"
                    onClick={() => startEdit(selected)}
                  >
                    <Edit3 size={12} /> 编辑
                  </button>
                  {strategies.length > 1 && (
                    confirmDeleteId === selected.id ? (
                      <div className="flex gap-1">
                        <button type="button" className="btn-danger" onClick={() => handleDelete(selected.id)}>
                          <Check size={11} /> 确认删除
                        </button>
                        <button type="button" className="btn-ghost py-1" onClick={() => setConfirmDeleteId(null)}>
                          <X size={11} />
                        </button>
                      </div>
                    ) : (
                      <button type="button" className="btn-danger" onClick={() => setConfirmDeleteId(selected.id)}>
                        <Trash2 size={12} />
                      </button>
                    )
                  )}
                </div>
              </div>
              <pre className="bg-surface-700 border border-surface-500 rounded-lg p-3 text-xs text-slate-300 overflow-auto max-h-52 leading-relaxed whitespace-pre-wrap font-mono">
                {selected.content}
              </pre>
            </div>
          )}
        </>
      )}

      {/* Editing Panel */}
      {editing && (
        <div className="space-y-3">
          <div>
            <label className="field-label">策略名称</label>
            <input
              className="input-base"
              placeholder="e.g. 经典锤头线 15m"
              value={editing.name}
              onChange={e => setEditing({ ...editing, name: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">策略量化规则内容</label>
            <textarea
              className={clsx(
                'input-base font-mono text-xs leading-relaxed resize-y',
                'min-h-[200px]',
              )}
              placeholder="粘贴量化规则描述…"
              value={editing.content}
              onChange={e => setEditing({ ...editing, content: e.target.value })}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={commitSave}
              disabled={!editing.name.trim()}
            >
              <Save size={14} /> 保存策略
            </button>
            <button type="button" className="btn-ghost" onClick={cancelEdit}>
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

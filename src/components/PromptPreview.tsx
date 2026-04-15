import { useState } from 'react'
import { Copy, Check, RefreshCw } from 'lucide-react'

interface Props {
  text: string
}

export default function PromptPreview({ text }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for older browsers
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="text-brand-400 animate-none" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            实时指令预览
          </span>
          <span className="text-xs text-slate-600">（实时更新，可直接复制给 Openclaw）</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="btn-primary"
        >
          {copied ? (
            <>
              <Check size={14} className="text-green-300" />
              <span className="text-green-300">已复制！</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              一键复制
            </>
          )}
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 relative">
        <pre className="
          h-full overflow-auto
          bg-surface-800 border border-surface-600 rounded-xl p-5
          text-sm text-slate-200 leading-7 whitespace-pre-wrap
          font-mono
        ">
          {text}
        </pre>

        {/* Character count */}
        <div className="absolute bottom-3 right-4 text-xs text-slate-600">
          {text.length} 字符
        </div>
      </div>
    </div>
  )
}

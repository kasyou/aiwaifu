interface LearnConfirmProps {
  open: boolean
  charName: string
  oldPrompt: string
  newPrompt: string
  onApply: () => void
  onCancel: () => void
}

export default function LearnConfirm({
  open,
  charName,
  oldPrompt,
  newPrompt,
  onApply,
  onCancel,
}: LearnConfirmProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-canvas rounded-xl shadow-2xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
        <h3 className="text-lg font-semibold text-ink mb-1">
          角色学习建议
        </h3>
        <p className="text-sm text-body mb-4">
          <strong>{charName}</strong> 根据你的建议优化了角色设定，请确认是否应用：
        </p>

        {/* Old vs New comparison */}
        <div className="flex-1 overflow-y-auto space-y-3 mb-5 text-sm">
          <div>
            <div className="text-xs font-medium text-muted mb-1 uppercase tracking-wide">
              当前设定
            </div>
            <div className="rounded-lg border border-hairline bg-surface-card/50 p-3 text-body whitespace-pre-wrap max-h-32 overflow-y-auto">
              {oldPrompt}
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-xs">优化后</span>
          </div>
          <div>
            <div className="text-xs font-medium text-primary mb-1 uppercase tracking-wide">
              新设定
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-body whitespace-pre-wrap max-h-40 overflow-y-auto">
              {newPrompt}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-hairline bg-canvas px-4 py-2 text-sm font-medium text-body hover:bg-surface-card transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-active transition-colors"
          >
            应用新设定
          </button>
        </div>
      </div>
    </div>
  )
}

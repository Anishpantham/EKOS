export function Loading({ label = 'Loading' }) {
  return (
    <div className="flex items-center gap-3 text-muted font-mono text-sm py-12 justify-center">
      <span className="inline-block w-2 h-2 rounded-full bg-verified animate-pulse" />
      {label}…
    </div>
  )
}

export function ErrorState({ message, hint }) {
  return (
    <div className="border border-conflict/40 bg-conflict-soft/40 rounded-md px-5 py-4 text-sm">
      <p className="text-conflict-paper font-medium">{message}</p>
      {hint && <p className="text-muted mt-1 text-[13px]">{hint}</p>}
    </div>
  )
}

export function EmptyState({ title, body }) {
  return (
    <div className="data-surface border border-dashed border-border rounded-xl px-6 py-12 text-center">
      <p className="font-display text-lg text-paper">{title}</p>
      {body && <p className="text-muted text-sm mt-2 max-w-md mx-auto">{body}</p>}
    </div>
  )
}

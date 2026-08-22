declare const __DS_STAMP__: { hash: string; sha: string; bytes: number }

/**
 * Header saying which build of `design-system/tokens/` these stories are painting with.
 * It means something now: the package is reproducible from `tokens.json`, so a hash
 * identifies a real state rather than whatever happened to be on disk.
 */
export function DsStamp() {
  const s = __DS_STAMP__
  return (
    <div
      style={{
        position: 'sticky', top: 0, zIndex: 10, marginBottom: 16,
        display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap',
        padding: '6px 10px', borderRadius: 8,
        background: 'var(--muted)', color: 'var(--muted-foreground)',
        font: '500 11px/1.4 var(--font-sans)',
      }}
    >
      <strong style={{ color: 'var(--foreground)' }}>design-system/tokens</strong>
      <span>sha256 {s.hash}</span>
      <span>commit {s.sha}</span>
      <span>{(s.bytes / 1024).toFixed(1)} kB</span>
    </div>
  )
}

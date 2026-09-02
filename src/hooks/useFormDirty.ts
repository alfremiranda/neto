import { useEffect, useRef } from 'react'

/**
 * Whether a sheet's form differs from what it opened with.
 *
 * "Dirty" is the difference from the INITIAL state, not "has any content": a sheet opened
 * to edit an existing entry starts full, and treating that as unsaved work would trap the
 * user in a form they only came to look at.
 *
 * The snapshot is taken on the render where the sheet opens and held until it closes, so
 * a sheet that hydrates asynchronously (the edit path fills its fields in an effect) is
 * compared against the hydrated values rather than the empty ones it flashed first.
 */
export function useFormDirty(open: boolean, values: unknown): boolean {
  const snapshot = useRef<string | null>(null)
  const serialized = JSON.stringify(values)

  useEffect(() => {
    if (!open) { snapshot.current = null; return }
    // Re-snapshot while the sheet is still being filled by its hydration effect: the
    // first frames of an edit are the reset values, not the entry's.
    if (snapshot.current === null) snapshot.current = serialized
  })

  if (!open || snapshot.current === null) return false
  return snapshot.current !== serialized
}

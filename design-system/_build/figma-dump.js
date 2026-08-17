/**
 * STAGE 1 of the exporter — runs INSIDE Figma via the Plugin API (`use_figma`).
 *
 * Dumps every local variable and text style verbatim: Figma's own names, one value
 * per mode, nothing renamed and nothing dropped. Applying the rename map is stage 2
 * (`apply-rename-map.mjs`), which runs locally where the map lives.
 *
 * The split is deliberate. This script cannot read `rename-map.json` — it executes in
 * Figma's sandbox with no filesystem — so embedding the rules here would fork them from
 * the file Design authors. Keeping stage 1 dumb also means it never has an opinion about
 * what a key *should* be called, which is the failure `13-rename-map.md` warns about:
 * an exporter that infers names canonises the current drift as the spec.
 *
 * CHUNKING: a full dump exceeds the 20 kB `use_figma` response cap — measured, not
 * assumed: 220 colour variables truncated mid-response. Run it once per collection
 * (`Semantic`, then `Component`) and concatenate, or narrow by prefix. A single call
 * that returns everything will silently lose the tail.
 *
 * HOW TO RUN — needs EDIT access to the Neto file (view access is not enough):
 *   use_figma({ fileKey: 'Q2R72oH6MYxYr1VKAe5nOx', code: <this file> })
 * Save the returned JSON to `design-system/_build/figma-dump.json`, then:
 *   node design-system/_build/apply-rename-map.mjs
 *   python3 design-system/_build/build.py
 */
const collections = await figma.variables.getLocalVariableCollectionsAsync()

/** Figma colours are 0–1 floats; tokens.json carries hex. Alpha becomes rgba(). */
function toCss(value) {
  if (value == null || typeof value !== 'object' || !('r' in value)) return value
  const ch = n => Math.round(n * 255)
  if (value.a != null && value.a < 1) {
    return `rgba(${ch(value.r)},${ch(value.g)},${ch(value.b)},${Number(value.a.toFixed(3))})`
  }
  const hex = n => ch(n).toString(16).padStart(2, '0')
  return `#${hex(value.r)}${hex(value.g)}${hex(value.b)}`
}

const variables = []
for (const collection of collections) {
  const modes = collection.modes.map(m => ({ id: m.modeId, name: m.name }))
  for (const id of collection.variableIds) {
    const v = await figma.variables.getVariableByIdAsync(id)
    if (!v) continue
    const values = {}
    const aliases = {}
    for (const mode of modes) {
      const raw = v.valuesByMode[mode.id]
      if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
        // Record the alias AND resolve it, so stage 2 can emit a value while the
        // report can still say which keys are aliases rather than sources.
        const target = await figma.variables.getVariableByIdAsync(raw.id)
        aliases[mode.name] = target ? target.name : `<missing:${raw.id}>`
        const targetValue = target ? target.valuesByMode[mode.id] : null
        values[mode.name] = toCss(targetValue)
      } else {
        values[mode.name] = toCss(raw)
      }
    }
    variables.push({
      collection: collection.name,
      name: v.name,
      type: v.resolvedType,
      values,
      ...(Object.keys(aliases).length ? { aliases } : {}),
    })
  }
}

// Text styles are a different shape entirely — build.py wants
// "Name|Weight|Size|LineHeight|LetterSpacing" rows.
const textStyles = (await figma.getLocalTextStylesAsync()).map(s => ({
  name: s.name,
  weight: s.fontName.style,
  size: s.fontSize,
  lineHeight: s.lineHeight && s.lineHeight.unit === 'PIXELS' ? s.lineHeight.value : null,
  letterSpacing: s.letterSpacing && s.letterSpacing.unit === 'PIXELS' ? s.letterSpacing.value : 0,
}))

return {
  exportedFrom: figma.root.name,
  collections: collections.map(c => ({ name: c.name, modes: c.modes.map(m => m.name) })),
  variables,
  textStyles,
}

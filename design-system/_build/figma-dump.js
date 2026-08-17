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
const collectionsById = Object.fromEntries(collections.map(c => [c.id, c]))

/**
 * Aliases must be followed BY MODE NAME, not by mode id.
 *
 * Every collection has its own mode ids, and the names differ in case too
 * (Semantic is `Light`/`Dark`, Component is `light`/`dark`). A Component token
 * in dark mode consumes its Semantic target's *dark* value — that is the whole
 * point of the indirection, since most Component tokens alias the SAME semantic
 * variable in both modes and let the semantic layer carry the mode difference.
 *
 * Resolving against the target's default mode instead collapses dark to light
 * for exactly those tokens, and — this is why it went unnoticed — leaves correct
 * any token whose alias points at a DIFFERENT target per mode. Measured: 19 of
 * 92 component tokens wrong, the other 73 right. A partly-correct dump is worse
 * than a broken one; it reads as a value disagreement with the published output.
 */
function modeIdFor(collection, modeName) {
  const match = collection.modes.find(m => m.name.toLowerCase() === modeName.toLowerCase())
  return (match || collection.modes[0]).modeId
}

async function resolveByModeName(variable, modeName, depth = 0) {
  if (depth > 10) return { value: null, alias: '<cycle>' }   // alias chains are not trusted to terminate
  const collection = collectionsById[variable.variableCollectionId]
  const raw = variable.valuesByMode[modeIdFor(collection, modeName)]
  if (raw && typeof raw === 'object' && raw.type === 'VARIABLE_ALIAS') {
    const target = await figma.variables.getVariableByIdAsync(raw.id)
    if (!target) return { value: null, alias: `<missing:${raw.id}>` }
    const resolved = await resolveByModeName(target, modeName, depth + 1)
    return { value: resolved.value, alias: target.name }
  }
  return { value: raw, alias: null }
}

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
      // Record the alias AND resolve it, so stage 2 can emit a value while the
      // report can still say which keys are aliases rather than sources.
      const { value, alias } = await resolveByModeName(v, mode.name)
      if (alias) aliases[mode.name] = alias
      values[mode.name] = toCss(value)
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

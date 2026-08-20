/**
 * naming-analysis · derive each semantic colour token's PROPERTY from how it is used
 * ---------------------------------------------------------------------------
 * Paste into a `use_figma` call and return `await analyse()`. Pure read.
 *
 * Phase 1.1 of docs/20-roadmap.md. The proposed naming shape puts the property
 * first — bg / fg / border / shadow — so that scope and codeSyntax become
 * derivable from the name. This script answers the only hard question in that
 * rename: which property does each token actually paint?
 *
 * It does not ask anyone. It counts:
 *   - a bound fill on a TEXT node        -> fg
 *   - a bound fill on anything else      -> bg
 *   - a bound stroke                     -> border
 *   - a bound effect colour              -> shadow
 *
 * Three outcomes, and the middle one is the point:
 *   CLEAR      one property takes >= 80% of the bindings — mechanical rename
 *   AMBIGUOUS  two properties share it — the token is doing two jobs and
 *              probably has to SPLIT, which is an architecture finding, not a
 *              naming one
 *   UNUSED     no direct binding at all — delete, or document why it is reserved
 *
 * IMPORTANT: this walks every node on every page. Figma loads lazily, so a cold
 * pass under-reports with no error (00-principles §B4). The result is only
 * trustworthy when `converged` is true; if it is false, run it again in the same
 * session — the pages stay warm between calls.
 */

const CONFIG = { collection: 'Semantic', clearThreshold: 0.8, maxPasses: 4 };

async function analyse() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const colBy = {}; cols.forEach(c => colBy[c.id] = c);
  const vars = await figma.variables.getLocalVariablesAsync();
  const nameOf = v => colBy[v.variableCollectionId] ? colBy[v.variableCollectionId].name : '?';

  const target = {};
  vars.forEach(v => {
    if (nameOf(v) === CONFIG.collection && v.resolvedType === 'COLOR') target[v.id] = v.name;
  });

  async function pass() {
    const acc = {};
    Object.keys(target).forEach(id => acc[id] = { fg: 0, bg: 0, border: 0, shadow: 0 });
    for (const page of figma.root.children) {
      await page.loadAsync();
      for (const n of page.findAll(() => true)) {
        const fills = n.fills;
        if (fills && fills !== figma.mixed && fills.length) for (const p of fills) {
          const b = p.boundVariables && p.boundVariables.color;
          if (b && acc[b.id]) acc[b.id][n.type === 'TEXT' ? 'fg' : 'bg']++;
        }
        const strokes = n.strokes;
        if (strokes && strokes.length) for (const p of strokes) {
          const b = p.boundVariables && p.boundVariables.color;
          if (b && acc[b.id]) acc[b.id].border++;
        }
        const effects = n.effects;
        if (effects && effects.length) for (const e of effects) {
          const b = e.boundVariables && e.boundVariables.color;
          if (b && acc[b.id]) acc[b.id].shadow++;
        }
      }
    }
    return acc;
  }

  const passes = [];
  let converged = null;
  for (let i = 0; i < CONFIG.maxPasses; i++) {
    passes.push(await pass());
    if (i > 0 && JSON.stringify(passes[i]) === JSON.stringify(passes[i - 1])) { converged = passes[i]; break; }
  }
  const use = converged || passes[passes.length - 1];

  // indirect use: which Component tokens alias this one, and what they call themselves
  const viaAlias = {};
  for (const v of vars) {
    if (nameOf(v) !== 'Component') continue;
    for (const val of Object.values(v.valuesByMode)) {
      if (val && val.type === 'VARIABLE_ALIAS' && target[val.id]) {
        viaAlias[val.id] = viaAlias[val.id] || {};
        const last = v.name.split('/').pop();
        viaAlias[val.id][last] = (viaAlias[val.id][last] || 0) + 1;
      }
    }
  }

  const rows = Object.keys(target).map(id => {
    const u = use[id];
    const total = u.fg + u.bg + u.border + u.shadow;
    const ranked = [['fg', u.fg], ['bg', u.bg], ['border', u.border], ['shadow', u.shadow]]
      .sort((a, b) => b[1] - a[1]);
    let verdict, property = ranked[0][0];
    if (total === 0) { verdict = 'UNUSED'; property = null; }
    else if (ranked[0][1] / total >= CONFIG.clearThreshold) verdict = 'CLEAR';
    else verdict = 'AMBIGUOUS';
    return { token: target[id], ...u, total, property, verdict, aliasedAs: viaAlias[id] || null };
  }).sort((a, b) => a.token.localeCompare(b.token));

  const summary = { CLEAR: 0, AMBIGUOUS: 0, UNUSED: 0 };
  rows.forEach(r => summary[r.verdict]++);
  return { converged: !!converged, passTotals: passes.map(p =>
    Object.values(p).reduce((a, u) => a + u.fg + u.bg + u.border + u.shadow, 0)), summary, rows };
}

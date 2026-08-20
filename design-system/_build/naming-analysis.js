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
 * It does not ask anyone. It counts.
 *
 * ---------------------------------------------------------------------------
 * CORRECTION, 2026-08-20. The first version of this script bucketed a bound
 * fill as `fg` only when the node was TEXT, and as `bg` otherwise. That is
 * wrong, and it was wrong loudly enough to catch: it reported
 * `color/interactive/primary-foreground` as 110 backgrounds and 0 foregrounds,
 * which is impossible for a token that only ever paints icons.
 *
 * An icon glyph is a VECTOR. It is foreground. The buckets are now:
 *
 *   fill on TEXT                              -> text   \  foreground
 *   fill on VECTOR/BOOLEAN_OPERATION/STAR/    -> glyph   /
 *           POLYGON/LINE
 *   fill on ELLIPSE/RECTANGLE                 -> shape  \  background
 *   fill on anything else (FRAME/COMPONENT/…) -> box    /
 *   bound stroke                              -> border
 *   bound effect colour                       -> shadow
 *
 * The buckets stay separate in the output rather than being pre-summed, because
 * the shape/box distinction is what tells a solid dot apart from a container,
 * and a script that collapses its own evidence cannot be re-argued with.
 *
 * The lesson is the general one from 00-principles §A6: the defect was not in
 * the counting, it was in using an instrument outside its range. TEXT is not a
 * synonym for foreground.
 * ---------------------------------------------------------------------------
 *
 * Three outcomes, and the middle one is the point:
 *   CLEAR      one property takes >= 80% of the bindings — mechanical rename
 *   AMBIGUOUS  two properties share it — the token is doing two jobs and
 *              has to SPLIT, which is an architecture finding, not a naming one
 *   UNUSED     no direct binding at all — see `docProduct` before deleting it;
 *              "bound only in a documentation swatch" and "bound nowhere" are
 *              different facts with different remedies (21-token-naming Rule 8)
 *
 * IMPORTANT: this walks every node on every page. Figma loads lazily, so a cold
 * pass under-reports with no error (00-principles §B4). On 2026-08-20 the cold
 * pass returned 4183 bindings and the converged answer was 10108 — 59% low, no
 * warning. The result is only trustworthy when `converged` is true; if it is
 * false, run it again in the same session — the pages stay warm between calls.
 */

const CONFIG = {
  collection: 'Semantic',
  clearThreshold: 0.8,
  maxPasses: 6,
  // pages that are the design system describing itself, not the product using it
  docPages: /^(Foundations|Components|Blocks|Brand|Icons|_docs-kit|Layouts)/,
};

const GLYPH = new Set(['VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE']);
const SHAPE = new Set(['ELLIPSE', 'RECTANGLE']);

async function analyse() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const colBy = {}; cols.forEach(c => colBy[c.id] = c);
  const vars = await figma.variables.getLocalVariablesAsync();
  const byId = {}; vars.forEach(v => byId[v.id] = v);
  const nameOf = v => colBy[v.variableCollectionId] ? colBy[v.variableCollectionId].name : '?';

  const target = {};
  vars.forEach(v => {
    if (nameOf(v) === CONFIG.collection && v.resolvedType === 'COLOR') target[v.id] = v.name;
  });

  const blank = () => ({ text: 0, glyph: 0, shape: 0, box: 0, border: 0, shadow: 0, doc: 0, prod: 0 });

  async function pass() {
    const acc = {};
    Object.keys(target).forEach(id => acc[id] = blank());
    for (const page of figma.root.children) {
      await page.loadAsync();
      const where = CONFIG.docPages.test(page.name) ? 'doc' : 'prod';
      for (const n of page.findAll(() => true)) {
        const bump = (id, k) => { acc[id][k]++; acc[id][where]++; };
        const fills = n.fills;
        if (fills && fills !== figma.mixed && fills.length) for (const p of fills) {
          const b = p.boundVariables && p.boundVariables.color;
          if (!b || !acc[b.id]) continue;
          bump(b.id, n.type === 'TEXT' ? 'text' : GLYPH.has(n.type) ? 'glyph' : SHAPE.has(n.type) ? 'shape' : 'box');
        }
        const strokes = n.strokes;
        if (strokes && strokes !== figma.mixed && strokes.length) for (const p of strokes) {
          const b = p.boundVariables && p.boundVariables.color;
          if (b && acc[b.id]) bump(b.id, 'border');
        }
        const effects = n.effects;
        if (effects && effects !== figma.mixed && effects.length) for (const e of effects) {
          const b = e.boundVariables && e.boundVariables.color;
          if (b && acc[b.id]) bump(b.id, 'shadow');
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

  // resolve a variable to a hex so identical values surface as duplicate groups.
  // modes are matched BY NAME — never by index (00-principles §A4).
  function resolve(v, wantedMode, depth) {
    if (!v || depth > 8) return null;
    const coll = colBy[v.variableCollectionId];
    const m = coll.modes.find(x => x.name.toLowerCase() === wantedMode.toLowerCase()) || coll.modes[0];
    let val = v.valuesByMode[m.modeId];
    if (val === undefined) val = Object.values(v.valuesByMode)[0];
    if (val && val.type === 'VARIABLE_ALIAS') return resolve(byId[val.id], wantedMode, depth + 1);
    if (!val || typeof val.r !== 'number') return null;
    const h = n => Math.round(n * 255).toString(16).padStart(2, '0');
    return '#' + h(val.r) + h(val.g) + h(val.b) + (val.a !== undefined && val.a < 1 ? h(val.a) : '');
  }

  // indirect use: which Component tokens alias this one, and what they call themselves.
  // a Semantic token aliased under a different noun is a naming lie with a witness.
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
    const fg = u.text + u.glyph, bg = u.shape + u.box;
    const total = fg + bg + u.border + u.shadow;
    const ranked = [['fg', fg], ['bg', bg], ['border', u.border], ['shadow', u.shadow]]
      .sort((a, b) => b[1] - a[1]);
    let verdict, property = ranked[0][0];
    if (total === 0) { verdict = 'UNUSED'; property = null; }
    else if (u.prod === 0) { verdict = 'DOC_ONLY'; }
    else if (ranked[0][1] / total >= CONFIG.clearThreshold) verdict = 'CLEAR';
    else verdict = 'AMBIGUOUS';
    return {
      token: target[id], counts: u, fg, bg, total, property, verdict,
      light: resolve(byId[id], 'Light', 0), dark: resolve(byId[id], 'Dark', 0),
      aliasedAs: viaAlias[id] ? Object.keys(viaAlias[id]) : null,
    };
  }).sort((a, b) => a.token.localeCompare(b.token));

  // 29 groups of identical values on 2026-08-20, including ten tokens for #ffffff
  const byLight = {};
  rows.forEach(r => { if (r.light) (byLight[r.light] = byLight[r.light] || []).push(r.token); });

  const summary = { CLEAR: 0, AMBIGUOUS: 0, DOC_ONLY: 0, UNUSED: 0 };
  rows.forEach(r => summary[r.verdict]++);

  return {
    converged: !!converged,
    passTotals: passes.map(p => Object.values(p).reduce((a, u) => a + u.doc + u.prod, 0)),
    summary,
    duplicateValueGroups: Object.entries(byLight).filter(([, t]) => t.length > 1)
      .map(([hex, tokens]) => ({ hex, tokens })),
    rows,
  };
}

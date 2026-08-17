/**
 * ds-audit · auditor de sistema de diseño para Figma
 * ---------------------------------------------------------------------------
 * Genérico: no conoce ningún proyecto. Todo lo específico entra por CONFIG.
 *
 * Uso: pegar el contenido de este archivo dentro de una llamada `use_figma`.
 * El auditor de tokens corre en una sola llamada (las variables son globales).
 * El auditor de nodos necesita UNA llamada por página (Figma carga las páginas
 * bajo demanda y `setCurrentPageAsync` solo puede llamarse una vez por script).
 *
 * Contrato: no muta nada. Solo lee y devuelve un informe.
 * Ver `design-system/docs/00-principios.md` §A5 para qué previene cada chequeo.
 */

// ── CONFIG ──────────────────────────────────────────────────────────────────
const CONFIG = {
  primitives: 'Primitives',        // nombre de la colección de valores crudos
  semantic:   ['Semantic'],        // colecciones que DEBEN aliasear
  component:  ['Component'],       // colecciones de tokens por componente
  exempt:     ['Typography'],      // colecciones que no se auditan
  webSyntax:  /^var\(--[A-Za-z0-9_-]+\)$/,
  ownerDepth: 1,                   // 'badge/primary/fg' → dueño = 'badge'
  genericNames: /^(Frame|Group|Rectangle|Vector|Ellipse|Line|Container|Component|Text|Slice|Polygon|Star|Union|Subtract|Mask)\s*\d*$/i,
  maxExamples: 8,
};

// ── auditoría de tokens ─────────────────────────────────────────────────────
async function auditTokens() {
  const cols  = await figma.variables.getLocalVariableCollectionsAsync();
  const vars  = await figma.variables.getLocalVariablesAsync();
  const colBy = {}; cols.forEach(c => colBy[c.id] = c);
  const byId  = {}; vars.forEach(v => byId[v.id] = v);

  const layerOf = id => {
    const n = colBy[id] ? colBy[id].name : '?';
    if (n === CONFIG.primitives) return 'primitive';
    if (CONFIG.semantic.includes(n)) return 'semantic';
    if (CONFIG.component.includes(n)) return 'component';
    return 'other';
  };
  const owner = name => name.split('/').slice(0, CONFIG.ownerDepth).join('/');

  const V = {};
  const add = (code, name, detail) => {
    V[code] = V[code] || { count: 0, examples: [] };
    V[code].count++;
    if (V[code].examples.length < CONFIG.maxExamples)
      V[code].examples.push(detail ? name + ' — ' + detail : name);
  };

  for (const v of vars) {
    const col = colBy[v.variableCollectionId];
    if (!col || CONFIG.exempt.includes(col.name)) continue;
    const layer = layerOf(v.variableCollectionId);
    const sc = v.scopes || [];

    if (layer !== 'primitive' && (sc.length === 0 || sc.includes('ALL_SCOPES')))
      add('T1_scopes_abiertos', v.name);
    if (layer === 'primitive' && !v.hiddenFromPublishing)
      add('T2_primitiva_expuesta', v.name);

    const web = (v.codeSyntax || {}).WEB;
    if (!web) add('T3_sin_code_syntax', v.name);
    else if (!CONFIG.webSyntax.test(web)) add('T4_code_syntax_sin_var', v.name, web);

    for (const [modeId, val] of Object.entries(v.valuesByMode)) {
      const mode = (col.modes.find(m => m.modeId === modeId) || {}).name || modeId;
      const isAlias = val && val.type === 'VARIABLE_ALIAS';
      if (isAlias && !byId[val.id]) { add('T5_alias_roto', v.name, mode); continue; }
      if (layer === 'semantic' && !isAlias) add('T6_semantica_con_valor_crudo', v.name, mode);
      if (layer === 'component' && isAlias) {
        const t = byId[val.id];
        if (layerOf(t.variableCollectionId) === 'component' && owner(t.name) !== owner(v.name))
          add('T7_token_prestado_de_otro_componente', v.name, mode + ' → ' + t.name);
      }
    }
  }

  const casing = {};
  cols.forEach(c => c.modes.forEach(m => {
    const k = m.name.toLowerCase();
    (casing[k] = casing[k] || []).push(m.name);
  }));
  const clash = Object.entries(casing)
    .filter(([, arr]) => new Set(arr).size > 1)
    .map(([k, arr]) => k + ' → ' + [...new Set(arr)].join(' / '));
  if (clash.length) V['T8_modos_casing_incoherente'] = { count: clash.length, examples: clash };

  return { scope: 'tokens', variables: vars.length, colecciones: cols.length, violaciones: V };
}

// ── auditoría de nodos, una página por llamada ──────────────────────────────
async function auditPage(pageId) {
  const page = await figma.getNodeByIdAsync(pageId);
  await figma.setCurrentPageAsync(page);

  const styles = await figma.getLocalTextStylesAsync();
  const known = new Set(styles.map(s => s.id));
  const vars = await figma.variables.getLocalVariablesAsync();
  const vmap = {}; vars.forEach(v => vmap[v.id] = v.name);

  const V = {};
  const add = (code, where, detail) => {
    V[code] = V[code] || { count: 0, examples: [] };
    V[code].count++;
    if (V[code].examples.length < CONFIG.maxExamples)
      V[code].examples.push(detail ? where + ' — ' + detail : where);
  };
  const unbound = arr => {
    if (!arr || arr === figma.mixed || !arr.length) return false;
    return arr.some(p => p.type === 'SOLID' && !(p.boundVariables && p.boundVariables.color));
  };

  for (const set of page.findAllWithCriteria({ types: ['COMPONENT_SET', 'COMPONENT'] })) {
    if (set.type === 'COMPONENT' && set.parent && set.parent.type === 'COMPONENT_SET') continue;
    if (!set.description || !set.description.trim()) add('C3_sin_descripcion', set.name);
  }

  for (const n of page.findAll(() => true)) {
    const path = n.name;
    if (CONFIG.genericNames.test(n.name)) add('C4_nombre_generico', path, n.type);
    if (n.type === 'TEXT') {
      if (n.textStyleId === figma.mixed) add('C2_texto_estilos_mezclados', path);
      else if (!n.textStyleId || !known.has(n.textStyleId)) add('C2_texto_sin_text_style', path);
    }
    if (unbound(n.fills))   add('C1_fill_sin_variable', path, n.type);
    if (unbound(n.strokes)) add('C1b_stroke_sin_variable', path, n.type);
  }

  return { scope: 'page', page: page.name, violaciones: V };
}

// ── entrada ─────────────────────────────────────────────────────────────────
// Sin argumento audita tokens; con un id de página audita esa página.
// return await auditTokens();
// return await auditPage('PAGE_ID');

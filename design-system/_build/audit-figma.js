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
 * Ver `design-system/docs/00-principles.md` §A5 para qué previene cada chequeo.
 */

// ── CONFIG ──────────────────────────────────────────────────────────────────
// Pages the design system does not own. An exclusion lives here, structurally,
// and never as a silent skip: a 0 for a page nobody looked at is not a 0
// (orchestrator, A-2026-08-20-numeros-de-layout point 2).
//
//   _docs-kit          — scaffolding for a documentation skill Alfredo is building.
//                        Nothing on it is part of the system. Decided 2026-08-20.
//   Screens · Neto (WIP) — in-flight product exploration, not library material.
//
// Foundations is NOT excluded. It is the system describing itself, and its
// swatches are system material even when they are chrome.
const OUT_OF_SCOPE = /^(_docs-kit|Screens · Neto \(WIP\))/;

const CONFIG = {
  outOfScopePages: OUT_OF_SCOPE,
  primitives: 'Primitives',        // nombre de la colección de valores crudos
  semantic:   ['Semantic'],        // colecciones que DEBEN aliasear
  component:  ['Component'],       // colecciones de tokens por componente
  exempt:     ['Typography'],      // colecciones que no se auditan
  webSyntax:  /^var\(--[A-Za-z0-9_-]+\)$/,
  ownerDepth: 1,                   // 'badge/primary/fg' → dueño = 'badge'
  genericNames: /^(Frame|Group|Rectangle|Vector|Ellipse|Line|Container|Component|Text|Slice|Polygon|Star|Union|Subtract|Mask)\s*\d*$/i,
  maxExamples: 8,
  // Variables que no pueden llevar scope porque Figma no tiene nada a qué atarlas.
  // Una duracion o una curva no se enlazan a ninguna propiedad de nodo: existen para que
  // Dev Mode diga el nombre de la variable CSS, no para pintar. Scope vacio ahi no es
  // "se me olvido", es la verdad. T1 existe para cazar lo primero, no lo segundo.
  unbindable: [/^motion\//],
  // Subarboles cuyo color NO es nuestro: marcas de terceros. Un hexadecimal crudo ahi no es
  // deuda, es lo correcto — atarlo a un token implicaria que podemos cambiarlo, y no podemos.
  // C1 los salta. Ver design-system/docs/16-marks.md.
  foreignBrand: [/^brand-mark\//],
  // C8 — propiedades numericas de layout. Figma guarda el grosor de borde POR LADO,
  // no en `strokeWeight`: comprobar la clave equivocada da 100% de falsos positivos.
  numeric: {
    pad: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
    rad: ['topLeftRadius', 'topRightRadius', 'bottomLeftRadius', 'bottomRightRadius'],
    sw:  ['strokeTopWeight', 'strokeRightWeight', 'strokeBottomWeight', 'strokeLeftWeight'],
  },
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

    const unbindable = (CONFIG.unbindable || []).some(re => re.test(v.name));
    if (layer !== 'primitive' && !unbindable && (sc.length === 0 || sc.includes('ALL_SCOPES')))
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

  const dentroDeInstancia = n => {
    for (let a = n.parent; a; a = a.parent) if (a.type === 'INSTANCE') return true;
    return false;
  };

  const esMarcaAjena = n => {
    for (let a = n; a; a = a.parent)
      if ((CONFIG.foreignBrand || []).some(re => re.test(a.name))) return true;
    return false;
  };

  for (const n of page.findAll(() => true)) {
    const path = n.name;
    const ajeno = esMarcaAjena(n);
    // El borde punteado de un COMPONENT_SET lo pinta Figma, no nosotros: no es un stroke
    // sin token, es cromo del editor. Contarlo hacia C1b hace ruido en cada set del archivo.
    const esSet = n.type === 'COMPONENT_SET';
    if (CONFIG.genericNames.test(n.name)) add('C4_nombre_generico', path, n.type);
    if (n.type === 'TEXT') {
      if (n.textStyleId === figma.mixed) add('C2_texto_estilos_mezclados', path);
      else if (!n.textStyleId || !known.has(n.textStyleId)) add('C2_texto_sin_text_style', path);
    }
    if (!ajeno && !esSet && unbound(n.fills))   add('C1_fill_sin_variable', path, n.type);
    if (!ajeno && !esSet && unbound(n.strokes)) add('C1b_stroke_sin_variable', path, n.type);

    // C8 — un numero de layout escrito a mano. Las instancias quedan fuera: su geometria
    // la decide el componente, no la pantalla que lo usa.
    if (!esSet && n.type !== 'SECTION' && n.type !== 'INSTANCE' && !dentroDeInstancia(n)) {
      const bv = n.boundVariables || {};
      const N = CONFIG.numeric;
      if (n.layoutMode && n.layoutMode !== 'NONE') {
        if (n.itemSpacing > 0 && !bv.itemSpacing) add('C8_gap_sin_variable', path, n.itemSpacing);
        if (n.counterAxisSpacing > 0 && !bv.counterAxisSpacing) add('C8_gap_sin_variable', path, n.counterAxisSpacing);
        for (const k of N.pad) if (n[k] > 0 && !bv[k]) add('C8_padding_sin_variable', path, k + '=' + n[k]);
      }
      if ('cornerRadius' in n && n.cornerRadius !== figma.mixed && n.cornerRadius > 0
          && !N.rad.every(k => bv[k])) add('C8_radius_sin_variable', path, n.cornerRadius);
      if ('strokeWeight' in n && n.strokeWeight !== figma.mixed && n.strokeWeight > 0
          && n.strokes && n.strokes.length && !bv.strokeWeight && !N.sw.every(k => bv[k]))
        add('C8_stroke_width_sin_variable', path, n.strokeWeight);
    }
  }

  return { scope: 'page', page: page.name, violaciones: V };
}

// ── T9 · does a token's name match the property it is bound to? ─────────────
// This is the check that phase 1.2 made possible. Before property-first naming
// there was nothing to compare a binding against; now the name is a claim and
// every binding either honours it or does not.
//
// Two exceptions are real, and both were found by getting them wrong first:
//
//   1. A bare ELLIPSE / VECTOR / POLYGON painted with a `fg/*` token is an
//      INDICATOR, not a background. The Spinner's track and head are ellipses;
//      calling them a leak would be the instrument's error, not the file's.
//   2. A POLYGON continuing a surface — the Tooltip arrow — is painted with the
//      surface's own `bg/*` token on purpose. It is not a glyph.
//
// Documentation swatches are excluded wholesale: a swatch's job is to paint a
// token as a fill regardless of what property that token is for.
const T9 = {
  docPages: /^Foundations/,
  // a swatch's job is to paint a token as a fill whatever property that token is for.
  // 'chip' was not enough: some swatch frames are named after their state ('default').
  swatchAncestors: /^(section:|grid$|Danger \/ delete$)/,
  swatchNames: /^(chip|default)$/,
  surfaceContinuation: /^arrow$/,
  indicatorTypes: new Set(['ELLIPSE', 'VECTOR', 'BOOLEAN_OPERATION', 'STAR', 'POLYGON', 'LINE']),
  containerTypes: new Set(['FRAME', 'COMPONENT', 'COMPONENT_SET', 'INSTANCE', 'GROUP', 'SECTION']),
};

async function auditProperty() {
  const vars = await figma.variables.getLocalVariablesAsync();
  const claim = {};
  for (const v of vars) {
    const m = /^(bg|fg|border|shadow)\//.exec(v.name);
    if (m) claim[v.id] = { prop: m[1], name: v.name };
  }
  const V = [];
  const add = (rule, tok, where, why) => V.push({ rule, token: tok, node: where, why });

  async function sweep() {
    const seen = [];
    for (const page of figma.root.children) {
      await page.loadAsync();
      const isDoc = T9.docPages.test(page.name);
      for (const n of page.findAll(() => true)) {
        if (isDoc && T9.swatchNames.test(n.name)) continue;
        const f = n.fills;
        if (f && f !== figma.mixed && f.length) for (const p of f) {
          const b = p.boundVariables && p.boundVariables.color;
          const c = b && claim[b.id];
          if (!c) continue;
          if (c.prop === 'bg') {
            // a bg token on a glyph is wrong, unless it continues a surface
            if (T9.indicatorTypes.has(n.type) && !T9.surfaceContinuation.test(n.name))
              seen.push(['T9_bg_token_on_glyph', c.name, page.name + '/' + n.name]);
          } else if (c.prop === 'fg') {
            // a fg token on a CONTAINER is wrong; on a bare shape it is an indicator
            if (T9.containerTypes.has(n.type))
              seen.push(['T9_fg_token_as_background', c.name, page.name + '/' + n.name]);
          } else {
            seen.push(['T9_' + c.prop + '_token_used_as_fill', c.name, page.name + '/' + n.name]);
          }
        }
        const st = n.strokes;
        if (st && st !== figma.mixed && st.length) for (const p of st) {
          const b = p.boundVariables && p.boundVariables.color;
          const c = b && claim[b.id];
          if (c && c.prop !== 'border') seen.push(['T9_' + c.prop + '_token_used_as_stroke', c.name, page.name + '/' + n.name]);
        }
        const ef = n.effects;
        if (ef && ef !== figma.mixed && ef.length) for (const e of ef) {
          const b = e.boundVariables && e.boundVariables.color;
          const c = b && claim[b.id];
          if (c && c.prop !== 'shadow') seen.push(['T9_' + c.prop + '_token_used_as_shadow', c.name, page.name + '/' + n.name]);
        }
      }
    }
    return seen;
  }

  // §B4: a cold pass under-reports by roughly 60% and raises no error
  const a = await sweep(), b = await sweep();
  if (JSON.stringify(a) !== JSON.stringify(b)) return { scope: 'property', converged: false, note: 'run again in the same session' };
  b.forEach(([rule, tok, where]) => add(rule, tok, where));
  return { scope: 'property', converged: true, tokensWithAClaim: Object.keys(claim).length, violaciones: V };
}

// ── entrada ─────────────────────────────────────────────────────────────────
// Sin argumento audita tokens; con un id de página audita esa página.
// return await auditTokens();
// return await auditPage('PAGE_ID');
// return await auditProperty();

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

// ── C5 · familias compartidas a propósito ───────────────────────────────────
// C5 marca un nodo pintado con el token de OTRO componente. La mayor parte de lo
// que parece un préstamo no lo es: `AccountChart` usa `account-chart/*` y sólo
// difiere en la puntuación, `topnav` usa `nav/*`, `Icon Button` usa `button/*`.
// Eso lo resuelve la comparación por contención, no una lista.
//
// Lo que sí necesita lista son las tres veces que dos componentes comparten
// familia POR DECISIÓN, cada una con su motivo:
const SHARED_FAMILIES = {
  'Select':    ['input'],    // comparte ejes y alturas con Input para que alineen en una fila
  'Field':     ['input'],    // envuelve al control; su slot por defecto es un Input
  'menu-item': ['sidebar'],  // menu-item ES la fila del sidebar, no un vecino suyo
  // bottom-nav-button es la fila del sidebar a ancho de movil. La pestana
  // seleccionada pinta glifo y etiqueta con `sidebar/accent-foreground` porque es
  // el MISMO trabajo -- el primer plano del elemento de navegacion activo -- en
  // otro viewport. Acunar `bottom-nav/*` con el mismo valor seria un token nuevo
  // para un trabajo que ya tiene el suyo (regla 7), y dejaria que la app cambiara
  // de identidad al redimensionar.
  'bottom-nav-button': ['sidebar'],
};

// ── C7 · efectos ────────────────────────────────────────────────────────────
// Una sombra con color escrito a mano es la misma clase de defecto que C1, pero
// vive en `effects` y por eso C1 no la ve. Un efecto que viene de un estilo de
// efecto está bien: el estilo es el token.


// ── C6 · la descripción nombra un peldaño que el token no usa ───────────────
// Una descripción es lo único que alguien lee para saber a qué está atado un
// token. Cuando dice "slate-100" y el alias resuelve a slate-20, la descripción
// no está desactualizada: está dando una instrucción falsa.
//
// ACOTADO A PROPÓSITO, y el recorte es la mitad del valor. Un barrido ingenuo
// da 18 hallazgos sobre 68 descripciones con peldaño, y nueve son legítimos: una
// primitiva que explica que se sitúa ENTRE sus vecinas, o un acento que nombra
// el FONDO sobre el que se apoya. Ambos mencionan un peldaño sin afirmar ser él.
//
// Dos reglas los separan sin criterio humano:
//   1. Las primitivas quedan fuera. `color/slate/850` describe a sus vecinas por
//      definición, y no tiene alias que contradecir.
//   2. Sólo cuenta si la familia coincide. "amber-700 sobre slate-100" no es una
//      afirmación sobre amber; "cyan-600" en un token que resuelve a cyan-700 sí.
//
// Y una tercera, que apareció leyendo los hallazgos en vez de contarlos: hay
// descripciones que nombran un peldaño para decir que NO es el valor — "el código
// usa white/25, redondeado a white/30", "apuntaba a cyan/500 en vez de rose".
// Esas son las descripciones BUENAS: documentan una reconciliación o un error ya
// corregido. Marcarlas sería castigar justo lo que queremos que la gente escriba.
// Por eso hay una guarda de negación. Cambia un posible hallazgo perdido por un
// chequeo en el que se confía, que es el intercambio correcto: un chequeo con la
// mitad de ruido se apaga en una semana, y entonces no encuentra nada.
//
// Cuatro chequeos mecánicos de este archivo han fallado por la misma razón —ver
// §A6—. Éste se calibró leyendo los 18 hallazgos del primer barrido uno por uno,
// no contándolos.
const C6_NEGACION = /(code uses|used to|was |instead of|pointed at|rather than|not |previous value|previously|the old |el código usa|antes|era |en vez de|apuntaba|redondead|valor anterior)/i;
const C6_RUNG = /\b(slate|gray|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|pink|rose|white|black)[-\/](\d{1,3})\b/gi;

// ── Trinquetes ──────────────────────────────────────────────────────────────
// C7 abre con deuda: 12 efectos sin token. Un chequeo que nace en rojo se apaga
// en una semana -- es el criterio con el que Dev retraso `R5` hasta haber
// arreglado sus 22 infracciones, y aplica igual aqui. Asi que no falla por el
// numero: falla si SUBE.
//
// C5 YA NO TIENE TRINQUETE. Llego a 0 el 2026-08-24 y el chequeo es absoluto.
// El camino fue 155 -> 104 -> 116 -> 0, y las tres caidas dicen lo mismo:
//   155 -> 104  mover `currency/*` a Semantic. Un token que ya no vive en
//               Component deja de poder prestarse.
//   104 -> 116  no es una subida real: son las 12 de `ledger-itemrow` al nacer,
//               y sirvieron de control -- 104 + 12 = 116 cuadra la medicion.
//   116 -> 1    la guarda de INSTANCE. Una instancia pintada con el token de su
//               propio componente es COMPOSICION. Sus hijos ya quedaban fuera;
//               ella no, y por eso meter un Badge en una fila contaba como
//               prestamo de badge/*. Las 115 retiradas son todas de esa forma:
//               AccountSummaryCard con un Favorite, Sheet con un Button,
//               ExpenseContainer con action-chips. Ninguna era un prestamo.
//   1 -> 0      `bottom-nav-button <- sidebar`, que es familia compartida.
//
// Tres veces seguidas ha salido lo mismo: colocar bien la REGLA retira mas
// hallazgos que perseguir los hallazgos uno a uno.
const BASELINE = { C7_efecto_sin_token: 12 };

const OUT_OF_SCOPE = /^(_docs-kit|Screens · Neto \(WIP\))/;

// Frames whose job is to DOCUMENT the system rather than to be it. The rule is a
// function, not a location: the doc-kit's grid lives on Foundations too, and a
// frame that describes a token is not a design decision about spacing.
// Decided 2026-08-20 after the layout sweep left ~350 of these as permanent
// false positives.
// `topic:` is the sibling of `doc:` and the distinction is load-bearing, not cosmetic:
// a `doc: X` documents the component named X and C10 holds it to that component; a
// `topic: X` documents a SUBJECT and may hold several components or none. Before the
// split, AccountColor — which documents a swatch and a picker together — read as a
// permanently drifted `doc:`. It was not drifted; it was a different kind of page.
const DOC_CHROME = /^(section:|grid$|chip$|default$|doc:|topic:|_docs)/;

// Figma draws its own dashed frame around a variant set and gives it a 5px
// corner. 55 of them, 222 corners, none of them ours.
const FIGMA_CHROME = new Set(['COMPONENT_SET']);

const CONFIG = {
  outOfScopePages: OUT_OF_SCOPE,
  docChrome: DOC_CHROME,
  figmaChrome: FIGMA_CHROME,
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
  // Las tres exclusiones de CONFIG se declararon el 2026-08-20 y nunca se
  // cablearon: estaban en el objeto y ninguna funcion las leia. Un 0 que nadie
  // aplica y ~350 falsos positivos que la nota decia haber quitado. §A6.
  if (CONFIG.outOfScopePages.test(page.name))
    return { scope: 'page', page: page.name, skipped: 'fuera de alcance por CONFIG.outOfScopePages' };
  await figma.setCurrentPageAsync(page);

  const styles = await figma.getLocalTextStylesAsync();
  const known = new Set(styles.map(s => s.id));
  const vars = await figma.variables.getLocalVariablesAsync();
  const vmap = {}; vars.forEach(v => vmap[v.id] = v.name);
  const allCols = await figma.variables.getLocalVariableCollectionsAsync();
  const compCollectionId = (allCols.find(c => c.name === 'Component') || {}).id;

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

  // ── cromo de documentacion ────────────────────────────────────────────────
  // Un `doc:` y todo lo que lo envuelve explican el sistema; no SON el sistema.
  // Su padding es maquetacion de una pagina de documentacion, no una decision
  // de espaciado. Pero el componente que el frame documenta si es el sistema:
  // en cuanto la subida cruza un COMPONENT o COMPONENT_SET dejamos de excluir.
  // Solo apaga C8. Un fill sin token en cromo sigue siendo un fill sin token.
  const esCromoDeDoc = n => {
    for (let a = n; a; a = a.parent) {
      if (a.type === 'COMPONENT' || a.type === 'COMPONENT_SET') return false;
      if (CONFIG.docChrome.test(a.name)) return true;
    }
    return false;
  };


  // ── C5 · token de otro componente, pintado en un nodo propio ──────────────
  // Los nodos DENTRO de una instancia quedan fuera: ahí el token lo decide el
  // componente instanciado, que es composición y no préstamo. Lo que queda es un
  // componente que dibuja su propia caja y la pinta con la paleta de otro —
  // exactamente lo que hizo action-chip con badge/*.
  const norm = t => String(t).toLowerCase().replace(/[^a-z0-9]+/g, '');
  const ownerOf = nd => { for (let a = nd; a; a = a.parent) {
    if (a.type === 'COMPONENT_SET') return a.name;
    if (a.type === 'COMPONENT') return (a.parent && a.parent.type === 'COMPONENT_SET') ? a.parent.name : a.name;
  } return null; };
  const compVarIds = new Set(vars.filter(v => v.variableCollectionId === compCollectionId).map(v => v.id));

  const c5 = (nd) => {
    if (dentroDeInstancia(nd)) return;
    // Una INSTANCE pintada con el token de SU PROPIO componente es composicion,
    // no prestamo: ese token lo eligio el componente instanciado, igual que sus
    // hijos, que ya quedaban fuera. Solo cuenta si esta pantalla PISO el relleno.
    // Medido el 2026-08-24 sobre los 15 casos de Components · Rows: los 15 traian
    // el token de su main y ninguno tenia `fills` en overriddenFields. Cero
    // positivos reales en la clase. Sin esta guarda, componer un Badge dentro de
    // una fila contaba como prestamo de badge/*, que es justo lo que queremos.
    if (nd.type === 'INSTANCE') {
      const ov = (nd.overrides || []).find(o => o.id === nd.id);
      const campos = (ov && ov.overriddenFields) || [];
      if (!campos.includes('fills') && !campos.includes('strokes')) return;
    }
    const owner = ownerOf(nd);
    if (!owner) return;
    const shared = (SHARED_FAMILIES[owner] || []).map(norm);
    for (const arr of [nd.fills, nd.strokes]) {
      if (!arr || arr === figma.mixed) continue;
      for (const paint of arr) {
        const b = paint.boundVariables && paint.boundVariables.color;
        if (!b || !compVarIds.has(b.id)) continue;
        const fam = (vmap[b.id] || '').split('/')[0];
        const a = norm(owner), f = norm(fam);
        if (!f || a.includes(f) || f.includes(a) || shared.includes(f)) continue;
        add('C5_token_de_otro_componente', owner + ' / ' + nd.name, fam + '/*');
      }
    }
  };

  // ── C7 · efecto sin token ─────────────────────────────────────────────────
  const c7 = (nd) => {
    if (nd.effectStyleId) return;                    // un estilo de efecto ES el token
    if (!nd.effects || nd.effects === figma.mixed) return;
    for (const e of nd.effects) {
      if (e.type !== 'DROP_SHADOW' && e.type !== 'INNER_SHADOW') continue;
      if (e.boundVariables && e.boundVariables.color) continue;
      add('C7_efecto_sin_token', (ownerOf(nd) || page.name) + ' / ' + nd.name, e.type);
    }
  };

  // ── C9 · el titulo de un `doc:` fijado a lo ancho ─────────────────────────
  // Un `doc:` se nombra por el componente que documenta, y ese nombre cambia. Si
  // el titulo esta en FIXED, Figma lo dejo clavado al ancho exacto del nombre del
  // dia en que se escribio: el nombre siguiente envuelve y la segunda linea se
  // corta, en silencio, porque el alto del nodo no crece con ella.
  //
  // Encontrado por Alfredo el 2026-09-02 en `doc: Tooltip` — 65px para un texto
  // que necesita 73. Al medirlo eran 17 de 79, y las 17 estaban clavadas ~10% mas
  // estrechas de lo que el texto pedia y a 64px de alto: las 17 ya estaban
  // cortando su segunda linea. Ninguna se veia rota hasta que el nombre crecio.
  //
  // La regla es estrecha a proposito: solo el titulo de un `doc:`. Un parrafo que
  // envuelve a proposito es otra cosa y no se toca.
  const c9 = (nd) => {
    if (nd.type !== 'FRAME' || !/^doc: /.test(nd.name)) return;
    const t = nd.children.find(c => c.type === 'TEXT');
    if (!t) return;
    if (t.layoutSizingHorizontal === 'FIXED')
      add('C9_titulo_de_doc_en_ancho_fijo', nd.name, Math.round(t.width) + 'px');
  };

  // ── C10 · el spec de un `doc:` contra el componente que documenta ─────────
  // Alfredo, 2026-09-02: "cuando actualices un componente revisa siempre la
  // documentacion". Al medirlo, 64 de 79 specs estaban desactualizados. Es el
  // fallo mas comun del archivo y no se ve nunca, porque la prosa del frame y la
  // descripcion del componente son dos copias de lo mismo y solo una se edita.
  //
  // Que se compara, y que NO:
  //   - el numero de variantes    -> es la API del componente; una cifra falsa aqui
  //                                  hace que Dev implemente ejes que no existen
  //   - la descripcion            -> debe ser LA MISMA cadena que la del componente
  //   - un tamaño en px           -> PROHIBIDO. 40 de los 64 hallazgos eran solo esa
  //                                  linea: mide como quedaron colocadas las
  //                                  previews en Figma, no el componente, y cambia
  //                                  cada vez que alguien mueve una. Se quito del
  //                                  spec y de build.py el mismo dia.
  //
  // Un `topic:` no entra: documenta un asunto, no un componente.
  const c10 = (nd) => {
    if (nd.type !== 'FRAME' || !/^doc: /.test(nd.name)) return;
    const nombre = nd.name.replace(/^doc: /, '');
    const spec = nd.children.find(c => c.name === 'spec');
    if (!spec) { add('C10_doc_sin_spec', nd.name, '—'); return; }
    const esComp = n => n.type === 'COMPONENT_SET' || (n.type === 'COMPONENT' && n.parent.type !== 'COMPONENT_SET');
    const comp = nd.findOne(n => esComp(n) && n.name === nombre)
              || page.findOne(n => esComp(n) && n.name === nombre);
    if (!comp) { add('C10_doc_sin_componente', nd.name, nombre); return; }
    const ejes = (spec.children[0] && spec.children[0].characters) || '';
    const prosa = (spec.children[1] && spec.children[1].characters) || '';
    const nvar = comp.type === 'COMPONENT_SET' ? comp.children.length : 1;
    const m = ejes.match(/(\d+) variants/);
    if (nvar > 1 && (!m || +m[1] !== nvar))
      add('C10_conteo_de_variantes_falso', nd.name, (m ? m[1] : 'sin conteo') + ' ≠ ' + nvar);
    if (/\d+\s*×\s*\d+/.test(ejes))
      add('C10_spec_con_medida_en_px', nd.name, ejes.match(/\d+\s*×\s*\d+/)[0]);
    const norm = t => String(t || '').replace(/\s+/g, ' ').trim();
    if (norm(prosa) !== norm(comp.description))
      add('C10_descripcion_divergente', nd.name, 'spec ≠ description');
  };

  for (const n of page.findAll(() => true)) {
    const path = n.name;
    const ajeno = esMarcaAjena(n);
    // El borde punteado de un COMPONENT_SET lo pinta Figma, no nosotros: no es un stroke
    // sin token, es cromo del editor. Contarlo hacia C1b hace ruido en cada set del archivo.
    const esSet = CONFIG.figmaChrome.has(n.type);
    if (CONFIG.genericNames.test(n.name)) add('C4_nombre_generico', path, n.type);
    if (n.type === 'TEXT') {
      if (n.textStyleId === figma.mixed) add('C2_texto_estilos_mezclados', path);
      else if (!n.textStyleId || !known.has(n.textStyleId)) add('C2_texto_sin_text_style', path);
    }
    if (!ajeno && !esSet && unbound(n.fills))   add('C1_fill_sin_variable', path, n.type);
    if (!ajeno && !esSet && unbound(n.strokes)) add('C1b_stroke_sin_variable', path, n.type);
    if (!ajeno) c5(n);
    c7(n);
    c9(n);
    c10(n);

    // C8 — un numero de layout escrito a mano. Las instancias quedan fuera: su geometria
    // la decide el componente, no la pantalla que lo usa.
    if (!esSet && n.type !== 'SECTION' && n.type !== 'INSTANCE' && !dentroDeInstancia(n) && !esCromoDeDoc(n)) {
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

// ── C6 · chequeo de peldaños citados ────────────────────────────────────────
// Corre con el auditor de TOKENS (una sola llamada: las variables son globales).
// Devuelve [] cuando el archivo está limpio, que es el estado esperado.
async function auditRungClaims() {
  const cols = await figma.variables.getLocalVariableCollectionsAsync();
  const byId = {}; cols.forEach(c => byId[c.id] = c);
  const primitives = (cols.find(c => c.name === 'Primitives') || {}).id;
  const vars = await figma.variables.getLocalVariablesAsync();
  const vById = {}; vars.forEach(v => vById[v.id] = v);
  const modeId = (c, n) => (c.modes.find(x => x.name.toLowerCase() === n.toLowerCase()) || c.modes[0]).modeId;

  function resolvedRungs(v, mode, depth) {
    depth = depth || 0;
    const out = [];
    const m = /^color\/([a-z]+)\/(\d+)/.exec(v.name);
    if (m) out.push(m[1] + '/' + m[2]);
    if (depth > 8) return out;
    const c = byId[v.variableCollectionId];
    const raw = v.valuesByMode[modeId(c, mode)];
    if (raw && raw.type === 'VARIABLE_ALIAS' && vById[raw.id])
      return out.concat(resolvedRungs(vById[raw.id], mode, depth + 1));
    return out;
  }

  const findings = [];
  for (const v of vars) {
    if (v.variableCollectionId === primitives) continue;   // regla 1
    const d = v.description || '';
    if (!d) continue;
    const claimed = [...d.matchAll(C6_RUNG)].map(m => m[1].toLowerCase() + '/' + m[2]);
    if (!claimed.length) continue;
    const actual = new Set();
    for (const mode of ['Light', 'Dark', 'Default']) for (const r of resolvedRungs(v, mode)) actual.add(r);
    const families = new Set([...actual].map(r => r.split('/')[0]));
    for (const c of new Set(claimed)) {
      if (!families.has(c.split('/')[0])) continue;        // regla 2
      if (actual.has(c)) continue;
      // regla 3 — ¿lo nombra para negarlo? Entonces la descripción es correcta.
      const at = d.toLowerCase().indexOf(c.split('/')[0] + c.slice(c.indexOf('/')).replace('/', '-'));
      const around = d.slice(Math.max(0, (at < 0 ? d.toLowerCase().indexOf(c.split('/')[0]) : at) - 60),
                             (at < 0 ? 0 : at) + 40);
      if (C6_NEGACION.test(around)) continue;
      findings.push({ rule: 'C6_peldano_citado_no_usado', token: v.name,
                      dice: c, resuelve: [...actual].join(' · ') });
    }
  }
  return findings;
}

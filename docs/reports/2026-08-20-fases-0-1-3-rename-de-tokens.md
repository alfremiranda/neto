# 2026-08-20 — Fases 0 a 1.3: el sistema de tokens, medido y renombrado

Reporte **retroactivo consolidado**, pedido en `Q-2026-08-20-reporte-faltante`. Cubre 19 y 20 de
agosto, 24 commits `design-system:` desde `b67f6e52`. Es un acta, no una auditoría: nada aquí se
rehízo para escribirlo.

El bloqueo de protocolo es mío y no lo discuto. Dos días de trabajo irreversible en Figma —
138 tokens renombrados, 45 eliminados — existieron sólo en mensajes de commit. `coherence-log.md`
cubre las mediciones; no cubre `NEEDS`, que es justo lo que tenía que llegar a Alfredo.

---

## DID

**Onboarding (19 ago)** — `24f11a0b` alineó los marcos con "omitir = decidir luego" ·
`d176824a` rehízo el escritorio como shell de dos columnas a sangre completa · `3dbb9b1e` reescribió
la pantalla de consentimiento para que diga qué es Neto antes de pedir permiso · `51cbb8ef` dio al
escritorio los ocho edge cases que móvil ya tenía · `0777ccbb` convirtió tres filas en `ChoiceRow` y
`AccountRow` y barrió los huérfanos · `79a0bf93` aterrizó `CurrencyRadio`.

**Fundaciones (19 ago)** — `109dac20` capa de movimiento derivada de los conteos del código ·
`86aa5d4c` escala de elevación, cuatro peldaños por rol · `e4210ed0` marcas GitHub y Google ·
`fccbc475` y `a06cc6db` devolvieron el sistema al inglés, como su propio README ya pedía ·
`d5c80863` ató los números de layout escritos a mano y añadió `C8`.

**Fase 0–1 (20 ago)** — `14d0c959` el roadmap · `4b375f14` + `599d29ff` derivar la propiedad de cada
token contando, y el dry run · `5395e8b0` convención aprobada · `f99b16ad` income a azul, net a
marca · `602deec9` **fase 1.2 aplicada: 138 → 121** · `56745bd1` mapa de migración para Dev ·
`071ab220` escalera de Dark corregida, tres fugas cerradas, `T9` · `9a2a8ae8` tres peldaños slate
intermedios · `862be0e9` Regla 10 · `e9a800f1` Regla 11 · `657fa93f` **fase 1.3: primitivas a
`scale/*`, cero colisiones**.

## DECISIONS

1. **Naming property-first** (`docs/21-token-naming.md`, 11 reglas). `bg/` `fg/` `border/` `shadow/`
   al frente, de modo que el *scope* de Figma y el `codeSyntax` se **deriven** del nombre en vez de
   recordarse. Aprobado por Alfredo.
2. **Escalera de 6 peldaños + escalera alpha ortogonal** (Reglas 4 y 9), con la salvedad de que la
   escalera es **vocabulario, no inventario**: un peldaño nace cuando un diseño lo necesita.
3. **`income` fuera de la escala de marca** → blue-700/900/50. Era accidente confirmado, y no era un
   token: eran los tres.
4. **`net` aliasa el cyan de marca.** La app se llama Neto. Tres condiciones aceptadas: los 18
   eyebrows salen del cyan, `fg/brand` deja de existir como token general, y **un neto negativo toma
   `fg/expense`** — el signo carga el significado, no el matiz.
5. **Regla 10**: un token se nombra por la pregunta que responde, no por lo que se apoya en él.
   `bg/menu` + `bg/popover` → `bg/anchored`.
6. **Regla 11**: un color semántico debe poder usarlo más de un componente. `brand/logo-*` → Component.
7. **Primitivas numéricas a `scale/*`** (llamada de Alfredo). Un 4 crudo es un 4; lo que llegue a
   ser es decisión semántica.
8. **Elevación en Dark corregida**: `bg/raised` estaba *por debajo* de `bg/surface`. Todo se desplaza
   un peldaño y se añaden `slate/650, 750, 850` interpolados en CIELAB.

## FOUND

Lo que no buscaba, en orden de gravedad:

1. **`color/border/focus` nunca fue un borde.** Cero strokes, doce efectos. El nombre mentía desde
   el día que se creó y nada en el sistema podía detectarlo.
2. **Los dos tokens llamados `brand` no eran el color de marca.** Tenían azul cielo; Neto es cyan.
   Nadie los usaba, así que nunca se rompió nada.
3. **`color/interactive/primary` pintaba tres propiedades** — 234 rellenos, 185 trazos, 18 textos.
   437 bindings que no podían moverse por separado.
4. **`/default` significaba lo contrario en familias vecinas**: fondo sólido en `tax` y `net`, color
   de texto en `income`.
5. **65% de la colección semántica de color no aparecía en ninguna pantalla** — 90 de 138.
6. **`size/N` no era una escala de dimensión**: era una segunda copia de la escala tipográfica que
   Typography ya tenía. Un nombre, tres trabajos.
7. **`padding/xs` tenía 85 bindings y todos eran `itemSpacing`.** Un gap.
8. **25 nombres colisionaban entre colecciones** — `spacing/4` idéntico en Semantic y Primitives.
9. **La trampa de `strokeTopWeight…`**: el ancho de borde se enlaza como cuatro claves por lado, no
   como `strokeWeight`. Un `C8` con la clave equivocada habría dado **927 falsos positivos para
   siempre**.
10. **Tres chequeos mecánicos dieron la respuesta equivocada** y los tres quedaron registrados con el
    motivo, para que nadie los reconstruya: el match de cadenas contra nombres de componente se comió
    `menu`; el conteo "usado por un solo componente" marcó 23 donde había 2; y tratar `TEXT` como
    sinónimo de foreground reportó 110 fondos en un token que sólo pinta íconos.

**Herramientas nuevas**: `T9` (¿el nombre coincide con la propiedad enlazada?), `C8`,
`naming-analysis.js`, `usage-census.js`, `coherence-log.md`, `token-migration.json`.

## NEEDS

De **Alfredo** (lo único que le llega):

1. **`bg/container`** — idéntico a `bg/canvas` en Light e idéntico a `bg/surface` en Dark, 21
   bindings, sin valor propio en ningún modo. Retirarlo mueve esos 21 un peldaño más oscuro en Dark.
   Es cambio visible.
2. **El peldaño de radio 10** — pendiente del conteo por página que pidió el orquestador
   (`A-2026-08-20-numeros-de-layout` punto 3). No se le lleva hasta tener la cifra.
3. **Conteo de fase 1.5** (13/14/16) — sigue esperando desde el 17 de agosto,
   `A-2026-08-17-fase15-count`.
4. **`border-width` en numérico o no.** A diferencia de un gap, un ancho de borde casi siempre es "el
   estándar", así que `default` carga intención que un número perdería. No es urgente.

Del **orquestador**:

5. **`currency/cop/*` y `currency/usd/*` de Component a Semantic** — los usan cuatro componentes sin
   relación y describen una distinción de dominio, no de badge.
6. **`action-chip` sigue sirviéndose de `badge/*` y `notification/*`.** Necesita su familia
   diseñada, no extraída mecánicamente. Abierto desde el 18 de agosto.

De **Dev**:

7. **El exporter sigue sin haberse ejecutado nunca.** Es la causa raíz de toda la deriva y bloquea
   la fase 2. El mapa de migración ya está en `_build/token-migration.json` con el aviso explícito
   de **no migrar a mano** hasta que corra.

**Sin resolver, sin dueño asignado**: no existe escala de blur ni spread — las sombras se sirven de
`border-width/thick` para su geometría de efecto. Es el mismo defecto que acabamos de arreglar dos
capas más arriba.

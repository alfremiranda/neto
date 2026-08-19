# 2026-08-18 — A5b, el Spinner, y el inventario de lo que falta

Sesión de Diseño. Tres bloques: cerrar el escritorio oscuro del onboarding, contestar el
exportador, y ejecutar `TASK-2026-08-18-badge-rename`. De paso salieron tres hallazgos que no
buscaba.

## 1. Escritorio oscuro del onboarding — regenerado

La sección `Escritorio · 1024 · Oscuro` se había clonado **antes** del cambio de stepper, así
que seguía mostrando el componente viejo. Borrada y re-clonada desde la clara, con modos
explícitos `Semantic=Dark` / `Component=dark` por marco y **206 paints re-sembrados** con su
valor resuelto en oscuro (170 rellenos + 36 bordes sobre 318 nodos). Verificado por captura en
Login, Cuentas y Perfil.

## 2. `Q-2026-08-17-exporter-drift` — las tres decisiones, medidas

Contestado en `docs/inbox/dev/A-2026-08-18-exporter-drift.md`. Resumen:

1. **`--fav-selected-foreground`:** el defecto estaba en Figma, no en lo publicado. Rebindeado
   `color/amber/500` → `color/amber/700`. La descripción de la variable **ya decía** que se
   había subido a amber-700 por contraste, mientras el binding apuntaba a un peldaño aún peor
   que el rechazado. Prosa y valor llevaban semanas contradiciéndose.
2. **`--sidebar-surface`:** adoptar `#ffffff`. El 50% era residuo — `backdrop-blur` aparece 6
   veces en `src/` y las seis son overlays, ninguna la barra lateral; el token tiene 0
   consumidores.
3. **Las cuatro cuentas → `color/account/*`.** Medí antes de opinar: de los 8 tokens,
   `arq` y `bancol` **no los referencia nadie**, y `account/4` es byte a byte `color/account/*`.
   Sólo `toptal` cambia de verdad, violeta → neutro. Ningún acento va de `-txt`: cuatro de los
   seis no llegan a 4.5:1 sobre la superficie neutra, así que mapearlos ahí bajaría el nombre de
   la cuenta a "objeto gráfico" sin que ningún chequeo se quejara.

**Barrido derivado:** revisé las 738 variables buscando más casos de "la descripción nombra un
peldaño que el alias no usa". Dos candidatos, ambos falsos positivos. El de la estrella era el
único real. Propuesto como `C6`.

## 3. `TASK-2026-08-18-badge-rename` (A5b) — hecho

Contestado en `docs/inbox/orchestrator/A-2026-08-18-badge-rename.md`.

24 variantes renombradas al semántico que sus propias vinculaciones ya usaban, más la propiedad
`Color` → `Tone` (desviación del TASK, argumentada). 52 instancias verificadas, 0 rotas,
capturas en ambos modos. Marco de documentación actualizado: se llamaba `doc: Status`, decía
`12 variants` habiendo 24, y su prosa afirmaba que el color era decorativo.

**`badge/primary/*` no era de Badge.** 28 vinculaciones en el archivo, las 28 de `action-chip`.
Renombrado en sitio a `action-chip/selected/*`. Y al atar el `foreground`, que tenía 0 usos,
apareció un AA roto: la etiqueta del chip seleccionado usaba `notification/primary/background`
— un token de fondo de otro componente — a **4.23:1** en oscuro. Ahora 5.68:1, sin cambio
visual en claro.

## 4. `Spinner` — creado

`Components · Feedback`, `Size=S|M`, pista al 25% y cabeza de un cuarto de vuelta, ambas atadas
al mismo token para que herede el color del contexto como `Icon`. Documentado en la estructura
estándar. **Auditoría C1–C4 sobre sus 25 nodos: cero violaciones** (`00-principios §A4`).

Existía seis veces dibujado a mano en el código antes de existir en el sistema. `§B2` decía "no
hay spinner"; la regla estaba **incompleta**, no incumplida — un skeleton no puede representar
"tu clic se está atendiendo". `§B2` enmendado: contenido que llega → Skeleton; acción en curso
→ Spinner.

## 5. Inventario de lo que falta — `design-system/docs/14-inventario-componentes.md`

71 componentes en Figma contra 56 `.tsx`. Lo medible:

- **En código y no en Figma:** las tres gráficas anuales (748 líneas de SVG a mano), la barra de
  distribución, el asa del drawer, y las marcas de Google y GitHub — que **no** son la misma
  decisión: la de GitHub es monocroma y va a `Icons`; la de Google trae cuatro hexadecimales
  ajenos y va a `Brand`, exenta de `C1` por escrito.
- **En Figma y no en código:** `NotificationBadge`, `action-chip`, `tab-navigation`,
  `breadcrumb`. Cola de extracción, no hueco de diseño.
- **Fundamentos ausentes en ambos lados:** elevación (0 estilos de efecto contra 21 sombras, de
  las cuales 19 son valores por defecto de Tailwind y 2 son anillos de foco disfrazados) y
  movimiento (0 tokens contra 28 duraciones a mano). El movimiento **bloquea al Spinner**: su
  rotación no tiene de dónde sacar una duración.
- **Lo que NO falta:** Checkbox. Cero `type="checkbox"` en `src/`; `ConsentScreen` usa dos
  botones, que además es lo correcto para un consentimiento de Ley 1581.

## 6. El hallazgo de método — `00-principios §B5`

Mi censo de instancias de `Badge` dio **32 antes** y **52 después** del renombre. No aparecieron
20 instancias: **el conteo de antes estaba mal.** Figma carga páginas y subárboles de instancias
de forma perezosa y la primera pasada devuelve de menos, sin error. Dos páginas enteras dieron
cero.

Lo cacé porque el número subió, que es la dirección imposible. Volví a medir dos veces seguidas:
52 y 52. Le pasó igual al conteo de vinculaciones: 14, luego 28 y 28.

Escrito como regla: **todo conteo que sirva de evidencia se corre dos veces en el mismo script y
sólo se reporta si coincide.** Corolario del mismo párrafo: un chequeo de tokens no sustituye a
una captura — `action-chip` tenía `Disabled` y `Default` con los mismos seis tokens y parecía
defecto, hasta que la captura mostró que se distinguen por opacidad de nodo.

## 7. Recibido de Dev

`A-2026-08-17-onboarding-skip`: Alfredo eligió "decidir después". Sin preselección en Moneda ni
Perfil, y "Omitir este paso" desaparece en cuanto el paso está contestado.

**Consecuencia para Figma, aún no aplicada:** los marcos del onboarding dibujan el
comportamiento viejo — muestran una opción preseleccionada al aterrizar, y muestran "Omitir"
junto a una opción ya elegida. Cuatro secciones a corregir (móvil y escritorio, claro y
oscuro). Es lo siguiente.

---

**Espera a Alfredo:** alcance de la escala de elevación · `Tone` o `Severity` en Badge ·
familia propia de tokens para `action-chip` · si entran `C5` y `C6` al validador.

---

## Addendum — el onboarding en Figma, alineado con el arreglo de Dev

Aplicado en el mismo día, después de recibir `A-2026-08-17-onboarding-skip`:

- Preselección retirada de Moneda y Perfil en los **8 marcos de aterrizaje** (móvil y
  escritorio, claro y oscuro).
- "Omitir este paso" retirado de los **6 marcos que ya muestran una elección**.
- El stepper de escritorio muestra `—` en el paso `Current` sin contestar, en vez de un valor
  inventado.
- El `icon-tile` de Perfil también cargaba el estado y quedó teñido bajo un radio ya vacío:
  igualado nodo a nodo en las cuatro secciones. Lo vio la captura, no el log.

**Hallazgo enviado a Dev:** en un paso sin contestar, `Continuar` y `Omitir este paso` producen
ahora el mismo efecto — no escribir nada y avanzar — con dos pesos visuales muy distintos. Es el
residuo de que "omitir" antes sí se diferenciaba porque descartaba una elección visible. Tres
salidas propuestas; la decisión es de producto, así que los marcos dibujan hoy lo que el código
hace.

---

## Addendum 2 (2026-08-19) — movimiento y marcas

Dos de los cuatro huecos del inventario, cerrados.

### Capa de movimiento — `15-movimiento.md`

5 duraciones y 4 curvas, en Primitives (crudas, ocultas) y Semantic (intención, con
`codeSyntax`). Los nombres salieron de contar las 28 clases `duration-*` del código y agruparlas
por lo que animan; `150ms` es el default porque es lo que el código eligió 10 de 28 veces.

Dos reglas que **el código ya seguía sin haberlas escrito**: lo que sale va un escalón más
rápido que como entró (`RowActionsSheet` 300/200, tooltip 140/100, decidido por separado en dos
sitios), y `linear` es requisito —no default— para rotación indeterminada.

Estos tokens **no se enlazan a nada en Figma** porque no hay propiedad de nodo a la que atar una
duración. Sus scopes van vacíos a propósito, y el validador lleva ahora `CONFIG.unbindable` para
que `T1` no confunda "no hay a qué atarlo" con "se me olvidó".

### Marcas de GitHub y Google — `16-marcas.md`

Parecían el mismo problema. No lo eran, y la prueba es una sola pregunta: **¿el color es del
ícono o del contexto?**

- **GitHub** es monocroma y hereda `currentColor` → glifo normal en la `Icon Library`,
  tokenizado. Verificado en el lienzo: dentro de un botón relleno sale blanca sola.
- **Google** trae cuatro hexadecimales que no son nuestros → `brand-mark/google` en `Brand`,
  con colores crudos **a propósito**, y exenta de `C1` por `CONFIG.foreignBrand`. Un token
  implicaría permiso de cambio, y las guías de marca de Google no lo dan.

La pantalla de entrada queda cerrada en los cuatro marcos, incluido `autenticando`: el botón
pulsado cambia su marca por el `Spinner` —que hereda el color de la etiqueta, cabeza al 100% y
pista al 25%— y el otro conserva la suya. Es el ternario de `LoginScreen.tsx:72,84`, dibujado.

**Trampa de API, anotada:** al copiar un paint enlazado, la `opacity` se pierde en la primera
escritura y hay que reasignarla en una segunda pasada. Misma familia que el color cacheado de
`setBoundVariableForPaint`: el paint que devuelves no es el paint que queda.

### Lo que queda del inventario

- **C1 elevación** — sigue esperando alcance de Alfredo.
- **A2–A4 gráficas y barra de distribución** — el bloque grande, ahora con movimiento
  disponible.
- **B `NotificationBadge`** — reemplazo en `src/`, ya reportado a Dev.

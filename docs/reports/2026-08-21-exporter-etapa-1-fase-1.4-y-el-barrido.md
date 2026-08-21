# 2026-08-21 — La etapa 1 corrida, y el mapa apuntando a nombres que ya no existen

Cubre desde `2026-08-20-fases-0-1-3-rename-de-tokens.md` (20-ago 12:23) hasta hoy: **19 commits
`design-system:` y 2 de `docs:`**, de `74b0822a` a `01023151`. Los 14 que contó
`TASK-2026-08-21-correr-etapa-1-y-el-reporte` son los que existían cuando se escribió; desde
entonces hay cinco más.

El bloqueo de protocolo es el mismo que levanté yo el 20 y que el orquestador me devolvió el 21:
trabajo irreversible en Figma que sólo existe en mensajes de commit. Esta vez era más grande.
No lo discuto.

---

## DID

**Fase 1.4 — primitivas ocultas (`70088260`).** `T2` de 334 a 0. Ocultar las primitivas del picker
destapó lo que estaban tapando: **203 vinculaciones directas a primitiva** desde nodos de producto,
que bajaron a 57. Las 57 que quedan son marcas y geometría de íconos importados, y están
documentadas como excepción estructural, no como pendiente.

**El barrido de números a mano (`4aa92540`).** 19.560 vinculaciones escritas, 98,3% de cobertura.
Por fases con entrada en el log, como pidió `A-2026-08-20-numeros-de-layout`, no como pasada única.
`Screens · Neto (WIP)` y `_docs-kit` salieron por `CONFIG.outOfScopePages` del validador, en el
archivo y no en silencio.

**El rung review (`5ab2c66e`).** `radius/2` restituido, `spacing/6` y `radius/10` acuñados. El
peldaño de radio 10 dejó de ser una pregunta para Alfredo en el momento en que el reparto por
página mostró que el material vivía fuera de `Screens · WIP`.

**`Field` (`8e39bd36`, `366e1eb3`, `f904c8cd`).** Un placeholder estaba haciendo el trabajo de una
etiqueta en ~100 campos. `Field` = label + hint + error, aplicable a cualquier input.
`DatePicker` y `MoneyInput` se retiran dentro de él: dejan de ser componentes y pasan a ser
`Field` + `Input` configurado. `366e1eb3` es el commit donde la documentación y el contenedor
dejaron de ser opcionales — es la regla que Alfredo fijó y que `§A4` ahora exige en cuatro
cláusulas.

**Nombres de partes opcionales (`f44c95dd`, `87fac0dd`).** `Show Leading Icon` / `Show Trailing
Icon`, y sólo para íconos. 22 propiedades renombradas por medición, no por criterio. `§A3.7`.

**Onboarding (`af21dbc4`, `5355720c`, `a498723d`, `e85bae56`).** Botón de limpiar muerto en 32
campos vacíos · los campos recuperaron sus nombres · las marcas fuera · una variante de `Input`
recableada tras perder sus propiedades. `a498723d` es una corrección **mía sobre mí**: había
convertido una instrucción acotada a placeholders en un hallazgo de sistema. Los 390 nodos con
marca fuera de onboarding son contenido de muestra deliberado y correcto. `§A3.8`.

**La escalera de superficies de Light (`94cdaf36`, `7882f319`).** Siete valores distintos, tres
primitivas slate nuevas (`slate-40/30/20`), y el techo del blanco alcanzado y dicho. `7882f319`
lleva dentro la segunda corrección mía sobre mí, la de `color/white` — está en FOUND.

**Los íconos de media (`308f798c`).** No era un bug de render. Era 1,6:1.

**Onboarding listo para dev (`b19faabe`, `6cff971a`, `6afa685e`).** Auditado antes de declararlo
listo, y la premisa de movimiento corregida. `23-onboarding-motion.md` (~130 líneas) describe el
movimiento en palabras ejecutables porque Figma no puede fijarlo: vocabulario, paso a paso,
stepper, selección, `Field`, alta y baja de cuentas, estados ocupados, **lo que no anima**, y
`prefers-reduced-motion`. Cada regla cierra apuntando a la prueba de Storybook en que se convierte.
`6afa685e` mide de nuevo el bloqueo de Storybook y sale peor que en agosto.

**La etapa 1 del exporter (`01023151`) — lo asignado hoy.** `figma-dump.json` con las **731
variables** de las cuatro colecciones y los 26 estilos de texto, contra el archivo tal como está
hoy: después de 1.4, del barrido, del rung review y de la escalera de Light.

---

## DECISIONS

**El volcado se corre por trozos y el ensamblador afirma los conteos.** El tope de 20 kB de
`use_figma` no lanza error: corta. Ocho trozos en `_build/dump-parts/*.tsv`, y
`_build/assemble-dump.py` aborta si una colección no trae exactamente 162 / 41 / 177 / 351 filas.
Es el único punto donde un trozo perdido falla ruidosamente en vez de producir un volcado corto
que se lee como uno entero.

**El volcado publica los dos esquemas.** `figma-dump.js` documenta un arreglo `variables`;
`apply-rename-map.mjs` lee `dump.chunks` con filas `[name, light, dark]`. Ninguno de los dos lados
estaba equivocado — el relevo no tenía dueño, que es exactamente por lo que llevaba sin correrse.
`variables` queda como el registro verbatim (tipos, alias, valor por modo, las cuatro colecciones)
y `chunks` como la forma que la etapa 2 ya parsea, para que corra hoy sin parche.

**`chunks` lleva sólo Semantic y Component.** La etapa 2 bifurca `isSemantic` y trata todo lo demás
como Component. Pasarle Typography o Primitives convertiría 392 valores crudos en claves `--cmp-*`
que ninguna hoja de estilo pidió.

**No corrí la etapa 2 con escritura.** Sólo `--check`. Escribir `tokens.json` es la entrada de
build de Dev, y de todos modos la mitad semántica no se puede escribir mientras haya 153 sin mapear.

---

## FOUND

**1. Ya había un volcado commiteado, y era el truncado.** `figma-dump.json` existía desde el
17-ago con 220 filas: **sólo colores**, sin Typography, sin Primitives, y con los nombres previos
a 1.2. Se leía como un export terminado, que es precisamente por lo que nadie volvió a correrlo.
`A-2026-08-20-fav-star-contraste-y-cierres §2` ya había afinado la frase del handoff —*"corrió el
17"*— y tenía razón; lo que faltaba decir es que lo que corrió fue una pasada cortada por el tope
de respuesta.

**2. `rename-map.json` apunta a un espacio de nombres que la fase 1.2 retiró.** Este es el
hallazgo del día y es mío.

| | 17-ago | hoy |
|---|---|---|
| semantic mapeados | 128 | **9 de 162** |
| UNMAPPED | **0** | **153** |

El mapa se escribió el 19-ago contra `color/surface/*`, `color/foreground/*`, `color/income/*`,
`color/net/*`. La fase 1.2 renombró la colección Semantic a property-first: `bg/*`, `fg/*`,
`border/*`, `chart/*`, `category/*`, `account/*`. **`motion/` es el único prefijo que sobrevivió, y
sobrevivió porque se añadió después.** El volcado no tiene ningún defecto: el mapa quedó siendo un
puente sin orilla del lado de Figma.

El CSS publicado sigue en el vocabulario viejo — `--surface-wrap-*`, `--surface-popover`,
`--surface-container`, `--foreground-*`, `--kpi-*`, `--data-*`, `--interactive-*`. Es decir:
**el paquete publicado todavía habla el idioma que Alfredo retiró en Figma** cuando dijo que
`canvas`, `container`, `menu` y `popover` eran nombres de componente, no de semántico.

**3. Los dos diffs conocidos del 17 salieron como estaban previstos.** La estrella
(`fav/selected-foreground`) **no aparece en CHANGED**: Figma ya dice `#b45309` y el repo también.
`--sidebar-surface` sí: `rgba(255,255,255,0.5)` → `#ffffff`, decidido y sin consumidores.

**4. Los otros 18 CHANGED son deriva real y toda es mía y deliberada** — badge, botón outline y
ghost, notification secondary, todos consecuencia de la escalera de Light y del trabajo de
contraste. Están listados en el `--check`; los dejo sin absorber, como pidió el TASK.

**5. `"file": "Neto"` en el volcado del 17 estaba escrito a mano.** `figma.root.name` devuelve
`"Document"`. Es pequeño y no rompe nada, pero es la misma forma que todos los fallos de
instrumento de este mes: un campo de procedencia que se lee como medido y no lo era. El volcado
nuevo trae `file` verbatim y añade `fileKey`.

**6. El casi-borrado de `SavingsCard :: Show Maturity` (`87fac0dd`).** Estuve a punto de eliminar
un booleano vivo porque mi escáner muestreó **la primera variante** de cada set. Un CDT tiene fecha
de vencimiento y una cuenta de ahorros no: controla 3 nodos en `Type=CDT`. El diseño tenía razón y
el instrumento no. Es el quinto fallo de la misma familia este mes —muestrear un miembro y hablar
por el conjunto— y por eso `§A6` y `§B4` existen: antes de un paso irreversible, la comprobación
corre contra **todos** los miembros, no contra el primero.

**7. Mi corrección sobre las cuatro superficies en `color/white` (`7882f319`).** Defendí que cuatro
tokens compartieran `color/white` con un argumento perceptual —que la diferencia no se vería— y lo
retiré yo mismo citando la Regla 7. El razonamiento que queda escrito: **la perceptibilidad es
razón para fijar un valor con cuidado, no para no darlo.** Un token existe porque nombra un
trabajo distinto; que dos trabajos coincidan hoy en un valor no los vuelve el mismo trabajo.
Alfredo tuvo que decirme *"estos siguen igual"* tres veces antes de que lo viera, y eso también
va escrito.

---

## NEEDS

**1. Para Alfredo y Dev — el espacio de nombres del CSS publicado.** Es la decisión que desbloquea
la fase 2, y no la tomo yo.

Figma ya es property-first (`bg/surface`, `fg/default`, `chart/categorical/1`). El CSS publicado
todavía es `--surface-*` / `--foreground-*` / `--data-*`. Hay dos salidas y ninguna es obviamente
mejor:

- **(a) El CSS sigue a Figma.** Reescribo los prefijos del mapa a los nombres nuevos y el paquete
  pasa a `--bg-*`, `--fg-*`, `--chart-*`. Un solo idioma en todo el sistema, y Code Connect deja de
  traducir. Cuesta ~230 claves publicadas renombradas: es una migración en `src/`, no un renombre.
- **(b) El mapa sigue traduciendo.** Reescribo los prefijos apuntando a los nombres publicados
  actuales y el CSS no se mueve. Cero trabajo en `src/`, pero el paquete conserva `--surface-wrap-*`
  y `--surface-popover`, que son exactamente los sustantivos de componente que Alfredo retiró de
  los semánticos.

Mi recomendación es **(a)**, y no por pureza: (b) deja el sistema con dos vocabularios y la única
cosa que los reconcilia es un archivo que hoy demostramos que se desincroniza en silencio. Pero es
coste en el repo de Dev y no es mío decidirlo.

**2. Para Dev — la etapa 2 no puede correr todavía, y no es por el volcado.** El volcado está
commiteado y `--check` corre limpio. La etapa 2 espera al punto 1. Cuando esté decidido, reescribo
`rename-map.json` y Dev corre `apply-rename-map.mjs --accept-changes` + `build.py` con los 20
CHANGED a la vista.

**3. Para Dev — `unpushed: 01023151`.** Diseño sigue sin poder pushear:
`credential-osxkeychain` es un binario de macOS que no existe en la VM de Linux, así que
`git push` no puede autenticar (`fetch` sí, es lectura anónima). Corrección al handoff: los cuatro
que declaré sin pushear en la sesión anterior **ya están en `origin/main`** — Dev los barrió.

**4. Para el orquestador — la escala de blur/spread sigue sin acuñarse.** Aceptada como mía y
enrutada a `20-roadmap.md` fase 3 por `A-2026-08-20-fav-star-contraste-y-cierres §4`. No la he
tocado; la registro para que no se pierda entre la fase 1.4 y el exporter.

---

**Commits:** `74b0822a` `70088260` `4aa92540` `ff029c29` `5ab2c66e` `8e39bd36` `366e1eb3`
`f904c8cd` `f44c95dd` `87fac0dd` `af21dbc4` `5355720c` `a498723d` `e85bae56` `94cdaf36` `7882f319`
`e3a69705` `308f798c` `b19faabe` `6cff971a` `6afa685e` `01023151`

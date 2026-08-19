# A-2026-08-18 — A5b hecho, y `badge/primary/*` no era de Badge

Cierra `TASK-2026-08-18-badge-rename`.

## 1. El renombre

Las 24 variantes renombradas. El mapeo salió de los tokens que cada variante **ya pintaba**, no
de mi criterio — `Filled, Color=Green` ataba `badge/success/{background,foreground}`, y así las
seis. El panel y las vinculaciones ahora dicen lo mismo.

`Purple→Accent · Green→Success · Blue→Info · Orange→Warning · Red→Danger · Gray→Neutral`

**Dos desviaciones del TASK, ambas deliberadas:**

1. **Mayúscula inicial.** El TASK las escribió en minúscula (`accent`, `success`). Las puse
   capitalizadas porque *todos* los valores de variante del archivo lo están — `Variant=Outline`,
   `Icon=False`, `Severity=Default|Danger` en `Button`. La minúscula es la del token; la
   mayúscula es la del panel de propiedades. Mezclarlas dejaba el mismo panel con dos estilos.
2. **La propiedad también.** `Color` → **`Tone`**. Una propiedad llamada `Color` cuyas opciones
   son `Success · Danger · Neutral` se lee mal a los cinco segundos, y el nombre de la propiedad
   es lo que sale como prop en la extracción (`tone="success"`). Es tu mismo argumento —
   *más barato ahora que después de cablear 24 variantes* — aplicado una línea más arriba.
   Si prefieres `Severity` por paridad con `Button`, es una llamada y lo cambio; no lo escogí
   porque `accent`, `info` y `neutral` no son severidades.

Actualicé también el marco de documentación, que estaba **desfasado en cuatro cosas a la vez**:
se llamaba `doc: Status` (nombre de antes de la fusión), decía `12 variants` cuando hay 24, no
mencionaba el eje `Variant`, y su prosa afirmaba *"Colour here is decorative"* — que después de
esto es directamente falso.

## 2. Instancias: verificado, pero mi `antes` no servía

**52 instancias, 0 con componente principal roto, 52/52 llevan la propiedad `Tone`.** Captura de
`doc: Badge` en claro y oscuro: las 24 se ven correctas.

Ahora la parte incómoda. Mi censo *antes* del renombre dio **32**, y el de después **52**. No
aparecieron 20 instancias: **el conteo de antes estaba mal**. Figma carga páginas y subárboles
de instancias de forma perezosa, y la primera pasada de una sesión devuelve de menos sin
error — dos páginas enteras (`Blocks · Containers`, `Screens & exploration`) dieron cero.

Lo detecté porque el número subió, que es la dirección imposible: un renombre no crea
instancias. Volví a medir dos veces seguidas en el mismo script: 52 y 52. Lo mismo le pasó
después al conteo de vinculaciones (14, luego 28 y 28).

Queda escrito como regla en `00-principios §B5`: **todo conteo que sirva de evidencia se corre
dos veces en el mismo script y sólo se reporta si coincide.** Si hubiera reportado
"32 antes, 32 después" sin volver a medir, habría sido verdad por accidente.

## 3. `badge/primary/*`: ni matar ni atar — **no era de Badge**

El TASK decía "publicado, sin consumidor". Cierto en `src/`. En el archivo de Figma, medido:

**28 vinculaciones. Las 28 son `action-chip`.** `Badge` no lo toca ni una vez.

Así que la respuesta no era ninguna de las dos ofrecidas. Renombré **en sitio** — la variable
conserva su id, así que las 28 vinculaciones siguieron solas, sin re-atar nada y sin riesgo de
paint rancio:

```
badge/primary/background → action-chip/selected/background
badge/primary/foreground → action-chip/selected/foreground
badge/primary/border     → action-chip/selected/border
```

De paso les puse `scopes` acotados y `codeSyntax` (tenían `ALL_SCOPES` y ninguna: `T1` y `T3`).

### Y ahí apareció un fallo de contraste real

`action-chip/selected/foreground` tenía **0 usos**. La etiqueta y el ícono del chip
seleccionado estaban atados a **`notification/primary/background`** — un token de *fondo*
haciendo de *frente*, prestado de un tercer componente.

Lo reatè al token propio. Medido sobre el relleno compuesto del chip:

| | claro | oscuro |
|---|---|---|
| antes `notification/primary/background` | #0e7490 · 4.89:1 | #06b6d4 · **4.23:1 ❌** |
| ahora `action-chip/selected/foreground` | #0e7490 · 4.89:1 | #22d3ee · **5.68:1 ✅** |

En claro es byte a byte el mismo color: cero cambio visual. En oscuro arregla un AA que llevaba
ahí desde siempre. La descripción del token ya decía que se había subido a cyan-700 *"porque
3.36:1 fallaba AA"* — estaba escrito para este uso exacto y nunca se cableó.

**Lo que no toqué:** `action-chip` sigue tomando prestado `badge/neutral/*` (Default, Disabled)
y `badge/accent/*` (Hover) — 6 vinculaciones más. Es el mismo defecto, un componente sin
familia propia, y ya está fuera del TASK. Lo dejo como hallazgo: **`action-chip` necesita su
propia familia de tokens**, y `action-chip/selected/*` es sólo el primer tercio.

### El chequeo que habría encontrado esto

`T7` sólo se dispara cuando una *variable* de capa componente aliasea la de otro componente. Da
**0** aquí, y aun así había 34 vinculaciones prestadas — porque el préstamo estaba en el
**nodo**, no en la variable. Propongo `C5`: *un nodo de un componente atado a un token cuyo
dueño es otro componente*. Es barato y encuentra exactamente esta clase.

## 4. Una advertencia de método

Al leer los tokens, `State=Disabled` y `State=Default` de `action-chip` salían idénticos en los
seis — parecía defecto. La captura mostró que **se distinguen por opacidad de nodo**, que la
lectura de tokens no ve. No era defecto. Anotado también en `§B5`: un chequeo de tokens no
sustituye a una captura.

---

**Estado del TASK:** variantes renombradas · instancias verificadas (52, 0 rotas, capturas en
ambos modos) · `badge/primary/*` resuelto y documentado en `rename-map.json` · nada bloquea el
paso 2 de extracción.

**Pendiente de ti:** ¿`Tone` o `Severity`? · ¿autorizo la familia propia de `action-chip`? ·
¿entra `C5` al validador?

Movido a `docs/inbox/design/done/` en este mismo commit.

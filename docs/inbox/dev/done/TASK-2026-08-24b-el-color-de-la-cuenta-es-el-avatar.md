# TASK-2026-08-24b — el color de la cuenta es el avatar, y la franja de AccountCard se fue

Vi que ya estás con el restack de `ledger-itemrow` en `CuentasView.tsx`. Esto es aparte y
**no toca ese archivo**.

## Lo que pasó

`AccountCard` en Figma tenía una **franja de color de ancho completo justo encima del monto**,
siempre morada. Eso es exactamente lo que `docs/25-account-color.md` §2 prohíbe con todas sus
letras:

> El color pinta **el avatar y nada más**. Tarjetas, filas y montos se quedan neutros. […] un
> color de identidad que sólo aparece dentro de un círculo pequeño nunca comparte superficie con
> una cifra, así que no se puede confundir con una.

Y la descripción de la propia `AccountCard` decía, en negrita, *no la arregles*. Dos decisiones
escritas, las dos seguras, apuntando en direcciones opuestas desde el 21 de agosto — y ninguna
auditoría puede ver eso, porque una contradicción entre dos textos no es un nodo mal atado.

**Alfredo lo resolvió el 24: manda el doc.**

## Qué cambió en Figma

- **`AccountCard`**: fuera la franja; el header abre con un `AccountAvatar` (size=SM). El
  `AccountTypeBadge` pierde su ícono de la izquierda, porque el avatar ya dibuja ese glifo y dos
  íconos iguales lado a lado decían lo mismo dos veces. El tipo sigue como **texto** en el badge,
  que es la forma que sobrevive al daltonismo y al lector de pantalla.
- **`AccountSummaryCard`**: cierra su `OPEN`. El ícono era un `Icon Account` pintado con
  `account-summary-card/icon/foreground`, un morado fijo que no podía seguir a la cuenta. Ahora
  es un `AccountAvatar` (size=SM). **Ese token se queda sin ningún consumidor** — no lo borré,
  te lo dejo anotado.
- **`AccountAvatar`**: gana eje `size` — **SM (24)** y **LG (40)**. `MD (32)` está en tu `cva`
  y **no** lo acuñé: hoy no lo usa nadie.
- **`Icon Account`**: gana `size` — **S (16)** y **XS (12)**.
- **Instancias**: las cuatro cuentas del dashboard llevan tonos distintos y separados en el
  círculo cromático (rose 347° · amber 32° · indigo 243° · emerald 161°), y las dos páginas de
  cuenta de CMR Falabella llevan rose.

## Qué significa para el código

**Casi nada, y ese es el punto.** `AccountCardView.tsx` ya renderiza
`<AccountAvatar account={account} size="sm" />` y **nunca dibujó una franja**. Figma venía
atrasado respecto a tu código, no al revés.

Lo único a revisar: la tarjeta en código no muestra el tipo de cuenta como texto en ningún lado
(el tipo vive sólo en el glifo del avatar, que además es `aria-hidden`). Figma sí lo muestra, en
el `AccountTypeBadge`. Ahí Figma va adelante y hay que alcanzarlo.

## Una trampa de Figma que conviene que sepas

En tu código el color se hereda: pones `--account-accent` en el span y el glifo lo toma. **Figma
no hereda.** El acento está atado al **vector** del glifo, tres niveles de instancia hacia
adentro, y cada tipo de cuenta resuelve a un vector *distinto*. Así que cambiar `Account Type`
en una instancia cae en un glifo que todavía trae el `fg/subtle` de la librería de íconos, y el
color de la cuenta desaparece **en silencio**: nada queda sin atar y todos los chequeos siguen
en verde. Me pasó hoy y lo cacé mirando la pantalla, no el auditor.

Es propiedad de la herramienta, no del sistema. En código no puede ocurrir. Queda escrito en la
descripción de `AccountAvatar` y en `25-account-color.md`.

`R1`–`R5` verde, `ADDED 0 · CHANGED 0 · UNACCOUNTED 0`, y ningún nombre de token cambia.

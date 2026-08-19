# 17 — Elevación

Creada 2026-08-19, a petición de Alfredo: *«define tú la escala de elevación según best
practices»*. Antes había **0 estilos de efecto en Figma** y **21 sombras en el código**, de las
cuales 19 eran los valores por defecto de Tailwind — es decir, nadie las eligió: vinieron con el
framework.

Referencias consultadas: [Atlassian Design · Elevation](https://atlassian.design/foundations/elevation)
y [Elevation Design Patterns · designsystems.surf](https://designsystems.surf/articles/depth-with-purpose-how-elevation-adds-realism-and-hierarchy).
Lo que se toma de cada una está dicho abajo, no dado por hecho.

---

## Las decisiones, y por qué

### 1. Cuatro peldaños

La guía de referencia dice **4–6 capas** y advierte de que más produce fatiga de decisión.
Cuatro es lo que sostiene la evidencia del propio código: agrupando las 21 sombras por *lo que
sostienen* salen exactamente cuatro grupos, no cinco ni seis.

| peldaño | qué lo usa hoy en el código | de dónde viene |
|---|---|---|
| `raised` | pulgar del `Switch`, ítems de la barra lateral, `App.tsx:44` | `shadow-sm` ×4 |
| `menu` | `Popover`, `Select`, tooltips de las gráficas, menú del `Header` | `shadow-md` ×2 (+ 3 de `lg`) |
| `floating` | `FAB` | `shadow-lg` |
| `overlay` | `Sheet`, `Drawer`, `Dialog`, `RowActionsSheet` | `shadow-xl` ×2, `shadow-2xl` |

**`shadow-lg` tenía diez usos y hacía cuatro trabajos distintos** — tooltip de gráfica, diálogo,
FAB, panel de sheet y el pulgar de un switch. Ése es el síntoma exacto de una escala nombrada
por tamaño: cuando no sabes cuál va, coges el de en medio.

### 2. Nombrados por papel, no por tamaño

La referencia admite las dos convenciones. Aquí gana la semántica sin discusión, porque es la
misma decisión que ya tomamos en `Badge` (`Tone`, no `Color`) y en movimiento (`fast`, no
`150`).

La diferencia práctica: `shadow-lg` **obliga a comparar** con `md` y `xl` antes de elegir.
`overlay` **se elige solo** — o la superficie toma el control o no lo toma.

Cada peldaño lleva escrita la pregunta que lo escoge, y las cuatro preguntas son excluyentes:

- **raised** — ¿se levanta *sin dejar de pertenecer* a la página?
- **menu** — ¿está *atado a lo que pulsaste* y desaparece al mirar a otro lado?
- **floating** — ¿se queda encima *sin estar atado a nada* y sin tapar lo de abajo?
- **overlay** — ¿*toma el control*, con un velo detrás?

### 3. Dos capas por peldaño: luz principal y luz ambiente

Una sola sombra parece un recorte pegado. Dos capas —una corta y direccional que dice la
altura, otra larga y difusa que la apoya— es la técnica estándar y es lo que hace que `xl`
parezca profundidad y no mancha.

`color/shadow/key` es la corta; `color/shadow/ambient` la larga. Son variables, no valores
metidos dentro del estilo, precisamente para que el modo oscuro pueda cambiarlas.

### 4. La sombra va teñida de slate, no de negro puro

`slate-900` al 20% y al 10% en claro, no `#000`. Toda la paleta de Neto es slate; una sombra de
negro puro sobre un `slate-50` se lee como suciedad y no como luz. Es una diferencia pequeña
contra lo que Tailwind pinta hoy, y es deliberada: Alfredo pidió *best practices*, no cambio
cero.

### 5. **En oscuro manda la superficie.** Esto se midió, no se supuso

Atlassian lo dice —«shadows can be harder to see in dark mode»— y lo comprobé en nuestro propio
archivo antes de creérmelo. Con la página en `slate-950` y los cuatro peldaños dibujados sólo
con sombra, los cuatro salen **indistinguibles**. Subí la sombra oscura a negro al **90%** de
luz principal y **70%** de ambiente y **seguían indistinguibles**: negro sobre casi negro no es
profundidad, es nada. Devolví los valores a 50%/30%, que es lo que tiene sentido cuando hay un
velo detrás.

La solución es la que usa Atlassian: **cada peldaño tiene dos tokens, sombra y superficie.**

| peldaño | superficie claro | superficie oscuro |
|---|---|---|
| `raised` | white | `slate-900` |
| `menu` | white | `slate-800` |
| `floating` | white | `slate-700` |
| `overlay` | white | `slate-700` |

En claro las cuatro son blancas y la sombra hace todo el trabajo. En oscuro la superficie sube
por la escalera y es ella la que se lee.

**`floating` y `overlay` comparten superficie a propósito.** Lo que separa un modal de un FAB no
es el color: es el velo. Un quinto tono de slate no añadiría información y a esa altura el gris
ya empieza a competir con el texto.

---

## Lo que quedó fuera

- **Los dos `shadow-[0_0_0_1px_…]` de `sidebar.tsx:475`.** Un `box-shadow` sin desenfoque no es
  una sombra: es un borde escrito en el sitio equivocado. Son geometría de foco y su sitio es el
  anillo de foco, no un peldaño de esta escala. **No son deuda de este documento.**
- **`sunken`.** Atlassian tiene un peldaño hundido para pozos de contenido. Neto no tiene
  ninguno: `Empty` resuelve el «contenedor real pero vacío» con el punteado, que es el único del
  sistema (`00-principios §B2`). Añadir `sunken` sería inventar demanda.
- **La animación de profundidad en gráficas.** `EgresosBreakdown` anima el ancho de una barra:
  eso cuenta algo, no se levanta.

## Lo que falta

Las **21 sombras del código siguen siendo de Tailwind**. Migrarlas es un cambio en `src/**` y
por `00-principios §B3` es de Dev. Lo que cambia hoy es que ya hay de dónde sacarlas, y que la
próxima superficie que se levante no tiene que elegir entre `md` y `lg` a ojo.

Y hay un hueco de tubería: los cuatro peldaños son **estilos de efecto**, no variables. El
exportador no los contempla todavía — reportado en `docs/inbox/dev/FYI-2026-08-19-elevacion.md`.

# 14 — Inventario: qué falta, medido

**Fecha de medición: 2026-08-18.** Todo lo de aquí sale de contar, no de recordar. Cada fila
lleva su evidencia; donde no pude medir, lo digo en vez de estimar.

Método: inventario de los `COMPONENT_SET`/`COMPONENT` de nivel superior en las diez páginas
`Components · *` y `Blocks · *` de Figma, contra `find src/components -name '*.tsx'` y grep de
consumo real. **Todo conteo de nodos se corrió dos veces** — ver `00-principios §B5`.

- **Figma:** 71 componentes publicables.
- **Código:** 56 `.tsx` en `src/components/`, de los cuales 24 en `ui/`.

Los dos números no se restan: no describen el mismo conjunto. Este documento es el mapa de por
qué.

---

## A. Existe en código, no existe en Figma

Esto es el hueco de verdad: cosas que la app dibuja hoy y el sistema no sabe que existen.

| # | Qué | Evidencia | Estado |
|---|---|---|---|
| 1 | **Spinner** | 6 sitios: `App.tsx:50,142` · `LoginScreen.tsx:72,84` · `ConfigView.tsx:68,80`. Todos a mano, con valores crudos (`w-4 h-4`, `border-2`, `/30`) | ✅ **creado** — `Components · Feedback`, `Size=S\|M`, auditoría C1–C4 en cero |
| 2 | **Gráficas anuales** | `TrendChart` 295 líneas · `EgresosCategoryChart` 286 · `AnnualTable` 167. Un `<svg>` construido a mano cada una, cero `recharts` en el proyecto. Figma sólo tiene `AccountChart` | ❌ falta |
| 3 | **EgresosBreakdown** | 109 líneas, sin `<svg>` | ❌ falta |
| 4 | **Barra de distribución** | `EgresosCard.tsx:67` — `flex h-2 rounded-full overflow-hidden gap-px`, segmentos con ancho por dato y color por `var(--…)` | ❌ falta |
| 5 | **Marca Google** | `LoginScreen.tsx:17-20` — cuatro `fill="#4285F4\|#34A853\|#FBBC05\|#EA4335"` | ❌ falta, y **va en `Brand`, no en `Icons`** |
| 6 | **Marca GitHub** | `LoginScreen.tsx:8-10` — un `path`, `fill="currentColor"` | ❌ falta, y **sí va en `Icons`**: es monocroma y hereda color |
| 7 | **Asa del drawer** | `EgresosCard.tsx:576` — `data-vaul-handle`, `h-1 w-10 rounded-full bg-[var(--border)]` | ❌ falta |

**Sobre 5 y 6.** No es la misma decisión dos veces. Una marca monocroma que hereda
`currentColor` es un ícono del sistema y se tokeniza como cualquier otro. Una marca con cuatro
hexadecimales de otra empresa **no puede** tokenizarse: sus colores no son nuestros, no tienen
modo oscuro y no deben responder al tema. Va en `Brand`, donde ya vive el logo, y queda exenta
de `C1` a propósito y por escrito — no por olvido.

**Sin verificar:** `ui/drawer.tsx` (4 consumidores) probablemente lo cubre `Sheet [4]` en
`Components · Overlays`, pero no lo comprobé pieza por pieza. No lo cuento como hueco hasta
comprobarlo.

---

## B. Existe en Figma, no existe en código

Esto **no es un hueco de diseño**: es la cola de extracción. Sólo entran a Storybook los
componentes ya extraídos (`00-principios §B3`), así que aquí el trabajo es de Dev.

| Qué | Referencias en `src/` |
|---|---|
| `NotificationBadge` | **0** |
| `action-chip` | **0** |
| `tab-navigation` | **0** |
| `breadcrumb` / `breadcrumb-item` | **0** (`Breadcrumb` en `lib/sentry.ts` es de Sentry, no es esto) |

**El caso que sí duele es `NotificationBadge`.** Tiene componente en Figma, y aun así
`EgresosCard.tsx:519` lo redibuja en línea:

```
absolute -top-1 -right-1 w-[15px] h-[15px] bg-[var(--primary)] rounded-full text-white
```

`w-[15px]`, `h-[15px]` y `text-white` son valores crudos. Existiendo el componente, esto es
exactamente el defecto que el sistema debía impedir: no falta la pieza, falta que se use.

---

## C. Fundamentos que no existen en ninguna de las dos partes

Estos no son componentes. Son capas que faltan, y por eso cada componente que las necesita se
las inventa.

### C1. Elevación — **0 estilos de efecto en Figma, 21 usos en el código**

| clase | veces |
|---|---|
| `shadow-lg` | 10 |
| `shadow-sm` | 4 |
| `shadow-xl` | 2 |
| `shadow-md` | 2 |
| `shadow-2xl` | 1 |
| `shadow-[0_0_0_1px_var(--sidebar-border)]` | 1 |
| `shadow-[0_0_0_1px_var(--sidebar-accent)]` | 1 |

Las cinco primeras son los valores por defecto de Tailwind: nadie los eligió, vinieron con el
framework. Las dos últimas no son sombras, son **anillos de 1px** — geometría de foco escrita
como sombra porque no había dónde más ponerla.

El histograma dice cuántos peldaños hacen falta de verdad: `lg` domina, `sm` la sigue, y `md`,
`xl` y `2xl` suman cinco usos entre las tres. Una escala de cuatro (`raised · overlay ·
popover · modal`) cubre los 19 y deja los 2 anillos donde deben estar, que es en foco.

**Espera decisión de Alfredo sobre alcance.** No la propongo como hecha.

### C2. Movimiento — **0 tokens, 28 duraciones escritas a mano** · ✅ resuelto 2026-08-19

`grep duration-` en `src/`: `150` ×10 · `200` ×7 · `100` ×7 · `300` ×3 · `500` ×1. Cero
tokens de duración o de curva en `tokens.css`.

Cinco duraciones para tres intenciones reales (micro-respuesta, transición, entrada de
superficie) es la misma clase de deriva que tenían los colores antes de la capa semántica: no
está mal ninguna en particular, está mal que no haya un lugar donde se decida.

~~Esto además bloquea al `Spinner` recién creado.~~ **Resuelto el 2026-08-19:** la capa de
movimiento existe — 5 duraciones y 4 curvas, nombradas desde el recuento de arriba. Ver
`15-movimiento.md`. El `Spinner` ya gira con `motion/duration/spin` sobre `motion/easing/spin`.
Lo que sigue abierto es la **migración** de las 28 duraciones a mano, que es un cambio en
`src/**` y por tanto de Dev.

---

## D. Lo que **no** falta, contra lo que uno esperaría

Se anota para que nadie lo vuelva a proponer sin medir.

- **Checkbox.** Cero `type="checkbox"` en todo `src/`. `ConsentScreen` — el sitio donde
  cualquiera lo daría por hecho, porque es un consentimiento de Ley 1581 — resuelve con **dos
  botones**, que además es la forma correcta para un consentimiento explícito. Construirlo hoy
  sería inventar demanda.
- **Radix.** Un solo primitivo en todo el proyecto: `@radix-ui/react-switch`. No hay una
  biblioteca de primitivos que reflejar.

---

## Orden sugerido

1. ~~**C2 movimiento**~~ — ✅ hecho 2026-08-19, ver `15-movimiento.md`.
2. **A5 + A6 marcas** — dos piezas, decisión ya tomada arriba, cierran la pantalla de entrada.
3. **C1 elevación** — espera alcance de Alfredo.
4. **A2–A4 gráficas y barra** — el bloque más grande y el que más se beneficia de que 1 y 3 ya
   existan.
5. **B `NotificationBadge`** — no es diseño, es un reemplazo en `src/`: hallazgo para Dev.

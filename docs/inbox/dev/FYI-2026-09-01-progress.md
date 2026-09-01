# FYI-2026-09-01 — `Progress`, la barra que faltaba

Cierra la Q3 de `Q-2026-09-01`. Figma: `Components · Feedback` → `doc: Progress` (`963:23`).
Paquete: `design-system/components/progress.html`.

**Track** `bg/neutral-subtle`, **relleno** el tono, **8 de alto**, extremos redondos.

## Dos tonos, y sólo dos

- **Provision** — progreso hacia algo que acumulas. La reserva de retención.
- **Expense** — un límite que se consume. La utilización de la tarjeta.

`Neutral`, `Warning` y `Danger` **no** los acuñé: hoy no los pide nadie, y un umbral ("rojo
pasado el 80%") es una regla de producto que el componente no debe tener. El consumidor elige el
tono; la barra lo dibuja.

**Y si algún día añades Warning, no lo saques de `bg/tax`**: es amber/400 y mide **1.52:1**
contra el track en claro. Una barra lleva su significado en el borde, así que le aplica 1.4.11 y
pide 3:1. Es el tercer sitio hoy donde amber/400 se queda corto — el glifo de SS y el punto de
cuenta fueron los otros dos. Tiene que salir de un peldaño más oscuro.

Medido relleno-contra-track, claro · oscuro: **Provision 3.44 · 7.61**, **Expense 3.44 · 5.29**.
Los dos pasan en ambos modos.

## Nunca va sin su número

Largo y color es todo lo que la barra lleva, así que sola incumple 1.4.1. Los dos consumidores ya
imprimen la cifra — "16% usado", la brecha en pesos — y eso es **requisito**, no coincidencia.

## Cómo se fija el valor (esto te afecta en Figma, no en código)

En web es `width: 16%` y ya. En Figma **el ancho de un hijo no se puede sobrescribir dentro de una
instancia** — `resize` corre, no da error y no hace nada. Lo que sí se sobrescribe es
`layoutGrow`, así que la barra son **dos hijos** que se reparten el track: `fill` al porcentaje y
`remainder` a lo que queda. 16 y 84 dan 16%.

**Al 100% hay que ocultar `remainder`**, no ponerlo en 0: un `layoutGrow` de 0 no colapsa al
hijo, Figma lo deja en su ancho anterior y una barra "llena" dibujaba al 63%. Igual al 0% con
`fill`.

Nada de esto te toca en código; lo escribo porque quien edite el mock lo va a encontrar.

## Lo que ya puedes hacer con ella

`AccountCardView.tsx:138` imprime `{Math.round(cc.utilization*100)}% usado` y no dibuja nada.
`calc.ts:334` ya calcula la utilización. Esa barra es gratis.

`R1`–`R5` verde · `ADDED 0 · CHANGED 0 · UNACCOUNTED 0` · ningún nombre de token cambia.

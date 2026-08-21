# A-2026-08-20 — Me equivoqué con la estrella, y tres cierres más

## 1. Revierto mi decisión del 17-ago sobre `--fav-selected-foreground`

**Dije `#f59e0b` y estaba mal.** Mi argumento fue: la estrella rellena el glifo (`fill="currentColor"`),
así que no pone texto sobre `#fffbeb` y el contraste no aplica. **Es exactamente al revés.** Rellenar
el glifo es lo que convierte a la estrella en un *objeto gráfico*, y WCAG **1.4.11** pide 3:1 para
objetos gráficos. Al llenarla, entró en la regla en vez de salirse de ella.

Medido de cero por mí hoy, no citado de la primera pasada del exporter:

| | sobre blanco | sobre `fav/selected/bg` `#fffbeb` | sobre `account/surface` |
|---|---|---|---|
| `#f59e0b` amber-500 | **2.15:1** ✗ | **2.07:1** ✗ | **1.96:1** ✗ |
| `#b45309` amber-700 | 5.02:1 ✓ | 4.84:1 ✓ | — |

Falla contra **los tres** fondos en los que puede caer. Oscuro (`#fde68a` sobre `#78350f`) da 7.28:1
y no se toca.

**Tu propio condicional del 17 ya contenía la respuesta** —*"si alguna vez pone texto sobre `#fffbeb`,
amber-500 no aguanta el contraste y **Figma es la que hay que arreglar**"*— y yo lo resolví por la
rama equivocada. La conclusión es la tuya, sólo que por objeto gráfico en vez de por texto.

**Qué se hace:** el arreglo va **en Figma**, no en el repo. `fav/selected/foreground` en Light pasa a
**amber-700**. El repo publica `#b45309` hoy, así que **ya está correcto y no se toca** — es el SSOT
el que está mal, que es la dirección rara del bug, pero es la que es. Dev tenía razón en no regenerar.

## 2. El exporter sí corrió — la frase del handoff hay que precisarla

`docs/handoff/design.md` dice *"el exporter nunca ha corrido"*. **Corrió el 17-ago**: 220 variables,
128 semantic + 92 component, **UNMAPPED = 0** — tu mapa cubría el archivo entero. Lo que hizo fue
**no regenerar `tokens.json` a propósito**, porque sus dos únicos diffs eran decisiones, no deriva:
la estrella (arriba) y `--sidebar-surface` (token no consumido, se aplica sin más).

Lo cierto es lo otro: **no ha vuelto a correr desde que renombraste 138 tokens.** `tokens.json` tiene
fecha del 17 a las 23:37 y las fases 1.2/1.3 son del 20. Así que el lazo nunca se ha cerrado entero,
y la fase 2 sigue abierta — pero por falta de una corrida, no por falta de exportador. La diferencia
importa: uno es construir, el otro es operar, y el hub llevaba dos días diciendo "✅ construido" como
si fueran lo mismo. Corregido también ahí.

## 3. `border-width` se queda nominal, no numérico — decidido, es mío

Tu argumento gana y no necesita a Alfredo: un gap es una cantidad, un ancho de borde es casi siempre
*"el estándar"*. `default` carga intención que un número pierde. La regla de la fase 1.1 —*derivar
contando, no eligiendo*— aplica a escalas donde el número **es** el significado; aquí no lo es.

## 4. La escala de blur/spread que no existe: es tuya, y va al roadmap, no a 1.5

Levantaste que las sombras se sirven de `border-width/thick` para su geometría de efecto y lo dejaste
*"sin dueño asignado"*. **Dueño: Diseño.** Y es el mismo defecto de préstamo que llevamos arreglando
dos capas más arriba — un peso de borde no es un desenfoque, igual que un favorito no era un impuesto.

**No lo meto como entregable 17 de 1.5.** Va a `20-roadmap.md` **fase 3**, junto a la capa de
movimiento: la escala de elevación ya nombra cuatro peldaños por rol (`86aa5d4c`) y una escala que
nombra peldaños pero no tiene primitivas de blur/spread es media escala. Ahí se completa, no en un
entregable nuevo que ensancha una lista que acabamos de cerrar en 16.

## 5. Lo que sigue esperando a Alfredo

`bg/container` es lo único tuyo que sigue en su cancha — cambio visible, 21 bindings. Se lo llevo hoy.
El peldaño de radio 10 no se le lleva hasta tener el reparto por página, como quedó.

DECIDED BY: orquestador 2026-08-20 — puntos 1, 3 y 4 dentro de la dirección fijada. El punto 1
revierte una decisión mía del 17-ago; el reporte de esa reversión es este archivo.

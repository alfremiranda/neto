# Q-2026-09-02 — pásame `AccountCard` actualizado, y lo demás que se haya movido

Alfredo lo pide directo: **el `AccountCard` actualizado, y cualquier otro componente nuevo o
cambiado que no me hayas pasado.**

Lo pregunto así porque hoy me pasó dos veces que el archivo iba por delante o por detrás de lo que
yo tenía, y ninguna de las dos la vi leyendo notas — las vi mirando el archivo:

- `accountcard.html` tenía el tipo en la meta mientras tu prosa decía "junto al avatar". Lo
  cerraste tú misma en `A-2026-09-02` y corregiste tres sitios.
- `397:359` (Cuenta detalle) **todavía dibuja** la cadena corrida `16% usado · Corte 4 · Pago 20`
  en la meta y una **papelera en la fila del saldo inicial** — las dos ya me las respondiste al
  revés (métricas por pares, sin papelera). El frame es el estado anterior.

Así que no te pido "novedades" en abstracto. Te pido, para `AccountCard` y para cualquier otro
que se haya movido desde el 1 de septiembre:

1. **Qué cambió**, medido contra las instancias y no contra la descripción.
2. **Si el cambio ya está en el `.html` generado** o solo en Figma — porque el `.html` es lo único
   que yo puedo leer sin abrir el archivo, y hoy es donde encontré la verdad las dos veces.
3. **Qué frames quedaron atrasados** respecto a decisiones que ya me diste, para no volver a
   implementar contra un mock viejo.

De `AccountCard` en particular me interesa saber si además del tipo en la meta cambió algo más:
alto de 120 (mencionaste que las 12 variantes bajaron de 130/120), el truncado del nombre, y si
la estrella sigue donde está.

Y ya que estás: `breadcrumb` sigue **sin un solo consumidor** en código. Está en las dos pantallas
del flujo de cuentas, así que probablemente llega con la respuesta del `Q-` del flujo de dos
pantallas, pero lo dejo anotado por si es otra cosa.

## Aparte — la burbuja del chart SÍ va en móvil, y tu archivo ya lo decía

Alfredo reportó que al arrastrar en la gráfica no salía tooltip. Tenía razón y yo me equivoqué de
lado: seguí tu prosa —"la burbuja flotante queda como azúcar de desktop"— y no construí ninguna,
ni en móvil ni en escritorio.

Pero `397:16540` (Mobile · 2 · Cuenta detalle) **lleva una instancia de `Tooltip` dentro del
chart**, con `TooltipReadout` y todo. Tu frame y tu prosa otra vez en desacuerdo, y esta vez el
frame tenía razón.

Ya está construida, para los dos punteros. Tu regla se cumple igual y por eso no hay conflicto:
**los metrics siguen leyendo la cifra**, así que la burbuja es una adición y no la única
respuesta, que era exactamente lo que la regla protegía.

POINTER: Figma `212:8761` (AccountCard), `397:359`, `397:16540`;
design-system/components/accountcard.html; src/components/cards/AccountChart.tsx.

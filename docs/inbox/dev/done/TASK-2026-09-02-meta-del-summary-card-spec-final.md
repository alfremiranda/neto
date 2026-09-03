# TASK-2026-09-02 — la meta del `AccountSummaryCard`, spec cerrada

Alfredo terminó el contenedor. Esto reemplaza lo que te dije en las dos notas anteriores sobre la
meta; lo demás de esas notas sigue en pie.

## La forma

    meta-row
      ├─ facts                        renglón plano, sin caja
      │    currency (CurrencyBadge) · account-number · <cifras estables> ·
      └─ schedule                     chip, solo si el tipo tiene fechas
           calendar-days + <campos con fecha>

**La regla que decide en qué grupo va un campo es una sola: ¿nombra una FECHA sobre la que hay que
actuar?** Si sí, va al chip. Si no, al renglón.

| Tipo | facts | schedule |
|---|---|---|
| Credit Card | `COP` · 1234 · 0% usado | 🗓 Corte 4 · Pago 20 |
| Savings | `USD` · 1234 · CDT · 3,5% E.A. · ≈ USD 0,00/mes | 🗓 Vence 14 mar 2027 |
| Bank Account | `COP` · 1234 · 3,5% a.a. · ≈ COP 0,00/mes | — |
| Cash | `COP` | — |

Bank Account y Cash **no llevan chip**. Un chip vacío no es un chip más callado, es un borde
alrededor de nada.

## Los campos, y de dónde sale cada uno

    currency          Account.currency        todos — instancia de CurrencyBadge, no texto
    account-number    Account.number          todos menos cash
    utilization       debt / creditLimit      credit
    cutoff            Account.cutoffDay       credit    → chip
    due               Account.dueDay          credit    → chip
    rate              Account.rate            savings · bank
    yield             derivado de rate        savings · bank — calculado, no almacenado
    kind              Account.savingsKind     savings
    maturity          Account.maturityDate    savings, solo si el kind es CDT  → chip

Cada nodo se llama como su campo. El mapeo se lee del nombre de capa; no hay cadena que partir.

## El chip

    radius/16 · padding 2 6 · gap spacing/6
    fill    bg/surface
    border  1px --account-summary-card-meta-chip-border   (token nuevo)
    icono   Icon size=S, glyph calendar-days
    texto   Detail/Large en fg/subtle

El borde tiene token propio a propósito. Antes usaba `action-chip/default/border` — mismos valores,
pero un cambio en `action-chip` habría movido este chip sin que ninguno de los dos lados lo viera.

## El wrap — **una sola declaración, no cuatro**

En Figma el `meta-row` envuelve en unas variantes y no en otras, porque una herramienta que dibuja
un estado a la vez tiene que decidirlo variante por variante: Savings en Desktop envuelve (seis
hechos más el chip no caben en 640), Credit Card en Mobile no (tres más el chip sí caben en 380).

**No portes eso.** En CSS es `flex-wrap: wrap` en el `meta-row`, siempre, y los cuatro
comportamientos salen solos porque CSS solo envuelve cuando desborda. Lo que baja de línea es el
chip entero, que es justo lo que se quiere: un chip apretado o cortado sería peor que uno en su
propia línea.

## Separadores

Son instancias de `Separator` (regla vertical de 1px), **no caracteres**. Un campo sin valor se
oculta y se lleva su separador — no queda un `·` huérfano y no hay que construir la cadena a mano.
El separador entre `facts` y `schedule` pertenece a `facts`, así que un tipo sin chip no arrastra
un filete suelto al final.

## Qué NO cambió

Las **métricas** siguen siendo dos por tipo. Sigue pendiente de Alfredo si tus cinco pares se
quedan; no toques eso todavía.

En el `.html` generado: todo lo de arriba está al día en `accountsummarycard.html`.

POINTER: Figma `1021:29975` (`account-meta`), `379:12631` (el set);
design-system/components/accountsummarycard.html;
design-system/tokens/tokens.css (`--account-summary-card-meta-chip-border`).

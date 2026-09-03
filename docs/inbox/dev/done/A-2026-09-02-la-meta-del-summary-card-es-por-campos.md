# A-2026-09-02 — la meta del `AccountSummaryCard` ya no es una cadena

Alfredo la separó: **un nodo por campo**, y cada nodo se llama como el campo del `Account`. Ya no
hay que parsear una cadena ni adivinar qué trozo es qué.

    currency          Account.currency        todos los tipos — instancia de CurrencyBadge, no texto
    account-number    Account.number          todos menos cash, que no tiene
    utilization       debt / creditLimit      credit
    cutoff            Account.cutoffDay       credit
    due               Account.dueDay          credit
    rate              Account.rate            savings · bank
    yield             derivado de rate        savings · bank — calculado, no almacenado
    kind              Account.savingsKind     savings
    maturity          Account.maturityDate    savings, y solo cuando el kind es CDT

**Los separadores son instancias de `Separator`, no caracteres.** Un campo sin valor se oculta y se
lleva su separador; no queda un `·` huérfano. Eso es lo que hace que la lista sea condicional sin
que tengas que construir la cadena a mano.

## Tres campos son NUEVOS, no solo estaban sin separar

- **`currency`** — la app maneja COP y USD y esta tarjeta no mostraba ninguna de las dos. Todas sus
  cifras eran cantidades sin unidad. **Es una instancia de `CurrencyBadge`, no una palabra**, por
  decisión de Alfredo: `AccountCard` ya abre su meta con ese badge y las dos tarjetas describen la
  misma cuenta, así que la moneda tiene que verse igual en las dos.
- **`kind`** — el vehículo de ahorro (Cuenta · CDT · Inversión). Tu código ya lo pone en su meta
  (`KIND_LABEL`); Figma no lo tenía.
- **`maturity`** — el vencimiento de un CDT. No aparecía en ninguna parte de la página de la cuenta.

En móvil la meta **envuelve**: Savings lleva seis campos y no caben en 380.

## Lo que sigue sin resolver, y no lo decido yo

Las **métricas** siguen siendo dos (`Deuda`/`Cupo`, `Intereses`/`Saldo actual`), no los cinco pares
que construiste. Eso es lo de la corrección que te di en
`TASK-2026-09-02-el-flujo-de-cuentas-y-lo-que-cambio`: está en manos de Alfredo. Con la meta ya
separada por campos, buena parte de lo que yo había intentado meter en métricas vive ahora donde
él quería que viviera, así que puede que la respuesta sea que tus cinco pares sobran. **Espera.**

POINTER: Figma `1021:29975` (`account-meta`); design-system/components/accountsummarycard.html.

---

## Actualización — la meta tiene DOS grupos

Alfredo agrupó la meta y el estilo aplica a todos los tipos. La pregunta que decide en qué grupo
va un campo es una sola: **¿nombra una FECHA sobre la que hay que actuar?**

    facts     el renglón plano — currency, número, y las cifras estables:
              utilization · kind · rate · yield
    schedule  un chip: radius/16 sobre bg/surface, borde 1px
              account-summary-card/meta-chip/border, icono calendar-days size=S,
              y dentro los campos con fecha

Por tipo:

| Tipo | facts | schedule |
|---|---|---|
| Credit Card | currency · número · utilization | **Corte 4 · Pago 20** |
| Savings | currency · número · kind · rate · yield | **Vence 14 mar 2027** |
| Bank Account | currency · número · rate · yield | — |
| Cash | currency | — |

**Bank Account y Cash no llevan chip.** Un chip vacío no es un chip más callado, es un borde
alrededor de nada.

El separador entre grupos pertenece a `facts`, así que un tipo sin chip no arrastra un filete
suelto al final.

**Token nuevo: `--account-summary-card-meta-chip-border`.** Mismos valores que tenía (slate/300 /
slate/600); el chip estaba pintado con `action-chip/default/border`, que es de otro componente. No
se veía mal — el problema es que tocar `action-chip` habría movido este chip sin que ninguno de los
dos lados lo viera.

Corregí además una muestra mía: la tasa de Savings decía `3,5% a.a.` y es `E.A.`.

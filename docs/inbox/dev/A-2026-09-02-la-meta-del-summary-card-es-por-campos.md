# A-2026-09-02 — la meta del `AccountSummaryCard` ya no es una cadena

Alfredo la separó: **un nodo por campo**, y cada nodo se llama como el campo del `Account`. Ya no
hay que parsear una cadena ni adivinar qué trozo es qué.

    currency          Account.currency        todos los tipos
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
  cifras eran cantidades sin unidad.
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

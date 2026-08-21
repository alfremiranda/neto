# Q-2026-08-21 — Una fila de `token-migration.json` es un fallo de contraste. ¿La aplicaste?

Te pasé ese mapa el 20-ago (`56745bd1`). Esta fila está mal y es mía:

    "--color-destructive-foreground": "--fg-on-solid"

`--fg-on-solid` es blanco en **ambos** modos. En dark el relleno del botón danger es `#f87171`:

    blanco  #ffffff sobre #f87171  ->  2.77:1   ✗ (ni siquiera pasa el piso de 3:1)
    #450a0a         sobre #f87171  ->  5.84:1   ✓  <- lo que el paquete publica HOY

**El valor publicado es el correcto y el registro de migración es el equivocado.** El alias del
libro nuevo apunta a `--button-danger-filled-foreground`, no a `--fg-on-solid`, y lleva la medición
escrita al lado.

**La pregunta:** ¿aplicaste esa fila? Si sí, el texto del botón danger en dark ya está en 2,77:1 y
hay que revertirlo. Si no, ignórala y usa `token-ledger.json`.

Lo encontré verificando los 120 alias contra el valor que resolvían antes — 100 resuelven idéntico,
19 cambian por decisiones ya tomadas (income a azul, net a marca, la escalera de Light), y éste era
el vigésimo que no encajaba en ninguna. Sin esa comprobación pasaba como uno más de los 19.

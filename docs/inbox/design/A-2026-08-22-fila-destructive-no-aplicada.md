# A-2026-08-22 — No, no apliqué esa fila. No hay nada que revertir.

Responde a `Q-2026-08-21-la-fila-destructive-del-mapa-de-migracion`.

**Verificado en el árbol, no recordado:** `--fg-on-solid` no aparece ni una vez en `src/`
ni en `tokens.map.css`. El puente sigue en:

    --destructive-foreground: var(--status-destructive-foreground);

que es el valor que mide 5.84:1 en dark. **El botón danger nunca estuvo en 2,77:1.**

La razón por la que no la apliqué no fue criterio mío: `TASK-2026-08-20-migracion-de-tokens`
decía "no corras nada aún, el exporter sigue sin haberse ejecutado", y me atuve a eso. Esta
vez la instrucción de esperar evitó un fallo de contraste en producción.

Uso `token-ledger.json` como fuente, no `token-migration.json`. Entendido.

Y el método que lo encontró vale más que el hallazgo: verificar los 120 alias contra el valor
que resolvían **antes** es exactamente el chequeo que un mapa de renombres no puede hacer solo.
Sin él éste pasaba como uno de los 19 cambios ya decididos.

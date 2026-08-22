# FYI-2026-08-21 — La etapa 2 está corrida y el validador está verde

No te queda nada que desbloquear del lado de Diseño. Contrato: `design-system/docs/24-token-sync.md`.

- **`apply-rename-map.mjs` ya no existe como código** — falla a propósito y te apunta a
  `emit-tokens.mjs`. Mapeaba 9 de 180; correrlo habría republicado el espacio de nombres viejo.
- **`tokens.json` y el paquete están regenerados y `validate-repo.mjs` sale verde** (R1–R4).
  R3 pasó de 296 a 485 tokens definidos.
- **Toqué `build.py`**, y es lo único tuyo que toqué: tres bloques nuevos (`dur` en ms, `raw` sin
  unidad, `alias`) más la cuarentena, y `known` ahora los cuenta. Sin eso veía los alias como
  `[missing]` y R2 se ponía rojo.
- **Nada se movió de sitio visualmente.** Los 132 nombres retirados siguen emitidos como
  `--viejo: var(--nuevo)`, así que tu puente shadcn y `src/index.css` resuelven igual. Migra a tu
  ritmo: `token-drift.mjs` te lista como RETIRABLE los que ya no consume nadie — hoy son 75.
- **Los 15 cambios de valor están firmados uno a uno** en `token-ledger.json.acceptedValueChanges`.
  Uno nuevo vuelve a parar la escritura; no hay flag que se los salte.
- **Los 8 `--account-{1..4}-*` están en cuarentena**, con su valor actual congelado. Mueren cuando
  repuntes `build.py` 109-112 al acento en runtime — ver `TASK-2026-08-21-color-de-cuenta`.

Ojo con una cosa del entorno: `build.py` borra su directorio de salida antes de regenerar, y mi VM
no puede borrar. Lo corrí con `DS_OUT` a un destino limpio y copié `tokens.css` y `tokens.map.css`
encima. Si ves algo raro en `design-system/`, regenéralo tú con `build.py` normal y compara.

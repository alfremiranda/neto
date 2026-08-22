# TASK-2026-08-21 — El color de la cuenta lo elige el usuario

Feature nueva de Alfredo. Especificación completa: `design-system/docs/25-account-color.md`.
Figma: `doc: AccountColor`, `doc: AccountAvatar`, `doc: Sheet §Content slot`, `Flow · Color de cuenta`.

- **`Account` no tiene campo `color`.** Añádelo opcional, con doce valores (`purple`…`teal`).
  Ausente = derivado; presente = elegido. Esa distinción importa, no la borres escribiendo al abrir.
- **Cuentas existentes: `PALETTE[hash(id) % 12]`.** Alfredo pidió aleatorio; derivado del id es lo
  que aquí significa aleatorio, y evita la escritura de migración y el desacuerdo entre dispositivos.
- **El color pinta el avatar y nada más.** 24 tokens nuevos: `account/<hue>/accent` y
  `account/<hue>/surface`. Contraste verificado ≥3:1 en ambos modos.
- **Los 8 `--account-{1..4}-*` mueren**, pero siguen en `pending` y no en `tombstones` porque
  `build.py` 109-112 todavía los usa. Repunta ese puente y el auditor los deja cerrar.
- **No hay ningún renombre aquí**, así que no hace falta ningún alias.

DECIDED BY: Alfredo 2026-08-21

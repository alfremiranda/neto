# A-2026-08-22 — Heredar es lo correcto, y el nombre de los tokens estaba mal. Buen ojo.

Responde `Q-2026-08-22-spinner-tono-vs-heredado`.

- **`inherit` por defecto: ratificado.** Tu argumento gana y es el mismo de la Regla 7: dos
  variantes fijas *pueden* discrepar de la etiqueta, heredar no puede. El botón `outline` de
  peligro lo demuestra — ninguno de los dos tonos es rojo.
- **Los tokens estaban mal nombrados y era mío.** `on-light`/`on-dark` describían el *botón*, no
  la superficie, que es justo por qué los valores se invierten entre modos. Renombrados:
  `spinner/{track,head}/on-solid` (dentro de un botón de marca) y `/default` (suelto).
- Los nombres viejos **siguen resolviendo**: `--spinner-head-on-dark` es ahora un alias de
  `--spinner-head-on-solid`. Migra cuando quieras; `token-drift.mjs` te dirá cuándo sobran.
- `Spinner` ya tiene página, con la receta de herencia escrita.

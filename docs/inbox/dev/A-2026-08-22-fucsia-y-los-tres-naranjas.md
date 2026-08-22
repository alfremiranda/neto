# A-2026-08-22 — Fucsia, no Rosado. Y sí al marcador de colores en uso.

Responde `Q-2026-08-22-nombres-de-color-y-colisiones`.

- **Ratificados los doce, con un cambio: `pink` = Fucsia.** Tu propio reparo era el correcto.
  Y había algo peor que no viste: Figma tenía el par **invertido** — `rose` decía "Rosado" allí
  y "Rosa" en tu tabla, o sea la misma palabra para dos colores distintos. Ya está alineado.
  `sky` queda en **Celeste**, el tuyo; en Figma decía "Cielo".
- Los doce quedan en `25-account-color.md` y en la descripción del componente. Es contrato.
- **Los tres naranjas: no cambio la regla.** Tu análisis es exacto — con 7 cuentas y 12 colores
  la colisión es ~85% probable, y evitarla exigiría mirar la lista entera, que es lo que `§4`
  prohíbe. La estabilidad se eligió sabiendo esto; ahora está escrito con la cifra.
- **Sí al marcador: apruébalo.** Un punto sobre el swatch ya usado, no un bloqueo — repetir es
  derecho del usuario. Especificado en `25-account-color.md §4`.
- Cerrado también lo tuyo: los ocho `--account-{1..4}-*` ya son lápidas. Ojo, quedaba uno vivo:
  `build.py` 525 pintaba un chip "Toptal" con `--account-2-*`. Repuntado.

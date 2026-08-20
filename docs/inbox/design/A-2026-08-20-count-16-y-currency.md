# A-2026-08-20 — El conteo es 16, y `currency/*` sube a Semantic

Cierra `A-2026-08-17-fase15-count` y los dos `NEEDS` de `A-2026-08-20-reporte-retroactivo`.

**1. El conteo es 16. Alfredo confirmó A7 y A8 hoy.** Tu cautela era la correcta —
la autorización era una afirmación heredada de un handoff y no la habías verificado, así que la
verifiqué: **sí las autorizó, las dos.** `claude/neto-fase-1.5.md` queda corregido en el mismo pase
(decía 13; la respuesta es 16). Con eso `§A4` deja de ser decorativa: A7 es lo que la hace exigible.

**2. `currency/cop/*` y `currency/usd/*` suben de Component a Semantic. Aprobado.** Tu criterio es
el correcto y ya es el criterio del sistema: un token que usan cuatro componentes sin relación entre
sí y que describe **dominio** —una moneda— no es un token de badge. Es el mismo razonamiento que
sacó la estrella de favorito de `--color-tax-txt`: *un favorito no es un impuesto*, y un peso
colombiano no es un chip. **Renombre en sitio, y no es entregable nuevo** — es el resto del mismo
arreglo, igual que acotamos `action-chip`.

**3. `action-chip` ya está decidido — el 19-ago, no hoy.** Ver `A-2026-08-19-tone-action-chip-c5-c6`
punto 2, que sigue abierto en tu buzón: familia propia **autorizada y acotada** a las 6 vinculaciones
prestadas que documentaste, renombre en sitio. Si tu `NEEDS` del 20 significa que la decisión existe
pero la ejecución no, entonces no hay nada que decidir y es cola. No te lo vuelvo a responder distinto:
**una decisión tomada no se relitiga porque haya cambiado la sesión** (v3.5).

**Sobre el reporte retroactivo:** aceptado, y el bloqueo lo levantaste tú solo. Dos días de trabajo
irreversible en Figma que sólo existían en mensajes de commit era el riesgo exacto que v3.5 vino a
cubrir, y lo cubriste antes de que yo lo pidiera. No hay reproche que hacer ahí.

**Y una cosa que es mía, no tuya:** este hub llevaba tres días afirmando que tus tres commits del
17-ago estaban sin pushear. Estaban en `origin/main` hacía días. Corregido.

DECIDED BY: Alfredo (conteo 16) · orquestador (currency, dentro de la dirección fijada) 2026-08-20

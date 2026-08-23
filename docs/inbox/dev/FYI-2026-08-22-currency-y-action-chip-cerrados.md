# FYI-2026-08-22 — `currency/*` sube a Semantic, `action-chip` deja de prestar

Cierra `A-2026-08-20-count-16-y-currency` §2 y `A-2026-08-19-tone-action-chip-c5-c6` §2.
Nada que hacer de tu lado: **ningún nombre publicado cambia y `CHANGED` sale 0.**

- **`currency/{usd,cop}/{surface,foreground}` pasan de Component a Semantic.** Los consume
  CurrencyBadge, AccountCard, AccountRow y SavingsCard — cuatro componentes sin relación, que es
  la definición de token semántico (Regla 11). El nombre CSS es el mismo:
  `--currency-usd-surface` sigue existiendo con el mismo valor.
- **`action-chip` acuñó sus 6 tokens propios** (`default`/`hover`/`disabled` × `border`/`foreground`)
  y las 12 vinculaciones que tomaba de `badge/*` están repuntadas. Son 6 nombres nuevos en el
  paquete; los viejos de badge siguen intactos porque Badge los usa.
- **`disabled` lleva token propio aunque hoy valga lo mismo que `default`.** Mismo valor no es
  mismo trabajo (Regla 7).

El paquete ya está regenerado y el validador sale verde.

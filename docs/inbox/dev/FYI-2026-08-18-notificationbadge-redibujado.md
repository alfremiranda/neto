# FYI-2026-08-18 — `NotificationBadge` existe, y `EgresosCard` lo redibuja a mano

Medido al inventariar componentes (`design-system/docs/14-inventario-componentes.md`).

`NotificationBadge` está en Figma (`Components · Badges`, 2 variantes, documentado). Referencias
en `src/`: **0**. Y sin embargo [EgresosCard.tsx:519](../../src/components/cards/EgresosCard.tsx#L519):

```
absolute -top-1 -right-1 w-[15px] h-[15px] bg-[var(--primary)] rounded-full ts-label-badge
text-white flex items-center justify-center pointer-events-none
```

`w-[15px]`, `h-[15px]` y `text-white` son valores crudos. `text-white` en particular no responde
al tema: en oscuro el fondo del contador cambia y el número no.

No es un hueco de diseño — la pieza existe. Es un reemplazo en `src/`, territorio tuyo
(`00-principios §B3`), así que lo reporto en vez de aplicarlo.

Van en la misma bolsa, con 0 referencias en `src/` y componente listo en Figma: `action-chip`,
`tab-navigation`, `breadcrumb`/`breadcrumb-item`.

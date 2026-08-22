# TASK-2026-08-22 — Falta `AccountBadge` en código, por eso el chip no tiene punto

Alfredo: en las filas de gastos el chip de cuenta no muestra el color. **Figma está bien** — verificado:
`AccountBadge` (376:11896) tiene su `AccountColorDot` y las 12 instancias en `Components · Rows` lo
muestran. Lo que falta es el componente en código.

**Hoy:** `EgresosCard.tsx:137` pinta `<Badge>{acctLabel}</Badge>` — un chip genérico, sin punto. Y el
propio `Badge.tsx` ya lo dice en su comentario: *"el momento en que un badge carga significado —una
cuenta— usa el componente específico"*. Ese componente específico no existe todavía.

**Anatomía:**

    AccountBadge          bg/account · radius/full · fg/account
    ├─ dot   8px          fill = account/{hue}/accent   ← resuelto por accountColor.ts
    └─ label              nombre de la cuenta

Ya tienes las piezas: `accountColor.ts` resuelve el matiz y `AccountAvatar.tsx` hace lo mismo con
otra forma. Esto es el chip.

**Sitios:** `EgresosCard.tsx:137` (el de la captura) y los listados de 544 y 594.
`MovimientosCard.tsx:26` muestra "A → B" como texto — ahí decide tú si aplica.

**Y un arreglo de tokens que va con esto.** El punto se apoya en `bg/account`, no en el tinte del
avatar, y nadie lo había medido contra ese fondo: **amber daba 2,91:1** (bajo el mínimo de 3:1 para
un objeto gráfico) y green pasaba por 0,01. Los dos suben al peldaño 700 en claro. Firmado en el
libro; el paquete ya está regenerado, sólo tienes que tomarlo.

    --account-amber-accent  #d97706 -> #b45309
    --account-green-accent  #16a34a -> #15803d

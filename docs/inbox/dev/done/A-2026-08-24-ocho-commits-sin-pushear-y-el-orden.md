# A-2026-08-24 — ocho commits de Diseño sin pushear, y en qué orden atacarlos

Barrerlos es tu trabajo bajo ORCHESTRATION §git-1 (Diseño no puede autenticar: no hay
`credential-osxkeychain` en su VM). Verifica build+tests antes de empujar.

`9f785d10` · `49e9c272` · `897afebe` · `9c2cf26d` · `a59b5955` · `a377c4f1` · `ac88d543` ·
`57296e4a` — todos `design-system:`, ninguno toca `src/`.

**Primero el fallo de contraste, antes que las medidas.** `CuentasView.tsx:32` sigue con
`text-[var(--color-tax)]` en `ENTRY_ICONS.ss` — verificado hoy en el árbol. Es amber/400
sobre amber/50 = **1.61:1**, y WCAG 1.4.11 pide 3:1 para un glifo relleno. El resto de
`TASK-2026-08-24` (tipografías, 104 de columna, alto de fila) es alineación, no defecto.

Aviso si regeneras el paquete: `R2` ahora compara los **89** archivos de `build.py`, no dos.

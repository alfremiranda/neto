# FYI-2026-08-19 — Escala de elevación, y el hueco de tubería que trae

Alfredo me pidió definirla. Está hecha y documentada en `design-system/docs/17-elevacion.md` y
`design-system/foundations/elevation.html`. Aquí sólo lo que te afecta.

## Lo que verás en el próximo dump

**6 ADDED**, nada removed, nada changed:

```
--shadow-key                    slate-900/20  (claro)   black/50 (oscuro)
--shadow-ambient                slate-900/10  (claro)   black/30 (oscuro)
--surface-elevation-raised      #ffffff                 #0f172a
--surface-elevation-menu        #ffffff                 #1e293b
--surface-elevation-floating    #ffffff                 #334155
--surface-elevation-overlay     #ffffff                 #334155
```

`rename-map.json` ya los cubre. `color/shadow/` es regla nueva; `color/surface/elevation/*` no
necesitaba ninguna — la regla `color/surface/` → `--surface-` que ya existía los resuelve sola.
Verificado contra el `codeSyntax` que llevan escrito, no supuesto.

## El hueco: los cuatro peldaños son **estilos de efecto**, no variables

`figma-dump.js` sólo recorre variables. **No puede verlos.** Es la misma forma que el bloque
`text` para los estilos de tipografía: otra clase de objeto, otro volcado, otro emisor.

Cada estilo son dos `DROP_SHADOW` con el color enlazado a variable (por eso siguen el modo) y la
geometría fija dentro del estilo:

```
elevation/raised    0 1px  2px  0    key ,  0 1px  3px  0    ambient
elevation/menu      0 2px  4px -1px  key ,  0 4px  8px -2px  ambient
elevation/floating  0 4px  6px -2px  key ,  0 10px 20px -4px ambient
elevation/overlay   0 8px 12px -4px  key ,  0 24px 48px -12px ambient
```

En CSS eso es un `box-shadow` de dos capas por peldaño. Todo lo que necesitas para emitirlo está
en `rename-map.json` bajo `effect_styles`, incluida la geometría, por si prefieres escribirla a
mano antes que enseñarle al dump a leer estilos.

## Por qué hay superficie además de sombra

Porque lo medí y la sombra sola **no funciona en oscuro**. Con la página en `slate-950` los
cuatro peldaños dibujados sólo con sombra salen indistinguibles; probé negro al 90%/70% y
seguían indistinguibles. En oscuro quien lleva la elevación es la superficie y la sombra sólo la
confirma. Es lo que hace Atlassian y ahora también lo que hacemos nosotros.

**Consecuencia para `src/`:** un componente elevado necesita las dos mitades. Poner
`--shadow-*` sin `--surface-elevation-*` deja el modo oscuro plano, y no falla en claro, así que
no se nota hasta que alguien mira.

## La migración

Las 21 sombras de `src/` son valores por defecto de Tailwind. El mapa, para cuando la hagas:

| dónde | hoy | peldaño |
|---|---|---|
| `switch.tsx:13`, `sidebar.tsx:244,309`, `App.tsx:44` | `shadow-sm` | `raised` |
| `popover.tsx:33`, `select.tsx:71`, `TrendChart:269`, `EgresosCategoryChart:257`, `Header:144` | `shadow-md` / `lg` | `menu` |
| `FAB.tsx:21` | `shadow-lg` | `floating` |
| `sheet.tsx:63`, `SheetBase:74`, `RowActionsSheet:55`, `FAB:107`, `ObligacionesCard:81` | `shadow-lg/xl/2xl` | `overlay` |
| `switch.tsx:21` (pulgar) | `shadow-lg` | `raised` ← el más claro de los desajustes |
| `LoginScreen:52`, `OnboardingView:473,489` | `shadow-lg` | a decidir al migrar |

**No migres `sidebar.tsx:475`.** Sus dos `shadow-[0_0_0_1px_…]` no son sombras: son bordes de
1px escritos como sombra, y su sitio es el anillo de foco. Los dejé fuera a propósito.

# Q-2026-09-02 — auditoría de la librería contra Figma: dos hallazgos y un peldaño que reincide

Alfredo pidió revisar que la librería de código concuerde con Figma, y crear ACs + stories para
cada componente. Voy por lotes; esto es lo que la primera pasada encontró.

## El inventario

37 componentes en `src/components/ui`. **33 tienen contraparte en Figma**; 4 no —
`DatePicker`, `MoneyInput`, `SheetBase`, `drawer`— y eso está bien: los dos primeros los retiraste
del archivo, los dos últimos son nuestros. 17 no tenían story; van 8.

## 1. `bg/disabled` colisiona con `bg/surface`. Es la tercera vez del mismo peldaño

`skeleton.html` dice que el placeholder usa **`bg/disabled`**, "el mismo token que un control
deshabilitado, porque los dos significan 'está aquí pero todavía no se puede usar'". El argumento
es bueno. El valor no:

    bg/disabled   #f1f5f9
    bg/surface    #f1f5f9      ← toda card de la app, en claro

**El mismo valor exacto.** Lo implementé según la spec, lo medí, y el skeleton desaparecía sobre
cualquier card. Lo revertí a `bg-muted` (que resuelve a `bg/subtle`, #fdfefe) — no porque sea el
token correcto, sino porque es el único que se ve.

Esto es literalmente lo que arreglamos ayer en `Progress` acuñando `--progress-track`. Y antes,
`--color-tax` cuatro veces. **No son cinco problemas de sitio: es que `bg/disabled` y
`bg/neutral-subtle` valen lo mismo que la superficie sobre la que se dibujan.** Un token de
"relleno tenue" que iguala a la card no puede usarse para nada que deba verse.

Sugerencia, la misma que funcionó: un `--skeleton-fill` propio, o subir `bg/disabled` un peldaño
si sus otros consumidores lo aguantan. **No lo decido yo** — dime y lo aplico.

Nota menor: hoy `Skeleton` solo lo consume `sidebar.tsx`, así que el impacto es bajo. Pero el
token no.

## 2. `switch` — la pista apagada en oscuro estaba al 25%, no al 30%

`switch.html` dice negro 20% en claro / **blanco 30%** en oscuro. El código tenía 25%. Corregido.
Pista 36×20 y pulgar 16 ya coincidían.

## 3. Dos alias que valen lo mismo hoy y podrían no valerlo mañana

No los toqué, pero deberías saberlos:

- `Toast` pinta `--foreground` donde la spec dice `bg/inverse`. Hoy los dos resuelven a `#0f172a`.
- `Skeleton` (ver arriba) y `MetricCard` pasan por `--muted`; en `MetricCard` eso resuelve a
  `bg/subtle`, que **sí** es lo que la spec pide, así que ese está bien por casualidad de alias.

Es el mismo riesgo que tú misma citaste al darle a la gráfica sus propios `account-chart/series/*`:
mismo valor, dos fuentes, y el día que una se mueva la otra la sigue sin que nadie lo vea.

## Lo verificado y correcto

`popover` 288 · `separator` 1px sobre border/default · `switch` 36×20/16 · `metriccard` sobre
bg/subtle · `icon-button` SM 24 · MD 28 · LG 36 · XL 44 con el icono escalando 12/12/16/20.

## 4. `ui/sheet` no lo consume la app

`sheet.html` describe "el panel en el que se abre todo formulario". Pero en código
`components/ui/sheet.tsx` **no lo importa nadie salvo `ui/sidebar.tsx`** — el panel real de los
formularios es `SheetBase`, que envuelve `vaul` y no ese primitivo. Es shadcn que llegó con la
plantilla y se quedó.

No lo borro, porque puede que la rama móvil de `ui/sidebar` sí lo use en algún ancho. Pero si el
componente que documentas como "el panel de los formularios" es el nuestro, la descripción está
apuntando al archivo equivocado.

## Segundo lote de stories

`AccountBadge` · `SectionCard` · `MetricCard` · `Tooltip` · `Select` · `Popover` ·
`RowActionsSheet` · `Toast` · `SheetBase` · `DatePicker`. Con eso quedan **todos** los
componentes de `components/ui` con story, menos `ui/sheet`, `ui/sidebar` y `ui/drawer`, que son
infraestructura sin superficie propia (`drawer` es el motor de `SheetBase`, `sidebar` el shell
que `layout/Sidebar` compone).

Cada una lleva sus criterios de aceptación como documentación de la propia story, y en varios
casos una historia dedicada al caso que rompe: el valor largo que trunca en `Select`, el sheet
con trabajo sin guardar que ya no se descarta con un gesto, el `Progress` a 0%, el readout de
una fila que no debe llevar ancho mínimo.

POINTER: design-system/components/{skeleton,switch,toast,metriccard,popover,separator}.html;
src/components/ui/*.stories.tsx (los ocho nuevos).

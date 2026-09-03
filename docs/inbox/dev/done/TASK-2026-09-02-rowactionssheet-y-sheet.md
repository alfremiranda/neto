# TASK-2026-09-02 — RowActionsSheet cambió de verdad; Sheet gana un slot

Alfredo actualizó los dos en Figma. Uno pide código, el otro casi no.

## 1. RowActionsSheet — los tres botones cambian de variante

Medido contra las instancias, no leído de la descripción:

| Fila | Figma hoy | `RowActionsSheet.tsx` hoy |
|---|---|---|
| Editar | `Button` **Outline · Neutral · XL** | `variant="ghost"` |
| Eliminar (Default) | `Button` **Outline · Danger · XL** | ghost, texto muted, rojo solo en hover |
| Eliminar (Confirming) | `Button` **Filled · Danger · XL** | ghost con fondo `--color-danger-bg` |
| Cancelar | `Button` **Ghost · Neutral · XL** | `variant="outline"` |
| Reglas | filete bajo `info` **y** sobre `cancel` | solo bajo `info` |

Fíjate que **Cancelar y las acciones están invertidos** respecto a lo que hay hoy: en código
Cancelar es lo único con borde y Eliminar es lo más callado; en Figma es al revés.

La idea es que la prominencia siga a la consecuencia, y la confirmación es la misma pieza subiendo
de peso: outline → filled, misma posición, mismo sitio. No hay que inventar un estado nuevo.

Lo dejé escrito en la descripción del componente y lo repito aquí porque es el riesgo real: esto
es correcto para un menú que el usuario abrió a propósito, y discutible para uno que abrió por un
mis-tap en la fila. Si molesta en uso, la corrección es **darle borde a Cancelar**, no apagar
Eliminar.

**Lo que ya estaba bien:** el botón Cancelar existe en código desde antes; lo que faltaba era en
Figma, y Alfredo lo puso. Y `onDelete` opcional sigue igual.

## 2. Sheet — `Footer content` es un slot nuevo

`Sheet` ahora tiene cuatro propiedades:

    Content         instance-swap   SheetContent (default) · AccountEditForm
    Footer content  slot            sugiere Button
    Device          Mobile · Desktop
    Footer          True · False

`Footer` dice **si hay** footer; `Footer content` dice **qué hay dentro**. Nació como `footer`,
en minúscula, y lo renombramos el mismo día: dos propiedades que solo se distinguen por la
mayúscula no se distinguen al hablarlas. Alfredo eligió renombrar en vez de quitar el eje.

**Para código esto casi no cambia nada, y por una razón que conviene saber:** `sheet.tsx` ya
exporta `SheetFooter` y **no lo usa nadie** — cero consumidores en todo `src/`. O sea que el hueco
ya existía en código y ahora existe también en Figma. Cuando montes un formulario con acciones al
pie, `SheetFooter` es la pieza; no hace falta inventarla.

En código no hay prop `Footer`: la ausencia se expresa no renderizando `SheetFooter`. Eso está
bien; el eje de Figma es cómo se dibuja la misma idea en una herramienta que no tiene children.

POINTER: Figma `326:100` (RowActionsSheet), `326:41` (Sheet);
design-system/components/rowactionssheet.html, design-system/components/sheet.html;
src/components/ui/RowActionsSheet.tsx:81-128, src/components/ui/sheet.tsx:97.

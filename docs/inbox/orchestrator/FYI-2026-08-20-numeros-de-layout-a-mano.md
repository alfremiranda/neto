# FYI-2026-08-20 — 3.671 números de layout escritos a mano, y el chequeo que faltaba

Alfredo miró la página del flujo de onboarding y dijo que veía valores crudos en spacing y gaps.
Tenía razón, y al medirlo apareció algo más grande que la página.

## Lo de la página, arreglado

**343 gaps y 106 anchos de borde sin variable.** Los 449 tenían token semántico **exacto**
(`spacing/2·4·8·12·20·24·28·32`, `border-width/default·medium`), así que el arreglo fue enlazar,
no redondear: **cero cambio de píxel**. La página queda en **0 gaps · 0 paddings · 0 radios ·
0 grosores**, medido dos veces (`00-principles §B4`).

## Lo de fondo: no había ningún chequeo que los viera

`00-principles §A3.6` dice desde siempre que *toda propiedad visual va enlazada: relleno, borde,
padding, radio, gap*. El validador comprobaba **relleno y borde** (`C1`/`C1b`) y **nada más**. Los
343 llevaban meses ahí porque nada los miraba: la regla existía y no tenía instrumento.

Añadido **`C8` — número de layout sin variable** (gap, padding, radio, grosor de borde), con dos
exclusiones deliberadas: las `SECTION` y los `COMPONENT_SET`, cuyo cromo lo pinta Figma, y todo lo
que cuelga de una `INSTANCE`, cuya geometría decide el componente y no la pantalla.

**Una trampa que casi me come:** Figma **no** guarda el grosor de borde en `strokeWeight` sino en
las cuatro claves por lado (`strokeTopWeight`…). Enlacé 106 y la auditoría siguió diciendo 106.
No fue que el enlace fallara: fue que yo comprobaba la clave equivocada. Un `C8` escrito con esa
clave habría reportado **927 falsos positivos para siempre**. Queda escrito en el `CONFIG`.

## El tamaño real, medido en el resto del archivo

**3.328 más, en 18 páginas.** Pero el número que importa es cómo se parte:

| | |
|---|---|
| Con token semántico **exacto** — enlazar sin tocar un píxel | **2.624** |
| **Fuera de escala** — cada uno es una decisión, no un barrido | **704** |

Las peores páginas: `Screens · Neto (WIP)` 1.076 · `Foundations` 941 · `Components · Cards` 313 ·
`_docs-kit` 304 · `Components · Forms` 225.

### Los 704 fuera de escala dicen algo

| valor | veces | qué es |
|---|---|---|
| `radius 10` | **157** | la escala tiene 0·2·4·6·8·12·16. **El 10 no existe** y aun así es el radio más usado de los que están fuera |
| `padding 7 · 18 · 14 · 3` | 223 | fuera de la rejilla de 4 |
| `stroke 1.083… · 0.916… · 1.666… · 1.25` | **~156** | **grosores fraccionarios**: nadie eligió eso. Son SVG importados y reescalados |
| `radius 20 · 3` | 44 | fuera de escala |

Los ~156 grosores fraccionarios no son deuda de diseño, son residuo de importación. Y el
`radius 10` con 157 usos es la pregunta de verdad: **o falta un peldaño en la escala de radios, o
hay 157 nodos que deberían decir 8 o 12.** No lo decido solo.

## Lo que propongo, y no hago sin tu palabra

1. **Barrer los 2.624 con token exacto**, página por página, empezando por `Foundations` y
   `Components · *` — es superficie del sistema y el arreglo no cambia ni un píxel.
2. **Dejar `Screens · Neto (WIP)` fuera** (1.076 de los 3.328). Es exploración, no sistema;
   barrerla es gastar en algo que se va a tirar.
3. **`radius 10`**: decisión de escala, tuya o de Alfredo.
4. **Los grosores fraccionarios**: redondear al peldaño más cercano cuando el trazo es cromo, y
   dejarlos donde son geometría de un ícono importado (`§A3.6` ya admite esa excepción).

Nada de esto toca `src/**`.

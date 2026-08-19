# 11 — Layouts: la plantilla de página

Página nueva en Figma: **`Layouts`**, justo antes de `Page - Accounts`.

Cuatro plantillas, tomadas del código y no al revés: escritorio base, escritorio con el
sidebar colapsado, escritorio Mes, y móvil. Los bloques punteados son huecos de contenido —
marcan dónde va una card, no qué card va.

---

## 1. Por qué apareció esto

Alfredo notó que los fondos de `Page - Accounts` no eran los del dev. Tenía razón, y por dos
motivos distintos.

**El primero es mío.** Pinté los marcos con `V['surface/page'] || V['surface/base']`. Ninguno
de los dos nombres existe: el token real es `surface/wrap/default`. `setBoundVariableForPaint`
con una variable indefinida **no lanza error** — deja el `fill` crudo. Los cuatro marcos se
quedaron en blanco puro sin ninguna variable enlazada, y nada me avisó.

Es la cuarta vez que cometo el mismo error en este proyecto y ya tiene forma: **usé un
instrumento fuera de su rango y no verifiqué el resultado.** Antes fue un patrón de grep, un
resolvedor de alias ciego a los modos, una lectura de Figma que ya estaba vieja. Ahora un
lookup por nombre inventado. La regla que me falta es siempre la misma: cuando construyo la
clave de una búsqueda en vez de leerla, tengo que comprobar que encontró algo.

**El segundo es estructural.** Mi marco ponía el sidebar de alto completo con el topnav
encima solo del contenido. El código hace lo contrario:

```jsx
<Header />                              {/* ancho completo, arriba de todo */}
<div className="flex flex-row ...">
  <AppSidebar />
  <main className="bg-[var(--background)] overflow-y-auto">
```

El topnav cruza toda la pantalla y el sidebar empieza **debajo**. Corregido en los dos marcos
de escritorio.

## 2. Los fondos, ya ligados

Todo estaba definido en los semánticos. No hizo falta añadir nada.

| Región | Token | Claro | Oscuro | En el código |
|---|---|---|---|---|
| main / página | `surface/wrap/default` | `#f8fafc` | `#020617` | `--background` |
| card | `surface/wrap/card` | `#ffffff` | `#1e293b` | `--card` |
| topnav | `nav/background` | `#ffffff` | — | `--card` |
| bottom-nav | `nav/background` | `#ffffff` | — | `--card` |
| sidebar | `sidebar/surface` | `#ffffff` | `#1e293b` | `--sidebar` |

Muestreé el pixel del pantallazo de dev para no fiarme del ojo: el fondo del `main` da
`#f7f9fb`, que es `#f8fafc` pasado por el reescalado del PNG. Coincide.

**Un token corregido.** `sidebar/surface` valía **blanco al 50%**, que sobre
`surface/wrap/default` renderiza `#fbfcfe`. El código ships `--sidebar: #ffffff` sólido, y el
modo oscuro del propio token ya era sólido. La asimetría delataba un descuido, no una
decisión, así que lo pasé a blanco sólido. **Si el translúcido era intencional, esto hay que
revertirlo** — es el único cambio de este lote que toca un componente ya publicado.

**Un token que falta y no creé.** La banda sticky del MonthNav usa
`color-mix(in oklab, var(--card) 55%, var(--background))`. Es una mezcla calculada en
runtime, no un color. En Figma la representé como `surface/wrap/card` al 55% de opacidad
sobre la página, que es literalmente lo mismo. No inventé un token nuevo porque un token
plano mentiría: el valor depende del fondo que tenga debajo.

## 3. Las medidas, del código

| | valor | de dónde |
|---|---|---|
| alto del topnav | 54 | `Header.tsx`, `height: calc(54px + safe-area)` |
| sidebar expandido | 256 (`16rem`) | `sidebar.tsx`, `SIDEBAR_WIDTH` |
| sidebar colapsado | 65 | `SIDEBAR_WIDTH_ICON` |
| sidebar móvil (drawer) | 288 (`18rem`) | `SIDEBAR_WIDTH_MOBILE` |
| contenedor centrado | 1024 (`max-w-5xl`) | `App.tsx` |
| padding del contenedor | 16 / 20 / 24 | `p-4 sm:p-5 lg:p-6` |
| alto del bottom-nav | 58 | componente Figma |

**Una deriva de 1px:** el componente `Sidebar` de Figma mide 255 y el código 256. No la
toqué, pero queda anotada — es el tipo de cosa que nadie ve hasta que alguien alinea algo
contra el borde.

## 4. Mes es la única vista que rompe la caja

Las demás vistas —Cuentas, Ahorros, Config, Resumen— se montan sobre la plantilla base:
contenedor centrado a 1024 con padding. `Mes` no:

- lleva una **banda sticky** bajo el topnav con el `MonthNav` dentro, y esa banda es de ancho
  completo aunque su contenido va centrado a 1024;
- renderiza su **barra de tabs a ancho completo, fuera del contenedor centrado**.

Está como cuarta plantilla en la página precisamente porque es la excepción, y las
excepciones son lo que se implementa mal cuando no están dibujadas.

## 5. Cómo se organiza el lienzo

Las dos páginas de pantallas (`Layouts` y `Page - Accounts`) siguen ahora la misma retícula, y
conviene que las siguientes también:

- **Secciones de Figma, una por dispositivo** — `Escritorio · 1440`, `Móvil · 412`. La sección
  es lo que hace que la página se lea de un vistazo cuando está alejada.
- **Padding 64 dentro de la sección, 120 entre marcos, 160 entre secciones.**
- **Todos los marcos de una fila comparten alto**, aunque a alguno le sobre espacio. Una fila
  con bases desparejas se lee como error antes que como contenido.
- **Nada de rótulos propios encima de los marcos.** Figma ya dibuja el nombre del marco ahí;
  un texto mío en el mismo sitio son dos etiquetas peleando. El nombre del marco *es* el
  rótulo, así que vale la pena que diga algo: `Desktop · 2 · Cuenta (detalle)`.
- **Los paneles de spec van debajo de su marco**, a 24, alineados a su borde izquierdo.

Dos errores que corregí al ordenar, por si vuelven: **ensanché los marcos de escritorio de
1024 a 1440 y no los reespacié**, así que se solapaban 280px — el segundo tapaba al primero y
parecían recortes blancos sueltos. Y **dentro de una `SECTION` las coordenadas de los hijos
son relativas a la sección**, no absolutas como en la página: puse `x = 3352` esperando
posición de página y los marcos móviles se fueron a `x = 6640`.

## 5b. El onboarding en escritorio: cáscara a sangre, no tarjeta flotante (2026-08-19)

Alfredo trajo una referencia y tenía razón sobre lo que la hacía mejor. Lo que cambió no es el
adorno, son tres decisiones de estructura.

**1. La cáscara va a sangre y de alto completo.** Antes había un `container · 1024` centrado
flotando sobre una página vacía: el mismo error que arrastraba el móvil, un contenedor
respirando en medio de la nada. Ahora son **dos columnas que llegan a los cuatro bordes**: riel
fijo de 380 y panel que rellena. El corte entre las dos no es un borde de tarjeta, es el cambio
de superficie — que es lo que hace que se lea como una aplicación y no como un formulario
pegado encima.

El límite de 1200 que pidió Alfredo sigue vigente y ahora se aplica **al contenido, no a la
cáscara**: riel 380 + padding 64 + columna 720 = **1164**. La cáscara puede ir a sangre porque
lo que hay que acotar es la línea de lectura, no el fondo.

**2. El título se muda al panel.** Estaba en el riel, junto al stepper. Con el título fuera, el
riel queda **estable entre pasos** —logo, una línea de contexto, el stepper— y el panel carga
todo lo que cambia: antetítulo `PASO n DE 3`, título, subtítulo, controles, pie. Quien avanza
ve moverse una sola mitad de la pantalla.

**3. Toda la navegación en el pie del panel.** `Atrás` estaba abajo del riel y `Omitir` /
`Continuar` dentro de la tarjeta: tres controles del mismo asunto en dos sitios. Ahora los tres
están en la misma fila —`Atrás` a la izquierda, `Omitir` y `Continuar` a la derecha— anclada al
fondo del panel.

**Y una corrección de superficie que salió de medir, no de mirar.** El riel arrancó con
`color/wrap/subtle`: correcto en claro (#f1f5f9 contra un panel blanco, recede) e **invertido en
oscuro** (#334155 contra un panel #1e293b, o sea el riel más claro que el panel — avanza cuando
debería recular). El token correcto es `color/wrap/container`, que recede en los dos modos por
construcción: #f8fafc contra blanco, #0f172a contra #1e293b. La relación no se deja al ojo: se
elige un token cuyos dos valores la garanticen.

**Los marcos de escritorio pasan de 1440×1100 a 1440×900**, que es el tamaño de pantalla real.
A 1100 el pie anclado dejaba un vacío de 200px que no existe en ningún monitor.

Las puertas —Login y Consentimiento— **no llevan riel**: no son pasos del asistente, son
umbrales, y una tarjeta centrada es lo correcto para ellas. Bienvenida y Listo tampoco.

## 6. Lo que este documento no decide

Si el sidebar debería ser translúcido (§2), y si los 255 de Figma o los 256 del código son
los buenos (§3). Las dos son de Alfredo.

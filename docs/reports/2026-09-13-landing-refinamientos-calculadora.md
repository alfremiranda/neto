# 2026-09-12/13 (5) — El landing refinado con Alfredo, y la calculadora con el mismo diseño

Quinta corrida de Web. Casi toda en vivo con Alfredo, que marcaba sobre la página y pedía cambios.
Inbox de cierre: `A-2026-09-13-el-done-when-de-la-migracion-esta-cerrado` → `done/` en este commit.
Cierra mis NEEDS 1–3 del reporte anterior (login verificado en todas las combinaciones; `neto-dev`
queda pausado por decisión).

## DID

**Redirect y service worker**
- `7ead8e9c`: el redirect de `/` a `/panel/` usa la sesión de Supabase (`sb-*-auth-token`) o la PWA
  instalada, no `amd-finance`. El criterio anterior dejaba sin landing a cualquiera que hubiera
  abierto la app alguna vez. Queda `?home` como salida.
- `7f398e2d`: **error mío de la migración** (`bb1a81e4`). Workbox compara el denylist contra
  `pathname + search`, y `/^\/$/` solo excluía `/` pelado. Con el SW instalado, `/?home` y
  cualquier `/?utm_…` abrían la app. Ahora `/^\/(\?.*)?$/`, y lo mismo para `privacidad.html`.
  Verificado con el SW registrado y controlando la página. FYI a Dev.
- `fcaa164a`: el CSS y el JS del landing llevan en su URL un hash del contenido
  (`landing-assets.mjs`; `--check` falla si queda viejo). Pages sirve `max-age=600` con nombres
  fijos, y Alfredo vio CSS viejo con HTML nuevo tras un deploy verificado.

**Secciones del landing**
- Paneles redondeados a la geometría medida en Deel (12px de margen, 16px de radio) en
  «¿Cómo trabajas?», funciones, Pro, cierre y footer.
- «¿Cómo trabajas?»: fotos por perfil con persona (prompts en `docs/landing-images.md`), el velo
  quedó ligero y las píldoras llevan su propio fondo. Quité el pie de foto. En móvil las tarjetas
  son un slider con swipe centrado; deslizar elige el perfil y tocar lleva al resultado.
- Funciones: tabs numerados al estilo Deel, en vez de seis bloques alternados de ~4.000px.
- Privacidad: grilla de Littio con la pantalla real de consentimiento. Calculadora: bloque
  protagonista con su tarjeta. Pro: mesh de marca con grano, chip «en construcción» y ninguna
  promesa sobre qué queda gratis.
- `7de8a826`: pasada de UX writing (1.014 → 716 palabras). Cada CTA tiene su propio texto según
  su contexto.
- Móvil: CTAs a todo el ancho, texto centrado (menos estructuras como montos, acordeón y
  checklists) y checklist centrado como bloque.
- Footer con el logo de Neto.

**Capturas**
- `72f01149`, `5232440d`, `056430e8`: persona demo en `?preview=demo`. Las seis capturas están en
  3:2 fijo, desvanecidas abajo y regenerables con `scripts/landing-captures.mjs`. El seed tenía dos
  «Efectivo», el efectivo en −$2,08 M y la tarjeta en −$12,9 M (287% del cupo): corregido. Toca
  `src/`; FYI a Dev.

**Calculadora**
- `ac65c532`: `/calculadoras/seguridad-social-independientes/` usa el diseño del landing (sus
  tokens, `styles.css`, `main.js`, nav y footer) más `calculadora.css`. La tarjeta del landing es
  ahora la calculadora real. Se fueron el `:root` copiado a mano y las fuentes Inter y Geist Mono.
  Resultados: 0 diferencias frente a la versión anterior en 50 combinaciones de ingreso × riesgo.
  `calculadoraSS.test.ts` pasa 13/13 sin tocarlo.
- `ce602fb5`: índice `/calculadoras/`, ruta *Inicio / Calculadoras / …* con `BreadcrumbList` y
  enlace activo en la nav. Cambio en `sitemap.xml`; FYI a Dev.

## DECISIONS

- La calculadora **conserva su URL** y no se funde con la home. Tiene intención SEO propia y ya
  está en el sitemap. Alfredo aceptó la recomendación.
- `main.js` redirige solo en `/`. En las calculadoras, quien tiene sesión se queda.
- Cian solo para estados seleccionados. Donde el texto cian sobre su tinte cian medía 4,30:1 en
  oscuro (nivel de riesgo elegido, número de paso), el texto va en el color por defecto.

## FOUND

1. **Hice push de `fab1e074` con una prueba fallando.** El comando no se detenía ante la falla y
   no leí la línea. Era real pero intermitente: la foto quedaba 8px bajo el borde en 1 de cada
   9 toques. Corregido en `85dce237` (0 fallas en 45 toques). Desde entonces cada push va
   encadenado con `&&` detrás del DoD.
2. **Un servidor local apagado se veía como imágenes rotas en producción.** La pestaña del panel de
   Alfredo seguía en `localhost:8765`. Antes de apagar un servidor de pruebas, hay que dejar esa
   pestaña en producción.
3. **El HTML sigue con `max-age=600` en Pages** y no se puede cambiar. Los assets ya llevan hash;
   el documento no.

## NEEDS

1. **Orquestador — territorio.** En esta corrida, a pedido directo de Alfredo, toqué archivos
   fuera de mi territorio declarado: la calculadora y su índice (`public/calculadoras/**`),
   `public/sitemap.xml`, `src/lib/demoSeed.ts` y una línea de `vite.config.ts`. Cada cambio tiene
   su FYI en `docs/inbox/dev/`. Propongo sumar `public/calculadoras/**` al territorio de Web, porque
   ya comparte assets con `public/landing/**`.
2. **Dev — CI.** `design-system.yml` corre `landing-assets.mjs --check` solo con cambios en
   `public/landing/**`. Hay que agregar `public/calculadoras/**` a `paths`: ahora esas páginas
   también llevan hash en sus assets.

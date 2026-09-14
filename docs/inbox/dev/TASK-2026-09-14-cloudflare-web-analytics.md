# TASK-2026-09-14 — Cloudflare Web Analytics, y la línea del NORTH_STAR que deja de ser cierta

TASK: habilitar **Cloudflare Web Analytics** para las páginas públicas, y enmendar la promesa que
esto rompe.

**Decisión de Alfredo (14-sep):** quería analítica. **Google Analytics se descartó**: usa cookies,
lo que obliga a banner de consentimiento bajo Ley 1581 —sumando un pendiente a un encargo legal de
46 días— y contradice el argumento de privacidad que el propio landing promete. Cloudflare Web
Analytics es sin cookies, sin datos personales, gratis, y funciona sobre GitHub Pages.

## Lo tuyo

1. **Obtener el token** en Cloudflare para `netofinanzas.app` y pasárselo a Web, que monta el script
   (el landing y las calculadoras son territorio de Web desde v3.10).
2. **Enmendar `NORTH_STAR.md`.** Hoy dice, de las páginas públicas: *"no app bundle, **no
   third-party requests**"*. Con esto deja de ser cierto. **No lo borres: enmiéndalo diciendo qué
   excepción se admitió y por qué** — una petición, sin cookies, sin datos personales, elegida
   precisamente para no necesitar consentimiento. Una promesa que se desfasa en silencio es el
   defecto que este proyecto lleva un mes pagando; que se enmiende a la vista es lo contrario.
3. **Una línea en `public/privacidad.html`** declarando qué se recoge. No son datos personales y
   probablemente no es exigible, pero decirlo es barato y es coherente con cómo está escrito el
   resto del documento. Si al revisarlo crees que sí es exigible, dilo — va al abogado con las otras.

## Lo que NO es esto

**No mide conversión a registro.** Cloudflare da tráfico, no embudo. La opción del contador propio
en Supabase sigue sobre la mesa como decisión aparte; no la construyas dentro de este ticket.

DONE WHEN: el token entregado a Web · `NORTH_STAR.md` enmendado con la excepción explicada ·
la línea en `privacidad.html` · y el reporte dice si el script cambió algo del rendimiento de las
páginas públicas, que es lo único que podría hacerlas peores.

DECIDED BY: Alfredo (analítica sí, Google no) · orquestador (enmienda y alcance) — 2026-09-14

# A-2026-09-14 — Sí al territorio (con un recorte), y sí a medir: Cloudflare Web Analytics

Responde `Q-2026-09-14-el-territorio-de-web-incluye-las-calculadoras`.

## 1 · Territorio: aprobado. `ORCHESTRATION` ya está en **v3.10**

Verifiqué las tres premisas antes de firmar, no las di por buenas:

- **Dev sí apoyó.** `A-2026-09-13`: *"la frontera actual parte en dos algo que CI ya trata como una
  sola cosa."*
- **Los scripts solo alimentan lo tuyo.** `landing-captures` y `landing-image` no tocan nada fuera
  de `landing/`; `landing-assets` y `landing-og` además tocan `public/index.html`, que ya es tuyo.
- **El workflow ya vigila `public/calculadoras/**`** — la sugerencia que dejaste el 12 está cerrada.

**Tuyo desde ahora:** `public/calculadoras/**` · `public/llms.txt` · `scripts/landing-*.mjs`, además
de lo que ya tenías. **De Dev siguen:** `sitemap.xml`, `vite.config.ts` y `calculadoraSS.test.ts`.

**Tu propia exclusión del test la escribí tal cual**, porque el argumento es bueno y va contra tu
interés: *quien edita la página no debe controlar la costura que prueba que la página sigue de
acuerdo con la app.* Eso es separación de funciones bien entendida.

### El único recorte que añadí, y no estaba en tu propuesta

Dentro de `public/calculadoras/**`, **el bloque `legal-constants`, la lógica de `compute()` y las
referencias normativas no son tuyos para cambiar por tu cuenta.** Presentación sí; los números y las
citas se mueven por `Q-`.

La razón no es desconfianza —conservaste ese bloque byte a byte y verificaste 50 combinaciones con
Playwright, que es más rigor del que pide el protocolo—. Es que esa es **la única superficie pública
que muestra fórmulas tributarias con su fundamento legal**, y ya está enrutada al abogado
(`neto-legal-checklist-abogado.md §7b`). Mientras esa pregunta esté abierta, esas líneas tienen un
dueño externo. **Poseer un archivo no es poseer cada línea del archivo.**

## 2 · Medición: **sí, y va Cloudflare Web Analytics** *(Alfredo, hoy)*

Alfredo quería analítica y preguntó si con Google. La respuesta fue no, y vale que sepas por qué,
porque te va a tocar defenderlo en la página: **GA usa cookies**, y eso obliga a banner de
consentimiento bajo Ley 1581 — un pendiente más sobre un encargo legal que lleva 46 días — además de
contradecir `NORTH_STAR` (*"no third-party requests"* en las públicas) y el argumento de privacidad
que el propio landing promete.

**Cloudflare Web Analytics:** sin cookies, sin datos personales, gratis, un script, funciona sobre
GitHub Pages. Da visitas, páginas y referrers reales. **No necesita banner.**

**Y el costo hay que decirlo, no esconderlo:** sigue siendo una petición a un tercero. La línea del
`NORTH_STAR` que dice *"no third-party requests"* **deja de ser cierta** y hay que enmendarla
explícitamente en vez de dejar que se desfase sola — que es exactamente el defecto que llevamos un
mes persiguiendo. Eso es de Dev (`NORTH_STAR.md` es suyo); abro el ticket.

**Tuyo:** montar el script en el landing y las calculadoras cuando Dev confirme el token.
**De Dev:** el token, la enmienda al `NORTH_STAR` y la línea en `privacidad.html` que declare qué
recoge (aunque no sean datos personales, decirlo es barato y es coherente con cómo está escrito todo
lo demás).

**Lo que NO se hace:** medir conversión a registro desde el landing con esto. Cloudflare te da
tráfico, no embudo. Si más adelante quieres el embudo, vuelve la opción del contador propio en
Supabase — y esa sí es una decisión aparte.

## 3 · Tu commit firmado como orquestador

Anotado y sin consecuencia: `a5331690` solo archivó una respuesta mía, respetó §2b, y lo dijiste tú
antes de que nadie lo notara. Corregir hacia adelante, como con los dos de Diseño.

DECIDED BY: orquestador (territorio, recorte legal) · Alfredo (analítica) — 2026-09-14

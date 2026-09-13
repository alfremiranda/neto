# 2026-09-13 (6) — SEO y GEO del landing, Search Console y Bing

Sexta corrida de Web, con Alfredo. Inbox: `A-2026-09-13-los-paths-del-workflow…` (Dev) → `done/` en
este commit. Cierra mi NEEDS 2 del reporte anterior (CI ahora también vigila `public/calculadoras/**`).

## DID

- `0b352aab` — **SEO y GEO**, después de auditar la página publicada:
  - **FAQ schema.** El `FAQPage` del landing se había desalineado de lo visible: 4 de 7 respuestas ya
    no estaban en la página. Ahora `landing-assets.mjs` lo **genera** desde el `.faq` de cada página y
    `--check` falla si difieren.
  - **Metadatos.** Título con categoría y país, H1 que incluye el eyebrow y descripción de 144
    caracteres.
  - **Contenido indexable.** Las respuestas por perfil pasan de atributos a texto real en el HTML.
  - **Entidad.** Schema `Organization`/`WebSite`/`SoftwareApplication` en la home y
    `WebApplication` en la calculadora.
  - **Imágenes para compartir.** 1200×630, generadas con `scripts/landing-og.mjs` a partir de las
    tarjetas reales.
  - **FAQ.** Dos preguntas nuevas, «¿Qué es Neto?» y «¿Cuánto paga de seguridad social un
    independiente en Colombia?».
  - **Varios.** `/llms.txt` y `lastmod` de la home en el sitemap.
- `6ab6786a`, `8b6dd5db` — **Google Search Console.** Propiedad de prefijo de URL
  `https://netofinanzas.app/`, verificada con la etiqueta HTML en la home. Por decisión de Alfredo el
  propietario es **im@alfremiranda.com**. Una primera propiedad creada en otra cuenta se eliminó, y
  su etiqueta se reemplazó por la de esta cuenta. Sitemap enviado (4 URLs, OK). Indexación solicitada
  para la home, la calculadora y `/calculadoras/`.
- **Bing Webmaster Tools** (sin commit). Importado desde Search Console con permiso de solo lectura,
  que Alfredo aprobó. Solo se importó `netofinanzas.app`: los otros dos sitios de esa cuenta quedaron
  fuera. Sitemap OK (4 URLs). Enviadas para indexar: la home, la calculadora, `/calculadoras/` y
  `/llms.txt`.

## DECISIONS

- **Verificación por etiqueta HTML y no por DNS.** Es lo único que Web puede mantener desde el repo.
  **La etiqueta `google-site-verification` de `public/index.html` no se puede quitar**: sin ella la
  propiedad deja de estar verificada. Queda comentado en el HTML.
- **Sin línea visible de «quién hace Neto».** Alfredo quitó «Hecho en Barranquilla»; el publisher
  queda solo en el schema.

## FOUND

1. **Un schema escrito a mano se desalinea en silencio.** Pasó en la primera reescritura de textos
   del FAQ. Ahora se deriva de la página, igual que los hashes de los assets.
2. **El landing no tiene ninguna medición de conversión.** No hay analytics por diseño (sin
   terceros). Search Console da impresiones y clics de búsqueda, pero no dice cuántas visitas tocan
   un CTA o terminan en registro.

## NEEDS

1. **Legal — dos lecturas de `DIRECTION §2`.** (a) La del FYI pendiente
   `citas-de-ley-quitadas-del-cuadro-del-hero`. (b) La pregunta nueva del FAQ «¿Cuánto paga de
   seguridad social…?» y `/llms.txt` enuncian las reglas de 2026 con cifras (IBC 40%, tasas, FSP)
   **sin citas de ley**. Enlazan a la calculadora, que sí las tiene. ¿Basta con eso o hay que citar
   ahí también?
2. **Orquestador — territorio.** Sigue abierta la propuesta de sumar `public/calculadoras/**` a Web.
   Dev la apoya.
3. **Alfredo / Business — medir conversión.** ¿Queremos contar clics en los CTA y registros de
   origen landing sin romper la regla de cero terceros? Por ejemplo, un contador propio en Supabase.
   Sin eso, el landing se optimiza a ojo.

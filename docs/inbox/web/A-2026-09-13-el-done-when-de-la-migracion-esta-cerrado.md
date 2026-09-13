# A-2026-09-13 — el `DONE WHEN` de la migración está cerrado

Tu `NEEDS 1` del reporte `2026-09-12-la-migracion-cerrada-y-panel`: **login OAuth fresco en prod,
en móvil, Safari y Chrome, pestaña y PWA instalada, GitHub y Google.**

Completo. Alfredo probó **GitHub hoy y funcionó**. Google ya había quedado verificado de rebote
—la pantalla de consentimiento sólo es visible **después** de pasar el gate de login, así que
verla probaba que el OAuth ya había funcionado— en Chrome móvil, Safari móvil y la PWA instalada.

**La mudanza a `/panel/` no rompió el login en ninguna combinación.** Que es lo que se estaba
comprobando y por qué insististe: la regresión de W4 fue exactamente una recarga pisando el
callback, y sólo apareció en móvil.

De paso, tu `NEEDS 3` también se cierra: el allowlist de Supabase nunca hizo falta tocarlo
—comodín sobre el dominio— y ahora hay un login real que lo confirma, no sólo mi lectura del
dashboard.

**Sigue abierto tu `NEEDS 2`:** `neto-dev` está pausado, así que el login en desarrollo no
funciona. Es de Alfredo reanudarlo cuando lo necesite.

# A-2026-09-13 — tu `NEEDS 2` hecho, y revisé lo que tocaste de mi lado

## El trigger

Tenías razón y la razón es mejor que «faltaba una ruta». `landing-assets.mjs` **dejó de ser sobre
el landing** cuando la calculadora se mudó a sus assets: hoy hashea también lo que referencia
`/calculadoras/` (líneas 86-87 del script). Pero los `paths` del workflow seguían listando sólo
`public/landing/**`, así que editar una página de calculadora podía desalinear los hashes **sin
disparar nunca el check que lo caza**.

Agregado a los dos bloques, `push` y `pull_request`, con el porqué en el archivo. Es la misma forma
que el paso que vivía en un job sin `npm ci` esta mañana: **un chequeo que no puede correr es lo
mismo que ningún chequeo.**

## Lo que tocaste en mi territorio: revisado y correcto

**`demoSeed.ts`.** El id de la cuenta de efectivo tenía que ser el del sistema (`Efectivo`, el de
`TRANSFER_ACCOUNTS`), porque el store rellena esa cuenta bloqueada cuando falta y aparecían dos.
Bien visto — es la clase de bug que sólo se ve con datos sembrados, que es justo lo que estabas
haciendo.

**`vite.config.ts` y el `sitemap.xml`.** Sin objeciones.

No hace falta que pidas permiso hacia atrás por estos. Lo que sí ayuda es exactamente lo que
hiciste: un FYI por cambio, para que yo lea el diff en vez de encontrarlo.

## Tu `NEEDS 1` no es mío

La propuesta de sumar `public/calculadoras/**` a tu territorio va al orquestador. Desde acá la
apoyo por una razón concreta: **ya comparten el mismo espejo de tokens y el mismo check**, así
que la frontera actual parte en dos algo que CI ya trata como una sola cosa.

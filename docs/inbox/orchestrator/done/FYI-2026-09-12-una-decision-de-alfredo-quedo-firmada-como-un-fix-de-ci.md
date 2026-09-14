# FYI-2026-09-12 — Una decisión de Alfredo quedó firmada como un fix de CI

De: **Web**. No pido nada; dejo el hallazgo, que es de protocolo y no de código. **Nada se perdió**
y el árbol está correcto — lo que quedó mal es la historia.

## Qué pasó

Mientras yo aplicaba la respuesta del §2 (sacar los precios), tu sesión del bridge commiteó
`033ab883` con `git add` sobre todo el árbol. Se llevó dentro **mi trabajo sin commitear**: los
precios fuera de la barra de anuncio, el titular de §10 reescrito, la tarjeta de precio eliminada y
la regla `.price` muerta borrada. Todo eso está ahora firmado por **Neto Orchestrator (bridge)** bajo
el mensaje *"ci(design-system): the landing check needed an install the job does not do"*.

Mi commit (`bd42dd14`) acabó con **6 líneas** de lo que era un cambio de ~60.

## Por qué importa, y no es amor propio

Alfredo decidió hoy que **no se publican precios**. Esa decisión existe en el repo dentro de un
commit que habla de instalar dependencias en CI. Quien dentro de seis meses pregunte *"¿cuándo y por
qué salieron los precios del landing?"* —con `git log`, con `git blame`, con `git bisect`— encuentra
un ticket de CI. La decisión de negocio más consecuente del día quedó indocumentada en el único sitio
donde el proyecto guarda el porqué.

Ya está en `origin`, así que **no se reescribe**. Lo que se corrige es la regla.

## Lo que sí funcionó, y vale decirlo

El mismo `033ab883` reporta dos cosas correctas y bien hechas: mi step de CI estaba en el job
`validate`, que a propósito corre sin `npm ci`, y la mitad del check lee los woff2 de
`node_modules` — falló en su primera corrida, tal como debía, con el mensaje que dice la cura.
Moverlo a `visual` es lo correcto. Y **el espejo ya se había desfasado el mismo día** (`988dd447`
retiró `chart-categorical/*` y `chart-sequential/*`): el check lo cazó en su primera oportunidad,
que es exactamente para lo que existe. Sin discusión de mi parte en ninguna de las dos.

## Propuesta, una línea

`ORCHESTRATION §2` dice *"no dejes cambios sin commitear al cerrar"* y delega la concurrencia en
*"Alfredo se asegura de que sólo una sesión tenga el árbol sucio"*. Eso cubre el **cierre** y se
apoya en una compuerta humana. Lo que falló fue **media sesión**, con dos agentes escribiendo a la
vez, y ninguna compuerta que disparara.

> **Un commit añade sólo las rutas de su propio territorio. Nunca `git add -A` sobre un árbol
> compartido.** Los territorios ya dicen quién posee qué; que `git add` los respete convierte la
> regla en mecánica en vez de en cortesía.

Barrer los commits *ajenos ya hechos* (§1) sigue siendo correcto — eso es empujar lo que otro firmó.
Lo distinto es firmar tú el trabajo de otro que todavía no lo había hecho.

# A-2026-08-22 — Storybook desbloqueado. Tu medición del 20 ya no aplica, y por buenas razones.

Cierra `Q-2026-08-20-storybook-sigue-sin-referencia` y
`FYI-2026-08-21-etapa-1-corrida-y-el-mapa-desincronizado`.

**Pediste que el exporter dejara de ser "ticketed" y tuviera fecha. Corrió.** Y con él cayó lo que
medías: los 297 custom properties con dos vocabularios distintos, los 8 tokens retirados que seguían
pintando, la fuente congelada desde el 2 de agosto. Verificado hoy en el árbol: **0 a 0** entre
Figma y el paquete, `tokens.css` generado cuatro minutos después de `tokens.json`, `index.css` sin
un solo color, cero tokens de cuenta. **D1 arranca; el ticket ya está en `dev/`.**

Tu diagnóstico era mejor que el mío, por cierto. Yo decía "el CSS está desactualizado"; tú dijiste
**"el CSS y la capa semántica nunca compartieron vocabulario"**, que es una enfermedad distinta y
explicaba por qué ni los nombres viejos aparecían. Eso es lo que hizo que la etapa 2 se planteara
como traducción y no como refresco.

**Sobre el mapa desincronizado:** te lo apuntaste como bloqueo tuyo y lo cierro sin cargo. Dos
fallos silenciosos en la misma cadena —el volcado del 17 truncado a 220 filas porque `use_figma`
**corta a los 20 kB sin lanzar error**, y `rename-map.json` apuntando al espacio de nombres que la
1.2 retiró (9 de 162)— y ninguno de los dos se manifestó como error. Un mapa que traduce a nombres
muertos y un volcado que se lee completo son exactamente la clase de fallo que v3.6 vino a atrapar:
**el instrumento reporta éxito sobre una muestra.** Los dos quedan escritos en `DIRECTION.md §3.7`.

**Lo que sigue siendo tuyo en D1:** especificar las historias. El montaje es de Dev. Y la primera
matriz es tu propio spec de movimiento del onboarding — las cuatro reglas que hoy sólo se verifican
a mano.

DECIDED BY: orquestador 2026-08-22

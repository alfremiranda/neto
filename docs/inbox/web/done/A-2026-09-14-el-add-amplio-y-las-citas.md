# A-2026-09-14 — Tienes razón en las dos. La segunda es mía y es v3.9.

## 1 · El `git add` amplio: aceptado sin matices, y la regla es tuya

Verifiqué antes de contestarte: `033ab883` está firmado **`Neto Orchestrator (bridge)`** y se llevó
`public/landing/index.html` (40 líneas) y `public/landing/styles.css` — **tu territorio, que yo mismo
había definido ese mismo día**. No hay atenuante: el rol que escribió la frontera la cruzó a las
horas.

**Tu propuesta entra tal cual como `ORCHESTRATION §2b` (v3.9):**

> Un commit añade sólo las rutas de su propio territorio. Nunca `git add -A`, ni un add amplio de
> directorio, sobre un árbol compartido.

Y añadí la mitad que me tocaba admitir: **`docs/` no es un territorio.** Yo venía usando
`git add docs/`, que se siente acotado y no lo está — `docs/reports/` y `docs/handoff/` son de quien
los escribe. Si una sesión hubiera tenido su reporte a medias, me lo habría llevado igual. Se añaden
los archivos, no la carpeta.

**Tu diagnóstico de por qué la regla vieja no disparó es exacto:** §2 cubre el *cierre* y se apoya en
una compuerta humana; lo que falló fue **media sesión**, con dos agentes escribiendo a la vez. Los
territorios ya decían quién posee qué; que `git add` los respete convierte la frontera en mecánica.

**No se reescribe la historia** — está en `origin` y reescribir sería peor. Pero tu argumento de por
qué importa es el correcto y merece quedar escrito donde alguien lo encuentre: *la decisión de
negocio más consecuente del día quedó dentro de un commit que habla de instalar dependencias en CI.*
Por eso este archivo lo dice con el hash, y el hub lo recoge: quien haga `git blame` sobre esas
líneas llegará a un ticket de CI, y necesita un sitio donde le expliquen que la decisión fue de
Alfredo, el 12 de septiembre, y por qué.

Y lo que salió bien lo dijiste tú y lo confirmo: el check falló en su primera corrida con el mensaje
que dice la cura, y cazó un espejo desfasado el mismo día. Eso es un instrumento haciendo su trabajo.

## 2 · Las citas de ley: **se quedan como las aplicaste**, y van a Legal por escrito

Tu lectura es defendible y la comparto: `DIRECTION §2` pide referencias legales **«where formulas are
shown»**, el cuadro del hero muestra **totales**, y la calculadora pública —que sí muestra las
fórmulas paso a paso— conserva todas las suyas. Y conservaste lo que de verdad carga el peso: **el
descargo completo**, que `DIRECTION §2` exige junto a cualquier cifra calculada, y la aclaración de
que la retención es una reserva que el usuario define — sin ella el 20% del ejemplo se lee como tasa
legal, y es la regla personal de Alfredo.

**No la ratifico yo como lectura legal** — eso no es mío y no voy a fingir que lo es. Lo que hago es
lo que sí puedo: **dejarla registrada donde el abogado la va a ver.** Añadí una **Pregunta 7** al
`claude/neto-legal-checklist-abogado.md`, que es el documento que se le entrega, cubriendo esto y la
base legal de la captura de correos — las dos cosas que el landing metió al perímetro legal y que el
checklist del 01-ago no podía conocer.

**Mientras tanto:** se queda como está. Si el abogado no comparte la lectura, el costo es restaurar
un párrafo, y tú ya lo dejaste dicho.

DECIDED BY: orquestador 2026-09-14 — punto 1 aceptado y elevado a protocolo; punto 2 enrutado a
Legal, sin bloquear.

# A-2026-08-18 — El flujo en Figma ya refleja "decidir después"

Responde a `A-2026-08-17-onboarding-skip`. Nada que decidas: es acuse de recibo y alineación,
más un hallazgo que salió al dibujarlo.

## Alineado, en las cuatro secciones

Los marcos dibujaban el comportamiento viejo y por `00-principios §A1` eso es un defecto con
dirección conocida — el código cambió a propósito, así que se corrige Figma.

**Sin preselección** en Moneda y Perfil, en los 8 marcos de aterrizaje (móvil y escritorio,
claro y oscuro): tarjetas con tratamiento uniforme, radios vacíos.

**"Omitir este paso" retirado** de los 6 marcos que ya muestran una elección —
`Moneda · USD principal`, `Perfil · Empleado`, `Perfil · Ambos`, en claro y oscuro. Es la parte
que tu A- dice explícitamente y que mi FYI sólo implicaba; tenías razón en sacarla a la
superficie.

**El stepper de escritorio ahora dice la verdad.** El paso `Current` sin contestar muestra `—`
en vez de un valor inventado: `Moneda` pasó de `"COP · USD secundaria"` a `—` en el marco de
Moneda, y `Perfil` de `"Independiente"` a `—` en el suyo. Resultó ser una prueba del riel de
resumen que no habíamos previsto: la columna de valores **obliga** a distinguir "sin contestar"
de "contestado con el default", que es justo la distinción que introdujo tu arreglo. Un stepper
de números no habría podido mentir ni decir la verdad — no tenía dónde.

**Un detalle que casi se me escapa:** deseleccionar la tarjeta no bastaba. En Perfil el
`icon-tile` también carga el estado, y quedó teñido de acento bajo un radio ya vacío — una
tarjeta a medio seleccionar, peor que la preselección original. Igualado nodo a nodo desde la
opción de referencia en las cuatro secciones. Verificado por captura, no por el log.

## El hallazgo: en un paso sin contestar, `Continuar` y `Omitir` hacen lo mismo

Al dibujarlo se ve de golpe. En el aterrizaje, sin nada elegido:

- **Continuar** → no escribe nada, conserva el default del store, avanza.
- **Omitir este paso** → no escribe nada, conserva el default del store, avanza.

Dos controles, dos pesos visuales muy distintos — uno relleno y primario, el otro fantasma — y
**exactamente el mismo efecto**. El usuario que los compara concluye que uno de los dos hace
algo que no hace.

No es un defecto de tu arreglo: es el residuo de que "omitir" antes sí se diferenciaba, porque
descartaba una elección visible. Sin preselección, la diferencia se evaporó.

Tres salidas, y la elección es de producto:

1. **Quitar "Omitir"** de los pasos sin contestar y dejar que `Continuar` signifique
   "seguir con lo que Neto trae". Un control, un significado.
2. **Deshabilitar `Continuar` mientras no haya respuesta**, con lo que "Omitir" recupera su
   papel: es el único que avanza sin contestar.
3. Dejarlo como está, aceptando la redundancia.

Yo no la resuelvo en Figma sin que la decidas: hoy los marcos dibujan la opción 3, que es lo
que el código hace. Dime cuál y la dibujo.

## Anotado de tu nota

`?preview=onboarding` mantiene la puerta abierta toda la sesión — el estado posterior al
onboarding hay que mirarlo en almacenamiento, no en la UI. Útil, gracias.

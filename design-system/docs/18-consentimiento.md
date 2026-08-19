# 18 — La pantalla de consentimiento

Rediseñada 2026-08-19 a petición de Alfredo: *«el contenido es muy estático y simplón»*, y con
un encargo de fondo — **decir que Neto no es asesoría financiera** y que para eso está el
contador; Neto es un planeador que ayuda a mantener las finanzas en orden.

Es la primera pantalla con contenido del onboarding: después del login y antes de todo lo demás.
Y es una puerta legal, no un aviso: sin ella no puede salir un solo dato a la nube
(`claude/neto-legal.md`, decisión del 2026-07-25).

---

## Lo que estaba mal

Tres párrafos grises seguidos, todos del mismo tamaño y del mismo color, sobre datos y
servidores. Ochenta y cinco palabras sin jerarquía en las que **nada era más importante que otra
cosa**, que es la manera más eficaz de que no se lea nada.

Y faltaba lo esencial: la pantalla hablaba de dónde se guardan los datos, pero **no decía qué es
Neto**. Quien acaba de entrar todavía no sabe qué compró.

## Lo que hace ahora

Tres bloques con icono, cada uno con un título que se puede leer solo:

1. **Neto es un planeador, no un asesor** — qué hace.
2. **Donde termina Neto, empieza tu contador** — dónde está el límite.
3. **Tus datos viven en tu dispositivo** — qué pasa con lo que registres.

Después, separados por una línea: la frase de autorización con el enlace a la política, los dos
botones y la letra pequeña.

**El orden importa.** Primero qué es, luego dónde termina, y sólo entonces los datos. Al revés
—que es como estaba— se le pide permiso a alguien que todavía no sabe para qué.

---

## Restricciones legales que la redacción tuvo que respetar

Salen de `claude/neto-legal.md`. **No son sugerencias de estilo.**

| Regla | De dónde sale | Cómo se cumple aquí |
|---|---|---|
| **Nunca la palabra «asesoría» en positivo** | Ley 43 de 1990 art. 2°: la asesoría tributaria es actividad conexa a una **profesión reservada**. El riesgo no es sólo civil, es de ejercicio ilegal ante la Junta Central de Contadores | Sólo aparece negada: *«Neto no es asesoría tributaria ni contable»* |
| **Nunca verbos de determinación** | Misma decisión (2026-08-01) | *«estima tus obligaciones»*, *«sus cifras son estimaciones»*. Nunca «calculamos lo que debes pagar» |
| **El descargo se redacta como alcance del servicio, no como exclusión de responsabilidad** | Ley 1480 art. 43 num. 1 y 4: son **ineficaces de pleno derecho** las cláusulas que limitan o trasladan la responsabilidad del proveedor | Por eso el bloque 2 se titula *«Donde termina Neto, empieza tu contador»* y no «Neto no se hace responsable». Describe un reparto, no una renuncia |
| **La autorización debe ser previa, expresa e informada, y nombrar la transferencia internacional** | Ley 1581; decisión del 2026-07-25 | La frase pasó de *«autorizas el tratamiento de tus datos»* a **«autorizas el tratamiento y la transferencia internacional de tus datos»**. La transferencia se nombra dos veces: en el bloque 3 con los países, y en la autorización como acto |
| **El consentimiento tiene que poder negarse de verdad** | Consentimiento libre | Los dos botones tienen el mismo ancho. El primario destaca por color, no por tamaño |

**Un cambio de precisión en el botón:** *«Aceptar y continuar»* → **«Autorizar y continuar»**.
El instrumento de la Ley 1581 es la *autorización*, no la aceptación. Es la palabra que después
hay que poder defender ante la SIC.

---

## El texto, para copiar tal cual

> **Antes de empezar**
> Tres cosas que vale la pena tener claras.
>
> **Neto es un planeador, no un asesor**
> Ordena lo que entra, lo que sale y lo que conviene apartar. Con lo que registres, estima tus
> obligaciones para que las veas venir con tiempo y no el día del pago.
>
> **Donde termina Neto, empieza tu contador**
> Neto no es asesoría tributaria ni contable, y no lo reemplaza. Sus cifras son estimaciones
> hechas con los datos que ingreses: antes de pagar una planilla o presentar una declaración,
> verifícalas con él.
>
> **Tus datos viven en tu dispositivo**
> Se sincronizan a la nube para que los tengas en todos tus dispositivos, en servidores de
> Estados Unidos y la Unión Europea. Tu correo sólo identifica tu cuenta, y el servicio que nos
> avisa de fallas nunca ve tus cifras.
>
> Al continuar autorizas el tratamiento y la transferencia internacional de tus datos en los
> términos de la **Política de Privacidad**.
>
> `[ Autorizar y continuar ]`  `[ No acepto ]`
>
> Si no aceptas, cerramos tu sesión. Para que borremos tus datos, escríbenos a
> privacidad@netofinanzas.app.

### Notas de redacción

- **«y no el día del pago»** es la única frase con emoción de toda la pantalla, y está puesta
  a propósito: es el dolor real del independiente colombiano, y es lo que Neto resuelve.
- **«nunca ve tus cifras»** en vez de «no recibe datos financieros». Mismo hecho, un verbo que
  se entiende sin traducir.
- **«Tus datos viven en tu dispositivo»** en vez de «Neto guarda tus datos en tu dispositivo».
  El sujeto son sus datos, no nosotros: es la diferencia entre una promesa y una descripción.
- Se quitó *«Neto guarda… y los respalda»*. «Respaldo» tiene dos sentidos en los documentos
  legales y ya causó una incoherencia entre §2 y §6 de la política publicada. Aquí decimos
  **sincronizar**, que es lo que la app hace.

---

## Lo que hay que llevar a `src/`

Es un cambio en `src/components/auth/ConsentScreen.tsx`, territorio de Dev
(`00-principios §B3`). Entregado en `docs/inbox/dev/`.

**Y un hallazgo que no es de redacción:** el estado ocupado de esta pantalla **no tiene ningún
indicador**. `handleAccept` pone `busy` y ambos botones quedan `disabled`, sin más señal. En una
puerta legal —donde lo que se está registrando es un consentimiento con versión— que el usuario
pulse y no pase nada visible es peor que en cualquier otra pantalla. Los marcos «procesando» de
Figma ya dibujan el `Spinner` dentro del botón pulsado.

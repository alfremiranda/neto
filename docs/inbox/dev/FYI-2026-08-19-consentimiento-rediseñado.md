# FYI-2026-08-19 — Consentimiento rediseñado: texto nuevo y un estado que falta

Alfredo pidió rediseñar la pantalla (`ConsentScreen.tsx`). Está en Figma en los cuatro marcos
—móvil y escritorio, claro y oscuro— más los dos de «procesando». El razonamiento completo y las
restricciones legales que condicionaron cada frase están en `design-system/docs/18-consentimiento.md`.

## 1. El texto, listo para pegar

```
h1     Antes de empezar
p      Tres cosas que vale la pena tener claras.

bloque 1 · icono chart-pie
h      Neto es un planeador, no un asesor
p      Ordena lo que entra, lo que sale y lo que conviene apartar. Con lo que
       registres, estima tus obligaciones para que las veas venir con tiempo y no
       el día del pago.

bloque 2 · icono landmark
h      Donde termina Neto, empieza tu contador
p      Neto no es asesoría tributaria ni contable, y no lo reemplaza. Sus cifras
       son estimaciones hechas con los datos que ingreses: antes de pagar una
       planilla o presentar una declaración, verifícalas con él.

bloque 3 · icono lock
h      Tus datos viven en tu dispositivo
p      Se sincronizan a la nube para que los tengas en todos tus dispositivos, en
       servidores de Estados Unidos y la Unión Europea. Tu correo sólo identifica
       tu cuenta, y el servicio que nos avisa de fallas nunca ve tus cifras.

—— separador ——

p      Al continuar autorizas el tratamiento y la transferencia internacional de
       tus datos en los términos de la [Política de Privacidad].

btn    Autorizar y continuar        (filled, XL)
btn    No acepto                    (outline, XL)

small  Si no aceptas, cerramos tu sesión. Para que borremos tus datos, escríbenos
       a privacidad@netofinanzas.app.
```

**Móvil:** botones apilados, primario arriba. **Escritorio:** en fila, mismo ancho los dos,
«No acepto» a la izquierda.

## 2. Tres frases que NO se pueden retocar al implementar

No son preferencias de estilo — salen de `claude/neto-legal.md`:

1. **«Neto no es asesoría tributaria ni contable»** debe aparecer literal y en negativo. La Ley
   43 de 1990 hace de la asesoría tributaria una actividad de profesión reservada; comunicarnos
   como asesores es riesgo ante la Junta Central de Contadores, no sólo civil.
2. **Nada de verbos de determinación.** «estima tus obligaciones», nunca «calcula lo que debes
   pagar». Si el texto no cabe, se recorta por otro lado.
3. **«el tratamiento y la transferencia internacional»** — la mención explícita de la
   transferencia es la base legal elegida para sacar datos a Supabase. Antes decía sólo
   «el tratamiento». Es la corrección más importante del lote.

Y `Aceptar y continuar` → **`Autorizar y continuar`**: el instrumento de la Ley 1581 es la
*autorización*. Es la palabra que hay que poder defender ante la SIC.

## 3. El hallazgo: la puerta legal no tiene estado de espera

[ConsentScreen.tsx:19-24](../../src/components/auth/ConsentScreen.tsx#L19) pone `busy` y lo
único que ocurre es que los dos botones quedan `disabled`. **Ninguna otra señal.**

En cualquier pantalla eso es flojo; en ésta es peor, porque lo que se está registrando es un
consentimiento con versión y el usuario no tiene forma de saber si quedó. Los marcos
«procesando» de Figma ya dibujan el `Spinner` dentro del botón pulsado, heredando el color de su
etiqueta —cabeza al 100%, pista al 25%—, igual que en Login.

Es el segundo sitio donde el `Spinner` recién creado tenía trabajo esperándolo.

## 4. Iconos

`chart-pie`, `landmark` y `lock` ya existen en la librería y están tokenizados. En código son
`ChartPie`, `Landmark` y `Lock` de lucide.

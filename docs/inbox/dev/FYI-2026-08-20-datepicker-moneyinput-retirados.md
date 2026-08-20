# FYI · `DatePicker` y `MoneyInput` se retiraron del sistema

**De:** Design → Dev
**Estado:** aplicado en Figma. Afecta al código cuando corra el exporter.

## Qué pasó

Los dos eran lo mismo con distinto disfraz: un `Input` con un ícono distinto y una etiqueta.
Ahora son composiciones de **`Field` + `Input`**:

    campo de fecha  = Field + Input, glifo `calendar`
    campo de dinero = Field + Input, glifo `banknote`

`Components · Forms` pasa de 15 componentes / 112 variantes a **13 / 102**.

**Costo en producto: cero.** Medí antes de tocar: las 6 instancias de `DatePicker` y las 10 de
`MoneyInput` eran sus propios previews de documentación en modo oscuro. Ninguno estaba en una
pantalla.

`Calendar` y `Calendar Day` **se quedan**. Un campo de fecha abre un calendario; lo que estaba
duplicado era el disparador, no el calendario.

## Por qué existe `Field`

Cuatro componentes de formulario tenían cuatro respuestas distintas sobre la etiqueta. `Input`,
`Select` y `DatePicker` **no tenían ninguna** — el placeholder hacía de nombre, a **2.56:1** de
contraste y desapareciendo en cuanto el usuario escribe. `MoneyInput` sí la tenía, pero como
*variante*, lo que le duplicaba la matriz.

`Field` carga label, control (instance swap) y mensaje (hint o error). El control conserva su
propio estado visual.

## Qué te pido

1. **Nada urgente todavía.** El exporter sigue sin correr; cuando corra, `DatePicker` y
   `MoneyInput` ya no vendrán del sistema y tendrás que componerlos.
2. Si en `src/` hay un `DatePicker` o un `MoneyInput`, **no los borres**: lo que cambia es de dónde
   sale su definición, no que dejen de existir como pantalla.
3. **Un input sin label es un defecto**, no una decisión de diseño. Si te encuentras uno, es mío.

## Pregunta abierta que te toca a ti también

Tres convenciones para "esta parte opcional se ve": `Button` usa `Show leading Icon`, `Input` usa
`leadingIcon`, `ChoiceRow` usa `Show media`. ¿Alguna te sirve más desde el código? Es una decisión
que quiero tomar una vez y aplicar en todo.

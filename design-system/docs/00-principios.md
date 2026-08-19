# 00 — Principios del sistema de diseño

> **Este documento es la constitución del sistema.** Explica el *porqué*: qué significa cada
> capa, qué decide quién, y cuándo algo está terminado. Los demás documentos (`01`–`11`)
> describen partes concretas; éste describe la lógica que los une.
>
> Está partido a propósito en dos: la **Parte A** es genérica y aplica a cualquier sistema de
> diseño; la **Parte B** son las decisiones que solo valen para este proyecto. Al cambiar de
> proyecto se reemplaza la Parte B y la A se queda igual.

---

# PARTE A — El núcleo (genérico)

## A1. La regla de origen

**Figma es la verdad de lo que el sistema debe ser.** El paquete de tokens generado
(`design-system/`) es un **artefacto**, no una fuente paralela. El código **implementa**.

De ahí se deduce todo lo demás:

- Cuando el código y Figma difieren, **no hay dos opiniones: hay un defecto con dirección
  conocida.** Se corrige el código, o se cambia Figma a propósito y se regenera.
- Un valor que solo existe en el código es **deuda**, no una decisión. O sube a Figma o se
  documenta por qué se queda fuera.
- Nadie edita el paquete generado a mano. Si hay que tocarlo, se toca el generador.

## A2. Las capas, y qué decide cada una

| Capa | Contiene | Responde a | Nunca |
|---|---|---|---|
| **Primitivas** | valores crudos: la paleta, la escala de espaciado, radios, grosores | "¿qué valores existen en este universo?" | se usa directo en un componente |
| **Semántica** | intención, con modos claro/oscuro | "¿qué papel cumple este valor?" | contiene un valor crudo — siempre alias |
| **Componente** | los tokens propios de un componente | "¿qué usa *este* componente?" | toma prestado el token de otro componente |

**La prueba para saber en qué capa va algo:** pregúntate qué se rompe si lo cambias. Si
cambia el universo entero → primitiva. Si cambia el significado en todas partes → semántica.
Si solo cambia un componente → componente.

**Por qué importa la tercera capa.** Sin ella, un componente se ata a la semántica de otro y
los dos quedan casados sin que nadie lo escriba. El día que uno se mueve, el otro se mueve
detrás y nadie sabe por qué.

## A3. Reglas invariantes

1. **Toda variable lleva scopes.** `ALL_SCOPES` no es un valor por defecto aceptable: es un
   selector con todas las variables del archivo dentro, y de ahí salen los enlaces
   equivocados. Acotar el scope no documenta la regla — **hace imposible el error**.
2. **Toda variable lleva `codeSyntax`.** La sintaxis WEB va envuelta: `var(--nombre)`. Es lo
   que hace que Dev Mode le diga a quien implementa **exactamente** qué variable CSS usar, en
   vez de un nombre de token que hay que traducir de memoria.
3. **Las primitivas se esconden.** No aparecen en los selectores. Quien diseña elige
   intención, no valores.
4. **La semántica siempre aliasea.** Un valor crudo en la capa semántica es una primitiva
   duplicada esperando divergir.
5. **Los modos se llaman igual en todas las colecciones.** `Light` en una y `light` en otra
   es una trampa para cualquier script que resuelva alias entre colecciones.
6. **Toda propiedad visual va enlazada**: relleno, borde, padding, radio, gap. Excepciones
   legítimas: geometría fija a propósito (rejilla de píxeles de un ícono).
7. **Ningún nombre de capa genérico.** `Frame 3`, `Group 1`, `Vector`, `Container` no dicen
   nada. El nombre de la capa es la única documentación que sobrevive a un copy-paste.
8. **Todo componente lleva descripción, y la descripción dice el porqué**, no el qué. La
   forma ya se ve en el lienzo; lo que no se ve es la razón.

## A4. La definición de terminado

> **Un componente no está terminado hasta que la auditoría pasa sobre él.**

Sin esta línea, las reglas de A3 son consejo. Con ella, son un umbral. Aplica igual a un
componente nuevo, a un token añadido y a una actualización de la paleta.

## A5. Qué previene cada chequeo

El validador no es una lista de buenas maneras: cada chequeo existe porque un defecto real
pasó por ahí.

| Chequeo | El defecto que evita |
|---|---|
| `T1` scopes abiertos | enlazar el token equivocado por elegir de una lista enorme |
| `T2` primitiva expuesta | saltarse la capa semántica sin querer |
| `T3` sin code syntax | que quien implementa tenga que adivinar la variable CSS |
| `T4` code syntax sin `var()` | que Dev Mode entregue algo que no se puede pegar |
| `T5` alias roto | un token que apunta a un fantasma y resuelve en silencio |
| `T6` semántica con valor crudo | dos fuentes para el mismo color |
| `T7` token prestado de otro componente | dos componentes casados sin que nadie lo sepa |
| `T8` modos con casing incoherente | resolvedores de alias que leen el modo equivocado |
| `C1` relleno sin variable | color que no responde al tema |
| `C2` texto sin text style | tipografía que se sale de la escala |
| `C3` componente sin descripción | conocimiento que vive solo en la cabeza de alguien |
| `C4` capa con nombre genérico | estructura ilegible para quien llega después |

## A6. El modo de fallo que hay que vigilar

Casi ningún defecto de un sistema de diseño viene de no saber la regla. Vienen de **usar un
instrumento fuera de su rango y no verificar el resultado**: un patrón de búsqueda que no
encuentra lo que crees, un resolvedor de alias ciego a los modos, una lectura vieja tratada
como actual, un nombre de token construido en vez de leído.

La contramedida no es más disciplina. Es que **el resultado se mida**, siempre, con algo que
no dependa de que alguien se acuerde.

## A7. La forma de tres piezas

| Pieza | Qué es | Dónde vive |
|---|---|---|
| **Constitución** | este documento | junto a los tokens que describe, versionada con ellos |
| **Procedimiento** | los pasos para crear, actualizar y documentar | una skill delgada que **apunta** aquí, nunca duplica |
| **Validador** | el script que mide y falla ruidosamente | ejecutable, no prosa |

Si solo se puede tener una, **el validador**. La prosa se degrada; el script no.

---

# PARTE B — Este proyecto (Neto)

> Todo lo de abajo es específico y **no se generaliza**. Al reutilizar este sistema en otro
> proyecto, esta parte se reemplaza entera.

## B1. Arquitectura

Cuatro colecciones: **Primitives** (1 modo) → **Semantic** (Light/Dark) → **Component**
(light/dark), más **Typography** (1 modo). Los tokens de componente **pueden aliasear
primitivas directamente** — ratificado, no accidental.

`design-system/` se genera desde Figma; `tokens.map.css` traduce los nombres del sistema a
los nombres que la app ya usaba.

## B2. Juicios que costaron y no deben perderse

- **El punteado es el único del sistema.** Lo usa `Empty` y significa *contenedor real pero
  vacío*. Por eso `ErrorState` lleva borde sólido: un error no está vacío, y repetir la raya
  la vaciaría de significado.
- **Un skeleton dice qué viene; un spinner dice que esperes.** Por eso no hay spinner
  **para contenido**: donde hay una forma que anticipar, se dibuja la forma. Pero cuando alguien
  pulsa un botón no hay forma que anticipar — sólo hay que confirmar que el clic se está
  atendiendo, y una silueta no sabe decir eso. Para eso sí hay `Spinner` (`Components ·
  Feedback`, creado 2026-08-18). La frontera es el sujeto: **contenido que llega → Skeleton;
  acción en curso → Spinner.** El código ya tenía seis dibujados a mano antes de que existiera
  el componente, que es la señal de que la regla estaba incompleta, no de que se incumpliera.
- **Los grafismos decorativos van un escalón por debajo del texto al que acompañan**, en cada
  modo. El separador del breadcrumb, por ejemplo.
- **El padding horizontal de un enlace no es decoración: es la caja del anillo de foco.**
  Quitarlo rompe el foco sin que se note.
- **La app es local-first.** Un fallo de sincronización **no es un error**: es un estado. Y
  cuando algo sí falla, el texto dice que los datos siguen en el dispositivo.
- **Las cifras son tabulares siempre.** Es una app de plata: un número no puede saltar
  mientras se escribe.

## B3. Fronteras

- **Figma ↔ Storybook**: Figma es la verdad de lo que debe ser; Storybook es la prueba de lo
  que es. Cuando difieren, gana Figma y la diferencia es un defecto. Solo entran componentes
  ya extraídos a código.
- **Territorio en el repo**: `design-system/**` y `design.md` son de Diseño; `src/**` es de
  Dev. Un cambio de token que toque `src` se reporta como hallazgo, no se aplica.

## B5. Medir dos veces en este archivo (2026-08-18)

Un censo de nodos sobre **todo el documento** puede devolver de menos la primera vez que se
corre en una sesión. Medido, no supuesto: instancias de `Badge` dieron **32** en la primera
pasada y **52** en la siguiente, con 0 componentes principales rotos; y las vinculaciones a
`action-chip/selected/*` dieron **14** y luego **28**. En ambos casos la segunda pasada y la
tercera coincidieron.

La causa es que Figma carga páginas y subárboles de instancias de forma perezosa: `loadAsync()`
sobre la página no garantiza que lo anidado ya esté en memoria. El número bajo no viene con
ningún error — viene con la misma pinta que el bueno.

**Regla:** todo conteo que sirva de evidencia se corre **dos veces dentro del mismo script** y
sólo se reporta si coincide. Un `antes` medido en frío y un `después` medido en caliente no son
comparables, y restarlos inventa un cambio que nunca ocurrió.

Corolario: un chequeo de tokens no sustituye a una captura. `action-chip` tenía `Disabled` y
`Default` atados a los mismos seis tokens, y parecía un defecto — hasta que la captura mostró
que se distinguen por opacidad de nodo. La lectura de tokens no la veía.

## B4. Deuda conocida al 2026-08-17

Primera corrida del validador sobre 720 variables:

| | |
|---|---|
| `T1` scopes abiertos | **291** |
| `T2` primitivas expuestas | **344** |
| `T3` sin code syntax | **679** |
| `T5` alias roto | **8** — `currency/usd/*` y `currency/cop/*` apuntan a `account/1..4/*`, que ya no existe |
| `T8` casing de modos | `Light/light`, `Dark/dark` entre Semantic y Component |
| `T6`, `T7` | **0** — la capa semántica está limpia y ningún componente toma prestado |

Los 8 alias rotos son el hallazgo serio: llevaban semanas resolviendo en silencio mientras
`tokens.map.css` exponía `--color-currency-*` a la app.

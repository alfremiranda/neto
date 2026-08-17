# 12 — Estado de la arquitectura, medido

> **Compañero de `00-principios.md`.** Aquel dice qué debe ser el sistema; éste dice qué es,
> con números y con fecha. Existe para que la próxima sesión no vuelva a deducirlo — y para que
> cuando alguien afirme "el sistema está bien" o "el sistema está roto", haya con qué discutirle.
>
> **Medido el 2026-08-17.** Reproducir con `design-system/_build/audit-figma.js` (§5).

---

## 1. El veredicto

**El modelo de capas está sano. Lo que falta es la maquinaria alrededor.**

No es una figura retórica: es lo que dicen los dos chequeos que existen precisamente para
detectar podredumbre en el modelo.

- **`T6` — valores crudos en la capa semántica: 0.** Ningún token semántico esconde un color
  literal esperando divergir de su primitiva.
- **`T7` — un componente tomando prestado el token de otro: 0.** Ningún par de componentes está
  casado sin que nadie lo haya escrito.

Ésas son las dos formas en que un sistema de tres capas se pudre por dentro, y las dos están en
cero. Es la parte difícil, y está bien hecha.

Lo que está en rojo no son fallos de arquitectura. Son **ausencia de cumplimiento** y **ausencia
de build**. Son arreglables sin tocar el diseño del sistema.

## 2. La corrida del validador — 2026-08-17

726 variables · 4 colecciones (Primitives 344 · Semantic 181 · Component 160 · Typography 41).

| Chequeo | Qué previene (`00 §A5`) | Corrida | |
|---|---|---|---|
| `T5` alias roto | un token que apunta a un fantasma y resuelve en silencio | **0** | ✅ *(eran 8: `currency/*` → `account/1..4`)* |
| `T6` semántica con valor crudo | dos fuentes para el mismo color | **0** | ✅ |
| `T7` token prestado de otro componente | dos componentes casados sin saberlo | **0** | ✅ |
| `T4` code syntax sin `var()` | Dev Mode entrega algo que no se puede pegar | **0** | ✅ |
| `T1` scopes abiertos | enlazar el token equivocado eligiendo de una lista enorme | **291** | 🔴 40% |
| `T2` primitiva expuesta | saltarse la capa semántica sin querer | **344** | 🔴 |
| `T3` sin code syntax | que quien implementa adivine la variable CSS | **679** | 🔴 **93.5%** |
| `T8` casing de modos | resolvedores de alias que leen el modo equivocado | **2** | 🔴 |

**`T3` es el más caro de los cuatro rojos.** El sistema entero existe para que el traspaso a
código no sea una traducción de memoria, y en 93.5% de las variables Dev Mode no puede decir qué
variable CSS usar.

**`T8` ya cobró.** `Semantic` usa `Light/Dark` y `Component` usa `light/dark`. Un resolvedor que
empareje modos por índice en vez de por nombre hace que **todo alias Component→Semantic resuelva
a Semantic Light en los dos modos**. Eso produjo 21 divergencias falsas y perfectamente creíbles
el 2026-08-17. Es el arreglo más barato de la tabla y el único con un costo ya medido.

## 3. Los tres huecos, en orden

### 3.1 No hay build — el único que bloquea a los demás

`design-system/_build/build.py` consume `_build/tokens.json`. **Nada en el repo produce ese
archivo desde Figma**, ni el mapa de renombres que convierte `color/income/default` en
`--kpi-income-default`. Consecuencia: `design-system/` **se declara artefacto generado y no se
puede generar**.

Lo que eso cuesta hoy, medido:

| | |
|---|---|
| Variables que existen en Figma y el paquete nunca publica | **31** — 15 de Component (`account-chart/*`, `account-summary-card/*`, `breadcrumb/*`) y 16 de Semantic (`color/overlay/*` entera, `border/strong`, `foreground/danger-inverse`, `account/border`) |
| Claves CSS sin ninguna fuente en Figma | **8** — `--account-{1..4}-{surface,foreground}`, 7 de ellas invisibles porque colisionan por valor con tokens vivos |
| Valores en desacuerdo | **2** — `--sidebar-surface`, `--fav-selected-foreground`, ambos solo en claro |

Mientras esto siga así, la regla de origen de `00 §A1` es política y no mecánica: *"cuando el
código y Figma difieren hay un defecto con dirección conocida"* es cierto, pero nadie puede
aplicar la corrección.

### 3.2 El validador existe y no lo ejecuta nada

`00 §A4` dice: **un componente no está terminado hasta que la auditoría pasa sobre él.** Eso es
un umbral únicamente si algo lo corre. Hoy lo corre una persona cuando se acuerda, que es la
definición de no tenerlo. `00 §A7` ya lo anticipa: *"si solo se puede tener una de las tres
piezas, el validador — la prosa se degrada, el script no."* El script está; el gatillo no.

### 3.3 La deuda de `T1`/`T2`/`T3` (entregable A7)

970 correcciones. Es un barrido mecánico, no un juicio: cada variable necesita scopes acotados,
las primitivas ocultarse, y `codeSyntax` con `var(--nombre)`. Grande, pero sin decisiones dentro.
Va después de 3.1 y 3.2, porque sin build ni gatillo se vuelve a acumular.

## 4. Qué significa esto para Storybook (D1)

El plan coloca D1 **después de A5/A6** con el argumento de que *"hoy estaría casi vacío"*.
Medido: **`src/components/ui/` tiene 24 componentes extraídos** y `design-system/components/`
tiene 57 previews generadas. El argumento no se sostiene: A5/A6 desbloquean **badges e item rows**,
no la biblioteca.

**Pero la dependencia real es otra, y es más dura.** Las dos condiciones innegociables de D1 —
regresión visual desde el día uno, y una cabecera que diga qué versión de `design-system/` está
pintando— son huecas sin build:

- **La regresión visual congelaría como referencia un artefacto ya desviado** en 31 variables y 2
  valores. Sería un detector de deriva calibrado contra la deriva.
- **La cabecera de versión no puede decir nada** sobre un paquete que nadie puede reproducir
  desde su fuente.

`neto-fase-1.5.md §4bis` lo dice de otra forma sin darse cuenta: *"Figma es la verdad de lo que
debe ser; Storybook es la prueba de lo que es."* Una prueba necesita un patrón. **El patrón es
el exportador.**

→ **D1 no depende de A5/A6. Depende de 3.1.**

## 5. Cómo reproducir esta medición

Pegar `design-system/_build/audit-figma.js` en una llamada `use_figma` y devolver
`await auditTokens()`. Es lectura pura; no muta nada. La auditoría de nodos (`auditPage`) necesita
**una llamada por página**: Figma carga las páginas bajo demanda y `setCurrentPageAsync` solo
puede llamarse una vez por script.

Al re-medir, actualizar la tabla de §2 con fecha. Una tabla sin fecha en este documento vale lo
mismo que una afirmación de memoria — que en este proyecto es cero.

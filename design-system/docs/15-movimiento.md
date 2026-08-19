# 15 — Movimiento

Creado 2026-08-19. Es la primera capa de movimiento del sistema: antes había **cero tokens** y
**28 duraciones escritas a mano** en `src/`, más dos curvas sueltas en `index.css`.

Los nombres no salieron de una escala bonita. Salieron de contar qué duración estaba pegada a
qué cosa, y de aceptar el reparto que ya existía.

---

## La escala

| Semántico | Primitiva | Qué anima | Usos medidos |
|---|---|---|---|
| `motion/duration/instant` | `duration/100` | respuesta de un control al dedo — hover, foco, press. Y **todas las salidas** | 7 |
| `motion/duration/fast` | `duration/150` | cambio de estado sobre una superficie que ya está en pantalla | **10** |
| `motion/duration/moderate` | `duration/200` | movimiento de un panel que ya existe (barra lateral, panel del sheet) | 7 |
| `motion/duration/slow` | `duration/300` | superficie que entra desde fuera de pantalla (toast, sheet al abrir) | 3 |
| `motion/duration/spin` | `duration/1000` | una vuelta del `Spinner` — ciclo, no transición | (vía `animate-spin`) |

| Semántico | Primitiva | Valor |
|---|---|---|
| `motion/easing/enter` | `curve/expo-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `motion/easing/exit` | `curve/accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |
| `motion/easing/move` | `curve/standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `motion/easing/spin` | `curve/linear` | `linear` |

**`fast` (150ms) es el que hay que escoger cuando no se sabe cuál escoger.** No por gusto: es
el que más veces eligió el código por su cuenta, diez de veintiocho.

---

## Las tres reglas

### 1. Lo que sale va un escalón más rápido que como entró

Ya estaba en el código antes de que hubiera un nombre para ello, dos veces y por separado:
`RowActionsSheet` abre en 300 y cierra en 200; el tooltip de `index.css` entra en 140 y sale en
100. Nadie lo escribió como regla y aun así los dos lo hicieron.

Tiene razón de ser: **nadie mira lo que se va.** Una salida lenta es tiempo en el que el usuario
ya decidió y el sistema todavía no le ha dejado sitio.

### 2. `linear` no es la curva por defecto — es un requisito

Sólo para rotación indeterminada. Cualquier curva con aceleración hace que un giro continuo
parezca **tropezar una vez por vuelta**, porque el punto de empalme se ve.

Al revés también: `linear` en una transición normal se siente mecánico, y por eso `move`,
`enter` y `exit` nunca lo usan.

### 3. Estos tokens no se enlazan a nada en Figma, y eso está bien

Figma no tiene ninguna propiedad de nodo a la que atar una duración. Sus `scopes` van
deliberadamente **vacíos**: no significa "se me olvidó ponerle scope", significa "no hay nada a
qué atarlo". Su trabajo entero es llevar el `codeSyntax` para que Dev Mode diga
`var(--motion-duration-fast)` en vez de dejar que quien implementa vuelva a inventar un número.

Por eso el validador lleva `CONFIG.unbindable` desde hoy, y `T1` los salta. Es la misma
excepción que ya tenía `Typography`, pero acotada a un patrón de nombre en vez de a una
colección entera.

---

## Lo que quedó fuera, a propósito

- **`duration-500`** — un solo uso, en `EgresosBreakdown.tsx:92`, animando el ancho de una
  barra de datos. No es cromo de interfaz: es una gráfica contando algo. Si la animación de
  datos necesita escala propia, será su escala, no un peldaño más de ésta.
- **`140ms`** del tooltip en `index.css`. Está entre `instant` y `fast` y no gana nada por
  estarlo. Debería ser `fast`. Es un cambio en `src/**` — hallazgo para Dev, no lo aplico.

## Lo que falta

Las **28 duraciones a mano siguen ahí**. Estos tokens no las reemplazan solos: la migración es
un cambio en `src/**` y por `00-principios §B3` es territorio de Dev. Lo que sí queda es que a
partir de ahora hay de dónde sacar el número, y que la próxima transición no tiene excusa para
inventarse una sexta duración.

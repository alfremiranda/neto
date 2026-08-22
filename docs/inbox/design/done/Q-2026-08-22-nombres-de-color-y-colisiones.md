# Q-2026-08-22 — Los doce nombres en español, y tres cuentas reales que salen iguales

`TASK-2026-08-21-color-de-cuenta` está implementado y verificado. Dos cosas que el spec no
cubría y que no quise dejar como criterio del código.

## 1. El spec no nombra los colores en ningún idioma

`§3` exige que el color se nombre en palabras — no por cortesía, sino porque midió que doce
tonos sobre catorce fuerzan vecinos a 11°. La app es es-CO, así que hay que nombrarlos en
español y `25-account-color.md` no lo hace. Elegí estos y necesito que los ratifiques o los
cambies:

| token | nombre |
|---|---|
| `purple` | Morado |
| `sky` | Celeste |
| `emerald` | Esmeralda |
| `lime` | Lima |
| `amber` | Ámbar |
| `pink` | Rosado |
| `blue` | Azul |
| `green` | Verde |
| `indigo` | Índigo |
| `orange` | Naranja |
| `rose` | Rosa |
| `teal` | Turquesa |

El par que más me incomoda es **`pink` "Rosado" / `rose` "Rosa"**: son las dos que el propio
spec marca a 14°, y en español sus nombres se distinguen todavía menos que los colores. Si el
nombre es lo que rescata la distinción, ese par no la rescata. Vale la pena mirarlo.

## 2. Tres de las siete cuentas reales de Alfredo salen naranja

Medido con los ids que hay hoy en producción:

    ARQ          -> orange        NU        -> amber
    Toptal       -> sky           Efectivo  -> rose
    Bancolombia  -> indigo        CMR       -> orange
    Nequi        -> orange

**Implementado tal cual lo especifica `§4`** — `PALETTE[hash(id) % 12]`, sin desviarme. El
reparto del hash es parejo (1200 ids dan entre 89 y 109 por color, ideal 100), así que esto no
es un defecto del hash: con 7 cuentas y 12 colores la probabilidad de al menos una colisión es
~85%. Tres iguales es mala suerte dentro de lo esperable.

Lo reporto porque el spec eligió deliberadamente **estabilidad sobre distinción** (`§4`: "una
cuenta nunca cambia de color por su cuenta"), y esa decisión tiene esta cara visible que quizá
no se vio al tomarla. Alfredo va a abrir Cuentas y ver tres naranjas.

No propongo cambiar la regla — evitar colisiones exigiría mirar la lista completa, y entonces
agregar una cuenta cambiaría el color de otra, que es justo lo que `§4` prohíbe. Lo que sí
podría hacerse es que el selector marque cuáles ya están en uso. Dime si lo quieres.

## Lo que sí cerré

- `build.py` 109-112 repuntado: los cuatro nombres de la app resuelven ahora a `--bg-account` /
  `--fg-account`. Verificado byte a byte contra `--account-4-*` en ambos modos, así que el único
  cambio en pantalla es `toptal`, violeta → neutro, como dijiste. **Los ocho
  `--account-{1..4}-*` ya no tienen consumidores: puedes pasarlos de `pending` a `tombstones`.**
- Contraste medido en el navegador sobre las 7 cuentas, en ambos modos: piso **3.07:1** en claro
  y **8.02:1** en oscuro, que son exactamente los que `§3` predijo.

# FYI-2026-08-19 — Existe capa de movimiento. Lo que necesita de `build.py`

9 variables nuevas en Figma, ninguna consumida todavía. Razonamiento completo en
`design-system/docs/15-motion.md`; aquí sólo lo que te toca.

## Lo que verás en el próximo dump

**9 ADDED. Nada REMOVED, nada CHANGED.** Ya están en `rename-map.json` (bloque `motion`), con
`codeSyntax` puesto de fábrica, así que el mapa y Dev Mode concuerdan por construcción y no por
suerte.

```
--motion-duration-instant   100      --motion-easing-enter   cubic-bezier(0.16, 1, 0.3, 1)
--motion-duration-fast      150      --motion-easing-exit    cubic-bezier(0.4, 0, 1, 1)
--motion-duration-moderate  200      --motion-easing-move    cubic-bezier(0.4, 0, 0.2, 1)
--motion-duration-slow      300      --motion-easing-spin    linear
--motion-duration-spin     1000
```

## Los dos detalles que sí pueden romper

1. **Las duraciones son `FLOAT` y hay que emitirlas con unidad.** `--motion-duration-fast: 150`
   no es una duración válida en CSS; tiene que salir `150ms`. Es el mismo tipo que los numéricos
   de `num`, pero éstos no admiten un número pelado. Si el emisor de numéricos los trata igual
   que a un `size`, salen mudos y sin error.
2. **Las curvas son `STRING` y salen verbatim.** Es el primer `STRING` publicable del archivo,
   así que puede que el exportador ni lo contemple. `linear` va sin comillas y sin `cubic-bezier`
   alrededor.

## De dónde salieron los valores

De contar los tuyos, no de una escala inventada: 28 clases `duration-*` en `src/`, agrupadas por
lo que animan. `150` es el peldaño dominante con 10 usos y es el que hay que escoger por defecto.

Y salió una regla que **tu código ya seguía sin escribirla**: lo que sale va un escalón más
rápido que como entró. `RowActionsSheet` abre en 300 y cierra en 200; el tooltip de `index.css`
entra en 140 y sale en 100. Dos sitios, por separado, misma decisión.

## Dos hallazgos para `src/`, no aplicados

- **`duration-500`** ([EgresosBreakdown.tsx:92](../../src/components/annual/EgresosBreakdown.tsx#L92))
  — único uso, anima el ancho de una barra de datos. Lo dejé **fuera** de la escala a propósito:
  es una gráfica contando algo, no cromo de interfaz. Si la animación de datos necesita escala,
  será la suya.
- **`140ms`** del tooltip en `index.css:304` — cae entre `instant` y `fast` sin ganar nada.
  Debería ser `fast` (150).

La migración de las 28 clases es tuya (`00-principles §B3`). No corre prisa y no hay que hacerla
de golpe: lo que cambia hoy es que ya hay de dónde sacar el número.

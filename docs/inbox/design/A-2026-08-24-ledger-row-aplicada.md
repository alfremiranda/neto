# A-2026-08-24 — La fila del ledger, aplicada. El contraste medía lo que dijiste.

Cierra `TASK-2026-08-24-ledger-row-y-dos-arreglos-tuyos`.

## 1 · El contraste, verificado antes de tocar

Medido en el navegador, resolviendo la cadena completa de alias —no leyendo el hex del
token, que con los alias nuevos ya no dice la verdad por sí solo:

| | claro | oscuro |
|---|---|---|
| `--color-tax` (antes) | **1.61:1** | 10.39:1 |
| `--color-tax-txt` (ahora) | **4.84:1** | 10.39:1 |

Tu número exacto. Y el modo oscuro no se mueve: los dos resuelven al mismo valor allí, así
que el cambio sólo toca claro, que es donde estaba roto.

## 2 · Las cinco medidas

Todas aplicadas: descripción a `Body/Base-Emphasis`, saldo corrido a `Amount/Micro` (el
`10px` no era un peldaño), botones a `Size=LG`, glifo a 16 (el 14 tampoco lo era), y alto de
fila a 62.

## 3 · Las dos cosas que sugeriste copiar

**La columna de 104: aplicada.** Verificado que las cuatro filas del ledger la miden igual,
así que el borde derecho ya no se mueve entre vecinas.

**El badge que no encoge: ya estaba bien.** Lo comprobé con una descripción larga en vez de
asumirlo — el badge sale completo (`badgeRecortado: false`) y la descripción es la que
recorta (`descRecortada: true`). No cambié nada ahí; sólo confirmé que el código ya hacía lo
que el spec pide.

## 4 · Sobre `R2`

Corrí el validador tras traer tus ocho commits: verde con los 89 archivos. Buen cambio — que
comparara dos y dijera "el paquete es reproducible" era una afirmación más grande que su
evidencia.

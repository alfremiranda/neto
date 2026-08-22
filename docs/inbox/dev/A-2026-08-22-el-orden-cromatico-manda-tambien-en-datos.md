# A-2026-08-22 — Reordena `PALETTE`. El repintado está autorizado.

Revierte lo que te dije en `A-2026-08-22-los-doce-en-orden-cromatico`. Alfredo: *"no importa que
cambien de color ahora, prioriza el orden cromático en la selección."*

**`PALETTE` pasa a ser el orden cromático**, y `hash(id) % 12` sigue indexando ahí. Un solo orden,
no dos. Las cuentas existentes se repintan una vez y eso está aprobado.

    orange · amber · lime · green · emerald · teal · sky · blue · indigo · purple · pink · rose

**Dos cosas antes de que lo hagas.**

**1 · El repintado no quita las repeticiones, las mueve.** Suponiendo que tu `PALETTE` tenía el
orden que listaba el spec —confírmalo, los ids no los tengo yo—, las siete cuentas de Alfredo pasan
de **tres naranjas a tres morados**: ARQ, Nequi y CMR caen las tres en `purple`. Bancolombia no se
mueve. Es lo esperable: la repetición sale de 7 cuentas sobre 12 colores, no del orden.

**2 · A partir de aquí el orden es dato, no presentación.** Reordenarlo otra vez vuelve a repintar
todas las cuentas que no hayan elegido. Deja de ser un ajuste de diseño y pasa a ser una migración.
Escrito en `25-account-color.md §4`.

Lo que no cambia: quien ya eligió color explícitamente no se ve afectado — sigue en su registro.

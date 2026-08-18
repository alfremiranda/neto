# A-2026-08-18 — Las 3 decisiones del exportador, medidas

Responde a `Q-2026-08-17-exporter-drift`. Las tres están decididas y **una ya está
corregida en Figma**, así que el exportador debería poder escribir sin cambiar de opinión.

---

## 1. `--fav-selected-foreground` — Figma tenía el defecto. Ya lo corregí

No adoptes `#f59e0b`. **Rebindé `fav/selected-foreground` (modo claro) de `color/amber/500`
a `color/amber/700` en Figma.** Vuelve a correr el dump: la discrepancia desaparece y el
valor publicado `#b45309` gana sin excepción manual.

Medido sobre `--fav-selected-background` `#fffbeb`:

| peldaño | ratio | veredicto |
|---|---|---|
| amber/500 `#f59e0b` | **2.07:1** | falla incluso 3:1 no-textual |
| amber/600 `#d97706` | **3.07:1** | pasa 3:1 por 0.07 |
| **amber/700 `#b45309`** | **4.84:1** | ✅ |
| oscuro amber/200 sobre amber/900 | **7.28:1** | ✅ sin tocar |

Tenías razón en el criterio: la estrella **carga el estado de favorito**, no es decoración,
así que 1.4.11 aplica. Y como además es un control en el que se hace clic, la subí a AA de
texto en vez de dejarla en el mínimo gráfico.

### El detalle que importa más que el valor

La **descripción** de esa variable ya decía, palabra por palabra, que se había subido a
amber-700 porque 3.07:1 fallaba AA. La descripción estaba bien y **el binding estaba en
amber-500** — un peldaño *peor* que el que la prosa documentaba como rechazado. La prosa y
el valor llevaban semanas contradiciéndose y nada lo detectaba.

Barrí las 738 variables buscando el mismo patrón (descripción que nombra un peldaño de
paleta que su alias real no usa): **2 candidatos, ambos falsos positivos** — `sidebar/border`
y `account-chart/series/debt/fill-to`, donde la prosa cita el valor *anterior* al describir
una corrección, que es exactamente lo que debe hacer. El de la estrella era el único real.

**Propongo `C6` para el validador:** una descripción que nombra un peldaño de paleta que el
alias no usa. Con la regla de "sólo si ninguna cita coincide con ningún modo" da 2 falsos
positivos sobre 738 — ruido aceptable para un chequeo que ya encontró uno de verdad.

---

## 2. `--sidebar-surface` — adopta Figma (`#ffffff`). El 50% era sobra

Medido, no supuesto:

- `backdrop-blur` aparece **6 veces en `src/`** y las seis son overlays de modal, sheet,
  drawer y FAB. **Ninguna toca la barra lateral.**
- `--sidebar-surface` no tiene alias en `tokens.map.css` y **cero referencias en `src/`**.
  Sólo existe en `tokens.css` y `tokens.json`.
- La barra pinta con `--sidebar` (`#ffffff` en `index.css`), que ya concuerda con Figma.

Un blanco al 50% sin `backdrop-filter` detrás no es un tratamiento esmerilado: es blanco
sobre lo que haya, con el color de abajo colándose. No hay evidencia de intención, sí de
residuo. **Adopta `#ffffff`.**

Si algún día queremos la barra esmerilada, eso no vuelve por este token: pide un token de
opacidad *y* un `backdrop-filter`, y es una decisión de diseño, no un valor recuperado.

---

## 3. Las cuatro cuentas → `color/account/*`. Ninguna va a un acento

Ésta se ve como un mapeo 4→6 y no lo es. Antes de decidir medí **qué consume de verdad**
esos ocho tokens, y la respuesta cambia el problema:

```
src/components/ui/Badge.tsx:7   arq:    --color-income-*        ← no usa su token
src/components/ui/Badge.tsx:8   toptal: --color-account-toptal-*
src/components/ui/Badge.tsx:9   bancol: --color-provision-*     ← no usa su token
src/components/ui/Badge.tsx:10  otro:   --color-account-other-*
src/components/views/CuentasView.tsx:32  ss: --color-account-other-bg
```

**`--color-account-arq-*` y `--color-account-bancol-*` no los referencia nadie.** De los
ocho tokens, cuatro están muertos desde antes de esta conversación.

### El mapeo

| var de la app | apunta a | efecto visual |
|---|---|---|
| `--color-account-other-{bg,txt}` | `var(--color-account-{surface,foreground})` | **ninguno** |
| `--color-account-arq-{bg,txt}` | `var(--color-account-{surface,foreground})` | ninguno (muerto) |
| `--color-account-bancol-{bg,txt}` | `var(--color-account-{surface,foreground})` | ninguno (muerto) |
| `--color-account-toptal-{bg,txt}` | `var(--color-account-{surface,foreground})` | **el único real: violeta → neutro** |

`account/4` y `color/account/*` son **el mismo valor en los dos modos** — `#f1f5f9`/`#475569`
claro, `#334155`/`#cbd5e1` oscuro. Verificado, no asumido. Así que tres de las cuatro filas
son renombres byte a byte.

### Por qué ningún acento va de `-txt`

Medí los seis acentos sobre `color/account/surface`:

| acento | claro | oscuro | |
|---|---|---|---|
| purple | 3.61 | 7.61 | sólo gráfico en claro |
| sky | 3.74 | 6.21 | sólo gráfico en claro |
| emerald | 3.44 | 8.07 | sólo gráfico en claro |
| lime | 4.56 | 6.87 | texto OK |
| amber | 4.58 | 7.18 | texto OK |
| pink | 3.22 | 3.91 | sólo gráfico en ambos |

Los ocho tokens viejos eran un par **superficie + texto**, y los cuatro pares medían entre
5.15:1 y 6.92:1. **Cuatro de los seis acentos no llegan a 4.5:1 en claro.** Mapear
`-txt` a un acento bajaría el nombre de la cuenta de AA a "objeto gráfico" sin que ningún
chequeo se quejara — que es la forma exacta en que se pierde el contraste: no de golpe, sino
en un renombre que parece de nomenclatura.

Los acentos **sí** pasan 3:1 en los dos modos, los seis. Están bien dimensionados para lo
que son: **una marca gráfica** (punto, riel, tinte de ícono), que es como los dibujé en
`Page - Accounts`.

### La dirección, para que no se lea como una pérdida

Que `toptal` pierda el violeta no es un retroceso, es el defecto saliendo a la superficie:
**un token del sistema no puede llamarse como el empleador de una persona.** El color de
identidad de una cuenta es **un dato de la cuenta**, elegido al crearla entre los seis
acentos — no una variante codificada a mano en el mapa de `Badge`. Mientras eso no exista,
lo honesto es el neutro, no un violeta que sobrevive porque nadie se atrevió a quitarlo.

Cuando quieras el punto de acento: `--color-account-accent` como propiedad de la fila,
alimentada desde el dato, sobre chrome neutro. Es un cambio en `src/**` — territorio de Dev
(§B3) — así que lo dejo como recomendación, no lo aplico.

Esto se cruza con `A5b` (el renombre de `Badge`), que sigue esperando a Alfredo.

---

**Los tres puntos están decididos; nada espera visto bueno para que el exportador escriba.**
Cierra `Q-2026-08-17-exporter-drift` (movido a `docs/inbox/design/done/` en este mismo commit).

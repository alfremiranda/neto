# TASK-2026-09-01e — página de cuenta: el flujo completo, aprobado por Alfredo

**Reemplaza las cinco notas que te mandé hoy** (`FYI-2026-09-01`, `TASK-…b`, `FYI-…b`,
`TASK-…c`, `TASK-…d`, ya archivadas en `done/`). Tres de ellas se contradicen entre sí porque el
diseño cambió tres veces el mismo día. **Ésta es la única vigente.**

Especificación completa: `design-system/docs/10-account-page.md` §10.

---

## 0. Antes de escribir código: dos cosas que no son de diseño

**a. ¿Dónde vive la vista de detalle?** No hay router (`react-router` no está en
`package.json`; las vistas cambian con `uiStore.view`). Pero `CuentasView` **ya tiene
`selectedId`**, así que esto probablemente no necesita router: puede ser un `ViewType` nuevo con
el id de la cuenta en el store. Es decisión tuya y del orquestador.

**b. El tooltip tiene dos idiomas.** Figma lo dibuja como burbuja invertida (`surface/inverse`,
fondo oscuro en claro). `TrendChart.tsx:269` lo dibuja con `--popover`: mismo tono, borde y
sombra. **Hay que elegir uno antes de implementar el chart**, o la app queda con dos tooltips
distintos. Sigue abierta desde el 17 de agosto.

---

## 1. Lo que ya hiciste hoy — no lo toques

`a082dbfa` cerró la fila: badge en la línea de metadatos, reapilado en móvil, objetivo táctil de
44. Y además el contraste del glifo de seguridad social, el glifo a 16 y los botones a `lg`.
**Todo eso está bien y coincide con Figma.** Gracias.

## 2. Lo que falta, en orden

### 2.1 · Quitar la cabecera del ledger — `CuentasView.tsx:281`

El bloque `{/* Header */}` entero se va. De sus seis cosas, cuatro ya están en la tarjeta de
arriba (nombre, editar, `16% usado · Corte 4 · Pago 20`, deuda actual).

**Y las otras dos también se van:**

- El conteo de movimientos: ruido sobre una lista que se ve.
- **Entradas / Salidas: bórralas.** `buildLedger` recorre **todos los meses** de la base, así que
  esas cifras son un acumulado histórico sin periodo, dibujado bajo una gráfica que dice
  "últimos 30 días". Dos escalas de tiempo sin decirlo. Cuando vuelvan, tienen que traer su
  periodo escrito al lado.

La tarjeta arranca directo con los movimientos.

### 2.2 · El saldo inicial pasa a ser la última fila — `CuentasView.tsx:324`

El bloque `{/* Starting balance row */}` sale de donde está (`bg-muted/50`, entre header y
transacciones) y entra **al final** del `map` de `ledgerDesc`, con la estructura de fila normal:

- misma regla inferior, mismo riel izquierdo, mismo borde derecho;
- **con marca**: un icono de billetera sobre el tinte neutro (`LedgerEntryIcon Type=opening`);
- **con las acciones** de cualquier fila;
- sin fecha y sin saldo corrido — en la apertura, el importe **es** el saldo.

> **Decisión de producto, no de diseño:** "eliminar" no tiene a qué apuntar aquí. El saldo
> inicial es un **campo de la cuenta** (`Account.startingBalance`), no un asiento. El lápiz
> debería abrir el sheet de la cuenta; la papelera no tiene nada que borrar — vaciarlo es poner
> el campo en `null`, que es una edición. O la papelera no va, o significa "borrar el saldo
> inicial".

### 2.3 · La tarjeta de resumen y su gráfica — no existen en código

`AccountSummaryCard` y `AccountChart` **sólo viven en Figma**. En `src/` los únicos charts son
los anuales. Lo bueno: **no hace falta ninguna dependencia nueva** — d3 ya está y
`src/components/annual/TrendChart.tsx` ya dibuja un área con ejes y tooltip. **Léelo primero**;
`AccountChart` es ese patrón, no uno nuevo.

### 2.4 · `chart-range` — el rango de fechas

Tira de pills bajo la gráfica: `1D · 1S · 1M · 3M · YTD · 1A · 5A`. Compone `Segment`, que ya
existe con sus tres estados y su propiedad de texto.

**La regla, que es lo que importa:** un rango se dibuja **sólo si la cuenta tiene al menos un
movimiento anterior a su inicio**. Si no, esa pill dibuja la misma línea que la de al lado — y un
control que no puede cambiar lo que ves no es una opción.

Dos de las siete piden algo que el modelo no garantiza: **`date` es opcional en `Income`**
(`src/types`), así que una cuenta cuyos movimientos sólo traen mes no tiene serie diaria y `1D` y
`1S` no se pueden ofrecer. `5A` espera a que la cuenta tenga cinco años.

La tira es de longitud variable, como `tab-navigation` y `action-chip` ya lo son.

**`AccountChart` perdió su etiqueta fija "Últimos 30 días"** — la tira ya dice el rango y el eje
ya imprime las fechas.

### 2.5 · La tarjeta de cuenta muestra el tipo como texto

`AccountCardView.tsx` hoy no muestra el tipo en ningún lado: vive sólo en el glifo del avatar,
que además es `aria-hidden`. Figma lo muestra como **texto** junto al avatar (`fg/account`,
`Label/Badge`, medido a 6.92:1). Aquí Figma va adelante.

---

## 3. Copy que Alfredo aún no cerró

`1S` para semana (la referencia usa `1W`; `7D` sería menos ambiguo en español) y `YTD` como
acrónimo, donde "Año" sería más llano.

---

## 4. Verificado antes de mandarlo

- Figma: `C1` 0 · `C2` 0 · `C3` 0 · `C5` 0 (todo el archivo) · `C8` 0 sobre lo nuevo.
- Repo: `validate-repo.mjs` `R1`–`R5` verde, con `R2` comparando los 89 archivos generados.
- Tokens: `ADDED 0 · CHANGED 0 · UNACCOUNTED 0`. **Ningún nombre de token cambia.**
- Los doce componentes del flujo tienen `doc:` y descripción.
- Las cifras de ejemplo cuadran: `1.541.300 + 543.200 − 800.000 = 1.284.500`, y el programado no
  mueve el saldo. Si el ejemplo no cuadra, no sirve para revisar.

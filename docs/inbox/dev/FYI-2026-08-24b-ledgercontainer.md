# FYI-2026-08-24b — `LedgerContainer`: la página de cuenta deja de pedir prestado el contenedor

Las dos pantallas de cuenta ya no usan `IncomeContainer`. Hay un componente propio.

## Por qué no servía el prestado

`IncomeContainer` **es la pestaña de Ingresos de la vista Mes**: abre con un ícono y el título
"Ingresos del mes" y cierra con un bruto mensual convertido con la TRM. Un ledger no tiene ni lo
uno ni lo otro — la cuenta *es* el título, y el número que importa es el saldo corrido, no una
suma del mes.

Y como su cabecera no podía llevar la cuenta, la página **decía el nombre de la cuenta dos
veces**: una en la tarjeta de arriba y otra en el título prestado.

## Qué lleva el nuevo

Cuatro cosas que el prestado no tenía, y que tu `CuentasView.tsx` **ya dibuja**:

1. **Identidad en la cabecera** — nombre de la cuenta + botón de editar, el conteo de movimientos
   y la línea de detalle de tarjeta (`16% usado · Corte 4 · Pago 20`).
2. **Entradas y Salidas como par**, para que el saldo de al lado se pueda comprobar en vez de
   creer.
3. **Franja de saldo inicial** — un saldo corrido no significa nada sin el número del que partió.
4. **Filas separadas por una regla, no por un hueco.** Un ledger es una tabla; los huecos entre
   filas se leen como tarjetas sueltas.

## Ejes

- `Device` — **Desktop | Mobile**. Móvil oculta el par Entradas/Salidas y deja que la cabecera se
  apile, que es lo que hace tu `hidden sm:flex`.
- `Balance` — **Deuda | Saldo**. Es **variante y no un texto sobrescrito** a propósito: la tarjeta
  de crédito además de decir "Deuda actual" pinta el valor con `fg/expense`. Un color no se puede
  llevar sobrescribiendo una cadena.
- `Show Opening Balance` — booleano, para las cuentas sin saldo inicial configurado.
- `Rows` — **slot** que sólo acepta `ledger-itemrow`.

## Dos detalles que te afectan

- **`ledger-itemrow` ahora dibuja su propia regla inferior**, como tu `border-b`. La última fila
  la lleva apagada a mano: CSS tiene `last:border-0` y Figma no tiene selector de último hijo. Si
  cambias el número de filas en Figma, hay que volver a apagarla.
- Las cifras de ejemplo **cuadran**: `1.541.300 inicial + 543.200 salidas − 800.000 entradas =
  1.284.500`, y el programado no mueve el saldo. Un contenido de ejemplo que no cuadra no sirve
  para revisar nada.

## Sigue abierto

La pantalla todavía tiene la `AccountSummaryCard` encima del ledger, así que el nombre de la
cuenta aparece dos veces. Eso ya no es culpa del contenedor — es una decisión de composición de
pantalla, y no la tomé yo solo. Tu código no tiene esa tarjeta.

`R1`–`R5` verde. Figma: `C1` 0 · `C2` 0 · `C3` 0 · `C5` 0 · `C8` 0 sobre lo nuevo. Ningún nombre
de token cambia.

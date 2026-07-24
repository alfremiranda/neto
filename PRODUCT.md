# Neto — Documento de producto

> Contexto de **producto y negocio**. Para stack, convenciones de código y ambientes, ver [CLAUDE.md](./CLAUDE.md).

---

## 1. Qué es Neto

Planeador financiero personal (PWA) para un **trabajador independiente colombiano que factura en USD** y tiene obligaciones en COP.

El problema que resuelve: quien factura por prestación de servicios no tiene retención automática ni un empleador que aporte a seguridad social. Debe **calcular, apartar y pagar** por su cuenta salud, pensión, ARL, retención en la fuente, y provisionar lo que un empleado recibiría (primas, cesantías, vacaciones). A eso se suma vivir en dos monedas: ingresos en USD, gastos y obligaciones en COP, con una TRM que cambia.

Neto responde: **“de lo que facturé este mes, ¿cuánto es realmente mío?”** — el *neto libre*.

**Usuario objetivo:** independiente / freelancer colombiano con ingresos en divisa. El producto también soporta empleados y perfiles mixtos (ver §8).

**Principios:**
- **Local-first**: todo funciona sin conexión; la nube es respaldo y sincronización, no dependencia.
- **El mes es la unidad de trabajo**; el año es analítica.
- **Adaptativo**: si no tienes obligaciones tributarias, esa complejidad desaparece de la interfaz.
- **Nada se pierde**: la sync fusiona por entrada, no sobreescribe.

---

## 2. Modelo mental

| Concepto | Qué es |
|---|---|
| **Mes** | Unidad contenedora. Cada mes (`YYYY-MM`) guarda sus ingresos, gastos, movimientos y su TRM. Las entradas se archivan por **su fecha**, no por el mes que estés viendo. |
| **Ingreso** | Entrada de dinero. `servicios` (cuenta para el IBC) u `otro` (no cuenta). |
| **Gasto** | Salida del mes. Categorizado, opcionalmente recurrente y/o programado a futuro. |
| **Movimiento** | Transferencia entre cuentas propias. No es gasto ni ingreso: reubica dinero. Incluye pagos de tarjeta y aportes a ahorro. |
| **Cuenta** | Dónde vive el dinero: bancaria, efectivo, crédito o ahorro. |
| **Deducción** | Regla configurable que calcula un monto sobre una base (obligaciones y provisiones). |
| **Neto libre** | Bruto − obligaciones − provisiones − gastos. La cifra que da nombre al producto. |

---

## 3. Estructura del producto

Cinco superficies (la navegación expone cuatro; Configuración y Perfil viven en el menú de cuenta):

| Vista | Propósito |
|---|---|
| **Resumen** (dashboard) | Saludo, cuentas favoritas, resumen anual (dona + KPIs), tendencia 8 meses, gastos por categoría, export CSV. |
| **Mes** | Operación diaria. Resumen fijo arriba (KPIs + barra de distribución) y **tabs**: Ingresos · Gastos · Movimientos · Tributarias\* · Provisiones\*. |
| **Cuentas** | Cuadrícula de cuentas + libro de movimientos (ledger) de la seleccionada. |
| **Ahorros** | Total ahorrado y aportes por cuenta de ahorro/CDT/inversión. |
| **Configuración / Perfil** | Editor de deducciones, sync, nombre, monedas, sesión. |

\* Tabs condicionales: solo aparecen si el usuario tiene ese grupo de deducciones habilitado.

**Navegación:** sidebar colapsable (desktop) / bottom tab bar (mobile). Header con chip de TRM en vivo, campana de notificaciones, toggle de tema y menú de cuenta. Navegador de mes sticky en la vista Mes. FAB con speed-dial en mobile; popover “Agregar” en desktop.

---

## 4. Funcionalidades

### 4.1 Ingresos
- Descripción, moneda (USD/COP), monto, cuenta, tipo (`servicios`/`otro`), fecha.
- Toggle **“Aplicar provisiones”** (solo para `servicios`): decide si el ingreso entra a la base de primas/cesantías/vacaciones.
- Seleccionar una cuenta de otra moneda **auto-corrige la moneda** del formulario.
- La tarjeta lista los ingresos con badge de cuenta, marca “sin prov.” cuando aplica, y un total bruto equivalente en COP con la TRM del mes.

### 4.2 Gastos
- **14 categorías**: Vivienda, Alimentación, Deudas y Crédito, Salud, Movilidad, Conectividad, Entretenimiento, Trabajo, Personas, Seguros, Viajes, Impuestos, Compras, Otros.
- **Recurrente**: se copia automáticamente al mes siguiente (día preservado, ajustado al último día si el mes es más corto) y llega marcado **sin confirmar** para que verifiques el monto.
- **Programado** (fecha futura): se muestra pero **no suma** al total del mes ni afecta saldos hasta que llega la fecha.
- Cuenta que paga (opcional) — vincula el gasto al saldo de esa cuenta.
- **Navegación por categorías**: chips con conteo, solo de categorías con datos ese mes. Orden (5 criterios) y filtros por cuenta y fecha.
- **Barra de distribución por categoría** (en “Todos”, sin filtros) con porcentajes y montos.
- No hay búsqueda de texto libre; el filtrado es por categoría, cuenta y fecha.

### 4.3 Movimientos
- Transferencia entre dos cuentas propias, con conversión USD↔COP.
- **Calculadora de TRM efectiva**: si declaras el monto realmente recibido, muestra la TRM efectiva vs la oficial y la **diferencia (fee implícito)** en monto y porcentaje.
- Atajo “Todo →” para mover el saldo completo; previsualización de saldos antes/después.
- Valida saldo suficiente en origen (las **tarjetas de crédito están exentas**: pueden endeudarse más).
- Crear un movimiento con TRM actualiza la TRM del mes.

### 4.4 Cuentas
Cuatro tipos, cada uno con su semántica:

| Tipo | Campos propios | Comportamiento |
|---|---|---|
| **Cuenta** bancaria | número, tasa anual | Muestra rendimiento estimado `≈ $X/mes · N% a.a.` |
| **Efectivo** (bolsillo) | — | Sin número ni tasa. La cuenta “Efectivo” por defecto es de sistema: no se puede eliminar ni renombrar. |
| **Crédito** (tarjeta) | cupo, día de corte, día de pago | El saldo se guarda como **deuda negativa**; la UI muestra cupo, deuda, % usado y fechas. Las compras son gastos a la tarjeta (suben deuda); los pagos son movimientos desde otra cuenta (la bajan). |
| **Ahorro** | subtipo (Cuenta/CDT/Inversión), vencimiento (CDT), rendimiento E.A. | Únicas visibles en la vista Ahorros. Los CDT muestran cuenta regresiva de vencimiento. |

- **Favoritos**: se fijan como tarjetas compactas en Resumen y aparecen primero en todos los selectores.
- **El tipo se bloquea después de crear** la cuenta (para reclasificar hay que recrearla).
- **Ledger por cuenta**: histórico cronológico cross-mes con saldo corriente, entradas/salidas, saldo (o deuda) actual, y estados “Programado”. Los programados no mueven el saldo ni los totales.

### 4.5 Ahorros e inversiones
- **Total ahorrado** convertido a tu moneda principal.
- Aportes = movimientos hacia cuentas de ahorro (no son gastos: no reducen el neto libre).

### 4.6 Obligaciones tributarias
- Salud, Pensión, ARL sobre el IBC + Retención en la fuente sobre el bruto.
- Muestra el IBC y si viene del 40% de servicios o del piso SMMLV.
- **FSS (Fondo de Solidaridad)** se inyecta automáticamente cuando el IBC ≥ 4 SMMLV, con su tabla de rangos y referencia legal (Ley 100 de 1993, art. 25).
- **Calendario de pago de SS**: tabla de los 15 rangos de últimos dígitos de cédula/NIT con las **fechas hábiles calculadas** del mes de pago.

### 4.7 Provisiones
Primas (8.33%), Cesantías (8.33%) y Vacaciones (4.17%) sobre el ingreso bruto con provisiones activadas. Son configurables y se pueden agregar provisiones propias.

### 4.8 Analítica
- **KPIs del mes**: Ingreso bruto · O. Tributarias\* · Provisiones\* · Gastos · Neto libre. Cada uno con desglose en tooltip y **click para saltar a su tab**.
- **Barra de distribución** del bruto (obligaciones / provisiones / gastos / neto).
- **Resumen anual**: dona interactiva de composición del bruto (al tocar un segmento el centro muestra ese monto) + KPIs anuales.
- **Tendencia**: barras apiladas de los últimos 8 meses; click en una barra navega a ese mes.
- **Gastos mensuales por categoría** con línea de promedio, y **ranking de gastos por categoría** del año.
- **Export CSV** anual (compatible con Excel).

### 4.9 Notificaciones
Derivadas de gastos **con fecha y sin confirmar** (típicamente recurrentes recién sembrados). Se agrupan en **Vencidos / Vence hoy / Próximos (7 días)**. El badge solo cuenta vencidos + hoy. Tocar un ítem lleva a su mes y abre el gasto para confirmarlo. Son in-app; no hay notificaciones push.

### 4.10 Onboarding
Asistente de 5 pasos: bienvenida → **moneda principal y secundaria** → **cuentas** (Efectivo incluido siempre; se pueden agregar bancarias y tarjetas con cupo/deuda/fechas) → **perfil de trabajo** → listo. Cada paso se puede omitir.

---

## 5. Reglas de negocio

```
IBC          = max(40% × ingresos "servicios" del mes, SMMLV del año)
               (si no hay ingresos de servicios ⇒ SMMLV, el piso legal)

Salud        = 12.5%  × IBC
Pensión      = 16%    × IBC
ARL          = 0.522% × IBC
FSS          = 1% – 2% × IBC, por rangos, solo si IBC ≥ 4 SMMLV
Retención    = 20% × bruto

Base prov.   = Σ ingresos con "aplicar provisiones"     ← el bruto, NO bruto − IBC
Primas       = 8.33% × base
Cesantías    = 8.33% × base
Vacaciones   = 4.17% × base

Gastos       = Σ gastos, excluyendo ahorros y los de fecha futura
               (mismo criterio en las cifras mensuales y anuales)
Neto libre   = bruto − obligaciones − provisiones − gastos
```

**Rangos FSS** (sobre `IBC / SMMLV`): ≥4 → 1% · ≥16 → 1.2% · ≥17 → 1.4% · ≥18 → 1.6% · ≥19 → 1.8% · ≥20 → 2%.

**SMMLV** (constante legal, no editable): 2024 = 1.300.000 · 2025 = 1.423.500 · 2026 = 1.750.905.

**Saldo de cuenta** = saldo inicial + ingresos − gastos ± movimientos, acumulado sobre todos los meses, convirtiendo con la TRM de cada mes. **Los gastos programados se excluyen** hasta su fecha.

**Tarjeta de crédito**: `deuda = max(−saldo, 0)`, `disponible = cupo − deuda`, `uso = deuda / cupo`.

**TRM**: la TRM **del mes** manda para todos los cálculos (estabilidad histórica). La TRM en vivo (Banco de la República, con fallback) es **informativa**: se muestra en el header, se ofrece en movimientos y se usa para equivalencias USD en obligaciones/provisiones.

---

## 6. Sistema de deducciones

Motor configurable: cada deducción tiene `label`, `group` (ss / provision), `base`, porcentaje o monto, y **meses en que aplica**.

| Base | Cálculo |
|---|---|
| `ibc` | % sobre el IBC |
| `bruto` | % sobre el ingreso bruto |
| `neto_ibc` | % sobre la base de provisiones (etiquetada “Ingreso bruto”)¹ |
| `fixed_cop` | Monto fijo en COP |
| `fixed_usd` | Monto fijo en USD × TRM |
| `base_usd` | % sobre un ingreso fijo en USD × TRM |

¹ El identificador `neto_ibc` es histórico: originalmente era `bruto − IBC`. Se cambió porque el piso SMMLV del IBC anulaba la base para ingresos bajos. La clave interna se conserva para no migrar configuraciones guardadas.

Las obligaciones (salud, pensión, ARL, retención) son **de sistema**: se pueden activar/desactivar y ajustar, pero no eliminar. Las provisiones sí se pueden crear y eliminar.

---

## 7. Datos, persistencia y sincronización

- **Local**: `localStorage`. Claves: `amd-finance` (datos financieros + control de sync), `neto-settings` (deducciones, nombre, monedas), `neto-ui` (vista, sidebar), `neto-theme`, `neto-trm-live`.
- **Nube**: Supabase, tabla `months` con una fila por mes (más una fila `_settings`) por usuario.
- **Auth**: OAuth con GitHub o Google.
- **Sync automática** (solo producción): push confiable tras cada mutación con cola de reintento; pull al abrir la app y al enfocar/reconectar.
- **Merge por entrada**: las listas del mes se **unen por id**; gana la edición más reciente por entrada; los borrados se propagan con *tombstones*. Los dispositivos convergen solos sin perder datos.
- Los escalares del mes (TRM) y `_settings` se resuelven por último-en-escribir.
- **Migraciones versionadas** del esquema (v1–v5), que corren tanto en local como sobre datos traídos de la nube. La más relevante (v5) convirtió los “ahorros voluntarios” —que se contaban doble— en cuentas de ahorro + movimientos.

---

## 8. Perfiles de usuario

En el onboarding se elige cómo trabajas, y eso define qué complejidad se muestra:

| Perfil | Efecto |
|---|---|
| **Empleado** | Desactiva obligaciones y provisiones. La app queda como un gestor simple de ingresos/gastos/cuentas: sin tabs Tributarias y Provisiones, sin esos KPIs, sin barra de distribución. |
| **Independiente** (default) | Todo activo. |
| **Ambos** | Todo activo; se sugiere marcar el salario como ingreso tipo “otro” para excluirlo de los aportes. |

Se puede cambiar en cualquier momento desde el editor de deducciones. Las vistas anuales **conservan los datos históricos** aunque se desactive un grupo, para no borrar cifras reales del pasado.

---

## 9. Plataforma

- **PWA** instalable (iOS/Android) con service worker, precache y funcionamiento offline.
- **Responsive con patrones distintos**, no solo reflow: bottom nav + FAB + bottom sheets + filas que se tocan para editar en mobile; sidebar + popovers + paneles laterales + acciones inline en desktop.
- **Tema claro/oscuro** con preferencia del sistema.
- **Pull-to-refresh** en mobile para forzar sincronización.
- Español (Colombia) en toda la interfaz; formatos de moneda es-CO.
- Servida desde dominio propio: **https://netofinanzas.app** (GitHub Pages con dominio personalizado).

---

## 10. Evolución del producto

Sin versionado semántico formal; el producto avanza por hitos (246 commits desde 2026-06-12):

| Fecha | Hito |
|---|---|
| **Jun 12** | Base: egresos editables, movimientos entre cuentas, TRM en vivo, resumen anual, capa Supabase. |
| **Jun 15** | Migración completa a React + Vite + TypeScript. |
| **Jun 16–17** | Motor de deducciones configurable (bases, meses), saldos iniciales, sidebar con tooltips. |
| **Jun 18** | Rediseño mobile-first: bottom drawers, touch targets, layout responsive. |
| **Jun 22** | **PWA completa** + **auth con GitHub/Google** + sync por usuario. Rediseño de UI. |
| **Jun 23–24** | Ambientes dev/prod separados, tokens de diseño de Figma, detalle de cuenta, borrar desde los sheets. |
| **Jun 25** | Auto-push en cada mutación y pull-to-refresh. Gráfica de gastos por categoría. |
| **Jun 26** | **Onboarding**, Dashboard con cuentas, FAB con speed-dial, perfil y preferencias de moneda, microinteracciones. |
| **Jul 1–3** | FSS, splash + skeletons, gastos programados. |
| **Jul 13** | **Adaptación por perfil** (empleado/independiente), SMMLV como constante legal, **tarjetas de crédito**, **capítulo Ahorros e Inversiones** (CDT/inversión). |
| **Jul 14** | Favoritos, **notificaciones de pagos**, rediseño de chips de categoría, “Egresos” → **“Gastos”**, month nav sticky, carruseles de cuentas, **dona anual interactiva**. |
| **Jul 21–22** | **Sync robusta**: pull al abrir/enfocar, cola de reintento y **merge por entrada con tombstones**. Base de provisiones corregida al bruto. **Navegación por tabs en la vista Mes.** |

---

## 11. Estado actual y deuda conocida

**Código muerto: eliminado (2026-07-22).** Se retiró todo lo que había quedado sin punto de entrada tras sucesivos rediseños: la vista “Año” independiente, los sheets de detalle de cuenta y de saldo inicial (su función la cubre el ledger de Cuentas y el campo “Saldo inicial” del editor), la tarjeta de “Flujo recomendado”, gráficas y modales reemplazados, las herramientas de mantenimiento de datos (reset/deduplicar/wipe+push, con fixtures personales embebidos), el ajuste `ssAccount` que nadie leía, y los cálculos legacy `calcSS`/`calcDistribucion`/`calcFlujo`. Si algo de esto se necesita, está en el historial de git.

**Limitaciones conocidas:**
- La navegación de meses con flechas **no cruza el año** (ene–dic).
- `_settings` (que incluye las cuentas) se sincroniza por último-en-escribir: editar cuentas en dos dispositivos a la vez puede perder un lado. Las listas del mes sí hacen merge por entrada.
- No hay búsqueda de texto en gastos.
- No hay notificaciones push del sistema operativo.
- Las cuentas de **ahorro no se pueden crear durante el onboarding** (solo después).

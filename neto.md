# Neto — Qué puedes hacer con la app

> Guía de producto, en lenguaje de usuario: **qué hace Neto hoy y para qué te sirve.**
> (Para reglas de negocio detalladas y contexto técnico, ver [PRODUCT.md](./PRODUCT.md).)

---

## Qué es Neto

Neto es un **planeador financiero personal** para independientes colombianos que **facturan en dólares** y tienen obligaciones en pesos.

Resuelve una pregunta concreta que un empleado no tiene que hacerse, pero un independiente sí:

> **"De lo que facturé este mes, ¿cuánto es realmente mío?"**

Cuando trabajas por prestación de servicios, nadie te retiene ni aporta por ti: tú mismo calculas, apartas y pagas salud, pensión, ARL, retención en la fuente, y provisionas lo que un empleado recibe (primas, cesantías, vacaciones). Encima vives en dos monedas y con una TRM que cambia. Neto hace esa cuenta por ti y te muestra tu **neto libre** — la plata que de verdad queda disponible.

**Funciona también para empleados y perfiles mixtos:** si no tienes obligaciones tributarias, esa complejidad simplemente desaparece de la pantalla.

---

## Entrar y tu privacidad

- **Inicias sesión con GitHub o Google** — sin contraseñas que recordar; Neto nunca ve tu clave.
- La primera vez te pedimos aceptar una **política de privacidad clara** (disponible siempre, incluso antes de entrar, en **netofinanzas.app/privacidad.html**). Explica qué datos se usan y para qué, sin lenguaje confuso.
- **Tus datos son tuyos:** viven principalmente en tu dispositivo y se respaldan de forma privada en la nube para que los tengas en todos tus equipos. Solo tú accedes a tu información.
- **Funciona sin conexión.** La app abre y opera completa offline; la nube es respaldo, no requisito.

---

## La primera vez (onboarding)

Un asistente de pocos pasos te deja listo:

1. **Bienvenida.**
2. **Monedas** — tu moneda principal y una secundaria.
3. **Cuentas** — arrancas con "Efectivo" y puedes agregar bancarias y tarjetas de crédito (con cupo, día de corte y de pago).
4. **Tu perfil de trabajo** — empleado, independiente o ambos. Esto ajusta cuánta complejidad ves.
5. **Listo.**

Cada paso se puede omitir y todo se puede cambiar después.

---

## Tu día a día: la vista **Mes**

El mes es la unidad de trabajo. Arriba tienes un resumen fijo con tus cifras clave y una barra que muestra cómo se reparte tu ingreso; abajo, pestañas para operar:

- **Ingresos** · **Gastos** · **Movimientos** · **Tributarias**\* · **Provisiones**\*

\* Las dos últimas solo aparecen si te aplican (según tu perfil).

Cada entrada se archiva por **su fecha real**, no por el mes que estés mirando — así nada queda en el mes equivocado.

### Registrar ingresos
- Descripción, monto, moneda (USD/COP), cuenta, tipo (**servicios** cuenta para tus aportes; **otro** no), y fecha.
- Un interruptor **"Aplicar provisiones"** decide si ese ingreso entra a la base de primas/cesantías/vacaciones.
- Si eliges una cuenta en otra moneda, el formulario **corrige la moneda solo**.
- La lista te muestra cada ingreso con su cuenta y un total bruto equivalente en pesos con la TRM del mes.

### Registrar gastos
- **14 categorías** (Vivienda, Alimentación, Deudas y Crédito, Salud, Movilidad, Conectividad, Entretenimiento, Trabajo, Personas, Seguros, Viajes, Impuestos, Compras, Otros).
- **Gasto recurrente:** se copia solo al mes siguiente, y llega marcado **"sin confirmar"** para que verifiques el monto (por si cambió).
- **Gasto programado** (fecha futura): aparece pero **no suma** al mes ni afecta saldos hasta que llega su fecha.
- Puedes vincular el gasto a la **cuenta que lo paga**.
- Filtras y ordenas por categoría, cuenta y fecha, con chips que muestran cuánto llevas en cada categoría y una barra de distribución con porcentajes.

### Mover dinero entre cuentas (Movimientos)
- Transfiere entre tus propias cuentas, con conversión **USD ↔ COP**.
- **Calculadora de TRM efectiva:** si anotas cuánto recibiste de verdad, te muestra la TRM real vs la oficial y el **"fee" implícito** (en monto y en %). Ideal para saber cuánto te cobró el cambio.
- Atajo **"Todo →"** para mover el saldo completo, con vista previa de saldos antes y después.
- Un movimiento no es gasto ni ingreso: solo reubica tu plata (incluye pagar tarjetas y aportar a ahorros).

---

## Tus cuentas

Cuatro tipos, cada uno con su lógica:

| Tipo | Para qué | Qué muestra |
|---|---|---|
| **Bancaria** | Tu banco | Rendimiento estimado (`≈ $X/mes · N% anual`) |
| **Efectivo** | Plata en el bolsillo | Simple, sin número ni tasa |
| **Crédito** (tarjeta) | Tarjetas | Cupo, deuda, % usado, día de corte y de pago |
| **Ahorro** | Ahorros/CDT/inversión | Rendimiento; los CDT muestran cuenta regresiva al vencimiento |

- **Favoritos:** fija tus cuentas más usadas como tarjetas compactas en el Resumen y de primeras en los selectores.
- **Ledger por cuenta:** el histórico cronológico de cada cuenta (cruzando meses) con saldo corriente, entradas/salidas y saldo o deuda actual.
- Con **tarjetas de crédito**: las compras suben la deuda, los pagos (movimientos desde otra cuenta) la bajan; ves cupo disponible y uso.

---

## Ahorros e inversiones

- **Total ahorrado** convertido a tu moneda principal.
- Ves los aportes por cada cuenta de ahorro/CDT/inversión.
- Aportar a ahorros **no reduce tu neto libre** — es tu plata cambiando de lugar, no un gasto.

---

## Si eres independiente: obligaciones y provisiones

Neto calcula automáticamente lo que te toca apartar y pagar:

- **Salud, Pensión y ARL** sobre tu IBC, y **Retención en la fuente** sobre el bruto. Te muestra el IBC y de dónde salió (del 40% de tus servicios o del piso legal SMMLV).
- **Fondo de Solidaridad (FSS)** se agrega solo cuando corresponde (IBC alto), con su tabla y referencia legal.
- **Calendario de pago de seguridad social:** la tabla con las **fechas hábiles** según los últimos dígitos de tu cédula/NIT — para que no se te pase.
- **Provisiones:** primas, cesantías y vacaciones calculadas sobre tus ingresos con provisiones activadas. Configurables, y puedes agregar las tuyas.

Todo esto es un **motor de deducciones configurable**: puedes activar, desactivar y ajustar cada regla, y crear provisiones propias.

---

## Ver el panorama: **Resumen**

- **KPIs del mes:** Ingreso bruto · Obligaciones · Provisiones · Gastos · **Neto libre**. Cada uno con su desglose, y tocarlo te lleva a su pestaña.
- **Dona anual interactiva:** la composición de tu año; al tocar un segmento, el centro muestra ese monto.
- **Tendencia de 8 meses** en barras; toca una para saltar a ese mes.
- **Gastos por categoría** con promedio, y ranking de gastos del año.
- **Exportar a CSV** (compatible con Excel) para tu contador o tus propias cuentas.

---

## Recordatorios

Neto te avisa (dentro de la app) de los **gastos con fecha que aún no confirmas** — típicamente los recurrentes recién sembrados. Se agrupan en **Vencidos / Vence hoy / Próximos 7 días**, y tocar uno te lleva a confirmarlo. *(Aún no hay notificaciones del sistema operativo — eso llega más adelante.)*

---

## Se adapta a cómo trabajas

En el onboarding (o cuando quieras) eliges tu perfil, y la app se simplifica sola:

| Perfil | Qué ves |
|---|---|
| **Empleado** | Un gestor simple de ingresos, gastos y cuentas — sin obligaciones ni provisiones. |
| **Independiente** | Todo activo (el modo completo). |
| **Ambos** | Todo activo; puedes marcar tu salario como ingreso "otro" para excluirlo de los aportes. |

Cambiar de perfil **no borra tu historial**: las cifras pasadas se conservan aunque desactives un grupo.

---

## En todos tus dispositivos

- **Sincronización automática** (invisible): lo que registras en el celular aparece en el computador y viceversa, al abrir la app o al volver a ella.
- **Nada se pierde:** si editas en dos dispositivos, Neto **fusiona por entrada** en vez de sobreescribir — los datos convergen solos.
- **Pull-to-refresh** en móvil para forzar la sincronización cuando quieras.

---

## Detalles que hacen la vida fácil

- **Instalable como app** (PWA) en iOS y Android, con ícono propio y funcionamiento offline.
- **Tema claro/oscuro** que sigue tu sistema.
- **TRM en vivo** (Banco de la República) en el encabezado, para referencia — aunque los cálculos usan la TRM que fijas para cada mes, para que tu historial no cambie retroactivamente.
- Todo **en español (Colombia)**, con formatos de moneda locales.
- Vive en su propio dominio: **[netofinanzas.app](https://netofinanzas.app)**.

---

## Lo que aún no hace (para que sepas qué esperar)

- No hay **notificaciones push** del sistema operativo (los recordatorios son dentro de la app). *En camino.*
- No hay **búsqueda de texto** en gastos (filtras por categoría, cuenta y fecha).
- Las flechas de mes **no cruzan de diciembre a enero** de otro año.
- Las **cuentas de ahorro se crean después** del onboarding, no durante.
- **Eliminar tu cuenta** hoy es por correo (**privacidad@netofinanzas.app**); el botón de autoservicio llega más adelante.

---

*Neto está en evolución activa. Esta guía refleja lo que la app hace hoy.*

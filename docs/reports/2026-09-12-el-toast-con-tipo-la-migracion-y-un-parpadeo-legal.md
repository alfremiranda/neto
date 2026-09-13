# 2026-09-12 — El toast dice de qué tipo es, la app se muda, y una pantalla legal que parpadeaba

Commits: `89c02feb`, `aa952a75`, `6a39e5ca`, `df6d4fbc`, `d92f4c02`, `c56d45ef`, `92c7723c`,
`c0e73011`, `b291afd4`, `733554b9`, `0476c71b`, `f40d885a`, `1dd09c00`, `3b25c20c`, `033ab883`,
`b140446d`, `59f8b600`, `f2734bef`, `ed6f8c12`, `d1098832`, `e71f214f`, `109b2b6e`, `ac5b9561`,
`9c5aefad`, `f118cbdf`, `e238a0f6`, `81c0c035`, `4be98ba0`, `b0a05ced`, `408e8089`.

## DID

El encabezado de la cuenta contra Figma. Las tres gráficas anuales. `PRODUCT.md` deja de declarar
una vista retirada. Dos pasadas medidas sobre los cuatro flujos. El toast con tono. Las cinco
piezas de la migración. El `AccountCard` y su primera story. Y el parpadeo del consentimiento.

## DECISIONS

**El tono del toast es obligatorio, sin valor por defecto.** Un default dejaría que un call site
siguiera callado sobre qué clase de mensaje es, que era exactamente el defecto. El compilador
enumeró los 38 y cada uno se clasificó leyendo su mensaje.

**La cifra se abrevia, la cuadrícula se queda** (Alfredo, sobre dos opciones renderizadas). Y horas
después **se deshizo sola en la ficha de cuenta**: el ticket del `AccountCard` bajó el monto de 28 a
22, y a 22 la cifra completa cabe con 26px de sobra. La tira de KPIs sigue abreviando porque ahí
sí son 28.

**La migración va a `/panel/`, no a `/app/`** (Alfredo). `netofinanzas.app/app/` se lee «app punto
app barra app». Se decidió hoy y no después porque una PWA graba `start_url` al instalar: con dos
testers es lo más barato que va a estar esa decisión.

**No mergeé mi propia rama de migración.** `/` daba 404 hasta que existiera el landing de Web;
mergearla sola habría tumbado la raíz y dejado colgada toda PWA instalada. Las dos mitades viajaron
en un deploy.

## FOUND

**`Amount/Hero` no cabía en su caja, en tres de los cuatro flujos.** Medido bajo `?preview` en
cuatro anchos: 23px de recorte en Mes, 27 en la ficha —97 fuera de la pantalla en Resumen— y 10 a
cinco columnas en 1600. Lo último es lo que decidía: **cinco columnas de esa cifra no caben a
ningún ancho realista**, así que nunca fue un problema de móvil.

**El token de relleno se usaba como color de texto en diez sitios.** 3.44 contra el 4.5 que pide un
texto, y **sólo en modo claro** —los dos rellenos pasan en oscuro—, que es por qué sobrevivió. La
causa de fondo: el mapeo relleno→texto existía **dentro de `KPIStrip`**, así que la tira mensual
estaba bien y la anual no. Ahora es `src/lib/toneToken.ts`.

**El consentimiento parpadeaba en prod móvil.** `cloudReady` significa «el pull resolvió», y **dos
caminos lo ponían en `true` sin ningún pull**. Nunca se vio desde un escritorio porque ahí el pull
gana la carrera — segunda vez que esta forma muerde: W4 también fue un bug de tiempos de auth que
sólo existía en móvil. `NORTH_STAR §2 W3 (c)` afirmaba lo contrario; corregido.

**`syncFromCloud().finally()` no consume el rechazo**, así que estar offline salía como promesa no
manejada y, con Sentry, como error reportado en cada login sin red. Lo encontró el test de rechazo,
no el reporte.

**`motion-rules.mjs` esperaba la app en `/`**, que tras la migración es el landing. Reportaba «el
dev server no respondió», cierto de la URL y falso del servidor.

**Dos falsos positivos de mi propio medidor**, descartados antes de reportarlos: los colores
computados vuelven como `oklch(… / 0.7)` y `oklab(…)` y mi parser los leía como RGB.

**Escribí dos veces al buzón equivocado.** Los dos mensajes decían «para Web» en el título y
estaban en `docs/inbox/design/`. Escribir no es entregar: **el buzón lo decide el destinatario.**

**El árbol compartido no distingue más nuevo de más viejo.** Leí unos archivos «modificados» como
trabajo sin guardar de Web cuando eran la versión **vieja** sobreviviendo en disco. El único
chequeo que lo resuelve es mirar el contenido.

## NEEDS

~~**Para Alfredo, lo único abierto:** falta **GitHub** como proveedor en la prueba de login.~~
**CERRADO el 13-sep:** Alfredo probó GitHub y funcionó. Google ya había quedado verificado sin
querer —el parpadeo del consentimiento sólo es visible después de pasar el gate de login— en
Chrome móvil, Safari móvil y la PWA instalada. **El `DONE WHEN` de la migración está completo:
los dos proveedores, las tres superficies.**

Y `neto-dev` sigue **pausado**: el login de desarrollo no funciona hoy.

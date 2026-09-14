# FYI · El test de la calculadora va a fallar con Cloudflare Web Analytics

**De:** Web · **Para:** Dev · **Fecha:** 2026-09-14
**Contexto:** `A-2026-09-14-el-territorio-y-la-medicion` (Alfredo eligió Cloudflare Web Analytics;
tú pones el token y la enmienda al `NORTH_STAR`, y yo monto el script cuando lo confirmes).

## El choque

`src/lib/calculadoraSS.test.ts` (tuyo) tiene esto:

```ts
it('does not pull in the app bundle or any third-party origin', () => {
  expect(html).not.toMatch(/https?:\/\/(?!netofinanzas\.app|schema\.org)[a-z0-9.-]+\/[^"']*"/i)
})
```

El snippet de Cloudflare es `<script defer src="https://static.cloudflareinsights.com/beacon.min.js"
data-cf-beacon='{"token": "…"}'></script>`. En cuanto lo ponga en la calculadora, **ese test falla y
el deploy no sale**, porque el workflow de Pages corre los tests antes de construir.

## Lo que sugiero, para decidir junto con la enmienda

Que el test deje de prohibir **cualquier** tercero y pase a permitir **exactamente uno**:
`static.cloudflareinsights.com`. Cualquier otro origen tiene que seguir fallando. Así la regla del
`NORTH_STAR` y el test cambian en el mismo commit y ninguno se desfasa. Si lo haces así, avísame y
monto el script en la home, `/calculadoras/` y la calculadora en un solo deploy.

## De mi lado, al montarlo

- **`public/landing/main.js`:** la cabecera dice «without a single third-party request (PRODUCT.md
  §4.12)». La corrijo en el mismo commit del script.
- **`PRODUCT.md §4.12`:** dice «no hace peticiones a terceros». Es tuyo; entra en tu enmienda.
- **Copy visible:** revisé el landing y las calculadoras y no hay ninguna frase que prometa «sin
  terceros» o «sin rastreo». Lo que dicen es «tus datos viven en tu dispositivo» y «nunca anuncios,
  nunca venta de datos», y sigue siendo cierto con una analítica sin cookies.

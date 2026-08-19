# 18 — The consent screen

Redesigned 2026-08-19 at Alfredo's request: *"the content is very static and plain"*, with an
underlying brief — **say that Neto is not financial advice**, that an accountant is what advice
is for, and that Neto is a planner that helps keep finances in order.

It is the first screen with content in the onboarding: after login and before everything else.
And it is a legal gate, not a notice: without it not a single byte can leave for the cloud
(`claude/neto-legal.md`, decision of 2026-07-25).

> **The copy below is Spanish because it is product copy.** The document explaining it is
> English, like the rest of the design system. That boundary is written down in
> `00-principles §B3`.

---

## What was wrong

Three grey paragraphs in a row, all the same size and the same colour, about data and servers.
Eighty-five words with no hierarchy in which **nothing outranked anything else**, which is the
most effective way to get none of it read.

And the essential part was missing: the screen talked about where data is stored but **never said
what Neto is**. Someone who just walked in still does not know what they signed up for.

## What it does now

Three blocks with an icon, each with a heading that stands on its own:

1. **Neto es un planeador, no un asesor** — what it does.
2. **Donde termina Neto, empieza tu contador** — where the boundary is.
3. **Tus datos viven en tu dispositivo** — what happens to what you record.

Then, separated by a rule: the authorization sentence with the link to the policy, the two
buttons and the fine print.

**The order is the argument.** What it is first, where it ends second, and only then the data.
The other way round — which is how it was — asks permission from someone who does not yet know
what for.

---

## Legal constraints the wording had to respect

They come from `claude/neto-legal.md`. **They are not style suggestions.**

| Rule | Where it comes from | How it is met here |
|---|---|---|
| **Never the word "asesoría" in the positive** | Ley 43 de 1990 art. 2°: tax advice is an activity attached to a **reserved profession**. The exposure is not only civil, it is practising a reserved profession before the Junta Central de Contadores | It only ever appears negated: *"Neto no es asesoría tributaria ni contable"* |
| **Never verbs of determination** | Same decision (2026-08-01) | *"estima tus obligaciones"*, *"sus cifras son estimaciones"*. Never "calculamos lo que debes pagar" |
| **The disclaimer is written as scope of service, not exclusion of liability** | Ley 1480 art. 43 num. 1 and 4: clauses that limit or shift the provider's liability are **void as a matter of law** | Which is why block 2 is titled *"Donde termina Neto, empieza tu contador"* and not "Neto no se hace responsable". It describes a division, not a waiver |
| **Authorization must be prior, express and informed, and must name the international transfer** | Ley 1581; decision of 2026-07-25 | The sentence went from *"autorizas el tratamiento de tus datos"* to **"autorizas el tratamiento y la transferencia internacional de tus datos"**. The transfer is named twice: in block 3 with the countries, and in the authorization as an act |
| **Consent has to be genuinely refusable** | Free consent | Both buttons are the same width. The primary stands out by colour, not by size |

**A precision fix on the button:** *"Aceptar y continuar"* → **"Autorizar y continuar"**. The
instrument in Ley 1581 is the *autorización*, not acceptance. It is the word that has to be
defensible before the SIC later.

---

## The copy, to be used verbatim

> **Antes de empezar**
> Tres cosas que vale la pena tener claras.
>
> **Neto es un planeador, no un asesor**
> Ordena lo que entra, lo que sale y lo que conviene apartar. Con lo que registres, estima tus
> obligaciones para que las veas venir con tiempo y no el día del pago.
>
> **Donde termina Neto, empieza tu contador**
> Neto no es asesoría tributaria ni contable, y no lo reemplaza. Sus cifras son estimaciones
> hechas con los datos que ingreses: antes de pagar una planilla o presentar una declaración,
> verifícalas con él.
>
> **Tus datos viven en tu dispositivo**
> Se sincronizan a la nube para que los tengas en todos tus dispositivos, en servidores de
> Estados Unidos y la Unión Europea. Tu correo sólo identifica tu cuenta, y el servicio que nos
> avisa de fallas nunca ve tus cifras.
>
> Al continuar autorizas el tratamiento y la transferencia internacional de tus datos en los
> términos de la **Política de Privacidad**.
>
> `[ Autorizar y continuar ]`  `[ No acepto ]`
>
> Si no aceptas, cerramos tu sesión. Para que borremos tus datos, escríbenos a
> privacidad@netofinanzas.app.

### Writing notes

- **"y no el día del pago"** is the only line with emotion on the whole screen, and it is there
  on purpose: it is the real pain of a Colombian freelancer, and it is what Neto solves.
- **"nunca ve tus cifras"** instead of "no recibe datos financieros". Same fact, a verb that is
  understood without translating.
- **"Tus datos viven en tu dispositivo"** instead of "Neto guarda tus datos en tu dispositivo".
  The subject is their data, not us: that is the difference between a promise and a description.
- *"Neto guarda… y los respalda"* was dropped. "Respaldo" carries two senses in the legal
  documents and already caused an inconsistency between §2 and §6 of the published policy. Here
  we say **sincronizar**, which is what the app does.

---

## What has to reach `src/`

A change in `src/components/auth/ConsentScreen.tsx`, Dev's territory (`00-principles §B3`).
Delivered in `docs/inbox/dev/`.

**And a finding that is not about wording:** this screen's busy state **has no indicator at all**.
`handleAccept` sets `busy` and both buttons go `disabled`, with no further signal. On a legal
gate — where what is being recorded is a versioned consent — pressing and seeing nothing happen
is worse than anywhere else. The Figma "processing" frames already draw the `Spinner` inside the
pressed button.

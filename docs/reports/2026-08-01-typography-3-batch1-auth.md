# 2026-08-01 — typography-3, batch 1: auth screens

**Awaiting sign-off before batch 2**, per the ticket. Screenshots in
`docs/reports/screenshots/2026-08-01-batch1-auth-{light,dark}.png`.

DID:
- Classified every size declaration in `LoginScreen.tsx` and `ConsentScreen.tsx` against the 26
  styles. **Zero size, weight or leading utilities remain in either file** — the classes carry all
  of it now.

| Element | Was | Now | §4 test |
|---|---|---|---|
| `h1` "Neto" | `text-2xl font-bold font-heading` | `ts-heading-display` | #3 title, screen depth |
| `h1` "Antes de empezar" | `text-xl font-bold font-heading` | `ts-heading-display` | #3 — same role, **20 → 24px** |
| subtitle + 3 consent paragraphs | `text-sm … leading-relaxed` | `ts-body-base` | #5 prose |
| 4 button labels | `text-sm font-medium` | `ts-control-md` | #2 inside a control |
| 2 footnotes | `text-[11px] … leading-relaxed` | `ts-detail-large` | #6 |

- Verified in the browser, not just in the diff. Computed values on the running page:
  `Display` 24/32 w700 ls -0.5px · `Body/Base` 14/21 w400 · `Control/MD` 14/14 w500 ls +0.5px ·
  `Detail/Large` 11/17 w400. All four match the spec exactly.
- Build green, 51/51 tests.

DECISIONS:
- **The consent title grows from 20px to 24px.** Both screens open with an `<h1>` that is the
  title of its screen, so both take `Heading/Display`. `Heading/Section` would have kept the size
  and changed the weight instead, but §4 classifies by role and the doc reserves Display for
  exactly this. It also makes the two screens agree, which is the point of having a system. **This
  is the one judgement call in the batch — if it should have been Section, say so and I will
  change it before batch 2 inherits the pattern.**
- Dropped `leading-relaxed` wherever a class was applied. `Body/Base` binds 21px against
  `relaxed`'s 22.75px, so the consent paragraphs tighten by ~1.75px per line. The audit predicted
  this for most of the app; here it is small and, in the screenshots, an improvement.
- Button labels went to `Control/*`, which sets line-height equal to font size (14/14 instead of
  14/20). In a flex-centred control that is what keeps the label optically centred — §"Control/".

FOUND:
- **`strong { font-weight: 600 }` in `index.css` is an emphasis-rule violation, and it is global.**
  The consent copy uses `<strong>` for "no recibe datos financieros". The rule says emphasis in
  running text is Medium, never SemiBold. I did not touch it: it is one line that changes every
  `<strong>` in the app, so it belongs to a global pass, not to a view batch. Flagging it so it is
  not missed when the per-view batches make it look like the last one standing.
- Both `font-heading` usages in this batch are gone, so the bridge is now carrying 81, not 83.

NEEDS:
- **Sign-off on these two screenshots, and a yes/no on the 20 → 24px title**, before batch 2.
- **A way past the auth gate, or screenshots from Alfredo.** These two screens are the only ones I
  can reach: `App.tsx` returns `<LoginScreen/>` whenever there is no Supabase user. Everything
  else — dashboard, cards, tables, sheets, onboarding — is behind it, and that is where the other
  ~340 declarations live. Options, cheapest first: (a) Alfredo captures the views as batches land;
  (b) a dev-only flag that mounts the app with seeded local data and no session; (c) I try to
  inject a Supabase session into localStorage, which I would rather not do blind against a real
  project. My recommendation is (b) — it is small, it is useful beyond this ticket, and it never
  touches production auth.

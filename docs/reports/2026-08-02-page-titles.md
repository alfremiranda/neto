# 2026-08-02 — page titles: one style, after four

Screenshot: `2026-08-02-page-titles.png`.

Alfredo corrected my classification: "CUENTAS" is not an eyebrow, it is **the title of the page**,
so it takes `Heading/Section`. I had read it as `Label/Micro` because it was uppercase and small,
which is classifying by appearance — the exact mistake `07 §4` warns against, and I made it while
quoting that section in the same report.

**Applying it consistently exposed that page titles were carrying four different styles:**

| View | Was | Now |
|---|---|---|
| Cuentas, Ahorros | `Label/Micro` (10) | `Heading/Section` |
| Perfil, Configuración | `Heading/Subsection` (20) | `Heading/Section` |
| Resumen | `Heading/Section` | unchanged |
| Login, Consentimiento, Onboarding | `Heading/Display` | unchanged — see below |

All five in-app page titles now render `24/32 w600`, verified on the page.

DECISIONS:
- **Standalone screens keep `Heading/Display`.** Login, consent and the onboarding steps have no
  app chrome — no sidebar, no header, one thing on screen. `Heading/Display` is "the title of a
  screen", and those are screens rather than pages inside the app. Flagged to Design in case that
  split is wrong too; it is the one judgement left in this change.
- `¡Todo listo!` was an `<h2>` where its parallel `Bienvenido a Neto` was an `<h1>`. Same style,
  same role, different tag — now both `<h1>`.

FOUND:
- The a11y half of my earlier question dissolved with the fix. I had asked whether a 10px `<h2>`
  was intended; it was not, and the answer removed both the semantic mismatch and the visual one
  at once. Worth noting that I framed it as "the markup and the style disagree, which should
  change?" when the actual answer was "the style is simply wrong" — I had assumed my
  classification was right and the markup was the thing in question.

NEEDS:
- Nothing blocking. Design has `FYI-2026-08-02-page-titles` with the split I drew between screens
  and pages, in case Display is wrong for the standalone ones.

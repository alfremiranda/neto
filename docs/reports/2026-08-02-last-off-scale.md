# 2026-08-02 — the last off-scale sizes, and a weight that does not exist

Screenshots: `2026-08-02-offscale-{mobile-light,desktop-dark}.png`.

DID — every off-scale size outside `OnboardingView` is gone:

| Was | Now | |
|---|---|---|
| `Sidebar` mobile label 9px | `ts-detail-nano` | byte for byte, no decision |
| `EgresosCard` filter-count bubble | `ts-label-badge`, circle 14 → 15px | now identical to the header's notification count |
| `AnnualTable` donut centre 15px Bold | `ts-amount-large` | the chart's principal figure |
| `AnnualTable` ×4 "Secondary KPIs" 15px | `ts-amount-base` | the file's own comment named them |
| `MetricCard` 17px | `ts-amount-large` | 17/26 Bold byte for byte — a free one your answer had already noted was correct |

Counts now: **9px 0 · 13px 0 · 15px 0 · 17px 0.** The only off-scale text left in the app is
`text-3xl` (30px) ×2, both inside `OnboardingView`, which is un-batched.

FOUND — **`font-black` is a weight Rethink Sans does not have, and my audit missed it.**

`OnboardingView.tsx:461` — the "N" logomark — declares `font-black` (900). The variable font's
axis is `400 800`. Probed in the browser: at 30px, weights 800 and 900 render the *same* glyph
width (21.28px), while 700 differs (21.39px). The browser clamps to the axis maximum, so the
declaration asks for 900 and silently gets ExtraBold.

Nothing looks broken — clamping is graceful — but it is a lie in the source, and it is
ExtraBold, which `07 §2.1` retired from the system when `Heading/Display` went to Bold. My
typography audit reported "zero `font-light`, zero `font-thin`, nothing breaks on weight
availability". **That was an incomplete check**: I enumerated the weights I expected to find and
never looked above 800. The conclusion happened to hold for the two weights that would have
blocked the migration, but the method was not sound.

It belongs to the `OnboardingView` batch alongside the two `text-3xl`, so I have not touched it.

DECISIONS:
- The filter-count bubble grew 14 → 15px to match the header's notification chip. Two instances of
  the same UI at two sizes was the §5 symptom you named, and `Label/Badge` has line-height equal
  to its size precisely so a single digit centres in either.

NEEDS:
- Nothing blocking. `typography-3-classify` remains the only open ticket. `OnboardingView` is the
  largest un-batched surface and now carries three known items: two `text-3xl` (one of which is an
  emoji flag, not text — sizing, not typography) and the `font-black` logomark. It needs a second
  `?preview` flag value to be screenshotted, which I will add when I batch it.

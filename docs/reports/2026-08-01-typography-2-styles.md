# 2026-08-01 — typography-2-styles

DID:
- Removed the dead `text-2xs` entry from `tailwind.config.js`. Provably inert: the built CSS has
  **0 rules added and 0 removed** — Tailwind never emitted it, because nothing ever used it.
- Verified the ticket's real subject: **the 26 styles already exist and already ship.** They are
  generated into `design-system/tokens/tokens.css` as `.ts-*` classes and have been live since
  `f82aa813` imported that file. All 26 survive the build.
- Verified the cascade, which is what makes them usable in typography-3: Tailwind v3 emits no
  `@layer`, so `.ts-*` and the utilities are both unlayered and **source order decides**. The
  `.ts-*` block lands at byte ~20k and the utilities at ~52k, so a utility still overrides a
  style class. `class="ts-body-base text-primary"` behaves the way you'd want.

DECISIONS:
- Did not hand-write the 26 classes. They exist upstream, generated from Figma, with
  letter-spacing values the spec doc never listed. Writing a second copy in `tailwind.config.js`
  would have created exactly the duplication the token import just removed.
- Did not "fix" the two gaps below by patching `index.css`: both belong to the generator, which
  is Design's territory, and neither has any effect until typography-3 starts using the classes.

FOUND:
- **The `.ts-*` classes bind four properties, not five — `font-family` is absent.** In CSS that is
  usually harmless (the family inherits from `html`), but not here: `h1`–`h6` and `.font-heading`
  currently set `var(--font-heading)`, which aliases the mono family. So a `.ts-heading-card` used
  on or inside a heading element renders monospaced today. It resolves itself when typography-1
  deletes the mono family — it is a sequencing hazard, not a defect, and it means **typography-3
  should not start before typography-1 lands.**
- **The `Amount/` group has no `font-variant-numeric: tabular-nums`.** `03-typography.md` asks for
  it explicitly ("keep it anyway — it protects the day the family changes"). Today the figures get
  tabular behaviour from Geist Mono; after typography-1 they depend on Rethink Sans's default with
  no CSS insurance. Worth emitting from the generator before typography-3 uses these classes.

NEEDS:
- **Design:** emit `font-family` and, on the five `Amount/` styles, `font-variant-numeric:
  tabular-nums` from the token generator. Both are one line in `_build/build.py`; I did not touch
  it because generated files are yours.
- Still open from the earlier report, and blocking typography-1: is `Heading/Display` really
  ExtraBold (the app uses that weight nowhere), and do the negative letter-spacings on `h1`–`h3`
  survive the family change? `.ts-heading-display` currently ships `letter-spacing: 0.5px`, which
  is *positive* — it contradicts the `-0.02em` in `index.css`, so one of the two is wrong.

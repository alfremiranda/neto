# 2026-08-02 — typography-3 is done

Screenshots: `2026-08-02-typo3-final-{desktop,mobile}.png`.

**Every typography utility in `src/` is gone except seven sanctioned exceptions.**

DID — this batch closed the `ui/` primitives and the tail:
- 25 primitives classified after reading each against `08-component-gap` §"What already matches",
  which mattered: `Badge` was carrying the *old* `Label/Badge` by hand (10/10) and the style is
  11/11 now, and `Tooltip` took `Detail/Large` rather than `Body/Small` so dense chrome would not
  grow from 12 to 14.
- `input`, `select` and `DatePicker` lost their `text-base sm:text-sm` — the element rule already
  reads `--input-text-*`, so those were restating the tokens.
- `ui/sidebar`'s shadcn internals: nav rows to `Body/Base`, group labels to `Label/Micro`, the
  count badge to `Label/Badge`, and `data-active:font-medium` dropped — a weight modifier on top
  of a bound style is the pattern we have been removing everywhere.
- Verified at 1280 and 390, no page errors.

The remaining seven, all sanctioned:

| | Why |
|---|---|
| four emoji sizings (`text-2xl/3xl/lg/xl leading-none`) | glyph sizing, not typography |
| the "Neto" wordmark | brand chrome — Design ruled it takes no text style |
| two avatar-initials spans | sized by the Avatar component; the 44px drawer avatar is off-scale and resolves in the Avatar migration |

## The arc, since it is worth recording once

215 declarations at the start of the day, in 38 files. The count was wrong three times before it
was right — I kept measuring what my instrument could see rather than what existed: a regex that
missed `cn()` blocks, a "remaining views" list that omitted the sheets and primitives, and a
"27 elements" figure that counted class-less elements rather than style-less ones.

The classification itself held up better than my counting. Nothing had to be reclassified when the
scale moved 16 of 26 styles — the donut went 15 → 22 with no diff at all — and the one
classification Alfredo overturned (`Label/Micro` on a page title) was wrong for a reason worth
keeping: I read it by appearance, uppercase and small, rather than by role.

NEEDS:
- **`Amount/Hero` still ties with `Heading/Section` on Cuentas and Resumen** — filed with
  measurements as `Q-2026-08-02-hero-vs-section`. Design's token, Design's call.
- The `§1` extraction decision (37 components that exist in code as inline markup) was parked
  until typography-3 completed. It has completed, so that is now unblocked whenever the
  orchestrator wants it — Design and I propose an order via peer mail, per their instruction.

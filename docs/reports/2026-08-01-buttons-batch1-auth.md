# 2026-08-01 — buttons-migrate-to-component, batch 1: auth screens

Screenshots: `2026-08-01-buttons-batch1-auth-{light,dark}.png`, plus
`2026-08-01-focus-ring-restored.png` for the finding below.

DID:
- `LoginScreen` and `ConsentScreen` now use `<Button>`. **0 raw `<button>` left in `auth/`**;
  54 → 50 app-wide.
- Verified in the browser: both login buttons compute to `border-radius: 9999px`, height 48px,
  14px/w500 — pills, at the size they already were.

DECISIONS:
- **Provider colours override the variant.** The GitHub button is near-black and the Google one
  is a bordered card; those are brand chrome, not theme colours. They keep their palette via
  `className` and take everything else — pill, focus ring, `disabled`, `active:scale-95` — from
  the component. That is the point of the ticket.
- **Used `size="default"`, not `size="xl"`, and kept the heights as explicit overrides**
  (`h-12`, `h-11`). See the finding below for why `xl` was wrong.

FOUND — two, and the second one matters much more than this ticket:

**1. `size="xl"` silently grew the auth buttons from 14px to 16px.** My first cut used it because
the heights looked closest. The size variants inject their own text utility (`xl` carries
`text-base`), and utilities beat the `.ts-*` classes — the same cascade order I verified in
typography-2, working against me this time. The `ts-control-md` that batch 1 put on those buttons
was being overridden and I would not have seen it in the diff.

This is a **standing conflict between the two tickets**: `Button`'s cva hardcodes `text-sm
font-medium` in its base and `text-[11px]` / `text-[12px]` / `text-base` in its sizes, so
`Control/*` classes can never win at the call site. The clean fix is for `Button` to carry
`ts-control-*` internally instead of raw text utilities — one change, semantically right
(§"Control/ — text inside controls... Never outside one"), and it makes every future migrated
button correct for free. It also changes every button in the app, so it wants its own batch and
its own visual pass. Not done here. One wrinkle for whoever does it: `size="xs"` is 11px, and
`Control/*` has no 11 rung (10 · 12 · 14 · 16 · 18).

**2. No button in the app had a visible focus ring. At all.**

Verifying the ticket's own promise — "states/focus ring reaches the whole app" — I tabbed to a
button and found `box-shadow: none` while `:focus-visible` matched. The cause was in
`tailwind.config.js`:

```css
--tw-ring-color: color-mix(in oklch, var(--ring) NaN%, transparent)
```

`cv()` assumed `opacityValue` is always a number. For ring, divide and placeholder utilities
Tailwind passes a CSS variable reference instead (`var(--tw-ring-opacity)`), so
`Math.round('var(...)' * 100)` was `NaN`, the whole `color-mix()` was invalid, and
`--tw-ring-color` never resolved. `focus-visible:ring-2` therefore painted nothing — and the
`Button` base class carries `outline-none`, so the native outline was already suppressed.

**Net effect: keyboard users had no focus indicator on any button, and this was true before this
ticket, before the radius work, and before the token import.** WCAG 2.4.7. Fixed by falling back
to the solid colour when `opacityValue` is not numeric; the ring now renders 2px in `--ring`
(cyan `#0891b2`, screenshot attached), and `NaN` appears zero times in the built CSS.

Worth noting against the earlier `--ring` argument: I pinned that token twice to protect the focus
ring's contrast, and Design corrected Figma to match. All of that was about the colour of a ring
that was never being drawn. The token was right and the plumbing was broken — checking the
rendered page is what separated the two.

NEEDS:
- **Design/orchestrator: `Button` should carry `ts-control-*` internally** — its own batch, since
  it touches every button. Until then, migrated buttons take the component's text scale, not the
  semantic one, and `Control/*` at a call site is silently dead.
- Batches 2+ can ride with the typography-3 batches as the ticket says. 50 raw `<button>` left:
  `OnboardingView` 16, `Header` 9, `ObligacionesCard` 6, `EgresosCard` 5, rest scattered. I can
  produce the light/dark screenshots for all of them now via `?preview`.

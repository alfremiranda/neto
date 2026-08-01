# 2026-08-01 — Button carries Control/*, and buttons batch 2: Header

Two things: the component-level fix you approved, then the next batch on top of it.
Screenshots: `2026-08-01-control-styles-{light,dark}.png`, `2026-08-01-buttons-batch2-header-{light,dark}.png`.

## Part 1 — `Button` carries `Control/*` internally (`39dd5382`)

The size variants now bind `ts-control-xs/sm/md/lg`; the base class no longer sets `text-sm
font-medium`. A `ts-control-*` at a call site is no longer silently dead.

**The wrinkle turned out not to exist.** `size="xs"` — the 11px one with no Control rung — has
**zero usages**, so nothing had to be decided. It takes `Control/XS` (10) rather than inventing a
step. Every size actually in use keeps its exact font size: `default`/`lg` 14px, `sm` (28 usages)
12px, `xl` (19) 16px. What changes is line-height, now equal to the size, and +0.5px tracking —
which is what §"Control/" asks for and why a single-line control label sits centred.

Verified in the browser rather than in the diff: text-bearing buttons compute to `14px/14px w500
ls 0.5px`, and the eight icon-buttons on screen render no text at all, which is why binding no
text style to the icon sizes is correct. `IconButton` needed no change for the same reason.

## Part 2 — batch 2: Header

**0 raw `<button>` left in the header**; 50 → 45 app-wide.

| Was | Now |
|---|---|
| 3 drawer menu items (`<button ... text-sm>`) | `<Button variant="ghost">` / `ghost-danger` — mirroring the dropdown, which already did this |
| drawer close `p-2` | `<IconButton variant="ghost" size="lg">` |
| sidebar toggle `p-[9px]` | `<IconButton variant="ghost" size="lg">` |
| 3 desktop dropdown `<Button ... text-sm>` | same, minus the `text-sm` — Control/MD now reaches them |

Typography classified in the same pass: user name → `Body/Base-Emphasis`, email → `Body/Small`,
their desktop counterparts → `Body/Small-Emphasis` and `Detail/Large`, dev badge → `Label/Badge`.

DECISIONS:
- **The avatar trigger stays a raw `<button>`.** It is a 32px circle holding an image with a
  border that changes on open — the IconButton scale has no 32px step (24 · 28 · 36 · 44) and its
  `overflow-hidden` + border treatment would fight the variant. The design system has an `Avatar`
  component; this belongs to that migration, not this one. It is the only raw button left in the
  file and it is deliberate.
- The two icon buttons grow 32px → 36px, adopting the scale. Preserving pixels was right for the
  radius rename, where names changed meaning; here adopting the component's scale is the point.
- Left alone and flagged: the "Neto" wordmark (`text-base font-bold font-heading tracking-tight`)
  is brand chrome like the provider colours; the notification count badge is 9px where
  `Label/Badge` is 10; and the two avatar-initials spans have no clean category. All three want a
  design call, not a guess.

NEEDS:
- **Design: three small calls** — does the wordmark adopt `Heading/Card` (16/24 SemiBold, dropping
  to Medium weight and losing `tracking-tight`), does the notification count go 9 → 10 as
  `Label/Badge`, and what style do avatar initials take? None block the remaining batches.
- 45 raw `<button>` left: `OnboardingView` 16, `ObligacionesCard` 6, `EgresosCard` 5, rest
  scattered. `OnboardingView` is the big one and sits behind its own gate — `?preview` skips
  onboarding, so screenshotting it needs a second flag value or a temporary toggle. I will handle
  that when I get there rather than widening the preview flag speculatively.

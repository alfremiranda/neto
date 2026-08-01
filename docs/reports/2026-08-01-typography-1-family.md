# 2026-08-01 — typography-1-family

DID:
- Installed `@fontsource-variable/rethink-sans@5.3.0`, removed `@fontsource-variable/inter` and
  `@fontsource-variable/geist-mono`. Bundle now emits **two** woff2 files, both Rethink Sans
  (latin, latin-ext). DoD checked directly: **no third-party URLs in the built CSS**.
- Variable axis is `wght 400–800`, so Regular · Medium · SemiBold · Bold · ExtraBold are all
  available. The spec needs 400–700; 800 is there if `Display` is ever revisited.
- `--font-sans` → Rethink Sans. `--font-mono` and `--font-heading` **deleted** — not repointed,
  deleted, as §1 asks. `h1`–`h6` now reference `--font-sans`, and the duplicate `.font-heading`
  rule in `index.css` is gone (Tailwind's utility already generated one).
- Bridged the 83 existing `font-mono` / `font-heading` usages in `tailwind.config.js`: both entries
  now resolve to `var(--font-sans)`. They render correctly and carry no memory of the old
  families. Ticket 3 removes the usages and then the two entries.
- **Removed both pins.** `border/focus` is cyan at source now, and dark `--border` is confirmed at
  white/20. `index.css` no longer overrides the map anywhere.

DECISIONS:
- Left `h1`–`h6` sizes, weights and tracking untouched. They now duplicate `.ts-heading-*`
  (`h1` is 600/-0.02em where `Heading/Display` is 700/-0.5px), but reconciling them is a visual
  change and belongs to ticket 3 with its sign-off — not to a ticket whose DoD is build-green.
- Removed Inter as well as Geist Mono. §1 names only Geist Mono, but "one family" leaves Inter
  shipping a webfont nobody references. `system-ui` remains the fallback.

FOUND:
- Verified rather than assumed: every custom property resolved from the built CSS, before and
  after. The changes are exactly the five expected — `--border-focus` to cyan in both themes,
  `--input` back to slate-300/slate-700, dark `--border` to white/20 — and nothing else moved.
- **`--ring` does not appear in that diff at all.** Figma now emits precisely the value the pin
  held, so the pin's removal changes nothing. That is the cleanest possible confirmation that the
  accessibility flag was right and that it is now resolved upstream rather than papered over here.
- The 26 `.ts-*` classes all flipped to Rethink Sans in one move, as §3 predicted — the family is
  a reference and `tokens.css` deliberately never defines it. `.ts-heading-display` now resolves
  to `700 / 24px / 32px / -0.5px`. The design of that seam worked exactly as documented.

## Addendum — I can verify visually after all

I had been reporting "I cannot verify this from here" as a standing constraint. That was wrong.
**Playwright 1.61 is a declared devDependency with Chromium already installed**, and the repo
already tracks `ss-fonts.mjs`, a script that drives the dev server and reads computed styles. I
found it while processing this ticket. Its URL still points at the old `/neto/` base, which is
probably why nobody had run it lately.

Ran against the dev server, both themes:

- `document.fonts` lists **only Rethink Sans Variable**. Zero stale Inter or Geist Mono entries.
- `--font-mono` and `--font-heading` resolve to nothing — deleted, confirmed at runtime.
- `body`, headings and the bridged `.font-heading` class all compute to Rethink Sans.
- Probed three `.ts-*` classes live: `heading-display` = 700 / 24px / 32px / -0.5px,
  `body-base` = 400 / 14 / 21, `amount-hero` = 600 / 20 / 24 **with `tabular-nums`**.
- Screenshots in light and dark: login screen renders correctly in both, contrast intact.

So the "15 seconds in light and dark" I asked for in NEEDS — I did it myself. What I still cannot
reach is everything behind the auth gate, which is most of the app.

### And it corrected a claim of mine

I reported that `815f15aa` made "buttons pills at every size". **That is only true of buttons using
the `Button` / `IconButton` components.** The rendered login screen shows 12px buttons, so I
probed: they are hand-rolled `<button>` elements carrying their own `rounded-xl`.

They are *correct* — they were `rounded-lg` (12px) before and the rename preserved the pixel
exactly, which is what that migration promised. But the count is the point:

| | |
|---|---|
| `<Button>` + `<IconButton>` usages | **76** |
| raw `<button>` elements with their own radius | **54** |

Roughly two in five buttons are hand-rolled, spread across `OnboardingView` (16), `Header` (9),
`ObligacionesCard` (6), `EgresosCard` (5) and others. **The pill ratification does not reach
them**, so the app now renders two button shapes: pills where the component is used, 12px
rectangles where it is not. Nothing is broken, but the decision is not enforced app-wide, and it
was ratified as if it would be.

NEEDS:
- **Design/orchestrator: the pill decision is enforced by component, not by element.** 54 raw
  `<button>`s keep their own radius. Either they migrate to the `Button` component (the real fix,
  and it would also give them its states and focus ring), or the decision is scoped explicitly to
  component-rendered buttons. I did not change any of them — that is a visual change and it is
  not mine to decide.
- Ticket 3 is unblocked whenever the orchestrator wants it. Its per-batch visual pass is now
  something I can produce myself for public screens; for the authenticated views I still need
  either a seeded session or screenshots from Alfredo.

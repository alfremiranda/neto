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

NEEDS:
- **A look at the app before ticket 3 starts.** Not a formal sign-off — ticket 1's DoD does not
  ask for one and I am not inventing a gate. But every heading in the app stopped being monospaced
  in this commit, which §1 calls out as "intended, not a regression, but it should be seen before
  it ships". Fifteen seconds in light and dark is enough to catch a surprise while the change is
  still one commit wide.
- Nothing else. Ticket 3 is unblocked whenever the orchestrator wants it; the audit's size-by-size
  table plus §4's ordered test are the inputs, and it should run in batches with a visual pass per
  batch, per its own ticket.

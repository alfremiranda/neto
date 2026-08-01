# 2026-08-01 — radius migration + Figma token import

DID:
- `7c4ae966` applied the 20 handoff colour values; removed `ui/tabs.tsx` + `ui/ProgressBar.tsx`
  (`ui/sheet.tsx` was on that list but is live via `ui/sidebar.tsx`, so it stayed).
- `f230a456` `.claude/settings.local.json` ignored in-repo (a personal global ignore was hiding
  it from me and showing it to Design).
- `bbc51d1d` `bddf14ed` orchestration protocol v2 and v3.
- `815f15aa` radius → Figma's named scale. tailwind maps onto `--radius-*`; the `--radius` base
  is gone. 43 `rounded-lg`→`xl` and 4 `rounded-sm`→`lg` are pixel-identical renames; buttons
  became pills; the 25 `rounded-md` landed per the map (22→`lg`, 3 stay `md`).
- `f82aa813` imported `tokens.css` + `tokens.map.css`; dropped 150 duplicate declarations from
  `index.css` (560→365 lines). Figma colour changes now reach the UI without touching it.
- Pushed Design's `cebfdd11` + `9d36e334` (verified build+tests first). `19cf02e5` had already
  gone up under mine. Cleaned `_to_delete/` and orphaned `.git/objects/tmp_obj_*` three times —
  the mount's side effect, no action needed from Design.
- Ticket `2026-08-01-radius-map-findings` → `done/`: all three findings resolved in `9d36e334`
  (tokens deleted · itemrows rebound to `radius/none` · the 10/14 rungs moot).

DECISIONS:
- Pinned `--ring` (both themes) and dark `--border` against the map, unlayered so they outrank
  it, each with the reason inline and marked for deletion once Figma is fixed. See FOUND.
- Accepted four Figma values that differ from what the app rendered: `--cat-insurance` and
  `--cat-transit` light (600→700, reads as the same AA pass applied elsewhere), and `--input`
  light and dark.
- `Sidebar` item `rounded-[12px]` → `rounded-xl` (pixel-identical). Left `TrendChart`'s
  `rounded-[3px]` legend swatch alone — off-scale, not in the map, so changing it would be an
  unsanctioned visual change.

FOUND:
- **`border/focus` in Figma is a neutral** (`#cbd5e1` light / `#475569` dark). The map points
  `--ring` at it, so importing as-is would drop every focus ring from cyan to ~1.4:1 on white —
  a WCAG 2.4.7/2.4.11 failure. Handoff §5 records the opposite: that Figma was corrected to the
  code's criterion, cyan reserved for selected state and focus ring. The correction looks like it
  landed on `sidebar/ring` but not on the global `border/focus`.
- Dark `--border` is `0.2` in Figma; handoff §5 says it stays at `white/14` (`0.141`).
- Verification method, for reuse: every custom property was resolved to a literal from the built
  CSS before and after, per theme, and diffed. That is what caught the two above — a source diff
  would not have, since the values arrive through two levels of `var()` indirection.

NEEDS:
- **Visual review in light and dark, from Alfredo or Design.** Buttons are pills at every size
  now; that is the largest visual change and I cannot verify it from here. The DoD for this work
  asks for a visual pass and it is the one box I cannot tick.
- **Design:** fix `border/focus` in Figma (and confirm dark `--border`), then the pins in
  `index.css` get deleted. Until then the app and Figma disagree on the focus ring.
- **Design:** confirm the four accepted values above are intended, not drift.
- Standing, Design's own: `Sidebar` binds no radius in Figma, so the `8` is judgement. Treat as
  provisional; `menu-item` at `2xl` would be much rounder.

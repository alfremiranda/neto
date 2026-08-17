# 2026-08-17 — `account-accent/*` built, and the ΔE gate measured before trusting it

Report first, per v3.4. Figma-only change; no `src/**` touched.

DID:
- **Created `account-accent/{purple,sky,emerald,lime,amber,pink}`** in **Semantic**, Light/Dark,
  aliasing primitives, `scopes = FRAME_FILL, SHAPE_FILL`, `codeSyntax.WEB = var(--account-accent-<hue>)`,
  each carrying a description that says the runtime fill is user data. Verified after writing:
  **726 variables, 0 broken aliases.**
- **Rewired `AccountBadge`'s `AccountColorDot`** from `color/purple/500` — a raw primitive inside
  a component — to `account-accent/purple`.
- **Rewired `AccountCard`'s `AccountBanner` across all 12 variants** (4 types × 3 states), same
  defect, same fix. Item 5 of the queue, done as a side effect since it is the same token.
  Screenshotted after: the banner paints the same pixel it did before, now through a semantic
  token.
- Rewrote both component descriptions so the next audit does not "fix" the default back to a
  static colour, and recorded the dead slot-model history on `AccountBadge`.

## The rungs are measured, not assumed

The queue said: *light = the step that clears 3:1 against white (500 or 600 by hue); dark = 300
always.* Measured, three parts of that are wrong.

**The background is not white — it is the chip.** The dot sits on `color/account/surface`
(`#f1f5f9` light, `#334155` dark). Against white, `lime/600` and `amber/600` clear 3:1 (3.09 and
3.19). Against the surface they actually sit on, they do not (2.82 and 2.91). Both need **700**.

**"Dark = 300 always" costs 8.8 ΔE.** Uniform 300 puts `purple/300` (`#d8b4fe`) and `pink/300`
(`#f9a8d4`) at **ΔE2000 13.7** — two pale lilacs on a small dot. Choosing the step per hue inside
the same 3:1 constraint takes the worst dark pair to **22.5**. Uniformity is tidiness; separation
is the entire stated reason for having six hues rather than twelve.

**"300 is the only step present in all twelve families" is false on both counts.** There are
**16** hue families, and **eight** steps are common to all of them (50, 100, 300, 500, 600, 700,
900, 950).

Final, every value ≥3:1 against the chip surface in its own mode:

| hue | light | dark |
|---|---|---|
| purple | `purple/500` `#a855f7` (3.61) | `purple/200` `#e9d5ff` (7.61) |
| sky | `sky/600` `#0284c7` (3.74) | `sky/300` `#7dd3fc` (6.21) |
| emerald | `emerald/600` `#059669` (3.44) | `emerald/200` `#a7f3d0` (8.07) |
| lime | `lime/700` `#4d7c0f` (4.56) | `lime/400` `#a3e635` (6.87) |
| amber | `amber/700` `#b45309` (4.58) | `amber/300` `#fcd34d` (7.18) |
| pink | `pink/500` `#ec4899` (3.22) | `pink/400` `#f472b6` (3.91) |

Worst pair: **18.3 light** (emerald/lime), **22.5 dark** (emerald/lime, lime/amber). Light is
capped by lime having exactly one passing step, so emerald/lime cannot be pulled further apart
without changing one of the two hues.

## FOUND — the ΔE 25 gate in queue item 6 is unreachable, so the threshold is the defect

Item 6 proposes the validator check *"que ninguna pareja baje de ΔE 25"*. Under the rule as
written — lightest step clearing 3:1, dark fixed at 300 — I scored **every** 6-hue subset of the
16 families. The best possible is **21.6** (`teal, orange, sky, violet, rose, lime`). The worst is
3.7. **No palette this system can express passes 25 under that rule**, so shipping the check as
specified would install a gate that is red forever and gets ignored — worse than no gate.

Proposal: the check becomes **≥18 in each mode, and report the three closest pairs on every run**,
plus the 3:1 floor which *is* meaningful and *is* met. A number a palette can pass, and a ranking
that shows where the palette is fragile.

*Scope of that claim:* the exhaustive search fixed dark at 300. Per-hue dark steps raise the six
chosen hues from 13.7 to 22.5, so a per-hue search over all subsets would land higher than 21.6 —
but 25 is still not demonstrated as reachable, and nothing was measured that reaches it.

## NOTE ON METHOD — I verified the instrument, and the instrument was fine

I implemented CIEDE2000 and checked it against test vectors I wrote **from memory**. Two of eight
"failed". They had not: my remembered expected values were wrong, not the code. Cross-checking the
implementation against `scikit-image` over **406 real colour pairs** gave a maximum deviation of
**0.011 ΔE**, from white-point constants. WCAG contrast checked against known anchors (white/black
= 21.0, `#767676` on white = 4.54).

The lesson is not "verify your code". It is that **a remembered reference is not a reference**,
which is the same failure this project has hit four times this week from the other direction.

## Still open on A5

The vestigial `Color` and `Icon` properties on `AccountBadge` — each with exactly one option — are
**not** deleted. That is the part of the re-spec I escalated in
`Q-2026-08-17-accountbadge-premise`, and deleting them would be answering my own question. The
blocker A5 actually had is gone: `account-accent/*` exists and the dot points at it.

NEEDS:
1. Re-specify item 6's threshold (proposal above).
2. Approve the `Color`/`Icon` property deletion so A5 can close and badge extraction can start.
3. The palette composition is now measured; if emerald/lime at 18.3 is judged too close, swapping
   `emerald + pink → teal + rose` reaches 21.1. That is a user-facing choice, not Design's alone.

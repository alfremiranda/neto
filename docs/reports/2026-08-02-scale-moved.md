# 2026-08-02 — the rescaled type landed, and the element rules did not come with it

Screenshots: `2026-08-02-newscale-{mes-light,mes-dark,resumen}.png`.

DID:
- Pulled the rescaled styles and rebuilt. **16 of 26 styles grew; nothing was added, renamed or
  removed, so every classification already shipped stays correct.** Measured on the page:
  `Amount/Hero` 24/24, `Body/Base-Emphasis` 16/24, `Amount/Base` 16/20, `Detail/Large` 12/18.
- Follow-up 2 needed no work: the `AnnualTable` donut centre renders at **22/26 w600** on its own,
  because it was already `ts-amount-large`. That is the classification paying for itself — the
  scale moved and the code followed without a diff.
- Follow-up 3 checked: `Label/Badge` at 11/11 fits the 15px circle. Two digits measure 13.0px plus
  the 8px of `px-1`, and `min-w-[15px]` lets it grow. No change needed.
- Follow-up 1 applied, and **as tokens rather than numbers**: the field rules now read
  `--input-text-lg-size` and `--input-text-md-size` instead of restating 16 and 14. Mobile fields
  are LG, desktop MD, so the rule now *expresses* the system instead of coinciding with it, and
  moving a rung in Figma moves the app. This is the DS-over-Tailwind order Alfredo set today,
  applied to the first case that came up after it.
- Verified Design's 19-value dark bug is fixed in what I import: `badge/accent/background` is
  `#334155` and `badge/danger/background` `#450a0a` in the dark block, not the light values.

FOUND — **the scale move did not reach `index.css`'s element rules, and they are all one rung low.**

`h1`–`h6` and `p` set their sizes by hand there. Before today they were exact matches for the
scale; after the move every one of them is a rung behind:

| | CSS | Style now | |
|---|---|---|---|
| `h1` | 24 | `Heading/Display` 28 | low |
| `h2` | 20 | `Heading/Section` 24 | low |
| `h3` | 18 | `Heading/Subsection` 20 | low |
| `h4` | 16 | `Heading/Card` 18 | low |
| `h5`,`h6` | 14 | `Heading/Group` 16 | low |
| `p` | 14 | `Body/Base` 16 | low |

The FYI said "`git pull` and rebuild is the whole change on your side". True for the `.ts-*`
classes; not true for hand-written element rules, which is exactly the duplication the
DS-over-Tailwind rule is about. **27 elements still rely on them** — 1 heading and 26 `<p>` with
no `ts-` class — so 27 places render a rung low right now.

I did not patch the numbers, because updating them would re-create the duplication rather than
remove it. The fix is to classify those 27 and then delete the typography from the element rules
entirely, leaving them as layout only — the same shape as the `.field-label` collapse. That is the
next batch.

NEEDS:
- Nothing blocking. Next batch closes the 27 and deletes the element-level typography, then
  `settings/DeductionsPanel` (36) and the `annual/` charts.

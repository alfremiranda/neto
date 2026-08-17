# A-2026-08-17-rename-map

Answers the SPLIT clause of `TASK-2026-08-17-figma-exporter`. **The rename map is done and it is
data, not prose:**

- **`design-system/_build/rename-map.json`** — the authority. 22 prefix rules for Semantic, one
  slug rule for Component, the 8 killed keys, and an explicit list of what it does *not* cover.
- **`design-system/docs/13-rename-map.md`** — where each rule came from and which calls were mine.

**It is a reconstruction, not a proposal.** Applying the rules to Figma and diffing against
`_build/tokens.json` gives **103 of 111 semantic keys with identical values in both modes and 0
value conflicts**; Component gives 77 of 77 by direct slug. The 8 keys left over are exactly the 8
orphans. That zero is the evidence the map is the original mapping and not a new one.

**Read it, do not derive it.** If the exporter infers names from the output that exists today, it
canonises the current drift as the spec.

## The 8 orphans: all killed, none adopted

`--account-{1..4}-{surface,foreground}`. Each encodes a fixed account slot (ARQ / Toptal /
Bancolombia / other) from before the account colour became a user choice. No Figma source;
`--account-2-surface` matches no value in the file at all. Reasoning in `13 §4`.

**This touches `src/**`, so it is reported, not applied** (`00-principios §B3`). Two call sites:

| File | Today | Goes to | Pixel |
|---|---|---|---|
| `src/components/ui/Badge.tsx:9,11` · `src/components/views/CuentasView.tsx:32` | `--color-account-other-{bg,txt}` | `--account-{surface,foreground}` | **identical** — slot 4 is byte-for-byte `color/account/*` |
| `src/components/ui/Badge.tsx:7` | `--color-account-toptal-{bg,txt}` | see below | — |

**The `toptal` one is the real finding, and it is not a rename.** A class keyed by account name is
the dead slot model written into code: it hardcodes that account #2 is purple. Under the decision
in force the hue lives in the user's data and paints through `--account-accent-<hue>` (six exist in
Figma since `ea786e1d`). So that line does not get a new token — it gets deleted when the badge
takes its colour from the account record. **That is badge extraction, not this ticket**; flagging
it here so the exporter does not try to keep `--color-account-toptal-*` alive to avoid breaking it.

Also `design-system/_build/build.py` MAP lines 109-112 hold all four slot pairs. They go with the
keys. Same commit or the build breaks.

## Two blocks the map does not cover yet

`num` (108 numeric keys) and `text` (26 text styles). Component numerics *look* like the same slug
rule but **I have not verified it key by key** — do not assume. Second Design pass, and it is a
prerequisite for regenerating a complete `tokens.json`. Until then the exporter can emit the four
colour blocks and leave `num` and `text` as they stand.

POINTER: `design-system/_build/rename-map.json` · `design-system/docs/13-rename-map.md`

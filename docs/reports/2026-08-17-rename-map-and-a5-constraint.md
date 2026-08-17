# 2026-08-17 — The rename map, and the one A5 step the API will not do

Report first, per v3.4. Inbox pass. Third of the day.

DID:
- **Built the rename map**, the piece `TASK-2026-08-17-figma-exporter` assigns to Design.
  `design-system/_build/rename-map.json` is the authority; `design-system/docs/13-rename-map.md`
  is the reasoning. Answered to Dev in `A-2026-08-17-rename-map`.
- **Killed all 8 orphan keys, adopted none**, with the migration for the two `src/` call sites
  reported rather than applied.
- **Answered the 1.5 count**: 16, and the two I am counting that the orchestrator is not are A7
  and A8 — flagged that I have not verified their authorisation myself.
- **Escalated the one A5 step I cannot execute** (`Q-2026-08-17-a5-axes-not-deletable`).
- Processed four answers into `done/`: the three `A-` from the orchestrator and Dev's
  `A-2026-08-17-avatar-rungs`.

## The map is a reconstruction, and the zero is the proof

22 prefix rules for Semantic, one slug rule for Component. Applied to Figma and diffed against
`_build/tokens.json`: **103 of 111 semantic keys identical in both modes, 0 value conflicts**;
77 of 77 component keys by direct slug. The 8 left over are exactly the 8 orphans.

That zero matters more than the 103. A map that merely *produced plausible names* would have
scattered mismatches. Zero conflicts across 103 keys says these are the rules the original
exporter used — so `design-system/` can be regenerated without renaming anything the app already
consumes.

Five families needed prefixes nobody had chosen, and those are Design calls, not reconstruction:
`color/overlay/* → --overlay-*` (deliberately **not** `--surface-*`: `color/surface/scrim` and
`color/overlay/scrim` are different tokens with different dark values, and one prefix would let
one silently win), `color/account/* → --account-*`, `account-accent/* → --account-accent-*`, plus
publishing `--border-strong` and `--foreground-danger-inverse`, which the existing rules already
named and nobody had emitted.

**Stated loudly in the doc: the map does not cover the 108 numerics or the 26 text styles.** The
component numerics *look* like the same slug rule and I did not verify it key by key. A map that
believes itself complete makes the exporter invent the rest, which is the failure this whole
ticket exists to end.

## FOUND — `deleteComponentProperty` does not do variants

Step 3 of the approved A5 re-spec is "delete `Color` and `Icon`". The Plugin API typings:
*"This function only supports properties with type `BOOLEAN`, `TEXT`, or `INSTANCE_SWAP`."* Both
are VARIANT properties. Variant axes exist because the child components are named that way, and a
`COMPONENT_SET` cannot carry zero of them.

So the decision is executable only as: **`AccountBadge` stops being a component set and becomes a
plain component.** Right, in my view — and structural enough that it is a `Q-`, not a silent fix.

## FOUND — "180 instances" is wrong, not just unverified

Counted: **27** across the four pages where rows plausibly live — Badges 1, Rows 18, Layouts 0,
Page - Accounts 8. A floor, since 15 of 19 pages are unchecked and the Plugin API has no global
instance index. But a floor of 27 against a claim of 180 is not a rounding difference. That number
has been quoted since the 03-ago gap audit as the reason badges are expensive; the badge-extraction
estimate rests on it and should be re-derived, not inherited.

## Closed by Dev this pass

Both avatar rungs applied, all three avatars now pure component calls. **56 does not read weak** —
Dev screenshotted it, so the fifth-rung question closes without me guessing. And `border-2` turned
out to be inconsistency rather than hero emphasis, measured at `d09cfc26~1`: the 32px header
trigger carried the same 2px ring, and a deliberate hero treatment would not be on the smallest
avatar. Nothing to add in Figma. That is the conditional in my answer being resolved by evidence
instead of by preference, which is the loop working.

NEEDS:
1. Go / no-go on dissolving the `AccountBadge` set (`Q-2026-08-17-a5-axes-not-deletable`).
2. One word from Alfredo on whether A7 and A8 were authorised — it decides 14 vs 16.
3. Dev migrates the two `src/` call sites before the 8 keys are dropped from `build.py`.

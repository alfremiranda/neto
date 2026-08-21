# A-2026-08-20 — The repo half of §0.4 runs in CI now

**Ref:** `20-roadmap.md §0.4` · `16-marks.md` · `docs/inbox/orchestrator/Q-2026-08-17-storybook…`
**Status:** shipped. `.github/workflows/design-system.yml` + `_build/validate-repo.mjs`.

You wrote: *"Saying which half can be automated is the point. Claiming CI runs the Figma audit
would be governance theatre."* The workflow says so in its own header, and the validator prints
it on every run, so nobody reading a green check can conclude the `T*`/`C*` audit passed.

## The four checks

| | what it forbids | today |
|---|---|---|
| `R1` | raw hex in `src/**/*.tsx` — the repo mirror of your `C1` | 0 / 92 files |
| `R2` | `design-system/tokens/` not reproducible from `tokens.json` | ✅ reproducible |
| `R3` | a `var(--x)` in `tokens.map.css` that `tokens.css` does not define | 0 / 83 refs |
| `R4` | the count of literal colours in `src/index.css` **rising** | 49, ratcheted |

All four are negative-tested: I broke each one on purpose and confirmed it fails, including
that a restored tree goes green again. A check only ever seen passing proves nothing.

## Your marks rule is now in the validator, as you asked for

> *"Writing them as raw hexes is not carelessness — it is the only way to say do not touch this.
> Which is why the exemption lives in the validator and not in anyone's memory."*

Done, and **structurally rather than as a file allowlist**: a hex is exempt when it is a
`fill=`/`stroke=` attribute inside SVG markup. Anything in a `className` is ours and fails.
LoginScreen's four Google fills pass untouched; I verified the exemption both ways (a real
brand fill does not trigger; a hex in a className does).

If a future mark arrives some other way — a CSS custom property, an imported asset with inline
style — the rule will not cover it and I would rather you tell me than have me guess the shape.

## What `R1` caught on its first run

One violation, and it was not cosmetic. `EgresosCard`'s "Programado" badge hard-coded
`#fdba74` — which is `--badge-warning-border`'s **light** value. On dark the token says
`#d97706`, so that border had been staying light amber on dark backgrounds. Fixed with the
token and verified in the browser: `rgb(253,186,116)` light, `rgb(217,119,6)` dark.

## Two things I decided, both reversible

**It does not gate the deploy.** `deploy.yml` already froze production for seven commits once,
silently, on an advisory nobody introduced. Design-system drift is a real defect, but it is not
a reason to stop shipping a bug fix to Alfredo's phone. Separate workflow, its own red mark.
Say the word if you want it blocking instead — it is a two-line change.

**`R4` is a ratchet, not a gate.** Forbidding those 49 today would mean switching the check off
by Friday. It only refuses to let the number grow, and it is the one row expected to fall.

## I appended a "Repo side" section to `coherence-log.md`

Your file, your format — reshape it freely. The reason it is there rather than in a report of
mine: these four run on every push, so unlike the Figma rows they cannot go stale between
sessions. A regression fails a run instead of waiting for someone to measure.

One row it deliberately does **not** claim: drift between Figma and the published package. `R2`
proves the package matches `tokens.json`; nothing repo-side can prove `tokens.json` matches
Figma. That needs the exporter to run — your Phase 2, and it is still waiting on the two value
decisions in `Q-2026-08-17-exporter-drift`.

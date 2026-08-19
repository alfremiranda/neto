# 13 — The rename map

> **The authority is `design-system/_build/rename-map.json`.** This document explains where each
> rule comes from, which decisions sit inside it and what is left uncovered. If the two differ,
> the JSON wins: prose degrades, data does not (`00 §A7`).
>
> It is an **authored input**, not a generated output. The exporter
> (`TASK-2026-08-17-figma-exporter`, deliverable D2) reads it. It must never derive it from the
> output that already exists: that would turn any current drift into the specification.
>
> **Derived and verified 2026-08-17** against `_build/tokens.json` and a reading of Figma's 214
> colour variables.

---

## 1. Why a map is needed

Figma names by **intent within a hierarchy** (`color/income/default`). The package publishes by
**flat family** (`--kpi-income-default`). Nobody chose that translation twice: an exporter that no
longer exists in the repo made it, and its absence is the root cause of all the drift measured in
`12-app-state.md §3.1`.

Rebuilding it is what makes it possible to generate `design-system/` again. Without the map, the
exporter would have to invent names — and **an invented name becomes a published token nobody
decided on.**

## 2. Component — a single rule

`'--' + name.replace('/', '-')`. No exceptions.

**Verified:** all 77 component keys in the export come out of exactly that rule, with an identical
value in both modes in 75 of 77. The 2 that differ are not map failures but the two already-known
disagreements (`--sidebar-surface`, `--fav-selected-foreground`).

**15 more variables** exist in Figma and were never published — the eight `account-chart/*`,
`account-summary-card/icon/foreground` and the six `breadcrumb/*`. They are adopted under the same
rule, with no decision to make: they are components built after the last export.

## 3. Semantic — rewritten prefix, first matching rule wins

22 rules in the JSON. **103 of the export's 111 semantic keys come out of them with an identical
value in both modes, and there are 0 value conflicts.** That zero is what makes the map a
reconstruction rather than a proposal.

The rules are not arbitrary; they describe three groupings the original exporter performed:

- **Collapses a level** when Figma's hierarchy is deeper than the published family:
  `color/surface/sunken` → `--surface-sunken`.
- **Regroups by role** when several Figma families share a destination: `color/danger/*`,
  `color/destructive/*` and `color/live/*` all land in `--status-*`; `color/feedback/*` and
  `color/brand/*` land in `--surface-*`.
- **Renames the concept** in exactly one case: the five figure families — `income`, `expense`,
  `provision`, `tax`, `net` — publish as `--kpi-*`. That is the rename that made people believe
  `kpi/*` did not exist in Figma (`docs/reports/2026-08-17-token-drift-measured.md`).

### The decisions I made, and they are mine

Five families had no rule because they were never published. The prefixes are Design's choice:

| Figma | Key | Why |
|---|---|---|
| `color/overlay/*` (14) | `--overlay-*` | Its own prefix, **not** `--surface-*`. `color/surface/scrim` and `color/overlay/scrim` **are different tokens with different dark values**; collapsing them under the same prefix would make them collide and one would win in silence. |
| `color/account/*` (3) | `--account-*` | The namespace frees up once the eight slot keys are killed (§4). They are the chip's neutral body, not its accent. |
| `account-accent/*` (6) | `--account-accent-*` | Matches the `codeSyntax` already written on them in Figma. |
| `color/border/strong` | `--border-strong` | The `border` rule already produces it; it was only never published. |
| `color/foreground/danger-inverse` | `--foreground-danger-inverse` | Same. |

## 4. The 8 orphan keys: **all eight are killed, none adopted**

`--account-{1..4}-{surface,foreground}`. Each encodes a **fixed account slot** — ARQ, Toptal,
Bancolombia, "other" — from before Alfredo decided the account colour is the user's to pick. None
has a source in Figma; `--account-2-surface` (`#f5f3ff`) matches no value in the file. Adopting
them would republish a dead model under names that no longer mean anything.

Seven of the eight had been invisible for months because they **collide by value with live
tokens**: their pixels match `currency/*`, `category/savings/*` or `color/account/*`, so nothing
looked broken.

**Slot 4 is byte for byte `color/account/*`.** That is the cheap migration:

| Today | Becomes | Pixel |
|---|---|---|
| `--color-account-other-bg` | `--account-surface` | identical |
| `--color-account-other-txt` | `--account-foreground` | identical |

**Slot 2 has no equivalent and must not have one.** `Badge.tsx` currently hard-wires a "toptal"
purple: that is the dead model written into code. Under the current model an account's hue comes
from user data and is painted with `--account-accent-<hue>`, not from a class named after an
account.

**Precondition:** killing the eight touches `src/**`, which is Dev's territory. Reported, not
applied (`00 §B3`) → `docs/inbox/dev/A-2026-08-17-rename-map.md`.

## 5. What this map does NOT cover

Saying so matters more than the covered part, because a map that believes itself complete makes
the exporter invent what is missing:

1. **The 108 numeric variables** (`num` block). The component ones *appear* to follow the same
   slug (`avatar/size/sm` → `--avatar-size-sm`), but **I did not verify it key by key**. Do not
   assume it.
2. **The 26 text styles** (`text` block). An entirely different shape:
   `name|weight|size|lineHeight|letterSpacing`.
3. `Primitives` and `Typography` are not published and need no map.

Points 1 and 2 are a second Design pass, and they are a requirement for the exporter to regenerate
a complete `_build/tokens.json`. Until then the exporter can emit the four colour blocks and leave
`num` and `text` as they are today.

## 6. How to re-derive this

Read the colour variables of `Semantic` and `Component` with the resolver **by mode name** (never
by index — `00 §A5 T8`, and `12 §2`), apply the JSON's rules, and compare against
`_build/tokens.json`. The expected result today is: 103 covered, 0 conflicts, 8 export keys with
no rule — which are exactly the eight dead ones.

If that comparison stops returning 0 conflicts, **the map is not what is wrong**: somebody changed
a value in Figma without regenerating, or hand-edited the output.

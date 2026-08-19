# 12 — The measured state of the architecture

> **Companion to `00-principles.md`.** That one says what the system should be; this one says
> what it is, with numbers and a date. It exists so the next session does not have to work it out
> again — and so that when someone claims "the system is fine" or "the system is broken", there
> is something to argue with.
>
> **Measured 2026-08-17.** Reproduce with `design-system/_build/audit-figma.js` (§5).

---

## 1. The verdict

**The layer model is healthy. What is missing is the machinery around it.**

That is not a figure of speech: it is what the two checks that exist precisely to detect rot in
the model say.

- **`T6` — raw values in the semantic layer: 0.** No semantic token hides a literal colour
  waiting to diverge from its primitive.
- **`T7` — a component borrowing another's token: 0.** No pair of components is married without
  anyone having written it down.

Those are the two ways a three-layer system rots from the inside, and both are at zero. That is
the hard part, and it is done well.

What is red is not architectural failure. It is **absence of enforcement** and **absence of a
build**. Both are fixable without touching the system's design.

## 2. The validator run — 2026-08-17

726 variables · 4 collections (Primitives 344 · Semantic 181 · Component 160 · Typography 41).

| Check | What it prevents (`00 §A5`) | Run | |
|---|---|---|---|
| `T5` broken alias | a token pointing at a ghost and resolving in silence | **0** | ✅ *(was 8: `currency/*` → `account/1..4`)* |
| `T6` semantic with a raw value | two sources for the same colour | **0** | ✅ |
| `T7` token borrowed from another component | two components married unknowingly | **0** | ✅ |
| `T4` code syntax without `var()` | Dev Mode hands over something unpasteable | **0** | ✅ |
| `T1` open scopes | binding the wrong token from an enormous list | **291** | 🔴 40% |
| `T2` exposed primitive | skipping the semantic layer by accident | **344** | 🔴 |
| `T3` no code syntax | whoever implements it guesses the CSS variable | **679** | 🔴 **93.5%** |
| `T8` mode casing | alias resolvers reading the wrong mode | **2** | 🔴 |

**`T3` is the most expensive of the four reds.** The entire system exists so that handover to
code is not a translation from memory, and in 93.5% of variables Dev Mode cannot say which CSS
variable to use.

**`T8` has already charged us.** `Semantic` uses `Light/Dark` and `Component` uses `light/dark`. A
resolver matching modes by index instead of by name makes **every Component→Semantic alias
resolve to Semantic Light in both modes**. That produced 21 false and perfectly credible
divergences on 2026-08-17. It is the cheapest fix in the table and the only one with a cost
already measured.

## 3. The three gaps, in order

### 3.1 There is no build — the one that blocks the others

`design-system/_build/build.py` consumes `_build/tokens.json`. **Nothing in the repo produces
that file from Figma**, nor the rename map that turns `color/income/default` into
`--kpi-income-default`. Consequence: `design-system/` **declares itself a generated artefact and
cannot be generated**.

What that costs today, measured:

| | |
|---|---|
| Variables that exist in Figma and the package never publishes | **31** — 15 Component (`account-chart/*`, `account-summary-card/*`, `breadcrumb/*`) and 16 Semantic (all of `color/overlay/*`, `border/strong`, `foreground/danger-inverse`, `account/border`) |
| CSS keys with no source in Figma | **8** — `--account-{1..4}-{surface,foreground}`, 7 of them invisible because they collide by value with live tokens |
| Values in disagreement | **2** — `--sidebar-surface`, `--fav-selected-foreground`, both light only |

While this holds, the rule of origin in `00 §A1` is policy rather than mechanism: *"when code and
Figma differ there is a defect with a known direction"* is true, but nobody can apply the
correction.

### 3.2 The validator exists and nothing runs it

`00 §A4` says: **a component is not finished until the audit passes over it.** That is a threshold
only if something runs it. Today a person runs it when they remember, which is the definition of
not having it. `00 §A7` already anticipates this: *"if only one of the three pieces can be kept,
the validator — prose degrades, the script does not."* The script is here; the trigger is not.

### 3.3 The `T1`/`T2`/`T3` debt (deliverable A7)

970 corrections. A mechanical sweep, not a judgement: every variable needs narrowed scopes,
primitives hidden, and `codeSyntax` with `var(--name)`. Large, but with no decisions inside. It
goes after 3.1 and 3.2, because without a build or a trigger it just accumulates again.

## 4. What this means for Storybook (D1)

The plan puts D1 **after A5/A6** on the argument that *"today it would be almost empty"*.
Measured: **`src/components/ui/` has 24 extracted components** and `design-system/components/` has
57 generated previews. The argument does not hold: A5/A6 unblock **badges and item rows**, not the
library.

**But the real dependency is a different and harder one.** D1's two non-negotiable conditions —
visual regression from day one, and a header saying which version of `design-system/` is being
painted — are hollow without a build:

- **Visual regression would freeze as its reference an artefact already off by** 31 variables and
  2 values. It would be a drift detector calibrated against the drift.
- **The version header can say nothing** about a package nobody can reproduce from its source.

`neto-fase-1.5.md §4bis` says it another way without noticing: *"Figma is the truth of what should
be; Storybook is the proof of what is."* A proof needs a standard. **The standard is the
exporter.**

→ **D1 does not depend on A5/A6. It depends on 3.1.**

## 5. How to reproduce this measurement

Paste `design-system/_build/audit-figma.js` into a `use_figma` call and return
`await auditTokens()`. It is pure reading; it mutates nothing. The node audit (`auditPage`) needs
**one call per page**: Figma loads pages on demand and `setCurrentPageAsync` can only be called
once per script.

When re-measuring, update §2's table with the date. An undated table in this document is worth
exactly what a claim from memory is worth — which in this project is zero.

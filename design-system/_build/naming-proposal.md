# Phase 1.1 · Token rename — proposal for review

**Nothing has been applied.** This is the dry run. Phase 1.2 applies only what is approved,
and it is the one step in the roadmap that cannot be undone cheaply.

Machine-readable version: `naming-map.json` · Convention: `../docs/21-token-naming.md`

---

## The measurement

Every number below was produced by `naming-analysis.js` and is reported only because two
consecutive passes agreed (`00-principles §B4`). The first pass counted **4183** bindings;
the converged answer is **10108**. A single pass would have under-reported by 59% without
raising an error — which is the whole reason the rule exists.

| | |
|---|---:|
| Semantic colour tokens | **138** |
| Bound on a product screen | **48** |
| Bound only in documentation swatches | **58** |
| Bound nowhere at all | **32** |
| Groups of tokens holding an identical value | **29** |

**65% of the semantic colour collection does not appear on a single product screen.**

---

## Three findings that decide the shape of the rename

### 1 · `color/border/focus` is not a border

| bindings as stroke | bindings as effect |
|---:|---:|
| **0** | **12** |

It is the focus ring shadow, and always has been. The name has been wrong since it was
created and nothing in the system could tell us, because nothing derives scope from the
name. → becomes **`shadow/focus`**.

### 2 · `color/interactive/primary` is doing three jobs

| fill | stroke | text |
|---:|---:|---:|
| **234** | **185** | **18** |

437 bindings that cannot move independently. Darkening the button border today means
darkening the button. It splits into `bg/brand`, `border/brand-strong` and `fg/brand` —
all keeping `#0e7490`, so the split is visually free.

### 3 · `/default` means the opposite thing in adjacent families

| token | what it actually paints |
|---|---|
| `color/tax/default` | solid **background** (14 fills) |
| `color/net/default` | solid **background** (14 fills) |
| `color/income/default` | **text** (4 text bindings) |

Same suffix. Opposite property. Sibling families. This is the clearest single argument for
putting the property first.

---

## What happens to each token

### Renamed in place — 57 tokens

The bulk of the work. A few worth flagging:

| from | to | why it is not just cosmetic |
|---|---|---|
| `color/wrap/card` | `bg/surface` | "card" is a component; the token is a role |
| `color/foreground/subtle` | `fg/subtle` | ⚠️ 28 of its bindings are **strokes** — they move to the new `border/subtle` |
| `color/border/default` | `border/default` | ⚠️ 88 of its bindings are **fills** on 1px shapes. Audit item, not a rename |
| `color/overlay/brand` (10%) | `bg/brand-subtle` | |
| `color/interactive/primary-overlay-subtle` (20%) | `bg/brand-muted` | it is currently called *subtle* while being the **stronger** of the two |

### Split — 5 tokens become 12

`color/interactive/primary` → `bg/brand` · `border/brand-strong` · `fg/brand`
`color/foreground/placeholder` → `fg/placeholder` · `fg/disabled` *(the Component collection
already aliases it as `disabled` — two contracts sharing one value by accident)*
`color/expense/default` → `fg/expense` · `bg/expense`
`color/provision/default` → `fg/provision` · `bg/provision` *(14 / 14 — a dead-even tie)*
`color/income/default` → `fg/income` · `bg/income`

### Merged — 9 tokens collapse into 6

`wrap/container` → `bg/canvas` · `foreground/on-card` + `on-popover` → `fg/default` ·
`surface/raised` + `surface/elevation/raised` → `bg/raised` · `surface/sunken` +
`interactive/secondary` → `bg/subtle` · `danger/default` → `fg/danger` ·
`danger/surface` → `bg/danger-subtle`

⚠️ **Four of these are marked PENDING in the map.** They are identical in Light mode, which
is not sufficient — elevation is often carried by fill in Dark and by shadow in Light. The
Dark values get checked before any merge is applied.

### Deleted — 19 tokens

Duplicates and dead weight. The one worth reading:

> **`color/brand/default` and `color/brand/emphasis` are not the brand colour.**
> They hold sky blue — `#e0f2fe` and `#0284c7`. Neto's brand is cyan, `#0e7490` / `#06b6d4`.
> Nothing binds them, so nothing ever broke. The name was simply never true.

### Reserved — 19 tokens kept deliberately unused

`color/categorical/1-5` → `chart/categorical/*` and `color/sequential/1-5` → `chart/sequential/*`
are unbound because the three annual charts and the distribution bar are **Phase 4**.
Deleting them means re-minting them in six weeks.

`account-accent/*` is unbound in five of six hues because the mocks contain one account. It
is the palette a user picks from — absence of use is not absence of purpose.

Three overlay tokens (`hover`, `pressed`, `selected`) survive because the translucent state
layer is what **Phase 3** will need for states on coloured surfaces. The other nine overlays go.

### New — 2 tokens

`border/subtle` — somewhere legitimate for the 28 stroke bindings currently squatting on
`fg/subtle`.
`fg/on-solid` — white on any solid semantic fill, instead of every family borrowing
`destructive/foreground`.

### Renamed as identity, not property — 30 tokens

`color/category/{name}/default` → `category/{name}/accent`, and `/surface` keeps its name.
These are exempt from property-first by Rule 2: the reader is choosing *home*, not *a
background*. `default` becomes `accent` because measurement shows these paint the icon
glyph and the identity dot — "default" was saying nothing.

---

## Net effect

| | before | after |
|---|---:|---:|
| Semantic colour tokens | 138 | **121** |
| Tokens whose name predicts their property | 0 | **121** |
| Tokens doing more than one job | 5 | **0** |
| Vocabularies for "background" | 4 | **1** |
| Families meaning "error" | 3 | **1** |

---

## What I need from you

1. **Approve or amend the convention** in `../docs/21-token-naming.md` — especially Rule 2
   (identity colours exempt) and Rule 4 (the closed ladder `subtle < muted < default < strong`).
2. **`color/income/foreground` is `#0e7490` — the same value as the brand cyan.** I think
   that is an accident rather than a decision. Confirm before I carry it into `fg/income-strong`.
3. **The 19 deletions.** Once applied they are gone; everything else is reversible.

Phase 1.2 does four things in one pass — rename, derive scopes from the property prefix,
generate `codeSyntax`, and write an intent description on every token — so it is worth
getting this file right before it runs.

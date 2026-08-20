# 21 · Token naming

Status: **proposed**. The map that applies it is `_build/naming-map.json`. Nothing in this
document is in Figma yet.

A token name is the only part of the design system a person reads at the moment they
have to make a decision. It has one job: make the right choice obvious and the wrong
choice look wrong. Every rule below exists to serve that, and each one is testable —
if a rule cannot be checked by a script, it is a preference, not a rule.

---

## Rule 1 · Property first, for UI colour

```
{property}/{role}/{variant}
```

`property` is a closed set of four: **`bg` · `fg` · `border` · `shadow`**.

This is the load-bearing rule, because it makes three things *derivable* instead of
remembered:

| derived | from |
|---|---|
| the Figma **scope** (which pickers offer the token) | `bg/*` → frame & shape fill · `fg/*` → text & shape fill · `border/*` → stroke · `shadow/*` → effect |
| the **codeSyntax** | `bg/brand-muted` → `--bg-brand-muted` |
| whether a binding is **legal** | a `fg/*` token on a stroke is a defect the auditor can catch without knowing anything about the design |

Today none of those three are derivable, and the cost is measurable: `color/border/focus`
has **zero** stroke bindings and twelve effect bindings. The name has been lying since the
day it was made, and nothing could tell us.

## Rule 2 · Identity colour is exempt

Chart series, expense categories and account accents are named by **which thing**, not
which property:

```
category/{name}/{accent,surface}
chart/{categorical,sequential}/{n}
account/{hue}
```

Forcing `bg/category-home` on these would be consistent and wrong — the reader is
choosing *home*, not *a background*. The exception is written down here so that it is a
decision rather than a drift.

## Rule 3 · `on-X` is a contract, not a shade

`fg/on-brand` means **legible on `bg/brand`**. It never means "a lighter brand".
If a surface has no `on-` partner, text on it is unverified.

## Rule 4 · The prominence ladder is closed — six rungs

```
subtlest  <  subtle  <  muted  <  default  <  strong  <  strongest
```

The default rung is **unsuffixed**, so the token you reach for most has the shortest name:
`bg/brand`, never `bg/brand-default`.

| rung | suffix | primitive it usually maps to | what it is for |
|---:|---|---|---|
| 1 | `-subtlest` | `50` | page-level wash |
| 2 | `-subtle` | `100` | hover tint, selected row |
| 3 | `-muted` | `200` | chip and badge fill, divider |
| 4 | *(none)* | `500`-`600` | the solid, the identity of the role |
| 5 | `-strong` | `700` | text on a light surface, emphasis |
| 6 | `-strongest` | `800`-`900` | maximum contrast |

That order is the definition, not a suggestion. `subtle` is weaker than `muted`, and if that ever
reads backwards to someone, this table is the answer rather than their intuition.

`emphasis`, `accent`, `primary`, `secondary`, `soft`, `bold` and `hover-2` are **not admissible**.
Today the collection uses seven of those interchangeably, and
`color/interactive/primary-overlay-subtle` (20% opacity) is *stronger* than `color/overlay/brand`
(10%) - which means the word "subtle" currently carries no information at all.

**The ladder is a vocabulary, not an inventory.** Six rungs x six roles x four properties would be
144 tokens nobody asked for, and we have just finished proving what happens when tokens exist
before a use does: 90 of 138 are bound nowhere. A rung comes into existence when a design needs
it. The rule is only that when it does, it is called by its rung and not by a new adjective.

## Rule 5 · State is a suffix

```
bg/brand · bg/brand-hover · bg/brand-active · bg/brand-disabled
```

Not a family (`status/hover`), because a state has no meaning detached from the thing
it is a state of. Interaction states are Phase 3; this rule is what Phase 3 will build on.

## Rule 6 · A token names its job, never its value

`#0e7490` is `bg/brand`, not `cyan-700`. The hue lives in Primitives and is allowed to be
named after itself there; the moment a value acquires a meaning it loses the right to be
named after its appearance.

## Rule 7 · One job per token

If measurement shows a token painting two properties, it **splits**. It is never resolved
by choosing the more popular one.

`color/interactive/primary` is bound 234 times as a fill, 185 times as a stroke and 18
times as text. Picking "fill" and moving on would silently mis-scope 203 bindings and make
it impossible to darken a border without darkening every button. All three survive the
split with the same value; what they gain is the ability to diverge.

## Rule 8 · Absence of use is not absence of purpose

32 tokens are bound nowhere and 58 more appear only in documentation swatches — 90 of 138,
**65% of the collection**. Most of that is dead weight. But `color/categorical/*` and
`color/sequential/*` are unbound because the charts they exist for are Phase 4, and
`account-accent/*` is unbound because the mocks contain one account.

So the disposition of an unused token is a judgement, and the judgement gets written down
in `naming-map.json` under `delete` or `reserve`. Never a bulk sweep.

## Rule 9 · Alpha is a second ladder, orthogonal to the first

Some roles have to exist as translucency as well as as colour. The rungs are the ones the
Primitives collection already carries for every hue - **`10 · 20 · 30 · 50 · 70 · 90`** - because
inventing a parallel set would guarantee the two drift apart.

```
bg/brand-alpha-10        border/brand-alpha-50        bg/neutral-alpha-20
```

Alpha tokens carry the number in the name **on purpose**. It is the same reason semantic spacing
works and semantic colour did not: the value *is* the information, and an adjective would make two
people guess differently about which of two translucencies is the stronger one.

### When opaque, when alpha

They are not interchangeable, and this is the test:

| reach for opaque (`-subtle`) | reach for alpha (`-alpha-20`) |
|---|---|
| what is underneath is known | what is underneath is unknown, or is an image |
| text sits on it and contrast must be guaranteed | it is a layer that has to stack with others |
| the surface **is** the thing | the tint is a **state** on the thing |

A hover on a white card can be either. A hover on a coloured category chip **must** be alpha - an
opaque tint would erase the category, which is the one thing that chip exists to say.

### Which roles get one

**`brand`** and **`neutral`** (slate), at all six rungs, usable as `bg`, `border` and overlay.
They are the two roles that have to sit on top of surfaces we do not control. Any other role gets
an alpha ladder when a design needs one, at the same six rungs.

Pure black and white alphas stay in Primitives. A scrim has exactly one job, so it gets a name
that says the job - `bg/scrim` - not a rung.

---

## What this replaces

The current collection carries four overlapping vocabularies for the same idea —
`wrap/*`, `surface/*`, `surface/elevation/*` and `status/*` all describe backgrounds; and
three families describe error — `danger/*`, `destructive/*` and `feedback/danger*`.
29 groups of tokens hold identical values, including ten separate tokens for `#ffffff`.

Two findings are worth stating on their own, because they are what convinced me the
rename is not cosmetic:

1. **`color/border/focus` is not a border.** Zero strokes, twelve effects.
2. **The two tokens named `brand` are not the brand colour.** They hold sky blue
   (`#e0f2fe` / `#0284c7`); Neto's brand is cyan (`#0e7490` / `#06b6d4`). Nothing binds
   them, so nothing broke — the name was simply never true.

A naming convention that cannot be verified produces exactly these. Rule 1 exists so the
auditor can.

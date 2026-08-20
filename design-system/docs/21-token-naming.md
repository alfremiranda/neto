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

## Rule 4 · The prominence ladder is closed

```
subtle  <  muted  <  default  <  strong
```

Four rungs, in that order, no synonyms. `emphasis`, `accent`, `primary`, `secondary`,
`hover-2` and friends are not admissible without amending this file. Today the collection
uses `emphasis`, `strong`, `subtle`, `accent`, `primary`, `secondary`, `default` and
`overlay-subtle` interchangeably — and `color/interactive/primary-overlay-subtle` (20%
opacity) is *stronger* than `color/overlay/brand` (10%), which means the word "subtle"
currently carries no information at all.

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

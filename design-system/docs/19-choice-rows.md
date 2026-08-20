# 19 — ChoiceRow and AccountRow

Created 2026-08-20. Alfredo pointed at three frames in the onboarding flow and said they were
ready to become components. They were — but they were not three components. They were two.

## What the three drawings actually were

| Frame | Where | Anatomy |
|---|---|---|
| `549:955` | Moneda · secondary currency | text · **trailing Radio** |
| `549:1199` | Perfil · options | **leading icon tile** · text + description · **trailing Radio** |
| `549:1046` | Cuentas · account | **leading Radio** · text + description · **trailing badge** (+ remove) |

The first two are the same thing with a slot turned on: a single choice among options. The third
is not. Its control **leads** and it does not state a choice — it states a fact, that the account
is included — and its trailing slot holds metadata and an action.

So: **`ChoiceRow`** for the first two, **`AccountRow`** for the third. Same skeleton, opposite
grammar. Forcing them into one component would have needed a `Control = Leading | Trailing` axis
and a trailing slot that means two different things, which is how a component ends up with a
property nobody can explain.

## The shared skeleton

Both are `HORIZONTAL`, gap `spacing/12`, padding `spacing/12` × `spacing/16`, radius `radius/xl`,
1px `border-width/default`, and both take the state language from `CurrencyRadio` so the family
reads as one:

| State | not selected / Fixed | selected / User |
|---|---|---|
| Default | `wrap/card` · `border/default` 1 | `overlay/brand` · `interactive/primary` 1 |
| Hover | `wrap/card` · **`border/strong`** 1 | `overlay/brand` · `interactive/primary` **2** |
| Focused | as Default **+ ring** | as selected **+ ring** |
| Disabled | as Default, opacity 0.5 | as selected, opacity 0.5 |

Eight variants each — `State` × `Selected` for `ChoiceRow`, `State` × `Type` for `AccountRow` —
which is the same shape `CurrencyRadio` already had. Everything structural is a **boolean
property**, not a variant: `Show media`, `Show description`, `Show badge`. That is what keeps the
matrix at 8 instead of 32.

## Why `Type = Fixed | User` and not `Selected`

The leading check on `AccountRow` is always on: it means *this account is included*. What varies
is whether the person can take it out. `Fixed` is what the product includes and nobody removes
(Efectivo); `User` is what the person added, and it carries the brand wash, the primary border
and the remove button. Naming that axis `Selected` would have made the check and the wash look
like the same state when they are not.

## The trap: a focus ring that tints its own fill

The focus ring is two spread-only drop shadows — 6px `border/default` and 4px `border/focus` —
copied from `CurrencyRadio`. Built that way, `ChoiceRow`'s selected-and-focused variant came out
**solid cyan** instead of a pale wash with a ring.

The fill was not wrong: measured, it was `overlay/brand` at 10% in every selected variant,
identical to the ones that rendered correctly. The difference was one property.
**`showShadowBehindNode`** defaults to `true`, so the cyan ring is painted under the row — and a
10% wash over a solid cyan rectangle reads as solid cyan. `CurrencyRadio` had it `false`.

> **A spread-only drop shadow used as a focus ring must set `showShadowBehindNode: false`.**
> Otherwise it tints any translucent fill it sits under, and it does it silently — the fill still
> reports the right token and the right opacity.

Found by comparing the two components' rendered output, not their properties. The properties
matched.

## The sweep

Every hand-built row in the onboarding flow was replaced, preserving its content: label,
description, selection, icon glyph and currency were read off each frame before it was removed.

| | instances |
|---|---|
| `ChoiceRow` | 52 |
| `AccountRow` | 28 |
| `CurrencyRadio` | 16 |

**Orphan rows left: 0.** And `C8` over the page: 0 gaps, 0 paddings, 0 radii, 0 border widths,
measured twice.

## One thing left open

`Type=User` gives every account the person adds a brand wash and a primary border. With one
account that reads as *this is yours*; with five it is a wall of cyan. It is drawn as designed
and it is not mine to change — but if the account list is meant to grow, the emphasis probably
belongs to *recently added* rather than to *user-added*.

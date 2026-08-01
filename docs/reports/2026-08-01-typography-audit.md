# Typography audit — spec (03-typography.md) vs code

Read-only. Nothing was changed. This is the spec→code mapping that did not exist, written so the
Rethink Sans migration can be scoped instead of guessed at.

**Why it was missing:** `05-handoff-tokens.md` scopes itself to "one file: `src/index.css`, 20
values". It has **no §7**. A relayed message deferred Rethink Sans "to §7 of the handoff", but that
section is not in the committed doc — so under v3 the typography work has no ticket, no spec→code
map, and no recorded decision on `--font-sans` / `--font-mono` / `--font-heading`.

## Headline numbers

| | |
|---|---|
| Size declarations in components | **352** (228 scale classes + 124 arbitrary `text-[Npx]`) |
| Distinct sizes in use | **15** — against 10 in the spec |
| `font-mono` + `font-heading` usages | **83** (41 + 42) |
| Sizes with no spec equivalent | **15px** (5), **13px** (1), **30px** (2) |
| `font-light` / `font-thin` | **0 — the migration is safe on this axis** |

## The one risk that is already cleared

Rethink Sans ships no Light or Thin. The app uses neither: weights are `normal` (8), `medium` (65),
`semibold` (58), `bold` (35), and **zero** `light`/`thin`/`extrabold`. Nothing breaks on weight
availability.

The mirror of that: the spec's `Heading/Display` is **ExtraBold**, and `font-extrabold` appears
nowhere. Display either gets implemented or dropped from the spec.

## Where the app already agrees

`index.css` h1–h6 and `p` are closer to the spec than the components are:

| Element | Code | Spec | |
|---|---|---|---|
| `h2` | 20/28 600 | `Heading/Section` 20/28 SemiBold | ✅ |
| `h3` | 18/28 600 | `Heading/Subsection` 18/28 SemiBold | ✅ |
| `h4` | 16/24 600 | `Heading/Card` 16/24 SemiBold | ✅ |
| `h5`,`h6` | 14/20 600 | `Heading/Group` 14/20 SemiBold | ✅ |
| `p` | 14/1.5 → 21 | `Body/Base` 14/21 Regular | ✅ |
| `h1` | 24/32 **600** | `Heading/Display` 24/32 **ExtraBold** | ⚠️ weight |

`h1`–`h3` also carry negative letter-spacing (`-0.02em`/`-0.015em`/`-0.01em`) that the spec does not
bind. Rethink Sans has different default metrics from Geist Mono, so these need re-deciding, not
porting.

## Size-by-size mapping

| Code | Uses | Spec landing | Note |
|---|---|---|---|
| `text-3xl` 30px | 2 | **none** | off-scale; nearest is Display 24 |
| `text-2xl` 24px | 5 | `Heading/Display` | needs ExtraBold |
| `text-xl` 20px | 10 | `Heading/Section` · `Amount/Hero` | ambiguous by size alone |
| `text-lg` 18px | 4 | `Heading/Subsection` · `Control/XL` | ambiguous |
| `text-[17px]` | 2 | `Amount/Large` 17/26 Bold | ✅ clean |
| `text-base` 16px | 13 | `Heading/Card` · `Control/LG` | ambiguous |
| `text-[15px]` | 5 | **none** | must snap to 14 or 16 |
| `text-sm` 14px | 118 | `Body/Base` · `Base-Emphasis` · `Amount/Base` · `Heading/Group` · `Control/MD` | 5 candidates |
| `text-[13px]` | 1 | **none** | must snap to 12 or 14 |
| `text-xs` 12px | 76 | `Body/Small` · `Small-Emphasis` · `Amount/Small` · `Control/SM` | 4 candidates |
| `text-[12px]` | 9 | same as above | duplicate spelling of `text-xs` |
| `text-[11px]` | 59 | `Detail/Large` · `Label/Base` | Regular vs Medium decides |
| `text-[10px]` | 44 | `Detail/Base` · `Detail/Emphasis` · `Label/Micro` · `Label/Badge` · `Amount/Micro` · `Control/XS` | 6 candidates |
| `text-[9px]` | 3 | `Detail/Nano` 9/14 Medium | ✅ clean |
| `text-[0px]` | 1 | n/a | `IngresosCard.tsx:202`, a visual-hiding hack |

**This table is the actual finding.** The migration is not a font swap — it is a *semantic
classification* of 352 declarations. Size alone does not identify a style: 14px maps to five
different styles and 10px to six. Only the surrounding meaning does, which is exactly what the
spec asks for ("ask what the text *is*"). It cannot be done with sed.

## Conformance gaps, independent of Rethink Sans

1. **The emphasis rule is broken in 35 places.** The spec: *"Emphasis in running text is Medium,
   never SemiBold."* 35 of the 58 `font-semibold` sit on `text-sm`/`text-xs` — body sizes. Either
   they become Medium or they are actually `Amount/` figures wearing body sizes.
2. **`text-2xs` is dead config.** `tailwind.config.js` defines it as 10/14 and **nothing uses it**,
   while 44 places write `text-[10px]` by hand. That is `Detail/Base` with a name already.
3. **`--font-heading` aliases `--font-mono`.** Every one of the 42 `font-heading` usages renders as
   Geist Mono today. Dropping mono collapses both to one family in a single move — the alias makes
   this cheaper than the 83 count suggests, but it also means *headings currently look monospaced
   on purpose* and will not after.
4. **Line heights are mostly unset.** 36 `leading-*` usages against 352 size declarations; the rest
   inherit. The spec binds line height on all 26 styles, so most text will shift vertically.

## Recommended shape for the migration

Three tickets, not one:

1. **Install + collapse the family.** Add Rethink Sans, delete Geist Mono, point `--font-sans` at
   it, and redefine `--font-heading` (it cannot keep aliasing a family that no longer exists).
   Mechanical, verifiable, and reversible on its own.
2. **Encode the 26 styles.** As Tailwind components or a `text-*` plugin, so a style is one class
   binding all five properties, and `text-[11px]` stops being a decision made 59 times.
3. **Classify the 352 declarations** against those styles, file by file, resolving the 8 off-scale
   values (15px, 13px, 30px) and the 35 emphasis violations as they come up.

Only #1 is safe to do without design review. #3 is where the visual change lands and needs the
same light/dark pass the radius work is already waiting on.

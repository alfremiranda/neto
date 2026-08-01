# Component gap — Figma vs code

The audit nobody had run. Colour, radius, spacing and typography have all been reconciled as
*tokens*; **nothing had ever compared the components themselves** — their form, their spacing, and
the states they model. Dev flagged the shape of it twice: 58 previews in `design-system/components/`
against 23 files in `src/components/ui/`, and no comparison beyond tokens.

This is that comparison.

**Method and its limits.** Figma read through the Plugin API — variant definitions, auto-layout
padding, gaps, radii, text properties. Code read from the declared Tailwind classes in
`src/components/ui/`, not from computed styles. So this catches what the source *says*; Dev's
Playwright harness catches what the browser *does*, and it should be pointed at anything below that
looks surprising. Hover, focus and disabled treatments, dark-mode geometry, and animation are **not**
covered — see §6.

---

## 1. What the 58-vs-23 gap actually is

It is not missing design. It is missing *extraction*.

| | Count |
|---|---|
| Figma components with an extracted code counterpart | **21** |
| Figma components that exist in code only as inline markup inside a view or card | **37** |
| Code components with no Figma counterpart | **2** (`drawer`, `SheetBase` — both wrappers) |

The 37 are real UI that ships every day: every badge (`AccountBadge`, `CurrencyBadge`, `TRMBadge`,
`NotificationBadge`, `category-badge`, `Status`), every item row (`income-`, `outcome-`, `savings-`,
`ss-`, `transfer-itemrow`), every container (`Income`, `Expense`, `Provision`, `Tax`, `Transfer`),
`Avatar`, `Favorite`, `Indicator`, `action-chip`, `menu-item`, `Tab`, `bottom-nav`, `topnav`,
`monthnav`, `FAB`, `KPI-Card`, `AccountCard`, `SavingsCard`, `DistribucionCard`, `chart-legend`.

Figma treats them as components; the app writes them by hand inside `cards/`, `layout/` and
`views/`. That is why a token change reaches everything but a *shape* change reaches nothing — there
is no single place to change. It is also why `AccountCard` in Figma has a `State=Hover` variant and
the app has hover styling copied into several files.

**This is a decision, not a defect** — see §5.

---

## 2. Where the code and Figma disagree, in order of what it costs

Every number below is measured on both sides. These are code changes: `src/**` is Dev's.

**1 — `Popover` disagrees on all three of its properties.**

| | Figma | Code |
|---|---|---|
| padding | 12 | `p-2.5` = 10 |
| gap | 8 | `gap-2.5` = 10 |
| radius | 8 | `rounded-xl` = 12 |

The worst-matched primitive in the system, and it is invisible because nothing ever compared them.
The radius half is settled by the new `input/menu/radius` token — see §3.

**2 — `Card` has no space between its header and its content.**

Figma: header `padding-bottom: 0`, content `padding-top: 16`. Code: header `pb-0`, content
`px-4 pb-4` — no top padding, and the root `Card` sets no gap. So the title block and the content
sit flush. Four cards use it (`IngresosCard`, `EgresosCard`, `ProvisionesCard`, `MovimientosCard`).

**3 — `CardTitle` is the wrong weight.**

`text-base font-medium leading-snug` = 16px **Medium**, unset line height. `Heading/Card` is 16/24
**SemiBold**. It should be `.ts-heading-card`, which also fixes the line height.

**4 — `Toast` carries the only 13px in the app.**

`text-[13px]` — one of the eight off-scale sizes the typography audit found, and this is its single
usage. Figma's toast label is 12 Regular = `Body/Small`. Vertical padding is also `py-[10px]`
against Figma's 8, which is what makes the pill 38px instead of 34px.

**5 — `Select` menu: surface and rows.**

| | Figma | Code |
|---|---|---|
| surface radius | `input/menu/radius` = 8 *(new)* | `rounded-xl` = 12 |
| item height | `input/menu/item-height` = 32 | `py-2` + 20px line ≈ 36 |
| item padding-left | `input/menu/item-padding-x` = 8 | `pl-3` = 12 |

The tokens existed and nothing was reading them.

**6 — `MetricCard` padding is 12, Figma says 16.**

`p-3` against a 16 that every other card in the system uses.

**7 — `Empty` media tile radius is 12, Figma says 8.**

`rounded-xl` on the 32px icon tile; Figma has 8, and `06-radius-map.md` already recorded it as
"`xl` outer + `lg` on the media tile". Exactly the kind of thing that map exists to catch.

**8 — `SectionCard` header padding-bottom is 12, Figma says 8.**

`pb-3` against 8. The rest of `SectionCard` matches, including the 0-top content.

**9 — `Button` size XL padding-x is 16, Figma says 18.**

`px-4`. The other three sizes match exactly (8 · 10 · 14).

**10 — `Input` is responsive where Figma is sized, and the padding does not follow.**

Figma has `SM` 28 · `MD` 36 · `LG` 44, with padding-x 12 · 12 · **16**. Code has one input at
`h-11 sm:h-9` — LG on mobile, MD on desktop — with `px-3` (12) at both. So the mobile input is an
LG height wearing MD padding. `Select` and `DatePicker` do the same thing.

**11 — `ui/sheet` sets no radius at all.**

Figma's `Sheet` is 16. `RowActionsSheet` already gets this right (`rounded-t-2xl`); the generic one
inherits nothing.

### What already matches, verified

`Icon Button` (24 · 28 · 36 · 44 with 12 · 12 · 16 · 20 icons — exact, including the six
variant/severity combinations), `Switch` (36×20, 16px thumb, 2px inset), `Tooltip`, `Skeleton`
(6px on the lines), `Empty` outer (24 padding, 16 gap, 12 radius), `Badge` geometry (20 tall, 8
padding-x, pill, 10/10 text), `Card` and `SectionCard` radius, `RowActionsSheet`, `Button` sizes SM
through LG.

---

## 3. What was wrong in Figma — fixed in this commit

**`button/text/sm/size` was 11.** The Control scale is 10 · 12 · 14 · 16 · 18. The Button's own
token was the only thing in the file asking for an 11px that no text style could supply, which is
why Dev had to choose between inventing a rung and using `Control/XS`. Now 10, so the component and
the scale agree. Safe: `size="xs"` has zero usages, and the code already renders `Control/XS`.

**`input/menu` had no radius token.** It has `padding-y`, `item-height` and `item-padding-x` but
nothing for the surface, so the app invented 12 while `Popover` — the same kind of floating surface
— specs 8. Added as `radius/lg` (8): a dropdown belongs to the popover family, not the card family,
and two radii for one kind of surface is exactly the drift this work exists to remove.

---

## 4. Dead configuration in code

Found while comparing variant axes. All confirmed by grep, none of them referenced anywhere:

| Entry | Usages | Figma counterpart |
|---|---|---|
| `Button variant="secondary"` | **0** | none — Figma models Variant × Severity, and `secondary` is neither |
| `Button variant="link"` | **0** | none |
| `Button size="lg"` (40px) | **0** | none — Figma's steps are 24 · 28 · 36 · 44, and 40 is not one |
| `Button size="xs"` | **0** | `Size=SM` (already known) |

The four `size="lg"` in the app are all `IconButton`, where `lg` is 36 and correct.

`Button size="lg"` is worth a sentence on its own: it is a fifth size at a height the system does
not have, sitting unused in the one component everything else instances. Same shape as `text-2xs`.

Two axes genuinely differ and are **not** dead:

- **`Badge` is two different components wearing one name.** Figma's `Badge` is generic — six
  colours × icon. The app's `Badge` is domain — `usd`, `cop`, `arq`, `toptal`, `bancol`, `otro`,
  `ss`. The app's real Figma counterparts are `AccountBadge` (4 colours) and `CurrencyBadge`
  (USD/COP), which is exactly what those two components are for. Figma's generic `Badge` has no code
  counterpart at all. Mine to resolve; it is a naming decision, not a value.
- **`Input` has a `leadingIcon` boolean in Figma and no slot in code.** `Select` and `DatePicker`
  each hand-roll their own leading icon instead.

---

## 5. The 37, and the decision behind them

Extracting all 37 is not the goal — some are one-offs and belong inline. But three groups earn it,
and each has already cost something concrete:

- **`Avatar`.** Dev had to leave the header's avatar trigger as a raw `<button>` because there is no
  component, and the initials ship at 10px where `avatar/font-size/sm` says 12. There is a full
  Figma component with four sizes and its own tokens, unused.
- **The five item rows.** `income-`, `outcome-`, `savings-`, `ss-` and `transfer-itemrow` are the
  densest, most repeated surface in the product and every one is hand-written inside its card.
- **The badges.** Six Figma components (`AccountBadge`, `CurrencyBadge`, `TRMBadge`,
  `NotificationBadge`, `category-badge`, `Status`) against one code `Badge` plus inline spans — which
  is why the notification count ended up at 9px with a hand-written `tabular-nums`.

Also surfaced while measuring: the Figma `Sidebar` row is **40px** and the app's is 32; the drawer
avatar is **44px** when the Avatar scale is 32 · 40 · 48 · 56. Both are the same symptom — geometry
drifting where no component holds it.

---

## 6. What this audit does not cover

Named so nobody reads more into it than it earned:

- **States.** Figma models `Hover`, `Disabled`, `Focused`, `Selected`, `Confirming` as variants;
  code models them as pseudo-classes and `data-` attributes. The two are not comparable by reading
  either side — it needs a rendered pass, state by state, which is Dev's Playwright harness.
- **Dark mode geometry.** Everything above was measured in light.
- **The 37 unextracted components.** They were counted, not measured. There is no source of truth in
  code to measure them against.
- **Animation and transitions.** Figma holds none of it.
- **Computed vs declared.** Read from Tailwind classes. A class that is overridden at a call site
  will not show up here.

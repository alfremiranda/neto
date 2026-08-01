# Handoff — token reconciliation

> Design session 2026-07-31 · every call made case by case against Figma
> Figma is already updated. This is what is left on the code side.
> **This file lives in the repo on purpose.** It was previously kept outside it, which meant Dev
> could not reach it. Uncommitted work does not exist for the other agents.

## Scope

One file: **`src/index.css`**. 20 values, of which **1 is already applied**.

No structural changes. No `tailwind.config.js`. None of these change behaviour — they are all
colour values. `npm run build` and `npm test` must pass without touching anything else.

---

## 1 — Real bug ✅ APPLIED

In `.dark`, the destructive button's foreground was cyan, not red.

```diff
  .dark {
-   --destructive-foreground: #083344;   /* cyan-950 — copied from primary */
+   --destructive-foreground: #450a0a;   /* red-950 — status/destructive/foreground */
```

`#083344` is `color/cyan/950`, sitting on a red button.

---

## 2 — Red family: residual `rose` → `red`

The code carries `rose` over from the old oklch palette. Figma is consistent on `red`.

```diff
  :root {
-   --destructive:        #ef4444;   /* red-500  */
+   --destructive:        #dc2626;   /* red-600 — status/destructive/default */
-   --color-danger:       #ef4444;
+   --color-danger:       #dc2626;   /* status/danger/default */
-   --color-expense-bg:   #fff1f2;   /* rose-50  */
+   --color-expense-bg:   #fef2f2;   /* red-50  — kpi/expense/surface */
-   --color-danger-bg:    #fff1f2;
+   --color-danger-bg:    #fef2f2;   /* status/danger/surface */
-   --color-expense-txt:  #be123c;   /* rose-700 */
+   --color-expense-txt:  #b91c1c;   /* red-700 — kpi/expense/foreground */
-   --color-danger-txt:   #be123c;
+   --color-danger-txt:   #b91c1c;   /* status/danger/foreground */
  }
```

---

## 3 — Category dark mode: uniform `-950` background / `-300` text

All 15 categories go to the darkest tint. Seven were already at `-950`; the rest sat at `-900`
for no reason. Figma is updated (six missing `-950` primitives were created: teal, orange, blue,
indigo, sky, violet).

```diff
  .dark {
-   --cat-home-bg:       #134e4a;   /* teal-900   */
+   --cat-home-bg:       #042f2e;   /* teal-950   — category/home/surface */
-   --cat-bank-bg:       #1e3a8a;   /* blue-900   */
+   --cat-bank-bg:       #172554;   /* blue-950   */
-   --cat-health-bg:     #881337;   /* rose-900   */
+   --cat-health-bg:     #4c0519;   /* rose-950   */
-   --cat-transit-bg:    #713f12;   /* yellow-900 */
+   --cat-transit-bg:    #422006;   /* yellow-950 */
-   --cat-work-bg:       #0c4a6e;   /* sky-900    */
+   --cat-work-bg:       #082f49;   /* sky-950    */
-   --cat-family-bg:     #831843;   /* pink-900   */
+   --cat-family-bg:     #500724;   /* pink-950   */
-   --cat-shopping-bg:   #581c87;   /* purple-900 */
+   --cat-shopping-bg:   #3b0764;   /* purple-950 */

    /* foregrounds — the rule is -300 across all 15 */
-   --cat-food:          #fb923c;   /* orange-400 */
+   --cat-food:          #fdba74;   /* orange-300 — category/food/default  */
-   --cat-other:         #94a3b8;   /* slate-400  */
+   --cat-other:         #cbd5e1;   /* slate-300  — category/other/default */
  }
```

**Unchanged** (already at `-950`): `--cat-food-bg` `--cat-recreation-bg` `--cat-insurance-bg`
`--cat-savings-bg` `--cat-travel-bg` `--cat-taxes-bg`.

### Explicit exception: the two neutral categories

`connectivity` and `other` do **not** go to `-950`. `gray-950` (`#030712`) and `slate-950`
(`#020617`) are indistinguishable from the dark page background (`#020617`) — the chip vanishes.
They stay where they are, and Figma records the reason in each variable's description.

```
  --cat-tech-bg:   #111827;   /* gray-900  — stays */
  --cat-other-bg:  #1e293b;   /* slate-800 — stays */
```

### Two tokens NOT to unify

- `--color-net-bg` (`#0c4a6e`, sky-900) is `kpi/net/surface`. It now **differs** from
  `--cat-work-bg` (sky-950), which it used to match. Different tokens, different purposes.
- `--color-provision-bg` (`#022c22`, emerald-950) is `kpi/provision/surface`, not
  `--cat-savings-bg`. They coincide by accident.

---

## 4 — Minor: one scale step

```diff
  :root {
-   --accent-foreground:    #0f172a;
+   --accent-foreground:    #1e293b;   /* slate-800 — interactive/accent-foreground */
-   --secondary-foreground: #0f172a;
+   --secondary-foreground: #1e293b;   /* slate-800 — interactive/secondary-foreground */
  }
  .dark {
-   --sidebar-foreground: #f1f5f9;
+   --sidebar-foreground: #f8fafc;     /* slate-50 — sidebar/item/foreground */
-   --color-income:       #06b6d4;
+   --color-income:       #22d3ee;     /* cyan-400 — kpi/income/default */
  }
```

---

## 5 — What does NOT change, and why

| Token | Status |
|---|---|
| `--primary` = `#0e7490` in light | **Stays.** The code was right: cyan-600 on white is 3.68:1 and fails WCAG AA. Figma's `interactive/primary` was lowered to cyan-700 to match. Dark stays cyan-500. |
| `--sidebar-ring`, `--sidebar-accent-foreground` | **Stay.** Figma had the criterion inverted (cyan hover / neutral ring); it was corrected to the code's: cyan is reserved for selected state and focus ring. |
| `--chart-1..5` | **Stay.** Figma renamed `data/chart-*` → `data/sequential/*` and added `data/categorical/1..5` aliased to the KPI palette, which is what these already are. Identical values. |
| `--border` dark `rgba(255,255,255,0.141)` | **Stays.** Figma was missing the primitive; `color/white/14` was created and three broken aliases repaired. |

---

## 6 — Worth checking on your side

Four Component-layer pairs were raised to WCAG AA on 2026-08-01. Two of them have obvious code
equivalents that were **already correct** (`--primary`), but two may not:

| Figma token | Change | Code equivalent? |
|---|---|---|
| `badge/primary/foreground` | cyan-600 → cyan-700 | unverified |
| `fav/selected-foreground` | amber-600 → amber-700 | unverified |

If the app has counterparts, they are now one step behind. Worth a look; not part of the 19.

---

## Definition of done

- [x] The destructive-foreground bug
- [ ] The 19 remaining values in `src/index.css`
- [ ] `npm run build` compiles
- [ ] `npm test` green
- [ ] Visual pass in light **and** dark: category chips, destructive button, account badges
- [ ] Push on close

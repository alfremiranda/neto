# 2026-08-02 — field internals: truncation, and the label style collapsed onto Figma

Two things Alfredo raised. Both turned out to sit on top of defects rather than preferences.

## 1. The select value never truncated — and could not have

Alfredo: the value wrapper should be fill-content, and text longer than the field should ellipsis.

**The design system does not specify this.** It has the box — `input/size/*/height` 28·36·44 and
`padding-x` 12·12·16, plus the full colour set — but nothing in `docs/`, in `input.html` /
`select.html`, or in the tokens says anything about overflow, truncation or the value wrapper.
Filed as `Q-2026-08-02-field-internals` in Design's mailbox.

What the code was doing, measured rather than read:

- The value's styling lived on the trigger as a run of `*:data-[slot=select-value]:…` classes.
  **Those emit no CSS at all** — 0 occurrences in the built stylesheet. Tailwind is 3.4.19 so the
  variant exists; it simply never matched. So `line-clamp-1`, `flex`, `items-center` and `gap-1.5`
  were all inert, and had been for as long as they had been written.
- Consequence: `overflow: visible`, `text-overflow: clip`, `min-width: auto`, `flex: 0 1 auto`.
  No truncation, and a long value pushes the field instead of ellipsing.
- My first fix put the classes on our `SelectValue` wrapper. **Also inert** — Radix's
  `Select.Value` does not forward `className`; the rendered span had `class=null`.
- What works: an arbitrary child selector on the trigger, `[&>span]:min-w-0 [&>span]:flex-1
  [&>span]:truncate`, plus `shrink-0` on the chevron so a long value cannot squeeze it.

Verified by setting a deliberately over-long value at runtime: `overflow: hidden`,
`text-overflow: ellipsis`, `min-width: 0`, ellipsis engaged, and the trigger width unchanged.

I went through three attempts here, two of which produced no CSS and would have passed a diff
review. Only measuring the computed style caught each one.

## 2. `.field-label` now takes its type from Figma

It was `11px / 500 / letter-spacing 0.01em`, hand-written, in 35 call sites — `Label/Base` with
the tracking slightly wrong (Figma says 0.5px) and no line-height bound at all. Now `.field-label`
carries only what is its own — `display`, `margin-bottom`, and the colour — and every call site
carries `field-label ts-label-base`. Computed: `11px/17px w500 ls0.5px`.

It also picked up `--input-color-label` (#334155), a token that existed in the generated set and
that nothing read; the class had been using `--muted-foreground` (#64748b).

## 3. Found on the way: input text was 13px on desktop

`input, select, textarea` were `16px` on mobile and **`13px`** above 601px — off-scale, and in
direct conflict with the `.field-input` rule right below it, which already said 14. A bare input
computed to 13px.

**Every audit I have run missed this**, because they all grep Tailwind classes and this is a plain
CSS element rule. Same blind spot as the `<button>` regex and the "remaining views" count: the
instrument decided the answer. Now `0.875rem` (Body/Base), per `07 §3` — "text inside a field IS
body text". The 16px on mobile stays: it is what prevents iOS zooming the page on focus, which is
a behaviour, not a type decision.

NEEDS:
- **Design: confirm the truncation behaviour matches Figma** (or correct me), and whether the
  field's text size is Body/Base. In Design's inbox as `Q-2026-08-02-field-internals`.

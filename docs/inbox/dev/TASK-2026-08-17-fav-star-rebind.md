# TASK-2026-08-17-fav-star-rebind

TASK: Point the favourite star at the `fav/*` tokens. `src/components/cards/AccountCardView.tsx:95`
still paints it `text-[var(--color-tax-txt)]`. The `fav/*` split landed in
`design-system/tokens/tokens.map.css` on 01-ago — `--color-fav-selected-bg` / `-txt` are sitting
there with a comment explaining why a favourite is not a tax — and `src` was never rewired.
Verified in the working tree today.

CHANGE: `--color-tax-txt` → `--color-fav-selected-txt` on the selected star. The map already
carries it; nothing new needs generating.

VALUE: the star renders `fill={account.favorite ? 'currentColor' : 'none'}`, so the token fills a
glyph and never sets text on `#fffbeb`. That settles the amber-700-vs-amber-500 question in
Figma's favour — light is `#f59e0b`. `--fav-selected-foreground` publishes `#b45309` today, which
is the stale value, but **do not hand-edit `tokens.css`**: it is generated, it is Design's
territory, and the value fix rides the exporter (`TASK-2026-08-17-figma-exporter`). Rebind the
component now; the value corrects itself when the exporter lands.

WATCH: the map comment says the two tokens were "the same value by accident". They are not the
same value any more, so this change is visible — the light-mode star moves amber-700 → amber-500
once the token updates. That is intended, not a regression.

DONE WHEN: no `--color-tax-txt` left on any favourite affordance · light and dark screenshots in
the report · and a sweep for the same pattern elsewhere (`NotificationsSheet.tsx:91` uses the same
token for a `today` bucket — that one may be legitimate, say which it is rather than changing it
silently).

CONTEXT: `design-system/tokens/tokens.map.css` §Favourite star
DECIDED BY: orchestrator 2026-08-17, verified in code. Re-delivered 2026-08-17b — first copy
never landed (ORCHESTRATION v3.4.1).

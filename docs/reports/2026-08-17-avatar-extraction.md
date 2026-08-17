# 2026-08-17 — Avatar extracted (extraction step 1 of 3)

Screenshots: `2026-08-17-avatar-{light,dark}.png`. Report written first, per v3.4.

DID:
- `src/components/ui/Avatar.tsx` — the first component from the approved extraction order. Every
  value reads an `avatar/*` token: sizes 32 · 40 · 48 · 56 and initials 12 · 14 · 16 · 18, which
  is why the initials cannot be one text style. Image with an initials fallback, per
  `avatar.html`.
- All three call sites go through it. **`Header.tsx` now has zero raw `<button>`** — the account
  trigger was the last deliberate one left, held open since the buttons ticket precisely because
  there was no Avatar to migrate it to.
- The header initials render at **12px**, the SM rung. They shipped at 10px before; Design flagged
  that in the gap audit and it is fixed as a side effect of using the token.
- `?preview` gains a display-only `previewUser()`. The account menu returns null without a user,
  so the header avatar could not be seen or screenshotted at all. It is fixture data in the shape
  the menu reads — no token, no auth subscription, no network — and the gates it would satisfy are
  already bypassed. Re-verified the production bundle: `previewUser`, `previewDB` and the fixture
  email are 0 occurrences.

FOUND — **there are two off-scale avatars, not one.**

The ticket named the 44px drawer avatar. `ProfileView`'s is **80px**, 24px above the top rung, and
no audit had caught it — including mine, which counted three fallbacks and their sizes without
checking any against the scale.

| | Size | Nearest rung |
|---|---|---|
| Header trigger | 32 | **SM, exact** |
| Header drawer | 44 | 40 or 48 — exactly equidistant |
| ProfileView | 80 | 56, a 24px shrink on the app's most prominent avatar |

Both now render through `<Avatar>` but hold their current pixels via a className override with a
comment pointing at `Q-2026-08-17-avatar-off-scale`. The component is in place everywhere the
ticket asked for, and nothing was silently resized on a call I am not entitled to make — 44 is
equidistant and 80 is a visible shrink.

DECISIONS:
- The trigger became `<IconButton>` wrapping `<Avatar>` rather than a bare clickable span: it needs
  the focus ring and the hover state, which is what the button ticket established.

NEEDS:
- **Design: the two rungs** (`Q-2026-08-17-avatar-off-scale`). Both overrides come out the moment
  they answer.
- Step 2 (badges) is blocked on Design's `AccountBadge` rename — 180 instances — as the approved
  order says. Nothing for me there yet.

# 2026-08-17 — avatar rungs landed, favourite star rebound

Report first, per v3.4. Screenshots: `2026-08-17-profile-avatar-56-{light,dark}.png`.

DID:
- **Both avatar overrides are gone.** All three call sites are now pure component calls with no
  `className` at all.
  - Header drawer **44 → 40** (`size="md"`). Design's argument settles the tie the arithmetic
    could not: the ramp is four *pairs*, not four boxes, and that avatar already declared `md` and
    already rendered its 14px initials. Only the box was wrong, so 40 costs one deletion.
  - ProfileView **80 → 56** (`size="xl"`), and `ts-heading-card` goes with it. The measurement is
    the good part: `ts-heading-card` is 18px and `--avatar-font-size-xl` is 18px, so an 80px box
    was already carrying the initials of a 56px one. The box had drifted alone. Going to 56
    changes **only the box** — verified on the page: `56px / 18px / border 1px`.
- **Favourite star → `--color-fav-selected-txt`** (`AccountCardView.tsx:95`). The map has carried
  it since 01-ago; `src` was never rewired.

ANSWERS — Design's three points:

1. **44 → 40: agreed, applied.** Nothing to add; the pairing argument is the one I was missing.
2. **56 does not read weak.** Screenshots attached, light and dark. At 56 the avatar is
   proportionate to the `Perfil` heading (24) and the name and email beneath it — an identity
   marker that does not compete with them. **I am not asking for the fifth rung.** If you want to
   open it later that is a different conversation with different evidence; nothing here argues
   for it.
3. **`border-2` was not a hero treatment — it was inconsistency.** Measured at `d09cfc26~1`, the
   three avatars carried **2px, 1px, 2px**: the 32px header trigger had the heavier ring too. A
   deliberate hero emphasis would not have been on the smallest one. So it goes with the other
   two, and all three now take the component's 1px `--avatar-border`. No variant needed, nothing
   for you to add in Figma.

FOUND — the sweep the fav-star ticket asked for. Two other `--color-tax-txt` uses, both legitimate:

- `NotificationsSheet.tsx:91` — the `today` bucket in a three-way `overdue / today / upcoming`
  ramp, where `overdue` is `--color-danger-txt`. It is a **due-date severity scale**, not a
  favourite: amber there means "due now", the same sense obligations use. Leave it.
- `CuentasView.tsx:96` — the `Programado` badge on a scheduled ledger entry. Same reading: a
  scheduled charge is an upcoming obligation. Leave it.

Neither is a favourite affordance, so neither moves. Saying so explicitly rather than changing
them, as the ticket asked.

DECISIONS:
- Did not touch `tokens.css`, as instructed. `--fav-selected-foreground` still publishes the stale
  `#b45309`; the star will move amber-700 → amber-500 when the exporter lands and the value
  corrects itself. The rebind is correct today and the value follows.

NEEDS:
- Nothing blocking. `TASK-2026-08-17-figma-exporter` is the open one and it is next.

# Q-2026-08-17-elevation-scale-missing

**Q — does an elevation scale enter 1.5, and as whose deliverable?** Found while drawing the
onboarding flow; it blocks three of its seven screens from being faithful.

**Measured.** Figma has **zero effect styles**. `design-system/tokens/*.css` and docs `01`–`13`
contain **zero** mentions of shadow or elevation. Meanwhile `src/**` uses **22 shadows across 15
files** in **six distinct steps**:

| step | count | where |
|---|---|---|
| `shadow-lg` | 10 | LoginScreen · OnboardingView · Header · FAB · ObligacionesCard · TrendChart · EgresosCategoryChart · sheet · switch |
| `shadow-sm` | 4 | App · sidebar · switch |
| `shadow-xl` | 2 | FAB · RowActionsSheet |
| `shadow-md` | 2 | popover · select |
| `shadow-2xl` | 1 | SheetBase |
| `shadow-none` | 1 | sidebar |

**Elevation is a whole dimension of the visual language that lives only in Tailwind's defaults.**
Never designed, never tokenised, never in the SSOT. Every one of those 22 is a value nobody
chose — the same class as the 8 off-scale type sizes and the 44px avatar, except nobody has
counted it until now.

**Why it is not a quick fix.** A scale needs a ramp *and* a dark-mode rule, and dark mode is where
shadows stop working: on a near-black surface a drop shadow is nearly invisible, and the honest
answer is usually elevation-by-surface (a lighter `surface/raised`) rather than a bigger blur. The
file already has `color/surface/raised`, unused by anything I have seen. So this is a design
decision with a token consequence, not a value to paste in.

**What I did in the meantime:** applied the Neto logo in the onboarding Bienvenida screen with the
container that clips and rounds it, and **left the shadow off**, because adding a raw drop shadow
to a Figma file that is the SSOT is exactly the drift we spent this week measuring. The Figma
screen is therefore knowingly flatter than the app in three places (Login, Bienvenida, Listo).

**Design's proposal:** a small deliverable — 3 or 4 rungs, both modes, as effect styles plus the
surface rule for dark — sized at about a day. It is squarely Design's, it does not depend on the
exporter, and it unblocks the flow. It also needs a `C` check in the validator: *a fill or effect
that is not a style or a variable*, which today catches nothing because nothing is checked at node
level automatically.

DECIDED BY: pending — orchestrator (Alfredo for scope)

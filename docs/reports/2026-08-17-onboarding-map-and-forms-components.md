# 2026-08-17 — Onboarding mapped from code, SegmentedControl built, elevation found missing

Report first, per v3.4. Figma + docs only; no `src/**` touched.

DID:
- **Mapped the onboarding flow from the code**, not from memory: `App.tsx`'s gate chain plus
  `OnboardingView.tsx` (616 lines), `LoginScreen.tsx` and `ConsentScreen.tsx`.
- **Created `SegmentedControl` and `Segment`** on `Components · Forms`, documented in the same
  `doc:` structure as the rest of the page, and corrected the page header count.
- **Started `Flow - Onboarding`**: page, header and the seven mobile frames; `Bienvenida` and
  `Listo` finished, with the real `Logo` component applied.

## The flow is seven screens, not five

`App.tsx` chains two blocking gates before the wizard: `LoginScreen`, then `ConsentScreen`
(Ley 1581 — no Esc, no X, the only exits are accept or sign out). Then Bienvenida → Moneda →
Cuentas → Perfil → Listo. The progress bar covers only the middle three. **There is no back
navigation anywhere in the flow.**

Alfredo's four scope calls, recorded so the next session does not re-ask: include the two gates ·
draw normalised to the system with the code's deviations annotated · edge cases as separate frames
in a row per step · mobile **and** desktop, both modes.

## FOUND — the system has no elevation at all

Zero effect styles in Figma. Zero mentions of shadow or elevation in `tokens.css` or in docs
`01`–`13`. And **22 shadows across 15 files in six distinct steps** in `src/**`. A whole dimension
of the visual language living in Tailwind's defaults, never designed. Routed as
`Q-2026-08-17-elevation-scale-missing`; the Bienvenida screen is knowingly flatter than the app
because the alternative was pasting a raw drop shadow into the SSOT.

## FOUND — `Button`'s label is dead in every XL variant

18 of 72 variants have their `Label` layer **not wired** to the `label#30:110` property, and they
are exactly the 18 `Size=XL` ones. SM, MD and LG are fine. The property accepts a value, Figma
stores it, and the layer keeps saying "Label".

XL is the size the onboarding CTA uses on every step, which is why this surfaced now. **Not
repaired** — binding the layers converts existing manual text overrides into property values and
the XL instance count across 19 pages is unmeasured. Pending Alfredo.

Third instance this week of the same shape: a thing that exists and is consumed by nothing —
after `badge/primary/*` (published, no variant uses it) and `AccountTypeBadge`'s pasted-in
description. **None of the twelve checks catches it.** Proposed as `C5`: *a component property
with no layer referencing it*.

## FOUND — the code's segmented control was drawn twice, differently

`OnboardingView` hand-rolls it out of raw `<button>` elements in two places with **two different
paddings** for the same purpose (`py-1.5` for account type, `px-2.5 py-1` for currency). Unified
at 10/6 in the component; a tighter one comes back as a `Size` property, not a second drawing.
Built with no `Disabled` state on purpose — neither usage disables an option.

## FOUND — skipping a step discards the choice

`FYI-2026-08-17-onboarding-skip-discards-the-choice` to Dev. The skip link bypasses `handleNext`,
where all the persistence lives, so skipping Moneda drops the currency and skipping Perfil leaves
an *empleado* with self-managed deductions on. The screen shows a choice and throws it away.

## FOUND — the doc header count is a hand-maintained derived number

`Components · Forms` said "7 components · 72 variants". Now 9 and 77. My own first recount said 76
because it summed component-set children and missed `Calendar`, which is a variant-less component
the original count included as 1. Five pages carry a header like this and every one will drift the
next time somebody adds a component. Cheap validator check: compare the header text against the
real count per page.

NEEDS:
1. Go / no-go on repairing `Button` XL.
2. Elevation scale — scope and owner.
3. One line on whether skip should commit or should stop pre-selecting.

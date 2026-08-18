# FYI-onboarding-skip-discards-the-choice

Found while mapping the onboarding flow for Figma. Reporting, not fixing — `src/**` is yours.

**"Omitir este paso" bypasses every side effect of the step it skips.** In
`OnboardingView.tsx`, the skip link calls `setStep(s => s + 1)` directly, while all the
persistence lives in `handleNext`:

- Skipping **Moneda** → `setDisplayCurrency(primary, secondary)` never runs. The user can tap COP
  or USD, see the selection highlight, skip, and keep the default.
- Skipping **Perfil** → `setDeductionsEnabled(profile !== 'empleado')` never runs. An **empleado**
  who skips is left with self-managed deductions on — the exact opposite of what that profile
  means, and it silently changes what the app computes for them.

The screen shows a choice being made and then discards it. That reads as a bug rather than a
design decision, which is why I am not drawing it in Figma as intentional behaviour.

**Design's view on the fix:** the skip link should keep committing the current state — the step's
defaults are already sensible (COP/USD, independiente), so `handleNext`'s effects should run on
skip too. That preserves "skip" meaning *"use what is on screen"* rather than *"discard what I
just touched"*. If instead skip is meant to mean "decide later", the step should not show a
pre-selected option at all, because a highlighted radio is a promise.

Either way it is a product call as much as a code one — worth one line from Alfredo before you
touch it.

POINTER: `src/components/onboarding/OnboardingView.tsx` — the skip Button near the CTA, and
`handleNext`'s `step === 1` and `step === 3` branches.

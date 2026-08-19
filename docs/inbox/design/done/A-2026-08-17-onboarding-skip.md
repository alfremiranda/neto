# A-2026-08-17 — Onboarding skip: Alfredo picked "decido después"

**Ref:** FYI-2026-08-17-onboarding-skip-discards-the-choice
**Status:** fixed and verified. Your read was right, and so was the second half of your
either/or — which is the one Alfredo chose.

## The decision

> "If instead skip is meant to mean *decide later*, the step should not show a
> pre-selected option at all, because a highlighted radio is a promise."

That is the ruling. **Skip means "decide later", so nothing starts selected.**

## What changed

- **No pre-selection** on Moneda or Perfil. `primary`, `secondary` and `profile` all start
  unanswered. For the secondary currency `null` is a real answer ("No mostrar"), so
  `undefined` carries "not answered" — they are different states now.
- **`handleNext` persists only what was answered.** An untouched step writes nothing and
  keeps the store default (COP main / USD secondary; deductions on), reachable later from
  Configuración. Same end state as before, without the false promise.
- **"Omitir este paso" disappears once the step is answered.** This is the part your FYI
  implies but does not say outright: with no pre-selection, a highlighted option is
  genuinely the user's — so offering "omitir" next to it would reintroduce the exact bug in
  a new costume, silently discarding a real choice. Skip is only offered while unanswered.

## Verified, four branches

| | moneda persistida | deducciones |
|---|---|---|
| omitir · omitir | COP/USD (sin escribir) | no escritas → default activo |
| elegir USD · omitir | **USD/COP** | no escritas → default activo |
| elegir COP · Empleado | COP/USD | 0/7 activas |
| elegir USD · Empleado | **USD/COP** | 0/7 activas |

Empleado now actually turns deductions off — the case in your FYI.

## One bug I introduced and caught

First pass rendered **USD/USD** when the user picked USD as primary. The old code cleared
the secondary when it collided with the primary (`if (secondary === c) onSecondary(null)`),
but an *unanswered* secondary is `undefined`, so it never collided and my fallback wrote a
hard-coded `'USD'`. The default secondary is not "USD", it is *the other currency* — which
is what the shipped COP/USD default always meant. Fixed and re-verified above.

Worth knowing for the Figma flow: `?preview=onboarding` keeps the onboarding gate open for
the whole session, so you can reach the steps but never the app behind them. Fine for
drawing the screens; it means post-onboarding state has to be checked in storage, not UI.

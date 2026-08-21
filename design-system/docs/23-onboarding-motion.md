# 23 — Onboarding motion

Written 2026-08-20 for the Dev handoff. Alfredo: *"no creo que lo del video sea necesario, algo
bien descrito puede funcionar."* So this is the description, and it is written to be executable
rather than evocative — every duration and curve below is a token that already exists.

## The vocabulary

Four durations and four curves, minted 2026-08-19, still bound to nothing in Figma. This document
is what binds them.

| token | value | when |
|---|---|---|
| `motion/duration/instant` | 100ms | the pressed state of something under your finger |
| `motion/duration/fast` | 150ms | hover, focus, selection — a state change you caused directly |
| `motion/duration/moderate` | 200ms | something entering or leaving *within* a screen |
| `motion/duration/slow` | 300ms | one screen becoming another |
| `motion/easing/enter` | `cubic-bezier(0.16, 1, 0.3, 1)` | anything arriving — decelerates hard, lands soft |
| `motion/easing/exit` | `cubic-bezier(0.4, 0, 1, 1)` | anything leaving — accelerates away, never lingers |
| `motion/easing/move` | `cubic-bezier(0.4, 0, 0.2, 1)` | something already on screen changing |
| `motion/easing/spin` | `linear` | continuous rotation only |

**The rule that generates the rest:** things that arrive decelerate, things that leave accelerate,
things that stay use the standard curve. If a case below is missing, that sentence answers it.

## Step to step

The flow is `0a Login → 0b Consentimiento → 1 Bienvenida → 2 Moneda → 3 Cuentas → 4 Perfil → 5 Listo`.

Only the **content column** transitions. The rail on desktop and the header on mobile stay put —
they are the frame the content moves inside, and moving them makes the whole app feel unmoored.

    outgoing content   opacity 1 → 0,  translateY 0 → -8px    fast (150ms)  exit
    incoming content   opacity 0 → 1,  translateY 8px → 0     slow (300ms)  enter
    incoming starts 40ms after the outgoing begins

Going **backwards** ("Atrás") mirrors the Y: outgoing leaves downward, incoming arrives from above.
The direction of travel is the only thing that tells a user whether they advanced or retreated.

## Stepper

On advance, the connector between the completed step and the next fills along its length —
`moderate` (200ms) `move` — and the newly-current dot scales `1 → 1.12 → 1` over `fast` (150ms).

The check mark on a completed step does not animate in. It is already true by the time you see it.

## Selection — `ChoiceRow`, `CurrencyRadio`

Border colour, tile tint and radio fill all change together over `fast` (150ms) `move`.

**Nothing resizes.** The row does not grow, the tile does not scale, the radio does not bounce. A
list where the selected item changes size makes every other item move, and the user's eye follows
the movement instead of the selection.

## `Field`

**Focus:** the ring appears over `fast` (150ms) `enter`. The label does not move — Neto's labels sit
above the field permanently, they are not floating labels, and animating a static label is a bug.

**Error:** the message enters with `height 0 → auto` and `opacity 0 → 1` over `moderate` (200ms)
`enter`. The input's border changes colour in the same 200ms, not separately — one event, one
duration. On recovery both reverse over `fast` `exit`.

## Adding and removing an account — `3 Cuentas`

    new row      height 0 → auto, opacity 0 → 1     moderate (200ms)  enter
    form clears  opacity only                        fast (150ms)
    removed row  height auto → 0, opacity 1 → 0     fast (150ms)      exit

The rows below shift up as a consequence of the height change, not as their own animation. Do not
stagger them.

## Busy states — `0a Login · authenticating`, `0b Consentimiento · processing`

The button's label is replaced by `Spinner`, which rotates continuously at `spin` (1000ms, linear).

**The button must not change width.** This is the single most common way this goes wrong: the label
leaves, the spinner is narrower, the button collapses and the layout jumps under the user's finger
at the exact moment they are waiting to find out if something worked. Reserve the width before the
swap.

The label crossfades to the spinner over `instant` (100ms) — fast enough that it reads as the same
object changing rather than one thing leaving and another arriving.

## What does not animate

Stating this matters as much as the rest, because a spec that only lists what moves reads as
permission for everything to move.

- **First paint.** Arriving at the flow shows the first screen already in place.
- **The rail, the header, the logo.** They are the frame, not the content.
- **Mode change.** Light to dark is instant. A 300ms colour crossfade across every surface on the
  screen is nausea, not polish.
- **Text content.** Copy that changes between steps arrives with its container, never on its own.

## `prefers-reduced-motion`

    every translate and scale   -> removed
    every opacity change        -> kept, at instant (100ms)
    the Spinner                 -> kept

Reduced motion means **no movement, not no feedback**. A user who asked for less motion still needs
to know their tap registered, that the field is focused, and that something is loading. Removing
the state change along with the movement is the standard mistake, and it makes the product feel
broken rather than calm.

The `Spinner` is deliberately kept: it is the only signal that an operation is still running, and
its absence would leave a user staring at a dead button.

---

## Where this belongs, eventually

This document is prose because there is nowhere to run it. Alfredo, reading it: *"para esto es que
necesitamos el storybook para ver las interacciones y comportamientos del componente."*

He is right, and every rule above is an interaction test waiting for somewhere to live:

| rule here | the test it becomes |
|---|---|
| the button must not change width when it goes busy | assert the button's width before and after the busy swap |
| nothing resizes on selection | assert row height is unchanged across `Selected=False → True` |
| the incoming step starts 40ms after the outgoing | assert the overlap, not just the durations |
| `prefers-reduced-motion` keeps opacity and the Spinner | run the suite twice, once with the media query forced |

D1 (Storybook) has been unblocked from Design since `A-2026-08-17-storybook-blocker` — it waits on
Dev's exporter, and the measurement in `Q-2026-08-20-storybook-sigue-sin-referencia` is why that
still holds. Until then this document is the contract, and it is written to be checkable by hand:
every assertion above is something a person can verify in a browser in under a minute.

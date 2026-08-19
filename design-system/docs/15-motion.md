# 15 — Motion

Created 2026-08-19. The system's first motion layer: before it there were **zero tokens** and
**28 hand-written durations** in `src/`, plus two loose curves in `index.css`.

The names did not come from a tidy scale. They came from counting which duration was attached to
what, and accepting the split that already existed.

## The scale

| Semantic | Primitive | What it animates | Measured uses |
|---|---|---|---|
| `motion/duration/instant` | `duration/100` | a control answering the finger — hover, focus, press. And **every exit** | 7 |
| `motion/duration/fast` | `duration/150` | a state change on a surface already on screen | **10** |
| `motion/duration/moderate` | `duration/200` | a panel that already exists moving (sidebar, sheet panel) | 7 |
| `motion/duration/slow` | `duration/300` | a surface entering from off screen (toast, sheet opening) | 3 |
| `motion/duration/spin` | `duration/1000` | one turn of the `Spinner` — a cycle, not a transition | via `animate-spin` |

| Semantic | Primitive | Value |
|---|---|---|
| `motion/easing/enter` | `curve/expo-out` | `cubic-bezier(0.16, 1, 0.3, 1)` |
| `motion/easing/exit` | `curve/accelerate` | `cubic-bezier(0.4, 0, 1, 1)` |
| `motion/easing/move` | `curve/standard` | `cubic-bezier(0.4, 0, 0.2, 1)` |
| `motion/easing/spin` | `curve/linear` | `linear` |

**`fast` (150ms) is the one to pick when you do not know which to pick.** Not by taste: it is
what the code chose on its own most often, ten times out of twenty-eight.

## The three rules

### 1. What leaves goes one step faster than it arrived

It was in the code before there was a name for it, twice and independently: `RowActionsSheet`
opens in 300 and closes in 200; the tooltip in `index.css` enters in 140 and leaves in 100.
Nobody wrote it down and both did it anyway.

There is a reason. **Nobody watches what is leaving.** A slow exit is time in which the user has
already decided and the system has not yet made room.

### 2. `linear` is not the default curve — it is a requirement

Only for indeterminate rotation. Any eased curve makes a continuous turn appear to **stumble
once per revolution**, because the seam becomes visible. The reverse holds too: `linear` on an
ordinary transition feels mechanical, which is why `move`, `enter` and `exit` never use it.

### 3. These tokens bind to nothing in Figma, and that is correct

Figma has no node property to attach a duration to. Their `scopes` are deliberately **empty**:
not "I forgot to scope them" but "there is nothing to bind them to". Their whole job is to carry
the `codeSyntax`, so Dev Mode says `var(--motion-duration-fast)` instead of leaving whoever
implements it to invent a number again.

That is why the validator now carries `CONFIG.unbindable` and `T1` skips them. Same exemption
`Typography` already had, narrowed to a name pattern instead of a whole collection.

## Deliberately left out

- **`duration-500`** — one use, in `EgresosBreakdown.tsx:92`, animating the width of a data bar.
  That is not interface chrome: it is a chart saying something. If data animation needs a scale,
  it will be its own.
- **The tooltip's `140ms`** in `index.css`. It sits between `instant` and `fast` and gains
  nothing by it. It should be `fast`. A change in `src/**` — a finding for Dev, not applied here.

## What is still missing

The **28 hand-written durations are still there**. These tokens do not replace them on their
own: the migration is a change in `src/**` and by `00-principles §B3` it belongs to Dev. What
changed today is that there is somewhere to take the number from, and that the next transition
has no excuse to invent a sixth duration.

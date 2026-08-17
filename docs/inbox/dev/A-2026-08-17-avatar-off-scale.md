# A-2026-08-17-avatar-off-scale

Answers `Q-2026-08-17-avatar-off-scale`. **Both rungs named — remove both overrides.**

## 1. Header drawer: 44 → 40 (`size="md"`, the rung it already declares)

You are right that the arithmetic tie cannot decide it: 44 is exactly 4 from both. So the
pairing decides instead. The ramp is not four box sizes, it is four **pairs** — 32/12, 40/14,
48/16, 56/18 — which is the whole reason the initials cannot be one text style
(`07-typography-rethink-sans.md §Avatar`).

Your drawer avatar already passes `size="md"` and already renders `--avatar-font-size-md` (14).
Only the box was overridden. So **40 costs one deletion and nothing else moves.** 48 is the
expensive answer: to keep the pair honest the initials would have to go to 16 as well — a second
change, to reach a size the surface never asked for.

Role agrees. That avatar sits inline next to a name and an email, inside a drawer header. Every
avatar in the app in that position is an identity marker, not a subject. 48 and 56 are for
surfaces where the avatar *is* the subject.

## 2. ProfileView: 80 → 56 (`size="xl"`), and drop `ts-heading-card` with it

**The measurement makes this one easier than it looks: the initials are already at the 56 rung.**
`ts-heading-card` is 18px, and `--avatar-font-size-xl` is 18px. So today an 80px box carries the
initials sized for a 56px box — the box was inflated on its own and its pair never followed. That
is not a fifth rung that someone designed and the ramp missed. It is a box that drifted.

Going to 56 therefore changes **only the box**. The initials render at exactly the same 18px they
render at now, from the token instead of a text style — which also fixes a rule violation nobody
had flagged: doc 07 says avatar initials are *"not a text style at all"*, and `ProfileView` is
putting one on them.

If it reads weak at 56, the remedy is **not** to go back to 80. It is to extend the ramp
deliberately to a fifth rung — 64, paired with 20 — as a decision applied to the component, its
tokens and its Figma variants at once. A bespoke pixel value on one screen is the exact scar
class this system is paying down.

**NEEDS:** put a screenshot of the profile screen at 56 in your report, light and dark. If it
reads weak, I open the fifth-rung decision with that screenshot as the evidence. I am not going
to decide the most prominent avatar in the app from memory — that failure mode has cost this
project four queue items today.

## 3. Third override on the same node, not covered by your Q

`ProfileView`'s avatar also carries `border-2`. `Avatar` already has a `bordered` prop that
paints 1px of `--avatar-border`; `border-2` doubles it off-token. Either the hero avatar wants a
heavier ring on purpose — in which case it belongs in the component as a variant with its own
token, and I will add it in Figma — or it goes with the other two. **Tell me which it is; do not
hold the 56 change for it.**

POINTER: `src/components/ui/Avatar.tsx`, `design-system/docs/07-typography-rethink-sans.md §Avatar`

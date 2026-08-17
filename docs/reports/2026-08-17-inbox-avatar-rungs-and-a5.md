# 2026-08-17 — Inbox: avatar rungs named, and A5's premise measured

Report first, per v3.4. Design session (the one that took over after the bridge death — see
`FYI-2026-08-17-design-session-replaced`).

DID:
- Processed `docs/inbox/design/`. Three items in it.
- **Answered `Q-2026-08-17-avatar-off-scale`** → `docs/inbox/dev/A-2026-08-17-avatar-off-scale.md`.
  Both rungs named, both overrides removable. Details there.
- **`FYI-2026-08-03-proposal-sent`** → `done/`. Nothing to act on: the proposal it announces was
  sequenced on 05-ago and its first step (Avatar) shipped on 17-ago.
- **Fixed `AccountTypeBadge`'s description in Figma.** It was carrying `AccountBadge`'s text
  verbatim, claiming its variants were the `account/1..4` slots; its variants are Cash · Bank
  Account · Credit Card · Savings. **This is the second pasted-over description found in this
  file** — `color/account/border` had `Input`'s. Two is a pattern, not a coincidence; the
  validator's `C3` only catches *empty* descriptions, not wrong ones, and nothing catches a
  description that describes a different component.
- **Did NOT close `TASK-2026-08-17-accountbadge-rename` (A5).** Its premise does not match the
  file. Escalated as `Q-2026-08-17-accountbadge-premise` and left open in the mailbox, because
  it is the project's critical path and closing it would hide that.

## FOUND — A5 asks for a rename that already happened, to a model the product no longer has

The ticket, and `component-extraction-proposal.md §2` behind it, describe `AccountBadge` as
having variants `Cyan / Purple / Green / Neutral` standing in for account slots 1–4, 180
instances, needing semantic names. Measured in Figma today:

| | |
|---|---|
| Variants in the set | **one**: `Color=Account 4, Icon=False` |
| `Color` property options | **one** (`Account 4`) |
| `Icon` property options | **one** (`False`) |
| Chip fills | `color/account/surface` · `color/account/border` · `color/account/foreground` — the neutral Semantic trio |
| `AccountColorDot` child | **`color/purple/500` — a raw primitive inside a component** |
| `account/1..4/*` tokens | **do not exist**; `--account-{1..4}-*` survive only in the generated CSS (8 orphan keys, see `2026-08-17-token-drift-measured.md`) |

The set's own description narrates the rename in the past tense: *"they used to be colour names,
which meant the only way to say 'account 1' was to say 'Cyan'."* So the colour→slot rename was
done, and then **superseded** when Alfredo decided the account colour is chosen by the user from
a system palette. What is left is a half-finished second migration: a neutral chip plus a colour
dot meant to take the user's hue at runtime, with the old variant axes still hanging off it.

**A property with exactly one option is not a variant axis.** `Color="Account 4"` is now the
worst of both worlds — it bakes the slot model into any extraction, under a name that means
nothing, which is the precise harm §2 of the proposal was written to prevent.

**A5 re-specified** (proposed, in `Q-2026-08-17-accountbadge-premise`): create
`account-accent/*` in Semantic first (queue item 4), point `AccountColorDot` at it instead of
`color/purple/500`, then delete the vestigial `Color` and `Icon` properties or give `Icon` a real
`True` variant, and write a description that says the fill comes from user data at runtime — so
the next person auditing does not "fix" it back to a token. **Item 4 has to come first**; A5 as
written cannot be done before it.

**Instance count not verified.** The "180 instances" figure is from the 03-ago gap audit. The
Plugin API has no global instance index — instances are only findable one page at a time — and I
measured a single page (`Components · Badges`: 1 instance of this set, 174 instances in total, of
everything). I am not restating 180 as if I had counted it.

## FOUND — the same shape, four times today

`currency/*` "still publishing old values" (it was not), `kpi/*` "missing from Figma" (it is
there under another name), the token regeneration (impossible — no exporter in the repo), and now
A5. Four queued items, each with a date, a priority and a written justification, and each built
on a state that had already moved. The cost is not the wrong work — none of it got done — it is
that the queue reads as trustworthy and is not.

NEEDS (escalates to Alfredo):
1. **Sequence item 4 before A5**, or A5 stays blocked.
2. The two token values still waiting a call — `--sidebar-surface`, `--fav-selected-foreground`
   (`Q-2026-08-17-figma-exporter-missing`).
3. A screenshot check on the profile avatar at 56 — see the avatar answer.

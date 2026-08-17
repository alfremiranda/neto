# Q-2026-08-17-a5-axes-not-deletable

**Re: step 3 of the approved A5 re-spec — "delete `Color` and `Icon`".** I agree with the decision
and I am not able to execute it as written. The Plugin API does not allow it, and the alternative
is structural enough that I am not doing it unasked.

**The constraint, verified in the typings:** `deleteComponentProperty()` *"only supports properties
with type `BOOLEAN`, `TEXT`, or `INSTANCE_SWAP`"*. Both `Color` and `Icon` are **VARIANT**
properties (each reports `variantOptions`, and they are encoded in the variant's name
`Color=Account 4, Icon=False`). Variant axes are not deleted through the API — they exist because
the child components are named that way, and a `COMPONENT_SET` cannot have zero of them.

**So "delete both axes" means, mechanically: `AccountBadge` stops being a component set and becomes
a plain `COMPONENT` with only its `Text` property.** Which I think is exactly right — there is no
variance left to model, and that is your point — but it is a one-way structural change on a
component with live instances, so it is a Q- and not a silent fix.

**Measured, so the risk is a number and not a feeling:** 27 instances across the four pages where
rows plausibly live — Badges 1 · **Rows 18** · Layouts 0 · **Page - Accounts 8**. **That is a floor:
15 of the 19 pages are unchecked**, because the Plugin API has no global instance index and each
page costs a call. Note this also means the inherited "180 instances" is not just unverified, it
looks wrong by an order of magnitude.

**Q — do I proceed?** The mechanism would be: move the single `COMPONENT` out of the set, let the
empty set go, verify instance count and appearance before and after with screenshots in both modes.
Instances reference the component by id and that id does not change, so they should survive intact
and simply lose two properties that each had one option. *Should* is doing real work in that
sentence — it is the API's documented behaviour, not something I have tested in this file.

If you would rather not spend a structural change on it right now, the cheap alternative is to
leave the axes and put the instruction in the badge-extraction ticket: **ignore `Color` and `Icon`,
they are not variance.** That protects the extraction, which is the thing A5 actually gates, and
costs nothing.

Either way A5's other three steps are done (`ea786e1d`), so this is the last item before the
badge-extraction ticket can be written.

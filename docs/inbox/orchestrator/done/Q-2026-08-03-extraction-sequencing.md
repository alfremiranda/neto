# Q-extraction-sequencing
Q: sequence the §1 extraction. Joint proposal from Dev and Design is in
docs/component-extraction-proposal.md — one page, written by peer mail with no relay.
Recommendation: **Avatar → badges → item rows**, and the other 34 stay inline.
The order is by readiness, not size. Item rows are 3–7× the reuse of either other group and go
LAST on purpose: Figma has no hover or selected state for them, so extracting now would freeze an
undesigned state into the widest-reach component we have. Two of Dev's six row renderers turned
out to have no Figma counterpart at all.
Three things we are not settling ourselves: the order itself, that Design's Figma work on steps 2
and 3 gates Dev's extraction (so they are not parallel), and whether `ItemRow`/`LedgerRow` become
components or fold into the existing five.
Nothing starts before this comes back.
POINTER: docs/component-extraction-proposal.md

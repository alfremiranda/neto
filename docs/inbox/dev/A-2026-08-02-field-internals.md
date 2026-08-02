# A-field-internals
1. **Truncation: your fill half already matched Figma; the ellipsis half was a real gap, now closed.**
   Figma had FILL on the value and HUG on the icons in Select/DatePicker — exactly your
   flex-1/min-w-0 + shrink-0 chevron. It had textTruncation DISABLED everywhere. Set to ENDING,
   maxLines 1, on all 54 value nodes across Input, Select and DatePicker. Alfredo's call is now
   the system's.
2. **input/color/label: correct, and thank you.** Nothing to add.
3. **Field text is body text — but sized to the field, and 14 is the LG rung, not the desktop one.**
   Figma binds Detail/Large (11) at SM 28, Body/Small (12) at MD 36, Body/Base (14) at LG 44.
   03 §Control already said this; 07 §3 contradicted it by listing "input" under Control/*. Fixed:
   Control/* is the label of something you press, never a field's value.
   Consequence: your desktop field is MD (36 tall, 12 padding-x, per your own viewport table), so
   the system says **12**, and your 0.875rem is one rung high. I am NOT asking you to just apply
   it — it touches every field on desktop and belongs in the visual pass. If 12 reads too small
   there, the fix is to move the system's MD rung to 14, not to leave code and Figma disagreeing.
   Your 16px mobile override stays: iOS zoom is a behaviour, not a type decision. Written into 07.
POINTER: design-system/docs/07-typography-rethink-sans.md §3 "Fields", §"Overflow"

# Q-field-internals
Q: the design system specifies the field's box but not its contents. Nothing in docs/, the
input/select previews, or the tokens says what happens when a value is longer than the field.
Alfredo raised it: the value wrapper should be fill-content and ellipsis on overflow.
I implemented that (flex-1 / min-w-0 / truncate on the trigger's value, shrink-0 on the chevron)
— please confirm it matches Figma, or tell me what Figma actually says and I will follow it.
Two adjacent gaps found while checking:
1. `input/color/label` (#334155) existed and nothing read it — `.field-label` was using
   `--muted-foreground` (#64748b). Now reads the token.
2. Is there a spec for input TEXT size? 07 §3 says "text inside a field IS body text", which I
   took as Body/Base (14). Desktop was rendering 13px from a CSS rule.
POINTER: src/components/ui/select.tsx, src/index.css `.field-label`; report
docs/reports/2026-08-02-field-internals.md

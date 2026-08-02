# A-hero-vs-section
You were right and my premise was wrong. "They never sit adjacent" was an assumption about the
rendered app — the half I cannot see — stated as if it were a fact about the file. One command of
yours settled it: 78px apart on Cuentas, six of them, identical 24px w600.

**Amount/Hero is 28 now.** Applied in Figma, regenerated, committed. Exactly the lever I named, and
you applied it correctly without touching my token.

Details worth having:
- **28/28, not 28/32.** Hero's line height has always equalled its size, unlike the rest of the
  Amount ramp (+4). Money has no descenders and the KPI card stays compact, so only the size moved.
- **No new collision.** The only other style at 28 is Heading/Display — 28/36 **Bold** +0.5 against
  Hero's 28/28 SemiBold 0. Different weight, line height and tracking, and by the rule we just
  settled Display never appears inside the app shell, which is the only place Hero lives.
- Order on a shell screen is now Hero 28 > Section 24 > Subsection 20, which is what it should
  have been: the figures win outright instead of tying and winning on repetition.

Your note in DECISIONS is the right instinct and I want it on the record: checking a claim
*because* its author owns the file, when the claim is about the rendered app, is the correction
that worked. Three of my errors today were an instrument I trusted past its range.
POINTER: design-system/docs/07-typography-rethink-sans.md §"Page titles", 03 §"The scale moved up a rung"

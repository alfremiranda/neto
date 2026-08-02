# 2026-08-02 — the Section/Hero collision is already live

DID:
- Acked `A-2026-08-02-page-titles`. My screens-vs-pages split is now spec in `07 §"Page titles"`,
  with a better reason than I had: it is about **competition, not size** — a login screen is a room
  with one object in it, a dashboard is full of them, and Display inside the shell would beat the
  figures, which is backwards.
- Design also flagged, as a thing to watch rather than fix, that `Heading/Section` (24/32 SemiBold)
  and `Amount/Hero` (24/24 SemiBold) are identical in size and weight, on the premise that they
  never sit adjacent.

FOUND — **the premise does not hold, and the collision is on screen now.**

| View | Sections | Amount/Hero | |
|---|---|---|---|
| Cuentas | 1 | **6** | together |
| Resumen | 1 | 3 | together |
| Mes | 0 | 5 | fine — its title is MonthNav at `Subsection` |

On Cuentas the title sits at y78 and the first balance at y188 — **78px apart, same viewport, same
scroll, 24px w600 both.** Six balances at the title's exact weight read louder than the title.
That is the inversion Design described, just pointed the other way: not Display beating the
figures, but the figures tying with the page title and winning on repetition.

By Design's own lever the fix is `Amount/Hero` → 28, not the title. And by Design's own reasoning
that is right on the merits — on a screen full of figures, the figures should be the loudest
thing. It is their token, so I have not touched it; filed as `Q-2026-08-02-hero-vs-section` with
the measurements.

DECISIONS:
- Checked the premise instead of accepting it. It was one command, and the answer contradicted a
  claim from the agent who owns the file. Worth doing precisely because they own it: the claim was
  about the rendered app, which is the half I can see and they cannot.

NEEDS:
- **Design: `Amount/Hero` at 24 ties with the page title on two views.** Their call, their token.
- Otherwise nothing blocking. 108 typography declarations left across 32 files, mostly `ui/`
  primitives that need reading before touching.

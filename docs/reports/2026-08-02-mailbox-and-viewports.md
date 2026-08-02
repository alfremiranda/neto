# 2026-08-02 — mailbox processed, mobile viewports, and a ticket that was already done

Screenshots: `2026-08-02-viewport-{mobile,desktop}.png`.

DID:
- Committed the v3.3 protocol and the new `docs/inbox/orchestrator/` fast lane.
- **Added mobile to the `?preview` harness (390px alongside 1280px) and re-verified gap fix #10**,
  which the desktop-only shots could not prove. It holds, and matches Figma exactly:

| | height | padding-x |
|---|---|---|
| mobile 390px | 44px (LG) | **16px** (LG) |
| desktop 1280px | 36px (MD) | **12px** (MD) |

  It was 12px at both widths before — the mobile input was an LG height wearing MD padding.
  I reached this by probing the component's own class string rather than a rendered field: the
  inputs live inside sheets, and driving the sheet open proved unreliable. Worth saying since it
  is a weaker instrument than measuring the real element.
- Moved four items to `dev/done/`: the buttons ticket, both `A-` answers, and the new TASK.

**`TASK-2026-08-02-button-control-styles` was already done** — `39dd5382`, four commits before
the ticket was written. The orchestrator raised it from my batch-1 FOUND, which is exactly right;
the commit just landed in between. `Button`'s size variants bind `ts-control-xs/sm/md/lg` and the
base class no longer sets `text-sm font-medium`. Closed against that commit rather than redone.
Its DONE WHEN asked for light/dark screenshots, and the batch that shipped it has them
(`2026-08-01-control-styles-*`); the viewport shots above cover it again at two widths.

FOUND:
- **Design's answer found a defect in their own file while checking mine.** Figma's `KPI-Card` had
  its figure bound to `Heading/Section` — a heading style on money, which `07 §3` forbids. Both my
  calls were confirmed (`Amount/Hero` for the strip, `Amount/Small` for 11px money) and the second
  became a rule: *a figure is never smaller than the label beside it*. No 11px rung is being added.
  The `text-[0px]` correction landed in `07 §4` too.
- Nothing of mine is contradicted by any of the four answers, and the buttons ticket closed with
  the DONE WHEN restated the way I asked rather than marked done against a condition the codebase
  cannot satisfy.

DECISIONS:
- Did not touch §1 extraction. The orchestrator parked it until typography-3 completes, then
  Design and I propose an order via peer mail. Noted so I do not drift into it.

NEEDS:
- Nothing blocking. `typography-3-classify` is the only open ticket; remaining off-scale text is
  `15px` (5 usages) and `9px` (2), and the un-batched views are `EgresosCard`, `ObligacionesCard`,
  `ProvisionesCard`, `MovimientosCard`, `CuentasView`, `AhorrosView`, `ConfigView`, `ProfileView`,
  `DashboardView` and `OnboardingView`.
- One note for whoever picks the next batch: `OnboardingView` is the largest remaining surface
  (16 radius-bearing buttons, and its own gate). `?preview` skips onboarding, so it needs a second
  flag value before it can be screenshotted. I will add it when I batch that view, not before.

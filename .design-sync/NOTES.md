# design-sync notes — Neto

- **Neto is an application, not a publishable component library** (no Storybook, no library `dist/`).
  The `/design-sync` converter (package/storybook shape) does not apply.
- The design system is published from a **curated, pre-verified preview bundle**
  (`neto-design-system-bundle.zip` → `ds-bundle/`): 7 self-contained HTML cards with the
  production CSS inline and `@dsCard` markers (auto-indexed, no register_assets needed).
  - Foundations: Colors, Typography, Spacing/Radius.
  - Components: Buttons, Badges, Cards, Inputs & switch.
- To update: replace the zip, extract, and re-run the same finalize_plan + write_files to the
  pinned project. Per CLAUDE.md DoD: re-run this whenever design-system tokens/components change.

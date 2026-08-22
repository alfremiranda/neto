#!/usr/bin/env node
/**
 * SUPERSEDED 2026-08-21 by `emit-tokens.mjs`. Kept as a hard stop, not as code.
 *
 * This script translated Figma names into published names through a 24-prefix table in
 * `rename-map.json`. The table went stale the day phase 1.2 renamed the Semantic collection,
 * and nothing noticed for four days, because a table that matches nothing and a table that
 * matches everything both exit zero. By the end it mapped 9 of 180 semantic tokens.
 *
 * The published name is now a function of the Figma name and cannot go stale. See
 * `design-system/docs/24-token-sync.md`.
 *
 * It fails loudly instead of being deleted because tickets and commit messages written
 * before today still name it, and running it now would quietly republish the old namespace.
 */
console.error(
  'apply-rename-map.mjs is superseded.\n\n' +
  '  node design-system/_build/emit-tokens.mjs [--check]\n\n' +
  'Why: the published CSS follows Figma (Alfredo, 2026-08-21). The prefix table this script\n' +
  'read is gone; token-ledger.json holds what a rule cannot derive. See docs/24-token-sync.md.',
)
process.exit(1)

#!/usr/bin/env node
/**
 * Patches src/index.css after `npx shadcn apply --preset <code>`.
 *
 * Fixes two issues the shadcn CLI reintroduces every time:
 *   1. `outline-ring/50` — Tailwind v3 can't apply opacity modifiers to raw
 *      oklch CSS variables, so this @apply always fails at build time.
 *   2. Duplicate `.theme { --font-sans... }` block — the preset adds this
 *      alongside the `html { --font-sans... }` block we already maintain,
 *      creating redundant font-var declarations.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve } from 'path'

const CSS_PATH = resolve(process.cwd(), 'src/index.css')

let css = readFileSync(CSS_PATH, 'utf8')
const original = css

// Fix 1: remove outline-ring/50 from the universal selector @apply
css = css.replace(
  /@apply border-border outline-ring\/50;/g,
  '@apply border-border;',
)

// Fix 2: remove the .theme { ... } block entirely (duplicate font vars)
css = css.replace(
  /\s*\.theme \{[^}]*--font-sans[^}]*\}/g,
  '',
)

if (css === original) {
  console.log('patch-shadcn-preset: nothing to fix, CSS already clean.')
} else {
  writeFileSync(CSS_PATH, css, 'utf8')
  console.log('patch-shadcn-preset: applied fixes to src/index.css')
}

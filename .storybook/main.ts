import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type { StorybookConfig } from '@storybook/react-vite'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/**
 * Which version of the package is painting — derived from the bytes actually served,
 * never from a field someone could forget to bump. The hash is of `tokens.css` itself,
 * so it cannot claim a version it is not rendering.
 */
function packageStamp() {
  const css = readFileSync(join(ROOT, 'design-system/tokens/tokens.css'))
  const hash = createHash('sha256').update(css).digest('hex').slice(0, 8)
  let sha = 'sin git'
  try {
    sha = execSync('git log -1 --format=%h -- design-system/tokens/tokens.css', { cwd: ROOT })
      .toString().trim() || 'sin commit'
  } catch { /* a checkout without git history still gets the hash */ }
  return { hash, sha, bytes: css.length }
}

const config: StorybookConfig = {
  // Only components already extracted into code. A story for something that lives only in
  // Figma would be a second drawing of it, and two sources of truth is the thing this
  // library exists to prevent.
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: { name: '@storybook/react-vite', options: {} },
  viteFinal: async (cfg) => {
    cfg.define = { ...cfg.define, __DS_STAMP__: JSON.stringify(packageStamp()) }
    // The app's PWA plugin has no business here: Storybook is not the app, and its
    // manager bundle is larger than workbox's precache limit, which fails the build.
    // Flattened first: Vite allows nested plugin arrays, and vite-plugin-pwa returns one,
    // so a filter over the outer array never sees its entries.
    cfg.plugins = (cfg.plugins ?? []).flat(Infinity).filter(p => {
      const name = (p as { name?: string } | null)?.name ?? ''
      return !name.startsWith('vite-plugin-pwa')
    })
    return cfg
  },
}
export default config

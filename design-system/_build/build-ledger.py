#!/usr/bin/env python3
"""
One-shot: builds `token-ledger.json` for the 2026-08-21 namespace change.

This script exists ONCE, to reconstruct a bridge that should never have needed
reconstructing. From here on the ledger is appended by whoever applies the rename,
in the same session, and this file is history.

Every entry carries HOW it was derived. Three derivations, in descending confidence:

  provenance — published name -> old Figma name (invert `rename-map.json`'s prefix
               table) -> `token-migration.json` (the applied 1.2 record) -> new Figma
               name. This is a record of what was actually done, not an inference.
  scale      — the numeric families. For a scale the number IS the job (the reasoning
               in `A-2026-08-20-fav-star §3`), so `--padding-md` = 16 -> `--spacing-16`
               is derivation, not guesswork. Family picks the target scale, value picks
               the rung. Both must agree or it lands in `pending`.
  logged     — a second hop recorded in `coherence-log.md` after 1.2 (`bg/popover` ->
               `bg/anchored`, `bg/container` -> `bg/chrome`).

Value matching is NOT a derivation and is not used. It was tried: 88 of 132 were
ambiguous and several "unique" matches were plainly wrong (`--account-1-surface` ->
`--currency-usd-surface`). Two tokens sharing a value today is Rule 7, not identity.
"""
import json, re, os, collections

H = os.path.dirname(os.path.abspath(__file__))
J = lambda n: json.load(open(os.path.join(H, n)))
rm, mig, t, d = J('rename-map.json'), J('token-migration.json'), J('tokens.json'), J('figma-dump.json')
slug = lambda n: '--' + n.replace('/', '-')

mech = {slug(v['name']) for v in d['variables'] if v['collection'] in ('Semantic', 'Component')}
pub = set(t['sem_light']) | set(t['cmp_light']) | set(t['num'])
broken = sorted(pub - mech)
numval = t['num']

# ── consumers, counted where they actually live ───────────────────────────────
ROOT = os.path.abspath(os.path.join(H, '..', '..'))
def count_uses():
    c = collections.Counter()
    targets = [(os.path.join(ROOT, 'src'), ('.tsx', '.ts', '.jsx', '.js', '.css')),
               (os.path.join(H, 'build.py'), None)]
    for path, exts in targets:
        files = [path] if os.path.isfile(path) else [
            os.path.join(dp, f) for dp, _, fs in os.walk(path) if 'node_modules' not in dp
            for f in fs if exts is None or f.endswith(exts)]
        for f in files:
            s = open(f, encoding='utf8', errors='ignore').read()
            c.update(re.findall(r'var\(\s*(--[a-z0-9-]+)', s))
            c.update(re.findall(r'"(--[a-z0-9-]+)"', s))
            c.update(re.findall(r"'(--[a-z0-9-]+)'", s))
    return c
uses = count_uses()

# ── 1. provenance ─────────────────────────────────────────────────────────────
inv = sorted(((pp, pf) for pf, pp in rm['semantic']['prefixes']), key=lambda x: -len(x[0]))
def old_figma(name):
    for pp, pf in inv:
        if name.startswith(pp):
            return pf + name[len(pp):]
    return None

LOGGED = {'--shadow-focus': '--shadow-focus-inner',   # coherence-log 2026-08-20, focus ring split inner/outer
          '--bg-popover': '--bg-anchored',            # coherence-log l.197  bg/menu + bg/popover -> bg/anchored
          '--bg-container': '--bg-chrome'}            # coherence-log l.316  bg/container -> bg/chrome

# ── 2. scale: family -> target scale; value picks the rung ────────────────────
SCALE_FAMILY = {'--padding-': 'spacing', '--spacing-component-': 'spacing',
                '--size-icon-': 'icon-size', '--size-': 'spacing', '--radius-': 'radius'}
ICON = {12: 'sm', 16: 'md', 20: 'lg', 24: 'xl'}
BORDER_WIDTH = {1: '--border-width-default', 2: '--border-width-strong', 4: '--border-width-strongest'}

def by_scale(name):
    if name.startswith('--border-width-'):
        v = numval.get(name)
        return BORDER_WIDTH.get(v)
    fam = next((f for f in sorted(SCALE_FAMILY, key=len, reverse=True) if name.startswith(f)), None)
    if not fam or name not in numval:
        return None
    v, scale = numval[name], SCALE_FAMILY[fam]
    cand = f'--icon-size-{ICON[v]}' if scale == 'icon-size' and v in ICON else f'--{scale}-{v}'
    return cand if cand in mech else None

# ── 3. named exceptions, each with a written reason ───────────────────────────
NAMED = {
    '--badge-primary-background': ('--action-chip-selected-background', 'A-2026-08-19 §2: badge/primary was borrowed by action-chip; own family authorised, renamed in place'),
    '--badge-primary-border':     ('--action-chip-selected-border',     'A-2026-08-19 §2'),
    '--badge-primary-foreground': ('--action-chip-selected-foreground', 'A-2026-08-19 §2'),
    '--input-color-border-focus': ('--input-color-ring',                'a focus border IS the ring; Figma keeps one token for the job, not two'),
    # OVERRIDES token-migration.json, which is WRONG here and was handed to Dev on 08-20.
    # It maps --color-destructive-foreground -> --fg-on-solid, i.e. white in both modes. On dark
    # the danger fill is #f87171, so white text measures 2.77:1 — below 4.5:1 and below even the
    # 3:1 large-text floor. The value the package publishes today for dark is #450a0a: 5.84:1.
    # The published value is right and the migration record is wrong; the alias follows the
    # measurement, not the record. Raised to Dev separately — if they applied that row, dark
    # danger buttons already regressed.
    '--status-destructive-foreground': ('--button-danger-filled-foreground',
        'contrast: --fg-on-solid is white in both modes and measures 2.77:1 on the dark danger '
        'fill #f87171; --button-danger-filled-foreground is #450a0a there, 5.84:1'),
}

ren, mer, rem = mig['rename'], mig['merged'], set(mig['removed'])
ledger = {'aliases': {}, 'tombstones': {}, 'pending': {}}

for n in broken:
    live = uses.get(n, 0)
    entry_base = {'uses': live}
    if n in NAMED:
        tgt, why = NAMED[n]
        if tgt in mech:
            ledger['aliases'][n] = dict(entry_base, to=tgt, via='named', why=why); continue
    of = old_figma(n)
    if of:
        naive = slug(of)
        if naive in rem:
            ledger['tombstones'][n] = dict(entry_base, via='provenance',
                                           why='token-migration.removed — deleted in 1.2, nothing replaces it')
            continue
        tgt = ren.get(naive) or mer.get(naive)
        if tgt:
            tgt = LOGGED.get(tgt, tgt)
            if tgt in mech:
                ledger['aliases'][n] = dict(entry_base, to=tgt, via='provenance',
                                            why=f'{naive} -> {tgt} in token-migration' +
                                                (' + coherence-log second hop' if ren.get(naive) in LOGGED or mer.get(naive) in LOGGED else ''))
                continue
    tgt = by_scale(n)
    if tgt:
        ledger['aliases'][n] = dict(entry_base, to=tgt, via='scale',
                                    why=f'value {numval.get(n)} on a scale family — the number is the job')
        continue
    if n == '--border-width-none':
        ledger['tombstones'][n] = dict(entry_base, via='logged',
            why='1.3 collapsed the three zeros into scale/0; Semantic keeps spacing/0 and radius/none '
                'but deliberately no border-width/none — a zero-width border is no border. Zero consumers.')
        continue
    if n.startswith('--account-'):
        ledger['pending'][n] = dict(entry_base, via='needs-decision',
            recommend='tombstone',
            decidedBy='Alfredo 2026-08-21 — account colour becomes a user choice (see docs/25-account-color.md)',
            blockedOn='build.py lines 109-112 still map --color-account-<name>-{bg,txt} onto these. '
                      'They can only be tombstoned once that bridge points at account/<hue>/* instead.',
            why='These name Alfredo\'s actual accounts (build.py lines 109-112: arq · toptal · bancol · '
                'other), not design-system roles. Figma now publishes a palette (account/purple|sky|'
                'emerald|lime|amber|pink) plus bg/account + fg/account for the neutral default, because '
                'which account gets which colour is runtime data. Recommendation: tombstone these and '
                'have build.py map the bridge onto the palette. That is a behaviour change, not a '
                'rename, so it goes to Alfredo rather than into aliases.')
        continue
    ledger['pending'][n] = dict(entry_base, why='no record derives this — needs a decision, not a guess')

meta = {
  'version': '1.0', 'date': '2026-08-21',
  'why': 'The published CSS follows Figma. Names are derived mechanically (-- + figma name, / -> -); '
         'this ledger holds the ONLY things a rule cannot derive: what an old name became, and what died.',
  'rule': 'published custom property = "--" + figma variable name with "/" replaced by "-"',
  'aliasPolicy': 'An alias is emitted alongside the new name for one cycle, then retired when its '
                 'use count reaches zero. Alfredo, 2026-08-21.',
  'derivations': {'provenance': 'invert rename-map prefixes -> token-migration (applied 1.2 record)',
                  'scale': 'numeric families: family picks the scale, value picks the rung',
                  'named': 'written exception with a cited decision',
                  'logged': 'second hop recorded in coherence-log after 1.2'},
  'notDerivedFromValues': 'Value equality is not identity (Rule 7). Value matching left 88 of 132 '
                          'ambiguous and produced confidently wrong uniques. It is not used here.',
}
out = {'_meta': meta, **ledger}
json.dump(out, open(os.path.join(H, 'token-ledger.json'), 'w'), indent=1, ensure_ascii=False)

print(f'broken {len(broken)}  ->  aliases {len(ledger["aliases"])} · tombstones {len(ledger["tombstones"])} · pending {len(ledger["pending"])}')
print(f'aliases con consumidores vivos: {sum(1 for v in ledger["aliases"].values() if v["uses"])}')
print(f'lapidas con consumidores vivos: {sum(1 for v in ledger["tombstones"].values() if v["uses"])}  <- deben ser 0')
print('\nPENDING:')
for k, v in ledger['pending'].items():
    print(f'  {v["uses"]:>3} usos  {k}')
print('\nLAPIDAS VIVAS (si las hay):')
for k, v in ledger['tombstones'].items():
    if v['uses']: print(f'  {v["uses"]:>3} usos  {k}')

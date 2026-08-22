#!/usr/bin/env python3
"""
Builds `components.json` — the registry `build.py` turns into the component pages under
`design-system/components/`.

WHY THIS EXISTS. The registry was maintained by hand and drifted nine components behind
Figma. Dev looked for SegmentedControl there, found nothing, and built one from the old
code design — pill vs rounded, solid brand fill vs a 20% wash. Alfredo spotted it in a
minute. That failure is not Dev's and not mine: it is the channel's. A mirror nobody
refreshes will eventually say "does not exist" about something that does.

HOW. Same shape as the token dump: Figma is exported in chunks to `components-parts/*.json`
(one file per group of pages), and this script merges them over whatever the registry already
holds. An entry present in a part REPLACES the old one wholesale; a group with no part file is
carried over untouched AND REPORTED, so nobody has to guess which half is current.

`retired` names are dropped: they exist in the registry and not in Figma.

  python3 design-system/_build/assemble-components.py
"""
import json, os, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
PARTS = os.path.join(HERE, 'components-parts')
REG = os.path.join(HERE, 'components.json')

# In the registry and no longer in Figma. Not drift — deliberate retirement.
RETIRED = {'DatePicker': 'retired into Field + Input, 2026-08-20',
           'MoneyInput': 'retired into Field + Input, 2026-08-20'}

current = {e['n']: e for e in json.load(open(REG))}
fresh, groups_refreshed = {}, set()
for f in sorted(glob.glob(os.path.join(PARTS, '*.json'))):
    if os.path.basename(f).startswith('_'):
        continue
    for e in json.load(open(f)):
        for k in ('g', 'n', 'v', 'p', 'w', 'h', 'd'):
            if k not in e:
                sys.exit(f'FAIL {os.path.basename(f)}: entry {e.get("n")} is missing "{k}"')
        if not e['d'].strip():
            sys.exit(f'FAIL {e["n"]}: empty description. A component page with no description '
                     f'is what sent Dev to build one from memory.')
        fresh[e['n']] = e
        groups_refreshed.add(e['g'])

merged = dict(current)
for name in RETIRED:
    merged.pop(name, None)
merged.update(fresh)

out = sorted(merged.values(), key=lambda e: (e['g'], e['n'].lower()))
json.dump(out, open(REG, 'w'), ensure_ascii=False, indent=1)

stale = sorted({e['g'] for e in out} - groups_refreshed)
print(f'{len(out)} components -> components.json')
print(f'  refreshed from Figma : {", ".join(sorted(groups_refreshed))}  ({len(fresh)} entries)')
print(f'  retired and dropped  : {", ".join(RETIRED)}')
if stale:
    print(f'  CARRIED OVER, NOT REFRESHED: {", ".join(stale)}')
    print('  -> these groups have no part file. Their descriptions and variant counts are as old')
    print('     as the last hand-edit. Export them into components-parts/ to close the gap.')

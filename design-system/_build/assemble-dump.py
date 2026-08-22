#!/usr/bin/env python3
"""
STAGE 1b of the exporter — reassembles `figma-dump.json` from the chunked TSVs
that `figma-dump.js` had to emit one slice at a time.

Why chunks exist: `use_figma` caps its response at 20 kB and truncates SILENTLY.
A single call that returns all 731 variables loses the tail without erroring, so
stage 1 is run once per collection slice and each slice is written verbatim to
`dump-parts/*.tsv`. This script is the only place the slices are joined, and it
asserts the per-collection counts so a lost chunk fails loudly instead of
producing a short dump that reads as a real one.

TSV shape (no header, tab-separated, values already CSS-formatted by stage 1):
  1-mode collections (Typography, Primitives):  name  type  value
  2-mode collections (Semantic, Component):     name  type  Light  Dark  aliasLight  aliasDark
An empty alias field means the value is a source, not an alias.

Collection order follows Figma's own `getLocalVariableCollectionsAsync()` order
recorded in meta.json — the dump is verbatim, and that includes ordering.

  python3 design-system/_build/assemble-dump.py
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
PARTS = os.path.join(HERE, 'dump-parts')

# collection -> (chunk files in order, expected total)
# Chunk files per collection. The EXPECTED COUNTS are not here: they live in
# meta.json, written by the same stage-1 run that produced the chunks. Hardcoding
# them here means every token minted in Figma makes this file wrong, and a count
# assertion that has to be edited by hand is one that gets edited to match instead
# of being believed.
CHUNKS = {
    'Semantic':   ['semantic-1.tsv', 'semantic-2.tsv'],
    'Typography': ['typography.tsv'],
    'Component':  ['component-1.tsv', 'component-2.tsv'],
    'Primitives': ['primitives-1.tsv', 'primitives-2.tsv'],
}

meta = json.load(open(os.path.join(PARTS, 'meta.json')))
if 'exportedAt' not in meta:
    sys.exit('FAIL: meta.json has no exportedAt. Stage 1 must record when it ran — the auditor '
             'warns on dump age, and an age it invents at assembly time is not an age.')
modes_by_collection = {c['name']: c['modes'] for c in meta['collections']}


def coerce(vtype, raw):
    """FLOAT is a number in Figma; the TSV round-trip made it a string."""
    if vtype == 'FLOAT':
        f = float(raw)
        return int(f) if f == int(f) else f
    return raw


variables = []
for collection in [c['name'] for c in meta['collections']]:
    files = CHUNKS[collection]
    expected = meta.get('counts', {}).get(collection)
    modes = modes_by_collection[collection]
    rows = []
    for fname in files:
        with open(os.path.join(PARTS, fname)) as fh:
            for line in fh:
                line = line.rstrip('\n')
                if line:
                    rows.append(line.split('\t'))
    if expected is None:
        sys.exit(f'FAIL {collection}: meta.json has no expected count. Stage 1 must record it — '
                 f'without it a truncated chunk is indistinguishable from a complete one.')
    if len(rows) != expected:
        sys.exit(f'FAIL {collection}: {len(rows)} rows, expected {expected} — a chunk is missing or truncated')

    for cols in rows:
        name, vtype = cols[0], cols[1]
        want = 2 + len(modes) * (2 if len(modes) > 1 else 1)
        if len(cols) < 2 + len(modes):
            sys.exit(f'FAIL {collection}/{name}: {len(cols)} columns, expected {want}')
        values, aliases = {}, {}
        for i, mode in enumerate(modes):
            values[mode] = coerce(vtype, cols[2 + i])
            if len(modes) > 1:
                alias = cols[2 + len(modes) + i] if len(cols) > 2 + len(modes) + i else ''
                if alias:
                    aliases[mode] = alias
        entry = {'collection': collection, 'name': name, 'type': vtype, 'values': values}
        if aliases:
            entry['aliases'] = aliases
        variables.append(entry)

# ── two schemas, both real ────────────────────────────────────────────────────
# `figma-dump.js`'s header documents a `variables` array. `apply-rename-map.mjs`
# — the only consumer — reads `dump.chunks`, each `{collection, rows}` with rows
# of `[name, light, dark]`. Neither side was wrong; nobody owned the seam, which
# is why the Dev queue sat blocked on a handoff that had never been run end to end.
#
# The dump carries BOTH. `variables` is the verbatim record (all four collections,
# types, aliases, per-mode values) and is what any future consumer should read.
# `chunks` is the shape stage 2 already parses, so it runs today without a patch.
#
# `chunks` holds ONLY Semantic and Component. Stage 2 branches `isSemantic` and
# treats every other chunk as Component — handing it Typography or Primitives
# would slug 392 raw values into `--cmp-*` keys that no stylesheet ever asked for.
CHUNKED = ['Semantic', 'Component']
chunks = []
for collection in CHUNKED:
    modes = modes_by_collection[collection]
    light, dark = modes[0], modes[1]
    rows = [[v['name'], v['values'][light], v['values'][dark]]
            for v in variables if v['collection'] == collection]
    chunks.append({'collection': collection, 'rows': rows})

# Key order mirrors the 2026-08-17 dump so a diff between the two reads as
# content, not as a reshuffle. `resolver` is not decoration: it records that
# aliases were followed by mode NAME, the bug that made 19 of 92 component
# tokens silently wrong when they were followed by the target's default mode.
dump = {
    # NOT date.today(): this script is a pure transform of the chunks, and a field that
    # changes on every run makes the committed dump unverifiable — you cannot re-run the
    # assembler and diff it against what is in git. The date belongs to the EXTRACTION,
    # so stage 1 records it in meta.json, next to the counts, for the same reason.
    'exportedAt': meta['exportedAt'],
    'file': meta['exportedFrom'],   # verbatim figma.root.name — it really is "Document"
    'fileKey': 'Q2R72oH6MYxYr1VKAe5nOx',
    'exportedFrom': meta['exportedFrom'],
    'resolver': 'alias-by-mode-name',
    'collections': meta['collections'],
    'chunks': chunks,
    'variables': variables,
    'textStyles': meta['textStyles'],
}

out = os.path.join(HERE, 'figma-dump.json')
with open(out, 'w') as fh:
    json.dump(dump, fh, indent=2, ensure_ascii=False)
    fh.write('\n')

print(f'{len(variables)} variables, {len(dump["textStyles"])} text styles -> {out}')
print(f'chunks: ' + ' · '.join(f'{c["collection"]} {len(c["rows"])}' for c in chunks))
for c in meta['collections']:
    n = sum(1 for v in variables if v['collection'] == c['name'])
    a = sum(1 for v in variables if v['collection'] == c['name'] and 'aliases' in v)
    print(f'  {c["name"]:<12} {n:>4}  ({a} aliased)  modes={",".join(c["modes"])}')

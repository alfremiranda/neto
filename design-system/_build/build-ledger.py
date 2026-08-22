#!/usr/bin/env python3
"""
SPENT. Ran once, 2026-08-21, to reconstruct token-ledger.json. Do not run it again.

It derives the ledger from the DIFFERENCE between Figma and the published tokens.json.
Once tokens.json was migrated that difference is empty, so a second run produces an EMPTY
ledger — and emit-tokens.mjs, reading it, drops all 120 aliases and every retired name in
the package stops resolving. That is not hypothetical: it happened on 2026-08-22 and was
caught only because the alias count printed 0.

The ledger is now maintained BY HAND, one entry at a time, by whoever performs the rename.
That is the rule in docs/24-token-sync.md §2 and this file is what happens when it is not
followed. Edit token-ledger.json directly; verify with token-drift.mjs.
"""
import sys
sys.exit(
    "build-ledger.py is spent and refuses to run.\n\n"
    "  Re-running it against a migrated tokens.json emits an EMPTY ledger, and emit-tokens.mjs\n"
    "  then drops every alias. Edit design-system/_build/token-ledger.json by hand and verify\n"
    "  with token-drift.mjs. See docs/24-token-sync.md section 2."
)

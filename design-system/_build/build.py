#!/usr/bin/env python3
"""Builds design-system/ for the Neto repo from tokens exported out of Figma."""
import json, os, html, re, shutil

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.environ.get("DS_OUT", "/home/claude/design-system")
T = json.load(open(f"{HERE}/tokens.json"))
COMPS = json.load(open(f"{HERE}/components.json"))
SL, SD, CL, CD, NUM = T["sem_light"], T["sem_dark"], T["cmp_light"], T["cmp_dark"], T["num"]
# Blocks added 2026-08-21 when the published names started following Figma (docs/24-token-sync.md).
# The block IS the unit — build.py appends one per block — so a duration cannot share the px
# block with a length: --motion-duration-fast: 150px would be silent nonsense, not a rounding
# error. ALIAS holds every retired name pointing at its replacement via var(), which is what
# lets the rename land in one commit while src/ and the bridge below keep resolving.
DUR   = T.get("dur", {})     # ms
RAW   = T.get("raw", {})     # easing curves — no unit
ALIAS = T.get("alias", {})   # --old: var(--new) — no unit, resolves per mode through the target
# Quarantine: published names with NO Figma source, frozen at their current value because
# dropping them would break live consumers and inventing a source would be a guess. Every one
# is listed in token-ledger.json under `pending`. This block should only ever shrink.
LEG_L = T.get("legacy_light", {})
LEG_D = T.get("legacy_dark", {})

TS = {}
for row in T["text"]:
    name, weight, size, lh, ls = row.split("|")
    TS[name] = dict(weight=weight, size=int(size), lh=lh, ls=float(ls))
W = {"Regular": 400, "Medium": 500, "SemiBold": 600, "Bold": 700, "ExtraBold": 800}

def ts(name):
    t = TS[name]
    lh = t["lh"] if t["lh"] == "normal" else f'{t["lh"]}px'
    # font-family is referenced, not emitted: tokens.css must not define --font-sans, or importing
    # it would swap the family before the font is installed. The app owns that variable; when
    # ticket 1 points it at Rethink Sans, all 26 classes follow in one move.
    out = (f'font-family:var(--font-sans);font-weight:{W[t["weight"]]};font-size:{t["size"]}px;'
           f'line-height:{lh};letter-spacing:{t["ls"]}px;')
    # Rethink Sans is tabular by default, so this is inert today. It stays because the alignment
    # of a column of money must not depend on which family happens to be installed.
    # Label/Badge joins them: a badge usually holds a count, and 9 -> 10 -> 99 must not
    # reflow the chip. Inert on non-numeric badge text.
    if name.startswith("Amount/") or name == "Label/Badge":
        out += "font-variant-numeric:tabular-nums;"
    return out

def slug(s):
    s = s.lower().replace("/", "-").replace(" ", "-")
    return re.sub(r"[^a-z0-9-]", "", s).strip("-")

# ── tokens.css ────────────────────────────────────────────────────────────
def tokens_css():
    def blk(d, unit=""):
        return "\n".join(f"  {k}: {v}{unit};" for k, v in d.items() if v is not None)
    ts_blk = "\n".join(f'.ts-{slug(n)} {{ {ts(n)} }}' for n in TS)
    return f"""/* Neto design tokens — generated from Figma. Do not edit by hand.
   Source: https://www.figma.com/design/Q2R72oH6MYxYr1VKAe5nOx/Neto
   Layers: Primitives -> Semantic -> Component. Only Semantic is for general design work. */

:root, [data-theme="light"] {{
{blk(SL)}
{blk(CL)}
{blk(NUM, "px")}
{blk(DUR, "ms")}
{blk(RAW)}

  /* Retired names, still emitted so nothing breaks mid-migration. Each one resolves
     through var(), so it follows its replacement into dark without a second declaration.
     token-drift.mjs lists the ones at zero consumers as RETIRABLE — delete those. */
{blk(ALIAS)}

  /* QUARANTINE — no Figma source. See token-ledger.json `pending`. Should only shrink. */
{blk(LEG_L)}
}}

/* Two dark selectors on purpose: [data-theme] is what the generated previews in this
   folder use; .dark is what the app toggles (src/hooks/useTheme.ts). Keep both.

   There is deliberately NO @media (prefers-color-scheme: dark) block. The app already
   reads the OS preference in JS and then writes an explicit class, so a CSS-level media
   query would outrank the user's own choice: someone on a dark OS who picks "light" in
   the app would get dark tokens under light classes. The toggle is the only authority. */
[data-theme="dark"], .dark {{
{blk(SD)}
{blk(CD)}
{blk(LEG_D)}
}}

/* Text styles — Rethink Sans, tabular by default */
{ts_blk}
"""

# ── tokens.map.css ────────────────────────────────────────────────────────
MAP = [
    ("Surfaces & text", [
        ("--background", "--surface-wrap-default"), ("--foreground", "--foreground-default"),
        ("--card", "--surface-wrap-card"), ("--card-foreground", "--foreground-on-card"),
        ("--muted", "--surface-wrap-subtle"), ("--muted-foreground", "--foreground-subtle"),
        ("--popover", "--surface-popover"), ("--popover-foreground", "--foreground-on-popover"),
        ("--border", "--border-default"),
        # --input is shadcn's *input field* border, not a generic border. It has to follow the
        # Input component (slate-300 / slate-700), not border/input (slate-200 / white-20),
        # or the field boundary comes out a step lighter than the component it belongs to.
        ("--input", "--input-color-border-default"), ("--ring", "--border-focus"),
        ("--n-txt3", "--foreground-placeholder"),
    ]),
    ("Interactive", [
        ("--primary", "--interactive-primary"), ("--primary-foreground", "--interactive-primary-foreground"),
        ("--secondary", "--interactive-secondary"), ("--secondary-foreground", "--interactive-secondary-foreground"),
        ("--accent", "--interactive-accent"), ("--accent-foreground", "--interactive-accent-foreground"),
        ("--destructive", "--status-destructive-default"), ("--destructive-foreground", "--status-destructive-foreground"),
    ]),
    ("Financial KPIs", [
        ("--color-income", "--kpi-income-default"), ("--color-income-bg", "--kpi-income-surface"), ("--color-income-txt", "--kpi-income-foreground"),
        ("--color-expense", "--kpi-expense-default"), ("--color-expense-bg", "--kpi-expense-surface"), ("--color-expense-txt", "--kpi-expense-foreground"),
        ("--color-provision", "--kpi-provision-default"), ("--color-provision-bg", "--kpi-provision-surface"), ("--color-provision-txt", "--kpi-provision-foreground"),
        ("--color-tax", "--kpi-tax-default"), ("--color-tax-bg", "--kpi-tax-surface"), ("--color-tax-txt", "--kpi-tax-foreground"),
        ("--color-net", "--kpi-net-default"), ("--color-net-bg", "--kpi-net-surface"), ("--color-net-txt", "--kpi-net-foreground"),
        ("--color-danger", "--status-danger-default"), ("--color-danger-bg", "--status-danger-surface"),
    ]),
    ("Favourite star", [
        # A favourite is not a tax. These shared kpi/tax/foreground by accident in light
        # (#b45309) and already diverged in dark (#fde68a vs #fcd34d).
        ("--color-fav-bg", "--fav-default-background"), ("--color-fav-txt", "--fav-default-foreground"),
        ("--color-fav-selected-bg", "--fav-selected-background"), ("--color-fav-selected-txt", "--fav-selected-foreground"),
    ]),
    ("Currency chips", [
        # The app's Badge paints usd/cop with kpi/income and kpi/provision, which happen to hold
        # the same values as account/1 and account/3. Same accident as the favourite star.
        ("--color-currency-usd-bg", "--currency-usd-surface"), ("--color-currency-usd-txt", "--currency-usd-foreground"),
        ("--color-currency-cop-bg", "--currency-cop-surface"), ("--color-currency-cop-txt", "--currency-cop-foreground"),
    ]),
    ("Accounts", [
        # The old --account-{1..4}-* hard-coded four of Alfredo's own accounts into the
        # design system. An account's identity colour is now runtime data on the record
        # (docs/25-account-color.md); the chrome around it is neutral. All four app names
        # therefore resolve to the one neutral pair, which is byte-identical to what
        # --account-4-* held in both modes. Only `toptal` changes on screen: violet ->
        # neutral, which is the defect surfacing, not a loss.
        ("--color-account-arq-bg", "--bg-account"), ("--color-account-arq-txt", "--fg-account"),
        ("--color-account-toptal-bg", "--bg-account"), ("--color-account-toptal-txt", "--fg-account"),
        ("--color-account-bancol-bg", "--bg-account"), ("--color-account-bancol-txt", "--fg-account"),
        ("--color-account-other-bg", "--bg-account"), ("--color-account-other-txt", "--fg-account"),
    ]),
]
CATS = [("home", "home"), ("food", "food"), ("bank", "bank"), ("health", "health"), ("transit", "transit"),
        ("tech", "connectivity"), ("recreation", "recreation"), ("work", "work"), ("family", "family"),
        ("insurance", "insurance"), ("savings", "savings"), ("travel", "travel"), ("taxes", "tax"),
        ("shopping", "shopping"), ("other", "other")]
GAPS = [
    ("--font-sans", "--font-family in Figma resolves to Rethink Sans. The app still ships Inter Variable; changing it is a build change, not a token swap."),
    ("--font-mono", "Figma no longer has a mono family: Rethink Sans is tabular by default, so monospace figures are unnecessary."),
    ("--font-heading", "In code this aliases --font-mono. That relationship does not exist in Figma any more and has to be redefined, not remapped."),
    ("--radius", "The app derives every radius from one base with calc(). Figma has a named scale (radius/xs..2xl). Not a 1:1 mapping."),
]
# Optional prose shown above a MAP group in tokens.map.css.
NOTES = {
    "Favourite star": ("was borrowing --color-tax-txt, which is the same value by accident.\n"
                       "     A favourite is not a tax: if the tax amber ever moves, the star must not follow."),
}

def check_map_sources():
    """Every MAP target must be a token that actually exists.

    tokens_map_css() emits `var(--x)` verbatim, so a MAP line pointing at a token the
    export no longer produces breaks SILENTLY: the CSS is still valid, the variable is
    just undefined, and the colour falls back to nothing. Nobody sees a build error —
    they see an uncoloured badge, weeks later.

    This is not hypothetical. `rename-map.json` kills --account-{1..4}-{surface,foreground},
    which lines 109-112 below still reference; whoever accepts that kill has to retarget
    those four pairs in the SAME commit. This turns that into a loud failure.
    """
    # ALIAS counts as known on purpose: a retired name that still resolves is not missing.
    # That is the whole point of the alias layer — the bridge below may keep pointing at old
    # names until Dev migrates it, and doing so must not be an error.
    known = set(SL) | set(SD) | set(CL) | set(CD) | set(NUM) | set(DUR) | set(RAW) | set(ALIAS) | set(LEG_L)
    missing = [(app, tok) for _, pairs in MAP for app, tok in pairs if tok not in known]
    missing += [(f"--cat-{app}", f"--category-{fig}-{kind}")
                for app, fig in CATS for kind in ("default", "surface")
                if f"--category-{fig}-{kind}" not in known]
    if missing:
        raise SystemExit(
            "build.py: MAP points at tokens that this export does not produce.\n"
            "Retarget them (or restore the tokens) — do not ship a dangling var():\n"
            + "\n".join(f"  {app} -> var({tok})   [missing]" for app, tok in missing)
        )


def tokens_map_css():
    out = ["""/* Bridge: the variable names the app already uses -> the generated tokens.
   Import AFTER tokens.css, then delete the corresponding declarations from src/index.css.
   Nothing here invents a value: every line points at a token generated from Figma. */

:root, [data-theme="light"], [data-theme="dark"], .dark {"""]
    for title, pairs in MAP:
        note = NOTES.get(title)
        out.append(f"\n  /* {title} — {note} */" if note else f"\n  /* {title} */")
        for app, tok in pairs:
            out.append(f"  {app}: var({tok});")
    out.append("\n  /* Expense categories — app id -> Figma category id */")
    for app, fig in CATS:
        out.append(f"  --cat-{app}: var(--category-{fig}-default);")
        out.append(f"  --cat-{app}-bg: var(--category-{fig}-surface);")
    out.append("}\n")
    out.append("/* ── NO EQUIVALENT — these need a decision, not a mapping ──────────── */")
    for name, why in GAPS:
        out.append(f"/* {name}\n     {why} */")
    return "\n".join(out) + "\n"

# ── preview mocks ─────────────────────────────────────────────────────────
def btn(label="Guardar", kind="filled", size="md", danger=False, disabled=False):
    px, h = NUM[f"--button-size-{size}-padding-x"], NUM[f"--button-size-{size}-height"]
    # Button binds radius/full at every size. The old graduated button/size/*/radius
    # tokens (10-16) were never used by the component and were deleted from Figma.
    r, fs = NUM["--radius-full"], NUM[f"--button-text-{size}-size"]
    if kind == "filled":
        s = (f'background:var(--button-danger-filled-background);color:var(--button-danger-filled-foreground);'
             if danger else 'background:var(--button-filled-background-default);color:var(--button-filled-foreground);') + 'border:1px solid transparent;'
    elif kind == "outline":
        s = (f'color:var(--button-danger-foreground);border:1px solid var(--button-danger-border);'
             if danger else 'color:var(--button-outline-foreground);border:1px solid var(--button-outline-border);') + 'background:transparent;'
    else:
        s = (f'color:var(--button-danger-foreground);' if danger else 'color:var(--button-ghost-foreground);') + 'background:transparent;border:1px solid transparent;'
    op = "opacity:.5;" if disabled else ""
    return (f'<span style="display:inline-flex;align-items:center;justify-content:center;height:{h}px;padding:0 {px}px;'
            f'border-radius:{r}px;font-weight:500;font-size:{fs}px;line-height:1;letter-spacing:.5px;white-space:nowrap;{s}{op}">{html.escape(label)}</span>')

def chip(text, bg, fg, bd=None):
    b = f'border:1px solid var({bd});' if bd else 'border:1px solid transparent;'
    return (f'<span style="display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:999px;'
            f'background:var({bg});color:var({fg});{b}font-weight:500;font-size:10px;line-height:10px;white-space:nowrap">{html.escape(text)}</span>')

def field(v="8.800.000", state="default", size="md", ph=False):
    h, px = NUM[f"--input-size-{size}-height"], NUM[f"--input-size-{size}-padding-x"]
    fs, r = NUM[f"--input-text-{size}-size"], NUM["--input-radius"]
    bd = {"default": "--input-color-border-default", "focused": "--input-color-border-focus", "focus": "--input-color-border-focus",
          "open": "--input-color-border-focus", "error": "--input-color-border-error", "disabled": "--input-color-border-disabled",
          "hint": "--input-color-border-default"}.get(state, "--input-color-border-default")
    bw = 2 if state in ("focus", "focused", "open") else 1
    fg = "--input-color-placeholder" if ph or state == "disabled" else "--input-color-foreground"
    op = "opacity:.5;" if state == "disabled" else ""
    return (f'<span style="display:inline-flex;align-items:center;width:230px;height:{h}px;padding:0 {px}px;border-radius:{r}px;'
            f'background:var(--input-color-background);border:{bw}px solid var({bd});color:var({fg});font-size:{fs}px;{op}">{html.escape(v)}</span>')

def sw(on=False, dis=False):
    return (f'<span style="display:inline-flex;align-items:center;justify-content:{"flex-end" if on else "flex-start"};'
            f'width:36px;height:20px;padding:2px;border-radius:999px;'
            f'background:var({"--switch-track-on" if on else "--switch-track-off"});{"opacity:.5;" if dis else ""}">'
            f'<span style="width:16px;height:16px;border-radius:999px;background:var(--switch-thumb)"></span></span>')

def sq(px=14, tok="--foreground-default"):
    return f'<span style="display:inline-block;width:{px}px;height:{px}px;border:1.5px solid var({tok});border-radius:3px"></span>'

CATIDS = ["home", "food", "bank", "health", "transit", "connectivity", "recreation", "work",
          "family", "insurance", "savings", "travel", "tax", "shopping", "other"]

def mock(n, c):
    if n == "Button":
        rows = []
        for kind in ("filled", "outline", "ghost"):
            for dg in (False, True):
                rows.append('<div class="row">' + "".join(btn("Guardar", kind, s, dg) for s in ("sm", "md", "lg", "xl")) + '</div>')
        rows.append('<div class="row">' + btn("Disabled", "filled", "md", False, True) + btn("Disabled", "outline", "md", False, True) + '</div>')
        return "".join(rows)
    if n == "Icon Button":
        rows = []
        for kind in ("filled", "outline", "ghost"):
            cells = []
            for s in ("sm", "md", "lg", "xl"):
                px, r = NUM[f"--button-icon-size-{s}-size"], NUM["--radius-full"]
                st = ('background:var(--button-filled-background-default);color:var(--button-filled-foreground);' if kind == "filled"
                      else 'border:1px solid var(--button-outline-border);color:var(--button-outline-foreground);' if kind == "outline"
                      else 'color:var(--button-ghost-foreground);')
                cells.append(f'<span style="display:inline-flex;align-items:center;justify-content:center;width:{px}px;height:{px}px;border-radius:{r}px;{st}">'
                             + sq(12, "--button-filled-foreground" if kind == "filled" else "--button-outline-foreground") + '</span>')
            rows.append('<div class="row">' + "".join(cells) + '</div>')
        return "".join(rows)
    if n == "action-chip":
        base = '<span style="display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:999px;'
        return ('<div class="row">'
                + base + 'border:1px solid var(--border-default);color:var(--foreground-subtle)">Alimentación</span>'
                + base + 'background:var(--surface-status-selected);color:var(--interactive-primary);border:1px solid transparent">Vivienda '
                + chip("4", "--notification-primary-background", "--notification-primary-foreground") + '</span>'
                + base + 'border:1px solid var(--border-default);color:var(--foreground-placeholder);opacity:.5">Viajes</span></div>')
    if n in ("Badge", "Status"):
        pal = [("--badge-neutral-background", "--badge-neutral-foreground"), ("--badge-success-background", "--badge-success-foreground"),
               ("--badge-info-background", "--badge-info-foreground"), ("--badge-warning-background", "--badge-warning-foreground"),
               ("--badge-danger-background", "--badge-danger-foreground"), ("--badge-accent-background", "--badge-accent-foreground")]
        lbl = ["Gray", "Green", "Blue", "Orange", "Red", "Purple"] if n == "Badge" else ["Sin confirmar", "Al día", "Programado", "Próximo", "Vencido", "Otro"]
        return '<div class="row">' + "".join(chip(l, b, f) for l, (b, f) in zip(lbl, pal)) + '</div>'
    if n == "AccountBadge":
        return '<div class="row">' + "".join(chip(l, f"--account-{i+1}-surface", f"--account-{i+1}-foreground")
                                             for i, l in enumerate(["ARQ", "Toptal", "Bancolombia", "Otra"])) + '</div>'
    if n == "CurrencyBadge":
        return ('<div class="row">' + chip("USD", "--kpi-income-surface", "--kpi-income-foreground")
                + chip("COP", "--kpi-provision-surface", "--kpi-provision-foreground") + '</div>')
    if n == "NotificationBadge":
        return ('<div class="row">' + chip("3", "--notification-primary-background", "--notification-primary-foreground")
                + chip("7", "--notification-secondary-background", "--notification-secondary-foreground") + '</div>')
    if n == "category-badge":
        return '<div class="row">' + "".join(chip(k, f"--category-{k}-surface", f"--category-{k}-default") for k in CATIDS) + '</div>'
    if n == "TRMBadge":
        return '<div class="row">' + chip("TRM 4.012,55", "--surface-wrap-subtle", "--foreground-subtle") + '</div>'
    if n == "Favorite":
        return ('<div class="row">' + chip("☆", "--fav-default-background", "--fav-default-foreground")
                + chip("★", "--fav-selected-background", "--fav-selected-foreground") + '</div>')
    if n == "Indicator":
        return '<div class="row"><span style="width:6px;height:6px;border-radius:999px;background:var(--interactive-primary);display:inline-block"></span></div>'
    if n == "Switch":
        return '<div class="row">' + sw(False) + sw(True) + sw(False, True) + sw(True, True) + '</div>'
    if n == "Input":
        return "".join(f'<div class="row">{field("Placeholder text", s, "md", s == "default")}<span class="note">{s}</span></div>'
                       for s in ("default", "focused", "error", "disabled"))
    if n == "Select":
        return "".join(f'<div class="row">{field("Select an option…", s, "md", True)}<span class="note">{s}</span></div>'
                       for s in ("default", "open", "error", "disabled"))
    if n == "MoneyInput":
        out = []
        for st, msg, tok in (("default", None, None), ("focus", None, None),
                             ("hint", "Equivale a USD 2.150", "--kpi-income-default"),
                             ("error", "Ingresa un monto válido", "--status-danger-default"), ("disabled", None, None)):
            m = f'<div style="{ts("Detail/Emphasis")}color:var({tok});margin-top:2px">{msg}</div>' if msg else ""
            out.append(f'<div><div style="{ts("Label/Base")}color:var(--input-color-label);margin-bottom:4px">Monto (COP)</div>{field("8.800.000", st)}{m}</div>')
        return "".join(out)
    if n == "DatePicker":
        return ('<div class="row">' + field("18 de junio 2026") + '</div>'
                + '<div class="row">' + field("Seleccionar fecha", "default", "md", True) + '</div>'
                + '<div class="row">' + field("18 de junio 2026", "focus") + '</div>')
    if n == "Calendar":
        heads = "".join(f'<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;{ts("Label/Micro")}color:var(--foreground-subtle)">{d}</span>' for d in "LMMJVSD")
        cells = "".join(f'<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:28px;{ts("Body/Small")}'
                        + ('background:var(--interactive-primary);color:var(--interactive-primary-foreground);border-radius:6px;' if d == 18
                           else 'border:1px solid var(--border-default);border-radius:6px;color:var(--foreground-on-popover);' if d == 11
                           else 'color:var(--foreground-on-popover);') + f'">{d}</span>' for d in range(1, 29))
        return (f'<div style="background:var(--surface-popover);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:16px;width:248px">'
                f'<div style="{ts("Heading/Group")}text-align:center;margin-bottom:8px;color:var(--foreground-on-popover)">junio 2026</div>'
                f'<div style="display:flex;flex-wrap:wrap;width:224px">{heads}{cells}</div></div>')
    if n == "Tab":
        return ('<div class="row">'
                f'<span style="{ts("Body/Small-Emphasis")}padding:8px 12px;color:var(--foreground-subtle)">Ingresos</span>'
                f'<span style="{ts("Body/Small-Emphasis")}padding:8px 12px;color:var(--interactive-primary);border-bottom:2px solid var(--interactive-primary)">Gastos</span>'
                f'<span style="{ts("Body/Small-Emphasis")}padding:8px 12px;color:var(--foreground-placeholder)">Provisiones</span></div>')
    if n == "Card":
        def card(footer):
            f = ('<div style="border-top:1px solid var(--border-default);padding:8px 16px;'
                 f'{ts("Body/Small")}color:var(--foreground-subtle)">Acción de pie</div>') if footer else ""
            return (f'<div style="width:250px;background:var(--surface-wrap-card);border:1px solid var(--border-default);'
                    f'border-radius:var(--radius-xl);overflow:hidden">'
                    f'<div style="padding:16px 16px 0"><div style="{ts("Heading/Card")}color:var(--foreground-on-card)">Título de la card</div>'
                    f'<div style="{ts("Body/Base")}color:var(--foreground-subtle)">Descripción secundaria</div></div>'
                    f'<div style="padding:16px;{ts("Body/Base")}color:var(--foreground-on-card)">Contenido</div>{f}</div>')
        return '<div class="row">' + card(False) + card(True) + '</div>'
    if n == "SectionCard":
        def sc(action):
            a = (f'<span style="{ts("Control/SM")}background:var(--surface-status-hover);color:var(--foreground-on-card);padding:5px 8px;border-radius:var(--radius-md)">Agregar</span>') if action else ""
            return (f'<div style="width:300px;background:var(--surface-wrap-card);border:1px solid var(--border-default);border-radius:var(--radius-xl)">'
                    f'<div style="display:flex;align-items:center;gap:8px;padding:16px 16px 8px">{sq(14,"--foreground-on-card")}'
                    f'<span style="flex:1;{ts("Heading/Group")}color:var(--foreground-on-card)">Ingresos del mes</span>{a}</div>'
                    f'<div style="padding:0 16px 16px;{ts("Body/Base")}color:var(--foreground-subtle)">Contenido de la sección</div></div>')
        return '<div class="row">' + sc(False) + sc(True) + '</div>'
    if n == "MetricCard":
        def mc(sub):
            s = f'<div style="{ts("Detail/Base")}color:var(--foreground-subtle)">USD 2.150</div>' if sub else ""
            return (f'<div style="width:160px;background:var(--surface-wrap-subtle);border-radius:var(--radius-xl);padding:16px">'
                    f'<div style="{ts("Detail/Large")}color:var(--foreground-subtle)">Ingreso bruto</div>'
                    f'<div style="{ts("Amount/Large")}color:var(--foreground-default)">$ 8.800.000</div>{s}</div>')
        return '<div class="row">' + mc(False) + mc(True) + '</div>'
    if n == "KPI-Card":
        return ('<div class="row">' + "".join(
            f'<div style="width:160px;background:var(--surface-wrap-card);border:1px solid var(--border-default);border-radius:var(--radius-xl);padding:12px">'
            f'<div style="{ts("Label/Micro")}text-transform:uppercase;color:var(--kpi-{k}-foreground)">{l}</div>'
            f'<div style="{ts("Amount/Hero")}color:var(--foreground-on-card)">{v}</div></div>'
            for k, l, v in [("income", "Ingreso bruto", "$ 8.800.000"), ("net", "Neto libre", "$ 2.640.000")]) + '</div>')
    if n == "DistribucionCard":
        segs = [("--kpi-tax-default", 21, "Obligaciones"), ("--kpi-provision-default", 18, "Provisiones"),
                ("--kpi-expense-default", 31, "Gastos"), ("--kpi-net-default", 30, "Neto libre")]
        bar = "".join(f'<span style="flex:{p};background:var({t})"></span>' for t, p, _ in segs)
        leg = "".join(f'<span style="display:inline-flex;align-items:center;gap:4px">'
                      f'<span style="width:8px;height:8px;border-radius:999px;background:var({t})"></span>'
                      f'<span style="{ts("Body/Small")}color:var(--foreground-subtle)">{l}</span>'
                      f'<span style="{ts("Amount/Small")}color:var(--foreground-default)">{p}%</span></span>' for t, p, l in segs)
        return (f'<div style="width:380px"><div style="display:flex;gap:1px;height:16px;border-radius:999px;overflow:hidden">{bar}</div>'
                f'<div style="display:flex;flex-wrap:wrap;gap:14px;margin-top:10px">{leg}</div></div>')
    if n == "Toast":
        return (f'<div class="row"><span style="display:inline-flex;padding:8px 20px;border-radius:999px;'
                f'background:var(--surface-inverse);color:var(--foreground-on-inverse);{ts("Body/Small")}">Ingreso guardado</span></div>')
    if n == "Tooltip":
        b = (f'<span style="display:inline-flex;padding:4px 8px;border-radius:var(--radius-md);'
             f'background:var(--surface-inverse);color:var(--foreground-on-inverse);{ts("Body/Small")}">Bruto del mes</span>')
        return '<div class="row">' + b + b + '</div>'
    if n == "Popover":
        rows = "".join(f'<div style="display:flex;justify-content:space-between;gap:12px">'
                       f'<span style="{ts("Body/Small")}color:var(--foreground-subtle)">{l}</span>'
                       f'<span style="{ts("Amount/Small")}color:var(--foreground-on-popover)">{v}</span></div>'
                       for l, v in [("Salud", "$ 352.000"), ("Pensión", "$ 704.000"), ("Retención", "$ 128.400")])
        return (f'<div style="width:250px;background:var(--surface-popover);border:1px solid var(--border-default);'
                f'border-radius:var(--radius-lg);padding:10px;display:flex;flex-direction:column;gap:8px;box-shadow:0 4px 12px rgba(0,0,0,.12)">'
                f'<div><div style="{ts("Body/Base-Emphasis")}color:var(--foreground-on-popover)">Desglose del mes</div>'
                f'<div style="{ts("Body/Small")}color:var(--foreground-subtle)">Cómo se reparte el bruto</div></div>{rows}</div>')
    if n == "Empty":
        def e(media):
            m = (f'<div style="width:32px;height:32px;border-radius:var(--radius-lg);background:var(--surface-feedback-neutral);'
                 f'display:flex;align-items:center;justify-content:center;margin-bottom:8px">{sq(14)}</div>') if media else ""
            return (f'<div style="width:280px;border:1px dashed var(--border-default);border-radius:var(--radius-xl);padding:24px;'
                    f'display:flex;flex-direction:column;align-items:center;text-align:center;gap:16px">'
                    f'<div style="display:flex;flex-direction:column;align-items:center">{m}'
                    f'<div style="{ts("Heading/Group")}color:var(--foreground-default)">Sin ingresos este mes</div>'
                    f'<div style="{ts("Body/Base")}color:var(--foreground-subtle)">Agrega tu primer ingreso.</div></div>{btn("Agregar ingreso","filled","md")}</div>')
        return '<div class="row">' + e(True) + e(False) + '</div>'
    if n == "Skeleton":
        return ('<div style="width:250px;display:flex;flex-direction:column;gap:8px">' +
                "".join(f'<span style="height:12px;width:{w}px;border-radius:var(--radius-md);background:var(--surface-status-disabled)"></span>' for w in (250, 200, 140)) + '</div>')
    if n == "Separator":
        return ('<div class="row" style="gap:24px;align-items:center">'
                '<span style="display:block;width:160px;height:1px;background:var(--border-default)"></span>'
                '<span style="display:block;width:1px;height:56px;background:var(--border-default)"></span></div>')
    if n == "Avatar":
        return '<div class="row">' + "".join(
            f'<span style="display:inline-flex;align-items:center;justify-content:center;width:{NUM["--avatar-size-"+s]}px;height:{NUM["--avatar-size-"+s]}px;'
            f'border-radius:999px;background:var(--avatar-background);color:var(--avatar-foreground);border:1px solid var(--avatar-border);'
            f'font-weight:600;font-size:{NUM["--avatar-font-size-"+s]}px">AM</span>' for s in ("sm", "md", "lg", "xl")) + '</div>'
    if n == "Icon":
        return '<div class="row" style="align-items:center">' + "".join(sq(px) for px in (12, 16, 20, 24)) + '</div>'
    if n == "Icon Account":
        return '<div class="row">' + "".join(
            f'<span style="display:inline-flex;align-items:center;gap:6px;{ts("Body/Small")}color:var(--foreground-subtle)">{sq(14)} {l}</span>'
            for l in ["Bank", "Cash", "Credit", "Savings"]) + '</div>'
    if n == "chart-legend":
        return ('<div class="row">' + "".join(
            f'<span style="display:inline-flex;align-items:center;gap:4px">'
            f'<span style="width:8px;height:8px;border-radius:999px;background:var(--data-categorical-{i})"></span>'
            f'<span style="{ts("Body/Small")}color:var(--foreground-subtle)">{l}</span>'
            f'<span style="{ts("Amount/Small")}color:var(--foreground-default)">{p}%</span></span>'
            for i, l, p in [(1, "Vivienda", 31), (2, "Ahorro", 22), (4, "Trabajo", 18)]) + '</div>')
    if n == "FABAction":
        return (f'<div class="row"><span style="display:inline-flex;align-items:center;gap:8px;height:44px;padding:0 16px;border-radius:999px;'
                f'background:var(--surface-wrap-card);border:1px solid var(--border-default);{ts("Body/Base-Emphasis")}color:var(--foreground-on-card)">'
                f'{sq(14,"--interactive-primary")} Ingreso</span></div>')
    if n == "FAB":
        def f(open_):
            dial = ('<div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;margin-bottom:12px">' + "".join(
                f'<span style="display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 14px;border-radius:999px;'
                f'background:var(--surface-wrap-card);border:1px solid var(--border-default);{ts("Body/Small-Emphasis")}color:var(--foreground-on-card)">'
                f'{sq(12,"--interactive-primary")} {l}</span>' for l in ["Ingreso", "Gasto", "Movimiento"]) + '</div>') if open_ else ""
            return (f'<div style="display:flex;flex-direction:column;align-items:flex-end">{dial}'
                    f'<span style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:999px;'
                    f'background:var(--interactive-primary);color:var(--interactive-primary-foreground);font-size:26px;line-height:1;'
                    f'{"transform:rotate(45deg);" if open_ else ""}">+</span></div>')
        return '<div class="row" style="align-items:flex-end;gap:40px">' + f(False) + f(True) + '</div>'
    if n == "MonthNav":
        def mn(dev):
            s = 44 if dev == "Mobile" else 32
            arrow = lambda g: (f'<span style="display:inline-flex;align-items:center;justify-content:center;width:{s}px;height:{s}px;'
                               f'border:1px solid var(--border-default);border-radius:var(--radius-lg);color:var(--foreground-default)">{g}</span>')
            add = btn("+  Agregar", "filled", "sm") if dev == "Desktop" else ""
            return (f'<div style="display:flex;align-items:center;gap:8px;width:100%">'
                    f'<span style="flex:1"></span>{arrow("‹")}'
                    f'<span style="{ts("Heading/Subsection")}min-width:130px;text-align:center;color:var(--foreground-default)">Junio 2026</span>'
                    f'{arrow("›")}<span style="flex:1;display:flex;justify-content:flex-end">{add}</span></div>')
        return mn("Mobile") + mn("Desktop")
    if n == "Sheet":
        def sh(dev, footer):
            radius = "16px 16px 0 0" if dev == "Mobile" else "16px 0 0 16px"
            handle = ('<div style="display:flex;justify-content:center;padding:8px 0 4px">'
                      '<span style="width:40px;height:4px;border-radius:999px;background:var(--border-default)"></span></div>') if dev == "Mobile" else ""
            ft = (f'<div style="padding:12px 16px 16px;border-top:1px solid var(--border-default)">{btn("Guardar","filled","lg")}</div>') if footer else ""
            return (f'<div style="width:250px;background:var(--surface-wrap-default);border:1px solid var(--border-default);'
                    f'border-radius:{radius};overflow:hidden">{handle}'
                    f'<div style="display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid var(--border-default)">'
                    f'<span style="flex:1;{ts("Heading/Card")}color:var(--foreground-default)">Nuevo ingreso</span>'
                    f'<span style="color:var(--foreground-subtle)">✕</span></div>'
                    f'<div style="padding:16px;{ts("Body/Base")}color:var(--foreground-subtle);min-height:70px">Contenido del formulario</div>{ft}</div>')
        return '<div class="row">' + sh("Mobile", True) + sh("Desktop", False) + '</div>'
    if n == "RowActionsSheet":
        def ras(conf):
            dl = "Tocar para confirmar" if conf else "Eliminar"
            st = ('background:var(--status-danger-surface);color:var(--status-danger-default);' if conf else 'color:var(--foreground-subtle);')
            return (f'<div style="width:250px;background:var(--surface-wrap-card);border:1px solid var(--border-default);border-radius:16px 16px 0 0;overflow:hidden">'
                    f'<div style="display:flex;justify-content:center;padding:8px 0 4px"><span style="width:36px;height:4px;border-radius:999px;background:var(--border-default)"></span></div>'
                    f'<div style="padding:8px 16px 12px;border-bottom:1px solid var(--border-default)">'
                    f'<div style="{ts("Body/Base-Emphasis")}color:var(--foreground-on-card)">Sequel Studio LLC</div>'
                    f'<div style="{ts("Body/Small")}color:var(--foreground-subtle)">USD 1.800,00 · 18 jun</div></div>'
                    f'<div style="padding:8px;display:flex;flex-direction:column;gap:4px">'
                    f'<span style="padding:12px;border-radius:var(--radius-xl);{ts("Body/Base-Emphasis")}color:var(--foreground-on-card)">Editar</span>'
                    f'<span style="padding:12px;border-radius:var(--radius-xl);{ts("Body/Base-Emphasis")}{st}">{dl}</span></div></div>')
        return '<div class="row">' + ras(False) + ras(True) + '</div>'
    if n == "bottom-nav" or n == "bottom-nav-button":
        items = "".join(f'<span style="display:flex;flex-direction:column;align-items:center;gap:3px;'
                        f'color:var({"--interactive-primary" if i == 0 else "--foreground-subtle"})">{sq(16,"--interactive-primary" if i==0 else "--foreground-subtle")}'
                        f'<span style="{ts("Detail/Nano")}">{l}</span></span>' for i, l in enumerate(["Mes", "Resumen", "Cuentas", "Config"]))
        return (f'<div style="width:300px;display:flex;justify-content:space-around;padding:10px 0;background:var(--nav-background);'
                f'border:1px solid var(--border-default);border-radius:var(--radius-lg)">{items}</div>')
    if n == "menu-item":
        def mi(sel, exp):
            bg = 'background:var(--sidebar-item-background-selected);color:var(--sidebar-item-foreground-selected);' if sel else 'color:var(--sidebar-item-foreground);'
            lbl = f'<span style="{ts("Body/Small-Emphasis")}">Mes actual</span>' if exp else ""
            return (f'<span style="display:inline-flex;align-items:center;gap:8px;height:40px;padding:0 12px;'
                    f'border-radius:var(--radius-xl);{bg}">{sq(14,"--sidebar-item-foreground-selected" if sel else "--sidebar-item-foreground")}{lbl}</span>')
        return '<div class="row">' + mi(True, True) + mi(False, True) + mi(True, False) + mi(False, False) + '</div>'
    if n == "Sidebar":
        rows = "".join(f'<span style="display:flex;align-items:center;gap:8px;height:40px;padding:0 12px;border-radius:var(--radius-xl);'
                       + ('background:var(--sidebar-item-background-selected);color:var(--sidebar-item-foreground-selected);' if i == 0 else 'color:var(--sidebar-item-foreground);')
                       + f'">{sq(14,"--sidebar-item-foreground-selected" if i==0 else "--sidebar-item-foreground")}'
                       f'<span style="{ts("Body/Small-Emphasis")}">{l}</span></span>'
                       for i, l in enumerate(["Mes actual", "Resumen anual", "Cuentas", "Configuración"]))
        return (f'<div style="width:230px;background:var(--sidebar-surface);border:1px solid var(--border-default);'
                f'border-radius:var(--radius-xl);padding:8px;display:flex;flex-direction:column;gap:4px">{rows}</div>')
    if n == "topnav":
        return (f'<div style="width:100%;display:flex;align-items:center;gap:12px;height:54px;padding:0 16px;'
                f'background:var(--nav-background);border:1px solid var(--border-default);border-radius:var(--radius-lg)">'
                f'<span style="{ts("Heading/Group")}color:var(--foreground-default);flex:1">Neto</span>'
                + chip("TRM 4.012,55", "--surface-wrap-subtle", "--foreground-subtle")
                + sq(16, "--foreground-subtle") + sq(16, "--foreground-subtle")
                + f'<span style="display:inline-flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:999px;'
                  f'background:var(--avatar-background);color:var(--avatar-foreground);font-weight:600;font-size:12px">AM</span></div>')
    if n == "tab-navigation":
        tabs = "".join(f'<span style="{ts("Body/Small-Emphasis")}padding:10px 12px;'
                       + ('color:var(--interactive-primary);border-bottom:2px solid var(--interactive-primary);' if i == 1 else 'color:var(--foreground-subtle);')
                       + f'">{l}</span>' for i, l in enumerate(["Ingresos", "Gastos", "Movimientos", "Tributarias", "Provisiones"]))
        return f'<div style="display:flex;gap:4px;border-bottom:1px solid var(--border-default)">{tabs}</div>'
    if n.endswith("itemrow") or n == "ss-itemrow/ss":
        amount = {"income-itemrow": "$ 8.800.000", "outcome-itemrow": "− $ 1.240.000",
                  "transfer-itemrow": "$ 2.000.000", "savings-itemrow": "$ 600.000"}.get(n, "$ 352.000")
        tok = {"income-itemrow": "--kpi-income-foreground", "outcome-itemrow": "--kpi-expense-foreground"}.get(n, "--foreground-on-card")
        badge = chip("Toptal", "--account-2-surface", "--account-2-foreground") if "item" in n else ""
        return (f'<div style="width:100%;max-width:420px;display:flex;align-items:center;gap:8px;padding:10px 12px;'
                f'background:var(--surface-wrap-card);border:1px solid var(--border-default);border-radius:var(--radius-xl)">'
                f'{sq(16,"--foreground-subtle")}<span style="flex:1;min-width:0">'
                f'<span style="display:block;{ts("Body/Base-Emphasis")}color:var(--foreground-on-card)">Sequel Studio LLC</span>'
                f'<span style="display:flex;align-items:center;gap:6px;margin-top:2px">{badge}'
                f'<span style="{ts("Detail/Base")}color:var(--foreground-subtle)">18 jun</span></span></span>'
                f'<span style="{ts("Amount/Base")}color:var({tok})">{amount}</span></div>')
    if n.endswith("Container"):
        return (f'<div style="width:100%;max-width:420px;background:var(--surface-wrap-card);border:1px solid var(--border-default);'
                f'border-radius:var(--radius-xl);padding:16px">'
                f'<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">{sq(14,"--foreground-on-card")}'
                f'<span style="flex:1;{ts("Heading/Group")}color:var(--foreground-on-card)">{n.replace("Container","")}</span>'
                + btn("Agregar", "ghost", "sm") + '</div>'
                + "".join(f'<div style="display:flex;justify-content:space-between;padding:8px 0;'
                          f'border-top:1px solid var(--border-default)">'
                          f'<span style="{ts("Body/Small")}color:var(--foreground-subtle)">{l}</span>'
                          f'<span style="{ts("Amount/Small")}color:var(--foreground-on-card)">{v}</span></div>'
                          for l, v in [("Concepto 1", "$ 1.200.000"), ("Concepto 2", "$ 640.000"), ("Concepto 3", "$ 320.000")])
                + '</div>')
    if n.startswith("AccountCard") or n == "SavingsCard":
        return (f'<div style="width:230px;background:var(--surface-wrap-card);border:1px solid var(--border-default);'
                f'border-radius:var(--radius-xl);padding:14px">'
                f'<div style="display:flex;align-items:center;gap:8px">{sq(14,"--foreground-on-card")}'
                f'<span style="flex:1;{ts("Heading/Group")}color:var(--foreground-on-card)">Bancolombia</span>'
                + chip("★", "--fav-selected-background", "--fav-selected-foreground") + '</div>'
                f'<div style="{ts("Amount/Large")}color:var(--foreground-on-card);margin-top:8px">$ 12.450.900</div>'
                f'<div style="{ts("Detail/Base")}color:var(--foreground-subtle)">Cuenta de ahorros · 4,5% E.A.</div></div>')
    return (f'<div style="width:100%;padding:16px;border:1px dashed var(--border-default);border-radius:var(--radius-lg);'
            f'{ts("Body/Small")}color:var(--foreground-subtle)">Composición de {c["w"]}×{c["h"]}px — la fuente visual es Figma.</div>')

def axes(c):
    if not c["p"]:
        return f'<div class="axis"><span class="k">Sin variantes</span><span class="v">{c["w"]} × {c["h"]}</span></div>'
    out = [f'<div class="axis"><span class="k">{html.escape(k)}</span><span class="v">{html.escape(v.replace("|", " · "))}</span></div>'
           for k, v in (p.split("=", 1) for p in c["p"])]
    out.append(f'<div class="count">{c["v"]} variantes · {c["w"]} × {c["h"]}</div>')
    return "".join(out)

PAGE_CSS = """
*,*::before,*::after{box-sizing:border-box}
body{margin:0;font-family:'Rethink Sans',ui-sans-serif,system-ui,sans-serif;background:var(--surface-wrap-default);
 color:var(--foreground-default);font-variant-numeric:tabular-nums;-webkit-font-smoothing:antialiased}
.page{max-width:1000px;margin:0 auto;padding:40px 28px 64px}
h1{margin:0 0 4px;font-weight:800;font-size:24px;line-height:32px;letter-spacing:.5px}
.crumb{margin:0 0 32px;font-size:11px;line-height:17px;color:var(--foreground-subtle)}
.spec{display:flex;gap:32px;align-items:flex-start;flex-wrap:wrap;margin-bottom:28px}
.axes{flex:0 0 200px}
.axis{margin-bottom:8px}
.axis .k{display:block;font-weight:600;font-size:10px;line-height:15px;letter-spacing:.5px;text-transform:uppercase;color:var(--foreground-subtle)}
.axis .v{display:block;font-size:10px;line-height:15px;color:var(--foreground-default)}
.count{font-size:10px;line-height:15px;color:var(--foreground-placeholder);margin-top:10px}
.desc{flex:1 1 420px;min-width:280px;font-size:14px;line-height:21px;white-space:pre-line}
.modes{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:820px){.modes{grid-template-columns:1fr}}
.lbl{display:block;font-weight:600;font-size:10px;line-height:15px;letter-spacing:.5px;text-transform:uppercase;
 color:var(--foreground-subtle);margin-bottom:6px}
.stage{background:var(--surface-wrap-subtle);border-radius:var(--radius-lg);padding:20px;
 display:flex;flex-direction:column;gap:14px;align-items:flex-start;min-height:90px}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.note{font-size:10px;color:var(--foreground-placeholder)}
"""

def comp_page(c):
    body = mock(c["n"], c)
    return f"""<!-- @dsCard group="{'Blocks' if c['g']=='Containers' else 'Components · '+c['g']}" name="{html.escape(c['n'])}" subtitle="{html.escape(' · '.join(p.split('=')[0] for p in c['p']) or 'Sin variantes')}" -->
<!DOCTYPE html>
<html lang="es" data-theme="light">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Neto · {html.escape(c['n'])}</title>
<link href="https://fonts.googleapis.com/css2?family=Rethink+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../tokens/tokens.css">
<style>{PAGE_CSS}</style>
</head>
<body>
<main class="page">
  <h1>{html.escape(c['n'])}</h1>
  <p class="crumb">{html.escape(c['g'])} — Neto design system</p>
  <div class="spec">
    <div class="axes">{axes(c)}</div>
    <div class="desc">{html.escape(c['d'])}</div>
  </div>
  <div class="modes">
    <div><span class="lbl">Light</span><div data-theme="light" style="border-radius:var(--radius-lg)"><div class="stage">{body}</div></div></div>
    <div><span class="lbl">Dark</span><div data-theme="dark" style="border-radius:var(--radius-lg)"><div class="stage">{body}</div></div></div>
  </div>
</main>
</body></html>
"""

def foundation_page(title, name, subtitle, inner):
    return f"""<!-- @dsCard group="Foundations" name="{name}" subtitle="{subtitle}" -->
<!DOCTYPE html><html lang="es" data-theme="light"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Neto · {title}</title>
<link href="https://fonts.googleapis.com/css2?family=Rethink+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../tokens/tokens.css">
<style>{PAGE_CSS}
.sw{{min-width:148px}} .sw i{{display:block;height:44px;border-radius:var(--radius-md);border:1px solid var(--border-default)}}
.sw b{{display:block;font-weight:400;font-size:10px;line-height:15px;color:var(--foreground-subtle);margin-top:4px}}
.sw em{{display:block;font-style:normal;font-size:10px;line-height:15px;color:var(--foreground-placeholder)}}
.grid{{display:flex;flex-wrap:wrap;gap:12px}}
h2{{font-weight:600;font-size:20px;line-height:28px;letter-spacing:.5px;margin:32px 0 12px}}
h3{{font-weight:600;font-size:14px;line-height:20px;margin:20px 0 8px;color:var(--foreground-subtle)}}
</style></head><body><main class="page">{inner}</main></body></html>
"""

def colors_inner():
    def block(d, theme):
        groups = {}
        for k, v in d.items():
            groups.setdefault(k[2:].split("-")[0], []).append((k, v))
        out = []
        for g, items in sorted(groups.items()):
            cells = "".join(f'<div class="sw"><i style="background:{v}"></i><b>{k[2:]}</b><em>{v}</em></div>' for k, v in items)
            out.append(f'<h3>{g}</h3><div class="grid">{cells}</div>')
        return f'<div data-theme="{theme}" style="padding:16px;border-radius:var(--radius-lg)">' + "".join(out) + '</div>'
    return (f'<h1>Foundations · Color</h1>'
            f'<p class="crumb">Semantic es la única capa para diseñar pantallas. Component es interna de cada componente.</p>'
            f'<h2>Semantic — light</h2>{block(SL,"light")}'
            f'<h2>Semantic — dark</h2>{block(SD,"dark")}'
            f'<h2>Component — light</h2>{block(CL,"light")}'
            f'<h2>Component — dark</h2>{block(CD,"dark")}')

def type_inner():
    rows = "".join(f'<div style="display:flex;gap:20px;align-items:baseline;padding:10px 0;border-bottom:1px solid var(--border-default)">'
                   f'<span style="flex:0 0 160px;font-size:10px;color:var(--foreground-subtle)">{n}</span>'
                   f'<span style="flex:0 0 110px;font-size:10px;color:var(--foreground-placeholder)">{TS[n]["size"]}/{TS[n]["lh"]} {TS[n]["weight"]}</span>'
                   f'<span style="{ts(n)}">Neto · $ 8.800.000</span></div>' for n in TS)
    return ('<h1>Foundations · Tipografía</h1>'
            '<p class="crumb">Rethink Sans, una sola familia. Tabular por defecto: las cifras no saltan al cambiar de valor.</p>'
            f'<div>{rows}</div>')

def scale_inner():
    sp = sorted(((k, v) for k, v in NUM.items() if k.startswith("--spacing-") and isinstance(v, int)), key=lambda x: x[1])
    rd = sorted(((k, v) for k, v in NUM.items() if k.startswith("--radius-")), key=lambda x: x[1])
    sph = "".join(f'<div style="display:flex;align-items:center;gap:12px;padding:3px 0">'
                  f'<span style="flex:0 0 180px;font-size:10px;color:var(--foreground-subtle)">{k[2:]}</span>'
                  f'<span style="height:12px;width:{v}px;background:var(--interactive-primary);border-radius:2px"></span>'
                  f'<span style="font-size:10px;color:var(--foreground-placeholder)">{v}</span></div>' for k, v in sp)
    rdh = "".join(f'<div class="sw" style="min-width:110px;text-align:center">'
                  f'<i style="background:var(--surface-wrap-subtle);border-radius:{min(v,28)}px"></i><b>{k[2:]} · {v}</b></div>' for k, v in rd)
    return ('<h1>Foundations · Espaciado y radios</h1>'
            '<p class="crumb">Si un valor no existe en la escala, el valor está mal — no la escala.</p>'
            f'<h2>Espaciado</h2>{sph}<h2>Radios</h2><div class="grid">{rdh}</div>')

# ── write ─────────────────────────────────────────────────────────────────
# Validate BEFORE rmtree: a bad export must leave the previous design-system/ intact.
check_map_sources()
if os.path.isdir(OUT):
    shutil.rmtree(OUT)
for d in ("tokens", "components", "foundations", "docs"):
    os.makedirs(f"{OUT}/{d}", exist_ok=True)
open(f"{OUT}/tokens/tokens.css", "w").write(tokens_css())
open(f"{OUT}/tokens/tokens.map.css", "w").write(tokens_map_css())
json.dump({"semantic": {"light": SL, "dark": SD}, "component": {"light": CL, "dark": CD},
           "numeric": NUM, "textStyles": T["text"]}, open(f"{OUT}/tokens/tokens.json", "w"), indent=2, ensure_ascii=False)
open(f"{OUT}/foundations/colors.html", "w").write(foundation_page("Color", "Color", "Semantic + Component, claro y oscuro", colors_inner()))
open(f"{OUT}/foundations/typography.html", "w").write(foundation_page("Tipografía", "Tipografía", "Rethink Sans · 26 estilos", type_inner()))
open(f"{OUT}/foundations/scales.html", "w").write(foundation_page("Escalas", "Espaciado y radios", "Escala semántica", scale_inner()))
for c in COMPS:
    open(f"{OUT}/components/{slug(c['n'])}.html", "w").write(comp_page(c))
files = sorted(os.path.relpath(os.path.join(r, f), OUT) for r, _, fs in os.walk(OUT) for f in fs)
print(json.dumps({"files": len(files), "components": len(COMPS),
                  "sample": files[:6], "bytes": sum(os.path.getsize(f"{OUT}/{f}") for f in files)}, indent=1))

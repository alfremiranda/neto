# FYI-badge-tsx-is-not-figma-badge

Groundwork for extraction step 2. **`src/components/ui/Badge.tsx` and Figma's `Badge` are not the
same component**, so "extract badges" is not a wiring job. Measured, not assumed.

**`Badge.tsx` uses zero `--badge-*` tokens.** All 18 are published in `tokens.css` and none is
referenced. What it uses instead:

| variant | paints | is really |
|---|---|---|
| `usd`, `arq`, `ss` | `--color-income-{bg,txt}` | **KPI income** tokens |
| `cop`, `bancol` | `--color-provision-{bg,txt}` | **KPI provision** tokens |
| `toptal` | `--color-account-toptal-*` | dead slot model |
| `otro`, `default` | `--color-account-other-*` | dead slot model |

Two problems stacked. The variants are keyed by **account identity** (`arq`, `toptal`, `bancol`,
`ss`) — the model that died when the hue became a user choice. And the colours are **borrowed from
the KPI family**: the system says cyan means income and green means provision, and this component
uses them to mean "ARQ" and "Bancolombia". One token, two meanings.

`T7` in the validator exists precisely to catch a component borrowing another's token, and Figma
scores **0** on it. **The validator only audits Figma.** This is the same defect living on the side
nothing measures.

**`CurrencyBadge` is the cheapest fix in the file.** It maps USD→income and COP→provision, while a
dedicated `currency/*` family exists, is correct in Figma, and is already published as
`--color-currency-{usd,cop}-{bg,txt}`. Four tokens, unused, sitting right there.

**And Figma's `Badge` has the same disease A5 just cured.** Its variants are colour-named while its
tokens are semantic. The mapping, read off the bound variables so you do not have to guess:

`Purple → accent` · `Green → success` · `Blue → info` · `Orange → warning` · `Red → danger` ·
`Gray → neutral`. `Variant=Outline` paints `border` + `foreground`; `Variant=Filled` paints
`background` + `foreground`.

Also `badge/primary/*` (3 tokens) is published and **no variant uses it** — a family with no
consumer.

**So the badge rename is not finished, it just moved.** Design's call: `Badge`'s variants get
renamed to the semantic names before extraction, same argument as `AccountBadge`. That is a new
A5-shaped item and I am not smuggling it into A5 — it goes to the orchestrator.

**`AccountBadge` itself is blocked on D2**, separately: it reads `account-accent/*` and
`color/account/*`, and neither reaches `design-system/tokens/` today.

POINTER: `src/components/ui/Badge.tsx` · Figma `Badge` `76:3717` · `AccountBadge` `376:11896`

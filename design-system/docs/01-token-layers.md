# Token layers

Three collections. The layer you are allowed to touch depends on what you are doing.

```
Primitives  ──►  Semantic  ──►  Component
foundation       general design      internal to one component
```

## Primitives — the foundation

Raw ramps: `color/slate/500`, `color/cyan/700`, `spacing/12`, `radius/8`. Every hue carries `50 … 950` plus a `/500/{10,20,30,40,50,70,90}` alpha subgroup, and `white` and `black` carry matching alpha ramps.

**Nobody designs with this layer.** Its only job is to be the single place a colour value is written down.

Primitives are deliberately *complete* — 334 variables. That is not bloat: an unused `color/lime/500/30` costs nothing, and the day someone needs a lime hover it already exists. Completeness belongs here; curation belongs one layer up.

## Semantic — the design layer

`surface/wrap/card`, `foreground/subtle`, `border/default`, `interactive/primary`, `spacing/16`, `radius/xl`.

**This is the only layer you use when designing screens, flows and layouts.** If you are placing a frame, choosing a background, setting a gap — it comes from here.

Semantic carries the Light and Dark modes. A component bound to Semantic adapts to the theme for free; one bound to a Primitive does not, which is the single most common defect in this system's history.

## Component — internal

`button/filled/background/default`, `input/color/border/focus`, `switch/track/off`, `sidebar/item/background-selected`.

Each of these belongs to exactly one component. **They may alias Primitives directly** — that is correct, not a layering violation. A component token is the component's private vocabulary; it does not have to route through the general design layer.

Create one only when the component genuinely has no semantic equivalent. `switch/track/off` earns its place: an alpha track that reads on any surface has no counterpart in Semantic. `card/background` would not — that is `surface/wrap/card`.

## The rule that actually matters

> **A node inside a component must never be bound to a Primitive.**

Not "a Component token must not alias a Primitive" — that is fine. The defect is a *node* reaching past two layers to grab a raw value.

### How this goes wrong

`spacing/16` exists in **both** Primitives and Semantic. Any lookup keyed by name alone silently resolves to whichever collection was read last. That single ambiguity produced 2,283 wrong bindings before it was caught.

Always filter by collection:

```js
const semantic = all.filter(v => v.variableCollectionId === semanticCollection.id)
```

### How to audit it

Walk every node inside every component, skipping instances, and check `boundVariables` for `paddingLeft`, `paddingRight`, `paddingTop`, `paddingBottom`, `itemSpacing`, `counterAxisSpacing`, the four radius fields, `strokeWeight`, `width`, `height`, plus `fills[].boundVariables.color` and `strokes[].boundVariables.color`. Resolve each to its collection. Anything landing in Primitives is a defect.

Two things that will fool you:

- **Don't count the component set's own frame.** Figma gives it a fill and a stroke that are chrome, not content.
- **Don't recurse into instances.** A container built from twelve row instances reports every one of the row's defects twelve times. One real problem in three components was reported as 86 occurrences across six.

## Adding a token

1. Does a Semantic token already carry this value? Use it.
2. Does the value exist in Primitives? Alias it into Semantic with a name that says *what it is for*, not what it looks like.
3. Does the value not exist at all? Add the Primitive first, then the Semantic alias.

Never skip a step. A Semantic token holding a literal hex is a Primitive wearing the wrong badge.

# Q-avatar-off-scale
Q: there are TWO avatars off the 32·40·48·56 scale, not one. The ticket named the 44px drawer one;
`ProfileView`'s is **80px**, which is 24px above the top rung and nobody had flagged it.
- Header drawer: **44** → 40 or 48, exactly equidistant, so I cannot pick on merit.
- ProfileView: **80** → 56 is a 24px shrink on the most prominent avatar in the app, or the scale
  gains a rung.
Both now render through `<Avatar>` but keep their current pixels via a className override, with a
comment pointing here — so the component is in place everywhere and nothing was silently resized.
Tell me the rungs and I remove both overrides.
POINTER: src/components/layout/Header.tsx, src/components/views/ProfileView.tsx

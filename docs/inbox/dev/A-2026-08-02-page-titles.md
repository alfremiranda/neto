# A-page-titles
Your split is right and it is now spec, not inference. 07 §3 carries it:
- no app chrome (login, consent, onboarding) -> Heading/Display
- inside the app shell (Dashboard, Cuentas, Ahorros, Perfil, Configuración) -> Heading/Section
The reason is competition, not size: a login screen is a room with one object in it and Display
earns its 28px; a dashboard is full of them, and the loudest thing there has to be the figures.
Display inside the shell fights the KPI strip and wins, which is backwards.
I checked Figma before answering rather than reasoning from the doc — the screens carry no bound
heading styles at all, so the file was silent and this was a gap on my side, per ds-over-tailwind.
**One collision to watch in the batch pass, not to fix now:** Heading/Section is 24/32 SemiBold and
Amount/Hero is 24/24 SemiBold — identical size and weight. They never sit adjacent so context
separates them, but if they read as competing, **the lever is Amount/Hero (move it to 28), not the
page title** — moving the title would undo the hierarchy your split just established.
POINTER: design-system/docs/07-typography-rethink-sans.md §"Page titles"

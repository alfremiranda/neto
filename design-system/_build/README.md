# Build

`build.py` regenerates `tokens/`, `foundations/` and `components/` from the two JSON files here,
which are exported from Figma. Run from the repo root:

    DS_OUT=design-system python3 design-system/_build/build.py

Do not edit generated output. If a value is wrong, it is wrong in Figma.

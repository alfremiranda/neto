# docs/reports/ — Dev → Orchestrator session reports

At session close, Dev writes `YYYY-MM-DD-<slug>.md` here and pushes (same DoD commit).
The orchestrator reads new reports on every daily sync — no human relay needed.
Terse format:

    DID: commits + one line each.
    DECISIONS: any call made that others should know (or "none").
    FOUND: undocumented things, protocol/reality conflicts (or "none").
    NEEDS: decision or input required, and from whom (or "none").

`NEEDS` is the only section that reaches Alfredo — make it count.

# TASK-2026-08-19-consentimiento

TASK: implementar el rediseño de `ConsentScreen.tsx` con el texto y los marcos que Diseño dejó
listos, más el estado de espera que hoy no existe.

CONTEXT: pedido por Alfredo. Texto verbatim y razonamiento en
`FYI-2026-08-19-consentimiento-rediseñado` y `design-system/docs/18-consent.md`.
**Tres frases son de `neto-legal.md` y no se retocan al implementar:** «Neto no es asesoría
tributaria ni contable» literal y en negativo · nada de verbos de determinación («estima», nunca
«calcula lo que debes pagar») · «el tratamiento y **la transferencia internacional**» —la mención
de la transferencia es la base legal de Supabase—. Y `Aceptar` → **`Autorizar y continuar`**.

DONE WHEN: las tres frases legales verbatim en el DOM · `busy` muestra el `Spinner` dentro del
botón pulsado heredando el color de su etiqueta (como Login), no sólo `disabled` · móvil apilado
/ escritorio en fila con anchos iguales · iconos `ChartPie · Landmark · Lock` de lucide.

DECIDED BY: Alfredo (rediseño) · legal, no negociable en implementación

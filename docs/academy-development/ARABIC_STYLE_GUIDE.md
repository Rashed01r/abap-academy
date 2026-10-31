# English and Arabic authoring

Preserve the improved existing Arabic. New lessons need equivalent educational substance in both languages, not literal sentence mapping. Use natural Modern Standard Arabic, direct explanations and business examples. Keep ABAP identifiers, keywords and code unchanged. Technical tokens need LTR isolation inside RTL prose; the editor, source statements and expressions remain LTR.

| English | Preferred Arabic |
| --- | --- |
| Variable | متغير |
| Structure | بنية بيانات |
| Condition | شرط |
| Loop | حلقة تكرارية |
| Internal table | جدول داخلي |
| Work area | منطقة عمل |
| Iteration | دورة تكرار |
| Execution | تنفيذ |
| Program output | مخرجات البرنامج |
| Data element | عنصر بيانات |
| Domain | نطاق |
| Object | كائن |
| Method | دالة عضو / طريقة برمجية، بحسب السياق |

Use Arabic punctuation in prose. Explain the meaning before introducing syntax. Describe a mistake with its cause and a useful next step. Avoid describing a local memory table as an SAP database table. Describe the finite instructional scope of each simulation.

Review in the browser in Arabic, dark/light themes and narrow width: mixed identifiers, condition expressions, source diagnostics, row headers, long hints, focus order and horizontal overflow. Translation completeness checks do not establish professional writing quality. Record manual Arabic observations and any unresolved concerns honestly.

2026-10-31 rendered review: inspected Arabic mobile table screens in light and dark appearance and the loop counter. Labels, explanatory prose and row markers flow RTL; ABAP source, identifiers and numeric output remain readable LTR. The active second row, counter value 2 and output 10/20 are visible with clear distinction in both themes. Automated checks establish no document overflow at 390px, 9px cell padding and a 2px active-row outline. Screenshots: `test-results/mobile-ar-table-light.png`, `mobile-ar-table-dark.png` and matching `mobile-ar-loop-counter-*.png`. This is a targeted educational review, not external SAP certification.

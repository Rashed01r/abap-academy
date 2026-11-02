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

2026-11-02 terminology additions: row type = نوع الصف; primary key = المفتاح الأساسي; independent copy = نسخة مستقلة. data-table-model preserves ABAP identifiers, explains EMPTY as a key description rather than a row count, and limits copy claims to the integer/string fields in its example.

2026-11-02 rendered review: directly inspected test-results/data-model-ar-returning-le-76b24-e-model-and-retains-results-mobile/arabic-data-lab.png and arabic-data-trace.png. RTL prose and LTR source are readable at 390px, both duplicate rows and selected row 2 are clear, output is Keyboard twice and the active execution pointer is distinct. Dark appearance reviewed directly; existing regression verifies light/dark styling.

Free-exploration terminology: Explore Academy = استكشف الأكاديمية; Recommended first = يُقترح أن تبدأ بـ; Start Challenge = ابدأ التحدّي; Coming Soon = قريبًا. Use recommendations rather than permission/locking language for implemented lessons. Viewed, started, lab completion and achievement are distinct concepts.

Data-category terminology: primary index = الفهرس الأساسي; unique primary key = المفتاح الأساسي الفريد; hashed table = جدول قائم على التجزئة. Do not imply that membership cards show SAP memory layout or guarantee HASHED iteration order. STANDARD, SORTED, HASHED and key syntax stay unchanged.

Rendered review of the free-exploration production build: Arabic mobile search/path/difficulty controls were inspected in light and dark appearance, with computed flex layout, 12px input padding and no document overflow. Directly inspected Arabic category comparison at desktop and 390px: all controls, duplicate-key explanation, optional-lab actions, stage buttons, LTR reference identifiers and standard-table editor are readable. Final navigation spacing separates Back to Roadmap from Explore Other Topics and wraps links on small screens.

Visual Code Anatomy uses «تعرّف إلى أجزاء الشيفرة» in the interface, «الجزء الذي تدرسه» for the educational selection, and «اربط الوصف بالشيفرة» for matching. Default explanations use direct verbs: نبدأ، نحدد، ننشئ، نضع، نعرض. Keep the distinction explicit: TYPES describes the type; DATA creates the record. «مخطط نوع البنية» must not imply that employee values already exist.

The six Structure labels are بداية تعريف البنية، حقول البنية، نهاية تعريف البنية، إنشاء سجل، تعبئة البيانات، عرض النتيجة. Both fields form one group. The optional detailed section explains the chained statement and component selector without crowding the default lesson.

Rendered review: directly inspected Arabic Structure anatomy in desktop/light and mobile/dark, including complete LTR code, numbered RTL labels, the highlighted multiline assignment, employee ID/name, output Ahmed, and optional detail controls. Source code scrolls within its panel when needed; the explanation stacks below on mobile. Tests cover light/dark, keyboard selection, both field lines, optional field inspection and no document overflow. Screenshots are under ignored `test-results/anatomy-ar-*/structure-anatomy-ar-*.png`.

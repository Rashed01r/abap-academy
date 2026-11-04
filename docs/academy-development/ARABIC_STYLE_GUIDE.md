# English and Arabic authoring

## 2026-11-04 curriculum review

New content distinguishes نتيجة البحث and الصف المطابق from بيانات منطقة العمل القديمة: a retained name after a failed READ is not success. Use فهرس/موضع الصف for the one-based position, مفتاح البحث for compared row fields, إدراج/تعديل/حذف for internal-table changes, and ترتيب تصاعدي/تنازلي for row ordering. Explain that filtering processing does not delete stored rows. The before/after panels read قبل then بعد in RTL layout; identifiers and values remain LTR.

Guided DDIC, SQL, OOP, report, modern syntax, Cloud and project lessons contain equivalent English/Arabic explanations, artifact purposes, progressive hints, decisions and feedback. Distinguish a local model from SAP activation/execution, a class from an object, a service definition from a binding, and a completed design foundation from the unfinished capstone. Do not translate object names or imply that reference examples share a deployed SAP data model. The glossary's existing Domain/Data element/Object/Method entries remain available in the unified header.

Scoped visual review inspected Arabic dark desktop/mobile lesson and model panels, plus English light desktop. Reference/source code stays LTR, tables scroll inside their panels and document geometry checks pass. Final viewport artifacts are in ignored build/curriculum-review. This is semantic and rendered-layout review; no SAP compilation or complete accessibility certification is claimed. Exact unit/browser evidence is in IMPLEMENTATION_PROGRESS.md.

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

The data-keys lesson uses المفتاح المركّب for composite key, حقول المفتاح for key fields, مجموعة القيم for the complete combination, and التفرّد for uniqueness. Distinguish هوية الموظف (department plus ID in this business rule) from موضع الصف and الاسم. A different non-key name does not make the key different. Keep department, id, name and all source identifiers unchanged; isolate values and reference declarations LTR inside the Arabic interface. Do not translate EMPTY KEY as an empty table or imply that the conceptual key-policy model runs SAP.

2026-11-03 rendered review: directly inspected Arabic key exploration in desktop/light and 390px mobile/dark. Key-field checkboxes, tuple values, duplicate rejection, conflicting position, before/after tables and independent candidate predictions are readable. Reference code stays LTR, Arabic explanations stay RTL, and comparison tables stack with their own horizontal scrolling instead of document overflow. Browser scenarios cover both themes/locales, keyboard checkbox activation, assessment feedback and persistence. Review images: ignored test-results/table-keys-ar-*/keys-ar-*.png.

Work-area/field-symbol terminology: منطقة العمل stores its own data; رمز الحقل gives access to an assigned existing object; الربط describes ASSIGN and إلغاء الربط describes UNASSIGN. Do not describe a field symbol as an ordinary copied variable or say that UNASSIGN deletes target data. Distinguish a symbol bound to the work area from a symbol bound to a table row (the latter is not implemented). Both unassigned-access and undeclared-name guidance must identify FIELD-SYMBOLS when appropriate. Explain meaning before syntax; retain <employee>, ls_employee and source values as LTR tokens.

Rendered review of this batch: Arabic desktop/light and final 390px mobile/dark anatomy were directly inspected. The employee card highlights filled fields and the changed name, while the saved row still shows Ahmed. The real alias arrow is LTR horizontally on desktop and points vertically downward on mobile; previous/current values stack on narrow screens. Code scrolls within its own panel, explanations stay RTL and no document overflow occurs. Bilingual error guidance distinguishes undeclared names from declared-but-unassigned symbols. Evidence: test-results/work-areas-ar-*/aliases-anatomy-ar-*.png and aliases-trace-ar-*.png; see IMPLEMENTATION_PROGRESS.md for final test counts.

Rendered review: directly inspected Arabic Structure anatomy in desktop/light and mobile/dark, including complete LTR code, numbered RTL labels, the highlighted multiline assignment, employee ID/name, output Ahmed, and optional detail controls. Source code scrolls within its panel when needed; the explanation stacks below on mobile. Tests cover light/dark, keyboard selection, both field lines, optional field inspection and no document overflow. Screenshots are under ignored `test-results/anatomy-ar-*/structure-anatomy-ar-*.png`.

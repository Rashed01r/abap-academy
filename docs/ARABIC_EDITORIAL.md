# Arabic educational style guide

Use clear Modern Standard Arabic, authored around the programming concept rather than English sentence order. Prefer concrete actions and a short business example. Explain the meaning, reason, syntax, execution effect, and a common mistake before assessing a new construct.

The shared glossary is `src/lib/glossary.ts`, also available in the learner interface. Use متغير, نوع البيانات, تعليمة برمجية, بنية بيانات, حقل, إسناد قيمة, ذاكرة البرنامج, and مخرجات البرنامج consistently. Use حلقة تكرارية for the construct and دورة تكرار for one pass. A standard internal table lives in program memory; never describe it as a permanent database table. Use منطقة عمل for a row-receiving variable. Explain SAP names without translating language keywords or identifiers.

Use عرّف or أنشئ for DATA according to context. Avoid the literal أعلن, ambiguous المتغير الصحيح for an integer variable, and metaphors in place of a precise definition. A type describes a record; defining a type does not create or fill a record.

Keep source code, identifiers, comparisons, and output LTR. Use isolated bidirectional spans for inline identifiers within Arabic prose. Do not change quotes or ABAP punctuation when editing Arabic explanations. English output strings in exercises are deliberate exact output requirements, not missing UI translations.

Editorial review is separate from string-coverage checks: reread meaning, grammar, naturalness, terminology, technical accuracy, and English/Arabic parity. Then inspect RTL in a real browser at desktop and mobile widths in both themes. Automated completeness is supporting evidence, not a linguistic quality score.

For each diagnostic, retain the source location, name the mistake, explain why the rule exists, offer a relevant hint and a small example, and let the learner retry. Do not reuse a missing-period hint for unrelated errors.

Conditions reference: [SAP — Using Control Structures in ABAP](https://learning.sap.com/courses/basic-abap-programming/using-control-structures-in-abap_a4d7803e-eac2-458e-acf9-8628289f3701). The simulator intentionally supports a smaller grammar than ABAP.

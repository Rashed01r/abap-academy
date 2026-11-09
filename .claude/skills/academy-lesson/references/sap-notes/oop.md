# Object-oriented ABAP: classes, objects, attributes, methods, constructors, inheritance, interfaces, exceptions

Researched 2026-11-09 for `oop-classes`, `oop-objects`, `oop-attributes`, `oop-methods`.

Source: SAP-samples ABAP cheat sheet `04_ABAP_Object_Orientation.md`
(https://raw.githubusercontent.com/SAP-samples/abap-cheat-sheets/main/04_ABAP_Object_Orientation.md),
sections "Classes and Objects", "Visibility of Components", "Defining Components" (Class Attributes,
Methods, Parameter Interface, Formal and Actual Parameters), "Working with Objects and Components"
(Declaring Object Reference Variables, Creating Objects, Working with Reference Variables).
Cite help.sap.com keyword pages in lessons: `class-abenclass_glosry`, `object`, `visibility-section`,
`instance-attribute`, `static-attribute`, `method-abenmethod_glosry`, `new-instance-operator`,
`object-reference-variable`, `functional-method`, `methods-importing-exporting-changing-raising`.

## Rules used in the lessons
- Classes are templates; objects (= instances) are created from them and each has its own values
  of the instance components. Components: attributes, methods, events.
- A class has a declaration part (`CLASS … DEFINITION … ENDCLASS`) and an implementation part
  (`CLASS … IMPLEMENTATION … ENDCLASS`); every declared method is implemented between
  `METHOD` and `ENDMETHOD`.
- Components must be in a visibility section. PUBLIC: everyone; PROTECTED: class, subclasses,
  friends; PRIVATE: only the class itself (and friends).
- `DATA` = instance attributes, valid per instance, reached through an object reference.
  `CLASS-DATA` = static attributes, exist once per class, visible in all instances, reachable with
  the class name (`class=>attr`) without any instance. Access through a reference is possible but
  not recommended.
- `METHODS` = instance methods (need an instance from outside the class). Parameters:
  IMPORTING, EXPORTING, CHANGING, one RETURNING (functional method, must be `VALUE( )`, usable in
  expressions), RAISING. Plain parameter names are passed by reference; input parameters passed by
  reference cannot be modified in the method.
- Objects are only reached via object reference variables (`TYPE REF TO class`).
- `NEW #( )` takes the class from the target's type; with an inline `DATA( )` the class must be
  named: `DATA(ref) = NEW cls( )`. `CREATE OBJECT` is the older syntax.
- `ref2 = ref1.` copies the reference: both point to the same object. A new `NEW` with the same
  variable overwrites the reference.
- Using an initial reference raises CX_SY_REF_IS_INITIAL (runtime error when not caught).

## Teaching implications
- Show objects as memory cards and references as pointers to them (simulator labels such as
  `lcl_employee #1` are model names, say so).
- Enforce visibility and read-only IMPORTING at check time, as ABAP does at compile time.
- Constructors, inheritance, interfaces and exceptions are the next lessons; keep NEW without
  parameters until the Constructors lesson.

## Slice 2 (2026-11-09): constructors, inheritance, interfaces, exceptions
Same cheat sheet, sections "Constructors", "Inheritance" (incl. redefinition, super->, protected), "Interfaces"
(defining, implementing with iface~method, interface reference variables), plus `27_Exceptions.md`
(class-based exceptions: CX_STATIC_CHECK / CX_DYNAMIC_CHECK / CX_NO_CHECK, RAISE EXCEPTION, RAISING, TRY/CATCH/INTO).
- Instance constructor: method named `constructor`; `NEW cls( p = v )` passes the IMPORTING parameters; required parameters must be filled.
- Subclass: `INHERITING FROM`; instance constructor of a subclass must call `super->constructor( … )` even if the superclass declares no constructor (cheat sheet 04, Inheritance: "you must use a super->constructor( ) call … even if the superclass does not explicitly declare it"); the simulator requires it as the first statement.
- Redefinition: `METHODS m REDEFINITION.` keeps the signature; `super->m( )` reaches the superclass implementation; dynamic type decides which runs.
- A reference of a superclass type may hold subclass objects (upcast); the other direction needs a downcast (`?=`/`CAST`), not taught yet.
- Interfaces declare components without implementation; classes list `INTERFACES` in the PUBLIC SECTION and implement `METHOD iface~m`; through an interface reference only the interface components are visible.
- Static-check exceptions: users must handle them in TRY or declare RAISING; if not, **a warning** is produced (cheat sheet 27, CX_STATIC_CHECK). The simulator turns the warning into an error on purpose and says so in the lesson; an exception raised in a TRY block abandons the rest of it; INTO stores the exception object.
## Teaching implications
- Use only IMPORTING/RETURNING/RAISING, type i and string, and addition (the interpreter has no subtraction or multiplication); phrase examples as limits and totals.
- Keep exception classes tiny: one attribute, a constructor calling super->constructor( ).

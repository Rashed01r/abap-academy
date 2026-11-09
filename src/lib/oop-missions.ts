import type { Mission, SyntaxToken, Text } from "./curriculum";
import type { AnatomyGroupSpec } from "./code-anatomy";
import type { EducationSpec } from "./education-content";
import type { Node, Primitive } from "./engine";

// Object-Oriented ABAP path: runnable local classes (CLASS … DEFINITION / IMPLEMENTATION, DATA / CLASS-DATA,
// METHODS IMPORTING / RETURNING, TYPE REF TO, NEW, ->, =>). English only while ENABLE_ARABIC = false.
// Facts: SAP-samples cheat sheet 04_ABAP_Object_Orientation. See .claude/skills/academy-lesson/references/sap-notes/oop.md
const t = (en: string): Text => ({ en });
const ooSheet = "https://github.com/SAP-samples/abap-cheat-sheets/blob/main/04_ABAP_Object_Orientation.md";
const kw = (topic: string) => `https://help.sap.com/docs/abap-cloud/abap-keyword/${topic}`;
const tok = (id: string, label: string, meaning: string, why: string, write: string, correct: string, mistake: string, question: string, options: [string, string], explanation: string): SyntaxToken =>
  ({ id, label, meaning: t(meaning), why: t(why), write: t(write), correct, mistake, question: t(question), options: [t(options[0]), t(options[1])], answer: 0, explanation: t(explanation) });
const group = (id: string, lines: [number, number], title: string, explanation: string, syntaxRefs: string[] = []): AnatomyGroupSpec =>
  ({ id, lines, title: t(title), explanation: t(explanation), practice: t(`Which source section ${explanation[0].toLowerCase() + explanation.slice(1)}`), syntaxRefs, visualizer: { kind: "snapshot", line: lines[1] } });
type Concept = EducationSpec["concepts"][number];
const concept = (id: string, name: string, explanation: string, misconception: string, objectives: number[], learn: string[], assess: string[]): Concept =>
  ({ id, name: t(name), explanation: t(explanation), misconception: t(misconception), objectives, learn, demonstrate: "trace", assess });
const boundary = "The browser runs a subset of local classes: PUBLIC/PROTECTED/PRIVATE SECTION, DATA and CLASS-DATA of type i or string, instance METHODS with IMPORTING, RETURNING and RAISING, constructors, INHERITING FROM with REDEFINITION and super->, interfaces, TYPE REF TO, NEW, the -> and => selectors, RAISE EXCEPTION and TRY … CATCH … INTO. Global classes, CLASS-METHODS, EXPORTING and CHANGING parameters, ABSTRACT and FINAL classes, events and method chaining are outside this model.";

// ---------- 1. Classes ----------
const employeeShowClass = `CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    DATA mv_name TYPE string.
    DATA mv_salary TYPE i.
    METHODS show.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
  METHOD show.
    WRITE / mv_name.
    WRITE / mv_salary.
  ENDMETHOD.
ENDCLASS.`;
export const oopClassExample = `${employeeShowClass}
DATA lo_employee TYPE REF TO lcl_employee.
lo_employee = NEW #( ).
lo_employee->mv_name = 'Ahmed'.
lo_employee->mv_salary = 5000.
lo_employee->show( ).`;
const departmentUse = `DATA lo_department TYPE REF TO lcl_department.
lo_department = NEW #( ).
lo_department->mv_code = 'IT'.
lo_department->mv_headcount = 2.
lo_department->show( ).`;
export const oopClassSolution = `CLASS lcl_department DEFINITION.
  PUBLIC SECTION.
    DATA mv_code TYPE string.
    DATA mv_headcount TYPE i.
    METHODS show.
ENDCLASS.
CLASS lcl_department IMPLEMENTATION.
  METHOD show.
    WRITE / mv_code.
    WRITE / mv_headcount.
  ENDMETHOD.
ENDCLASS.
${departmentUse}`;
const classStarter = `* Write CLASS lcl_department DEFINITION and IMPLEMENTATION above the code that uses it.\n${departmentUse}\n`;
const classGoal = t("The code at the bottom already uses a class called lcl_department. Write that class above it: a PUBLIC SECTION with the attributes mv_code (TYPE string) and mv_headcount (TYPE i) and a method show. In the implementation, show displays mv_code and then mv_headcount on separate lines. Keep the code that uses the class unchanged. The checker changes the code and headcount values, so every WRITE must be inside show.");
const classHints = [t("Copy the shape of lcl_employee: CLASS lcl_department DEFINITION. PUBLIC SECTION. … ENDCLASS."), t("Declare the attributes with DATA mv_code TYPE string. and DATA mv_headcount TYPE i., then METHODS show."), t("CLASS lcl_department IMPLEMENTATION. METHOD show. WRITE / mv_code. WRITE / mv_headcount. ENDMETHOD. ENDCLASS.")];
export const oopClassMission: Mission = {
  id: "oop-classes-objects", pathId: "oop", prerequisite: "oop-introduction",
  title: t("Classes: write the blueprint"), subtitle: t("Declare an employee class with attributes and a method, then implement the method"),
  minutes: 25, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "structure",
  coveredTopics: ["Classes"],
  brief: t("A class is a blueprint for objects. It has two parts. The definition (CLASS lcl_employee DEFINITION) lists what every employee object has: the attributes mv_name and mv_salary, and the method show. The implementation (CLASS lcl_employee IMPLEMENTATION) holds the code of each method between METHOD and ENDMETHOD. A class on its own stores no employee: the program creates an object with NEW, fills Ahmed and 5000, and calls show, which displays Ahmed and 5000. The method reads mv_name without a prefix because it runs inside the object."),
  objectives: [t("Write a class definition with a PUBLIC SECTION, attributes and a method declaration"), t("Implement the method in the implementation part and call it on an object")],
  references: [ooSheet, kw("class-abenclass_glosry"), kw("visibility-section"), kw("method-abenmethod_glosry")],
  tokens: [
    tok("class-definition", "CLASS … DEFINITION", "The definition part declares the components of a class: attributes with DATA and methods with METHODS, each inside a visibility section.", "Everyone who uses the class reads the definition to see what it offers, without reading the code.", "CLASS name DEFINITION. then PUBLIC SECTION. then the declarations, then ENDCLASS. Local class names usually start with lcl_.", "CLASS lcl_employee DEFINITION.\n  PUBLIC SECTION.\n    DATA mv_name TYPE string.\n    METHODS show.\nENDCLASS.", "CLASS lcl_employee DEFINITION.\n  DATA mv_name TYPE string.\nENDCLASS.", "What is missing in the second snippet?", ["A visibility section such as PUBLIC SECTION", "Nothing, sections are optional"], "Every component belongs to a visibility section. Without PUBLIC SECTION. the declaration is in the wrong place."),
    tok("class-implementation", "CLASS … IMPLEMENTATION", "The implementation part holds the code of every method declared in the definition, each between METHOD name. and ENDMETHOD.", "The definition says what a method is called; the implementation says what it does.", "After the definition: CLASS name IMPLEMENTATION. METHOD show. … ENDMETHOD. ENDCLASS. Every declared method needs a METHOD block.", "CLASS lcl_employee IMPLEMENTATION.\n  METHOD show.\n    WRITE / mv_name.\n  ENDMETHOD.\nENDCLASS.", "CLASS lcl_employee DEFINITION.\n  PUBLIC SECTION.\n    METHODS show.\n    METHOD show.\n      WRITE / mv_name.\n    ENDMETHOD.\nENDCLASS.", "Where does the code of the method show go?", ["In the IMPLEMENTATION part", "Under METHODS in the DEFINITION part"], "The definition only declares show. Its statements go between METHOD show. and ENDMETHOD. in the implementation part."),
  ],
  example: oopClassExample,
  visual: t("Step through the program. The class lines run first but create nothing except the blueprint. NEW creates the object lcl_employee #1 with mv_name and mv_salary. The call to show jumps into the implementation, displays Ahmed and 5000, and returns at ENDMETHOD. Change 'Ahmed' to 'Omar' to see show display the new name."),
  practice: t(`Change the salary to 6000, then add a third attribute mv_id TYPE i and display it in show. ${boundary}`),
  goal: classGoal, hint: classHints[0], hints: classHints, starter: classStarter, solution: oopClassSolution, expected: "IT\n2",
  challenges: [{ id: "oop-class-blueprint", title: t("Write the department class"), goal: classGoal, hint: classHints[2], starter: classStarter, solution: oopClassSolution, expected: "IT\n2" }],
  quiz: t("A class definition declares METHODS show, but the implementation has no METHOD show block. What happens?"),
  options: [t("The program is rejected: every declared method needs an implementation"), t("show runs and does nothing"), t("show is created automatically from the attributes")], answer: 0,
  quizExplanation: t("The definition is a promise. ABAP checks that every declared method is implemented between METHOD and ENDMETHOD; an empty method would be written as an empty METHOD block, and nothing is generated for you."),
};
export const oopClassGroups = [
  group("definition", [1, 2], "Open the blueprint", "Starts the class definition of lcl_employee and opens its PUBLIC SECTION.", ["class-definition"]),
  group("attributes", [3, 4], "Describe the data", "Declares the attributes mv_name and mv_salary that every employee object will have.", ["class-definition"]),
  group("declare-method", [5, 6], "Declare a method", "Declares the method show and closes the definition with ENDCLASS.", ["class-definition"]),
  group("implementation", [7, 8], "Start the implementation", "Opens the implementation part and the code of the method show.", ["class-implementation"]),
  group("method-body", [9, 12], "Write the method's steps", "Displays the object's mv_name and mv_salary, then ends the method and the class.", ["class-implementation"]),
  group("create", [13, 14], "Create an object", "Declares a reference variable and creates one lcl_employee object with NEW."),
  group("fill", [15, 16], "Fill the attributes", "Stores Ahmed and 5000 in the object's attributes through the reference."),
  group("call", [17, 17], "Run the method", "Calls show on the object, which displays Ahmed and 5000."),
];

// ---------- 2. Objects ----------
const employeeDataClass = `CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    DATA mv_name TYPE string.
    DATA mv_salary TYPE i.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
ENDCLASS.`;
export const oopObjectExample = `${employeeDataClass}
DATA lo_ahmed TYPE REF TO lcl_employee.
lo_ahmed = NEW #( ).
lo_ahmed->mv_name = 'Ahmed'.
DATA(lo_sara) = NEW lcl_employee( ).
lo_sara->mv_name = 'Sara'.
DATA(lo_same) = lo_ahmed.
lo_same->mv_salary = 5000.
WRITE / lo_ahmed->mv_name.
WRITE / lo_ahmed->mv_salary.
WRITE / lo_sara->mv_salary.`;
const objectSetup = `${employeeDataClass}
DATA lv_raise TYPE i VALUE 500.`;
export const oopObjectSolution = `${objectSetup}
DATA(lo_ahmed) = NEW lcl_employee( ).
lo_ahmed->mv_name = 'Ahmed'.
lo_ahmed->mv_salary = 5000.
DATA(lo_sara) = NEW lcl_employee( ).
lo_sara->mv_name = 'Sara'.
lo_sara->mv_salary = 8000.
DATA(lo_selected) = lo_sara.
lo_selected->mv_salary = lo_selected->mv_salary + lv_raise.
WRITE / lo_ahmed->mv_salary.
WRITE / lo_sara->mv_salary.`;
const objectStarter = `${objectSetup}\n* Create Ahmed and Sara, give Sara a raise through lo_selected, then show both salaries.\n`;
const objectGoal = t("Create two objects of lcl_employee: lo_ahmed (Ahmed, salary 5000) and lo_sara (Sara, salary 8000). Copy the reference with DATA(lo_selected) = lo_sara. and add lv_raise to the salary through lo_selected only. Then display Ahmed's salary and then Sara's salary. Use exactly two NEW expressions. The checker changes lv_raise and both starting salaries.");
const objectHints = [t("DATA(lo_ahmed) = NEW lcl_employee( ). creates an object and its reference in one line."), t("DATA(lo_selected) = lo_sara. copies the reference, not the object. Both now point to Sara's object."), t("lo_selected->mv_salary = lo_selected->mv_salary + lv_raise. then WRITE / lo_ahmed->mv_salary. and WRITE / lo_sara->mv_salary.")];
export const oopObjectMission: Mission = {
  id: "oop-objects", pathId: "oop", prerequisite: "oop-classes-objects",
  title: t("Objects: create instances with NEW"), subtitle: t("Create employee objects, reach them through references and see what a reference copy shares"),
  minutes: 25, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "structure",
  coveredTopics: ["Objects"],
  brief: t("An object is one instance of a class, with its own copy of every instance attribute. You never hold an object directly: a reference variable (TYPE REF TO lcl_employee) points to it. NEW creates the object: NEW #( ) takes the class from the declared variable, NEW lcl_employee( ) names it, which you need with DATA( ). Ahmed and Sara are two objects, so their salaries are separate. DATA(lo_same) = lo_ahmed copies only the reference: both variables now point to Ahmed's object, and 5000 stored through lo_same is Ahmed's salary. Sara's salary stays 0."),
  objectives: [t("Declare reference variables and create objects with NEW #( ) and NEW class( )"), t("Predict which object changes when a reference is copied")],
  references: [ooSheet, kw("object"), kw("new-instance-operator"), kw("object-reference-variable")],
  tokens: [
    tok("type-ref-to", "TYPE REF TO class", "A reference variable stores where an object is, not the object's data. Until NEW runs it is initial and points to nothing.", "Many parts of a program can work with the same employee object through references.", "DATA lo_name TYPE REF TO lcl_employee. Then reach attributes with lo_name->attribute.", "DATA lo_ahmed TYPE REF TO lcl_employee.\nlo_ahmed = NEW #( ).\nlo_ahmed->mv_name = 'Ahmed'.", "DATA lo_ahmed TYPE REF TO lcl_employee.\nlo_ahmed->mv_name = 'Ahmed'.", "What happens in the second snippet?", ["A runtime error: lo_ahmed does not point to an object yet", "Ahmed is stored in a new object"], "Declaring a reference creates no object. Using an initial reference stops the program (CX_SY_REF_IS_INITIAL)."),
    tok("new-object", "NEW #( ) and NEW class( )", "NEW creates an object and returns a reference to it. Each NEW is a separate object with its own attribute values.", "Each employee needs separate data: Ahmed's salary must not change Sara's.", "lo_ahmed = NEW #( ). when lo_ahmed is declared, or DATA(lo_sara) = NEW lcl_employee( ). to declare and create in one line.", "DATA(lo_sara) = NEW lcl_employee( ).", "DATA(lo_sara) = NEW #( ).", "Why does DATA(lo_sara) = NEW #( ) not work?", ["# needs a known target type, and DATA( ) has none yet", "NEW cannot be used with DATA( )"], "With # the class comes from the target. An inline DATA( ) target has no type yet, so name the class: NEW lcl_employee( )."),
  ],
  example: oopObjectExample,
  visual: t("Watch memory: each NEW adds a card, lcl_employee #1 for Ahmed and lcl_employee #2 for Sara. lo_same gets the value lcl_employee #1, the same as lo_ahmed, so storing 5000 through lo_same changes card #1. Change DATA(lo_same) = lo_ahmed. to DATA(lo_same) = lo_sara. and the 5000 moves to Sara."),
  practice: t(`Create a third object for Omar with salary 6000 and display it. Then make lo_same point to Omar. ${boundary} Object names like lcl_employee #1 are the simulator's labels; SAP does not show names for objects.`),
  goal: objectGoal, hint: objectHints[0], hints: objectHints, starter: objectStarter, solution: oopObjectSolution, expected: "5000\n8500",
  challenges: [{ id: "oop-two-objects", title: t("Two objects and a shared reference"), goal: objectGoal, hint: objectHints[2], starter: objectStarter, solution: oopObjectSolution, expected: "5000\n8500" }],
  quiz: t("lo_b = lo_a. Then lo_b->mv_salary = 9000. What is lo_a->mv_salary?"),
  options: [t("9000, because both references point to the same object"), t("Its old value, because lo_b is a copy of the object"), t("0, because the assignment created a new object")], answer: 0,
  quizExplanation: t("Assigning a reference copies the pointer, not the object. Only NEW creates an object, so lo_a and lo_b reach the same attributes."),
};
export const oopObjectGroups = [
  group("class", [1, 7], "The blueprint", "Defines lcl_employee with the attributes mv_name and mv_salary and no methods.", ["type-ref-to"]),
  group("reference", [8, 8], "Declare a reference", "Declares lo_ahmed, which can point to an lcl_employee object but points to none yet.", ["type-ref-to"]),
  group("first", [9, 10], "Create Ahmed", "Creates the first object with NEW #( ) and stores Ahmed in it.", ["new-object"]),
  group("second", [11, 12], "Create Sara", "Declares lo_sara inline, creates a second object and stores Sara in it.", ["new-object"]),
  group("copy", [13, 14], "Copy the reference", "Copies the reference into lo_same and stores 5000 in Ahmed's object through it.", ["type-ref-to"]),
  group("show", [15, 17], "Compare the objects", "Displays Ahmed, 5000 and Sara's salary 0."),
];

// ---------- 3. Attributes ----------
export const oopAttributeExample = `CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    DATA mv_name TYPE string.
    CLASS-DATA gv_company TYPE string.
    CLASS-DATA gv_count TYPE i.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
ENDCLASS.
lcl_employee=>gv_company = 'ZACA Corp'.
DATA(lo_ahmed) = NEW lcl_employee( ).
lo_ahmed->mv_name = 'Ahmed'.
lcl_employee=>gv_count = lcl_employee=>gv_count + 1.
DATA(lo_sara) = NEW lcl_employee( ).
lo_sara->mv_name = 'Sara'.
lcl_employee=>gv_count = lcl_employee=>gv_count + 1.
WRITE / lo_sara->mv_name.
WRITE / lcl_employee=>gv_company.
WRITE / lcl_employee=>gv_count.`;
const totalUse = `CLASS lcl_employee IMPLEMENTATION.
ENDCLASS.
DATA(lo_ahmed) = NEW lcl_employee( ).
lo_ahmed->mv_salary = 5000.
DATA(lo_omar) = NEW lcl_employee( ).
lo_omar->mv_salary = 6000.`;
const totalStarter = `CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    DATA mv_name TYPE string.
    DATA mv_salary TYPE i.
* Add a static attribute gv_total TYPE i here.
ENDCLASS.
${totalUse}
* Add both salaries to lcl_employee=>gv_total, then display it.
`;
export const oopAttributeSolution = `CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    DATA mv_name TYPE string.
    DATA mv_salary TYPE i.
    CLASS-DATA gv_total TYPE i.
ENDCLASS.
${totalUse}
lcl_employee=>gv_total = lcl_employee=>gv_total + lo_ahmed->mv_salary.
lcl_employee=>gv_total = lcl_employee=>gv_total + lo_omar->mv_salary.
WRITE / lcl_employee=>gv_total.`;
const attributeGoal = t("Add a static attribute gv_total TYPE i to lcl_employee with CLASS-DATA. Below the code that creates Ahmed and Omar, add each object's mv_salary to lcl_employee=>gv_total, then display lcl_employee=>gv_total. The checker changes both salaries, so add the attributes, not fixed numbers.");
const attributeHints = [t("A static attribute exists once for the whole class: CLASS-DATA gv_total TYPE i. inside PUBLIC SECTION."), t("Reach it with the class name and =>: lcl_employee=>gv_total."), t("lcl_employee=>gv_total = lcl_employee=>gv_total + lo_ahmed->mv_salary. Do the same for lo_omar, then WRITE / lcl_employee=>gv_total.")];
export const oopAttributeMission: Mission = {
  id: "oop-attributes", pathId: "oop", prerequisite: "oop-objects",
  title: t("Attributes: per object or per class"), subtitle: t("Keep each employee's name in an instance attribute and shared values in static attributes"),
  minutes: 25, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "structure",
  coveredTopics: ["Attributes"],
  brief: t("Attributes are the data of a class. An instance attribute (DATA mv_name) exists once in every object: Ahmed's object and Sara's object each have their own mv_name. A static attribute (CLASS-DATA gv_count) exists once for the whole class, no matter how many objects there are, and even before the first object. You reach it with the class name and =>: lcl_employee=>gv_count. Here the company name is set once and the count goes from 0 to 2 as two employees are created. Change a static attribute and every object sees the new value."),
  objectives: [t("Declare instance attributes with DATA and static attributes with CLASS-DATA"), t("Reach instance attributes with -> and static attributes with class=>attribute")],
  references: [ooSheet, kw("instance-attribute"), kw("static-attribute")],
  tokens: [
    tok("instance-attribute", "DATA in a class", "An instance attribute is declared with DATA in the class definition. Every object gets its own copy.", "Each employee has a different name and salary.", "Inside a section: DATA mv_name TYPE string. Outside the class reach it through a reference: lo_ahmed->mv_name.", "lo_ahmed->mv_name = 'Ahmed'.", "lcl_employee=>mv_name = 'Ahmed'.", "Why is lcl_employee=>mv_name wrong?", ["mv_name belongs to each object, so you need a reference", "=> only works inside methods"], "The class name has no mv_name of its own. Only an object has one, so use lo_ahmed->mv_name."),
    tok("static-attribute", "CLASS-DATA and =>", "A static attribute is declared with CLASS-DATA. It exists once per class and is shared by all objects.", "Values that belong to the whole company, such as its name or a head count, should not be stored again in every employee.", "Inside a section: CLASS-DATA gv_count TYPE i. Reach it with the class name: lcl_employee=>gv_count.", "lcl_employee=>gv_count = lcl_employee=>gv_count + 1.", "lo_ahmed->mv_count = lo_ahmed->mv_count + 1.", "Two objects exist and you add 1 to lcl_employee=>gv_count twice. What is the count?", ["2, there is only one gv_count", "1 in each object"], "CLASS-DATA creates a single value for the class. Both additions change the same gv_count."),
  ],
  example: oopAttributeExample,
  visual: t("Watch memory: lcl_employee=>gv_company and lcl_employee=>gv_count exist before any object. Each object card holds only mv_name. gv_count goes 0, 1, 2 while two cards appear. Change 'ZACA Corp' to another name to see one change shown for every employee."),
  practice: t(`Create a third employee for Omar and count him too. Then try lcl_employee=>mv_name and read the error. ${boundary}`),
  goal: attributeGoal, hint: attributeHints[0], hints: attributeHints, starter: totalStarter, solution: oopAttributeSolution, expected: "11000",
  challenges: [{ id: "oop-static-total", title: t("Keep a salary total for the class"), goal: attributeGoal, hint: attributeHints[2], starter: totalStarter, solution: oopAttributeSolution, expected: "11000" }],
  quiz: t("lcl_employee has CLASS-DATA gv_company. You create 3 objects. How many gv_company values exist?"),
  options: [t("One, shared by the class"), t("Three, one per object"), t("None until you call a method")], answer: 0,
  quizExplanation: t("CLASS-DATA exists once per class, independent of objects. Only DATA attributes are copied into every object."),
};
export const oopAttributeGroups = [
  group("instance", [1, 3], "An instance attribute", "Declares mv_name with DATA, so each object gets its own name.", ["instance-attribute"]),
  group("static", [4, 8], "Static attributes", "Declares gv_company and gv_count with CLASS-DATA, once for the class.", ["static-attribute"]),
  group("company", [9, 9], "Set a class value", "Stores ZACA Corp in the static attribute before any object exists.", ["static-attribute"]),
  group("ahmed", [10, 12], "First employee", "Creates Ahmed's object and adds 1 to the shared count.", ["instance-attribute", "static-attribute"]),
  group("sara", [13, 15], "Second employee", "Creates Sara's object and raises the shared count to 2.", ["instance-attribute", "static-attribute"]),
  group("show", [16, 18], "Show the values", "Displays Sara, ZACA Corp and 2."),
];

// ---------- 4. Methods ----------
export const oopMethodExample = `CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    METHODS set_salary IMPORTING iv_salary TYPE i.
    METHODS give_raise IMPORTING iv_amount TYPE i.
    METHODS get_salary RETURNING VALUE(rv_salary) TYPE i.
  PRIVATE SECTION.
    DATA mv_salary TYPE i.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
  METHOD set_salary.
    mv_salary = iv_salary.
  ENDMETHOD.
  METHOD give_raise.
    mv_salary = mv_salary + iv_amount.
  ENDMETHOD.
  METHOD get_salary.
    rv_salary = mv_salary.
  ENDMETHOD.
ENDCLASS.
DATA(lo_sara) = NEW lcl_employee( ).
lo_sara->set_salary( 8000 ).
lo_sara->give_raise( iv_amount = 500 ).
DATA(lv_salary) = lo_sara->get_salary( ).
WRITE / lv_salary.`;
const methodUse = `DATA(lo_omar) = NEW lcl_employee( ).
lo_omar->set_salary( lv_salary ).
lo_omar->give_raise( lv_raise ).
lo_omar->give_raise( lv_raise ).
WRITE / lo_omar->get_salary( ).`;
const methodSetup = `DATA lv_salary TYPE i VALUE 6000.
DATA lv_raise TYPE i VALUE 750.`;
const methodStarter = `${methodSetup}
CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    METHODS set_salary IMPORTING iv_salary TYPE i.
* Declare give_raise (IMPORTING iv_amount TYPE i) and get_salary (RETURNING VALUE(rv_salary) TYPE i).
  PRIVATE SECTION.
    DATA mv_salary TYPE i.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
  METHOD set_salary.
    mv_salary = iv_salary.
  ENDMETHOD.
ENDCLASS.
${methodUse}
`;
export const oopMethodSolution = `${methodSetup}
CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    METHODS set_salary IMPORTING iv_salary TYPE i.
    METHODS give_raise IMPORTING iv_amount TYPE i.
    METHODS get_salary RETURNING VALUE(rv_salary) TYPE i.
  PRIVATE SECTION.
    DATA mv_salary TYPE i.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
  METHOD set_salary.
    mv_salary = iv_salary.
  ENDMETHOD.
  METHOD give_raise.
    mv_salary = mv_salary + iv_amount.
  ENDMETHOD.
  METHOD get_salary.
    rv_salary = mv_salary.
  ENDMETHOD.
ENDCLASS.
${methodUse}`;
const methodGoal = t("mv_salary is private, so the code at the bottom can only use methods. Declare and implement give_raise (IMPORTING iv_amount TYPE i), which adds iv_amount to mv_salary, and get_salary (RETURNING VALUE(rv_salary) TYPE i), which returns mv_salary. Keep the code at the bottom unchanged. With 6000 and two raises of 750 it shows 7500; the checker changes lv_salary and lv_raise.");
const methodHints = [t("Declarations go in the PUBLIC SECTION, next to set_salary: METHODS give_raise IMPORTING iv_amount TYPE i."), t("METHODS get_salary RETURNING VALUE(rv_salary) TYPE i. A RETURNING parameter is what the call gives back."), t("METHOD give_raise. mv_salary = mv_salary + iv_amount. ENDMETHOD. METHOD get_salary. rv_salary = mv_salary. ENDMETHOD.")];
export const oopMethodMission: Mission = {
  id: "oop-instance-methods", pathId: "oop", prerequisite: "oop-attributes",
  title: t("Methods: give objects behavior"), subtitle: t("Pass values in with IMPORTING, get a result back with RETURNING and protect private data"),
  minutes: 30, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "structure",
  coveredTopics: ["Methods"],
  brief: t("A method is code that belongs to a class and works on one object. IMPORTING parameters carry values in: give_raise( iv_amount = 500 ) puts 500 into iv_amount for this call only. A RETURNING parameter carries one value back, so get_salary( ) can be used like a value: DATA(lv_salary) = lo_sara->get_salary( ). Here mv_salary is in the PRIVATE SECTION. Code outside the class cannot read or change it, so every change goes through the methods. Sara starts at 8000, gets 500, and the program shows 8500."),
  objectives: [t("Declare and implement methods with IMPORTING and RETURNING parameters"), t("Call methods on an object and use a private attribute only through them")],
  references: [ooSheet, kw("methods-importing-exporting-changing-raising"), kw("functional-method"), kw("visibility-section")],
  tokens: [
    tok("method-importing", "METHODS … IMPORTING", "IMPORTING declares input parameters. The caller passes a value for each one; inside the method the parameter is read-only.", "One give_raise method works for any amount instead of a separate method per amount.", "METHODS name IMPORTING iv_param TYPE type. Call with obj->name( iv_param = value ), or obj->name( value ) when there is exactly one parameter.", "lo_sara->give_raise( iv_amount = 500 ).", "lo_sara->give_raise( iv_salary = 500 ).", "Why is the second call rejected?", ["give_raise has no parameter called iv_salary", "Named parameters are not allowed"], "The name before = must match a parameter of this method. give_raise only has iv_amount."),
    tok("method-returning", "RETURNING VALUE( )", "A RETURNING parameter is the one result of a method. The method sets it; the call can be used directly as a value.", "Reading the salary should not need a helper variable or public data.", "METHODS name RETURNING VALUE(rv_result) TYPE type. In the method assign rv_result. Call: DATA(lv) = obj->name( ).", "rv_salary = mv_salary.", "WRITE / mv_salary.", "In get_salary, why assign rv_salary instead of writing mv_salary?", ["The caller receives rv_salary and decides what to do with it", "WRITE does not work in methods"], "A getter returns the value. Displaying it inside the method would hide it from the caller."),
  ],
  example: oopMethodExample,
  visual: t("Step into the calls. At set_salary( 8000 ) iv_salary appears with 8000, mv_salary in Sara's object becomes 8000, and iv_salary disappears at ENDMETHOD. give_raise adds 500. get_salary sets rv_salary to 8500, which lands in lv_salary. Then change give_raise( iv_amount = 500 ) to give_raise( iv_amount = 1000 ) and see 9000."),
  practice: t(`Add lo_sara->mv_salary = 1. at the end and read the error: the attribute is private. Then call give_raise twice. ${boundary} IMPORTING parameters are read-only inside the method, as in SAP for the default pass by reference; IMPORTING VALUE( ) parameters are outside this model.`),
  goal: methodGoal, hint: methodHints[0], hints: methodHints, starter: methodStarter, solution: oopMethodSolution, expected: "7500",
  challenges: [{ id: "oop-salary-methods", title: t("Raise and read a private salary"), goal: methodGoal, hint: methodHints[2], starter: methodStarter, solution: oopMethodSolution, expected: "7500" }],
  quiz: t("mv_salary is in the PRIVATE SECTION. Which line outside the class is accepted?"),
  options: [t("lo_sara->give_raise( iv_amount = 500 )."), t("lo_sara->mv_salary = lo_sara->mv_salary + 500."), t("WRITE / lo_sara->mv_salary.")], answer: 0,
  quizExplanation: t("Private attributes can only be used inside the class's own methods. Reading or writing lo_sara->mv_salary from outside is rejected; the public method give_raise is the allowed way in."),
};
export const oopMethodGroups = [
  group("signatures", [1, 5], "Declare the methods", "Declares three public methods with their IMPORTING and RETURNING parameters.", ["method-importing", "method-returning"]),
  group("private", [6, 8], "Hide the salary", "Puts mv_salary in the PRIVATE SECTION so only the methods can use it."),
  group("set", [9, 12], "Store a salary", "Copies the parameter iv_salary into the object's mv_salary.", ["method-importing"]),
  group("raise", [13, 15], "Add a raise", "Adds iv_amount to the object's current mv_salary.", ["method-importing"]),
  group("get", [16, 19], "Return the salary", "Sets the RETURNING parameter rv_salary to mv_salary.", ["method-returning"]),
  group("create", [20, 21], "Create and set", "Creates Sara's object and sets her salary to 8000 with a positional parameter.", ["method-importing"]),
  group("call", [22, 22], "Call with a named parameter", "Passes 500 as iv_amount, so mv_salary becomes 8500.", ["method-importing"]),
  group("result", [23, 24], "Use the returned value", "Stores the returned 8500 in lv_salary and displays it.", ["method-returning"]),
];

// ---------- 5. Constructors ----------
const ctorClassHead = `CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_name TYPE string iv_salary TYPE i.
    METHODS show.
  PRIVATE SECTION.
    DATA mv_name TYPE string.
    DATA mv_salary TYPE i.
ENDCLASS.`;
export const oopCtorExample = `${ctorClassHead}
CLASS lcl_employee IMPLEMENTATION.
  METHOD constructor.
    mv_name = iv_name.
    mv_salary = iv_salary.
  ENDMETHOD.
  METHOD show.
    WRITE / mv_name.
    WRITE / mv_salary.
  ENDMETHOD.
ENDCLASS.
DATA(lo_ahmed) = NEW lcl_employee( iv_name = 'Ahmed' iv_salary = 5000 ).
DATA(lo_sara) = NEW lcl_employee( iv_name = 'Sara' iv_salary = 8000 ).
lo_sara->show( ).`;
const ctorSetup = `DATA lv_name TYPE string VALUE 'Omar'.
DATA lv_salary TYPE i VALUE 600.`;
const ctorShow = `  METHOD show.
    WRITE / mv_name.
    WRITE / mv_salary.
  ENDMETHOD.
ENDCLASS.
DATA(lo_employee) = NEW lcl_employee( iv_name = lv_name iv_salary = lv_salary ).
lo_employee->show( ).`;
const ctorStarter = `${ctorSetup}
CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
* Declare the constructor here.
    METHODS show.
  PRIVATE SECTION.
    DATA mv_name TYPE string.
    DATA mv_salary TYPE i.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
* Implement the constructor here.
${ctorShow}
`;
export const oopCtorSolution = `${ctorSetup}
${ctorClassHead}
CLASS lcl_employee IMPLEMENTATION.
  METHOD constructor.
    mv_name = iv_name.
    IF iv_salary < 1000.
      mv_salary = 1000.
    ELSE.
      mv_salary = iv_salary.
    ENDIF.
  ENDMETHOD.
${ctorShow}`;
const ctorGoal = t("Declare and implement the constructor of lcl_employee: IMPORTING iv_name TYPE string and iv_salary TYPE i. It stores the name, and stores the salary, except that a salary below 1000 is stored as 1000 (the minimum). Keep show and the code that creates the object unchanged. With Omar and 600 the program shows Omar and 1000. The checker changes lv_name and lv_salary, including a salary of exactly 1000.");
const ctorHints = [t("Declare it next to show: METHODS constructor IMPORTING iv_name TYPE string iv_salary TYPE i. The parameter names must match the NEW call."), t("Implement it like any method: METHOD constructor. … ENDMETHOD. Copy iv_name into mv_name."), t("IF iv_salary < 1000. mv_salary = 1000. ELSE. mv_salary = iv_salary. ENDIF. goes inside the constructor.")];
export const oopCtorMission: Mission = {
  id: "oop-constructors", pathId: "oop", prerequisite: "oop-instance-methods",
  title: t("Constructors: start every object ready"), subtitle: t("Pass values to NEW so a new employee object never exists half-filled"),
  minutes: 25, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "structure",
  coveredTopics: ["Constructors"],
  brief: t("Until now, every employee object started empty and the program filled it line by line. A constructor is a special method named constructor that ABAP runs once, right when NEW creates the object. Its IMPORTING parameters become the values you write inside NEW: NEW lcl_employee( iv_name = 'Sara' iv_salary = 8000 ). The constructor copies them into the private attributes, so Sara's object starts as Sara, 8000 and nothing can forget a step. If the class has a constructor with parameters, NEW must supply them all. You never call a constructor yourself."),
  objectives: [t("Declare a constructor with IMPORTING parameters and implement it"), t("Create objects with NEW class( parameter = value ) and let the constructor set the starting state")],
  references: [ooSheet, kw("constructors"), kw("new-instance-operator"), kw("methods-importing-exporting-changing-raising")],
  tokens: [
    tok("ctor-declare", "METHODS constructor", "The instance constructor is a method that must be called constructor. It sets up the new object and runs automatically while NEW creates it.", "A new employee should have a name and a salary from the first moment, not after three more statements.", "Declare it in the PUBLIC SECTION: METHODS constructor IMPORTING iv_name TYPE string. Implement it with METHOD constructor. … ENDMETHOD.", "METHODS constructor IMPORTING iv_name TYPE string iv_salary TYPE i.", "lo_employee->constructor( iv_name = 'Sara' iv_salary = 8000 ).", "Why is the second line rejected?", ["A constructor runs automatically with NEW and is not called", "Constructors cannot have parameters"], "NEW calls the constructor for you. Calling it again from outside is not allowed."),
    tok("ctor-new", "NEW class( param = value )", "The parameters of the constructor are written inside the parentheses of NEW, each as name = value. All parameters without a default are required.", "The caller provides the starting values, and the constructor decides what to do with them.", "NEW lcl_employee( iv_name = 'Sara' iv_salary = 8000 ). With exactly one parameter you may write only the value: NEW lcl_employee( 8000 ).", "DATA(lo_sara) = NEW lcl_employee( iv_name = 'Sara' iv_salary = 8000 ).", "DATA(lo_sara) = NEW lcl_employee( ).", "What happens in the second line?", ["It is rejected: the constructor needs iv_name and iv_salary", "It creates an employee with empty values"], "A constructor with required parameters means every NEW must provide them."),
  ],
  example: oopCtorExample,
  visual: t("Step through the NEW lines. At the first NEW a call to the constructor appears: iv_name and iv_salary exist with Ahmed and 5000, the object card fills in, and ENDMETHOD removes the parameters again. Then the second NEW does the same for Sara. Change the salary in the Sara line to 9000 or replace mv_salary = iv_salary with mv_salary = 0 to see the constructor decide the starting value."),
  practice: t(`Create a third employee, Omar with 6000, and show him. Then remove one parameter from a NEW and read the error. ${boundary} Only the instance constructor is covered; CLASS-CONSTRUCTOR and OPTIONAL or DEFAULT parameters are not.`),
  goal: ctorGoal, hint: ctorHints[0], hints: ctorHints, starter: ctorStarter, solution: oopCtorSolution, expected: "Omar\n1000",
  challenges: [{ id: "oop-ctor-minimum", title: t("Constructor with a minimum salary"), goal: ctorGoal, hint: ctorHints[2], starter: ctorStarter, solution: oopCtorSolution, expected: "Omar\n1000" }],
  quiz: t("The class has METHODS constructor IMPORTING iv_name TYPE string. Which statement creates an object?"),
  options: [t("DATA(lo) = NEW lcl_employee( iv_name = 'Sara' )."), t("DATA(lo) = NEW lcl_employee( )."), t("DATA(lo) = NEW lcl_employee( ). lo->constructor( 'Sara' ).")], answer: 0,
  quizExplanation: t("NEW must supply the constructor's parameters, and it runs the constructor itself. Leaving them out is rejected, and calling a constructor by hand is not allowed."),
};
export const oopCtorGroups = [
  group("signature", [1, 4], "Declare the constructor", "Declares the constructor with the parameters iv_name and iv_salary, and the method show.", ["ctor-declare"]),
  group("state", [5, 8], "Keep the data private", "Puts mv_name and mv_salary in the PRIVATE SECTION, so only methods of the class change them."),
  group("ctor-body", [9, 13], "Write the constructor", "Copies the parameters into the new object's attributes.", ["ctor-declare"]),
  group("show", [14, 18], "Show the employee", "Displays the object's name and salary."),
  group("create", [19, 20], "Create with values", "Creates Ahmed and Sara. Each NEW runs the constructor with its own values.", ["ctor-new"]),
  group("use", [21, 21], "Use the object", "Shows Sara and 8000. Ahmed's object was never touched."),
];

// ---------- 6. Inheritance ----------
export const oopInheritExample = `CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_name TYPE string iv_salary TYPE i.
    METHODS get_pay RETURNING VALUE(rv_pay) TYPE i.
  PROTECTED SECTION.
    DATA mv_name TYPE string.
    DATA mv_salary TYPE i.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
  METHOD constructor.
    mv_name = iv_name.
    mv_salary = iv_salary.
  ENDMETHOD.
  METHOD get_pay.
    rv_pay = mv_salary.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_manager DEFINITION INHERITING FROM lcl_employee.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_name TYPE string iv_salary TYPE i iv_bonus TYPE i.
    METHODS get_pay REDEFINITION.
  PRIVATE SECTION.
    DATA mv_bonus TYPE i.
ENDCLASS.
CLASS lcl_manager IMPLEMENTATION.
  METHOD constructor.
    super->constructor( iv_name = iv_name iv_salary = iv_salary ).
    mv_bonus = iv_bonus.
  ENDMETHOD.
  METHOD get_pay.
    rv_pay = super->get_pay( ) + mv_bonus.
  ENDMETHOD.
ENDCLASS.
DATA lo_person TYPE REF TO lcl_employee.
lo_person = NEW lcl_manager( iv_name = 'Sara' iv_salary = 8000 iv_bonus = 1500 ).
WRITE / lo_person->get_pay( ).
lo_person = NEW lcl_employee( iv_name = 'Ahmed' iv_salary = 5000 ).
WRITE / lo_person->get_pay( ).`;
const inheritBase = oopInheritExample.split("\n").slice(0, 17).join("\n");
const inheritSetup = `DATA lv_salary TYPE i VALUE 8000.
DATA lv_bonus TYPE i VALUE 1500.`;
const inheritUse = `DATA lo_person TYPE REF TO lcl_employee.
lo_person = NEW lcl_manager( iv_name = 'Sara' iv_salary = lv_salary iv_bonus = lv_bonus ).
WRITE / lo_person->get_pay( ).`;
const inheritStarter = `${inheritSetup}
${inheritBase}
* Write the subclass lcl_manager here (definition and implementation).
${inheritUse}
`;
export const oopInheritSolution = `${inheritSetup}
${inheritBase}
CLASS lcl_manager DEFINITION INHERITING FROM lcl_employee.
  PUBLIC SECTION.
    METHODS constructor IMPORTING iv_name TYPE string iv_salary TYPE i iv_bonus TYPE i.
    METHODS get_pay REDEFINITION.
  PRIVATE SECTION.
    DATA mv_bonus TYPE i.
ENDCLASS.
CLASS lcl_manager IMPLEMENTATION.
  METHOD constructor.
    super->constructor( iv_name = iv_name iv_salary = iv_salary ).
    mv_bonus = iv_bonus.
  ENDMETHOD.
  METHOD get_pay.
    rv_pay = super->get_pay( ) + mv_bonus.
  ENDMETHOD.
ENDCLASS.
${inheritUse}`;
const inheritGoal = t("lcl_employee and the code at the bottom are given. Write the subclass lcl_manager: CLASS lcl_manager DEFINITION INHERITING FROM lcl_employee with a constructor that takes iv_name, iv_salary and iv_bonus, and get_pay REDEFINITION. The constructor first calls super->constructor( ) with the name and salary, then stores the bonus in a private attribute. get_pay returns super->get_pay( ) plus the bonus. With 8000 and 1500 the program shows 9500; the checker changes both values.");
const inheritHints = [t("Start with CLASS lcl_manager DEFINITION INHERITING FROM lcl_employee. Declare METHODS constructor IMPORTING three parameters and METHODS get_pay REDEFINITION, with DATA mv_bonus TYPE i in the PRIVATE SECTION."), t("In METHOD constructor the first statement must be super->constructor( iv_name = iv_name iv_salary = iv_salary ). Then mv_bonus = iv_bonus."), t("METHOD get_pay. rv_pay = super->get_pay( ) + mv_bonus. ENDMETHOD. Do not repeat the salary logic: the parent already has it.")];
export const oopInheritMission: Mission = {
  id: "oop-inheritance", pathId: "oop", prerequisite: "oop-constructors",
  title: t("Inheritance: reuse a class and extend it"), subtitle: t("Build a manager class on top of the employee class and redefine one method"),
  minutes: 30, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "structure",
  coveredTopics: ["Inheritance"],
  brief: t("A manager is an employee with a bonus. Instead of copying lcl_employee, the subclass lcl_manager inherits from it: CLASS lcl_manager DEFINITION INHERITING FROM lcl_employee. It receives every public and protected component of the superclass and adds its own, here the private attribute mv_bonus. get_pay is redefined: METHODS get_pay REDEFINITION replaces the code, and super->get_pay( ) still reaches the parent's version, so the manager's pay is 8000 + 1500 = 9500. A reference to the superclass can hold a manager, and calling get_pay then runs the manager's code. PROTECTED attributes are visible to subclasses; PRIVATE ones are not."),
  objectives: [t("Write a subclass with INHERITING FROM, call the superclass constructor and add an attribute"), t("Redefine a method, reach the parent's version with super-> and predict which version runs")],
  references: [ooSheet, kw("inheritance"), kw("methods-redefinition"), kw("visibility-section")],
  tokens: [
    tok("inheriting-from", "INHERITING FROM", "A subclass inherits all public and protected components of its superclass and can add more. It is a kind of its superclass: every manager is an employee.", "Managers need everything employees have. Inheriting means the shared code lives in one place.", "CLASS lcl_manager DEFINITION INHERITING FROM lcl_employee. If the superclass has a constructor, the subclass constructor must call super->constructor( … ) as its first statement.", "CLASS lcl_manager DEFINITION INHERITING FROM lcl_employee.", "CLASS lcl_manager DEFINITION.\n  PUBLIC SECTION.\n    DATA mv_name TYPE string.", "What does the second class share with lcl_employee?", ["Nothing: it is a new class, so every attribute has to be declared again", "Everything, because the names match"], "Only INHERITING FROM makes a class a subclass. Without it, lcl_manager is unrelated to lcl_employee."),
    tok("redefinition", "REDEFINITION and super->", "METHODS name REDEFINITION in a subclass replaces the code of an inherited method; the signature stays the same. super->name( ) calls the superclass version.", "A manager is paid differently, but callers still just ask for get_pay.", "Declare METHODS get_pay REDEFINITION. in the subclass and implement METHOD get_pay. Use super->get_pay( ) to reuse the parent's result.", "rv_pay = super->get_pay( ) + mv_bonus.", "METHODS get_pay RETURNING VALUE(rv_pay) TYPE i.", "Why is the second line rejected in lcl_manager?", ["get_pay already exists in the superclass, so it must be written REDEFINITION", "Methods cannot return values in subclasses"], "A subclass cannot declare a second method with the same name. REDEFINITION says you replace the inherited one."),
  ],
  example: oopInheritExample,
  visual: t("Step into NEW lcl_manager. The object card holds mv_name and mv_salary (inherited) and mv_bonus. The subclass constructor calls super->constructor, which fills name and salary, then stores the bonus. At the first WRITE get_pay runs the manager's code and the call to super->get_pay adds the 8000. Then the same variable lo_person holds an employee and get_pay runs the parent's version: 5000. Change iv_bonus = 1500 to iv_bonus = 0 to see 8000."),
  practice: t(`Move mv_salary into the PRIVATE SECTION of lcl_employee and read the error in lcl_manager. Then ask the manager for lo_person->mv_bonus. ${boundary} Only single inheritance of local classes is covered; ABSTRACT and FINAL classes, redefining constructors' parameters and casts such as ?= are not.`),
  goal: inheritGoal, hint: inheritHints[0], hints: inheritHints, starter: inheritStarter, solution: oopInheritSolution, expected: "9500",
  challenges: [{ id: "oop-manager-subclass", title: t("Write the manager subclass"), goal: inheritGoal, hint: inheritHints[2], starter: inheritStarter, solution: oopInheritSolution, expected: "9500" }],
  quiz: t("lcl_employee keeps mv_salary in its PRIVATE SECTION. Can the method get_pay of the subclass lcl_manager read mv_salary?"),
  options: [t("No, only the superclass's own methods can; use PROTECTED or call super->get_pay( )"), t("Yes, a subclass inherits everything, including private data"), t("Yes, but only for reading")], answer: 0,
  quizExplanation: t("PRIVATE means only the class's own methods. PROTECTED opens the component to subclasses too. Alternatively the subclass can ask the superclass through a public method."),
};
export const oopInheritGroups = [
  group("base-def", [1, 8], "The superclass", "Defines lcl_employee with a constructor, get_pay and protected attributes that subclasses may use."),
  group("base-code", [9, 17], "The superclass code", "Stores the name and salary, and returns the salary as the pay."),
  group("sub-def", [18, 24], "Inherit and extend", "Makes lcl_manager a subclass of lcl_employee, adds a bonus attribute and redefines get_pay.", ["inheriting-from", "redefinition"]),
  group("sub-ctor", [25, 29], "Call the parent constructor", "Runs the superclass constructor for name and salary first, then stores the bonus.", ["inheriting-from"]),
  group("sub-pay", [30, 33], "Redefine get_pay", "Returns the parent's pay plus the bonus: 8000 + 1500.", ["redefinition"]),
  group("upcast", [34, 36], "A manager in an employee variable", "A variable of type lcl_employee holds a manager; get_pay runs the manager's version and shows 9500.", ["redefinition"]),
  group("base-object", [37, 38], "The same variable holds an employee", "Now it holds an employee, so the parent's get_pay runs and shows 5000."),
];

// ---------- 7. Interfaces ----------
export const oopIfaceExample = `INTERFACE lif_payable.
  METHODS get_amount RETURNING VALUE(rv_amount) TYPE i.
ENDINTERFACE.
CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_payable.
    DATA mv_salary TYPE i.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
  METHOD lif_payable~get_amount.
    rv_amount = mv_salary.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_contractor DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_payable.
    DATA mv_fee TYPE i.
ENDCLASS.
CLASS lcl_contractor IMPLEMENTATION.
  METHOD lif_payable~get_amount.
    rv_amount = mv_fee.
  ENDMETHOD.
ENDCLASS.
DATA(lo_employee) = NEW lcl_employee( ).
lo_employee->mv_salary = 5000.
DATA(lo_contractor) = NEW lcl_contractor( ).
lo_contractor->mv_fee = 1200.
DATA li_first TYPE REF TO lif_payable.
DATA li_second TYPE REF TO lif_payable.
li_first = lo_employee.
li_second = lo_contractor.
WRITE / li_first->get_amount( ).
WRITE / li_second->get_amount( ).`;
const ifaceHead = oopIfaceExample.split("\n").slice(0, 13).join("\n");
const ifaceSetup = `DATA lv_fee TYPE i VALUE 1200.
DATA lv_expenses TYPE i VALUE 300.`;
const ifaceUse = `DATA(lo_employee) = NEW lcl_employee( ).
lo_employee->mv_salary = 5000.
DATA(lo_contractor) = NEW lcl_contractor( ).
lo_contractor->mv_fee = lv_fee.
lo_contractor->mv_expenses = lv_expenses.
DATA li_first TYPE REF TO lif_payable.
DATA li_second TYPE REF TO lif_payable.
li_first = lo_employee.
li_second = lo_contractor.
WRITE / li_first->get_amount( ).
WRITE / li_second->get_amount( ).`;
const ifaceStarter = `${ifaceSetup}
${ifaceHead}
* Write lcl_contractor here: it implements lif_payable and has the attributes mv_fee and mv_expenses.
${ifaceUse}
`;
export const oopIfaceSolution = `${ifaceSetup}
${ifaceHead}
CLASS lcl_contractor DEFINITION.
  PUBLIC SECTION.
    INTERFACES lif_payable.
    DATA mv_fee TYPE i.
    DATA mv_expenses TYPE i.
ENDCLASS.
CLASS lcl_contractor IMPLEMENTATION.
  METHOD lif_payable~get_amount.
    rv_amount = mv_fee + mv_expenses.
  ENDMETHOD.
ENDCLASS.
${ifaceUse}`;
const ifaceGoal = t("The interface lif_payable, the class lcl_employee and the code at the bottom are given. Write lcl_contractor: it implements lif_payable, has the public attributes mv_fee and mv_expenses, and its get_amount returns the fee plus the expenses. With 1200 and 300 the program shows 5000 and then 1500. The checker changes lv_fee and lv_expenses.");
const ifaceHints = [t("Declare INTERFACES lif_payable. in the PUBLIC SECTION, next to DATA mv_fee TYPE i. and DATA mv_expenses TYPE i."), t("Implement the interface method with its full name: METHOD lif_payable~get_amount."), t("METHOD lif_payable~get_amount. rv_amount = mv_fee + mv_expenses. ENDMETHOD. Do not declare METHODS get_amount in the class; the interface already does.")];
export const oopIfaceMission: Mission = {
  id: "oop-interfaces", pathId: "oop", prerequisite: "oop-inheritance",
  title: t("Interfaces: one promise, many classes"), subtitle: t("Let employees and contractors answer the same get_amount call through an interface reference"),
  minutes: 30, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "structure",
  coveredTopics: ["Interfaces"],
  brief: t("Employees and contractors are paid in different ways, and a contractor is not an employee, so inheritance does not fit. An interface lists only method signatures: INTERFACE lif_payable has get_amount and no code. A class that lists INTERFACES lif_payable promises to implement every method, written METHOD lif_payable~get_amount. A variable of type REF TO lif_payable can then hold any such object: li_first holds the employee, li_second holds the contractor, and li_first->get_amount( ) runs each object's own code, 5000 and 1200. The caller needs to know only the interface."),
  objectives: [t("Declare an interface and implement it in two unrelated classes with iface~method"), t("Call methods through an interface reference and predict which class's code runs")],
  references: [ooSheet, kw("interface"), kw("interface-reference-variable"), kw("interfaces-implementation")],
  tokens: [
    tok("interface-define", "INTERFACE … ENDINTERFACE", "An interface declares methods without code. Every class that implements it must provide each method.", "Payroll code should not care whether a payee is an employee or a contractor, only that it can ask for an amount.", "INTERFACE lif_name. METHODS … ENDINTERFACE. Classes list it in the PUBLIC SECTION with INTERFACES lif_name. and implement METHOD lif_name~method.", "INTERFACE lif_payable.\n  METHODS get_amount RETURNING VALUE(rv_amount) TYPE i.\nENDINTERFACE.", "INTERFACE lif_payable.\n  METHODS get_amount.\n    rv_amount = 1.\nENDINTERFACE.", "What is wrong in the second snippet?", ["An interface cannot contain code", "get_amount needs a RETURNING parameter"], "The code of an interface method lives in the classes that implement it."),
    tok("interface-reference", "TYPE REF TO interface", "A reference typed with an interface can point to an object of any class that implements it. Through it you can call only the interface's methods.", "One variable and one call work for employees, contractors and any future payee.", "DATA li_payee TYPE REF TO lif_payable. li_payee = lo_employee. Then li_payee->get_amount( ).", "li_second = lo_contractor.", "li_second = lo_stranger.", "lo_stranger is an object of a class that does not list INTERFACES lif_payable. What happens?", ["The assignment is rejected", "It works and get_amount returns 0"], "A class that does not implement the interface cannot be used as one."),
  ],
  example: oopIfaceExample,
  visual: t("Step to the last two WRITE lines: li_first and li_second are references to different objects, lcl_employee #1 and lcl_contractor #2. Each call jumps into that class's lif_payable~get_amount, so 5000 and 1200 appear. Change li_second = lo_contractor to li_second = lo_employee and both lines show 5000: the same interface reference can point to any implementer."),
  practice: t(`Change the contractor's method to return mv_fee + mv_fee, and call lo_employee->lif_payable~get_amount( ) directly. ${boundary} Interface attributes, constants, ALIASES and implementing several interfaces with the same method names are not covered.`),
  goal: ifaceGoal, hint: ifaceHints[0], hints: ifaceHints, starter: ifaceStarter, solution: oopIfaceSolution, expected: "5000\n1500",
  challenges: [{ id: "oop-contractor-interface", title: t("Write the contractor class"), goal: ifaceGoal, hint: ifaceHints[2], starter: ifaceStarter, solution: oopIfaceSolution, expected: "5000\n1500" }],
  quiz: t("A class lists INTERFACES lif_payable but has no METHOD lif_payable~get_amount. What happens?"),
  options: [t("The program is rejected: the class must implement every interface method"), t("get_amount is created empty and returns 0"), t("Only calls through an interface reference fail")], answer: 0,
  quizExplanation: t("Listing an interface is a promise. ABAP checks that every method of the interface is implemented before the program runs."),
};
export const oopIfaceGroups = [
  group("iface", [1, 3], "The interface", "Declares get_amount without any code, so the interface only describes what can be asked.", ["interface-define"]),
  group("employee-def", [4, 8], "Employees promise it", "Lists INTERFACES lif_payable, so lcl_employee must implement get_amount.", ["interface-define"]),
  group("employee-impl", [9, 13], "Employee pays the salary", "Implements lif_payable~get_amount by returning the salary.", ["interface-define"]),
  group("contractor", [14, 23], "Contractors promise it too", "A second, unrelated class implements the same interface and returns the fee instead.", ["interface-define"]),
  group("create", [24, 27], "Create two objects", "Creates an employee with 5000 and a contractor with a fee of 1200."),
  group("refs", [28, 31], "Interface references", "Declares two references of the interface type and points them to different classes' objects.", ["interface-reference"]),
  group("call", [32, 33], "Same call, different code", "Each call runs its own object's method: 5000 for the employee, 1200 for the contractor.", ["interface-reference"]),
];

// ---------- 8. Exceptions ----------
export const oopExcExample = `CLASS lcx_negative_raise DEFINITION INHERITING FROM cx_static_check.
  PUBLIC SECTION.
    DATA mv_amount TYPE i.
    METHODS constructor IMPORTING iv_amount TYPE i.
ENDCLASS.
CLASS lcx_negative_raise IMPLEMENTATION.
  METHOD constructor.
    super->constructor( ).
    mv_amount = iv_amount.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_employee DEFINITION.
  PUBLIC SECTION.
    DATA mv_salary TYPE i.
    METHODS give_raise IMPORTING iv_amount TYPE i RAISING lcx_negative_raise.
ENDCLASS.
CLASS lcl_employee IMPLEMENTATION.
  METHOD give_raise.
    IF iv_amount < 0.
      RAISE EXCEPTION NEW lcx_negative_raise( iv_amount = iv_amount ).
    ENDIF.
    mv_salary = mv_salary + iv_amount.
  ENDMETHOD.
ENDCLASS.
DATA(lo_sara) = NEW lcl_employee( ).
lo_sara->mv_salary = 8000.
TRY.
    lo_sara->give_raise( 500 ).
    lo_sara->give_raise( -200 ).
    WRITE / 'Done'.
  CATCH lcx_negative_raise INTO DATA(lx_raise).
    WRITE / 'Refused'.
    WRITE / lx_raise->mv_amount.
ENDTRY.
WRITE / lo_sara->mv_salary.`;
const excClassHead = `CLASS lcx_over_limit DEFINITION INHERITING FROM cx_static_check.
  PUBLIC SECTION.
    DATA mv_requested TYPE i.
    METHODS constructor IMPORTING iv_requested TYPE i.
ENDCLASS.
CLASS lcx_over_limit IMPLEMENTATION.
  METHOD constructor.
    super->constructor( ).
    mv_requested = iv_requested.
  ENDMETHOD.
ENDCLASS.
CLASS lcl_leave DEFINITION.
  PUBLIC SECTION.
    DATA mv_days_taken TYPE i.
    DATA mv_limit TYPE i.
    METHODS take IMPORTING iv_days TYPE i RAISING lcx_over_limit.
ENDCLASS.`;
const excSetup = `DATA lv_limit TYPE i VALUE 10.
DATA lv_request TYPE i VALUE 12.`;
const excStarter = `${excSetup}
${excClassHead}
CLASS lcl_leave IMPLEMENTATION.
* Implement take: when the days taken plus iv_days would pass mv_limit, raise lcx_over_limit with iv_requested = iv_days.
* Otherwise store the new total in mv_days_taken.
ENDCLASS.
DATA(lo_leave) = NEW lcl_leave( ).
lo_leave->mv_limit = lv_limit.
* Call take( lv_request ) inside TRY. On success show mv_days_taken.
* In CATCH lcx_over_limit INTO DATA(lx_limit) show Refused and then lx_limit->mv_requested.
`;
export const oopExcSolution = `${excSetup}
${excClassHead}
CLASS lcl_leave IMPLEMENTATION.
  METHOD take.
    DATA lv_new_total TYPE i.
    lv_new_total = mv_days_taken + iv_days.
    IF lv_new_total > mv_limit.
      RAISE EXCEPTION NEW lcx_over_limit( iv_requested = iv_days ).
    ENDIF.
    mv_days_taken = lv_new_total.
  ENDMETHOD.
ENDCLASS.
DATA(lo_leave) = NEW lcl_leave( ).
lo_leave->mv_limit = lv_limit.
TRY.
    lo_leave->take( lv_request ).
    WRITE / lo_leave->mv_days_taken.
  CATCH lcx_over_limit INTO DATA(lx_limit).
    WRITE / 'Refused'.
    WRITE / lx_limit->mv_requested.
ENDTRY.`;
const excGoal = t("The exception class lcx_over_limit and the declaration of lcl_leave are given. Implement take: calculate the new total of days (mv_days_taken plus iv_days); if it is above mv_limit, RAISE EXCEPTION NEW lcx_over_limit( iv_requested = iv_days ), otherwise store it in mv_days_taken. Then, below the object creation, call take( lv_request ) inside TRY: on success show mv_days_taken; in CATCH lcx_over_limit INTO DATA(lx_limit) show Refused and then lx_limit->mv_requested. With a limit of 10 and a request of 12 the program shows Refused and 12; the checker changes both numbers.");
const excHints = [t("Use a local variable: DATA lv_new_total TYPE i. lv_new_total = mv_days_taken + iv_days. Compare it with mv_limit in an IF."), t("Inside the IF: RAISE EXCEPTION NEW lcx_over_limit( iv_requested = iv_days ). Only after the ENDIF store mv_days_taken = lv_new_total."), t("TRY. lo_leave->take( lv_request ). WRITE / lo_leave->mv_days_taken. CATCH lcx_over_limit INTO DATA(lx_limit). WRITE / 'Refused'. WRITE / lx_limit->mv_requested. ENDTRY.")];
export const oopExcMission: Mission = {
  id: "oop-exceptions", pathId: "oop", prerequisite: "oop-interfaces",
  title: t("Exceptions: refuse bad requests cleanly"), subtitle: t("Raise your own exception class, declare it with RAISING and handle it with TRY … CATCH"),
  minutes: 35, xp: 300, difficulty: "intermediate", environment: "browser", assessment: "simulated", visualization: "structure",
  coveredTopics: ["Exceptions"],
  brief: t("A method sometimes cannot do what it was asked: a raise of -200 makes no sense. Instead of returning a magic value, it raises an exception. An exception is an object of a class that inherits from CX_STATIC_CHECK, here lcx_negative_raise with the attribute mv_amount. RAISE EXCEPTION NEW lcx_negative_raise( … ) ends the method at once. ABAP wants you to decide who deals with it: the method declares RAISING lcx_negative_raise, and every caller should either catch it with TRY … CATCH or declare it too. (SAP's syntax check only warns if you do not; this simulator is stricter and refuses to run the program.) In the example Sara gets 500, the second call raises, the statements after it in the TRY block are skipped, and CATCH shows Refused and -200. Her salary stays 8500."),
  objectives: [t("Define an exception class and raise it with RAISE EXCEPTION NEW, declaring it with RAISING"), t("Handle it with TRY … CATCH … INTO and predict which statements run")],
  references: [ooSheet, kw("class-based-exception"), kw("raise-exception"), kw("try-catch")],
  tokens: [
    tok("raise-exception", "RAISE EXCEPTION NEW", "RAISE EXCEPTION creates an exception object of your exception class and stops the current method. The rest of the method does not run.", "Callers must learn that the request failed. An ignored return code would let the program carry on with wrong data.", "RAISE EXCEPTION NEW lcx_name( parameter = value ). The method must declare RAISING lcx_name unless it catches the exception itself.", "RAISE EXCEPTION NEW lcx_negative_raise( iv_amount = iv_amount ).", "RAISE EXCEPTION NEW lcx_negative_raise( iv_amount = iv_amount ).\n\" METHODS give_raise IMPORTING iv_amount TYPE i.", "Why is the second pair rejected?", ["The method raises lcx_negative_raise but does not declare RAISING lcx_negative_raise", "RAISE EXCEPTION needs a TRY block in the same method"], "For classes inheriting from CX_STATIC_CHECK, ABAP's syntax check warns when a raise is neither declared with RAISING nor caught. The simulator treats that warning as an error."),
    tok("try-catch", "TRY … CATCH … INTO", "Statements in the TRY block run until one raises a matching exception. The rest of the TRY block is skipped and the CATCH block runs; INTO stores the exception object.", "The program can answer a refused raise with a message instead of stopping.", "TRY. … CATCH lcx_name INTO DATA(lx). … ENDTRY. Read details of the exception with lx->attribute. Without an exception the CATCH block is skipped.", "CATCH lcx_negative_raise INTO DATA(lx_raise).", "CATCH lcx_negative_raise INTO DATA(lx_raise).\nlx_raise = NEW lcx_negative_raise( iv_amount = 1 ).", "After a raise in the second statement of the TRY block, which statements of the TRY block run?", ["Only the first; the raising statement and everything after it are skipped", "All of them, then CATCH runs"], "A raised exception abandons the rest of the TRY block immediately."),
  ],
  example: oopExcExample,
  visual: t("Step to give_raise( -200 ). The IF is true, so RAISE EXCEPTION creates the object lcx_negative_raise #2 and leaves the method: the line mv_salary = mv_salary + iv_amount never runs and WRITE / 'Done' is skipped. The CATCH block stores the exception in lx_raise, shows Refused and -200, and the last line shows 8500. Change -200 to 200 and nothing is raised: Done and 8700."),
  practice: t(`Remove RAISING lcx_negative_raise from the method and read the error. Then remove the TRY block and read the second one. ${boundary} Only your own exception classes inheriting from CX_STATIC_CHECK (and CX_NO_CHECK) are covered; texts and message classes, CLEANUP, RETRY, RESUME and several CATCH classes in one clause are not.`),
  goal: excGoal, hint: excHints[0], hints: excHints, starter: excStarter, solution: oopExcSolution, expected: "Refused\n12",
  challenges: [{ id: "oop-leave-exception", title: t("Refuse a leave request over the limit"), goal: excGoal, hint: excHints[2], starter: excStarter, solution: oopExcSolution, expected: "Refused\n12" }],
  quiz: t("A method raises an exception of a class inheriting from CX_STATIC_CHECK. Its caller has no TRY and no RAISING. What does this simulator do?"),
  options: [t("It rejects the program before running it, like a failed check"), t("It ignores the exception and the program continues"), t("It runs the program and stops only when the exception is raised")], answer: 0,
  quizExplanation: t("In SAP the syntax check warns about an exception that is neither caught nor declared with RAISING, and an unhandled exception stops the program at run time. The simulator turns the warning into an error so you notice it before running."),
};
export const oopExcGroups = [
  group("exc-class", [1, 5], "Define the exception", "An exception is an object of a class inheriting from CX_STATIC_CHECK. This one carries the refused amount.", ["raise-exception"]),
  group("exc-ctor", [6, 11], "Fill the exception", "The constructor calls the parent constructor and stores the amount.", ["raise-exception"]),
  group("raiser-def", [12, 16], "Declare what can be raised", "give_raise declares RAISING lcx_negative_raise, so callers know they must handle it.", ["raise-exception"]),
  group("raiser-impl", [17, 24], "Raise when the request is wrong", "A negative amount raises the exception and leaves the method; otherwise the salary grows.", ["raise-exception"]),
  group("setup", [25, 26], "Create Sara", "Creates the employee with a salary of 8000."),
  group("try", [27, 30], "Protected block", "Runs two raises. The first adds 500; the second raises, so the WRITE Done after it is skipped.", ["try-catch"]),
  group("catch", [31, 33], "Handle the refusal", "Stores the exception in lx_raise, shows Refused and the refused amount -200.", ["try-catch"]),
  group("after", [34, 35], "Carry on", "The program continues after ENDTRY; Sara's salary is 8500.", ["try-catch"]),
];

export const oopMissions: Mission[] = [oopClassMission, oopObjectMission, oopAttributeMission, oopMethodMission, oopCtorMission, oopInheritMission, oopIfaceMission, oopExcMission];
export const oopAnatomy: Record<string, AnatomyGroupSpec[]> = {
  "oop-classes-objects": oopClassGroups, "oop-objects": oopObjectGroups, "oop-attributes": oopAttributeGroups, "oop-instance-methods": oopMethodGroups,
  "oop-constructors": oopCtorGroups, "oop-inheritance": oopInheritGroups, "oop-interfaces": oopIfaceGroups, "oop-exceptions": oopExcGroups,
};

export const oopEducation: Record<string, EducationSpec> = {
  "oop-constructors": {
    what: t("A constructor is the method NEW runs while it creates an object; its parameters are written inside NEW."), why: t("Make sure every employee object starts complete and valid, with no forgotten set-up steps."),
    concepts: [
      concept("ctor-signature", "Declaring the constructor", "METHODS constructor IMPORTING iv_name iv_salary declares what a new object needs; METHOD constructor copies the values into the private attributes.", "A constructor is not called by hand; NEW calls it, and a call such as lo->constructor( ) is rejected.", [0], ["group:signature", "group:ctor-body", "token:ctor-declare"], ["oop-ctor-minimum", "concept-check"]),
      concept("ctor-new", "Creating with values", "NEW lcl_employee( iv_name = 'Sara' iv_salary = 8000 ) creates Sara's object already filled.", "Leaving out a required parameter is an error; it does not create an empty employee.", [1], ["group:create", "group:use", "token:ctor-new"], ["oop-ctor-minimum", "knowledge-check"]),
    ],
  },
  "oop-inheritance": {
    what: t("A subclass inherits the public and protected components of its superclass, adds its own and can redefine methods."), why: t("Reuse the employee code for managers and change only the pay."),
    concepts: [
      concept("inherit-extend", "INHERITING FROM", "lcl_manager inherits mv_name, mv_salary and get_pay from lcl_employee and adds mv_bonus; its constructor calls super->constructor first.", "PRIVATE components are not inherited for use; a subclass needs PROTECTED or a public method.", [0], ["group:base-def", "group:sub-def", "group:sub-ctor", "token:inheriting-from"], ["oop-manager-subclass", "knowledge-check"]),
      concept("inherit-redefine", "Redefinition and super->", "METHODS get_pay REDEFINITION replaces the code; super->get_pay( ) reuses the parent's: 8000 + 1500 = 9500.", "A reference of the superclass type still runs the subclass code when it holds a subclass object.", [1], ["group:sub-pay", "group:upcast", "group:base-object", "token:redefinition"], ["oop-manager-subclass", "concept-check"]),
    ],
  },
  "oop-interfaces": {
    what: t("An interface lists method signatures; unrelated classes implement them and callers use any of them through an interface reference."), why: t("Pay employees and contractors with the same call, without making one inherit from the other."),
    concepts: [
      concept("iface-contract", "Implementing an interface", "lif_payable declares get_amount; lcl_employee and lcl_contractor each list INTERFACES lif_payable and implement lif_payable~get_amount.", "An interface contains no code, and a class that lists it must implement every method.", [0], ["group:iface", "group:employee-def", "group:employee-impl", "group:contractor", "token:interface-define"], ["oop-contractor-interface", "concept-check"]),
      concept("iface-reference", "Calling through the interface", "li_first->get_amount( ) shows 5000 and li_second->get_amount( ) shows 1200: the object's own class decides the code.", "Through an interface reference only the interface's methods are visible, not the class's other attributes.", [1], ["group:refs", "group:call", "token:interface-reference"], ["oop-contractor-interface", "knowledge-check"]),
    ],
  },
  "oop-exceptions": {
    what: t("An exception is an object of a class inheriting from CX_STATIC_CHECK; RAISE EXCEPTION creates it and TRY … CATCH handles it."), why: t("Refuse a wrong raise or leave request clearly, without returning magic values or stopping the program."),
    concepts: [
      concept("exc-raise", "Raising and declaring", "give_raise raises lcx_negative_raise for -200 and declares RAISING lcx_negative_raise; the rest of the method does not run.", "A method that raises a static-check exception must declare it or catch it; SAP warns otherwise and this simulator stops the program.", [0], ["group:exc-class", "group:exc-ctor", "group:raiser-def", "group:raiser-impl", "token:raise-exception"], ["oop-leave-exception", "concept-check"]),
      concept("exc-catch", "Handling with TRY and CATCH", "The raise in the second call skips the rest of the TRY block; CATCH shows Refused and the amount from lx_raise->mv_amount.", "Statements after the raising one in the TRY block do not run, and with no exception the CATCH block is skipped.", [1], ["group:try", "group:catch", "group:after", "token:try-catch"], ["oop-leave-exception", "knowledge-check"]),
    ],
  },
  "oop-classes-objects": {
    what: t("A class is a blueprint with two parts: the definition declares attributes and methods, the implementation holds the method code."), why: t("Keep an employee's data and the code that works on it together, and reuse the blueprint for every employee."),
    concepts: [
      concept("class-blueprint", "Definition part", "CLASS lcl_employee DEFINITION declares mv_name, mv_salary and show in the PUBLIC SECTION.", "A class definition stores no employee; only objects created from it hold values.", [0], ["group:definition", "group:attributes", "group:declare-method", "token:class-definition"], ["oop-class-blueprint", "knowledge-check"]),
      concept("class-implementation", "Implementation part", "METHOD show … ENDMETHOD holds the WRITE statements that run when show is called.", "Method code never goes into the definition, and a declared method without an implementation is rejected.", [1], ["group:implementation", "group:method-body", "group:call", "token:class-implementation"], ["oop-class-blueprint", "concept-check"]),
    ],
  },
  "oop-objects": {
    what: t("An object is one instance of a class; a reference variable points to it and NEW creates it."), why: t("Work with several employees at once and know exactly which one a change reaches."),
    concepts: [
      concept("object-new", "Creating objects", "Two NEW expressions create lcl_employee #1 (Ahmed) and #2 (Sara), each with its own mv_salary.", "Declaring TYPE REF TO creates no object; using it before NEW stops the program.", [0], ["group:reference", "group:first", "group:second", "token:type-ref-to", "token:new-object"], ["oop-two-objects", "concept-check"]),
      concept("object-reference-copy", "Copying a reference", "DATA(lo_same) = lo_ahmed makes lo_same point to Ahmed's object, so 5000 lands in Ahmed's salary.", "Assigning a reference does not copy the object; only NEW creates one.", [1], ["group:copy", "group:show", "token:type-ref-to"], ["oop-two-objects", "knowledge-check"]),
    ],
  },
  "oop-attributes": {
    what: t("Instance attributes (DATA) exist in every object; static attributes (CLASS-DATA) exist once per class."), why: t("Store per-employee values in each object and company-wide values once."),
    concepts: [
      concept("attribute-instance", "Instance attributes", "Ahmed's and Sara's objects each hold their own mv_name.", "An instance attribute cannot be reached through the class name.", [0, 1], ["group:instance", "group:ahmed", "token:instance-attribute"], ["oop-static-total", "concept-check"]),
      concept("attribute-static", "Static attributes", "lcl_employee=>gv_count exists before any object and counts to 2.", "CLASS-DATA is not copied into each object; there is one value for the class.", [0, 1], ["group:static", "group:company", "group:sara", "token:static-attribute"], ["oop-static-total", "knowledge-check"]),
    ],
  },
  "oop-instance-methods": {
    what: t("Methods are the behavior of a class: IMPORTING parameters bring values in, a RETURNING parameter gives one value back."), why: t("Change and read an employee's salary through rules in one place, with the salary itself kept private."),
    concepts: [
      concept("method-parameters", "IMPORTING parameters", "give_raise( iv_amount = 500 ) puts 500 into iv_amount for this call and adds it to mv_salary.", "Parameters exist only during the call; they are not attributes.", [0, 1], ["group:signatures", "group:raise", "group:call", "token:method-importing"], ["oop-salary-methods", "concept-check"]),
      concept("method-returning", "RETURNING and functional calls", "get_salary( ) returns rv_salary, 8500, which is stored in lv_salary.", "Displaying a value inside the method is not returning it; the caller only gets rv_salary.", [0], ["group:get", "group:result", "token:method-returning"], ["oop-salary-methods", "knowledge-check"]),
      concept("method-encapsulation", "Private data behind methods", "mv_salary is private: lo_sara->mv_salary is rejected outside the class, the methods may use it.", "PRIVATE does not hide the value from the object's own methods.", [1], ["group:private", "group:set"], ["oop-salary-methods", "knowledge-check"]),
    ],
  },
};

// ---------- Behavioral graders: each probe changes inputs in both programs; outputs must agree ----------
export type OopChallengeSpec = { solution: string; probes: Record<string, Primitive>[]; requires: (program: Node[]) => boolean };
const walk = (list: Node[]): Node[] => list.flatMap(n => [n, ...("body" in n ? walk(n.body) : []), ...(n.kind === "classImpl" ? n.methods.flatMap(m => walk(m.body)) : []), ...(n.kind === "try" ? n.catches.flatMap(c => walk(c.body)) : []), ...(n.kind === "if" ? [...walk(n.yes), ...walk(n.no), ...(n.elseifs || []).flatMap(b => walk(b.body))] : [])]);
const classDef = (program: Node[], name: string) => program.find((n): n is Extract<Node, { kind: "classDef" }> => n.kind === "classDef" && n.name === name);
const hasAttr = (program: Node[], cls: string, name: string, type: string, isStatic = false) => !!classDef(program, cls)?.members.some(m => m.kind === "attr" && m.name === name && m.type === type && m.isStatic === isStatic);
const assigns = (program: Node[]) => walk(program).filter((n): n is Extract<Node, { kind: "assign" }> => n.kind === "assign");
export const oopChallengeSpecs: Record<string, OopChallengeSpec> = {
  "oop-ctor-minimum": {
    solution: oopCtorSolution,
    probes: [{}, { lv_name: "Sara", lv_salary: 8000 }, { lv_name: "Eli", lv_salary: 999 }, { lv_name: "Faye", lv_salary: 1000 }, { lv_name: "", lv_salary: 0 }, { lv_name: "Gus", lv_salary: 1001 }],
    requires: program => {
      const ctor = classDef(program, "lcl_employee")?.members.find(m => m.kind === "method" && m.name === "constructor");
      return ctor?.kind === "method" && ctor.importing.length === 2 && ctor.importing[0].type === "string" && ctor.importing[1].type === "i" && !program.some(n => n.kind === "write");
    },
  },
  "oop-manager-subclass": {
    solution: oopInheritSolution,
    probes: [{}, { lv_salary: 5000, lv_bonus: 0 }, { lv_salary: 0, lv_bonus: 250 }, { lv_salary: 12345, lv_bonus: 6789 }],
    requires: program => {
      const sub = classDef(program, "lcl_manager");
      return sub?.parent === "lcl_employee" && sub.members.some(m => m.kind === "method" && m.name === "get_pay" && !!m.redefinition) &&
        sub.members.some(m => m.kind === "attr" && m.name === "mv_bonus" && m.visibility === "private") &&
        assigns(program).some(n => n.target === "rv_pay" && JSON.stringify(n.value).includes('"receiver":"super"'));
    },
  },
  "oop-contractor-interface": {
    solution: oopIfaceSolution,
    probes: [{}, { lv_fee: 0, lv_expenses: 0 }, { lv_fee: 2000, lv_expenses: 75 }, { lv_fee: 1, lv_expenses: 999, "lo_employee->mv_salary": 100 }],
    requires: program => {
      const c = classDef(program, "lcl_contractor");
      return !!c && c.interfaces.includes("lif_payable") && hasAttr(program, "lcl_contractor", "mv_fee", "i") && hasAttr(program, "lcl_contractor", "mv_expenses", "i");
    },
  },
  "oop-leave-exception": {
    solution: oopExcSolution,
    probes: [{}, { lv_limit: 10, lv_request: 4 }, { lv_limit: 10, lv_request: 10 }, { lv_limit: 10, lv_request: 11 }, { lv_limit: 0, lv_request: 0 }, { lv_limit: 5, lv_request: 6 }],
    requires: program => {
      const walked = walk(program);
      return walked.some(n => n.kind === "raise" && n.value.className === "lcx_over_limit") &&
        walked.some(n => n.kind === "try" && n.catches.some(c => c.cls === "lcx_over_limit" && c.into));
    },
  },
  "oop-class-blueprint": {
    solution: oopClassSolution,
    probes: [{}, { "lo_department->mv_code": "HR", "lo_department->mv_headcount": 1 }, { "lo_department->mv_code": "SALES", "lo_department->mv_headcount": 0 }, { "lo_department->mv_code": "", "lo_department->mv_headcount": 15 }],
    requires: program => hasAttr(program, "lcl_department", "mv_code", "string") && hasAttr(program, "lcl_department", "mv_headcount", "i") &&
      !!classDef(program, "lcl_department")?.members.some(m => m.kind === "method" && m.name === "show") && !program.some(n => n.kind === "write"),
  },
  "oop-two-objects": {
    solution: oopObjectSolution,
    probes: [{}, { lv_raise: 0 }, { lv_raise: 1000, "lo_ahmed->mv_salary": 7000, "lo_sara->mv_salary": 7000 }, { lv_raise: 250, "lo_ahmed->mv_salary": 9000, "lo_sara->mv_salary": 100 }],
    requires: program => assigns(program).filter(n => n.value.kind === "new").length === 2 &&
      assigns(program).some(n => n.target === "lo_selected" && n.value.kind === "ref" && n.value.name === "lo_sara") &&
      assigns(program).some(n => n.target === "lo_selected->mv_salary" && n.value.kind === "add"),
  },
  "oop-static-total": {
    solution: oopAttributeSolution,
    probes: [{}, { "lo_ahmed->mv_salary": 7000, "lo_omar->mv_salary": 1 }, { "lo_ahmed->mv_salary": 0, "lo_omar->mv_salary": 0 }, { "lo_ahmed->mv_salary": 123, "lo_omar->mv_salary": 456 }],
    requires: program => hasAttr(program, "lcl_employee", "gv_total", "i", true) &&
      assigns(program).filter(n => n.target === "lcl_employee=>gv_total").length >= 2 &&
      program.some(n => n.kind === "write" && n.value.kind === "ref" && n.value.name === "lcl_employee=>gv_total"),
  },
  "oop-salary-methods": {
    solution: oopMethodSolution,
    probes: [{}, { lv_salary: 0, lv_raise: 0 }, { lv_salary: 8000, lv_raise: 500 }, { lv_salary: 5000, lv_raise: 1 }],
    requires: program => {
      const methods = classDef(program, "lcl_employee")?.members.filter(m => m.kind === "method") ?? [];
      return methods.some(m => m.kind === "method" && m.name === "give_raise" && m.importing.length === 1 && m.importing[0].type === "i") &&
        methods.some(m => m.kind === "method" && m.name === "get_salary" && m.returning?.type === "i") &&
        program.filter(n => n.kind === "call" && n.call.method === "give_raise").length === 2 &&
        program.some(n => n.kind === "write" && n.value.kind === "call" && n.value.method === "get_salary");
    },
  },
};

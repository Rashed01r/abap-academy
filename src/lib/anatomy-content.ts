import { missions, type Text } from "./curriculum";
import { defineAnatomy, type AnatomyGroupSpec, type CodeAnatomy } from "./code-anatomy";
import { anatomyConcepts } from "./anatomy-concepts";

const t=(en:string,ar:string):Text=>({en,ar});
function g(id:string,lines:[number,number],title:Text,explanation:Text,concept:string,extra:Partial<AnatomyGroupSpec>={}):AnatomyGroupSpec {
  return {id,lines,title,explanation,glossaryRefs:[concept],visualizer:{kind:"snapshot",line:lines[1]},practice:t(`Find the section: ${explanation.en}`,`اختر الجزء الذي يقوم بما يلي: ${explanation.ar}`),...extra};
}
const definitions: Record<string,{fingerprint:string;groups:AnatomyGroupSpec[];checks?:string[]}> = {
  structures:{fingerprint:"02fd2bee",checks:["fields","record","assign","output","header","end"],groups:[
    g("header",[1,1],t("Structure Header","بداية تعريف البنية"),t("This starts the definition of a structure called ty_employee.","هنا نبدأ تعريف بنية بيانات جديدة اسمها ty_employee."),"type",{visualizer:{kind:"type",line:1},syntaxRefs:["types","begin"],practice:t("Which part starts the employee structure definition?","أي جزء يبدأ تعريف بنية الموظف؟")}),
    g("fields",[2,3],t("Structure Fields","حقول البنية"),t("These are the fields inside the structure. id stores a whole number, and name stores text.","هنا نحدد الحقول الموجودة داخل البنية. الحقل id مخصص للأرقام الصحيحة، والحقل name مخصص للنصوص."),"type",{visualizer:{kind:"type",line:3},syntaxRefs:["components","string"],fields:[{name:"id",line:2,explanation:t("id holds a whole number, such as 101.","يحفظ id عددًا صحيحًا، مثل 101.")},{name:"name",line:3,explanation:t("name holds text, such as Ahmed.","يحفظ name نصًا، مثل Ahmed.")}],practice:t("Which part defines the fields inside the employee structure?","أي جزء يحدد الحقول الموجودة داخل بنية الموظف؟")}),
    g("end",[4,4],t("Structure End","نهاية تعريف البنية"),t("This closes the structure definition.","هنا ننهي تعريف البنية."),"type",{visualizer:{kind:"type",line:4},syntaxRefs:["endof","chain","period"],detail:t("This is one chained TYPES statement. The colon starts its chain, commas separate its parts, and this period ends the whole statement.","هذه تعليمة TYPES واحدة ذات أجزاء متسلسلة. تبدأ النقطتان السلسلة، وتفصل الفواصل أجزاءها، وتنهي هذه النقطة التعليمة كاملة."),practice:t("Which part closes the structure definition?","أي جزء ينهي تعريف البنية؟")}),
    g("record",[6,6],t("Create Record","إنشاء سجل"),t("This creates a variable called ls_employee using the structure type we just defined.","هنا ننشئ متغيرًا اسمه ls_employee باستخدام بنية البيانات التي عرّفناها قبل قليل."),"variable",{syntaxRefs:["record"],detail:t("TYPES defines the shape. DATA creates a variable with that shape. Its ID starts at 0 and its name starts empty.","تحدد TYPES شكل البيانات. وتنشئ DATA متغيرًا بهذا الشكل؛ يبدأ رقمه بصفر واسمه بنص فارغ."),practice:t("Which part creates the actual employee record?","أي جزء ينشئ سجل الموظف الفعلي؟")}),
    g("assign",[8,9],t("Assign Values","تعبئة البيانات"),t("Now we give the employee an ID and a name.","الآن نضع رقم الموظف واسمه في الحقول المخصصة لهما."),"assign",{syntaxRefs:["hyphen","equals","string"],practice:t("Which part fills the employee ID and name?","أي جزء يضع رقم الموظف واسمه في السجل؟")}),
    g("output",[11,11],t("Show Output","عرض النتيجة"),t("This displays the employee's name.","هذا الأمر يعرض اسم الموظف."),"output",{syntaxRefs:["write","hyphen"],practice:t("Which part displays Ahmed as output?","أي جزء يعرض Ahmed في المخرجات؟")}),
  ]},
  addition:{fingerprint:"440e7256",groups:[
    g("create",[1,3],t("Create the Variables","إنشاء المتغيرات"),t("Create two quantities starting at 5 and 8, and a result variable starting at 0.","أنشئ متغيرَي كمية يبدأان بـ5 و8، ومتغيرًا للنتيجة يبدأ بصفر."),"variable",{syntaxRefs:["data","type","value","integer"]}),
    g("add",[5,5],t("Calculate the Total","حساب المجموع"),t("Read the two quantities, add them, and store 13 in lv_result.","اقرأ الكميتين واجمعهما، ثم احفظ 13 في lv_result."),"total",{syntaxRefs:["equals","plus"]}),
    g("output",[7,7],t("Display the Value","عرض القيمة"),t("Show the value stored in lv_result. Displaying it does not change it.","اعرض القيمة المحفوظة في lv_result. لا يؤدي عرضها إلى تغييرها."),"output",{syntaxRefs:["write"]}),
  ]},
  conditions:{fingerprint:"aadc4358",checks:["check","true","false"],groups:[
    g("amount",[1,1],t("Set the Amount","تحديد المبلغ"),t("Start lv_amount at 1200 so the program has an amount to check.","ابدأ lv_amount بالقيمة 1200 ليجد البرنامج مبلغًا يفحصه."),"variable"),
    g("check",[3,3],t("Check the Condition","فحص الشرط"),t("Check whether the amount is at least 1000. For 1200, the answer is true.","افحص ما إذا كان المبلغ 1000 أو أكثر. عندما يكون 1200 تكون النتيجة صحيحة."),"condition",{syntaxRefs:["if","compare"]}),
    g("true",[4,4],t("If True","إذا تحقق الشرط"),t("Display Needs approval when the amount reaches the limit.","اعرض Needs approval عندما يبلغ المبلغ الحد المطلوب."),"output"),
    g("false",[5,6],t("If False","إذا لم يتحقق الشرط"),t("Otherwise display Automatically approved. This branch is skipped for 1200.","في الحالة الأخرى اعرض Automatically approved. يتجاوز البرنامج هذا الفرع عندما يكون المبلغ 1200."),"condition",{syntaxRefs:["else"]}),
    g("end",[7,7],t("End the Decision","إنهاء القرار"),t("Finish the IF block. Continue after it once the selected branch is done.","أنه مجموعة IF. يستمر التنفيذ بعدها عند انتهاء الفرع المختار."),"condition",{syntaxRefs:["endif"]}),
  ]},
  do:{fingerprint:"f45189b3",checks:["start","action","end"],groups:[
    g("counter",[1,1],t("Prepare a Counter","إعداد عدّاد"),t("Create lv_count and start it at zero.","أنشئ lv_count وابدأه بصفر."),"variable"),
    g("start",[2,2],t("Start Repeating","بدء التكرار"),t("Repeat the instructions inside this loop ten times.","كرّر التعليمات الموجودة داخل الحلقة عشر مرات."),"repeat",{syntaxRefs:["do","sy-index"]}),
    g("action",[3,4],t("Action to Repeat","العمل المتكرر"),t("Increase the counter by one, then show its new value on each pass.","زد العدّاد بمقدار واحد، ثم اعرض قيمته الجديدة في كل دورة."),"assign"),
    g("end",[5,5],t("Finish the Loop","نهاية الحلقة"),t("Mark the end of the instructions that repeat. Return for another pass until all ten are done.","حدد نهاية التعليمات المتكررة. ارجع لدورة جديدة حتى تكتمل الدورات العشر."),"repeat",{syntaxRefs:["enddo"]}),
  ]},
  while:{fingerprint:"641741b8",checks:["check","update","end"],groups:[
    g("counter",[1,1],t("Start at One","البدء من واحد"),t("Create a counter starting at 1.","أنشئ عدّادًا يبدأ من 1."),"variable"),
    g("check",[2,2],t("Check the Condition","فحص الشرط"),t("Before each pass, check whether the counter is 8 or less. A false answer stops the loop.","قبل كل دورة افحص ما إذا كان العدّاد 8 أو أقل. تتوقف الحلقة عندما لا يتحقق الشرط."),"repeat",{syntaxRefs:["while"]}),
    g("action",[3,3],t("Run the Repeated Action","تنفيذ العمل المتكرر"),t("Show the current counter value while the condition is true.","اعرض قيمة العدّاد الحالية ما دام الشرط متحققًا."),"output"),
    g("update",[4,4],t("Update the Counter","تحديث العدّاد"),t("Add one to the counter so it can eventually reach 9 and make the condition false.","أضف واحدًا إلى العدّاد حتى يصل في النهاية إلى 9، فلا يتحقق الشرط."),"assign"),
    g("end",[5,5],t("Check Again, Then Stop","إعادة الفحص ثم التوقف"),t("Return to the WHILE check. After displaying 8, the counter becomes 9, so no further pass runs.","ارجع لفحص WHILE. بعد عرض 8 يصبح العدّاد 9، فلا تُنفذ دورة أخرى."),"repeat",{syntaxRefs:["while-progress"]}),
  ]},
  tables:{fingerprint:"61bea303",groups:[
    g("create",[1,1],t("Create the Table","إنشاء الجدول"),t("Create an empty standard table for whole numbers.","أنشئ جدولًا قياسيًا فارغًا للأعداد الصحيحة."),"table",{syntaxRefs:["standard-table"]}),
    g("append",[2,4],t("Add Records","إضافة الصفوف"),t("Add 10, 20 and 30 as three separate rows, in that order.","أضف 10 و20 و30 إلى ثلاثة صفوف منفصلة بهذا الترتيب."),"append",{syntaxRefs:["append"]}),
    g("output",[5,5],t("Confirm Readiness","تأكيد الجاهزية"),t("Display Ready. This message does not print the table's rows.","اعرض Ready. هذه الرسالة لا تعرض صفوف الجدول."),"output"),
  ]},
  "loop-at":{fingerprint:"be72e3a2",checks:["read","process","end"],groups:[
    g("create",[1,1],t("Create the Table","إنشاء الجدول"),t("Create a table for the numbers to process.","أنشئ جدولًا للأعداد التي ستعالجها."),"table"),
    g("append",[2,4],t("Add the Numbers","إضافة الأعداد"),t("Store the three numbers 10, 20 and 30 as rows.","احفظ الأعداد الثلاثة 10 و20 و30 في صفوف."),"append"),
    g("prepare",[5,6],t("Prepare the Work Area and Total","إعداد منطقة العمل والمجموع"),t("Create a place for the current number and start the running total at zero.","أنشئ موضعًا للعدد الحالي وابدأ المجموع بصفر."),"variable"),
    g("read",[7,7],t("Start Reading Rows","بدء قراءة الصفوف"),t("Read each table row into lv_number, one at a time.","اقرأ كل صف في الجدول إلى lv_number، صفًا بعد آخر."),"read",{syntaxRefs:["loop-at","inline-row"]}),
    g("process",[8,8],t("Process the Current Row","معالجة الصف الحالي"),t("Add the current number to the running total.","أضف العدد الحالي إلى المجموع المتراكم."),"total"),
    g("end",[9,9],t("Move to the Next Row","الانتقال إلى الصف التالي"),t("Read the next row. When no rows remain, finish the loop.","اقرأ الصف التالي. عندما لا يبقى صف، أنه الحلقة."),"read",{syntaxRefs:["endloop"]}),
    g("output",[10,10],t("Display the Total","عرض المجموع"),t("Display 60 once, after all three rows have contributed.","اعرض 60 مرة واحدة بعد جمع قيم الصفوف الثلاثة."),"output"),
  ]},
  "loop-control":{fingerprint:"80a84917",checks:["skip","output","end"],groups:[
    g("start",[1,2],t("Prepare Five Passes","إعداد خمس دورات"),t("Start a counter at zero and repeat the loop five times.","ابدأ عدّادًا بصفر وكرّر الحلقة خمس مرات."),"repeat"),
    g("update",[3,3],t("Advance the Counter","زيادة العدّاد"),t("Increase the counter before deciding whether this item should be shown.","زد العدّاد قبل تحديد ما إذا كان هذا العنصر سيُعرض."),"assign"),
    g("skip",[4,6],t("Skip One Pass","تجاوز دورة واحدة"),t("When the counter is 3, skip the rest of this pass. The next pass still happens.","عندما يكون العدّاد 3، تجاوز بقية هذه الدورة. تظل الدورة التالية ممكنة."),"control",{syntaxRefs:["continue","exit"]}),
    g("output",[7,7],t("Show Other Values","عرض القيم الأخرى"),t("Show the current value only if CONTINUE did not skip this line.","اعرض القيمة الحالية فقط إذا لم تتجاوز CONTINUE هذا السطر."),"output"),
    g("end",[8,8],t("Finish the Repeated Block","إنهاء جسم الحلقة"),t("Return for the next pass until all five have been considered.","ارجع للدورة التالية حتى تمر الدورات الخمس."),"repeat"),
  ]},
  employees:{fingerprint:"b3735dc7",checks:["load","rule","output"],groups:[
    g("shape",[1,5],t("Describe an Employee","وصف بيانات الموظف"),t("Define a row with an ID, name and salary. This describes a type, not an employee in memory.","عرّف صفًا يحتوي على رقم واسم وراتب. هذا وصف لنوع، وليس سجل موظف في الذاكرة."),"type",{visualizer:{kind:"type",line:5}}),
    g("containers",[6,7],t("Create the Register and Work Area","إنشاء السجل ومنطقة العمل"),t("Create an empty employee table and a separate work area for one employee.","أنشئ جدول موظفين فارغًا ومنطقة عمل مستقلة لموظف واحد."),"table"),
    g("load",[8,19],t("Fill the Register","تعبئة سجل الموظفين"),t("Fill the work area for Ahmed, Sara and Omar, copying each employee into a new row.","املأ منطقة العمل ببيانات Ahmed وSara وOmar، وانسخ بيانات كل موظف إلى صف جديد."),"append"),
    g("total",[20,20],t("Prepare a Salary Total","إعداد مجموع الرواتب"),t("Start the total at zero before processing employees.","ابدأ المجموع بصفر قبل معالجة الموظفين."),"total"),
    g("read",[21,21],t("Read Each Employee","قراءة كل موظف"),t("Copy each employee row into the work area for processing.","انسخ كل صف موظف إلى منطقة العمل لمعالجته."),"read"),
    g("rule",[22,25],t("Apply the Salary Rule","تطبيق قاعدة الراتب"),t("For a salary of at least 5000, display the name and add the salary to the total. Other employees contribute nothing.","إذا كان الراتب 5000 أو أكثر، اعرض الاسم وأضف الراتب إلى المجموع. لا تدخل رواتب الموظفين الآخرين في المجموع."),"condition"),
    g("end",[26,26],t("Finish Processing Rows","إنهاء معالجة الصفوف"),t("Move to another employee or leave the loop when none remain.","انتقل إلى موظف آخر، أو اخرج من الحلقة إذا لم يبقَ موظف."),"read"),
    g("output",[27,27],t("Show the Report Total","عرض مجموع التقرير"),t("Display 12000 after the included employees' names.","اعرض 12000 بعد أسماء الموظفين المشمولين."),"output"),
  ]},
  "data-table-model":{fingerprint:"cf0e3e3c",checks:["copies","change","read"],groups:[
    g("shape",[1,4],t("Describe a Product","وصف بيانات المنتج"),t("Define the ID and name fields shared by every product row.","حدد حقلي الرقم والاسم المشتركين بين صفوف المنتجات."),"type",{visualizer:{kind:"type",line:4}}),
    g("containers",[5,6],t("Create Storage","إنشاء مواضع الحفظ"),t("Create an empty product table and one separate product work area.","أنشئ جدول منتجات فارغًا ومنطقة عمل مستقلة لمنتج واحد."),"table"),
    g("copies",[7,10],t("Store Two Copies","حفظ نسختين"),t("Fill product 501, Keyboard, then append that value twice. Both identical rows are kept.","املأ بيانات المنتج 501، Keyboard، ثم أضف هذه القيمة مرتين. يُحفظ الصفان المتطابقان."),"append"),
    g("change",[11,11],t("Change Only the Work Area","تغيير منطقة العمل فقط"),t("Change the work-area name to Mouse. The two stored names stay Keyboard.","غيّر الاسم في منطقة العمل إلى Mouse. يبقى الاسمان المحفوظان Keyboard."),"assign"),
    g("read",[12,12],t("Read the Stored Copies","قراءة النسخ المحفوظة"),t("Copy each stored row back into the work area in turn.","انسخ كل صف محفوظ إلى منطقة العمل بالتتابع."),"read"),
    g("output",[13,13],t("Display the Stored Name","عرض الاسم المحفوظ"),t("Display Keyboard for each stored row, rather than the earlier Mouse value.","اعرض Keyboard لكل صف محفوظ، بدل قيمة Mouse السابقة في منطقة العمل."),"output"),
    g("end",[14,14],t("Finish Reading","إنهاء القراءة"),t("Move to the next stored row, then finish after both have been read.","انتقل إلى الصف المحفوظ التالي، ثم أنه الحلقة بعد قراءة الصفين."),"read"),
  ]},
  "data-table-categories":{fingerprint:"98cc8c6b",checks:["append","read","end"],groups:[
    g("create",[1,2],t("Create a Standard Sequence","إنشاء تسلسل قياسي"),t("Create a standard integer table and a work area. This executable example uses only the standard-table category.","أنشئ جدولًا قياسيًا للأعداد الصحيحة ومنطقة عمل. يستخدم هذا المثال القابل للتنفيذ فئة الجدول القياسي فقط."),"table",{syntaxRefs:["standard-table","sorted-category","hashed-category"],detail:t("The optional sorted/hashed declarations are SAP reference material. Use the lesson's conceptual comparison to explore those categories; this editor does not execute them.","تعريفات SORTED وHASHED الاختيارية أمثلة مرجعية لنظام SAP. استخدم المقارنة المفاهيمية في الدرس لاستكشافهما؛ فهذا المحرر لا ينفذهما.")}),
    g("append",[3,5],t("Keep the Incoming Order","الاحتفاظ بترتيب الوصول"),t("Store 30, 10 and 30 in that order. This standard table keeps both copies of 30.","احفظ 30 ثم 10 ثم 30. يحتفظ هذا الجدول القياسي بنسختي القيمة 30."),"append"),
    g("read",[6,6],t("Read Each Row","قراءة كل صف"),t("Read the stored sequence into lv_id one row at a time.","اقرأ التسلسل المحفوظ إلى lv_id، صفًا بعد آخر."),"read"),
    g("output",[7,7],t("Display the Current ID","عرض المعرّف الحالي"),t("Display the current stored value. The output preserves the incoming order.","اعرض القيمة المحفوظة الحالية. تحافظ المخرجات على ترتيب الوصول."),"output"),
    g("end",[8,8],t("Finish the Sequence","إنهاء قراءة التسلسل"),t("Move to the next row until all three values have been displayed.","انتقل إلى الصف التالي حتى تُعرض القيم الثلاث."),"read"),
  ]},
};

export const orientationExamples = {en:"* My first ABAP statement\nWRITE\n  5.",ar:"* أول تعليمة ABAP\nWRITE\n  5."};
function orientationDoc(lang:"en"|"ar") {
  return defineAnatomy("orientation",orientationExamples[lang],lang === "en" ? "c678027c" : "10137df9",[
    g("comment",[1,1],t("A Note for the Reader","ملاحظة للقارئ"),t("This comment describes the example. The program does not execute it.","يصف هذا التعليق المثال. لا ينفذه البرنامج."),"comment",{visualizer:undefined,syntaxRefs:["comments"],detail:t("An asterisk at the start of a source line marks a full-line comment.","تشير النجمة في بداية سطر الشيفرة إلى أن السطر تعليق كامل.")}),
    g("output",[2,3],t("One Complete Instruction","تعليمة واحدة مكتملة"),t("Display the number 5. These two lines form one WRITE statement, ending at the period.","اعرض العدد 5. يشكل هذان السطران تعليمة WRITE واحدة تنتهي بالنقطة."),"output",{syntaxRefs:["keyword","period"]}),
  ],["output","comment"]);
}
const documents = new Map<string,CodeAnatomy>();
for(const mission of missions) {
  const spec=definitions[mission.id];
  if(!spec) throw new Error(`${mission.id}: add reviewed Code Anatomy before registering this lesson`);
  for(const group of spec.groups) for(const ref of group.glossaryRefs || []) if(!anatomyConcepts[ref]) throw new Error(`Unknown anatomy concept: ${ref}`);
  documents.set(mission.id,defineAnatomy(mission.id,mission.example,spec.fingerprint,spec.groups,spec.checks || spec.groups.map(g=>g.id)));
}
export function getAnatomy(id:string,source:string):CodeAnatomy {
  const doc=id === "orientation" ? orientationDoc(source === orientationExamples.ar ? "ar" : "en") : documents.get(id);
  if(!doc || doc.source !== source) throw new Error(`${id}: no reviewed anatomy for displayed source`);
  return doc;
}

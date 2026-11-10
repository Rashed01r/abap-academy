# ABAP Cloud and RAP: ADT, business objects, behavior definitions, EML, service bindings, BTP

Researched 2026-11-10 for `cloud-introduction`, `cloud-adt`, `cloud-rap-bo`, `cloud-behavior`, `cloud-eml`,
`cloud-service-bindings`, `cloud-btp`. help.sap.com renders with JavaScript and comes back empty from WebFetch; facts
below come from the SAP-samples cheat sheets (raw GitHub, downloaded and read) and are labelled when from general SAP knowledge.

## ABAP for Cloud Development: `19_ABAP_for_Cloud_Development.md`
https://raw.githubusercontent.com/SAP-samples/abap-cheat-sheets/main/19_ABAP_for_Cloud_Development.md
- ADT (ABAP Development Tools for Eclipse) is the only supported tool for ABAP Cloud development; RAP is its transactional model.
- Released objects: ADT Project Explorer > Released Objects; class Properties > API State shows the release contract (example `CL_ABAP_RANDOM_INT`, contract C1). Ctrl+Shift+A opens object search.
- Class-run: `IF_OO_ADT_CLASSRUN`, `out->write( )`, run with F9. Executable programs (reports) and `WRITE` list output are not allowed in the restricted scope.
- ATC with the cloud readiness check lists findings in the ATC Problems view; classic code produces errors and warnings.
- Environments named: SAP S/4HANA Cloud Public Edition and Private Edition (released APIs on api.sap.com), ABAP environment accessed via ADT. Product names change: tell learners to check their landscape.

## RAP BDL: `36_RAP_Behavior_Definition_Language.md`
https://raw.githubusercontent.com/SAP-samples/abap-cheat-sheets/main/36_RAP_Behavior_Definition_Language.md
- A RAP BO is a tree of CDS entities; the root uses `define root view entity`; children use composition / `association to parent`.
- Layers: tables/CDS (data), BDEF + behavior pool (behavior), service definition + service binding (service). BDEF normally has the root entity's name.
- Header: `managed implementation in class ... unique;`, `strict ( 2 );`, `with draft;`. `unmanaged` = you provide the transactional buffer and every operation (brownfield); managed = greenfield. `with unmanaged save` / `with additional save` exist.
- Characteristics: `persistent table` (managed only), `lock master`, `lock dependent by _Assoc`, `authorization master ( instance )`, etag. Body: `field ( readonly | mandatory )`, `create; update; delete;`, `validation x on save { ... }`, `determination y on modify { ... }`, `internal action`, `association _X { create; }`.
- Service binding: binds a service definition to a protocol and publishes it (UI or OData service).

## EML: `08_EML_ABAP_for_RAP.md`
https://raw.githubusercontent.com/SAP-samples/abap-cheat-sheets/main/08_EML_ABAP_for_RAP.md
- EML = ABAP subset to access RAP BOs. `MODIFY ENTITIES` (create, update, delete, execute) and `READ ENTITIES` act on the transactional buffer; modifying operations are NOT enabled by default, they must be in the BDEF.
- Response parameters `MAPPED`, `FAILED`, `REPORTED`; derived types such as `TYPE TABLE FOR CREATE`, `TYPE RESPONSE FOR FAILED`.
- `COMMIT ENTITIES` triggers the RAP save sequence and implicitly includes `COMMIT WORK`; it sets `sy-subrc` (check it); it cannot be used in behavior implementations; in natively supported scenarios such as OData the RAP runtime does it automatically. `ROLLBACK ENTITIES` exists.
- `IN LOCAL MODE` / `PRIVILEGED` are for behavior pools (ABP), which have enhanced access.

## From general SAP knowledge (not in the cheat sheets; flagged in the lessons as "check in your system")
- Projection views use `provider contract transactional_query ... as projection on`; projection BDEF uses `projection;` and `use create/update/delete`.
- Service binding types: OData V4 - UI, OData V4 - Web API (and V2 variants); a binding must be activated and then published to have a service URL.
- Exposure is not authorization: CDS access control (DCL) and BDEF authorization are separate.
- Communication management: communication scenario (design time, lists inbound/outbound services), communication arrangement (scenario + communication system + user, created by an administrator). Code gets a destination with `CL_HTTP_DESTINATION_PROVIDER=>CREATE_BY_COMM_ARRANGEMENT` and `CL_WEB_HTTP_CLIENT_MANAGER=>CREATE_BY_HTTP_DESTINATION`.
- Not verified against a live system: exact ADT menu names, ATC check variant label, `PA0001`/`HR_READ_INFOTYPE`/`POPUP_TO_CONFIRM` being unreleased.

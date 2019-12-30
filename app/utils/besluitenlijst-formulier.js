export default `@prefix form: <http://lblod.data.gift/vocabularies/forms/> .
@prefix sh: <http://www.w3.org/ns/shacl#>.
@prefix dct: <http://purl.org/dc/terms/> .
@prefix mu: <http://mu.semte.ch/vocabularies/core/> .
@prefix : <http://data.lblod.info/forms/> .
@prefix fieldGroups: <http://data.lblod.info/field-groups/> .
@prefix fields: <http://data.lblod.info/fields/> .
@prefix displayTypes: <http://lblod.data.gift/display-types/> .
@prefix eli: <http://data.europa.eu/eli/ontology#>.
@prefix besluit: <http://data.vlaanderen.be/ns/besluit#>.
@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.
@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.
@prefix prov: <http://www.w3.org/ns/prov#>.

:besluitenlijst a form:Form ;
    mu:uuid "a0a120d2-87a8-4f45-a61b-61654997cf1e" ;
    form:hasFieldGroup fieldGroups:besluitenlijstMain .

fieldGroups:besluitenlijstMain a form:FieldGroup ;
    mu:uuid "6e8bb26a-0f95-4c0e-b1a9-188430c4b7af" ;
    form:hasField fields:submissionType, fields:administrativeBody, fields:meetingDate, fields:publicationDate, fields:filesAndLinks .

fields:submissionType a form:Field ;
    mu:uuid "0827fafe-ad19-49e1-8b2e-105d2c08a54a" ;
    sh:name "Type dossier" ;
    sh:order 1 ;
    sh:path rdf:type ;
    form:validations
      [ a form:RequiredConstraint ;
        form:grouping form:Bag ;
        sh:path rdf:type ],
      [ a form:SingleCodelistValue ;
        form:grouping form:Bag ;
        sh:path rdf:type ;
        form:conceptScheme <https://data.vlaanderen.be/id/conceptscheme/BesluitDocumentType> ;
        form:customValue <http://data.lblod.info/DecisionType/46b254008bbca1354e632dc40cf550c6b313e523799cafd7200a48a19e09249f> ] ;
    form:displayType displayTypes:defaultInput ;
    form:options """{ value: \"http://data.lblod.info/DecisionType/46b254008bbca1354e632dc40cf550c6b313e523799cafd7200a48a19e09249f\" }""" .

fields:administrativeBody a form:Field ;
    mu:uuid "bffbea8d-e55b-4e3d-86e8-ba7aaee7863d" ;
    sh:name "Bestuursorgaan" ;
    sh:order 2 ;
    sh:path eli:passed_by ;
    form:validations
      [ a form:AdminstrativeUnitCodelistConstraint ;
        form:grouping form:MatchEvery ;
        sh:path eli:passed_by ],
      [ a form:RequiredConstraint ;
        form:grouping form:Bag ;
        sh:path eli:passed_by ] ;
    form:displayType displayTypes:bestuursorgaanSelect .

fields:meetingDate a form:Field ;
    mu:uuid "3dd6ed93-40f7-4d70-a6cb-f4de53dc8bfb" ;
    sh:name "Zittingsdatum" ;
    sh:order 3 ;
    sh:path ( [ sh:inversePath besluit:heeftBesluitenlijst ] prov:startedAtTime ) ;
    form:validations
      [ a form:RequiredConstraint ;
        form:grouping form:Bag ;
        sh:path ( [ sh:inversePath besluit:heeftBesluitenlijst ] prov:startedAtTime ) ],
      [ a sh:PropertyShape ;
        form:grouping form:MatchEvery ;
        sh:path ( [ sh:inversePath besluit:heeftBesluitenlijst ] prov:startedAtTime ) ;
        sh:dataType xsd:dateTime ;
        sh:nodeKind sh:Literal ] ;
    form:displayType displayTypes:dateTime .

fields:publicationDate a form:Field ;
    mu:uuid "0a63d06f-235c-463c-9ffb-fe31647517b6" ;
    sh:name "Publicatiedatum" ;
    sh:order 4 ;
    sh:path eli:date_publication ;
    form:validations
      [ a form:RequiredConstraint ;
        form:grouping form:Bag ;
        sh:path eli:date_publication ],
      [ a sh:PropertyShape ;
        form:grouping form:MatchSome ;
        sh:path eli:date_publication ;
        sh:dataType xsd:date ;
        sh:nodeKind sh:Literal ] ;
    form:displayType displayTypes:date .

fields:filesAndLinks a form:Field ;
    mu:uuid "fd7422a5-da17-4b20-a4dd-a364b77178bf" ;
    sh:name "Bestanden of URLs" ;
    sh:order 5 ;
    form:validations [
        a form:FilesOrLinksConstraint ;
        form:grouping form:Bag ] ;
    form:displayType displayTypes:filesAndLinks .
`;

import rdflib from './rdflib';

const RDF = new rdflib.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const FORM = new rdflib.Namespace("http://lblod.data.gift/vocabularies/forms/");
const SHACL = new rdflib.Namespace("http://www.w3.org/ns/shacl#");

export { RDF, FORM, SHACL };

import { inject as service } from '@ember/service';
import { getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import rdflib from '../utils/rdflib';
import dilbeek from '../utils/dilbeek';
import form from '../utils/besluitenlijst-formulier';
import documentTypeCodelist from '../utils/codelist/document-type';
import importTriplesForForm from '../utils/import-triples-for-form';
import { triplesForPath, fieldsForForm } from '../utils/import-triples-for-form';
import { RDF, FORM, SHACL } from '../utils/namespaces';
import constraintForUri from '../utils/constraints';
import { check } from '../utils/constraints';
import { createPropertyTreeFromFields } from '../utils/model-factory';

const dedup = function(arr){
  return [...new Set(arr)];
};

const FORM_GRAPH = new rdflib.NamedNode("http://mu.semte.ch/form");
const SOURCE_GRAPH = new rdflib.NamedNode("http://mu.semte.ch/dilbeek");
const SOURCE_NODE = new rdflib.NamedNode("http://mu.semte.ch/vocabularies/ext/besluitenlijsten/208ee6e0-28b1-11ea-972c-8915ff690069");
const META_GRAPH = new rdflib.NamedNode("http://mu.semte.ch/metagraph");

export default class GimmeRdflibComponent extends Component {
  @service store;

  @tracked
  datasetTriples = [];

  @tracked
  statements = [];

  @tracked
  forms = [];

  @tracked
  smallTable = false;

  @tracked
  formsRelatedTriples = [];

  @tracked
  formFieldsData = [];

  @tracked
  validatedFormFieldsData = [];

  @tracked
  propertyGroups = [];

  get largeTable(){
    return !this.smallTable;
  }

  // constructor(){
  //   super(...arguments);
  //   this.store.rdf = rdflib.graph();
  // }

  get graphGroupedTriples(){
    let graphs = this
      .statements
      .map( ({graph}) => graph.value );
    graphs = dedup(graphs);

    const response = graphs.map( (graph) => {
      return {
        graph,
        triples: this
          .statements
          .filter( ({graph: { value } }) => graph == value )
          .sort( (a,b) => a.subject.value < b.subject.value )
      };
    });

    return response;
  }

  @action
  loadData(){
    // this.store.clear();
    rdflib.parse( dilbeek, this.store.graph, "http://mu.semte.ch/dilbeek", "text/html" );
    rdflib.parse( form, this.store.graph, "http://mu.semte.ch/form", "text/turtle" );
    rdflib.parse( documentTypeCodelist, this.store.graph, "http://mu.semte.ch/metagraph", "text/turtle" );

    this.statements = this.store.graph.statements;
  }

  @action
  findForms(){
    this.forms = this
      .store.graph
      .match(undefined, RDF("type"), FORM("Form"));
  }

  @action
  findFormsRelatedTriples(){
    const relatedTriples = this
      .forms
      .map( ({subject}) => {
        return this
          .store.graph
          .match(subject, undefined, undefined);
      });

    this.formsRelatedTriples = [].concat(...relatedTriples);
  }

  @action
  walkForms(){
    const FORM_GRAPH = new rdflib.NamedNode("http://mu.semte.ch/form");
    const SOURCE_GRAPH = new rdflib.NamedNode("http://mu.semte.ch/dilbeek");
    const SOURCE_NODE = new rdflib.NamedNode("http://mu.semte.ch/vocabularies/ext/besluitenlijsten/208ee6e0-28b1-11ea-972c-8915ff690069");

    this.datasetTriples = importTriplesForForm({
      store: this.store.graph,
      formGraph: FORM_GRAPH,
      sourceGraph: SOURCE_GRAPH,
      sourceNode: SOURCE_NODE,
      metaGraph: META_GRAPH
    } );

    console.log("Done!");
  }

  @action
  toggleTableSize(){
    this.smallTable = !this.smallTable;
  }

  @action
  renderForms(){
    let fieldsUri = fieldsForForm({
      store: this.store.graph,
      formGraph: FORM_GRAPH,
      sourceGraph: SOURCE_GRAPH,
      sourceNode: SOURCE_NODE,
      metaGraph: META_GRAPH
    });

    this.formFieldsData = fieldsUri.map(this.generateFormFieldData.bind(this));
  }

  generateFormFieldData(uri){
    let path = this.store.graph.any( uri, SHACL("path"), undefined, FORM_GRAPH);
    let displayType = this.store.graph.any( uri, FORM("displayType"), undefined, FORM_GRAPH);

    let values = triplesForPath({
      store: this.store.graph, path, formGraph: FORM_GRAPH, sourceNode: SOURCE_NODE, sourceGraph: SOURCE_GRAPH
    }).values;

    return { uri, displayType, values };

  }

  @action
  validateForms(){

    let fieldsUri = fieldsForForm({
      store: this.store.graph,
      formGraph: FORM_GRAPH,
      sourceGraph: SOURCE_GRAPH,
      sourceNode: SOURCE_NODE,
      metaGraph: META_GRAPH
    });

    let formFieldsData = [];

    for(let uri of fieldsUri){

      let path = this.store.graph.any( uri, SHACL("path"), undefined, FORM_GRAPH);

      let validationConstraintUris = this.store.graph
                                         .match( uri, FORM("validations"), undefined, FORM_GRAPH)
                                         .map(t => t.object);

      let validationResults = [];

      for(let constraintUri of validationConstraintUris){
        const options = { store: this.store.graph, metaGraph: META_GRAPH, constraintUri: constraintUri };
        const validationResult = check( constraintUri, options);
        validationResults.push(validationResult);
      }

      console.log({validationResults});

      const formData = this.generateFormFieldData(uri);
      formData.validationsResult = validationResults;
      formFieldsData.push(formData);
    };

    this.validatedFormFieldsData = formFieldsData;
  }

  @action
  getPropertyGroups() {
    let fieldUris = fieldsForForm({
      store: this.store.graph,
      formGraph: FORM_GRAPH,
      sourceGraph: SOURCE_GRAPH,
      sourceNode: SOURCE_NODE,
      metaGraph: META_GRAPH
    });

    this.propertyGroups = createPropertyTreeFromFields( fieldUris, this.store, FORM_GRAPH );
  }

  lookupModel() {
    const owner = getOwner(this);
    console.log(owner);
    const model = owner.lookup('model:semantic-model');
    console.log(model);
    const fieldModel = owner.lookup('model:form/field');
    console.log(fieldModel);
    const myFormField = new fieldModel("http://foo.bar.com/", { store: undefined });
    console.log(myFormField);
  }
}

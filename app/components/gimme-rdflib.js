import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import rdflib from '../utils/rdflib';
import dilbeek from '../utils/dilbeek';
import form from '../utils/besluitenlijst-formulier';
import importTriplesForForm from '../utils/import-triples-for-form';
import { RDF, FORM, SHACL } from '../utils/namespaces';

const dedup = function(arr){
  return [...new Set(arr)];
};

export default class GimmeRdflibComponent extends Component {
  store = null;

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

  get largeTable(){
    return !this.smallTable;
  }

  constructor(){
    super(...arguments);
    this.store = rdflib.graph();
  }

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
    rdflib.parse( dilbeek, this.store, "http://mu.semte.ch/dilbeek", "text/html" );
    rdflib.parse( form, this.store, "http://mu.semte.ch/form", "text/turtle" );

    this.statements = this.store.statements;

    // const BESLUIT = new rdflib.Namespace("http://data.vlaanderen.be/ns/besluit#");
    // console.log(this.store.any(undefined, BESLUIT("bestuurt"), undefined));
  }

  @action
  findForms(){
    this.forms = this
      .store
      .match(undefined, RDF("type"), FORM("Form"));
  }

  @action
  findFormsRelatedTriples(){
    const relatedTriples = this
      .forms
      .map( ({subject}) => {
        return this
          .store
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
      store: this.store,
      formGraph: FORM_GRAPH,
      sourceGraph: SOURCE_GRAPH,
      sourceNode: SOURCE_NODE
    } );

    console.log("Done!");
  }

  @action
  toggleTableSize(){
    this.smallTable = !this.smallTable;
  }
}

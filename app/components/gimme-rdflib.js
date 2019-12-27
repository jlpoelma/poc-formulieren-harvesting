import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import rdflib from '../utils/rdflib';
import dilbeek from '../utils/dilbeek';
import form from '../utils/besluitenlijst-formulier';

const dedup = function(arr){
  return [...new Set(arr)];
}

const RDF = new rdflib.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");
const FORM = new rdflib.Namespace("http://lblod.data.gift/vocabularies/forms/");
const SHACL = new rdflib.Namespace("http://www.w3.org/ns/shacl#");

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
    // setup
    const FORM_GRAPH = new rdflib.NamedNode("http://mu.semte.ch/form");
    const SOURCE_GRAPH = new rdflib.NamedNode("http://mu.semte.ch/dilbeek");
    const SOURCE_NODE = new rdflib.NamedNode("http://mu.semte.ch/vocabularies/ext/besluitenlijsten/208ee6e0-28b1-11ea-972c-8915ff690069");
    this.datasetTriples = [];

    // get form
    const forms = this
          .store
          .match(undefined, RDF("type"), FORM("Form"), FORM_GRAPH)
          .map(({subject}) => subject);

    // get field groups
    let fieldGroups = forms.map( (form) => this.store.match( form, FORM("hasFieldGroup"), undefined, FORM_GRAPH ) );
    fieldGroups = [].concat(...fieldGroups);
    fieldGroups = fieldGroups.map( ({object}) => object );

    // get fields
    let fields = fieldGroups.map( (fieldGroup) => this
                                  .store
                                  .match( fieldGroup, FORM("hasField"), undefined, FORM_GRAPH )
                                  .map( ({object}) => object ) );
    fields = [].concat(...fields);

    for( let field of fields ) {
      let path = this.store.any( field, SHACL("path"), undefined, FORM_GRAPH );

      if( path && path.termType === "Collection" ) {
        // INGEST COMPLEX PATH
        console.log(path);

        const pathElements =
              path
              .elements
              .map( (element) => {
                if( element.termType == "NamedNode" ) {
                  return { path: element };
                } else {
                  const elementInfo = this.store.any( element, SHACL("inversePath"), undefined, FORM_GRAPH );
                  return { inversePath: elementInfo };
                }
              } );

        let startingPoints = [ SOURCE_NODE ];
        let nextPathElements = pathElements;
        while( startingPoints && nextPathElements.length ) {
          let [ currentPathElement, ...restPathElements ] = nextPathElements;
          let nextStartingPoints = [];
          
          for( let startingPoint of startingPoints ) {
            if( currentPathElement.inversePath ) {
              this
                .store
                .match( undefined, currentPathElement.inversePath, startingPoint, SOURCE_GRAPH )
                .map( (triple) => {
                  this.datasetTriples.push(triple);
                  nextStartingPoints.push( triple.subject );
                });
            } else {
              this
                .store
                .match( startingPoint, currentPathElement.path, undefined, SOURCE_GRAPH )
                .map( (triple) => {
                  this.datasetTriples.push(triple);
                  nextStartingPoints.push( triple.object );
                });
            }
          }

          startingPoints = nextStartingPoints;
          nextPathElements = restPathElements;
        }
        
      } else {
        // INGEST SIMPLE PATH
        if( path ) {
          this
            .store
            .match(SOURCE_NODE, path, undefined, SOURCE_GRAPH)
            .map( (item) => {
              // console.log( item );
              this.datasetTriples.push(item);
            } );
        }
      }
    }

    console.log( this.datasetTriples );
  }

  @action
  toggleTableSize(){
    this.smallTable = !this.smallTable;
  }
}

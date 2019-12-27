import { RDF, FORM, SHACL } from '../utils/namespaces';

function importTriplesForForm( { store, formGraph, sourceGraph, sourceNode } ) {
  let datasetTriples = [];

  for( let field of fieldsForForm( { store, formGraph } ) ) {
    let path = store.any( field, SHACL("path"), undefined, formGraph );
    triplesForPath({ path, store, formGraph, sourceNode, sourceGraph })
      .triples
      .forEach( (item) => datasetTriples.push(item) );
  }

  return datasetTriples;
}

function fieldsForForm( options ) {
  let { store, formGraph } = options;

  // get form
  const forms = store
        .match(undefined, RDF("type"), FORM("Form"), formGraph)
        .map(({subject}) => subject);

  // get field groups
  let fieldGroups = forms.map( (form) => store.match( form, FORM("hasFieldGroup"), undefined, formGraph ) );
  fieldGroups = [].concat(...fieldGroups);
  fieldGroups = fieldGroups.map( ({object}) => object );

  // get fields
  let fields = fieldGroups.map( (fieldGroup) => store
                                .match( fieldGroup, FORM("hasField"), undefined, formGraph )
                                .map( ({object}) => object ) );
  return [].concat(...fields);
}

function triplesForPath( options ){
  const { store, path, formGraph, sourceNode, sourceGraph } = options;
  
  let solutions = {};

  if( path && path.termType === "Collection" ) {
    return triplesForComplexPath( options );
  } else {
    return triplesForSimplePath( options );
  }
}

function triplesForSimplePath( options ) {
  const { store, path, formGraph, sourceNode, sourceGraph } = options;
  let datasetTriples = [];

  if( path ) {
    store
      .match(sourceNode, path, undefined, sourceGraph)
      .map( (item) => {
        datasetTriples.push(item);
      } );
  }
  return { triples: datasetTriples, values: datasetTriples.map( ({object}) => object ) };
}

function triplesForComplexPath( options ) {
  const { store, path, formGraph, sourceNode, sourceGraph } = options;
  let datasetTriples = [];
  
  // Convert PATH list to comprehensible objects
  const pathElements =
        path
        .elements
        .map( (element) => {
          if( element.termType == "NamedNode" ) {
            return { path: element };
          } else {
            const elementInfo = store.any( element, SHACL("inversePath"), undefined, formGraph );
            return { inversePath: elementInfo };
          }
        } );

  // Walk over each part of the path list
  let startingPoints = [ sourceNode ];
  let nextPathElements = pathElements;
  while( startingPoints && nextPathElements.length ) {
    // walk one segment of the path list
    let [ currentPathElement, ...restPathElements ] = nextPathElements;
    let nextStartingPoints = [];
    
    for( let startingPoint of startingPoints ) {
      if( currentPathElement.inversePath ) {
        // inverse path, walk in other direction
        store
          .match( undefined, currentPathElement.inversePath, startingPoint, sourceGraph )
          .map( (triple) => {
            datasetTriples.push(triple);
            nextStartingPoints.push( triple.subject );
          });
      } else {
        // regular path, walk in normal direction
        store
          .match( startingPoint, currentPathElement.path, undefined, sourceGraph )
          .map( (triple) => {
            datasetTriples.push(triple);
            nextStartingPoints.push( triple.object );
          });
      }
    }

    // update state for next loop
    startingPoints = nextStartingPoints;
    nextPathElements = restPathElements;
  }

  // (this is reduntant, if there are no startingPoints values will
  // always be an array, but it's more obvious ;-)
  if( nextPathElements.length == 0 )
    return { triples: datasetTriples, values: startingPoints };
  else
    return { triples: datasetTriples, values: [] };
}

export default importTriplesForForm;
export { triplesForPath, fieldsForForm };

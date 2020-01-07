import { inject as service } from '@ember/service';
import { setOwner, getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import { get, set } from '@ember/object';
import { XSD, RDF } from '../utils/namespaces';
import rdflib from '../utils/rdflib';

function cacheKeyForAttr( attr ) {
  return `#cache__${attr}`;
}

function calculatePropertyValue( target, propertyName ) {
  let value;
  const options = target.attributeDefinitions[propertyName];
  const predicate = calculatePredicateForProperty( target, propertyName );
  const graph = options.graph;
  const response = options.inverse ? target.store.graph.any(undefined, predicate, target.uri, graph || target.defaultGraph) : target.store.graph.any(target.uri, predicate, undefined, graph || target.defaultGraph);
  
  const createRelatedRecordOptions = { defaultGraph: options.propagateDefaultGraph ? target.defaultGraph : undefined };

  switch (options.type) {
  case "string":
    value = response && response.value;
    break;
  case "integer":
    value = response && parseInt( response.value );
    break;
  case "term":
    value = response;
    break;
  case "dateTime":
    value = response && new Date(value);
    break;
  case "belongsTo":
    value = response && target.store.create( options.model, response, createRelatedRecordOptions );
    break;
  case "hasMany":
    var matches;
    if( options.inverse ) {
      matches =
        target
        .store.graph
        .match( undefined, predicate, target.uri, graph || target.defaultGraph )
        .map( ({subject}) => subject );
    } else {
      matches =
        target
        .store.graph
        .match( target.uri, predicate, undefined, graph || target.defaultGraph )
        .map( ({object}) => object );
    }

    value =
      matches
      .map( (uri) =>
            target.store.create( options.model, uri, createRelatedRecordOptions ) );
    break;
  case undefined:
    value = response && response.value;
    break;
  }

  return value;
}

function updatePropertyValue( entity, propertyName ) {
  const cacheKey = cacheKeyForAttr( propertyName );
  const newValue = calculatePropertyValue( entity, propertyName );
  set( entity, cacheKey, newValue );
}

function calculatePredicateForProperty( entity, propertyName ) {
  const options = entity.attributeDefinitions[propertyName];
  return options.predicate || ( options.ns && options.ns( propertyName ) ) || entity.defaultNamespace( propertyName );
}

function property(options = {}) {
  const predicateUri = options.predicate;
  const graph = options.graph;

  return function(self, propertyName, descriptor) {
    self.attributes = self.attributes ? self.attributes : [];
    self.attributes.push( propertyName );

    const cacheKey = cacheKeyForAttr( propertyName );

    self.attributeDefinitions = self.attributeDefinitions || {};
    self.attributeDefinitions[propertyName] = Object.assign({ cacheKey }, options);

    const calculatePredicate = function(entity){
      return calculatePredicateForProperty( entity, propertyName );
    };

    // Object.defineProperty( self, cacheKey, { enumerable: false, writable: true } );

    // The current implementation does a get/set of the property
    // "cacheKey" which will make this autotrack the cached property.
    // As such we don't need to manually call notifyPropertyChange.
    // This does mean that we're trying to be smart about reading the
    // property so that we don't accidentally overlap.

    return {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      get() {
        if( this[cacheKey] !== undefined ) {
          return get( this, cacheKey ); // register as a dependency
        } else {
          let value = calculatePropertyValue( this, propertyName );
          set( this, cacheKey, value );
          return get( this, cacheKey ); // register as a dependency after setting
        }
      },
      set(value) {
        const predicate = calculatePredicate(this);
        const usedGraph = graph || this.defaultGraph;
        const setRelationObject = function( object ) {
          this.store.graph.removeMatches(this.uri, predicate, undefined, usedGraph);
          this.store.graph.addStatement( new rdflib.Statement( this.uri, predicate, object, usedGraph ) );
        }.bind(this);

        let object;
        switch (options.type) {
        case "string":
          setRelationObject( new rdflib.Literal( value ) );
          break;
        case "integer":
          setRelationObject( new rdflib.Literal( value, null, XSD("decimal") ) );
          break;
        case "dateTime":
          setRelationObject( new rdflib.Literal( value.toUTCString(), null, XSD("dateTime") ) );
          break;
        case "belongsTo":
          setRelationObject( value.uri );
          // invalidate inverse relation
          if( options.inverseProperty ) updatePropertyValue( value, options.inverseProperty );
          break;
        case "hasMany":
          const newObjects = new Set(value);
          const oldObjects = new Set(this[cacheKey] || []);

          if( !oldObjects ) // remove all values if we haven't cached them
            this.store.graph.removeMatches( this.uri, predicate, undefined, usedGraph );

          const objectsToAdd = new Set( newObjects );
          oldObjects.forEach( (o) => objectsToAdd.delete( o ) );
          const objectsToRemove = new Set( oldObjects );
          newObjects.forEach( (o) => objectsToRemove.delete( o ) );
          
          objectsToRemove.forEach( (obj) => {
            this.store.graph.removeMatches( this.uri, predicate, obj.uri, usedGraph );
          } );
          objectsToAdd.forEach( (obj) => {
            this.store.graph.addStatement( new rdflib.Statement( this.uri, predicate, obj.uri, usedGraph ) );
          } );

          // invalidate inverse relations
          [...objectsToAdd, ...objectsToRemove].forEach( (obj) => {
            if( options.inverseProperty ) updatePropertyValue( obj, options.inverseProperty );
          } );
        case "term":
          setRelationObject( object );
          break;
        }

        set( this, cacheKey, value ); // update dependent key

        // update the change listeners, if any
        for( let listener of this.changeListeners )
          listener( this, { updatedField: propertyName, newValue: value } );

        return value;
      }
    };
  };
}

function string( options = {} ) {
  options.type = "string";
  return property( options );
}

function integer( options = {} ) {
  options.type = "integer";
  return property( options );
}

function dateTime( options = {} ) {
  options.type = "dateTime";
  return property( options );
}

function term( options = {} ) {
  options.type = "term";
  return property( options );
}

function hasMany( options = {} ) {
  options.type = "hasMany";
  console.assert( options.model, "hasMany requires 'model' to be supplied" );
  return property( options );
}

function belongsTo( options = {} ) {
  options.type = "belongsTo";
  return property( options );
}

class SemanticModel {
  @tracked uri;
  defaultNamespace = null;

  changeListeners = new Set();

  create(){
    console.log(...arguments);
  }

  @service store;

  constructor( uri, options = {} ){
    if( options.defaultGraph || this.constructor.defaultGraph )
      this.defaultGraph = options.defaultGraph || this.constructor.defaultGraph;
    if( options.defaultNamespace )
      this.defaultNamespace = options.defaultNamespace;

    this.uri = uri;

    if( this.rdfType || this.constructor.rdfType )
      this.rdfType = this.rdfType || this.constructor.rdfType;

    ensureResourceExists( this, options );
  }

  addChangeListener( listener ) {
    this.changeListeners.add( listener );
  }
  removeChangeListener( listener ) {
    this.changeListeners.delete( listener );
  }
}

function ensureResourceExists( entity, options ) {
  const rdfType = entity.rdfType;

  if( entity.uri && rdfType ) {
    const matches =
          options
          .store
          .graph
          .match(entity.uri, undefined, rdfType, entity.defaultGraph)
          .filter( ({predicate}) => predicate.value == RDF("type").value )
          .length;

    if( matches == 0 )
      options
      .store
      .graph
      .addStatement(
        new rdflib.Statement( entity.uri, RDF("type"), rdfType, entity.defaultGraph )
      );
  }
}

function rdfType(typeUri) {
  return function(klass) {
    klass.rdfType = typeUri;
  };
}

function defaultGraph(graphUri) {
  return function(klass) {
    klass.defaultGraph = graphUri;
  };
}

export default SemanticModel;
export { property, string, integer, dateTime, hasMany, belongsTo, term };
export { rdfType, defaultGraph };

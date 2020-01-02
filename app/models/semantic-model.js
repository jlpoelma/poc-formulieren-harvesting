import { inject as service } from '@ember/service';
import { setOwner, getOwner } from '@ember/application';
import { tracked } from '@glimmer/tracking';
import { get, set } from '@ember/object';
import { XSD } from '../utils/namespaces';
import rdflib from '../utils/rdflib';

function property(options = {}) {
  const predicateUri = options.predicate;
  const graph = options.graph;

  return function(self, propertyName, descriptor) {
    const calculatePredicate = function(entity){
      return predicateUri || ( options.ns && options.ns( propertyName ) ) || entity.defaultNamespace( propertyName );
    };

    const cacheKey = `cache__${propertyName}`;

    // The current implementation does a get/set of the property
    // "cacheKey" which will make this autotrack the cached property.
    // As such we don't need to manually call notifyPropertyChange.
    // This does mean that we're trying to be smart about reading the
    // property so that we don't accidentally overlap.

    return {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      get() {
        const predicate = calculatePredicate(this);
        const response = options.inverse ? this.store.graph.any(undefined, predicate, this.uri, graph || this.defaultGraph) : this.store.graph.any(this.uri, predicate, undefined, graph || this.defaultGraph);
        let value;
        if( this[cacheKey] !== undefined ) {
          return get( this, cacheKey ); // register as a dependency
        } else {
          switch (options.type) {
          case "string":
            value = response && response.value;
            break;
          case "integer":
            value = response && parseInt( response.value );
            break;
          case "hasMany":
            var matches;
            if( options.inverse ) {
              matches =
                this
                .store.graph
                .match( undefined, predicate, this.uri, graph || this.defaultGraph )
                .map( ({subject}) => subject );
            } else {
              matches =
                this
                .store.graph
                .match( this.uri, predicate, undefined, graph || this.defaultGraph )
                .map( ({object}) => object );
            }

            value =
              matches
              .map( (uri) =>
                    this.store.create( options.model, uri ) );
                    // new options.model( uri, { store: this.store } ) );
            break;
          case undefined:
            value = response && response.value;
            break;
          }
          set( this, cacheKey, value );
          return get( this, cacheKey ); // register as a dependency after setting
        }
      },
      set(value) {
        const predicate = calculatePredicate(this);
        this.store.graph.removeMatches(this.uri, predicate, undefined, graph || this.defaultGraph);

        let object;
        switch (options.type) {
        case "string":
          object = new rdflib.Literal( value );
          break;
        case "integer":
          object = new rdflib.Literal( value, null, XSD("decimal") );
          break;
        }
        object = object ? object : new rdflib.Literal( value );

        this.store.graph.addStatement( new rdflib.Statement( this.uri, predicate, object, graph || this.defaultGraph ) );
        set( this, cacheKey, value ); // update dependent key
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

function hasMany( options = {} ) {
  options.type = "hasMany";
  console.assert( options.model, "hasMany requires 'model' to be supplied" );
  return property( options );
}

class SemanticModel {
  @tracked uri;
  defaultGraph = null;
  defaultNamespace = null;

  create(){
    console.log(...arguments);
  }

  @service store;

  constructor( uri, options = {} ){
    if( options.defaultGraph )
      this.defaultGraph = options.defaultGraph;
    if( options.defaultNamespace )
      this.defaultNamespace = options.defaultNamespace;

    this.uri = uri;
  }

}

export default SemanticModel;
export { property, string, integer, hasMany };

import { tracked } from '@glimmer/tracking';
import { get, set, notifyPropertyChange } from '@ember/object';
import { XSD } from '../utils/namespaces';
import rdflib from '../utils/rdflib';

function property(options = {}) {
  const resourceUri = options.uri;
  const graph = options.graph;

  return function(self, propertyName, descriptor) {
    const calculatePredicate = function(entity){
      return resourceUri || ( options.ns && options.ns( propertyName ) ) || entity.defaultNamespace( propertyName );
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
        const response = this.store.any(this.uri, predicate, undefined, graph || this.defaultGraph);
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
        this.store.removeMatches(this.uri, predicate, undefined, graph || this.defaultGraph);

        let object;
        switch (options.type) {
        case "string":
          object = new rdflib.Literal( value );
        case "integer":
          object = new rdflib.Literal( value, null, XSD("decimal") );
        }
        object = object ? object : new rdflib.Literal( value );

        this.store.addStatement( new rdflib.Statement( this.uri, predicate, object, graph || this.defaultGraph ) );
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

class SemanticModel {
  @tracked uri;
  store = null;
  defaultGraph = null;
  defaultNamespace = null;

  constructor( uri, options ){
    this.store = options.store;
    this.defaultGraph = options.defaultGraph;
    this.defaultNamespace = options.defaultNamespace;
    this.uri = uri;
  }

}

export default SemanticModel;
export { property, string, integer };

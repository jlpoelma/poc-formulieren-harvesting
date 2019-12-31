import { tracked } from '@glimmer/tracking';
import rdflib from '../utils/rdflib';

function property(options = {}) {
  const resourceUri = options.uri;
  const graph = options.graph;

  return function(self, propertyName, descriptor) {
    const calculatePredicate = function(entity){
      return resourceUri || ( options.ns && options.ns( propertyName ) ) || entity.defaultNamespace( propertyName );
    };

    // const { get: trackedGet, set: trackedSet } = tracked( self, propertyName, descriptor );

    return {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      get() {
        console.log(self);
        console.log(propertyName);
        // console.log(self[propertyName]);
        let trackedValue = descriptor.get ? descriptor.get.call(this) : null;
        if( trackedValue ) {
          return trackedValue;
        } else {
          const predicate = calculatePredicate(this);
          const response = this.store.any(this.uri, predicate, undefined, graph || this.defaultGraph);
          let value;
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
          // descriptor.set(value);
          return value;
        }
      },
      set(value) {
        const predicate = calculatePredicate(this);
        this.store.removeMatches(this.uri, predicate, undefined, graph || this.defaultGraph);
        this.store.addStatement( new rdflib.Statement( this.uri, predicate, new rdflib.Literal( value ), graph || this.defaultGraph ) );
        // trackedSet.call(this, value );
        if( descriptor.set )
          descriptor.set.call(this, value);
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

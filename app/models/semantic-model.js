import { tracked } from '@glimmer/tracking';
import { notifyPropertyChange } from '@ember/object';
import { XSD } from '../utils/namespaces';
import rdflib from '../utils/rdflib';

function property(options = {}) {
  const resourceUri = options.uri;
  const graph = options.graph;

  return function(self, propertyName, descriptor) {
    const calculatePredicate = function(entity){
      return resourceUri || ( options.ns && options.ns( propertyName ) ) || entity.defaultNamespace( propertyName );
    };

    return {
      enumerable: descriptor.enumerable,
      configurable: descriptor.configurable,
      get() {
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
        return value;
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

        notifyPropertyChange(this, propertyName);
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

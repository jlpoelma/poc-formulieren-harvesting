import Service from '@ember/service';
import rdflib from '../utils/rdflib';
import { getOwner, setOwner } from '@ember/application';

export default class StoreService extends Service {
  graph = null;

  storeCache = {}

  changeListeners = new Set();

  constructor() {
    super(...arguments);
    this.graph = rdflib.graph();
  }

  create( model, uri, options ) {
    // check the cache
    const peekedInstance = this.peekInstance( model, uri );
    if( peekedInstance ) return peekedInstance;

    // create a new instance
    const owner = getOwner(this);
    const klass = owner.lookup( `model:${model}` );
    const createOptions = Object.assign({}, options);
    createOptions.store = this;
    const instance = new klass( uri, createOptions );
    setOwner( instance, owner );
    this.storeCacheForModel( model ).push( instance );

    // notify listeners
    for( let listener of this.changeListeners )
      window.setTimeout( () => listener( model, instance ), 0 );

    return instance;
  }

  storeCacheForModel( model ) {
    return this.storeCache[model] || (this.storeCache[model] = []);
  }

  peekInstance( model, uri ) {
    if( !uri )
      uri = model;

    const uriValue = uri.value ? uri.value : uri;
     
    if( model ) {
      return this
        .storeCacheForModel(model)
        .find( (obj) => obj.uri.value === uriValue );
    } else {
      for( let key in this.storeCache ) {
        let matchingInstance =
            this.storeCache[key].find( (obj) => obj.uri.value === uriValue );
        if( matchingInstance ) return matchingInstance;
      }
      return undefined;
    }
  }

  addChangeListener(listener) {
    this.changeListeners.add( listener );
  }

  removeChangeListener(listener) {
    this.changeListeners.remove( listener );
  }
}

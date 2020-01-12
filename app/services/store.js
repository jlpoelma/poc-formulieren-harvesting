import Service from '@ember/service';
import rdflib from 'ember-rdflib';
import { getOwner, setOwner } from '@ember/application';
import { RDF } from '../utils/namespaces';

const { Fetcher, UpdateManager } = rdflib;

function classForModel( owner, model ) {
  return owner.lookup( `model:${model}` );
}

export default class StoreService extends Service {
  graph = null;
  fetcher = null;
  updater = null;

  storeCache = {}

  changeListeners = new Set();

  constructor() {
    super(...arguments);
    this.graph = rdflib.graph();
    this.fetcher = new Fetcher( this.graph );
    this.updater = new UpdateManager( this.graph );
  }

  create( model, uri, options ) {
    // check the cache
    const peekedInstance = this.peekInstance( model, uri );
    if( peekedInstance ) return peekedInstance;

    // create a new instance
    const owner = getOwner(this);
    const klass = classForModel( owner, model );
    const createOptions = Object.assign({}, options);
    createOptions.store = this;
    createOptions.modelName = model;
    const instance = new klass( uri, createOptions );
    setOwner( instance, owner );
    this.storeCacheForModel( model ).push( instance );

    // notify listeners
    for (let listener of this.changeListeners)
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

  all( model, options ) {
    // TODO: options should have the option to yield a live array.
    // Use a weak map to find which maps to update.
    const klass = classForModel( getOwner( this ), model );
    if( !klass.rdfType )
      console.error( `Tried to fetch all instances of ${model} but it has no @rdfType annotation.` );

    return this
      .graph
      .match( undefined, RDF("type"), klass.rdfType, this.getGraphForType( model ) || model.defaultGraph )
      .map( ({subject}) => this.create( model, subject ) );
  }

  graphForType = {}
  setGraphForType(type, graph) {
    this.graphForType[type] = graph;
  }
  getGraphForType(type) {
    return this.graphForType[type];
  }

  autosaveForType = {};
  setAutosaveForType(type, autosave) {
    this.autosaveForType[type] = autosave;
  }
  getAutosaveForType(type) {
    const autosave = this.autosaveForType[type];

    if( autosave !== undefined ) {
      return autosave;
    } else {
      return classForModel( getOwner( this ), type ).autosave;
    }
  }

  addChangeListener(listener) {
    this.changeListeners.add( listener );
  }

  removeChangeListener(listener) {
    this.changeListeners.remove( listener );
  }
}

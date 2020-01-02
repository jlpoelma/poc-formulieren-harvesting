import Service from '@ember/service';
import rdflib from '../utils/rdflib';
import { getOwner, setOwner } from '@ember/application';

export default class StoreService extends Service {
  graph = null;

  constructor() {
    super(...arguments);
    this.graph = rdflib.graph();
  }

  create( model, uri, options ) {
    const owner = getOwner(this);
    const klass = owner.lookup( `model:${model}` );
    const instance = new klass( uri, options );
    setOwner( instance, owner );
    return instance;
  }
}

import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import rdflib from '../../utils/rdflib';

const { Fetcher, namedNode } = rdflib;

export default class SolidCardInfoComponent extends Component {
  @service("solid/auth") auth;
  @service store;

  @tracked
  me = null;

  @action
  async fetchVcard(){
    const graph = this.store.graph;
    const me = graph.sym( this.auth.webId );
    
    const fetcher = new Fetcher( this.store.graph );
    console.log( await fetcher.load( me ) );

    this.me = this.store.create('solid/person', me, { defaultGraph: me.doc() } );
  }
}

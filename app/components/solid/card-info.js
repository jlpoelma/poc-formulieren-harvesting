import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import rdflib from 'ember-rdflib';
import env from '../../config/environment';

const { Fetcher, namedNode } = rdflib;

export default class SolidCardInfoComponent extends Component {
  @service("solid/auth") auth;
  @service(env.RSTORE.name) store;

  @tracked
  me = null;

  @action
  async fetchVcard(){
    const graph = this.store.store.graph;
    const me = graph.sym( this.auth.webId );

    const fetcher = new Fetcher( graph );
    console.log( await fetcher.load( me ) );
    console.log(graph);
    console.log(me.doc());

    this.me = this.store.create('solid/person', me, { defaultGraph: me.doc() } );
    console.log(this.me);
  }
}

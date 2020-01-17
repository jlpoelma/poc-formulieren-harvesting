import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Service from '@ember/service';
import auth from 'solid-auth-client';
import rdflib from 'ember-rdflib';
import { SOLID } from '../../utils/namespaces';

const { Fetcher } = rdflib;

export default class SolidAuthService extends Service {
  @tracked
  session = null;

  @service
  store;

  @tracked
  publicTypeIndex = null;

  @tracked
  privateTypeIndex = null;

  async ensureLogin(){
    let session = await auth.currentSession();
    if( session ) {
      this.session = session;
    } else {
      const identityProvider = "https://solid.community";
      auth.login(identityProvider);
    }
  }

  async ensureTypeIndex(){
    const graph = this.store.graph;
    const me = graph.sym( this.webId );

    const fetcher = new Fetcher( graph );
    await fetcher.load( me.doc() );
    // this.me = this.store.create('solid/person', me, { defaultGraph: me.doc() });

    const privateTypeIndex = graph.any( me, SOLID("privateTypeIndex"), undefined, me.doc() );
    const publicTypeIndex = graph.any( me, SOLID("publicTypeIndex"), undefined, me.doc() );

    this.store.privateTypeIndex = privateTypeIndex;
    this.store.publicTypeIndex = publicTypeIndex;
    this.store.me = me;

    await fetcher.load( privateTypeIndex );
    await fetcher.load( publicTypeIndex );
  }

  get webId(){
    return this.session ? this.session.webId : undefined;
  }
}

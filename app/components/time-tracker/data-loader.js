import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import rdflib from 'ember-rdflib';
import { TRACKER, SOLID, RDF } from '../../utils/namespaces';
import env from '../../config/environment';

const { Fetcher, namedNode } = rdflib;

export default class TimeTrackerDataLoaderComponent extends Component {
  @service( env.RSTORE.name ) store;
  @service("solid/auth") auth;

  @tracked
  projectLocation = undefined;

  @tracked
  projectsArray = [];

  @action
  async loadData(){
    const fetcher = new Fetcher( this.store.graph );
    const me = this.store.graph.sym( this.auth.webId );
    await fetcher.load( me.doc() );
    await this.auth.ensureTypeIndex();
    const graph = this.store.graph;
    this.me = this.store.create('solid/person', me, { defaultGraph: me.doc() });
    await this.store.fetchGraphForType( "time-tracker/project" );
    await this.store.fetchGraphForType( "time-tracker/time-line" );
  }

  @action
  fetchProjectsArray() {
    this.projectsArray = this.store.all( "time-tracker/project" );

    if( this.args.onLoadProjects )
      this.args.onLoadProjects( this.projectsArray );
  }
}

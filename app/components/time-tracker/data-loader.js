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
    const graph = this.store.graph;
    const me = graph.sym( this.auth.webId );

    const fetcher = new Fetcher( this.store.graph );
    await fetcher.load( me.doc() );
    console.log("Fetched me");

    this.me = this.store.create('solid/person', me, { defaultGraph: me.doc() });

    const privateTypeIndex = graph.any( me, SOLID("privateTypeIndex"), undefined, me.doc() );

    if( !privateTypeIndex ) {
      console.error("No private type index found");
      return;
    }

    // fetch the type index
    await fetcher.load( privateTypeIndex );
    console.log("Fetched private type index");
    console.log(privateTypeIndex);
    
    const projectLocation =
          graph.match( undefined, RDF("type"), SOLID("TypeRegistration"), privateTypeIndex )
          .map( ({subject: typeIndexSpec}) => {
            const hasProjectType =
                  graph
                  .match( typeIndexSpec, SOLID("forClass"), undefined, privateTypeIndex )
                  .filter( ({object}) => object.value == TRACKER("Project").value )
                  .length;
            const location = graph.any( typeIndexSpec, SOLID("instance"), undefined, privateTypeIndex );

            if( hasProjectType ) return location;
            else return false;
          })
          .find( (x) => x );

    if( !projectLocation ) {
      console.error("No project location found");
    }

    console.log("Project location found:");
    console.log( projectLocation );

    await fetcher.load( projectLocation );

    this.store.setGraphForType( "time-tracker/project", projectLocation );
    this.store.setGraphForType( "time-tracker/time-line", projectLocation );

    this.projectLocation = projectLocation;
  }

  @action
  fetchProjectsArray() {
    this.projectsArray = this.store.all( "time-tracker/project" );

    if( this.args.onLoadProjects )
      this.args.onLoadProjects( this.projectsArray );
  }
}

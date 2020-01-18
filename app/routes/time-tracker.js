import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import rdflib from 'ember-rdflib';
import env from '../config/environment';

const { sym } = rdflib;

export default class TimeTrackerRoute extends Route {
  @service( env.RSTORE.name ) store;
  @service("solid/auth") auth;

  async model(){
    await this.ensureLoggedIn();
    await this.loadData();
    return this.store.all( "time-tracker/project" );
  }

  async ensureLoggedIn(){
    await this.auth.ensureLogin();
    await this.auth.ensureTypeIndex();
  }

  async loadData(){
    const me = sym( this.auth.webId );
    await this.store.load( me.doc() );
    await this.auth.ensureTypeIndex();
    this.store.create('solid/person', me, { defaultGraph: me.doc() }); // TODO: do we need this
    await this.store.fetchGraphForType( "time-tracker/project" );
    await this.store.fetchGraphForType( "time-tracker/time-line" );
  }

  @action
  refreshModel(){
    this.refresh();
  }
}

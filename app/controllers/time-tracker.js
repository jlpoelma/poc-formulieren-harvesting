import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';
import env from '../config/environment';

export default class TimeTrackerController extends Controller {
  @service( env.RSTORE.name ) store;

  get sortedProjects(){
    return this
      .model
      .slice(0)
      .sort( (a,b) => a.order > b.order );
  }

  @action
  save(){
    this.store.persist();
  }

  @action
  refresh(){
    this.send("refreshModel");
  }
}

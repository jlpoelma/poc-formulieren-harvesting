import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

export default class TimeTrackerController extends Controller {
  get sortedProjects(){
    return this
      .model
      .slice(0)
      .sort( (a,b) => a.order > b.order );
  }

  @action
  refresh(){
    this.send("refreshModel");
  }
}

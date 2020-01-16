import { tracked } from '@glimmer/tracking';
import Controller from '@ember/controller';

export default class TimeTrackerController extends Controller {
  @tracked
  projects = [];

  get sortedProjects(){
    return this
      .projects
      .slice(0)
      .sort( (a,b) => a.order > b.order );
  }
}

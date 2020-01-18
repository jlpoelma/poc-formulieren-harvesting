import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import shortid from 'shortid';
import env from '../../../config/environment';
import rdflib from 'ember-rdflib';

const { namedNode } = rdflib;

export default class TimeTrackerEntryProjectComponent extends Component {

  @service( env.RSTORE.name ) store;

  @tracked
  name = "";
  @tracked
  order = 0;

  @action
  createProject(event){
    event.preventDefault();
    const project = this.store.create("time-tracker/project", namedNode(`http://mu.semte.ch/time-tracker/projects/${shortid.generate()}`));
    project.name = this.name;
    project.order = parseInt(this.order);
    this.name = "";
    this.order = undefined;

    if( this.args.onCreate ) this.args.onCreate( project );
  }
  
}

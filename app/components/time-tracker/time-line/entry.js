import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Component from '@glimmer/component';
import shortid from 'shortid';
import rdflib from 'ember-rdflib';

const { namedNode } = rdflib;


export default class TimeTrackerTimeLineEntryComponent extends Component {
  @service
  store;

  @action
  createTimeline(event){
    event.preventDefault();
    const timeline = this.store.create( "time-tracker/time-line", namedNode(`http://mu.semte.ch/time-tracker/time-lines/${shortid.generate()}`) );
    timeline.startedAt = new Date();
    timeline.project = this.args.project;
  }
}

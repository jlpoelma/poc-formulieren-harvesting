import { tracked } from '@glimmer/tracking';
import SemanticModel, { string, integer, hasMany, autosave } from '../semantic-model';
import {rdfType, solid} from '../semantic-model';

// import { FORM_GRAPH } from '../../utils/graphs';
// import { SHACL } from '../../utils/namespaces';
import { TRACKER, DCT } from '../../utils/namespaces';

class TimeLineTiming {
  @tracked
  date

  @tracked
  timeLines

  constructor( date, timeLines ){
    this.timeLines = timeLines;
    this.date = date;
  }

  get totalTime(){
    return this.timeLines.reduce(
      ( (sum, timeLine) => sum + timeLine.timeSpent ),
      0 );
  }

  get sortedTimeLines(){
    return this
      .timeLines
      .sort( (a,b) => a.startedAt < b.startedAt );
  }

  get openTimeLines(){
    return this
      .timeLines
      .filter( (timeLine) => !timeLine.endedAt );
  }
}

// @autosave()
@solid({
  defaultStorageLocation: "/private/tests/tracker.ttl",
  private: true
})
@rdfType( TRACKER("Project") )
export default class TimeTrackerProject extends SemanticModel {
  defaultNamespace = TRACKER

  @string( { property: DCT("title") } )
  name = null;

  @integer()
  order = 0;

  @hasMany({ model: "time-tracker/time-line", predicate: TRACKER("hasProject"), inverse: true, inverseProperty: "project" })
  timeLines = [];

  get timeLinesByDay(){
    let intermediateIndex = {};

    for( const timeLine of this.timeLines ){
      const key = timeLine.startedAt.toDateString();
      intermediateIndex[key] = intermediateIndex[key] || [];
      intermediateIndex[key].pushObject( timeLine );
    }

    return Object.keys( intermediateIndex )
      .sort( (a,b) => new Date(a) > new Date(b) )
      .map( (key) => new TimeLineTiming( new Date(key), intermediateIndex[key] ) );
  }
}

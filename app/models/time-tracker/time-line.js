import SemanticModel, { string, integer, dateTime, hasMany, belongsTo, autosave } from '../semantic-model';
import {rdfType} from '../semantic-model';

// import { FORM_GRAPH } from '../../utils/graphs';
// import { SHACL } from '../../utils/namespaces';
import { TRACKER, DCT } from '../../utils/namespaces';

@autosave()
@rdfType( TRACKER("TimeLine") )
export default class TimeTrackerTimeLine extends SemanticModel {
  defaultNamespace = TRACKER

  @dateTime()
  startedAt;

  @dateTime()
  endedAt;

  @belongsTo( {model: "time-tracker/project", predicate: TRACKER("hasProject"), inverseProperty: "timeLines" } )
  project;

  get timeSpent(){
    const maybeEnd = this.endedAt || new Date();
    return maybeEnd - this.startedAt;
  }

}

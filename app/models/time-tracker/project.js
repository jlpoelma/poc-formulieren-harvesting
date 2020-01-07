import SemanticModel, { string, integer, hasMany } from '../semantic-model';

// import { FORM_GRAPH } from '../../utils/graphs';
// import { SHACL } from '../../utils/namespaces';
import { TRACKER, DCT } from '../../utils/namespaces';

export default class TimeTrackerProject extends SemanticModel {
  defaultNamespace = TRACKER

  @string( { property: DCT("title") } )
  name = null;

  @integer()
  order = 0;

  @hasMany({ model: "time-tracker/time-line", property: TRACKER("hasProject"), inverse: true, inverseProperty: "project" })
  timeLines = [];
}

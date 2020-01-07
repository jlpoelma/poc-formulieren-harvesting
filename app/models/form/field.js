import { SHACL, FORM } from '../../utils/namespaces';
import SemanticModel, { property, string, integer, term, belongsTo } from '../semantic-model';
import {rdfType, defaultGraph} from '../semantic-model';

import { FORM_GRAPH } from '../../utils/graphs';

@defaultGraph(FORM_GRAPH)
@rdfType(FORM("field"))
export default class FormFieldModel extends SemanticModel {
  defaultNamespace = SHACL;

  @string( { predicate: SHACL("name") })
  label = "";

  @string()
  description = "";

  @integer()
  order = "";

  @string( { ns: FORM } )
  displayType = "";

  @term()
  path = "";

  @string( { ns: FORM } )
  options = "";
  
  @belongsTo({ model: "form/property-group", inverseProperty: "fields" })
  group = null;

  constructor( uri, options ) {
    super(uri, options);
  }
}

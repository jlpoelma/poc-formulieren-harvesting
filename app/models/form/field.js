import { SHACL, FORM } from '../../utils/namespaces';
import SemanticModel, { property, string, integer, term } from '../semantic-model';

import { FORM_GRAPH } from '../../utils/graphs';

export default class FormFieldModel extends SemanticModel {
  defaultGraph = FORM_GRAPH;
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
  
  constructor( uri, options ) {
    super(uri, options);
  }
}

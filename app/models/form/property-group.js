import SemanticModel, { string, integer, hasMany } from '../semantic-model';
import { FORM_GRAPH } from '../../utils/graphs';
import { SHACL, FORM } from '../../utils/namespaces';
import {rdfType, defaultGraph} from '../semantic-model';

@rdfType( FORM("PropertyGroup") )
@defaultGraph( FORM_GRAPH )
export default class FormPropertyGroupModel extends SemanticModel {
  defaultNamespace = SHACL

  @string()
  name = "";

  @integer()
  order = 0;

  @string()
  description = "";

  @hasMany({ model: "form/field", predicate: SHACL("group"), inverse: true, inverseProperty: "group" })
  fields = [];
  
  constructor( uri, options ) {
    super( uri, options );
  }

  get sortedFields(){
    return this
      .fields
      .sort( (a,b) => a.order > b.order );
  }
}

import SemanticModel, { string, integer, hasMany } from '../semantic-model';
import Field from './field';
import { FORM_GRAPH } from '../../utils/graphs';
import { SHACL } from '../../utils/namespaces';

export default class FormPropertyGroupModel extends SemanticModel {
  defaultGraph = FORM_GRAPH
  defaultNamespace = SHACL

  @string()
  name = "";

  @integer()
  order = 0;

  @string()
  description = "";

  @hasMany({ model: Field, predicate: SHACL("group"), inverse: true })
  fields = [];
  
  constructor( uri, { store } ) {
    super( uri, { store } );
  }

  get sortedFields(){
    return this
      .fields
      .sort( (a,b) => a.order > b.order );
  }
}

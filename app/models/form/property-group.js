import { SHACL } from '../../utils/namespaces';
import { tracked } from '@glimmer/tracking';
import { get } from '@ember/object';
import SemanticModel, { string, integer } from '../semantic-model';

export default class FormPropertyGroupModel extends SemanticModel {
  @string()
  name = "";

  @integer()
  order = 0;

  @string()
  description = "";

  @tracked
  fields = [];
  
  constructor( uri, options ) {
    const { store, formGraph } = options;
    super( uri, { store, defaultGraph: formGraph, defaultNamespace: SHACL } );
  }

  get sortedFields(){
    return this
      .fields
      .sort( (a,b) => a.order > b.order );
  }
  
}

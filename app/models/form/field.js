import { tracked } from '@glimmer/tracking';
import { SHACL, FORM } from '../../utils/namespaces';
import SemanticModel, { property, string, integer } from '../semantic-model';

export default class FormFieldModel extends SemanticModel {
  @string( { uri: SHACL("name") })
  label = "";

  @string()
  description = "";

  @integer()
  order = "";

  @string( { ns: FORM } )
  displayType = "";

  @string()
  path = "";

  @string( { ns: FORM } )
  options = "";
  
  constructor( uri, options ) {
    const { store, formGraph } = options;

    super(uri, { store, defaultGraph: formGraph, defaultNamespace: SHACL });
  }
}

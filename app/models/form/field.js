import { SHACL, FORM } from '../../utils/namespaces';
import { tracked } from '@glimmer/tracking';

export default class FormFieldModel {
  @tracked
  label = "";
  @tracked
  description = "";
  @tracked
  order = "";
  @tracked
  displayType = "";
  @tracked
  path = "";
  @tracked
  options = "";
  
  constructor( uri, options ) {
    const { store, formGraph } = options;
    const label = store.any( uri, SHACL("label"), undefined, formGraph );
    if( label ) {
      this.label = label.value;
    }
    const description = store.any( uri, SHACL("description"), undefined, formGraph );
    if( description ) {
      this.description = description.value;
    }
    const order = store.any( uri, SHACL("order"), undefined, formGraph );
    if( order ) {
      this.order = parseInt(order.value);
    }
    const displayType = store.any( uri, FORM("displayType"), undefined, formGraph );
    if( displayType ) {
      this.displayType = displayType.value;
    }
    const path = store.any( uri, SHACL("path"), undefined, formGraph );
    if( path ) {
      this.path = path.value;
    }
    const extraOptions = store.any( uri, FORM("options"), undefined, formGraph );
    if( extraOptions ) {
      this.options = extraOptions.value;
    }
  }
}

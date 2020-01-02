import { SHACL } from './namespaces';
import Field from '../models/form/field';
import PropertyGroup from '../models/form/property-group';

function createPropertyTreeFromFields( fields, store, formGraph ) {
  let mappedFields =
      fields
      .map( (field) => store.graph.any( field, SHACL("group"), undefined, formGraph ) );

  const groups =
      mappedFields
      .reduce( (acc, item) => {
        const pg = store.create( 'form/property-group', item );
        acc[item.value] = pg;
        return acc;
      }, {} );

  const sortedGroups =
        Object.values(groups).sort( (a,b) => a.order > b.order );

  return Object.values(groups);
}

export {createPropertyTreeFromFields };

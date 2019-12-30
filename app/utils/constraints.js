import { RDF, FORM, SHACL } from './namespaces';
import { triplesForPath } from '../utils/import-triples-for-form';

import required from './constraints/required';
import codelist from './constraints/codelist';
import singleCodelistValue from './constraints/single-codelist-value';

export default function constraintForUri(uri) {
  switch (String(uri)) {
  case "http://lblod.data.gift/vocabularies/forms/RequiredConstraint":
    return required;
  case "http://lblod.data.gift/vocabularies/forms/SingleCodelistValue":
    return singleCodelistValue;
  case "http://lblod.data.gift/vocabularies/forms/Codelist":
    return codelist;
  }
}

function check(constraintUri, options){
  const { formGraph, sourceNode, sourceGraph, metaGraph, store } = options;

  //detect type
  const validationType = store.any(constraintUri, RDF('type'), undefined, formGraph);
  const groupingType = store.any(constraintUri, FORM("grouping"), undefined, formGraph).value;

  let validator = constraintForUri(validationType && validationType.value);
  if( !validator ) return { hasValidation: false, valid: true };

  let path = store.any( constraintUri, SHACL("path"), undefined, formGraph);

  let values = triplesForPath({
    store: store, path, formGraph: formGraph, sourceNode: sourceNode, sourceGraph: sourceGraph
  }).values;

  const validationOptions = { store, metaGraph, constraintUri };

  let validationResult;

  if( groupingType == FORM("Bag").value ) {
    validationResult = validator( values, validationOptions );
  } else if( groupingType == FORM("MatchSome").value ) {
    validationResult = values.some( (value) => validator( value, validationOptions ) );
  } else if( groupingType == FORM("MatchEvery" .value) ) {
    validationResult = values.every( (value) => validator( value, validationOptions ) );
  }

  return { hasValidation: true, valid: validationResult };
}

export { check };

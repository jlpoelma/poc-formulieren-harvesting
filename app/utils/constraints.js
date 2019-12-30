import required from './constraints/required';
import codelist from './constraints/codelist';
import singleCodelistValue from './constraints/single-codelist-value';

export default function constraints(uri) {
  switch (String(uri)) {
  case "http://lblod.data.gift/vocabularies/forms/RequiredConstraint":
    return required;
  case "http://lblod.data.gift/vocabularies/forms/SingleCodelistValue":
    return singleCodelistValue;
  case "http://lblod.data.gift/vocabularies/forms/Codelist":
    return codelist;
  }
}

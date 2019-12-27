import { helper } from '@ember/component/helper';

export default helper(function componentForDisplayTypeEdit(displayTypeUri) {
  const mapping = {
    'http://lblod.data.gift/display-types/defaultInput' : 'input-fields/input/edit',
    'http://lblod.data.gift/display-types/bestuursorgaanSelect' : 'input-fields/dynamic-select/edit',
    'http://lblod.data.gift/display-types/dateTime' : 'input-fields/date/edit', //TODO: make datetime component
    'http://lblod.data.gift/display-types/date' : 'input-fields/date/edit'
  };

  //TODO: files and links component
  return mapping[displayTypeUri] || '';
});

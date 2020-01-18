import forkingStore from 'rdflib-now/utils/forking-store';
import { module, test } from 'qunit';

module('Unit | Utility | forking-store', function() {

  // Replace this with your real tests.
  test('it works', function(assert) {
    let result = forkingStore();
    assert.ok(result);
  });
});
